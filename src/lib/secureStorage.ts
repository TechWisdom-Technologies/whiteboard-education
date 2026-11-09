import { supabase } from "@/integrations/supabase/client";

interface DocumentRequest {
  recordType: "student" | "partner" | "profile";
  recordId: string;
  field: string;
  objectKey: string;
}

export async function openSecureDocument({
  recordType,
  recordId,
  field,
  objectKey,
}: DocumentRequest): Promise<void> {
  if (!objectKey) return;

  // Open immediately to avoid browser popup blocking.
  const tab = window.open("about:blank", "_blank");

  try {
    const { data, error } = await supabase.functions.invoke("r2-storage", {
      body: {
        action: "create-download",
        recordType,
        recordId,
        field,
        objectKey,
      },
    });

    if (error) throw error;
    if (!data?.downloadUrl) throw new Error("Download URL unavailable");

    if (tab) {
      tab.location.href = data.downloadUrl;
    } else {
      window.location.href = data.downloadUrl;
    }
  } catch (error) {
    tab?.close();
    console.error("Could not open document:", error);
    alert("Unable to open this document. Please try again.");
  }
}

export async function getSecureImageUrl(
  recordType: "student" | "partner" | "profile",
  recordId: string,
  field: string,
  objectKey: string | null | undefined
): Promise<string | null> {
  if (!objectKey) return null;

  if (objectKey.startsWith("http://") || objectKey.startsWith("https://")) {
    return objectKey;
  }

  const { data, error } = await supabase.functions.invoke("r2-storage", {
    body: {
      action: "create-download",
      recordType,
      recordId,
      field,
      objectKey,
    },
  });

  if (error) throw error;

  return data?.downloadUrl ?? null;
}

/**
 * Checks if a signed URL has expired based on query parameters (token JWT exp, X-Amz-Expires, or Expires).
 */
export function isUrlExpired(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);

    // 1. Supabase token param (JWT with exp)
    const token = url.searchParams.get("token");
    if (token && token.includes(".")) {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = atob(base64);
        const payload = JSON.parse(jsonPayload);
        if (typeof payload.exp === "number") {
          return payload.exp * 1000 <= Date.now() + 5000;
        }
      }
    }

    // 2. S3 / R2 presigned parameters: X-Amz-Date + X-Amz-Expires
    const amzDate = url.searchParams.get("X-Amz-Date");
    const amzExpires = url.searchParams.get("X-Amz-Expires");
    if (amzDate && amzExpires) {
      const year = parseInt(amzDate.slice(0, 4), 10);
      const month = parseInt(amzDate.slice(4, 6), 10) - 1;
      const day = parseInt(amzDate.slice(6, 8), 10);
      const hour = parseInt(amzDate.slice(9, 11), 10);
      const min = parseInt(amzDate.slice(11, 13), 10);
      const sec = parseInt(amzDate.slice(13, 15), 10);
      const startTime = Date.UTC(year, month, day, hour, min, sec);
      const expiryTime = startTime + parseInt(amzExpires, 10) * 1000;
      if (expiryTime <= Date.now() + 5000) {
        return true;
      }
    }

    // 3. Generic Expires param (UNIX epoch seconds)
    const expires = url.searchParams.get("Expires");
    if (expires && !isNaN(Number(expires))) {
      const expiryTime = Number(expires) * 1000;
      if (expiryTime <= Date.now() + 5000) {
        return true;
      }
    }
  } catch {
    // Non-URL string
  }
  return false;
}

/**
 * Resolves an avatar URL or R2 object key into a displayable image URL.
 * - R2 profile object keys (`profiles/{userId}/avatar_url/...`) generate a signed download URL via R2.
 * - External URLs (e.g. Google, Unsplash) and unexpired signed URLs are returned directly.
 * - If expired or invalid, returns null rather than silently returning a broken URL.
 */
export async function resolveAvatarUrl(
  rawUrl: string | null | undefined,
  userId?: string
): Promise<string | null> {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // 1. R2 profile object key: profiles/{userId}/avatar_url/{uuid}-{filename}
  if (trimmed.startsWith("profiles/")) {
    const parts = trimmed.split("/");
    const targetUserId = userId || (parts.length > 1 ? parts[1] : undefined);
    if (!targetUserId) return null;

    try {
      const { data, error } = await supabase.functions.invoke("r2-storage", {
        body: {
          action: "create-download",
          recordType: "profile",
          recordId: targetUserId,
          field: "avatar_url",
          objectKey: trimmed,
        },
      });

      if (error) {
        console.warn("Could not generate R2 signed avatar URL:", error);
        return null;
      }

      return data?.downloadUrl ?? null;
    } catch (err) {
      console.warn("Error invoking r2-storage for avatar:", err);
      return null;
    }
  }

  // 2. HTTP / HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (isUrlExpired(trimmed)) {
      return null;
    }
    return trimmed;
  }

  // Never silently return an invalid or unresolvable URL as valid
  return null;
}
