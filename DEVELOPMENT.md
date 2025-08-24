# Development Guide

This guide will help you set up and run the Doni Logistics application for development.

## Prerequisites

- **Java 17** or higher
- **Node.js 16** or higher
- **Maven** or **Gradle**
- **Git**

## Quick Start

### 1. Backend Setup (Spring Boot)

```bash
# Navigate to the project root
cd donilogistics

# Build the project
./gradlew build

# Run the application
./gradlew bootRun
```

The backend will be available at: `http://localhost:8080`

### 2. Frontend Setup (React)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at: `http://localhost:3000`

## Database Configuration

### Development (H2)
The application uses H2 database for development by default. No additional setup required.

### Production (PostgreSQL)
1. Install PostgreSQL
2. Create a database
3. Update `application.properties` with your database credentials

## API Documentation

Once the backend is running, you can access:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **API Docs**: `http://localhost:8080/v3/api-docs`

## Testing

### Backend Tests
```bash
./gradlew test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Building for Production

### Backend
```bash
./gradlew build
```

### Frontend
```bash
cd frontend
npm run build
```

## Docker Support

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `application.properties`
2. **Database connection issues**: Check your database configuration
3. **Frontend build errors**: Clear node_modules and reinstall

### Getting Help

- Check the [Issues](https://github.com/MusehailuDev/donilogistics/issues) page
- Create a new issue with detailed information
- Join our development discussions

Happy coding! 🚀
