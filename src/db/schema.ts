import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const cars = pgTable("cars", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: text("status").notNull(),
});
