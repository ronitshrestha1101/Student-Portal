# Student Portal Setup Guide

## Repository Structure

The project is structured with separate subdirectories for the client-side assets and the backend API:

- `/client`: Frontend assets built with React, Vite, and React Router.
- `/server`: Backend API routing, database models, and controllers built with Express and MongoDB.

## Prerequisites

Ensure you have the following installed:
- Node.js
- MongoDB

## Environment Configuration

Create a `.env` file in the `/server` directory.

```env
PORT=5000
MONGO_URI=mongodb+srv://ronitshrestha1101_db_user:898EYEcetVfrjhjD@cluster0.91qri9l.mongodb.net/todo_db?appName=Cluster0
MONGODB_URI=mongodb+srv://ronitshrestha1101_db_user:898EYEcetVfrjhjD@cluster0.91qri9l.mongodb.net/todo_db?appName=Cluster0
JWT_SECRET=supersecretuniversitykey12345
NODE_ENV=development
```

## Database Initialization and Seeding

Install the dependencies for both client and server from the root directory:

```bash
npm run install:all
```

To seed the database with initial departments, users, courses, students, and announcements:

```bash
npm run seed
```

## Running the Application

To run both client and server concurrently:

```bash
npm run dev
```

To run only the server:

```bash
npm run server
```

To run only the client:

```bash
npm run client
```

## Database and Connection Proof

The database connects successfully to MongoDB Atlas:

```text
Server running in development mode on port 5000
MongoDB Connected: cluster0-shard-00-00.91qri9l.mongodb.net
```
