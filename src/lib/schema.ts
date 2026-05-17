import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // SCRUM_MASTER | MANAGER | TEAM_LEAD
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const retroSessions = pgTable("retro_sessions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE | CLOSED
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const retroItems = pgTable("retro_items", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => retroSessions.id, { onDelete: "cascade" }),
  column: text("column").notNull(), // START | STOP | CONTINUE
  content: text("content").notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
  votes: integer("votes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const actionItems = pgTable("action_items", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => retroSessions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: text("assignee_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("OPEN"), // OPEN | IN_PROGRESS | DONE
  carriedFromId: text("carried_from_id"), // önceki retrodan taşınan aksiyon
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
