import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve, join } from 'path'

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

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded slip images statically
app.use('/uploads', express.static(join(__dirname, '../uploads')))

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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

export default app
