# How to Run the Project

Follow these steps to run both the backend and frontend locally:

## 1. Install Dependencies

Open a terminal in the project root and run:

```
npm install
```

Then, install dependencies for the backend and frontend:

```
cd backend
npm install
cd ../my-app
npm install
cd ..
```

## 2. Start the Backend Server

In the `backend` folder, run:

```
npm start
```

The backend server will start (by default on port 5000).

## 3. Start the Frontend (React App)

In the `my-app` folder, run:

```
npm start
```

The React app will start (by default on port 3000).
Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

**Note:**
- Make sure you have Node.js and npm installed.
- If you need to set up environment variables, create a `.env` file in the `backend` directory as described in the main README.
