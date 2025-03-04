import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { opportunities } from "../opportunities/opportunities.model";
import { relations } from "drizzle-orm";

// Define user roles
export type UserRole = "WORKER" | "MANAGER" | "ADMIN";

// Define the users table schema
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  role: text("role").$type<UserRole>().default("WORKER").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations between users and opportunities
export const usersRelations = relations(users, ({ many }) => ({
  opportunities: many(opportunities),
}));

// User type for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert; 