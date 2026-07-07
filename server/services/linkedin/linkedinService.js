const { chromium } = require('playwright');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const path = require('path');
const fs = require('fs');

let browser = null;
let context = null;
let page = null;

const SESSION_FILE = path.join(__dirname, '../../session.json');

// Random delay to mimic human behavior
function delay(min = 1000, max = 3000) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Save browser session to disk (cookies + storage)
async function saveSession() {
  try {
    if (!context) return;
    const cookies = await context.cookies();
    const storageState = await context.storageState();
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ cookies, storageState }, null, 2));
    logger.info('LinkedIn session saved to disk');
  } catch (err) {
    logger.warn('Failed to save session', { error: err.message });
  }
}

// Load saved session from disk
function loadSavedSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      return data.storageState || null;
    }
  } catch (err) {
    logger.warn('Failed to load saved session', { error: err.message });
  }
  return null;
}

// Check if a saved session exists and appears valid
function hasSavedSession() {
  return fs.existsSync(SESSION_FILE);
}

// Launch the browser, loading saved session if available
async function launchBrowser() {
  try {
    if (browser) {
      await closeBrowser();
    }

    browser = await chromium.launch({
      headless: process.env.HEADLESS === 'true' || config.nodeEnv === 'production', // Headless in prod, headed in dev
      slowMo: config.nodeEnv === 'production' ? 0 : 50,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const contextOptions = {
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    // Load saved session if it exists
    const savedState = loadSavedSession();
    if (savedState) {
      contextOptions.storageState = savedState;
      logger.info('Loading saved LinkedIn session from disk');
    }

    context = await browser.newContext(contextOptions);

    // Avoid webdriver detection
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    page = await context.newPage();
    logger.info('Browser launched');
    return page;
  } catch (error) {
    logger.error('Failed to launch browser', { error: error.message });
    throw error;
  }
}

// Check if we are actually logged into LinkedIn
async function isLoggedIn() {
  try {
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(2000, 3000);
    const url = page.url();
    // If we got redirected to login, we are not logged in
    if (url.includes('/login') || url.includes('/authwall') || url.includes('/checkpoint')) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

// Login to LinkedIn (only called if session check fails)
async function loginToLinkedIn(email, password) {
  try {
    logger.info('Logging into LinkedIn...');

    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(1000, 2000);

    const emailSelector = 'input[type="email"]:visible, input[autocomplete*="username"]:visible, input[name="session_key"]:visible, #username';
    const passwordSelector = 'input[type="password"]:visible, input[autocomplete*="password"]:visible, input[name="session_password"]:visible, #password';

    // Wait for the email field to appear
    await page.waitForSelector(emailSelector, { timeout: 15000 }).catch(async (err) => {
      const pageUrl = page.url();
      const pageTitle = await page.title();
      const screenshotPath = path.join(__dirname, '../../login-failed.png');
      try {
        await page.screenshot({ path: screenshotPath });
      } catch (screenshotErr) {
        logger.error('Failed to take screenshot', { error: screenshotErr.message });
      }
      logger.error('Login fields not found', { url: pageUrl, title: pageTitle, screenshot: screenshotPath });
      throw new Error(`Login fields not found on page. URL: ${pageUrl}, Title: ${pageTitle}`);
    });

    await delay(500, 1000);

    // Fill email
    await page.locator(emailSelector).first().fill(email);
    await delay(500, 1000);

    // Fill password then press Enter (avoids accidentally clicking "Sign in with Microsoft")
    const passwordField = page.locator(passwordSelector).first();
    await passwordField.fill(password);
    await delay(500, 1000);
    await passwordField.press('Enter');

    logger.info('Login form submitted, waiting for response...');

    // Wait up to 90 seconds — user may need to solve a CAPTCHA/security challenge manually
    await page.waitForURL(
      (url) => !url.href.includes('/login') && !url.href.includes('/authwall'),
      { timeout: 90000 }
    ).catch((err) => {
      logger.warn('Timeout or error waiting after login submit', { error: err.message });
    });

    const urlAfterLogin = page.url();

    // If still on a challenge page, wait up to 90 more seconds for user to solve it
    if (urlAfterLogin.includes('checkpoint') || urlAfterLogin.includes('challenge')) {
      logger.warn('LinkedIn security challenge detected — waiting for user to complete it (up to 90s)...');
      await page.waitForURL(
        (url) => !url.href.includes('checkpoint') && !url.href.includes('challenge'),
        { timeout: 90000 }
      ).catch((err) => {
        logger.warn('Timeout or error waiting for security challenge resolution', { error: err.message });
      });
    }

    const finalUrl = page.url();
    if (finalUrl.includes('/login') || finalUrl.includes('/authwall')) {
      throw new Error('Login failed — still on login page after submit. Check credentials.');
    }

    // Save session so we don't need to log in next time
    await saveSession();

    logger.info('LinkedIn login successful', { url: finalUrl });
    return true;
  } catch (error) {
    logger.error('LinkedIn login failed', { error: error.message });
    throw new Error('LinkedIn login failed: ' + error.message);
  }
}

// Search for posts on LinkedIn
async function searchPosts(keyword) {
  try {
    logger.info('Searching LinkedIn posts', { keyword });

    // Navigate to LinkedIn search
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&datePosted=%22past-24h%22&sortBy=%22date_posted%22`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    await delay(3000, 5000);

    // Wait for at least one post-like element to appear
    const postSelectors = [
      'div[role="listitem"]',
      '.feed-shared-update-v2',
      '[data-urn*="activity"]',
      '.occludable-update',
      '.search-results-container .entity-result',
      'div[data-view-name="search-entity-result-universal-template"]',
      'li[class*="search-result"]'
    ];

    logger.info('Waiting for search results to load...');
    try {
      await Promise.any(
        postSelectors.map(sel => page.waitForSelector(sel, { state: 'visible', timeout: 12000 }))
      );
      logger.info('Search results loaded (at least one selector is visible)');
    } catch (e) {
      logger.warn('Timeout waiting for post selectors to be visible, proceeding anyway');
    }

    // Scroll to load more results
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(1500, 2500);
    }

    logger.info('Search page loaded');
    return page;
  } catch (error) {
    logger.error('Search failed', { error: error.message });
    throw error;
  }
}

// Extract recruiter information from search results
async function extractRecruiters() {
  try {
    logger.info('Extracting recruiter data from posts...');

    const recruiters = await page.evaluate(() => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

      // Try multiple post container selectors (LinkedIn changes these frequently)
      const postSelectors = [
        'div[role="listitem"]',
        '.feed-shared-update-v2',
        '[data-urn*="activity"]',
        '.occludable-update',
        'div[data-view-name="search-entity-result-universal-template"]',
        'div[class*="update-components"]',
        'li[class*="search-result"]',
        '.search-results-container li',
        'div[class*="occludable"]',
      ];

      let posts = [];
      for (const sel of postSelectors) {
        const found = document.querySelectorAll(sel);
        if (found.length > 0) {
          posts = Array.from(found);
          break;
        }
      }

      const results = [];

      posts.forEach((post) => {
        try {
          // 1. Extract Name
          let name = '';
          // Try control menu first (most reliable for group posts and regular posts)
          const controlBtn = post.querySelector('[aria-label*="control menu for post"]');
          if (controlBtn) {
            const label = controlBtn.getAttribute('aria-label') || '';
            const match = label.match(/control menu for post by\s+(.+)$/i);
            if (match) {
              name = match[1].trim();
            }
          }
          
          // Try view profile label second
          if (!name) {
            const profileEl = post.querySelector('[aria-label^="View "][aria-label$="profile"], [aria-label^="View "][aria-label*="profile"]');
            if (profileEl) {
              const label = profileEl.getAttribute('aria-label') || '';
              name = label.replace(/^View /i, '').replace(/[’']s profile$/i, '').trim();
            }
          }
          
          // Fallback to text content of the first profile/group link
          if (!name) {
            const fallbackLink = post.querySelector('a[href*="/in/"]') || post.querySelector('a[href*="/groups/"]');
            if (fallbackLink) {
              const rawText = fallbackLink.textContent.trim();
              name = rawText.split('\n')[0].split('•')[0].split(',')[0].trim();
            }
          }

          if (!name) return; // Skip if we couldn't resolve name

          // 2. Extract Profile URL
          let profileUrl = '';
          const profileLinkEl = post.querySelector('a[href*="/in/"]');
          if (profileLinkEl) {
            profileUrl = profileLinkEl.href;
          } else {
            // Fallback to any group link or name link
            const fallbackLink = post.querySelector('a[href*="/groups/"]') || post.querySelector('a[href*="/services/"]');
            if (fallbackLink) {
              profileUrl = fallbackLink.href;
            }
          }

          // 3. Extract Subtitle / Headline
          let company = ''; // Mapping subtitle to company field in database
          const textBox = post.querySelector('[data-testid="expandable-text-box"]');
          const postText = textBox ? textBox.textContent.trim() : '';
          
          // Let's inspect all <p> tags inside the header area
          const pElements = Array.from(post.querySelectorAll('p'));
          for (const p of pElements) {
            const text = p.textContent.trim();
            if (!text) continue;
            if (textBox && (p === textBox || textBox.contains(p))) continue;
            if (text === name || name.includes(text) || text.includes(name)) continue;
            
            // Skip connection degrees / metadata / time
            if (/^\d+[mhdw]\s*•/.test(text) || /^[•·]/.test(text) || text.length < 15 && (text.includes('3rd') || text.includes('2nd') || text.includes('1st'))) {
              continue;
            }
            
            // Skip hashtags and generic post controls
            if (text.startsWith('#') || text.includes('reaction') || text.includes('Comment') || text.includes('Repost') || text.includes('Send')) {
              continue;
            }
            
            company = text;
            break;
          }
          
          if (!company) {
            const actorDesc = post.querySelector('[class*="actor__description"], [class*="actor__subtitle"]');
            if (actorDesc) {
              company = actorDesc.textContent.trim();
            }
          }

          // 4. Extract Email
          const emails = postText.match(emailRegex) || [];
          const email = emails.length > 0 ? emails[0] : '';

          // 5. Extract Post URL
          let postUrl = '';
          if (profileUrl.includes('highlightedUpdateUrn=')) {
            const match = profileUrl.match(/highlightedUpdateUrn=([^&]+)/);
            if (match) {
              const decodedUrn = decodeURIComponent(match[1]);
              const activityId = decodedUrn.split(':').pop();
              postUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}`;
            }
          }
          
          if (!postUrl) {
            const linkEl = post.querySelector('a[href*="/feed/update/"]') ||
              post.querySelector('a[href*="linkedin.com/posts/"]');
            postUrl = linkEl ? linkEl.href : '';
          }

          results.push({
            name: name.replace(/\n/g, ' ').trim().substring(0, 100),
            company: company.replace(/\n/g, ' ').trim().substring(0, 150),
            email,
            postUrl: postUrl || profileUrl, // Use profile URL as fallback postUrl if post link not found
            postPreview: postText.substring(0, 200),
          });
        } catch (e) {
          // Skip this post
        }
      });

      return results;
    });

    logger.info('Extracted recruiters', { count: recruiters.length });

    // If 0 results — save diagnostic screenshot for debugging
    if (recruiters.length === 0) {
      try {
        await page.screenshot({ path: path.join(__dirname, '../../search-debug.png') });
        logger.warn('0 recruiters extracted. Debug screenshot saved to search-debug.png');
      } catch (e) {}
    }

    return recruiters;
  } catch (error) {
    logger.error('Extraction failed', { error: error.message });
    return [];
  }
}

// Main function: search and extract
async function searchAndExtract(keyword, credentials) {
  if (!credentials || !credentials.email || !credentials.password) {
    throw new Error('LinkedIn credentials not configured. Please set them in Settings.');
  }

  try {
    await launchBrowser();

    // Check if saved session is valid first
    const loggedIn = await isLoggedIn();

    if (!loggedIn) {
      if (credentials.password.startsWith('LI_AT:')) {
        logger.info('Detected LI_AT cookie in password field. Injecting to bypass login...');
        const cookieValue = credentials.password.replace('LI_AT:', '').trim();
        await context.addCookies([
          { name: 'li_at', value: cookieValue, domain: '.linkedin.com', path: '/', secure: true, httpOnly: true, sameSite: 'None' },
          { name: 'li_at', value: cookieValue, domain: 'www.linkedin.com', path: '/', secure: true, httpOnly: true, sameSite: 'None' }
        ]);
        
        const cookieLoggedIn = await isLoggedIn();
        if (!cookieLoggedIn) {
          throw new Error('The provided LI_AT cookie is invalid or expired.');
        }
        logger.info('LI_AT cookie injected successfully. Logged in.');
        await saveSession();
      } else {
        logger.info('Session not valid or expired — logging in fresh...');
        // Go back to search flow after fresh login
        await loginToLinkedIn(credentials.email, credentials.password);
      }
    } else {
      logger.info('Reusing saved LinkedIn session — skipping login');
    }

    await searchPosts(keyword);
    const recruiters = await extractRecruiters();
    await closeBrowser();
    return recruiters;
  } catch (error) {
    await closeBrowser();
    throw error;
  }
}

// Clear saved session (force re-login on next run)
async function clearSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
      logger.info('LinkedIn session cleared');
    }
  } catch (err) {
    logger.warn('Failed to clear session', { error: err.message });
  }
}

// Close the browser
async function closeBrowser() {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      context = null;
      page = null;
      logger.info('Browser closed');
    }
  } catch (error) {
    logger.error('Error closing browser', { error: error.message });
    browser = null;
    context = null;
    page = null;
  }
}

module.exports = {
  launchBrowser,
  loginToLinkedIn,
  searchPosts,
  extractRecruiters,
  searchAndExtract,
  clearSession,
  hasSavedSession,
  closeBrowser,
};
