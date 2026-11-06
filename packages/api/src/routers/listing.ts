import { ORPCError } from "@orpc/server";
import { listing } from "@myrehat-task-b/db/schema/listing";
import { desc } from "drizzle-orm";

import { protectedProcedure, publicProcedure } from "../index";
import { listingInputSchema, validateListingInput } from "../listing";

export const listingRouter = {
  // Only signed-in users may submit a listing.
  create: protectedProcedure.input(listingInputSchema).handler(async ({ input, context }) => {
    const parsed = validateListingInput(input);
    if (!parsed.ok) {
      throw new ORPCError("BAD_REQUEST", { message: parsed.error });
    }

    const [created] = await context.db
      .insert(listing)
      .values({
        id: crypto.randomUUID(),
        title: parsed.data.title,
        price: parsed.data.price,
        location: parsed.data.location,
        category: parsed.data.category,
        whatsapp: parsed.data.whatsapp,
        userId: context.session.user.id,
      })
      .returning();

    return created;
  }),

  list: publicProcedure.handler(async ({ context }) => {
    return context.db.select().from(listing).orderBy(desc(listing.createdAt));
  }),
};
