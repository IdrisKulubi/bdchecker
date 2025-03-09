"use server";

import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { users, opportunities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get all users
 */
export async function getUsers() {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: users.name,
    });
    
    return { success: true, users: allUsers };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

/**
 * Get a user by name
 */
export async function getUserByName(name: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.name, name),
    });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user by name:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

/**
 * Create a new user
 */
export async function createUser(name: string, role: "worker" | "manager" | "admin" = "worker") {
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.name, name),
    });
    
    if (existingUser) {
      return { success: false, error: "User already exists", user: existingUser };
    }
    
    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        role,
      })
      .returning();
      
    revalidatePath("/admin/users");
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

/**
 * Update a user's role
 */
export async function updateUserRole(id: string, role: "worker" | "manager" | "admin") {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
      
    revalidatePath("/admin/users");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    const allUsers = await db.query.users.findMany();
    
    const totalUsers = allUsers.length;
    const workerCount = allUsers.filter(u => u.role === "worker").length;
    const managerCount = allUsers.filter(u => u.role === "manager").length;
    const adminCount = allUsers.filter(u => u.role === "admin").length;
    
    return {
      success: true,
      stats: {
        totalUsers,
        workerCount,
        managerCount,
        adminCount,
      }
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return { success: false, error: "Failed to fetch user statistics" };
  }
}

/**
 * Get all unique submitters who have submitted opportunities
 */
export async function getUniqueSubmitters() {
  try {
    // Get all users who have submitted at least one opportunity
    const submitters = await db.query.users.findMany({
      where: (users, { exists }) => 
        exists(
          db.select().from(opportunities).where(eq(opportunities.submittedById, users.id))
        ),
      orderBy: users.name,
    });
    
    return { 
      success: true, 
      submitters: submitters.map(user => ({
        id: user.id,
        name: user.name,
        role: user.role
      }))
    };
  } catch (error) {
    console.error("Error fetching unique submitters:", error);
    return { success: false, error: "Failed to fetch submitters" };
  }
} 