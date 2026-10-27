# Medicine Reminder – Backend

NestJS + GraphQL + PostgreSQL + JWT.

## Run with Docker (from the folder containing docker-compose.yml)
    docker compose up --build
GraphQL endpoint / playground: http://localhost:4000/graphql  ·  health: http://localhost:4000/health

## Run locally
    cd backend
    cp .env.example .env     # needs a running Postgres
    npm install
    npm run start:dev
    npm test

## Main operations
Mutations: register, login, createProfile, updateProfile, deleteProfile, shareProfile, unshareProfile,
createMedicine, updateMedicine, deleteMedicine, logDose
Queries: me, myProfiles, profileCaregivers, medicines, medicine, todaysDoses, doseLogs, adherence

Send `Authorization: Bearer <accessToken>` on every request except register/login.
`tzOffsetMinutes` = minutes east of UTC, i.e. `-new Date().getTimezoneOffset()` (India = 330).
