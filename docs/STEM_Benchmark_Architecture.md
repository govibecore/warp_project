# STEM Benchmark Platform - Comprehensive Technical Architecture

## Executive Summary

This document defines the complete technical architecture for the STEM Benchmark Platform, an interactive assessment system for Class 3–12 students in India. The platform benchmarks students against global peers, generates AI-powered comprehensive reports, and maintains persistent student records via a secure backend with MongoDB.

---

## 1. System Architecture Overview

### 1.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   React 19   │  │  GSAP/Motion │  │  Lottie-Web  │  │   Recharts   │   │
│  │   Vite 6     │  │   Animations │  │   JSON Anim  │  │   Charts     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Tailwind v4  │  │  shadcn/ui   │  │  html2pdf    │  │  React Query │   │
│  │  Styling     │  │  Components  │  │    jsPDF     │  │   Data Fetch │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS / JSON
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│                         (Express.js / Fastify)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Middleware Stack:                                                  │    │
│  │  • Rate Limiting (express-rate-limit)                              │    │
│  │  • CORS Configuration                                               │    │
│  │  • Helmet Security Headers                                          │    │
│  │  • Request Validation (Zod)                                         │    │
│  │  • JWT Authentication Verification                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌───────────────────────┐ ┌───────────────┐ ┌───────────────────────┐
│    AUTH SERVICE       │ │   AI SERVICE  │ │   REPORT SERVICE      │
│  (JWT + bcrypt)       │ │ (OpenRouter / │ │  (PDF Generation +    │
│  • Register           │ │  NVIDIA NIM)  │ │   Report Compilation) │
│  • Login              │ │  • LLM Prompt │ │  • Score Aggregation  │
│  • Password Reset     │ │  • Streaming  │ │  • Percentile Calc    │
│  • Token Refresh      │ │  • Caching    │ │  • PDF Export         │
└───────────────────────┘ └───────────────┘ └───────────────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER (MongoDB)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  students       │  │  assessments    │  │  reports        │             │
│  │  (auth + profile)│  │  (sessions +    │  │  (AI-generated  │             │
│  │                 │  │   responses)    │  │   + snapshots)  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  norms          │  │  scenarios      │  │  audit_logs     │             │
│  │  (benchmarks)   │  │  (question      │  │  (security)     │             │
│  │                 │  │   blueprints)   │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 6 | UI framework & build tool |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Utility-first CSS & accessible components |
| **Animations** | GSAP + Framer Motion + Lottie | Rich interactive experiences |
| **Charts** | Recharts | Competency radar & bar charts |
| **PDF** | html2pdf.js + jsPDF + html2canvas | Client-side report generation |
| **State** | Zustand + React Query | Global state & server state management |
| **Backend** | Node.js + Express.js 5 | REST API server |
| **Database** | MongoDB 7 + Mongoose | Document-oriented data persistence |
| **Auth** | JWT (access + refresh tokens) + bcrypt | Secure authentication |
| **AI** | OpenRouter API (free tier) / NVIDIA NIM | LLM-powered report generation |
| **Cache** | Redis (optional) | Session cache & AI response caching |
| **Deploy** | Vercel (frontend) + Render/Railway (backend) | Cloud hosting |

---

## 2. MongoDB Database Schema Design

### 2.1 Collection: `students`

```javascript
const studentSchema = new mongoose.Schema({
  // Authentication
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true }, // bcrypt(12 rounds)

  // Profile
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },

  // Academic
  currentClass: { type: Number, required: true, min: 3, max: 12 },
  schoolName: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },

  // Parent/Guardian (optional but recommended)
  parentName: { type: String, trim: true },
  parentEmail: { type: String },
  parentPhone: { type: String },

  // Preferences
  difficultyPreference: { 
    type: String, 
    enum: ['standard', 'advanced', 'olympiad'], 
    default: 'standard' 
  },

  // Security
  isVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.passwordHash; return ret; } }
});

// Indexes
studentSchema.index({ email: 1 });
studentSchema.index({ createdAt: -1 });
```

### 2.2 Collection: `assessments`

```javascript
const responseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario', required: true },
  selectedOptionIndex: { type: Number, required: true, min: 0, max: 3 },
  timeSpentMs: { type: Number, default: 0 }, // Time on this question
  competencyScores: {
    scientificInquiry: Number,
    computationalThinking: Number,
    engineeringDesign: Number,
    mathematicalReasoning: Number,
    systemsThinking: Number
  }
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },

  // Session config
  classLevel: { type: Number, required: true, min: 3, max: 12 },
  difficulty: { type: String, enum: ['standard', 'advanced', 'olympiad'], required: true },

  // Progress tracking
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'abandoned', 'timed_out'], 
    default: 'in_progress',
    index: true 
  },

  // Responses (embedded for fast reads, capped at ~20 items)
  responses: [responseSchema],

  // Timing
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  totalTimeMs: { type: Number },

  // Scoring (computed on completion)
  rawScores: {
    scientificInquiry: { earned: Number, available: Number },
    computationalThinking: { earned: Number, available: Number },
    engineeringDesign: { earned: Number, available: Number },
    mathematicalReasoning: { earned: Number, available: Number },
    systemsThinking: { earned: Number, available: Number }
  },

  normalizedScores: {
    zScores: {
      scientificInquiry: Number,
      computationalThinking: Number,
      engineeringDesign: Number,
      mathematicalReasoning: Number,
      systemsThinking: Number
    },
    scaledScores: {
      scientificInquiry: Number,      // 100-900 scale
      computationalThinking: Number,
      engineeringDesign: Number,
      mathematicalReasoning: Number,
      systemsThinking: Number
    },
    globalScore: { type: Number, min: 100, max: 900 } // Composite
  },

  // Percentiles by region
  percentiles: {
    india: Number,
    singapore: Number,
    usa: Number,
    uk: Number,
    southKorea: Number,
    global: Number
  },

  // Report reference
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' }
}, { 
  timestamps: true 
});

// Compound indexes for dashboard queries
assessmentSchema.index({ studentId: 1, status: 1, createdAt: -1 });
assessmentSchema.index({ studentId: 1, createdAt: -1 });
```

### 2.3 Collection: `reports`

```javascript
const reportSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, unique: true },

  // AI-Generated Content
  aiInsights: {
    overallAssessment: { type: String, required: true },      // LLM-generated summary
    keyStrengths: [{ type: String }],
    growthAreas: [{ type: String }],
    learningPath: { type: String },                           // Recommended track
    parentGuidance: { type: String }                          // What parents should do
  },

  // Action Plan (structured for UI rendering)
  actionPlan: [{
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['course', 'project', 'practice', 'resource', 'retest'] },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    estimatedDuration: { type: String }, // e.g., "3 weeks"
    externalLink: { type: String }
  }],

  // PDF snapshot (base64 or S3 URL)
  pdfUrl: { type: String },
  pdfGeneratedAt: { type: Date },

  // Sharing (optional)
  shareToken: { type: String, unique: true, sparse: true }, // Public share link
  shareExpiresAt: { type: Date },

  // Metadata
  generatedAt: { type: Date, default: Date.now },
  aiModelUsed: { type: String, default: 'openrouter/mistral-7b' },
  promptTokens: { type: Number },
  completionTokens: { type: Number }
}, { timestamps: true });

reportSchema.index({ studentId: 1, generatedAt: -1 });
reportSchema.index({ shareToken: 1 });
```

### 2.4 Collection: `scenarios` (Question Bank)

```javascript
const evidenceContributionSchema = new mongoose.Schema({
  competency: { 
    type: String, 
    enum: ['scientificInquiry', 'computationalThinking', 'engineeringDesign', 
           'mathematicalReasoning', 'systemsThinking'],
    required: true 
  },
  weight: { type: Number, required: true, min: 0, max: 1 }
}, { _id: false });

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  contributions: [evidenceContributionSchema],
  explanation: { type: String } // Why this answer is right/wrong (for learning)
}, { _id: false });

const scenarioSchema = new mongoose.Schema({
  // Identification
  scenarioId: { type: String, required: true, unique: true }, // e.g., "SCI-08-003"

  // Classification
  competency: { 
    type: String, 
    enum: ['scientificInquiry', 'computationalThinking', 'engineeringDesign', 
           'mathematicalReasoning', 'systemsThinking'],
    required: true,
    index: true 
  },
  developmentalBand: { 
    type: String, 
    enum: ['3-4', '5-6', '7-8', '9-10', '11-12'],
    required: true,
    index: true 
  },
  difficulty: { type: String, enum: ['standard', 'advanced', 'olympiad'], default: 'standard' },

  // Content
  prompt: { type: String, required: true },
  contextImage: { type: String }, // URL to illustration (optional)
  options: { type: [optionSchema], validate: [arr => arr.length === 4, 'Exactly 4 options required'] },

  // Pedagogy
  learningObjective: { type: String },
  hint: { type: String }, // Optional hint for struggling students

  // Metadata
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  averageCorrectRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

scenarioSchema.index({ competency: 1, developmentalBand: 1, difficulty: 1, isActive: 1 });
```

### 2.5 Collection: `norms` (Benchmark Data)

```javascript
const normSchema = new mongoose.Schema({
  region: { type: String, required: true, index: true }, // 'india', 'singapore', 'usa', etc.
  classLevel: { type: Number, required: true, min: 3, max: 12 },
  difficulty: { type: String, enum: ['standard', 'advanced', 'olympiad'] },

  // Distribution parameters per competency
  distributions: {
    scientificInquiry: { mean: Number, stdDev: Number, sampleSize: Number },
    computationalThinking: { mean: Number, stdDev: Number, sampleSize: Number },
    engineeringDesign: { mean: Number, stdDev: Number, sampleSize: Number },
    mathematicalReasoning: { mean: Number, stdDev: Number, sampleSize: Number },
    systemsThinking: { mean: Number, stdDev: Number, sampleSize: Number }
  },

  // Composite score distribution
  composite: { mean: Number, stdDev: Number, sampleSize: Number },

  // Versioning
  version: { type: String, required: true }, // e.g., "2026-Q3"
  isProvisional: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

normSchema.index({ region: 1, classLevel: 1, difficulty: 1, version: 1 }, { unique: true });
```

### 2.6 Collection: `audit_logs`

```javascript
const auditLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true },
  action: { 
    type: String, 
    enum: ['register', 'login', 'login_failed', 'logout', 'assessment_start', 
           'assessment_complete', 'report_generate', 'report_download', 
           'password_change', 'profile_update', 'data_export'],
    required: true 
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }, // Flexible context data
  timestamp: { type: Date, default: Date.now, index: true }
});

auditLogSchema.index({ studentId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
```

---

## 3. Authentication & Security Architecture

### 3.1 Registration Flow

```
Student opens app
    │
    ▼
┌─────────────────┐
│  Landing Page   │
│  "Start Journey"│
└─────────────────┘
    │
    ▼
┌─────────────────┐     ┌─────────────────┐
│  Registration   │────▶│  Email exists?  │──Yes──▶ Error: "Already registered"
│  Form           │     │  Check          │
│  • Full Name    │     └─────────────────┘
│  • Email        │            │
│  • Password     │            ▼ No
│  • Class        │     ┌─────────────────┐
│  • School       │     │  Hash password  │
│  • City/State   │     │  (bcrypt, 12)   │
└─────────────────┘     └─────────────────┘
    │                          │
    │                          ▼
    │                   ┌─────────────────┐
    │                   │  Create Student │
    │                   │  Document       │
    │                   └─────────────────┘
    │                          │
    │                          ▼
    │                   ┌─────────────────┐
    │                   │  Generate JWT   │
    │                   │  Access + Refresh│
    │                   └─────────────────┘
    │                          │
    ▼                          ▼
┌─────────────────┐     ┌─────────────────┐
│ Auto-login to   │◄────│  Store tokens   │
│ Dashboard       │     │  (httpOnly      │
│                 │     │   cookie +      │
│                 │     │   localStorage) │
└─────────────────┘     └─────────────────┘
```

### 3.2 JWT Token Strategy

```javascript
// Access Token (short-lived)
const accessToken = jwt.sign(
  { 
    sub: student._id, 
    email: student.email,
    class: student.currentClass,
    iat: Date.now()
  },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '15m', algorithm: 'HS256' }
);

// Refresh Token (long-lived, stored in DB)
const refreshToken = jwt.sign(
  { sub: student._id, type: 'refresh', jti: crypto.randomUUID() },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d', algorithm: 'HS256' }
);

// Refresh token stored in MongoDB for revocation capability
await RefreshToken.create({
  token: refreshToken,
  studentId: student._id,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isRevoked: false
});
```

### 3.3 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (!@#$%^&*)
- bcrypt hashing with 12 salt rounds
- Rate limiting: 5 failed attempts → 15-minute lockout

### 3.4 API Security Headers (Helmet)

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // For inline scripts if needed
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.openrouter.ai"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

## 4. REST API Specification

### 4.1 Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create new student account |
| POST | `/api/v1/auth/login` | No | Authenticate & receive tokens |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| POST | `/api/v1/auth/logout` | Yes | Revoke refresh token |
| POST | `/api/v1/auth/forgot-password` | No | Send reset email (future) |
| PUT | `/api/v1/auth/change-password` | Yes | Update password |

**Register Request:**
```json
{
  "email": "khamba.meetei@example.com",
  "password": "SecurePass123!",
  "fullName": "Khamba Meetei",
  "currentClass": 8,
  "schoolName": "Delhi Public School",
  "city": "New Delhi",
  "state": "Delhi",
  "parentName": "Tomcha Meetei",
  "parentEmail": "tomcha.meetei@example.com"
}
```

**Register Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "64f8a2b1c3d4e5f6a7b8c9d0",
      "email": "khamba.meetei@example.com",
      "fullName": "Khamba Meetei",
      "currentClass": 8,
      "createdAt": "2026-08-25T09:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

### 4.2 Assessment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/assessments` | Yes | Start new assessment session |
| GET | `/api/v1/assessments/:id` | Yes | Get assessment by ID |
| PUT | `/api/v1/assessments/:id/responses` | Yes | Submit a response |
| POST | `/api/v1/assessments/:id/complete` | Yes | Finalize assessment |
| DELETE | `/api/v1/assessments/:id` | Yes | Abandon assessment |
| GET | `/api/v1/assessments` | Yes | List student's assessments |

**Start Assessment:**
```json
POST /api/v1/assessments
{
  "classLevel": 8,
  "difficulty": "advanced"
}

Response:
{
  "success": true,
  "data": {
    "assessmentId": "64f8a2b1c3d4e5f6a7b8c9d1",
    "status": "in_progress",
    "questions": [
      {
        "questionId": "SCI-08-003",
        "competency": "scientificInquiry",
        "prompt": "You are observing a plant...",
        "options": [
          { "index": 0, "text": "Move the plant..." },
          { "index": 1, "text": "Measure light..." },
          { "index": 2, "text": "Ask the teacher..." },
          { "index": 3, "text": "Water the slower..." }
        ]
      }
      // ... 19 more questions
    ],
    "startedAt": "2026-08-25T09:35:00.000Z",
    "timeLimitMinutes": 45
  }
}
```

**Submit Response:**
```json
PUT /api/v1/assessments/:id/responses
{
  "questionId": "SCI-08-003",
  "selectedOptionIndex": 1,
  "timeSpentMs": 45000
}
```

### 4.3 Report Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/reports/generate` | Yes | Trigger AI report generation |
| GET | `/api/v1/reports/:id` | Yes | Get report by ID |
| GET | `/api/v1/reports` | Yes | List all reports for student |
| GET | `/api/v1/reports/:id/pdf` | Yes | Download PDF report |
| POST | `/api/v1/reports/:id/share` | Yes | Generate public share link |

### 4.4 Dashboard Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/dashboard/summary` | Yes | Overview stats & latest report |
| GET | `/api/v1/dashboard/progress` | Yes | Score trends over time |
| GET | `/api/v1/dashboard/benchmarks` | Yes | Current standing vs regions |
| GET | `/api/v1/dashboard/achievements` | Yes | Badges & milestones |
| GET | `/api/v1/student/profile` | Yes | Get student profile |
| PUT | `/api/v1/student/profile` | Yes | Update profile |

---

## 5. AI Report Generation Architecture

### 5.1 Prompt Engineering Strategy

```javascript
// System prompt for report generation
const SYSTEM_PROMPT = `You are an expert STEM education analyst and career counselor. 
You generate comprehensive, encouraging, and actionable assessment reports for Indian students (Classes 3-12).

Guidelines:
- Write in clear, accessible English that parents can understand
- Be encouraging but honest about growth areas
- Provide specific, actionable next steps
- Reference real-world applications and resources
- Keep tone warm, professional, and motivating
- Structure output as JSON with specific fields

Output must be valid JSON with these fields:
- overallAssessment (string, 2-3 paragraphs)
- keyStrengths (array of 3 strings)
- growthAreas (array of 3 strings)  
- learningPath (string, recommended track)
- parentGuidance (string, specific advice for parents)
- actionPlan (array of 4 objects with title, description, category, difficulty, estimatedDuration)`;

// User prompt template
function buildUserPrompt(assessmentData, studentProfile) {
  return `Generate a comprehensive STEM assessment report for:

Student: ${studentProfile.fullName}, Class ${studentProfile.currentClass}
Assessment Date: ${assessmentData.completedAt}
Difficulty: ${assessmentData.difficulty}

Competency Scores (out of 100%):
- Scientific Inquiry: ${assessmentData.normalizedScores.scaledScores.scientificInquiry} (Z: ${assessmentData.normalizedScores.zScores.scientificInquiry.toFixed(2)})
- Computational Thinking: ${assessmentData.normalizedScores.scaledScores.computationalThinking} (Z: ${assessmentData.normalizedScores.zScores.computationalThinking.toFixed(2)})
- Engineering Design: ${assessmentData.normalizedScores.scaledScores.engineeringDesign} (Z: ${assessmentData.normalizedScores.zScores.engineeringDesign.toFixed(2)})
- Mathematical Reasoning: ${assessmentData.normalizedScores.scaledScores.mathematicalReasoning} (Z: ${assessmentData.normalizedScores.zScores.mathematicalReasoning.toFixed(2)})
- Systems Thinking: ${assessmentData.normalizedScores.scaledScores.systemsThinking} (Z: ${assessmentData.normalizedScores.zScores.systemsThinking.toFixed(2)})

Global Score: ${assessmentData.normalizedScores.globalScore}/900
Percentile (India): ${assessmentData.percentiles.india}th
Percentile (Global): ${assessmentData.percentiles.global}th

Strongest competency: ${getStrongest(assessmentData.normalizedScores.scaledScores)}
Weakest competency: ${getWeakest(assessmentData.normalizedScores.scaledScores)}

Generate the report now.`;
}
```

### 5.2 OpenRouter Integration (Free Tier)

```javascript
// services/aiService.js
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://stembenchmark.in',
    'X-Title': 'STEM Benchmark Platform'
  }
});

export async function generateReport(assessment, student) {
  const cacheKey = `report:${assessment._id}`;

  // Check Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const completion = await openai.chat.completions.create({
    model: 'openrouter/mistralai/mistral-7b-instruct:free', // Free tier
    // Alternative: 'nvidia/llama-3.1-nemotron-70b-instruct' via NIM
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(assessment, student) }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  const reportData = JSON.parse(completion.choices[0].message.content);

  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(reportData));

  return {
    ...reportData,
    modelUsed: completion.model,
    promptTokens: completion.usage.prompt_tokens,
    completionTokens: completion.usage.completion_tokens
  };
}
```

### 5.3 Fallback Strategy

If OpenRouter free tier is unavailable:
1. **Template-based generation**: Pre-written report templates with variable substitution
2. **Rule-based insights**: Hardcoded logic mapping score ranges to specific advice
3. **Queued retry**: Add to background job queue for later generation

---

## 6. Dashboard Design Specification

### 6.1 Student Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEM Benchmark        [Home] [Assessments] [Reports] [Progress] [Profile]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Welcome back, Khamba!                    [Start New Assessment →]   │   │
│  │  Class 8 • 3 assessments completed • Last: 2 days ago              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   Global Score      │  │   Best Percentile   │  │   Assessments       │ │
│  │      672            │  │      84th           │  │        3            │ │
│  │   ▲ +45 vs last    │  │   🌍 Global rank    │  │   ↑ 1 this month   │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📈 Progress Over Time                                             │   │
│  │  [Line chart: Global score trend across 3 assessments]             │   │
│  │  Assessment 1: 580 → Assessment 2: 627 → Assessment 3: 672       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  🎯 Latest Competency       │  │  🏆 Achievements                    │  │
│  │  [Radar chart]              │  │  • First Assessment                 │  │
│  │  Sci: 72%  Comp: 85%       │  │  • 80th Percentile Club           │  │
│  │  Eng: 68%  Math: 91%       │  │  • Consistent Growth (3 tests)    │  │
│  │  Sys: 64%                   │  │  • Systems Thinker                │  │
│  └─────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📋 Recent Reports                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ Aug 23, 2026  │ Advanced │ Score: 672 │ [View] [Download] │   │   │
│  │  │ Aug 15, 2026  │ Standard │ Score: 627 │ [View] [Download] │   │   │
│  │  │ Aug 01, 2026  │ Standard │ Score: 580 │ [View] [Download] │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Assessment History View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Assessment History                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Filter: [All Classes ▼] [All Difficulties ▼] [Sort: Newest ▼]             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  #3  Aug 23, 2026    Class 8 • Advanced    Score: 672/900        │   │
│  │      Time: 38 min    Accuracy: 78%         Percentile: 84th      │   │
│  │      [View Report] [Download PDF] [Retake Similar]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  #2  Aug 15, 2026    Class 8 • Standard    Score: 627/900        │   │
│  │      Time: 42 min    Accuracy: 72%         Percentile: 76th      │   │
│  │      [View Report] [Download PDF] [Retake Similar]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  #1  Aug 01, 2026    Class 8 • Standard    Score: 580/900        │   │
│  │      Time: 45 min    Accuracy: 65%         Percentile: 68th      │   │
│  │      [View Report] [Download PDF] [Retake Similar]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Detailed Report View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Report #3 - Aug 23, 2026                                                  │
│  Khamba Meetei • Class 8 • Advanced Difficulty                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  EXECUTIVE SUMMARY                                                 │   │
│  │  Global Score: 672/900  │  Percentile: 84th  │  Accuracy: 78%    │   │
│  │                                                                     │   │
│  │  [Competency Radar Chart]        [Competency Bar Chart]            │   │
│  │                                                                     │   │
│  │  Strongest: Mathematical Reasoning (91%)                          │   │
│  │  Growth Area: Systems Thinking (64%)                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🌍 GLOBAL BENCHMARK                                               │   │
│  │  [Horizontal bar chart comparing with Singapore, Korea, USA, UK]   │   │
│  │                                                                     │   │
│  │  You scored higher than 84% of students globally.                 │   │
│  │  You are 14 points above the global average.                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🤖 AI-GENERATED INSIGHTS                                          │   │
│  │  [Expandable sections: Overall, Strengths, Growth, Path, Parent]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📋 PERSONALIZED ACTION PLAN                                       │   │
│  │  [4 actionable items with links and estimated durations]           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Download PDF]  [Share Report]  [Print]  [Start New Assessment]           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. PDF Generation Architecture

### 7.1 Client-Side PDF (Primary)

Using `html2pdf.js` (wrapper around `html2canvas` + `jsPDF`) for instant generation without server round-trip:

```javascript
// components/ReportPDFGenerator.tsx
import html2pdf from 'html2pdf.js';

export async function generatePDF(reportElement, filename) {
  const opt = {
    margin: [12, 12, 12, 12], // mm
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  // Add print-specific CSS
  const printStyles = `
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
  `;

  return html2pdf().set(opt).from(reportElement).save();
}
```

### 7.2 Server-Side PDF (Fallback)

For complex reports or when client-side fails:

```javascript
// services/pdfService.js
import puppeteer from 'puppeteer-core';
// or use @sparticuz/chromium for serverless environments

export async function generateServerPDF(reportId) {
  const report = await Report.findById(reportId).populate('assessmentId studentId');

  // Render HTML template with report data
  const html = await renderReportTemplate(report);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
  });

  await browser.close();

  // Upload to S3/Cloudflare R2
  const url = await uploadToStorage(pdf, `reports/${reportId}.pdf`);

  await Report.findByIdAndUpdate(reportId, { 
    pdfUrl: url, 
    pdfGeneratedAt: new Date() 
  });

  return url;
}
```

### 7.3 PDF Design Specification

**Page 1: Cover**
- Platform logo & report title
- Student name, class, date
- Global score (large, prominent)
- QR code linking to digital report

**Page 2: Competency Breakdown**
- Radar chart (SVG rendered)
- Bar chart with percentages
- Color-coded competency descriptions

**Page 3: Global Benchmark**
- Horizontal comparison bars
- Regional percentile table
- Interpretation text

**Page 4: AI Insights**
- Overall assessment paragraph
- Bulleted strengths & growth areas
- Learning path recommendation

**Page 5: Action Plan**
- Numbered action items
- Resource links (QR codes)
- Timeline suggestion

**Page 6: Parent Guidance**
- Dedicated parent section
- Conversation starters
- Home activity suggestions

---

## 8. Frontend Component Architecture

### 8.1 Route Structure (React Router v7)

```
/                          → LandingPage (public)
/register                  → RegistrationPage (public)
/login                     → LoginPage (public)
/dashboard                 → StudentDashboard (protected)
/dashboard/assessments     → AssessmentHistory (protected)
/dashboard/reports         → ReportsList (protected)
/dashboard/reports/:id     → ReportDetail (protected)
/dashboard/progress        → ProgressAnalytics (protected)
/dashboard/profile         → ProfileSettings (protected)
/assessment/:id            → AssessmentSession (protected)
/assessment/:id/results    → ResultsPage (protected)
/shared/:token             → SharedReport (public, read-only)
```

### 8.2 Key Components

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   ├── layout/
│   │   ├── Navbar.tsx         # Top navigation with auth state
│   │   ├── Sidebar.tsx        # Dashboard sidebar
│   │   ├── Footer.tsx
│   │   └── ProtectedRoute.tsx # Auth guard wrapper
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── PasswordInput.tsx  # With strength indicator
│   │   └── AuthContext.tsx    # Zustand auth store
│   ├── assessment/
│   │   ├── QuestionCard.tsx   # Individual question display
│   │   ├── OptionButton.tsx   # A/B/C/D with animations
│   │   ├── ProgressBar.tsx    # Session progress
│   │   ├── Timer.tsx          # Countdown/up timer
│   │   ├── CompetencyBadge.tsx
│   │   └── AssessmentLayout.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx       # KPI cards
│   │   ├── ProgressChart.tsx  # Recharts line chart
│   │   ├── CompetencyRadar.tsx # Recharts radar
│   │   ├── BenchmarkChart.tsx # Horizontal bar comparison
│   │   ├── AchievementBadge.tsx
│   │   ├── AssessmentList.tsx
│   │   └── ReportPreview.tsx
│   ├── report/
│   │   ├── ReportHeader.tsx
│   │   ├── CompetencySection.tsx
│   │   ├── BenchmarkSection.tsx
│   │   ├── AIInsights.tsx     # Expandable sections
│   │   ├── ActionPlan.tsx
│   │   ├── ParentGuidance.tsx
│   │   ├── PDFExportButton.tsx
│   │   └── ShareButton.tsx
│   └── animations/
│       ├── LottiePlayer.tsx   # Wrapper for lottie-react
│       ├── ConfettiEffect.tsx # Celebration animation
│       ├── FadeIn.tsx         # GSAP fade wrapper
│       ├── SlideIn.tsx        # GSAP slide wrapper
│       └── PulseRing.tsx      # Loading indicator
├── hooks/
│   ├── useAuth.ts
│   ├── useAssessment.ts
│   ├── useReport.ts
│   ├── useDashboard.ts
│   └── useKeyboardShortcuts.ts # A/B/C/D + Enter
├── stores/
│   ├── authStore.ts           # Zustand: tokens, user, isAuthenticated
│   ├── assessmentStore.ts     # Current session state
│   └── uiStore.ts             # Theme, toasts, modals
├── services/
│   ├── api.ts                 # Axios instance with interceptors
│   ├── authService.ts
│   ├── assessmentService.ts
│   ├── reportService.ts
│   ├── dashboardService.ts
│   └── aiService.ts           # OpenRouter client
├── utils/
│   ├── scoring.ts             # Raw → normalized → percentile
│   ├── pdfGenerator.ts        # html2pdf wrapper
│   ├── validators.ts          # Zod schemas
│   └── constants.ts           # Competency definitions, regions
└── types/
    ├── auth.ts
    ├── assessment.ts
    ├── report.ts
    └── dashboard.ts
```

---

## 9. Animation & Interaction Design

### 9.1 Lottie Animations

| Animation | Trigger | File |
|-----------|---------|------|
| Hero floating circles | Landing page load | `hero-circles.json` |
| Success checkmark | Answer locked | `checkmark.json` |
| Confetti burst | Report generated | `confetti.json` |
| Loading brain | AI processing | `brain-loading.json` |
| Trophy celebration | High score achieved | `trophy.json` |
| Progress rocket | Assessment progress | `rocket.json` |

### 9.2 GSAP Animations

```javascript
// gsap.config.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Page transitions
export const pageTransition = (element) => {
  gsap.fromTo(element, 
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  );
};

// Staggered list items
export const staggerList = (elements) => {
  gsap.fromTo(elements,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
  );
};

// Number counter animation
export const countUp = (element, target, duration = 1.5) => {
  gsap.to(element, {
    innerText: target,
    duration,
    snap: { innerText: 1 },
    ease: 'power2.out'
  });
};

// Radar chart draw
export const drawRadar = (paths) => {
  paths.forEach((path, i) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, { 
      strokeDashoffset: 0, 
      duration: 1, 
      delay: i * 0.2,
      ease: 'power2.inOut' 
    });
  });
};
```

### 9.3 Framer Motion (React-specific)

```tsx
// components/Assessment.tsx
import { motion, AnimatePresence } from 'framer-motion';

const questionVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

// Question transition
<AnimatePresence mode="wait">
  <motion.div
    key={currentQuestion}
    variants={questionVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    <QuestionCard question={questions[currentQuestion]} />
  </motion.div>
</AnimatePresence>

// Option selection spring
<motion.button
  whileHover={{ scale: 1.02, x: 4 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  className="option-btn"
>
  {option.text}
</motion.button>
```

---

## 10. Deployment & DevOps

### 10.1 Environment Variables

```bash
# .env (Frontend)
VITE_API_BASE_URL=https://api.stembenchmark.in/v1
VITE_OPENROUTER_KEY=sk-or-v1-...
VITE_APP_NAME=STEM Benchmark

# .env (Backend)
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stem_benchmark
JWT_ACCESS_SECRET=super-secret-access-key
JWT_REFRESH_SECRET=super-secret-refresh-key
OPENROUTER_API_KEY=sk-or-v1-...
REDIS_URL=redis://localhost:6379
```

### 10.2 Docker Compose (Development)

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_BASE_URL=http://localhost:3000/v1

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/stem_benchmark
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

### 10.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm run test:e2e

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run build
      - uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/stembenchmark/backend:latest
      - uses: railway/action-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 11. Data Privacy & Compliance

### 11.1 Student Data Protection

- **Data minimization**: Only collect fields necessary for assessment
- **Encryption at rest**: MongoDB Atlas encryption enabled
- **Encryption in transit**: TLS 1.3 for all API communication
- **Password hashing**: bcrypt with 12 rounds
- **PII masking**: Student names masked in logs; emails hashed for analytics
- **Data retention**: Assessments retained for 2 years; inactive accounts purged after 1 year
- **Right to deletion**: Students can request full account deletion via profile settings

### 11.2 Parental Consent (COPPA-inspired)

- For students under 13, parent email required during registration
- Automated email sent to parent with consent link
- Assessment locked until consent confirmed
- Parent dashboard access to view child's reports

### 11.3 Audit Trail

Every sensitive action logged:
- Login attempts (success/failure)
- Assessment starts/completions
- Report downloads
- Profile updates
- Password changes

---

## 12. Implementation Roadmap

### Phase 1: MVP (Weeks 1–4)
- [ ] Project scaffolding (React + Vite + Tailwind + shadcn/ui)
- [ ] MongoDB setup with Mongoose schemas
- [ ] Express API with auth endpoints (register/login)
- [ ] Basic assessment flow (5 sample questions)
- [ ] Simple scoring algorithm
- [ ] Results page with basic chart
- [ ] Client-side PDF export

### Phase 2: Core Features (Weeks 5–8)
- [ ] Full question bank (100+ scenarios across all bands)
- [ ] Complete scoring & normalization pipeline
- [ ] AI report generation via OpenRouter
- [ ] Student dashboard with history
- [ ] Progress tracking charts
- [ ] Global benchmark comparison
- [ ] Lottie animations integration
- [ ] GSAP page transitions

### Phase 3: Polish & Scale (Weeks 9–12)
- [ ] Advanced PDF templates
- [ ] Shareable report links
- [ ] Parent dashboard
- [ ] Achievement/badge system
- [ ] Performance optimization
- [ ] Security hardening (rate limiting, audit logs)
- [ ] Cross-browser testing
- [ ] Load testing (1000+ concurrent assessments)

### Phase 4: Post-Launch (Ongoing)
- [ ] Norm calibration with real student data
- [ ] Additional regional benchmarks
- [ ] Mobile app (React Native)
- [ ] School/institution accounts
- [ ] Bulk student onboarding
- [ ] Analytics dashboard for educators

---

## 13. Cost Estimation (Monthly, 1000 active students)

| Service | Provider | Estimated Cost |
|---------|----------|---------------|
| Frontend Hosting | Vercel Pro | $20 |
| Backend Hosting | Railway / Render | $25 |
| MongoDB Atlas | M10 Cluster | $57 |
| Redis | Upstash / Railway | $10 |
| AI API (OpenRouter) | Free tier + fallback | $0–$30 |
| PDF Storage | Cloudflare R2 | $5 |
| Domain + SSL | Namecheap / Cloudflare | $15 |
| **Total** | | **~$132–$162/month** |

---

*Document Version: 1.0*
*Last Updated: 2026-08-25*
*Prepared for STEM Benchmark Platform Development Team*
