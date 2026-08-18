# Student Information Management System (SIMS)

A complete, production-ready Student Information Management System built with the **MERN Stack** (MongoDB, Express, React, Node.js). 

This portal features distinct interfaces for **Administrators**, **Faculty Teachers**, and **Enrolled Students** with a modern, restrained, and professional academic design. It uses native **ES Modules** in the backend and a fully responsive frontend built with **React** and styled with **Vanilla CSS** (avoiding AI design tropes, oversized cards, and startup templates).

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite compiler), React Router DOM (v6), Lucide Icons
* **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs password hashing
* **Database**: MongoDB (Object modeling via Mongoose)
* **Styling**: Structured Vanilla CSS with system design tokens
* **Fonts**: *DM Sans* (Body text), *Manrope* (Headings), *IBM Plex Sans* (Data/numbers)

---

## 🔑 Demo Access Credentials

The database seeder provisions pre-configured credentials for all portal roles. Use the following profiles for testing:

| Portal Access Level | Email Address | Password | Profile Identity Context |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@university.edu` | `admin123` | Master System Admin |
| **Faculty / Teacher** | `sarah.connor@university.edu` | `teacher123` | Dr. Sarah Connor (HOD CSE) |
| **Faculty / Teacher** | `alan.turing@university.edu` | `teacher123` | Prof. Alan Turing (Instructor CSE) |
| **Student** | `john.doe@student.edu` | `student123` | John Doe (B.Tech CSE, Sem 3) |
| **Student** | `jane.smith@student.edu` | `student123` | Jane Smith (B.Tech CSE, Sem 3) |
| **Student** | `bob.johnson@student.edu` | `student123` | Bob Johnson (B.Tech EE, Sem 1) |

---

## 📁 System Architecture

```text
Student-Portal/
├── server/                 # Express Backend API
│   ├── config/             # Database connection setups
│   ├── controllers/        # Express request controller handlers
│   ├── middleware/         # Protected JWT gates & role guards
│   ├── models/             # Mongoose schemas (User, Student, Teacher, etc.)
│   ├── routes/             # RESTful API router mounts
│   ├── scripts/            # Seed data setups
│   ├── .env.example        # Environment variables template
│   └── server.js           # Server application entry
│
├── client/                 # Vite + React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI widgets (Table, Modal, Alert, etc.)
│   │   ├── context/        # React Auth Context session persistence
│   │   ├── layouts/        # Dashboard layout grid & mobile drawer
│   │   ├── pages/          # Authentication & Portal sections
│   │   ├── routes/         # Protected routes and role filters
│   │   ├── services/       # Central API communications (fetch layer)
│   │   ├── App.jsx         # App router routing rules
│   │   ├── index.css       # Core stylesheet with tokens
│   │   └── main.jsx        # App mounting configuration
│   └── package.json
│
└── package.json            # Root workspace task executor scripts
```

---

## 🚀 Installation & Setup

Follow these steps to run the portal locally:

### 1. Prerequisite
Ensure you have **Node.js** (v18+) and **MongoDB** (running locally on port `27017`) installed.

### 2. Install Dependencies
Run the install script from the **root workspace directory**:
```bash
npm run install:all
```
This automatically installs package dependencies for both the `/server` and `/client` workspaces.

### 3. Setup Environment Variables
Verify or adjust environment configurations. A default `.env` is created for you in `/server`. The template is available in `server/.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_portal
JWT_SECRET=supersecretuniversitykey12345
NODE_ENV=development
```

### 4. Seed the Database
Seed MongoDB with active departments, courses, teachers, students, exam rosters, and announcements:
```bash
npm run seed
```

### 5. Launch Development Portals
Run the following scripts in separate terminals from the **root workspace directory** (do not `cd`):

* Start the **Backend Server** (on port `5000`):
  ```bash
  npm run server
  ```
* Start the **React Client** (Vite development portal):
  ```bash
  npm run client
  ```

Once both servers are running, navigate to `http://localhost:5173` (or the port Vite prints in your console) to view the portal.

---

## 📡 RESTful API Spec Overview

All API endpoints are prefixed with `/api`.

* **Authentication Gate**:
  * `POST /auth/login` - Authenticate credentials and get token.
  * `GET /auth/me` - Retrieve profile for the authenticated session.
  * `PUT /auth/change-password` - Update current logged-in user password.
* **Students**:
  * `GET /students` - Query student directory (supports paginating, sorting, and department filters).
  * `POST /students` - Register student & provision user account.
  * `GET /students/:id` - Fetch student transcript, attendance records, and documents.
  * `PUT /students/:id` - Edit student details & course registrations.
  * `DELETE /students/:id` - Remove student profile and login record.
  * `POST /students/:id/documents` - Upload record metadata (ID, certificates).
  * `DELETE /students/:id/documents/:docId` - Remove uploaded document.
* **Faculty / Teachers**:
  * `GET /teachers` - Query teachers directory.
  * `POST /teachers` - Register teacher & provision user credentials.
  * `GET /teachers/:id` - Fetch teacher profile & course teaching load.
  * `PUT /teachers/:id` - Edit teacher info.
  * `DELETE /teachers/:id` - Remove teacher profile and login record.
* **Departments & Courses**:
  * `GET /departments` | `POST /departments` - List or create academic departments.
  * `GET /departments/:id` - View department dean (HOD), courses, and students.
  * `GET /courses` | `POST /courses` - List or define curriculum courses and credit weights.
* **Attendance marking**:
  * `GET /attendance/course/:courseId?date=YYYY-MM-DD` - Load roster merged with marked attendance statuses.
  * `POST /attendance` - Save bulk marks (Present, Absent, Late) for a course on a date.
  * `GET /attendance/my-attendance` - View attendance records log for the current student.
* **Exams & Grading**:
  * `GET /exams` | `POST /exams` - List or schedule course exams.
  * `GET /exams/:examId/results` - Get student grades roster sheet for an exam.
  * `POST /exams/:examId/results` - Input bulk marks obtained (saves grades & GPAs).
  * `PUT /exams/:id/publish` - Publish exam results (making them visible to students).
  * `GET /exams/my-results` - Retrieve transcript of results for the logged-in student.
* **Announcements Board**:
  * `GET /announcements` - Retrieve announcements targeted to the current role/department/semester.
  * `GET /announcements/admin` - Retrieve all announcements (Admin view).
  * `POST /announcements` | `PUT /announcements/:id` | `DELETE /announcements/:id` - Manage announcements.