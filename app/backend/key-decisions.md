# Key Decisions - OrderSapp Backend

This document outlines the architectural and design decisions made during the development of the OrderSapp backend.

## Instructions

- This document serves as a record of key technical decisions and their justifications.
- All entries must be documented in English.
- Future additions should maintain clear grammar and descriptive explanations.

## 1. ORM and Migrations (Drizzle ORM)

We selected **Drizzle ORM** to ensure type safety and high performance. The migration workflow follows a "SQL-first" approach:

- SQL migrations are generated or written manually.
- A "pull" strategy is used to synchronize the schema, ensuring the application code remains aligned with the database structure.

## 2. Modular Architecture

The codebase has been organized into a **modular architecture**. This is the recommended approach for improved maintainability and scalability, as it allows each domain (Clients, Products, Orders) to manage its own logic, schemas, and routing independently.

## 3. Database as a Fastify Plugin

The database connection is exposed via a **Fastify plugin**. This pattern allows the database instance to be accessed globally throughout the application as `fastify.db`, facilitating cleaner dependency injection.

## 4. Testing Strategy

We employ a multi-layered testing strategy:

- **Service Testing**: Unit tests focused on business logic.
- **Integration Testing**: Testing the full request/response lifecycle through the routes to ensure all components (controllers, services, and database) work together correctly.

## 5. Error Handling Patterns

We follow a standardized error handling flow between the Service and Route layers:

### Data Fetching

- **Services**: Methods designed to retrieve data (e.g., `getClientByPhone`) return the object if found, or `null` otherwise.
- **Routes**: The route handler checks for `null` results and is responsible for throwing a `NotFoundError`, which is then processed by the global error handler.

### Data Mutation (Create/Update)

- **Services**: Services encapsulate database constraint logic. For example, when creating a client, the service catches Postgres error `23505` (Unique Violation) and throws a specific application error (e.g., `CLIENT_EXISTS`).
- **Rationale**: Services handle the "why" of the failure (e.g., duplication), while the controller layer decides "how" to respond to the user (e.g., returning a 409 Conflict status).

## 6. Request and Response Validation (Zod)

We use **Zod** for schema definition and validation of both requests and responses.

- **Automated Validation**: Instead of manual checks in the route handlers, Zod schemas are integrated with Fastify to automatically validate incoming data (body, params, query) and outgoing responses.
- **Type Safety**: Zod schemas serve as the source of truth for TypeScript types, ensuring consistency between validation logic and the code's type system.
- **Security**: Response validation ensures that sensitive data is not inadvertently exposed by filtering the returned objects based on the defined schema.
