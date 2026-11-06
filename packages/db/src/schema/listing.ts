import { defineRelationsPart } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

/** The only four categories a BuyHomestay listing may use. */
export const listingCategories = [
  "Buy Property",
  "Buy land to build homestay",
  "Buy Airbnb Profile",
  "Buy Airbnb Business",
] as const;

export type ListingCategory = (typeof listingCategories)[number];

export const listing = pgTable(
  "listing",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    price: integer("price").notNull(),
    location: text("location").notNull(),
    category: text("category").notNull(),
    whatsapp: text("whatsapp").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("listing_userId_idx").on(table.userId),
    index("listing_category_idx").on(table.category),
  ],
);

export const listingRelations = defineRelationsPart({ listing, user }, (r) => ({
  listing: {
    user: r.one.user({
      from: r.listing.userId,
      to: r.user.id,
    }),
  },
}));
