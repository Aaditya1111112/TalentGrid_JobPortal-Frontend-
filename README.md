# TalentGrid - Frontend

A role-based job portal frontend built with React.

## Tech Stack

- React 18 (Functional Components, Hooks)
- React Router DOM
- Axios
- Pure CSS (no UI frameworks)

## Features

- Browse and search job listings (keyword, location, experience)
- Role-based UI (Seeker and Employer views)
- JWT authentication with persistent login
- Seeker dashboard — profile management, resume upload, application tracking
- Employer dashboard — job posting, applicant tracking, status updates, resume download
- Job detail page with apply functionality

## Project Structure
```
src/
├── api/
│   └── axios.js
├── components/
│   ├── Navbar.js
│   ├── JobCard.js
│   └── ProtectedRoute.js
├── context/
│   └── AuthContext.js
├── pages/
│   ├── HomePage.js
│   ├── AuthPage.js
│   ├── JobDetailPage.js
│   ├── SeekerDashboard.js
│   └── EmployerDashboard.js
├── App.js
├── App.css
└── index.js
```

## Setup

1. Clone the repo
2. Install dependencies:
```bash
npm install
```
3. Make sure the backend is running on `http://localhost:8080`
4. Start the app:
```bash
npm start
```
5. Open `http://localhost:3000`

## Pages

| Route | Access |
|-------|--------|
| / | Public — job listings with search |
| /auth | Public — login and register |
| /jobs/:id | Public — job detail and apply |
| /seeker/dashboard | SEEKER only |
| /employer/dashboard | EMPLOYER only |

## Backend

This frontend connects to the TalentGrid backend API.
Backend repo: https://github.com/Aaditya1111112/talentgrid-backend
