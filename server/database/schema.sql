CREATE TABLE IF NOT EXISTS recruiters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  company TEXT,
  email TEXT,
  linkedinPost TEXT,
  status TEXT DEFAULT 'new',
  searchId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (searchId) REFERENCES searches(id)
);

CREATE TABLE IF NOT EXISTS searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  results INTEGER DEFAULT 0,
  emailsSent INTEGER DEFAULT 0,
  searchTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recruiterId INTEGER,
  subject TEXT,
  body TEXT,
  resumeId INTEGER,
  status TEXT DEFAULT 'pending',
  sentAt DATETIME,
  FOREIGN KEY (recruiterId) REFERENCES recruiters(id),
  FOREIGN KEY (resumeId) REFERENCES resumes(id)
);

CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  originalName TEXT NOT NULL,
  path TEXT NOT NULL,
  mimetype TEXT,
  size INTEGER,
  uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure only one row
  linkedinEmail TEXT,
  linkedinPassword TEXT,
  gmailEmail TEXT,
  gmailAppPassword TEXT,
  userName TEXT DEFAULT 'Your Name',
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

