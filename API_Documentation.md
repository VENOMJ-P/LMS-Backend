# Library Management System API Documentation

This document outlines all available API routes for the Library Management System (LMS). Each route includes the URL, HTTP method, request body (if applicable), and a description of its functionality. All routes require authentication via a Bearer token in the `Authorization` header unless specified otherwise. Admin-only routes require the user to have the `admin` role.

Base URL: `/api/v1`

## Authentication Routes

### Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "fullName": "string",
    "phone": "string" // optional
  }
  ```
- **Functionality**: Creates a new user account and sends a welcome email to the provided email address.

### Login User

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Functionality**: Authenticates a user and returns access and refresh tokens. Updates the user's last login timestamp.

### Refresh Token

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Functionality**: Generates a new access token using a valid refresh token.

## User Routes (Admin Only)

### Get All Users

- **URL**: `/users`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 20)
  - `role`: String (e.g., "admin", "user")
  - `status`: String (e.g., "active", "blocked", "suspended")
- **Functionality**: Retrieves a paginated list of users, filterable by role and status.

### Get User by ID

- **URL**: `/users/:id`
- **Method**: `GET`
- **Functionality**: Retrieves details of a specific user by ID.

### Update User

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "fullName": "string", // optional
    "phone": "string", // optional
    "status": "string", // optional (active, blocked, suspended)
    "role": "string" // optional (user, admin)
  }
  ```
- **Functionality**: Updates user details (e.g., name, phone, status, role). Sends an in-app notification to the user on status change.

### Suspend User

- **URL**: `/users/:id/suspend`
- **Method**: `POST`
- **Functionality**: Suspends a user, revoking their refresh token. Sends an email and in-app notification to the user.

### Activate User

- **URL**: `/users/:id/activate`
- **Method**: `POST`
- **Functionality**: Activates a suspended user. Sends an email and in-app notification to the user.

### Delete User

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Functionality**: Deletes a user permanently from the system.

## Book Routes

### Create Book (Admin Only)

- **URL**: `/books`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "title": "string",
    "author": "string",
    "category": "string",
    "ISBN": "string",
    "price": number,
    "totalCopies": number, // optional, default: 3
    "coverImage": "string", // optional
    "description": "string" // optional
  }
  ```
- **Functionality**: Creates a new book in the library catalog.

### Get Books

- **URL**: `/books`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 20)
  - `category`: String (optional)
  - `search`: String (optional, searches title/author)
- **Functionality**: Retrieves a paginated list of books, filterable by category or search term.

### Get Book by ID

- **URL**: `/books/:id`
- **Method**: `GET`
- **Functionality**: Retrieves details of a specific book by ID.

### Update Book (Admin Only)

- **URL**: `/books/:id`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "title": "string", // optional
    "author": "string", // optional
    "category": "string", // optional
    "price": number, // optional
    "totalCopies": number, // optional
    "coverImage": "string", // optional
    "description": "string" // optional
  }
  ```
- **Functionality**: Updates book details.

### Delete Book (Admin Only)

- **URL**: `/books/:id`
- **Method**: `DELETE`
- **Functionality**: Soft deletes a book (marks as deleted).

### Bulk Upload Books (Admin Only)

- **URL**: `/books/bulk`
- **Method**: `POST`
- **Body**: Form-data with a CSV file (`csvFile`)
  - CSV format:
    ```csv
    title,author,category,ISBN,price,totalCopies,description
    "Book Title","Author Name","Fiction","1234567890",100,3,"Description"
    ```
- **Functionality**: Uploads multiple books via CSV file.

## Borrowing Routes

### Create Borrowing

- **URL**: `/borrowings`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "bookId": "string",
    "borrowType": "individual | group",
    "groupId": "string" // optional, required for group borrowing
  }
  ```
- **Functionality**: Borrows a book for an individual or group. Updates book availability and user/group borrowing records. Sends an email and in-app notification with due date.

### Get Borrowings

- **URL**: `/borrowings`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 20)
  - `status`: String (e.g., "borrowed", "returned", "overdue", "lost")
  - `borrowType`: String (e.g., "individual", "group")
- **Functionality**: Retrieves a paginated list of borrowings. Users see their own borrowings; admins see all.

### Get Borrowing by ID

- **URL**: `/borrowings/:id`
- **Method**: `GET`
- **Functionality**: Retrieves details of a specific borrowing. Users can only access their own or group borrowings.

### Return Book

- **URL**: `/borrowings/:id/return`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "damageLevel": "none | minor | major" // optional
  }
  ```
- **Functionality**: Marks a book as returned, updates availability, and calculates fines if overdue or damaged. Sends an email and in-app notification to the user.

### Extend Deadline (Admin Only)

- **URL**: `/borrowings/:id/extend`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "newDueDate": "string" // ISO date format
  }
  ```
- **Functionality**: Extends the due date for a borrowing. Sends an email and in-app notification to the user.

### Mark Book as Lost (Admin Only)

- **URL**: `/borrowings/:id/lost`
- **Method**: `POST`
- **Functionality**: Marks a book as lost, reduces book copies, and applies a fine. Sends an email and in-app notification to the user.

## Group Routes

### Create Group

- **URL**: `/groups`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "string",
    "memberIds": ["string"] // array of user IDs
  }
  ```
- **Functionality**: Creates a new group with pending status. Sends in-app notifications to all members.

### Get Groups

- **URL**: `/groups`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 20)
  - `status`: String (e.g., "pending", "approved", "rejected", "dissolved")
- **Functionality**: Retrieves a paginated list of groups. Users see groups they are part of; admins see all.

### Get Group by ID

- **URL**: `/groups/:id`
- **Method**: `GET`
- **Functionality**: Retrieves details of a specific group. Users can only access groups they are part of.

### Update Group

- **URL**: `/groups/:id`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "name": "string", // optional
    "memberIds": ["string"] // optional
  }
  ```
- **Functionality**: Updates group name or members. Only group leader or admin can update.

### Approve Group (Admin Only)

- **URL**: `/groups/:id/approve`
- **Method**: `POST`
- **Functionality**: Approves a pending group. Sends email and in-app notifications to group members.

### Reject Group (Admin Only)

- **URL**: `/groups/:id/reject`
- **Method**: `POST`
- **Functionality**: Rejects a pending group. Sends email and in-app notifications to group members.

### Dissolve Group (Admin Only)

- **URL**: `/groups/:id`
- **Method**: `DELETE`
- **Functionality**: Dissolves a group if it has no active borrowings.

## Fine Routes

### Get Fines

- **URL**: `/fines`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 20)
  - `isPaid`: Boolean (optional)
- **Functionality**: Retrieves a paginated list of fines. Users see their own fines; admins see all.

### Get Fine by ID

- **URL**: `/fines/:id`
- **Method**: `GET`
- **Functionality**: Retrieves details of a specific fine. Users can only access their own fines.

### Pay Fine

- **URL**: `/fines/:id/pay`
- **Method**: `POST`
- **Functionality**: Marks a fine as paid. Sends an email and in-app notification to the user.

### Waive Fine (Admin Only)

- **URL**: `/fines/:id/waive`
- **Method**: `POST`
- **Functionality**: Waives a fine, setting it to zero. Sends an email and in-app notification to the user.

### Update Fine (Admin Only)

- **URL**: `/fines/:id`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "totalFine": number, // optional
    "lateFee": number, // optional
    "damageFine": number, // optional
    "missingFine": number // optional
  }
  ```
- **Functionality**: Updates fine amounts. Sends an email and in-app notification to the user.

## Feedback Routes

### Create Feedback

- **URL**: `/feedbacks`
- **Method**: `POST`
- **Body**: Form-data
  - `bookId`: String (required)
  - `title`: String (min 5 characters)
  - `comment`: String (min 10 characters)
  - `rating`: Number (1-5)
  - `image`: File (optional, jpg/png, max 5MB)
- **Functionality**: Submits feedback for a book with an optional image upload to Cloudinary. Sends an in-app notification to the user.

### Get Feedbacks

- **URL**: `/feedbacks`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 20)
  - `bookId`: String (optional)
- **Functionality**: Retrieves a paginated list of feedbacks, filterable by book.

### Get Feedback by ID

- **URL**: `/feedbacks/:id`
- **Method**: `GET`
- **Functionality**: Retrieves details of a specific feedback. Users can only access their own feedback.

### Delete Feedback

- **URL**: `/feedbacks/:id`
- **Method**: `DELETE`
- **Functionality**: Deletes a feedback. Users can only delete their own feedback. Sends an in-app notification.

### Get Feedback Analytics (Admin Only)

- **URL**: `/feedbacks/analytics`
- **Method**: `GET`
- **Functionality**: Retrieves average ratings and feedback counts per book.

## Notification Routes

### Get Notifications

- **URL**: `/notifications`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 20)
  - `isRead`: Boolean (optional)
- **Functionality**: Retrieves a paginated list of in-app notifications for the authenticated user.

### Mark Notification as Read

- **URL**: `/notifications/:id/read`
- **Method**: `POST`
- **Functionality**: Marks a specific notification as read.

### Mark All Notifications as Read

- **URL**: `/notifications/read-all`
- **Method**: `POST`
- **Functionality**: Marks all notifications for the user as read.

## Settings Routes (Admin Only)

### Get Settings

- **URL**: `/settings`
- **Method**: `GET`
- **Functionality**: Retrieves system-wide settings (e.g., borrow days, fine rates).

### Update Settings

- **URL**: `/settings`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "individualBorrowDays": number, // optional
    "groupBorrowDays": number, // optional
    "lateFeePerDay": number, // optional
    "missingFineMultiplier": number, // optional
    "groupMinMembers": number, // optional
    "groupMaxMembers": number, // optional
    "maxBooksPerUser": number, // optional
    "copiesPerBook": number // optional
  }
  ```
- **Functionality**: Updates system settings.

## Report Routes (Admin Only)

### Generate Report

- **URL**: `/reports`
- **Method**: `GET`
- **Query Parameters**:
  - `type`: String (required, e.g., "books", "borrowings", "fines", "users", "groups", "feedbacks")
  - `format`: String (required, e.g., "json", "csv", "pdf")
- **Functionality**: Generates a report in the specified format (JSON, CSV, or PDF) for the given type. CSV and PDF are downloadable.
  - JSON: `{ success: true, data: { report }, message: "Report generated successfully" }`
  - CSV: Text file download
  - PDF: PDF file download

## Health Check

### Server Health

- **URL**: `/health`
- **Method**: `GET`
- **Functionality**: Checks if the server is running. No authentication required.

## Notes

- **Authentication**: All routes (except `/health` and `/auth/*`) require a Bearer token in the `Authorization` header.
- **Admin Routes**: Routes marked "Admin Only" require the user to have the `admin` role.
- **Notifications**: Many actions (e.g., borrowing, fines, group actions) trigger email and in-app notifications.
- **File Uploads**: Book bulk upload (`/books/bulk`) and feedback image upload (`/feedbacks`) use `multipart/form-data`.
- **Error Handling**: Errors return a JSON response with `{ success: false, error: { message, status } }`.
- **Cron Jobs**: Automated tasks include overdue checks, reminders, late fee updates, database backups, and cleanup of old records.

For further details, refer to the backend codebase
