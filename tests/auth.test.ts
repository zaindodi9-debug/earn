import { describe, expect, test } from "bun:test";
import { createToken, hashPassword, verifyPassword, verifyToken } from "../src/lib/auth";

describe("authentication primitives", () => {
  test("password hashes verify only the matching password", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(verifyPassword("correct horse battery staple", stored)).toBe(true);
    expect(verifyPassword("incorrect password", stored)).toBe(false);
  });

  test("malformed stored password hashes fail closed", () => {
    expect(verifyPassword("anything", "")).toBe(false);
    expect(verifyPassword("anything", "salt:hash")).toBe(false);
    expect(verifyPassword("anything", `${"a".repeat(32)}:${"a".repeat(127)}`)).toBe(false);
    expect(verifyPassword("anything", `${"z".repeat(32)}:${"z".repeat(128)}`)).toBe(false);
  });

  test("a valid signed session token round-trips", () => {
    const token = createToken("test-user-123");
    const payload = verifyToken(token);
    expect(payload?.uid).toBe("test-user-123");
    expect(payload?.exp).toBeGreaterThan(Date.now());
  });

  test("tampered and malformed session tokens are rejected", () => {
    const [body, signature] = createToken("test-user-123").split(".");
    const replacement = signature.endsWith("a") ? "b" : "a";
    expect(verifyToken(`${body}.${signature.slice(0, -1)}${replacement}`)).toBeNull();
    expect(verifyToken(`${body}.${signature}.extra`)).toBeNull();
    expect(verifyToken("")).toBeNull();
    expect(verifyToken("not-a-token")).toBeNull();
    expect(verifyToken("a.b.c")).toBeNull();
  });
});
