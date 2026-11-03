import { describe, it, expect, vi } from "vitest";
import { extractStoragePath, getSecureDocumentUrl } from "@/lib/secureStorage";

describe("secureStorage Utility", () => {
  it("extracts path from public storage URL", () => {
    const url = "https://xyz.supabase.co/storage/v1/object/public/student-documents/user123/student456/passport.pdf";
    const path = extractStoragePath("student-documents", url);
    expect(path).toBe("user123/student456/passport.pdf");
  });

  it("extracts path from signed storage URL with query params", () => {
    const url = "https://xyz.supabase.co/storage/v1/object/sign/partner-documents/user123/trade_license.pdf?token=abc123xyz";
    const path = extractStoragePath("partner-documents", url);
    expect(path).toBe("user123/trade_license.pdf");
  });

  it("handles relative path as-is", () => {
    const path = "user123/student456/transcript.pdf";
    expect(extractStoragePath("student-documents", path)).toBe("user123/student456/transcript.pdf");
  });

  it("preserves public bucket URLs without signing", async () => {
    const publicUrl = "https://xyz.supabase.co/storage/v1/object/public/universities/taylors-logo.png";
    const result = await getSecureDocumentUrl("universities", publicUrl);
    expect(result).toBe(publicUrl);
  });
});

