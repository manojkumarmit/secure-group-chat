# Secure Group Messaging

Group Messaging API

## Description

This project is a Group Messaging API built with Node.js, Express, and MongoDB. It allows users to create groups, join or leave groups, and send messages within groups. The API also supports real-time communication using Socket.IO and provides a Swagger UI for API documentation.

## Features

- User authentication and authorization
- Create, join, leave groups, and transfer ownership
- Send and receive messages within groups
- Real-time communication with Socket.IO
- Swagger UI for API documentation

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- Swagger UI
- dotenv
- CORS

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/group-messaging-api.git
   cd group-messaging-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Usage

- Access the API at `http://localhost:5000/api`
- Use the provided routes for authentication, group management, messaging, and file uploads
- Access the Swagger UI for API documentation at `http://localhost:5000/api-docs`

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in a user

### Groups

- `POST /api/groups`: Create a new group
- `GET /api/groups`: Get all groups
- `GET /api/groups/{id}`: Get group details by ID
- `PUT /api/groups/{id}`: Update group details
- `DELETE /api/groups/{id}`: Delete a group
- `POST /api/groups/{id}/join`: Join a group
- `POST /api/groups/{id}/leave`: Leave a group

### Messages

- `GET /api/groups/{groupId}/messages`: Get messages for a group

### File Uploads

- `GET /api/upload/presigned-upload-url`: Generate a presigned URL for file upload
- `GET /api/upload/presigned-download-url`: Generate a presigned URL for file download

## Real-Time Communication

The API uses Socket.IO for real-time communication. The `io` instance is made available to routes for emitting events.

## Error Handling

- MongoDB Connection: Gracefully handles connection errors and exits the process if unable to connect
- Route Handlers: Catches and logs errors, sending appropriate HTTP responses

## Security Features

- CORS: Configured to allow cross-origin requests
- Authentication Middleware: Protects routes to ensure only authenticated users can access them
