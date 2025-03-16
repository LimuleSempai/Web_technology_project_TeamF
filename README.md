# Project Overview: Web Technology Project Team F

### Division of Work :
The work was evenly divided

## Introduction
This project is a web application developed by Team F for a course on web technologies. The application provides real-time transport data, user authentication, and review functionalities. The backend is built using Node.js and Express, while the frontend is developed with React.

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



## Deployment
The project is configured to be deployed on Vercel. The `vercel.json` file specifies the build and routing configurations for the backend.

Current url : https://web-technology-project-team-f.vercel.app/

## Environment Variables
The project uses environment variables to manage sensitive information such as database connection strings and API keys. These variables are defined in an `.env` file.
