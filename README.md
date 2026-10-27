# Taskly

A tiny task-tracker HTTP API written in TypeScript with `node:http` and zero
runtime dependencies. Taskly is a **demo repository for
[Splitfire](https://splitfire-one.vercel.app)**: the code is deliberately small
but has a realistic module layout (types → stores → services → routes), so
import graphs, blast radius and review context have something to chew on.

## Features

- Tasks with status, priority, assignee and free-text search
- Users with roles, unique emails and task cleanup on delete
- In-memory stores (data resets when the process restarts)
- A small notification feed for assignments and completions
- Strict TypeScript, Vitest tests and a GitHub Actions workflow

## Getting started

```bash
npm install
npm run typecheck
npm test
npm run build && npm start
```

The server listens on `http://localhost:3000` (override with `PORT`).

## API

| Method | Path           | Description                                  |
| ------ | -------------- | -------------------------------------------- |
| GET    | `/health`      | Liveness probe plus record counts            |
| GET    | `/tasks`       | List tasks (`status`, `assigneeId`, `search`)|
| POST   | `/tasks`       | Create a task                                |
| GET    | `/tasks/:id`   | Fetch one task                               |
| PATCH  | `/tasks/:id`   | Update title, description, status or assignee|
| DELETE | `/tasks/:id`   | Delete a task                                |
| GET    | `/users`       | List users                                   |
| POST   | `/users`       | Create a user                                |
| GET    | `/users/:id`   | Fetch one user                               |
| DELETE | `/users/:id`   | Delete a user and unassign their tasks       |

```bash
curl -s localhost:3000/users \
  -H 'content-type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com"}'
```

## Layout

```
src/
  types/     shared Task and User models (barrel export)
  store/     in-memory maps
  services/  business rules, validation, notifications
  routes/    HTTP handlers and response helpers
  utils/     ids, logging and validation
  server.ts  wiring
tests/       Vitest suites for services and validation
```

## License

MIT. See [LICENSE](./LICENSE).
