# Student Job Portal (Full Stack MERN)

A complete MERN job portal for students, companies, and admins built with React, Tailwind CSS, Node.js, Express, MongoDB Atlas, JWT, and Multer.

## Setup

### Backend
1. Open `server` folder.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.
4. Run:
   ```bash
   npm install
   npm run dev
   ```

### Frontend
1. Open `client` folder.
2. Copy `.env.example` to `.env`.
3. Run:
   ```bash
   npm install
   npm run dev
   ```

## Features
- Student / Company / Admin authentication
- Role-based protected routes
- Job listing, detail view, and application flow
- Resume upload via PDF with Multer backend storage
- Company job posting and applicant management
- Admin user and job moderation
- Modern responsive UI with Tailwind CSS
