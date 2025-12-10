# Mysterious Web Site

This project is a full-stack application with a React client, Spring Boot server, and PostgreSQL database, all containerized with Docker.

## Prerequisites

-   Docker
-   Docker Compose

## How to Launch

1.  Open your terminal in the project root directory.
2.  Run the following command to build and start the application:

```bash
docker-compose up --build
```

3.  Wait for the containers to start. The initial build might take a few minutes.

## Accessing the Application

-   **Client Application**: [http://localhost](http://localhost)
-   **API Server**: [http://localhost:8080](http://localhost:8080)

## Database Information

The application uses a PostgreSQL database.

-   **Database Name**: `messagewall`
-   **User**: `postgres`
-   **Password**: `postgres`
-   **Port**: `5432` (mapped to host)

## Troubleshooting

If you encounter issues, try stopping the containers and removing volumes before rebuilding:

```bash
docker-compose down -v
docker-compose up --build
```
