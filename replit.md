# Overview

This is a fintech AI proof-of-concept application for car valuation and loan analysis. The application allows users to input their vehicle details (make, model, year, mileage, ZIP code) and receive real-time market valuations through the Edmunds API integration. The system calculates potential loan amounts based on loan-to-value ratios and provides comprehensive valuation reports including trade-in, private party, and retail values.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built as a React single-page application using TypeScript and modern React patterns:

- **Framework**: React with TypeScript, using Vite as the build tool and development server
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management and API caching
- **UI Framework**: Radix UI components with shadcn/ui design system for consistent, accessible interface components
- **Styling**: Tailwind CSS with CSS custom properties for theming support (light/dark modes)
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
The backend follows an Express.js REST API pattern with TypeScript:

- **Framework**: Express.js with TypeScript for API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage Strategy**: Dual storage implementation - in-memory storage for development/testing and PostgreSQL for production
- **API Design**: RESTful endpoints with consistent error handling and request/response logging middleware
- **Build Strategy**: ESBuild for production bundling with Node.js ESM modules

## Data Storage Solutions
The application uses a flexible storage architecture:

- **Primary Database**: PostgreSQL with Drizzle ORM providing type-safe queries and migrations
- **Schema Management**: Centralized schema definitions in shared directory with Zod validation
- **Development Storage**: In-memory storage implementation for rapid development and testing
- **Database Configuration**: Environment-based database URL configuration with connection pooling

## Authentication and Authorization
Currently implementing a basic authentication foundation:

- **User Management**: User table with username/password authentication
- **Session Handling**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Request Context**: Session-based request context for user identification

## External Service Integrations
The application integrates with external APIs for vehicle data:

- **Edmunds API**: Primary integration for real-time vehicle valuations, providing True Market Value (TMV) data including trade-in, private party, and retail values
- **API Configuration**: Environment variable-based API key management with fallback support for multiple environment variable names
- **Error Handling**: Comprehensive error handling for API failures, authentication issues, and vehicle data not found scenarios
- **Rate Limiting**: Built-in respect for API rate limits and proper HTTP status code handling

## Development and Build Pipeline
The project uses a modern development setup optimized for full-stack TypeScript development:

- **Development Server**: Vite development server with HMR for frontend, tsx for backend development
- **Production Build**: Separate build processes for frontend (Vite) and backend (ESBuild)
- **Type Safety**: Shared TypeScript types between frontend and backend through shared schema definitions
- **Database Migrations**: Drizzle Kit for database schema migrations and management
- **Environment Configuration**: Comprehensive environment variable support for different deployment scenarios