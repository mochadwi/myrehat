import {
  listingCategories,
  type ListingCategory,
} from "@myrehat-task-b/db/schema/listing";
import { z } from "zod";

export { listingCategories };
export type { ListingCategory };

export type ListingInput = {
  title: string;
  price: number;
  location: string;
  category: ListingCategory;
  whatsapp: string;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Shape oRPC expects on the wire; the 4 categories are enforced here too. */
export const listingInputSchema = z.object({
  title: z.string(),
  price: z.number(),
  location: z.string(),
  category: z.enum(listingCategories),
  whatsapp: z.string(),
});

export function isListingCategory(value: unknown): value is ListingCategory {
  return (
    typeof value === "string" &&
    (listingCategories as readonly string[]).includes(value)
  );
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Pure validation for a BuyHomestay listing. Shared by the oRPC procedure and
 * the web form so a 5th category (or a missing field) can never be stored.
 */
export function validateListingInput(input: unknown): ValidationResult<ListingInput> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Payload listing tidak valid" };
  }

  const raw = input as Record<string, unknown>;
  const title = asTrimmedString(raw.title);
  const location = asTrimmedString(raw.location);
  const whatsapp = asTrimmedString(raw.whatsapp);
  const price = typeof raw.price === "string" ? Number(raw.price) : raw.price;

  if (title.length < 3) {
    return { ok: false, error: "Title minimal 3 karakter" };
  }

  if (typeof price !== "number" || !Number.isInteger(price) || price <= 0) {
    return { ok: false, error: "Price harus angka bulat lebih dari 0" };
  }

  if (location.length < 3) {
    return { ok: false, error: "Location minimal 3 karakter" };
  }

  if (!isListingCategory(raw.category)) {
    return {
      ok: false,
      error: `Category harus salah satu dari: ${listingCategories.join(", ")}`,
    };
  }

  if (!/^\+?[0-9][0-9\s-]{6,}$/.test(whatsapp)) {
    return { ok: false, error: "Kontak WhatsApp tidak valid" };
  }

  return {
    ok: true,
    data: {
      title,
      price,
      location,
      category: raw.category,
      whatsapp,
    },
  };
}
