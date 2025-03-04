import { User, UserRole } from "../users/users.model";

// Define the login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Define the registration request
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Define the auth result
export interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

// Define the JWT payload
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number; // Issued at
  exp?: number; // Expiration time
} 