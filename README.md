# Batch Fund Collection System

A web application for managing and collecting batch funds efficiently.

## Project Structure

```
batch-fund-collection-system/
├── .github/workflows/    # CI/CD pipelines
├── docs/                 # Documentation, sprint plans, meeting notes, diagrams
├── frontend/             # React + Firebase frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/        # auth, dashboard, admin, fund
│       ├── firebase/
│       ├── services/
│       ├── routes/
│       ├── context/
│       └── utils/
├── tests/
├── screenshots/
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker (optional)
- Firebase project

### Installation

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

## License
MIT
