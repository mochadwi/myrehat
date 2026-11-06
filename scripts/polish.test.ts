import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateTextMock } = vi.hoisted(() => ({ generateTextMock: vi.fn() }));

vi.mock("ai", () => ({ generateText: generateTextMock }));

const { polishText, SYSTEM_PROMPT } = await import("./polish");

describe("F3 - scripts/polish.ts", () => {
  beforeEach(() => {
    generateTextMock.mockReset();
  });

  it("sends the listing description to the injected OpenCode model", async () => {
    generateTextMock.mockResolvedValue({ text: "Homestay nyaman dekat Ubud." });

    const result = await polishText("homestay bagus murah di ubud", "opencode/mock-model");

    expect(result).toBe("Homestay nyaman dekat Ubud.");
    expect(generateTextMock).toHaveBeenCalledTimes(1);
    expect(generateTextMock).toHaveBeenCalledWith({
      model: "opencode/mock-model",
      system: SYSTEM_PROMPT,
      prompt: "homestay bagus murah di ubud",
    });
  });

  it("skips the AI call for empty input", async () => {
    const result = await polishText("   ", "opencode/mock-model");

    expect(result).toBe("   ");
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("keeps the original text when the model returns nothing", async () => {
    generateTextMock.mockResolvedValue({ text: "" });

    const result = await polishText("deskripsi asli", "opencode/mock-model");

    expect(result).toBe("deskripsi asli");
  });

  it("falls back to the original text when the provider fails", async () => {
    generateTextMock.mockRejectedValue(new Error("opencode server offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await polishText("deskripsi asli", "opencode/mock-model");

    expect(result).toBe("deskripsi asli");
  });
});
