
# Emergency Dispatch System

An Uber-like emergency dispatch system for ambulance, fire service, and police, built with modern Java and Spring Boot. Designed for scalability, modularity, and professional software engineering practices.

MOBILE : https://fanciness-vividness-elevate.ngrok-free.dev

## Project Status
Active development.

## Technology Stack
- **Java:** 25
- **Spring Boot:** 4.0.5
- **Gradle:** 9.4.1

## Project Structure
- **backend/**: Spring Boot application (REST API, business logic, security, data access)
- **frontend/**: React application (user interface)

### Backend Highlights
- Modular service domains: ambulance, fire, police
- Core dispatch and assignment logic
- User authentication and management
- Shared utilities and configuration

## Getting Started

### Prerequisites
- Java 25
- Gradle 9.4.1 (wrapper included)
- Node.js (for frontend)

### Backend Setup
1. Navigate to the `backend/` directory.
2. Build and run the application:
	```sh
	./gradlew bootRun
	```
3. Configure `src/main/resources/application.yml` for your database and environment settings.

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
	```sh
	npm install
	```
3. Start the development server:
	```sh
	npm run dev
	```

## Directory Layout
See the repository structure for details on backend and frontend organization.

## License
[Specify license here]
