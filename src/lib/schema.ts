import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("TEAM_MEMBER"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const retroSessions = pgTable("retro_sessions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("BRAINSTORMING"),
  phaseStartedAt: timestamp("phase_started_at").defaultNow().notNull(),
  createdById: text("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const retroItems = pgTable("retro_items", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  column: text("column").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id").notNull(),
  votes: integer("votes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const actionItems = pgTable("action_items", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: text("assignee_id"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("OPEN"),
  carriedFromId: text("carried_from_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
