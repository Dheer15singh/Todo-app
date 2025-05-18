# 📝 Todo App

A full-featured, full-stack Todo application built with a Node.js backend and a simple HTML/CSS/JavaScript frontend. It allows users to create, manage, and organize their tasks with priority levels and filtering options. Tasks can be updated, deleted, and reordered using drag-and-drop functionality.


## 🚀 Features

- Add tasks with priority level (Low / Medium / High)
- Filter tasks by:
  - **Status**: (Active / Completed)
  - **Priority**: (Low / Medium / High)
- Update existing tasks
- Delete tasks
- Drag-and-drop support to reorder tasks
- Real-time backend integration using Supabase



## ⚙️ How to Run This Project

### 1. Clone the Repository

git clone https://github.com/Dheer15singh/Todo-app.git
cd todo-app


### 2. Install Backend Dependencies

cd backend
npm install

### 3. Setup Supabase

Go to https://supabase.com and sign in.

Create a new project.

Supabase Table Schema
Create a new table named tasks with the following columns:

| Column Name | Type      | Constraints                                | Description                     |
| ----------- | --------- | ------------------------------------------ | ------------------------------- |
| id          | UUID      | Primary Key, Default: `uuid_generate_v4()` | Unique task ID                  |
| title       | Text      | Not Null                                   | Task description/title          |
| priority    | Text      | Not Null                                   | Task priority (low/medium/high) |
| status      | Text      | Not Null, Default: `'pending'`             | Task status (pending/completed) |
| position    | Integer   | Optional                                   | Used for drag-and-drop sorting  |
| created\_at | Timestamp | Default: `now()`                           | Timestamp of task creation      |


### 4. Configure Environment Variables
Create a .env file in the backend/ directory and add your Supabase credentials:

SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-api-key


### 5 Start the server

npm run dev


## 🛠 Tech Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Frontend | HTML, CSS, JavaScript |
| Backend  | Node.js, Express      |
| Database | Supabase (PostgreSQL) |


# 🙌 Contributions
Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to improve.

# 🛡️ License
This project is licensed under the MIT License.

# 📬 Contact
For feedback or questions, feel free to reach out via GitHub issues or email at dheersingh215@gmail.com.