# Edviron SDE1 Assignment – Task 1 Backend

Backend service for the **payments analysis dashboard** for schools, built with **NestJS + TypeScript + PostgreSQL**.

## Features

- JWT-based authentication
- Roles: `SUPER_ADMIN`, `SCHOOL_ADMIN`, `ACCOUNTANT`, `DEVELOPER`
- Entities:
  - `Student`
  - `FeeBill`
  - `Transaction`
  - `User`
- Reports API:
  - `GET /reports/summary` – total expected, collected, pending, grouped by payment method and class
- Transactions API:
  - `GET /transactions` – paginated, filterable
  - `POST /transactions` – record a new transaction
- Basic role- and field-level access control
- Seed script to create:
  - SUPER_ADMIN user: `admin@edviron.local / Admin@123`
  - Demo students, fee bills, and transactions

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set values:

```bash
cp .env.example .env
```

Ensure you have a **PostgreSQL** instance running and that:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`

point to a valid database.

### 3. Run migrations / sync

For this assignment, TypeORM is configured with `synchronize: true`, so tables will be created automatically on startup and in the seed script.

### 4. Seed data

```bash
npm run seed
```

This will:

- Create a SUPER_ADMIN user
- Insert 2 students
- Insert 2 fee bills
- Insert 2 successful transactions

### 5. Run the server (dev)

```bash
npm run start:dev
```

Server will listen on `http://localhost:3000`.

### 6. Verify APIs

1. **Login**

   `POST /auth/login`

   ```json
   {
     "email": "admin@edviron.local",
     "password": "Admin@123"
   }
   ```

   Response:

   ```json
   {
     "accessToken": "JWT_TOKEN_HERE",
     "user": {
       "id": "...",
       "email": "admin@edviron.local",
       "role": "SUPER_ADMIN",
       "schoolId": null
     }
   }
   ```

2. **Get summary report**

   `GET /reports/summary` with `Authorization: Bearer <token>` header.

   Example: `GET /reports/summary?from=2025-01-01&to=2025-12-31`

3. **List transactions**

   `GET /transactions?limit=10&page=1` with bearer token.

   You should see the seeded transactions.

## Role & Field-Level Access

- `SUPER_ADMIN`:
  - Can see all schools and all fields.
- `SCHOOL_ADMIN`:
  - Restricted to their `schoolId` (in this skeleton, use the same demo ID in seed or extend users).
- `ACCOUNTANT`:
  - Same as SCHOOL_ADMIN but failure reasons in transactions are hidden by the field filter interceptor.
- `DEVELOPER`:
  - Can see failure reasons for transactions, but student PII (phone, email) is stripped.

Logic is implemented in `src/common/interceptors/field-filter.interceptor.ts`.

## How to Verify the Implementation is OK

1. **Code compiles and server runs**

   ```bash
   npm install
   npm run start:dev
   ```

   - No TypeScript errors.
   - No runtime errors in console.
   - `Server running on http://localhost:3000`.

2. **Database tables get created**

   - Open your Postgres client and confirm tables:
     - `users`
     - `students`
     - `fee_bills`
     - `transactions`

3. **Seed script works**

   ```bash
   npm run seed
   ```

   - No errors.
   - `SELECT * FROM users;` should show `admin@edviron.local`.
   - `SELECT * FROM students;` / `fee_bills;` / `transactions;` should return some demo rows.

4. **Auth flow works**

   - `POST /auth/login` with admin credentials returns a JWT.
   - Subsequent calls with `Authorization: Bearer <token>` to `/reports/summary` and `/transactions` succeed.

5. **Reports data looks consistent**

   - `/reports/summary` returns:
     - `total_fees_expected` ≈ sum of demo fee bills.
     - `total_fees_collected` ≈ sum of successful transactions.
     - `total_pending = expected - collected`.

6. **Role-based access**

   - You can add more users with different roles in DB and verify:
     - ACCOUNTANT cannot see `failure_reason` in transaction responses.
     - DEVELOPER cannot see student `phone` and `email`.

If all of the above checks pass, the backend is structurally correct and logically satisfies Task 1 requirements.

## Production & Scaling Notes (for write-up)

- Use **RDS PostgreSQL** (AWS) with:
  - Indexes on `transactions(status, payment_method, processed_at)` and `students(school_id)`.
- Use **ECS/EKS** or other container orchestration with:
  - This app image and horizontal autoscaling.
- Pre-aggregate daily summaries into a separate table for instant dashboard loads at very large scale.
- For large exports, use async jobs and object storage (e.g., S3) instead of on-the-fly generation.
