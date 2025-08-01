# Artemis Engine

**A.R.T.E.M.I.S** - Automated Real-Time Engagement & Marketing Intelligence System

A Next.js application for automated content generation and marketing intelligence. Artemis Engine orchestrates a step-based workflow for generating, optimizing, and publishing marketing content across multiple platforms.

## ✨ Features

- **🧠 Topic Amplification** - AI-powered topic ideation and keyword expansion
- **📊 Data Management** - CSV-based topic loading and management
- **📝 Content Generation** - Automated blog post creation with Portable Text
- **🔍 SEO Optimization** - Meta titles, descriptions, and keyword generation
- **📱 Social Media** - Platform-specific posts for LinkedIn, Twitter, and Instagram
- **🎨 Visual Descriptions** - AI-generated visual content descriptions
- **🚀 CMS Publishing** - Direct integration with Sanity CMS
- **📈 Google Sheets** - Visual asset publishing to spreadsheets

## 🛠 Tech Stack

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript
- **UI**: React 19.1.1 (Function components + hooks)
- **Styling**: Tailwind CSS 4.1.11 + DaisyUI 5.0.50
- **Icons**: Lucide React
- **AI**: OpenAI API integration
- **CMS**: Sanity integration
- **Sheets**: Google Sheets API

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bianca-git/artemis-engine.git
   cd artemis-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   SANITY_PROJECT_ID=your_sanity_project_id
   SANITY_DATASET=your_sanity_dataset
   SANITY_API_TOKEN=your_sanity_token
   SANITY_API_VERSION=2023-05-03
   GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
   GOOGLE_SHEETS_PRIVATE_KEY=your_private_key
   GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
artemis-engine/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes (8 endpoints)
│   │   ├── amplify-topic/
│   │   ├── generate-blog/
│   │   ├── generate-seo/
│   │   ├── generate-social/
│   │   ├── generate-visual/
│   │   ├── publish-cms/
│   │   └── publish-visuals/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components (11 components)
│   ├── App.tsx           # Main orchestrator
│   ├── GenerationSteps.tsx
│   ├── TopicAmplifier.tsx
│   ├── StepCard.tsx
│   └── steps/            # Modular step components
├── hooks/                # Custom hooks (7 hooks)
│   ├── useArtemis.ts     # Main workflow orchestrator
│   ├── useArtemisData.ts # Data management
│   ├── useArtemisContent.ts # API integration
│   ├── useArtemisUI.ts   # UI state
│   └── useArtemisWorkflow.ts # Workflow logic
├── types/                # TypeScript definitions
│   └── artemis.ts        # Core types
├── utils/                # Utility functions (8 utilities)
│   ├── helpers.ts        # General helpers
│   ├── openaiClient.ts   # OpenAI integration
│   ├── googleSheets.ts   # Google Sheets API
│   └── performance.ts    # Performance monitoring
└── package.json
```

## 🔄 Workflow

Artemis Engine follows a step-based workflow:

1. **Topic Amplification** - Generate topic ideas from keywords
2. **Data Loading** - Import/manage topics from CSV files
3. **Topic Selection** - Choose topics for content generation
4. **Blog Generation** - Create blog posts with AI
5. **SEO Optimization** - Generate meta data and keywords
6. **Visual Creation** - Generate visual descriptions
7. **Social Media** - Create platform-specific posts
8. **Publishing** - Deploy to CMS and external platforms

## 🏗 Architecture

### Modular Hook System

Artemis uses a modular architecture with specialized hooks:

- **`useArtemis`** - Main orchestrator combining all modules
- **`useArtemisData`** - CSV processing and topic management
- **`useArtemisContent`** - API calls and content generation
- **`useArtemisUI`** - Loading states and UI interactions
- **`useArtemisWorkflow`** - Step progression and workflow state

### Performance Optimizations

- React.memo for component optimization
- useMemo and useCallback for expensive operations
- CSV parsing with memoization
- Performance monitoring utilities

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm start        # Start production server
npm run rm:del   # Clean reset (removes node_modules, .next, etc.)
```

### API Routes

All content generation APIs support mock responses when API keys are not configured:

- `POST /api/amplify-topic` - Topic ideation
- `POST /api/generate-blog` - Blog content creation
- `POST /api/generate-seo` - SEO optimization
- `POST /api/generate-social` - Social media posts
- `POST /api/generate-visual` - Visual descriptions
- `POST /api/publish-cms` - Sanity CMS publishing
- `POST /api/publish-visuals` - Google Sheets publishing

### Environment Configuration

The app gracefully handles missing API keys by providing mock responses, making it easy to develop and test without all integrations configured.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run the build: `npm run build`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Open a pull request

## 📄 License

This project is private and proprietary.

---

**Author**: Bianca Wilkinson  
**Framework**: Next.js 15 + React 19 + TypeScript
