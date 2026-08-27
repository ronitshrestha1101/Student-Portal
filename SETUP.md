# Student Portal Setup Guide

This guide explains how to get the project running on your computer.

## Project Folders

The project has two main folders:
- client: The frontend React app (built with Vite).
- server: The backend Express API (built with Node.js and MongoDB).

## Prerequisites

You need to have Node.js and MongoDB installed on your computer.

## Setup Environment Variables

Create a file named .env in the server folder and put the following variables in it:

PORT=5000
MONGO_URI=mongodb+srv://ronitshrestha1101_db_user:898EYEcetVfrjhjD@cluster0.91qri9l.mongodb.net/todo_db?appName=Cluster0
MONGODB_URI=mongodb+srv://ronitshrestha1101_db_user:898EYEcetVfrjhjD@cluster0.91qri9l.mongodb.net/todo_db?appName=Cluster0
JWT_SECRET=supersecretuniversitykey12345
NODE_ENV=development

## Install Dependencies

Open a terminal in the root folder of the project and run this command to install the packages for both the client and the server:

npm run install:all

## Seed the Database

To add the initial data (like departments, students, and teachers) to your database, run this command from the root folder:

npm run seed

## Run the Project

You can run both the frontend and backend together using this command in the root folder:

npm run dev

If you want to run them separately:

- To run only the backend server:
npm run server

- To run only the frontend client:
npm run client

## Database Connection Proof

When the server runs, it connects to the MongoDB Atlas database and prints this in the console:

Server running in development mode on port 5000
MongoDB Connected: cluster0-shard-00-00.91qri9l.mongodb.net
