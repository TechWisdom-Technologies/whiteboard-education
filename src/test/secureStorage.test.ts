import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSecureImageUrl, resolveAvatarUrl, isUrlExpired } from "@/lib/secureStorage";
import { FunctionsClient } from "@supabase/functions-js";

describe("secureStorage Utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null if objectKey is falsy", async () => {
    expect(await getSecureImageUrl("student", "123", "passport_photo_url", null)).toBeNull();
    expect(await getSecureImageUrl("student", "123", "passport_photo_url", "")).toBeNull();
    expect(await getSecureImageUrl("student", "123", "passport_photo_url", undefined)).toBeNull();
    expect(await getSecureImageUrl("profile", "u1", "avatar_url", null)).toBeNull();
  });

  it("returns public http / https URLs as-is without invoking R2", async () => {
    const httpUrl = "http://example.com/photo.jpg";
    const httpsUrl = "https://images.unsplash.com/photo-123";
    expect(await getSecureImageUrl("student", "123", "passport_photo_url", httpUrl)).toBe(httpUrl);
    expect(await getSecureImageUrl("student", "123", "passport_photo_url", httpsUrl)).toBe(httpsUrl);
    expect(await getSecureImageUrl("profile", "u1", "avatar_url", httpsUrl)).toBe(httpsUrl);
  });

  it("getSecureImageUrl invokes r2-storage for profile object keys", async () => {
    const invokeSpy = vi.spyOn(FunctionsClient.prototype, "invoke").mockResolvedValue({
      data: { downloadUrl: "https://r2.example.com/signed-avatar.jpg" },
      error: null,
    } as any);

    const result = await getSecureImageUrl("profile", "u1", "avatar_url", "profiles/u1/avatar_url/uuid-avatar.png");
    expect(result).toBe("https://r2.example.com/signed-avatar.jpg");
    expect(invokeSpy).toHaveBeenCalledWith("r2-storage", {
      body: {
        action: "create-download",
        recordType: "profile",
        recordId: "u1",
        field: "avatar_url",
        objectKey: "profiles/u1/avatar_url/uuid-avatar.png",
      },
    });
  });

  it("resolveAvatarUrl handles falsy and regular external URLs", async () => {
    expect(await resolveAvatarUrl(null)).toBeNull();
    expect(await resolveAvatarUrl("")).toBeNull();
    expect(await resolveAvatarUrl("   ")).toBeNull();
    expect(await resolveAvatarUrl("https://example.com/avatar.png")).toBe("https://example.com/avatar.png");
  });

  it("resolveAvatarUrl resolves R2 profile object keys into signed URLs", async () => {
    const invokeSpy = vi.spyOn(FunctionsClient.prototype, "invoke").mockResolvedValue({
      data: { downloadUrl: "https://r2.example.com/signed-download-url" },
      error: null,
    } as any);

    const r2Key = "profiles/user-456/avatar_url/abc-123-photo.jpg";
    const result = await resolveAvatarUrl(r2Key);

    expect(result).toBe("https://r2.example.com/signed-download-url");
    expect(invokeSpy).toHaveBeenCalledWith("r2-storage", {
      body: {
        action: "create-download",
        recordType: "profile",
        recordId: "user-456",
        field: "avatar_url",
        objectKey: r2Key,
      },
    });
  });

  it("resolveAvatarUrl returns null if R2 resolution fails rather than returning raw key", async () => {
    vi.spyOn(FunctionsClient.prototype, "invoke").mockResolvedValue({
      data: null,
      error: new Error("R2 access denied"),
    } as any);

    const r2Key = "profiles/user-456/avatar_url/abc-123-photo.jpg";
    const result = await resolveAvatarUrl(r2Key);

    expect(result).toBeNull();
  });

  it("detects expired tokens and does not silently return expired URLs as valid", async () => {
    // Generate an expired JWT token (exp in the past)
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const expiredPayload = btoa(JSON.stringify({ exp: pastExp }));
    const expiredToken = `eyJhbGciOiJIUzI1NiJ9.${expiredPayload}.signature`;
    const expiredUrl = `https://example.com/storage/v1/object/sign/other-bucket/photo.jpg?token=${expiredToken}`;

    expect(isUrlExpired(expiredUrl)).toBe(true);

    const resolved = await resolveAvatarUrl(expiredUrl);
    expect(resolved).toBeNull();
  });

  it("allows unexpired tokens with future expiration", async () => {
    // Generate a future JWT token
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const futurePayload = btoa(JSON.stringify({ exp: futureExp }));
    const validToken = `eyJhbGciOiJIUzI1NiJ9.${futurePayload}.signature`;
    const validUrl = `https://example.com/images/avatar.jpg?token=${validToken}`;

    expect(isUrlExpired(validUrl)).toBe(false);

    const resolved = await resolveAvatarUrl(validUrl);
    expect(resolved).toBe(validUrl);
  });
});
