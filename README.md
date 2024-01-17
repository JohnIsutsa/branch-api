# `Branch Backend API`

🚀 **Scalable Messaging Web Application - NestJS Backend**

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [WebSocket Integration](#websocket-integration)
- [Contributing](#contributing)
- [License](#license)

## Introduction

**<Your Project Name> Backend API** is the server-side application of a scalable messaging web application. It is built using NestJS, providing a robust and maintainable backend for handling customer inquiries, real-time communication, and efficient agent responses.

## Features

- API endpoints for sending and receiving messages.
- WebSocket integration for real-time communication.
- Database interaction using TypeORM for storing and managing customer messages.

## Technologies Used

- **NestJS:** A powerful Node.js framework for building scalable and maintainable server-side applications.
- **TypeORM:** An Object-Relational Mapper (ORM) that simplifies database interactions within the NestJS application.
- **WebSocket:** Real-time communication for instant message delivery and updates.
- **PostgreSQL:** For storing and managing customer messages.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/) or your preferred database.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JohnIsutsa/branch-api.git
   cd branch-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Set up your database and configure the connection in `src/config/database.config.ts`.
2. Configure any environment variables needed for your project.

## Usage

Run the backend server:

```bash
npm run start
```

Visit `http://localhost:9000/api/docs` to access the API documentation.

## API Endpoints

Explore the API endpoints and documentation by visiting `http://localhost:3000/api/docs` after starting the backend server.

## WebSocket Integration

Real-time communication is achieved through WebSocket integration. WebSocket connections are established at `ws://localhost:3000`.


## Contributing

Contributions and feedback are welcome! Feel free to open issues, submit pull requests, or reach out with suggestions for improvement.

## License

This project is licensed under the [MIT License](LICENSE).
