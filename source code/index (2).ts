import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Optional: keep only if used elsewhere
import authRoutes from "./routes/auth";
import predictionsRoutes from "./routes/predictions";
import patientsRoutes from "./routes/patients";
import settingsRoutes from "./routes/settings";
import userRoutes from "./routes/user";
import { connectDB } from "./config/db";
import { requireAuth } from "./middleware/authMiddleware";

// Load environment variables
dotenv.config({ path: "C:/Users/natty/Documents/medical/backend/.env" });

// Debug JWT_SECRET
console.log("🔐 Loaded JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("🔐 JWT_SECRET length:", process.env.JWT_SECRET?.length || 0);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("❌ JWT_SECRET is too short or missing! Use a 32+ char secret.");
  process.exit(1);
}

// Connect to DB
connectDB();

// Initialize app
const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json());

// Optional: only if you use cookies elsewhere
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes); // Public auth routes
app.use("/users", requireAuth, userRoutes);
app.use("/predictions", requireAuth, predictionsRoutes);
app.use("/patients", requireAuth, patientsRoutes);
app.use("/settings", requireAuth, settingsRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err.message, err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});