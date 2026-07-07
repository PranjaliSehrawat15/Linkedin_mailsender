# LinkedIn Job Outreach Automation Platform

A full-stack web application that automates the process of finding recent job opportunities on LinkedIn Posts, extracting recruiter contact information (where available), and preparing personalized job application emails with the user's resume.

## Project Structure

This is a monorepo consisting of:
- **`client/`**: React frontend built with Vite, Tailwind CSS v4, and React Router.
- **`server/`**: Express backend with SQLite database, Multer for file uploads, Nodemailer for SMTP email, and Playwright for LinkedIn browser automation.

## Features

- **Professional Dashboard**: View search metrics, weekly charts, and recent activity history.
- **Automated LinkedIn Search**: Uses Playwright to launch a headed browser, log into LinkedIn, search for posts in the last 24 hours, and extract recruiter emails using regex.
- **Recruiter Management**: View, filter, and manage extracted recruiter contacts.
- **Resume Management**: Upload and manage PDF/DOCX resumes (up to 5MB) to attach to emails.
- **Email Outreach**: Compose personalized emails using a template system with dynamic variables (e.g., `{Name}`, `{Position}`).
- **Dual Email Sending**: Choose between reliable Nodemailer (SMTP) or a Playwright browser automation method to send through Gmail.
- **History Tracking**: Automatically records all past searches and email campaigns.

## Prerequisites

- Node.js v18 or higher
- A LinkedIn Account
- A Gmail Account (with App Password generated if using Nodemailer)

## Setup Instructions

1. **Environment Variables**:
   Copy the `.env.example` file to `.env` in the root directory and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
   *Note: For `GMAIL_APP_PASSWORD`, you must generate an App Password in your Google Account Security settings.*

2. **Install Dependencies**:
   Install root, client, and server dependencies all at once:
   ```bash
   npm run install-all
   ```

3. **Install Playwright Browsers**:
   Ensure Playwright browsers are installed:
   ```bash
   cd server
   npx playwright install chromium
   ```

## Running the Application

Start both the client and server concurrently from the root directory:

```bash
npm run dev
```

- The React application will be available at `http://localhost:5173`
- The Express API will be running on `http://localhost:5000`

## Architecture Highlights

- **SQLite Database**: Uses `better-sqlite3` for fast, synchronized local storage. The schema auto-initializes on server start.
- **Error Handling**: Centralized error middleware on the backend and comprehensive toast notifications on the frontend.
- **Headed Browser Automation**: Playwright runs in non-headless mode with a delay between actions to mimic human behavior and allow you to resolve LinkedIn CAPTCHAs if they appear.
- **Modern UI**: Implements a glassmorphism design system using Tailwind CSS, featuring dark mode by default, loading skeletons, and interactive charts via Recharts.

## Disclaimer

Automated scraping of LinkedIn is against their Terms of Service. This project is built for educational purposes as an internship assignment to demonstrate full-stack architecture and browser automation integration.
