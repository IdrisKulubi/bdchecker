import { pgTable, text, uuid, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../users/users.model";

// Define opportunity status
export type OpportunityStatus = "NEW" | "SCORED" | "APPROVED" | "REJECTED" | "PENDING_REVIEW";

// Define the opportunities table schema
export const opportunities = pgTable("opportunities", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clientName: text("client_name").notNull(),
  timeline: text("timeline").notNull(),
  budget: text("budget"),
  status: text("status").$type<OpportunityStatus>().default("NEW"),
  userId: uuid("user_id").references(() => users.id).notNull(),
  aiScore: jsonb("ai_score").$type<OpportunityScore>(),
  managerScore: jsonb("manager_score").$type<OpportunityScore>(),
  finalDecision: text("final_decision"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations between opportunities and users
export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  user: one(users, {
    fields: [opportunities.userId],
    references: [users.id],
  }),
}));

// Define the scoring criteria
export interface OpportunityScore {
  leadTimeCheck: number; // 1-4
  projectInsight: number; // 1-4
  clientRelationship: number; // 1-4
  expertiseAlignment: number; // 1-4
  commercialViability: number; // 1-4
  strategicValue: number; // 1-4
  resources: number; // 1-4
  overallScore: number; // Average of all scores
  recommendation: "GO" | "NO_GO";
  comments: string;
}

// Opportunity type for TypeScript
export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert; 