# RealCo OS (Body)

This is the custom Next.js/React web application for RealCo OS (Reims).

## Architecture
- **Factory**: Google Antigravity (Agents & Logic)
- **Brain**: Databricks (Market Truth & Signals)
- **Body**: Custom Web App (This project)

## Core OS Modules
The system logic is organized into 7 Core Modules:
1. **The Authority** (`src/lib/os/authority`): Governance & Integrity Control.
2. **The Harvester** (`src/lib/os/harvester`): Project & Content Discovery.
3. **The Truth Engine** (`src/lib/os/truth-engine`): Data & Identity Resolution.
4. **The Analyst** (`src/lib/os/analyst`): Market & Area Intelligence.
5. **The Matchmaker** (`src/lib/os/matchmaker`): Seller & Buyer Intelligence.
6. **The Strategist** (`src/lib/os/strategist`): Agent Copilot & Decision Support.
7. **The Optimizer** (`src/lib/os/optimizer`): Monitoring & Learning.

## V1 UI Scope
- **Screen A**: Unit Search & Truth Cards (`src/app/inventory`)
- **Screen B**: Market Area Dashboards (`src/app/market`)

## Phase 4: Core OS & Canonical Memory
The system now implements the foundational lifecycle logic:
- **Canonical Memory**: Operational Postgres database for storing decisions and identity links. Only IDs and resolution events are stored; raw market data resides in Databricks.
- **Governance Gate**: The `validate_and_record_decision` gateway enforces the "No Specs in DB" doctrine and ensures append-only integrity.
- **Decision Engine**: Pure functions for unit and contact resolution using the trust hierarchy (DLD > CRM).
- **Unresolved Queue**: Automated handling of data conflicts or missing identifiers via the `UnresolvedItem` queue.

## Getting Started
1. Configure `.env` with Databricks and Postgres credentials.
2. Run `npm install`.
3. Generate Prisma client: `npx prisma generate`.
4. Start development server: `npm run dev`.
5. Run schema discovery: `npm run schema:map`.
6. Verify market sources: `npm run sources:verify`.
7. Run query smoke tests: `npm run queries:smoke`.
