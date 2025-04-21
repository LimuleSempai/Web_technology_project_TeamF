# Project Overview: Web Technology Project Team F

### Contributions :
Contributions can be found from the commit :
- Warnex04 : BAKER
- LimuleSempai : CATEZ
- denisShar : SHARIPOV

[Click to see current contributions to the project](https://github.com/LimuleSempai/Web_technology_project_TeamF/graphs/contributors)

## Introduction
This project is a web application developed by Team F for a course on web technologies. The application provides real-time transport data, user authentication, and review functionalities. The backend is built using Node.js and Express, while the frontend is developed with React.

## Features (as of April 2025)
- Real-time public transport data for Ireland (bus, tram, rail, etc.), searchable by route, stop, or type
- Live stop departures, grouped by stop, with delay and direction info
- User authentication (register, login, JWT-based sessions)
- User profile management (edit name, email, password, view review history)
- Leave, edit, and delete reviews for transport routes (with rating and comment)
- Reviews are shown with user names and dates; only the author can edit/delete
- Responsive, mobile-friendly UI (Tailwind CSS)
- Error handling and helpful feedback for all major actions

## Backend
The backend of the application is responsible for handling API requests, managing the database, and providing authentication and review functionalities.

### Key Components
1. **Server Configuration**
   - The server is configured using Express and connects to a MongoDB database.
   - Environment variables are managed using the `dotenv` package.

2. **Database Models**
   - `User`: Manages user information including name, email, and password.
   - `TransportData`: Stores real-time transport data fetched from an external API.
   - `Review`: Allows users to post reviews related to transport data.

3. **Routes**
   - `authRoutes.js`: Handles user registration, login, and profile management.
   - `transportRoutes.js`: Fetches and stores transport data from an external API, and provides endpoints to query transport data.
   - `reviewRoutes.js`: Allows users to post and update reviews for transport data.

4. **Middleware**
   - `validation.js`: Provides validation for user registration inputs.

5. **Configuration**
   - `db.js`: Manages the connection to the MongoDB database.
   - `vercel.json`: Configuration for deploying the backend on Vercel.

## Frontend
- Built with React and Tailwind CSS for a modern, responsive UI
- Pages include Home, About, Live Transport, Transport Details, Profile, Login, and Register
- State management via React hooks and context
- API integration for real-time data and user actions
- Profile editing and review management via modals and forms

## Deployment
The project is configured to be deployed on Vercel. The `vercel.json` file specifies the build and routing configurations for the backend.

Current url : https://web-technology-project-team-f.vercel.app/

## Environment Variables
The project uses environment variables to manage sensitive information such as database connection strings and API keys. These variables are defined in an `.env` file.

---

For more details, see the `my-app/README.md` for frontend development and scripts.
