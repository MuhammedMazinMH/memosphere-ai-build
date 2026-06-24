# MemoSphere AI

An intelligent learning platform that transforms documents into personalized knowledge graphs, tracks learning progress, and provides real-time coaching recommendations powered by AI-driven analytics.

## Overview

MemoSphere AI is a full-stack learning management system designed to help students optimize their study habits through data-driven insights and intelligent coaching. The platform ingests educational documents, generates knowledge graphs, tracks quiz performance, and delivers personalized recommendations based on learner patterns.

**Key Differentiator:** All metrics and analytics are computed deterministically from real user data — no mock fallbacks, no fabricated scores. The system provides honest, reproducible insights into learner progress.

## Features

### Core Learning System

- **Document Management** — Upload and organize PDF study materials with automatic text extraction and metadata tagging. Currently optimized for PDF-based knowledge extraction; additional formats such as DOCX, PPTX, images, and multimedia sources are planned for future releases.
- **Knowledge Graph Generation** — AI-powered extraction of concepts and relationships from documents; stored snapshots ensure reproducible graph state
- **Concept Tracking** — Per-user concept mastery monitoring with status tracking (untouched, partial, mastered, overcovered)

### Analytics & Insights

- **Study Dashboard** — Real-time metrics including:
  - Document library status
  - Study activity timeline
  - Knowledge growth visualization
  - Learning streak tracking
  - Concept mastery by subject

- **Exam Readiness Assessment** — Per-subject readiness scores derived from:
  - Concept coverage (% of concepts studied per subject)
  - Accuracy (quiz performance on subject concepts)
  - Consistency (study frequency and recency)
  - Confidence (self-assessment during quizzes)

- **Learning Gaps Detection** — Identifies uncovered or weak areas within tracked concepts; filtered by mastery status (missing, partial, mastered)

- **AI Learning Coach** — Personalized recommendations including:
  - Next recommended topic (based on gap analysis and difficulty progression)
  - Weak areas requiring focus
  - Knowledge gaps to address
  - Suggested study path
  - Predicted exam readiness if following recommendations

### Quiz & Assessment

- **Dynamic Quiz Generation** — AI-powered quiz generation from document concepts with configurable question counts
- **Attempt Tracking** — Persistent quiz attempt storage with score recording (enables deterministic readiness metrics)
- **Subject-Based Organization** — Quizzes grouped by subject for targeted assessment

### Real-Time Notifications

- **Event-Driven Alerts** — Automatic notifications on:
  - Document uploads
  - Knowledge graph generation
  - Quiz completion
- **Notification Center** — Inbox-style notification panel with read/unread tracking and timestamp history

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS v4 with semantic design tokens
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **State Management:** SWR for data fetching and client-side caching
- **Auth UI:** Clerk (multi-tenant authentication)

### Backend
- **Runtime:** Next.js API Routes (serverless)
- **Database:** AWS DynamoDB (NoSQL) with @aws-sdk/client-dynamodb
- **File Storage:** AWS S3 via Vercel Blob
- **Authentication:** Clerk (JWT sessions)
- **AI/LLM:** Vercel AI Gateway (provider-agnostic model access)

### Infrastructure
- **Hosting:** Vercel (auto-deploy on Git push to `main`)
- **Git:** GitHub repository integration
- **Monitoring:** Console logging for debugging; structured error handling

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Git
- GitHub account (for repository cloning)
- AWS credentials (DynamoDB + S3) configured via Vercel integration
- Clerk API keys (authentication)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MuhammedMazinMH/memosphere-ai-build.git
   cd memosphere-ai-build
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret

   # AWS Configuration (DynamoDB + S3)
   AWS_REGION=us-east-1
   AWS_DYNAMODB_TABLE_PREFIX=memosphere_
   AWS_S3_BUCKET=your-s3-bucket
   AWS_S3_REGION=us-east-1

   # AI Model (Vercel AI Gateway)
   AI_GATEWAY_API_KEY=your_api_key  # Optional; zero-config for OpenAI/Claude
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
memosphere-ai-build/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Main dashboard routes
│   │   ├── page.tsx            # Overview dashboard
│   │   ├── gaps/               # Learning gaps view
│   │   ├── exam-readiness/     # Exam readiness assessment
│   │   ├── ai-coach/           # AI coaching recommendations
│   │   └── knowledge-graph/    # KG visualization
│   ├── api/                     # Backend API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── documents/          # Document CRUD
│   │   ├── knowledge-graph/    # KG generation & retrieval
│   │   ├── quizzes/            # Quiz creation & attempt tracking
│   │   ├── recommendations/    # Personalized coaching
│   │   ├── learning-gaps/      # Gap detection
│   │   ├── exam-readiness/     # Readiness calculation
│   │   └── notifications/      # Notification retrieval
│   └── layout.tsx              # Root layout with auth
├── components/
│   └── dashboard/              # Dashboard UI components
│       ├── upload-dialog.tsx    # Document upload
│       ├── knowledge-graph-view.tsx    # Graph visualization
│       ├── quiz-generator-view.tsx     # Quiz interface
│       ├── learning-gaps-view.tsx      # Gaps dashboard
│       ├── exam-readiness-view.tsx     # Readiness panel
│       ├── ai-coach-view.tsx           # Coaching recommendations
│       ├── notification-bell.tsx       # Notification panel
│       └── ...other dashboard components
├── db/                         # Database layer
│   ├── client.ts               # DynamoDB client setup
│   ├── repositories/           # Data access layer
│   │   ├── concept-repository.ts       # Concept queries (per-user snapshots)
│   │   ├── document-repository.ts      # Document CRUD
│   │   ├── quiz-repository.ts          # Quiz & attempts
│   │   ├── notification-repository.ts  # Notifications
│   │   └── knowledge-graph-repository.ts # KG snapshots
│   └── tables.ts               # Table schema definitions
├── lib/
│   ├── services/               # Business logic layer
│   │   ├── ai/                 # AI provider integration
│   │   ├── metrics/            # Analytics calculators
│   │   ├── recommendations/    # Coaching engine
│   │   ├── learning-gaps/      # Gap detection
│   │   ���── exam-readiness/     # Readiness scoring
│   │   └── ...other services
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
├── public/                     # Static assets
├── config/
│   └── env.ts                  # Environment configuration
├── styles/
│   └── globals.css             # Global styles & Tailwind
└── package.json                # Dependencies
```

## Architecture & Data Flow

### Document Upload → Knowledge Graph
1. **Upload** — User uploads a PDF; `POST /api/upload` stores file in S3
2. **Extract** — Backend extracts text from document
3. **Process** — Metadata (title, subject) tagged
4. **Store** — Document row created in `documents` DynamoDB table
5. **Notify** — `document_uploaded` notification persisted

### Knowledge Graph Generation
1. **Trigger** — `POST /api/knowledge-graph` processes all user documents
2. **AI Extract** — Vercel AI Gateway extracts concepts and relationships
3. **Normalize** — Schema validation & enum normalization
4. **Persist** — Last-good snapshot stored in `knowledgeGraphNodes` table (key: `lastgood#<userId>`)
5. **Dedupe** — Notification only emitted if concept count changed from previous snapshot
6. **Notify** — `graph_generated` notification for significant updates

### Metrics Computation (Deterministic)
- **Learning Gaps** — Reads user's concept snapshot; maps each concept to gap status (missing/partial/mastered)
- **Exam Readiness** — Groups concepts by subject; computes coverage/accuracy/consistency/confidence per subject
- **Recommendations** — Derives next topic (lowest mastery), weak areas, study path from real gap data
- **All calculations** are deterministic — same input always produces same output; no randomization

### Authentication & Authorization
- **Clerk JWT** — User authenticated via Clerk; JWT token embedded in `Authorization` header
- **Per-User Scoping** — Every API endpoint extracts `userId` from JWT and filters/scopes all data by that user
- **No Public Data** — All tables use `userId` as partition key or filter; no cross-user data leakage

## Key Design Decisions

### No Mock Fallbacks
- The runtime contains zero mock data fallbacks. When AI generation fails or no data exists, the system returns empty states rather than seed data.
- This ensures every displayed metric is either user-generated or the system is honest about the absence of data.

### Deterministic Metrics
- All analytics (gaps, readiness, recommendations) are computed deterministically from real user data, not AI-generated scores.
- AI is used **only** for coaching prose (the "reason" field in recommendations), never for metric values.

### Per-User Snapshots
- Knowledge graphs are stored as per-user snapshots in `knowledgeGraphNodes` table with key `lastgood#<userId>`.
- Metric services read concepts from these snapshots, ensuring only the user's own AI-generated concepts feed analytics.
- Seeded mock data in the DynamoDB tables is automatically excluded because it lacks a matching `lastgood#<userId>` key.

### Real-Time Notifications
- Notifications are persisted to the `notifications` DynamoDB table on document upload, quiz completion, and graph generation.
- Notification center (frontend) fetches `GET /api/notifications` and renders a paginated, timestamped inbox.
- No client-side-only notifications; all events are durable and survive page refreshes.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key for frontend auth | Yes |
| `CLERK_SECRET_KEY` | Clerk secret for backend JWT verification | Yes |
| `AWS_REGION` | AWS region for DynamoDB/S3 (e.g., `us-east-1`) | Yes |
| `AWS_DYNAMODB_TABLE_PREFIX` | DynamoDB table name prefix (e.g., `memosphere_`) | Yes |
| `AWS_S3_BUCKET` | S3 bucket name for document storage | Yes |
| `AWS_S3_REGION` | S3 region | Yes |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key (optional; defaults to free tier) | No* |

*Zero-config support for OpenAI, Claude, and other providers via Vercel AI Gateway.

## Development

### Running Tests
```bash
pnpm test
# or
npm test
```

### Linting & Type Checking
```bash
pnpm lint
pnpm type-check
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Debugging
The application includes debug logging via `console.log("[v0] ...")` statements throughout critical paths. Enable browser DevTools to inspect execution flow and variable states during development.

## Deployment

### Automatic Deployment (Recommended)
This repository is connected to Vercel. Every push to the `main` branch automatically triggers a build and deployment:
1. Push changes to `main` branch
2. Vercel CI/CD pipeline builds the project
3. Deployed to production on successful build
4. All environment variables configured in Vercel project settings

### Manual Deployment
```bash
pnpm build
# Deploy to your hosting platform (e.g., Vercel CLI, Docker, etc.)
```

## API Endpoints

### Core Endpoints
- `GET /api/documents` — List user documents
- `POST /api/upload` — Upload and process document
- `POST /api/knowledge-graph` — Generate KG from documents
- `GET /api/concepts` — List user's concepts from last-good KG snapshot
- `POST /api/quizzes` — Generate quiz from concepts
- `PATCH /api/quizzes` — Record quiz attempt
- `GET /api/recommendations` — Personalized coaching recommendations
- `GET /api/learning-gaps` — Learning gaps analysis
- `GET /api/exam-readiness` — Exam readiness by subject
- `GET /api/notifications` — Notification history

All endpoints require Clerk JWT authentication via `Authorization: Bearer <token>`.

## Contributing

1. **Create a feature branch:** `git checkout -b feature/your-feature`
2. **Make changes** following the existing code patterns
3. **Test locally:** `pnpm dev` and verify functionality
4. **Commit:** `git commit -am "Add your feature"`
5. **Push:** `git push origin feature/your-feature`
6. **Open PR** against `main` branch
7. **Wait for review and CI checks**

## Universal Search

MemoSphere AI includes a powerful search feature enabling learners to:
- Search across all uploaded documents and their extracted concepts
- Filter results by document, subject, or mastery status
- Find related concepts and their relationships within the knowledge graph
- Access search history and save frequent searches for quick reference

## Future Roadmap

### Q1 2026
- [ ] Collaborative study groups with shared knowledge graphs
- [ ] Advanced search with NLP-powered semantic search
- [ ] Study session analytics and focus time tracking
- [ ] Export progress reports as PDF/JSON

### Q2 2026
- [ ] Additional document format support (DOCX, PPTX, images, audio, video)
- [ ] Mobile app (iOS/Android) with offline PDF support
- [ ] Spaced repetition algorithm for optimal review scheduling
- [ ] Multi-language support for global learners
- [ ] Integration with major learning platforms (Coursera, Udemy, etc.)

### Q3 2026
- [ ] Peer learning marketplace for tutors and students
- [ ] Real-time collaboration during study sessions
- [ ] AI-generated study guides and summaries
- [ ] Advanced graph analytics for concept relationship strength

### Q4 2026
- [ ] Enterprise licenses for educational institutions
- [ ] API for third-party integrations
- [ ] Advanced role-based access control (RBAC)
- [ ] Data warehouse and BI dashboard for institutional insights

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

Copyright © 2026 Muhammed Mazin MH

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

## Support & Contact

For issues, questions, or feature requests:
- Open an issue on the [GitHub repository](https://github.com/MuhammedMazinMH/memosphere-ai-build)

---

**Built with:** Next.js 16 • React 19 • Tailwind CSS • AWS • Vercel • Clerk • AI SDK

**Repository:** [MuhammedMazinMH/memosphere-ai-build](https://github.com/MuhammedMazinMH/memosphere-ai-build)
