import { db } from '../../lib/db';
import { users, User, NewUser } from '../users/users.model';
import { AuthResult, JwtPayload, LoginRequest, RegisterRequest } from './auth.types';
import { eq } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Secret key for JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-change-in-production'
);

/**
 * Register a new user
 * @param data The registration data
 * @returns The auth result
 */
export async function register(data: RegisterRequest): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    // Create a new user
    const newUser: NewUser = {
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
      role: data.role || 'WORKER',
    };

    // Insert the user into the database
    const result = await db.insert(users).values(newUser).returning();
    const user = result[0];

    // Generate a JWT token
    const token = await generateToken(user);

    // Set the token in a cookie
    const cookieStore = cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Return the auth result
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Login a user
 * @param data The login data
 * @returns The auth result
 */
export async function login(data: LoginRequest): Promise<AuthResult> {
  try {
    // Find the user by email
    const result = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    const user = result[0];

    // Check if user exists
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify the password
    const isPasswordValid = await verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate a JWT token
    const token = await generateToken(user);

    // Set the token in a cookie
    const cookieStore = cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Return the auth result
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

/**
 * Logout a user
 */
export async function logout(): Promise<void> {
  try {
    // Clear the token cookie
    const cookieStore = cookies();
    cookieStore.delete('token');
  } catch (error) {
    console.error('Error logging out user:', error);
    throw error;
  }
}

/**
 * Verify a JWT token
 * @param token The JWT token to verify
 * @returns The JWT payload
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JwtPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}

/**
 * Get the current user from the request
 * @returns The current user
 */
export async function getCurrentUser(): Promise<Omit<User, 'password'> | null> {
  try {
    // Get the token from the cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    // Check if token exists
    if (!token) {
      return null;
    }

    // Verify the token
    const payload = await verifyToken(token);

    // Find the user by ID
    const result = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    const user = result[0];

    // Check if user exists
    if (!user) {
      return null;
    }

    // Return the user without the password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Generate a JWT token
 * @param user The user to generate a token for
 * @returns The JWT token
 */
async function generateToken(user: User): Promise<string> {
  try {
    // Create a JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Sign the JWT token
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}

/**
 * Hash a password
 * @param password The password to hash
 * @returns The hashed password
 */
async function hashPassword(password: string): Promise<string> {
  // In a real application, you would use a proper password hashing library like bcrypt
  // For simplicity, we're just using a basic hash function here
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify a password
 * @param password The password to verify
 * @param hash The hashed password
 * @returns Whether the password is valid
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // In a real application, you would use a proper password hashing library like bcrypt
  // For simplicity, we're just using a basic hash function here
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
} 