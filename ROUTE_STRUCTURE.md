# AutoCraft QA - Project Structure & Route Reference

## 📂 Source Structure (`src/`)

```
src/
├── 📄 app/                     # Next.js App Router (Pages & API)
│   ├── 📄 page.tsx             # 🏠 Home (Create Project UI)
│   ├── 📄 layout.tsx           # Root Layout (Fonts, Metadata)
│   ├── 📂 projects/
│   │   └── 📂 [id]/
│   │       └── 📄 page.tsx     # 📊 Project Dashboard (The Main "Stepper" UI)
│   │
│   └── 📂 api/                 # Backend API Routes
│       └── 📂 projects/
│           ├── 📄 route.ts     # POST /api/projects (Create), GET /api/projects (List)
│           └── 📂 [id]/
│               ├── 📄 route.ts # GET /api/projects/:id (Get Project Details)
│               ├── 📂 ingest/
│               │   └── 📄 route.ts # POST .../ingest (Upload Raw Asset)
│               ├── 📂 dou/
│               │   └── 📄 route.ts # POST .../dou (Generate/Approve DOU)
│               ├── 📂 rtm/
│               │   └── 📄 route.ts # POST .../rtm (Generate RTM)
│               ├── 📂 scenarios/
│               │   └── 📄 route.ts # POST .../scenarios (Generate Scenarios)
│               ├── 📂 cases/
│               │   └── 📄 route.ts # POST .../cases (Generate Test Cases)
│               └── 📂 automated-tests/
│                   └── 📄 route.ts # POST .../automated-tests (Generate Code)
│
├── 📂 components/              # React Components
│   ├── 📄 RTMView.tsx          # Visualization for RTM & Scenarios
│   ├── 📄 MarkdownRenderer.tsx # Safe Markdown Rendering (DOMPurify)
│   └── ...
│
├── 📂 lib/                     # Core Business Logic
│   ├── 📂 db/                  # Database Access
│   │   └── 📄 db.ts            # Prisma Client Instance
│   ├── 📂 services/            # Service Layer (Business Logic)
│   │   ├── 📄 projectService.ts # Project State Manager
│   │   └── 📄 aiService.ts      # AI Integration (OpenAI/Mock)
│   ├── 📄 prompts.ts           # Centralized AI Prompts
│   └── 📄 env.ts               # Env Var Validation
│
└── 📂 prisma/                  # Database
    ├── 📄 schema.prisma        # Data Models
    └── 📂 migrations/          # SQLite Migrations
```

## 🛤️ Database Models (Quick Ref)
- **Project**: The root container.
- **RawAsset**: User inputs (Requirements).
- **DOU**: Document of Understanding (AI Analyst).
- **RTMItem**: Requirements Traceability Matrix items (AI Architect).
- **TestScenario**: High-level test scenarios (AI Engineer).
- **TestCase**: Detailed manual test steps.
- **AutomatedTest**: Playwright/TypeScript code.
