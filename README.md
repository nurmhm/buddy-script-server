# SCRIPTBUDDY Backend

A production-ready Express.js backend application built with TypeScript, following FAANG-level best practices.

## 🏗️ Architecture

This project follows a clean, layered architecture optimized for Prisma:

```
src/
├── api/
│   └── v1/
│       ├── controllers/    # Request handlers
│       ├── routes/         # Route definitions
│       └── validators/     # Request validation (Zod schemas)
├── config/                # Configuration files
├── infrastructure/        # External services
│   ├── database/         # Prisma connection
│   ├── cache/           # Redis cache service
├── middleware/           # Express middlewares
├── services/            # Business logic (uses Prisma directly)
├── utils/              # Utility functions
├── types/              # TypeScript types
├── constants/          # Application constants
└── lib/                # Third-party library wrappers

Note: No repositories/, models/, or dtos/ folders!
- Prisma Client = Type-safe repository layer
- Prisma Types = Auto-generated models
- Zod Validators = Input DTOs
```

## 🚀 Features

- ✅ **TypeScript** - Type safety and better developer experience
- ✅ **Express.js** - Fast, unopinionated web framework
- ✅ **Prisma ORM** - Type-safe database access
- ✅ **Redis** - Production caching with real Redis implementation
- ✅ **JWT Authentication** - Secure token-based auth with refresh tokens
- ✅ **Validation** - Request validation with Zod
- ✅ **Error Handling** - Centralized error handling
- ✅ **Logging** - Structured logging with Winston
- ✅ **Rate Limiting** - API rate limiting
- ✅ **Security** - Helmet, CORS, and security best practices
- ✅ **Testing** - Vitest for unit and integration tests
- ✅ **Code Quality** - ESLint, Prettier, Husky

## 📋 Prerequisites

- Node.js >= 18.x
- pnpm >= 8.x
- PostgreSQL >= 14.x
- Redis >= 6.x
- MinIO (for object storage)

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Set up the database:

```bash
pnpm migrate-dev
```

6. Seed the database (optional):

```bash
pnpm dev-seed
```

## 🏃 Running the Application

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 📁 Project Structure Details

### API Layer (`src/api/v1`)

- **Controllers**: Handle HTTP requests and responses
- **Routes**: Define API endpoints and middleware
- **Validators**: Validate incoming requests using Zod schemas
- **DTOs**: Define data transfer objects for type safety

### Service Layer (`src/services`)

- Contains business logic
- Orchestrates data from repositories
- Independent of HTTP layer

### Repository Layer (`src/repositories`)

- Data access layer
- Abstracts database operations
- Uses Prisma for type-safe queries

### Infrastructure Layer (`src/infrastructure`)

- External service integrations
- Database, cache
- Easy to mock for testing

### Middleware (`src/middleware`)

- Authentication
- Validation
- Error handling
- Rate limiting
- Request logging

## 🔑 Environment Variables

See `.env.example` for all required environment variables.


## 📝 API Documentation

### Authentication Endpoints

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### User Endpoints

#### Get Current User

```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation with Zod



