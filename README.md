# Inchat 
Inchat is a **WhatsApp Mini Clone** built using **Next.js (TypeScript)**.  
This project is developed as part of **Sprint-1 at Kalvium** and focuses on
building a clean, scalable foundation for a real-time chat application.

---

## Project Overview
Building a full-scale chat application is complex. 

**Inchat** is a simplified version that helps understand how real-time messaging
works using modern full-stack technologies.
The application allows users to:
- Sign up and log in
- View chat conversations
- Send one-to-one messages in real time

---

## 🗂 Folder Structure

- **app/**  
  Contains application routes and pages using Next.js App Router.
  Each route represents a screen in the chat application.
- **components/**  
  Stores reusable UI components such as chat items, message bubbles,
  input boxes, and buttons. This improves reusability and consistency.
- **lib/**  
  Contains helper functions and configurations like authentication logic,
  database clients, and socket configuration.


### TypeScript Strict Configuration
Strict TypeScript mode is enabled to catch errors during development.
Rules like noImplicitAny and noUnusedLocals help reduce runtime bugs
and keep the codebase clean and maintainable.


### Environment Variable Management 
- Added environment variable setup using .env.local and .env.example
- Protected secrets using .gitignore
- Documented environment variables in README
### Reflection
This setup ensures secure handling of secrets and makes the project
easy to configure across different environments.


## Team Branching & PR Workflow
### Branch Naming Convention
- feature/<feature-name>
- fix/<bug-name>
- chore/<task-name>
- docs/<update-name>
### Example Branches
- feature/login-auth
- chore/env-setup
- docs/update-readme

We use feature-based branches and pull requests.
A PR template ensures consistency, and all changes go through review before merging into main.”



## 🐳 Docker & Local Development Setup
This project uses Docker and Docker Compose to run the full stack locally.
