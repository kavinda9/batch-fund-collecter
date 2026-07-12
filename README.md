# Batch Fund Collection System

A full-stack web application to manage batch fund collection, contributions, and reporting.

## Tech Stack

- **Frontend**: React (Vite) + Firebase Auth
- **Backend**: Node.js / Express
- **Database**: Firebase Firestore
- **CI/CD**: GitHub Actions
- **Containerization**: Docker / Docker Compose

## Project Structure

```
batch-fund-collection-system/
├── .github/workflows/     # CI/CD pipelines
├── docs/                  # Documentation, diagrams, meeting notes
├── frontend/              # React frontend (Vite)
├── backend/               # Node.js/Express REST API
├── tests/                 # Unit and integration tests
└── docker-compose.yml     # Multi-service Docker config
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional)

### Run with Docker
```bash
docker-compose up --build
```

### Run Locally

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm start
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
