import { describe, expect, it } from "vitest";
import { phoneRegex } from "./regex.js";

describe("phoneRegex", () => {
  it("validates Chilean numbers", () => {
    expect(phoneRegex.test("56912345678")).toBe(true);
    expect(phoneRegex.test("123")).toBe(false);
  });
});
