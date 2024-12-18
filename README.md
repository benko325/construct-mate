# construct-mate
A web app to make the daily life of construction managers easier.
It also contains the implementation of the construction diary based on the Slovak laws.

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) (optional for simplified setup)
- [.NET SDK](https://dotnet.microsoft.com/) (if running manually)
- [Node.js](https://nodejs.org/) (if running manually)
- Access to a database - PostgreSQL (if running manually)

---

### Run the Application

#### Option 1: Using Docker (Recommended)
1. In the root of the project, run:
   ```bash
   docker-compose up
2. This will create and run Docker containers for the backend, frontend, and database.

#### Option 2: Manual Setup
If Docker is not available, follow these steps to start the application manually:

1. **Start the Backend:**
   - Open a terminal and navigate to the `backend/src` directory:
     ```bash
     cd backend/src
     ```
   - Run the backend using:
     ```bash
     dotnet run
     ```

2. **Start the Frontend:**
   - Open a second terminal and navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Start the frontend using:
     ```bash
     npm start
     ```

3. **Set Up the Database:**
   - Ensure the database is up and running.
   - Update the **connection string** in the `appsettings.json` file located in `backend/src` to match your database configuration.

---
