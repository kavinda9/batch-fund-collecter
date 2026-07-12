import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'
import { tmpdir } from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import "./config/firebase.js";
import authRoutes from "./routes/authRoutes.js";
import slipRoutes from "./routes/slipRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const app = express()
const PORT = process.env.PORT || 5001

// CORS configuration — must come BEFORE helmet so preflight OPTIONS
// responses are handled directly without interference from security headers.
const allowedOrigins = [
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/+$/, '') : null,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, same-origin server calls)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS request blocked for origin: ${origin}. Allowed origins:`, allowedOrigins);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle ALL OPTIONS preflight requests immediately — before any other middleware
app.options('*', cors(corsOptions));

// Middleware
app.use(cors(corsOptions))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Serve uploaded slip images statically
if (process.env.VERCEL) {
  app.use('/uploads/slips', express.static(tmpdir()))
} else {
  app.use('/uploads', express.static(join(__dirname, '../uploads')))
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/slips", slipRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes (to be added)
// app.use('/api/auth',       authRoutes)
// app.use('/api/users',      userRoutes)
// app.use('/api/contributions', contributionRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

export default app

