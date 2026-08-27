# Student Information Management System (SIMS)

This is a student information portal project built using the MERN stack (MongoDB, Express, React, Node.js). 

It has three different dashboard interfaces for:
- Admins
- Teachers (Faculty)
- Students

The design is built using custom CSS styles and Vite for the React frontend, and standard Express routing with ES Modules for the backend.

## Tech Stack

- Frontend: React (Vite), React Router DOM, Lucide React icons
- Backend: Node.js, Express, JWT for login, bcryptjs for hashing passwords
- Database: MongoDB and Mongoose

## Demo Credentials

You can use these accounts to log in and test different roles:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| Admin | admin@university.edu | admin123 | Full system administrator |
| Teacher | sarah.connor@university.edu | teacher123 | Head of Department |
| Teacher | alan.turing@university.edu | teacher123 | Computer Science teacher |
| Student | john.doe@student.edu | student123 | CSE Student (Semester 3) |
| Student | jane.smith@student.edu | student123 | CSE Student (Semester 3) |
| Student | bob.johnson@student.edu | student123 | EE Student (Semester 1) |

## Folder Structure

- server: Backend folder
  - config: Database setup
  - controllers: Handles requests
  - middleware: Session and role authentication
  - models: Database schemas
  - routes: Route handlers
  - scripts: Database seed files
  - server.js: Entry point for the server
- client: Frontend folder
  - src: Frontend source files
    - components: React UI components
    - context: Auth state context
    - layouts: Page layout layout wrappers
    - pages: UI page components
    - routes: Protected route rules
    - services: API fetch helper functions
    - App.jsx: Frontend routing
    - main.jsx: React main render mount


## How to Set Up and Run

1. Make sure you have Node.js and MongoDB installed.
2. In the root directory, run this command to install the packages for both client and server:
   npm run install:all
3. Set up the environment file by creating a `.env` file in the `server` directory (see SETUP.md for details).
4. Run the seed script to populate the database with initial users and roles:
   npm run seed
5. Run the development environment:
   npm run dev

Open `http://localhost:5173` in your browser to view the portal.

## API Endpoints Spec

All endpoints are prefixed with `/api`.

- Auth:
  - `POST /auth/login` - Logs a user in and returns a token.
  - `POST /auth/register` - Registers a student or teacher profile and returns a token.
  - `GET /auth/me` - Gets the profile of the logged-in user.
  - `PUT /auth/change-password` - Changes the password for the logged-in user.

- Tasks:
  - `GET /tasks` - Gets all tasks for the logged-in user.
  - `POST /tasks` - Creates a new task.
  - `PUT /tasks/:id` - Updates a task details or completeness.
  - `DELETE /tasks/:id` - Deletes a task.

- Students:
  - `GET /students` - Lists all students (supports paging and department filters).
  - `POST /students` - Creates a new student.
  - `GET /students/:id` - Gets student details, attendance, and grades.
  - `PUT /students/:id` - Updates student details.
  - `DELETE /students/:id` - Deletes a student.
  - `POST /students/:id/documents` - Uploads student documents.
  - `DELETE /students/:id/documents/:docId` - Deletes a document.

- Teachers:
  - `GET /teachers` - Lists all teachers.
  - `POST /teachers` - Creates a new teacher profile.
  - `GET /teachers/:id` - Gets a teacher details and courses.
  - `PUT /teachers/:id` - Updates teacher info.
  - `DELETE /teachers/:id` - Deletes a teacher.

- Departments & Courses:
  - `GET /departments` | `POST /departments` - Lists or creates departments.
  - `GET /departments/:id` - View department head, courses, and students.
  - `GET /courses` | `POST /courses` - Lists or creates courses.

- Attendance:
  - `GET /attendance/course/:courseId?date=YYYY-MM-DD` - Gets the roster and attendance status.
  - `POST /attendance` - Submits bulk attendance logs.
  - `GET /attendance/my-attendance` - Logs of the logged-in student.

- Exams & Grading:
  - `GET /exams` | `POST /exams` - Lists or schedules exams.
  - `GET /exams/:examId/results` - Gets student results for an exam.
  - `POST /exams/:examId/results` - Submits student grades.
  - `PUT /exams/:id/publish` - Publishes grades so students can view them.
  - `GET /exams/my-results` - Gets the current student transcript results.

- Announcements:
  - `GET /announcements` - Gets active announcements for the current user.
  - `GET /announcements/admin` - Gets all announcements (for admins).
  - `POST /announcements` | `PUT /announcements/:id` | `DELETE /announcements/:id` - Manages announcements.

## Deployment

A `render.yaml` file is placed in the root folder of the repository. You can use it to deploy the API and frontend directly on Render.com using their Blueprints feature.