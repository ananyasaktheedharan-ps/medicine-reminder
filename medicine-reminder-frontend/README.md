# MedicineReminder – Frontend

A web-based medicine management system that helps users schedule, track and manage their
medications, with reminders and optional family/caregiver support.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Apollo Client (GraphQL) · Docker · GitHub Actions · Kubernetes manifests

## Features

- Registration & login (with form validation and error handling)
- Add / edit / delete medicines (dosage, form, multiple daily times, start/end dates, notes)
- Daily schedule with date navigation
- Mark doses **Taken / Missed / Snoozed** (snooze 10 min), with undo
- Browser notifications when a dose is due
- Adherence tracking (7 / 30 days) with daily breakdown
- Family / caregiver profiles – switch the active profile from the sidebar and manage their medicines
- Alerts page for due, overdue, snoozed and missed doses
- Responsive layout (mobile + desktop), 404 and error pages

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

> The frontend runs stand-alone. Accounts and data are stored in the browser (`localStorage`)
> in `lib/store.tsx`. GraphQL operations for the NestJS backend are already defined in
> `lib/graphql.ts` (Apollo Client, JWT in `Authorization` header). To connect the backend, set
> `NEXT_PUBLIC_GRAPHQL_URL` and replace the store actions with these operations.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run typecheck` | TypeScript check |

## Docker

```bash
docker build -t medicine-reminder-frontend .
docker run -p 3000:3000 medicine-reminder-frontend
```

## Kubernetes / Minikube

```bash
minikube start
eval $(minikube docker-env)
docker build -t medicine-reminder-frontend .
kubectl apply -f k8s/frontend.yaml
minikube service medicine-reminder-frontend
```

## CI/CD

`.github/workflows/ci.yml` installs dependencies, type-checks, builds, and builds the Docker image
on every push / pull request to `main`.

## Project structure

```
app/
  page.tsx                 landing page
  login/  register/        authentication pages
  (app)/                   authenticated area (sidebar layout)
    dashboard/ medicines/ schedule/ adherence/ family/ alerts/
components/                AppShell, DoseRow, MedicineForm, StatusBadge
lib/                       store (state + local data), graphql (Apollo), validation, dates, types
k8s/                       Kubernetes manifests
```
