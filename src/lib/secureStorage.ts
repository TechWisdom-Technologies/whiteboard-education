
import { supabase } from "@/integrations/supabase/client";

interface DocumentRequest {
  recordType: "student" | "partner";
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
