import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the storage object path from a Supabase storage URL or returns the path as-is.
 */
export function extractStoragePath(bucket: string, urlOrPath: string): string {
  if (!urlOrPath) return "";
  const trimmed = urlOrPath.trim();
  
  // If not a full URL, treat as raw path
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Handle /storage/v1/object/public/<bucket>/<path>
  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  if (trimmed.includes(publicMarker)) {
    return decodeURIComponent(trimmed.split(publicMarker)[1].split("?")[0]);
  }

  // Handle /storage/v1/object/sign/<bucket>/<path>
  const signMarker = `/storage/v1/object/sign/${bucket}/`;
  if (trimmed.includes(signMarker)) {
    return decodeURIComponent(trimmed.split(signMarker)[1].split("?")[0]);
  }

  // Fallback: search for bucket name in path
  const bucketIndex = trimmed.indexOf(`/${bucket}/`);
  if (bucketIndex !== -1) {
    return decodeURIComponent(trimmed.substring(bucketIndex + bucket.length + 2).split("?")[0]);
  }

  return trimmed;
}

/**
 * Generates an authenticated signed URL for private bucket objects.
 * Falls back to original URL if bucket is public or signing fails.
 */
export async function getSecureDocumentUrl(
  bucket: string,
  urlOrPath: string,
  expiresInSeconds = 3600
): Promise<string> {
  if (!urlOrPath) return "";

  // The 'universities' bucket is intentionally public
  if (bucket === "universities") {
    return urlOrPath;
  }

  try {
    const path = extractStoragePath(bucket, urlOrPath);
    if (!path) return urlOrPath;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      // Return original URL as fallback for existing public links
      return urlOrPath;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error creating signed URL:", err);
    return urlOrPath;
  }
}

/**
 * Resolves a secure signed URL and opens the document in a new tab.
 */
export async function openSecureDocument(
  bucket: string,
  urlOrPath: string
): Promise<void> {
  if (!urlOrPath) return;
  const secureUrl = await getSecureDocumentUrl(bucket, urlOrPath);
  window.open(secureUrl, "_blank", "noopener,noreferrer");
}

