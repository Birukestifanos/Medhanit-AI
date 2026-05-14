// 🔐 For signup requests
export interface SignupRequest {
  fullName: string;
  phone: string;
  address: string;
  organization: string;
  email: string;
  password: string;
  role?: "admin" | "staff" | "doctor" | "patient";
}

// 🔐 For login requests
export interface LoginRequest {
  email: string;
  password: string;
}

// 👤 For user storage
export interface User {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  organization: string;
  email: string;
  hashedPassword: string;
  role: "admin" | "staff" | "doctor" | "patient";
}