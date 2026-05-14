import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";

// Define the payload structure
interface AuthPayload {
  userId: string;
  role: "admin" | "staff";
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;      // Authenticated user info
      userDoc?: any;           // Optional: full user document from DB
    }
  }
}

/**
 * Middleware: requireAuth
 * - Checks for Bearer token in Authorization header
 * - Verifies JWT
 * - Ensures user exists and is active
 * - Attaches user to req.user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log("🔐 requireAuth: Processing request for", req.originalUrl);

  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    console.warn("🔒 No Bearer token provided in Authorization header for", req.originalUrl);
    return res.status(401).json({ error: "Authentication required" });
  }

  // 2. Ensure JWT_SECRET is set
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("🔐 JWT_SECRET is not defined in environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  console.log("🔑 Verifying JWT token:", token.substring(0, 20) + "...");

  try {
    // 3. Verify and decode the JWT
    const decoded = jwt.verify(token, jwtSecret) as AuthPayload;
    console.log("✅ JWT verified. Decoded payload:", decoded);

    // 4. Look up user in database
    UserModel.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          console.warn("🔒 User not found for userId:", decoded.userId);
          return res.status(401).json({ error: "Invalid user" });
        }
        if (!user.active) {
          console.warn("🔒 Inactive user attempted access:", decoded.userId);
          return res.status(401).json({ error: "Account is deactivated" });
        }

        // 5. Validate role is valid
        if (!["admin", "staff"].includes(decoded.role)) {
          console.warn("🔒 Invalid role in token:", decoded.role);
          return res.status(401).json({ error: "Invalid role in token" });
        }

        // 6. Attach user data to request
        req.user = decoded;
        (req as any).userDoc = user; // Optional: attach full user object
        console.log("🔐 Authenticated user set on req.user:", req.user);

        // 7. Proceed to next middleware/route
        next();
      })
      .catch((err) => {
        console.error("🔐 Database lookup error:", err);
        return res.status(500).json({ error: "Authentication failed" });
      });
  } catch (err: any) {
    // Handle JWT errors
    console.error("❌ JWT verification failed:", err.message);

    if (err.name === "TokenExpiredError") {
      console.warn("⏰ Token expired for request:", req.originalUrl);
      return res.status(401).json({ error: "Token expired" });
    }

    if (err.name === "JsonWebTokenError") {
      console.warn("❌ Malformed JWT token");
      return res.status(401).json({ error: "Invalid token" });
    }

    // Unknown error
    return res.status(401).json({ error: "Authentication failed" });
  }
}

// Role-based middleware
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔐 adminOnly check for user:", req.user);
  if (req.user?.role === "admin") {
    next();
  } else {
    console.warn("🔒 Admin access denied for user:", req.user);
    res.status(403).json({ error: "Admin access only" });
  }
};

export const staffOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔐 staffOrAdmin check for user:", req.user);
  if (req.user && ["admin", "staff"].includes(req.user.role)) {
    next();
  } else {
    console.warn("🔒 Staff or Admin access denied for user:", req.user);
    res.status(403).json({ error: "Staff or Admin access only" });
  }
};

export const staffOnly = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔐 staffOnly check for user:", req.user);
  if (req.user?.role === "staff") {
    next();
  } else {
    console.warn("🔒 Staff access denied for user:", req.user);
    res.status(403).json({ error: "Staff access only" });
  }
};