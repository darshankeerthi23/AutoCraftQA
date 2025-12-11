This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

========================================================
AutoCraft MVP Walkthrough
========================================================
Overview
AutoCraft is an autonomous QA requirements-to-test lifecycle tool. Stack: Next.js 15, Prisma (SQLite), Tailwind, Zod, DOMPurify.

Authentication & Security
Fail Fast: App crashes if OPENAI_API_KEY is missing.
Sanitization: All AI-generated Markdown is sanitized via DOMPurify before rendering.
Validation: All API endpoints enforce strict Zod schemas.
The Lifecycle Flow
1. Ingestion
Users create a project and upload raw requirements (Text, Meeting Notes).

Verify: POST /api/projects/:id/ingest accepts content.
2. Analysis (DOU)
The AI Analyst aggregates assets and generates a Document of Understanding.

Verify: Click "Generate DOU". View secure Markdown output.
Approval: Logic gate prevents downstream generation until user clicks "Approve DOU".
3. Architecture (RTM)
The AI Architect converts the approved DOU into a Traceability Matrix.

Verify: RTM items appear in the dashboard.
4. Engineering (Scenarios -> Cases -> Scripts)
The AI Engineer allows granular generation:

RTM -> Test Scenarios
Scenario -> Test Cases
Test Case -> Playwright Script (TypeScript)
How to Run
npm install
npx prisma migrate dev
npm run dev
Go to http://localhost:3000
