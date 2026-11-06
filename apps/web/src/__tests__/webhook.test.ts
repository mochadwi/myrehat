import { describe, expect, it } from "vitest";

import { listingCategories, validateListingInput } from "@myrehat-task-b/api/listing";
import { buildWahaReply, parseWahaWebhook } from "@myrehat-task-b/api/waha";

const validListing = {
  title: "Cozy 2-bedroom homestay near Ubud",
  price: 750_000_000,
  location: "Ubud, Bali",
  category: "Buy Property",
  whatsapp: "+628123456789",
};

describe("F2 - WAHA webhook validation", () => {
  it("accepts a valid WAHA payload", () => {
    const result = parseWahaWebhook({
      event: "message",
      payload: { from: "+628123456789", body: "Halo, ada homestay di Bali?" },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        event: "message",
        from: "+628123456789",
        body: "Halo, ada homestay di Bali?",
      });
    }
  });

  it("rejects a payload without event", () => {
    const result = parseWahaWebhook({
      payload: { from: "+628123456789", body: "Halo" },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a payload without sender", () => {
    const result = parseWahaWebhook({
      event: "message",
      payload: { body: "Halo" },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a payload with an empty body", () => {
    const result = parseWahaWebhook({
      event: "message",
      payload: { from: "+628123456789", body: "   " },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a non-object payload", () => {
    expect(parseWahaWebhook(null).ok).toBe(false);
    expect(parseWahaWebhook("message").ok).toBe(false);
  });
});

describe("F2 - reply format", () => {
  it("returns exactly { to, reply }", () => {
    const reply = buildWahaReply("+628123456789", "Halo! Ada yang bisa dibantu?");

    expect(Object.keys(reply).sort()).toEqual(["reply", "to"]);
    expect(reply.to).toBe("+628123456789");
    expect(reply.reply).toBe("Halo! Ada yang bisa dibantu?");
  });
});

describe("F1 - listing categories", () => {
  it("has exactly the 4 required categories", () => {
    expect(listingCategories).toEqual([
      "Buy Property",
      "Buy land to build homestay",
      "Buy Airbnb Profile",
      "Buy Airbnb Business",
    ]);
  });

  it("accepts a listing for each of the 4 categories", () => {
    for (const category of listingCategories) {
      const result = validateListingInput({ ...validListing, category });
      expect(result.ok, `category ${category} should be accepted`).toBe(true);
    }
  });

  it("rejects a 5th / unknown category", () => {
    const result = validateListingInput({
      ...validListing,
      category: "Buy Something Else",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Category harus salah satu dari");
    }
  });

  it("rejects a listing with missing fields", () => {
    expect(validateListingInput({ ...validListing, title: "" }).ok).toBe(false);
    expect(validateListingInput({ ...validListing, price: 0 }).ok).toBe(false);
    expect(validateListingInput({ ...validListing, location: "" }).ok).toBe(false);
    expect(validateListingInput({ ...validListing, whatsapp: "abc" }).ok).toBe(false);
  });

  it("trims accepted values", () => {
    const result = validateListingInput({ ...validListing, title: "  Ubud Villa  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("Ubud Villa");
    }
  });
});
