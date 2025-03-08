import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define enums
export const userRoleEnum = pgEnum("user_role", ["worker", "manager", "admin"]);
export const opportunityStatusEnum = pgEnum("opportunity_status", ["open", "in_review", "go", "no_go"]);
export const criterionEnum = pgEnum("criterion", [
  "lead_time_check",
  "project_insight",
  "client_relationship",
  "expertise_alignment",
  "commercial_viability",
  "strategic_value",
  "resources",
  "other"
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  role: userRoleEnum("role").default("worker").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Opportunities table
export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  timeline: text("timeline").notNull(),
  submittedById: uuid("submitted_by_id").references(() => users.id),
  status: opportunityStatusEnum("status").default("open").notNull(),
  aiDecision: varchar("ai_decision", { length: 50 }),
  managerDecision: varchar("manager_decision", { length: 50 }),
  managerComment: text("manager_comment"),
  reviewedById: uuid("reviewed_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Opportunity scores table
export const opportunityScores = pgTable("opportunity_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id).notNull(),
  criterion: criterionEnum("criterion").notNull(),
  score: integer("score").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System settings table for configurable parameters
export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 255 }).unique().notNull(),
  value: text("value").notNull(),
  description: text("description"),
  updatedById: uuid("updated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  submittedOpportunities: many(opportunities, { relationName: "submitter" }),
  reviewedOpportunities: many(opportunities, { relationName: "reviewer" }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  submitter: one(users, {
    fields: [opportunities.submittedById],
    references: [users.id],
    relationName: "submitter",
  }),
  reviewer: one(users, {
    fields: [opportunities.reviewedById],
    references: [users.id],
    relationName: "reviewer",
  }),
  scores: many(opportunityScores),
}));

export const opportunityScoresRelations = relations(opportunityScores, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [opportunityScores.opportunityId],
    references: [opportunities.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [systemSettings.updatedById],
    references: [users.id],
  }),
}));
