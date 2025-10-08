# Library Management System (LMS)

The Library Management System (LMS) is a production-ready backend API built with Node.js, Express, TypeScript, and MongoDB. It facilitates the management of library operations, including book cataloging, borrowing, group borrowing, fines, feedback, notifications, and system settings. The system supports both individual and group borrowing, with automated tasks for overdue checks, reminders, and backups.

## Features

- **User Management**: Register, login, update, suspend, activate, and delete users (admin-only for most actions).
- **Book Management**: Create, update, delete, and bulk upload books via CSV (admin-only). Search and filter books by category or title/author.
- **Borrowing**: Individual and group borrowing with due dates, return processing, fine calculation for overdue or damaged books, and lost book handling.
- **Group Borrowing**: Create, approve, reject, and dissolve groups for collaborative borrowing.
- **Fines**: Automated fine calculation for late returns, damages, or lost books. Pay or waive fines (admin-only for waiving).
- **Feedback**: Submit feedback with ratings and optional images for books. View feedback analytics (admin-only).
- **Notifications**: Email and in-app notifications for borrowing, fines, group actions, and more.
- **Reports**: Generate reports in JSON, CSV, or PDF formats for books, borrowings, fines, users, groups, and feedback (admin-only).
- **Settings**: Configure borrowing durations, fine rates, group sizes, and book limits (admin-only).
- **Automation**: Cron jobs for overdue checks, reminders, late fee updates, database backups, and cleanup of old records.
- **Security**: JWT authentication, role-based access (admin/user), input validation with Zod, rate limiting, and audit logging.
- **File Uploads**: Support for CSV book uploads and feedback image uploads via Cloudinary.

## Prerequisites

- **Node.js**: v18.x or higher
- **MongoDB**: v5.x or higher (local or cloud instance)
- **Cloudinary Account**: For image and backup storage
- **SMTP Service**: For email notifications (e.g., Gmail SMTP)
- **Git**: For cloning the repository

## Setup Instructions

Follow these steps to set up and run the LMS backend locally:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/VENOMJ-P/LMS-Backend.git
   cd LMS-Backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Copy the `.env.sample` file to `.env`:
     ```bash
     cp .env.sample .env
     ```
   - Update `.env` with your configuration:
     - `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/lms_db`)
     - `JWT_SECRET`: A secure secret for JWT tokens
     - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials
     - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`: SMTP settings for email notifications
     - Other settings as needed (e.g., `PORT`, `CORS_ORIGIN`, `LOG_LEVEL`)

4. **Set Up MongoDB**
   - Ensure MongoDB is running locally or provide a cloud MongoDB URI in `.env`.
   - The database (`lms_db`) will be created automatically on first connection.

5. **Seed the Database (Optional)**
   - Run the seed script to populate initial data (admin user, sample book, group, and settings):
     ```bash
     npm run seed
     ```

6. **Build the Project**
   - Compile TypeScript to JavaScript:
     ```bash
     npm run build
     ```

7. **Run the Application**
   - Start the server in production mode:
     ```bash
     npm start
     ```
   - Or, start in development mode with auto-reload:
     ```bash
     npm run dev
     ```

8. **Access the API**
   - The API will be available at `http://localhost:3000/api/v1` (or the port specified in `.env`).
   - Use a tool like Postman or cURL to test endpoints.
   - Refer to `API_Documentation.md` for a complete list of routes and their usage.

## Project Structure

```
src/
├── configs/           # Configuration files (database, environment)
├── controllers/       # Request handlers for each module
├── jobs/              # Cron jobs for automation (overdue, backups)
├── middlewares/       # Authentication, validation, and upload middlewares
├── models/            # Mongoose schemas for data models
├── routes/            # API route definitions
├── services/          # Business logic for each module
├── utils/             # Helper functions (logger, notifications, errors)
├── validators/        # Zod schemas for input validation
├── seeds/             # Database seeding script
├── app.ts             # Express app setup
├── server.ts          # Server entry point
```

## Running Tests

(Currently, no tests are implemented. Add a testing framework like Jest if needed.)

## API Documentation

See `API_Documentation.md` for detailed information on all API routes, including URLs, methods, request bodies, and functionalities like email notifications and report generation.

## Notes

- **Security**: Ensure `JWT_SECRET` and other sensitive `.env` variables are secure and not exposed in version control.
- **Cloudinary**: Configure a Cloudinary account for image uploads and backups.
- **SMTP**: Use a secure SMTP service (e.g., Gmail with an App Password) for email notifications.
- **Cron Jobs**: Automated tasks (e.g., overdue checks, backups) run on schedules defined in `src/jobs/`.
- **Logging**: Logs are written to `logs/app.log` (application) and `logs/audit.log` (security events).

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.
