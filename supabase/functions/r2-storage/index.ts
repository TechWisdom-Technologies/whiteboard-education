
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = Deno.env.get("R2_BUCKET_NAME")!;

const s3 = new S3Client({
  region: "auto",
  endpoint: Deno.env.get("R2_ENDPOINT")!,
  credentials: {
    accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
    secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
  },
});

const UPLOAD_EXPIRY = 300;
const DOWNLOAD_EXPIRY = 600;

const studentFields = [
  "passport_url",
  "passport_photo_url",
  "academic_transcript_url",
  "ielts_certificate_url",
  "personal_statement_url",
  "recommendation_letter_url",
  "cv_url",
  "research_proposal_url",
];

const partnerFields = [
  "trade_license_url",
  "nid_document_url",
];

const otherDocumentField = (field: string) =>
  /^(transcript|certificate)_[a-z0-9_-]+$/.test(field) ||
  ["cv_url", "research_proposal_url", "job_experience_url", "study_gap_url"].includes(field);

const allowedContentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function response(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      try {
        if (req.method !== "POST") {
          return response("Method not allowed", 405);
        }

        const userId = ctx.userClaims?.id;

        if (!userId) {
          return response("Unauthorized", 401);
        }

        const body = await req.json();

        const {
          action,
          recordType,
          recordId,
          field,
          objectKey,
          fileName,
          contentType,
        } = body;

        if (
          !["student", "partner", "profile"].includes(recordType) ||
          typeof recordId !== "string" ||
          typeof field !== "string"
        ) {
          return response("Invalid request");
        }

        const isAdminResult = await ctx.supabase.rpc("has_role", {
          _user_id: userId,
          _role: "admin",
        });

        if (isAdminResult.error) {
          throw isAdminResult.error;
        }

        const isAdmin = isAdminResult.data === true;

        // Check record ownership using the caller's RLS-scoped client.
        let record: any;

        if (recordType === "student") {
          if (
            !studentFields.includes(field) &&
            !otherDocumentField(field)
          ) {
            return response("Unsupported student document field");
          }

          const { data, error } = await ctx.supabase
            .from("students")
            .select("*")
            .eq("id", recordId)
            .maybeSingle();

          if (error) throw error;
          if (!data) return response("Student not found or access denied", 403);

          record = data;

          if (!isAdmin) {
            const approved = await ctx.supabase.rpc(
              "is_approved_partner",
              { _user_id: userId },
            );

            if (approved.error) throw approved.error;

            if (!approved.data || record.partner_id !== userId) {
              return response("Access denied", 403);
            }
          }
        } else if (recordType === "partner") {
          if (!partnerFields.includes(field)) {
            return response("Unsupported partner document field");
          }

          const { data, error } = await ctx.supabase
            .from("partner_registrations")
            .select("id, user_id, trade_license_url, nid_document_url")
            .eq("id", recordId)
            .maybeSingle();

          if (error) throw error;
          if (!data) return response("Partner record not found or access denied", 403);

          record = data;

          if (!isAdmin && record.user_id !== userId) {
            return response("Access denied", 403);
          }
        } else if (recordType === "profile") {
          if (field !== "avatar_url") {
            return response("Unsupported profile document field");
          }

          if (recordId !== userId) {
            return response("Access denied", 403);
          }

          const { data, error } = await ctx.supabase
            .from("profiles")
            .select("id, user_id, avatar_url")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;
          if (!data) return response("Profile not found or access denied", 403);

          record = data;
        }

        // Generate a temporary upload URL.
        if (action === "create-upload") {
          if (
            typeof fileName !== "string" ||
            fileName.length > 180 ||
            typeof contentType !== "string" ||
            !allowedContentTypes.includes(contentType)
          ) {
            return response("Invalid file information");
          }

          const safeName = fileName
            .split(/[\\/]/)
            .pop()!
            .replace(/[^a-zA-Z0-9._-]/g, "_");

          const prefix =
            recordType === "student"
              ? "students"
              : recordType === "partner"
              ? "partners"
              : "profiles";

          const targetId = recordType === "profile" ? record.user_id : recordId;

          const key =
            `${prefix}/${targetId}/${field}/${crypto.randomUUID()}-${safeName}`;

          const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
          });

          const uploadUrl = await getSignedUrl(s3, command, {
            expiresIn: UPLOAD_EXPIRY,
          });

          return Response.json({
            uploadUrl,
            objectKey: key,
            expiresIn: UPLOAD_EXPIRY,
            requiredContentType: contentType,
          });
        }

        // Generate a temporary download URL.
        if (action === "create-download") {
          if (typeof objectKey !== "string") {
            return response("Missing object key");
          }

          const storedValue = otherDocumentField(field)
            ? record.other_documents?.[field]
            : record[field];

          // The requested key must match the database reference.
          if (!storedValue || storedValue !== objectKey) {
            return response("Document not found or access denied", 403);
          }

          const prefix =
            recordType === "student"
              ? "students"
              : recordType === "partner"
              ? "partners"
              : "profiles";

          const targetId = recordType === "profile" ? record.user_id : recordId;

          if (!objectKey.startsWith(`${prefix}/${targetId}/${field}/`)) {
            return response("Invalid document path", 403);
          }

          const command = new GetObjectCommand({
            Bucket: bucket,
            Key: objectKey,
          });

          const downloadUrl = await getSignedUrl(s3, command, {
            expiresIn: DOWNLOAD_EXPIRY,
          });

          return Response.json({
            downloadUrl,
            expiresIn: DOWNLOAD_EXPIRY,
          });
        }

        return response("Unknown action");
      } catch (error) {
        console.error("R2 storage error:", error);

        return response("Storage operation failed", 500);
      }
    },
  ),
};
