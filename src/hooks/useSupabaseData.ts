import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TableName = "countries" | "universities" | "courses" | "accommodations" | "scholarships" | "language_centers" | "blogs" | "events" | "leads" | "intake_reminders" | "account_managers" | "platform_tutorials" | "partner_notices" | "partner_documents" | "departments";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useTableData(table: TableName, options?: { select?: string; orderBy?: string }) {
  const selectParam = options?.select || "*";
  const orderCol = options?.orderBy || "created_at";
  const ascending = !!options?.orderBy;
  const dir = ascending ? "asc" : "desc";

  return useQuery({
    queryKey: [table, selectParam, orderCol, dir],
    queryFn: async () => {
      // Use user's session token if available (needed for RLS-protected tables like leads).
      // On hard page reload getSession() may return a stale/expired token before the
      // async refresh completes, so we fall back to the anon key on 401 responses.
      let token = SUPABASE_KEY;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          token = sessionData.session.access_token;
        }
      } catch {
        // Auth not ready yet – fall back to the anonymous key
      }

      const baseUrl = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(selectParam)}&order=${orderCol}.${dir}`;

      const fetchPage = async (offset: number, authToken: string, wantCount = false) => {
        const url = `${baseUrl}&offset=${offset}&limit=${1000}`;
        const headers: Record<string, string> = {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${authToken}`,
        };
        if (wantCount) {
          headers["Prefer"] = "count=exact";
        }
        const res = await fetch(url, { headers });
        return res;
      };

      const limit = 1000;

      // 1. Fetch first page with count=exact to get batch 1 + total count in a single request
      let firstRes = await fetchPage(0, token, true);
      if (firstRes.status === 401 && token !== SUPABASE_KEY) {
        token = SUPABASE_KEY;
        firstRes = await fetchPage(0, token, true);
      }

      if (!firstRes.ok) {
        const err = await firstRes.text();
        throw new Error(err || firstRes.statusText);
      }

      const firstData = await firstRes.json();
      if (!Array.isArray(firstData)) {
        return firstData;
      }

      // Read total count from content-range header (e.g. "0-999/4365")
      const contentRange = firstRes.headers.get("content-range");
      let totalCount = 0;
      if (contentRange && contentRange.includes("/")) {
        const totalStr = contentRange.split("/")[1];
        totalCount = parseInt(totalStr, 10) || 0;
      }

      // If all data fit in the first batch, return immediately (fastest path for 95% of tables)
      if (firstData.length < limit || (totalCount > 0 && totalCount <= limit)) {
        return firstData;
      }

      // 2. If there are more records and totalCount is known, fetch remaining batches IN PARALLEL!
      if (totalCount > limit) {
        const offsets: number[] = [];
        for (let off = limit; off < totalCount; off += limit) {
          offsets.push(off);
        }

        const remainingPages = await Promise.all(
          offsets.map(async (off) => {
            let res = await fetchPage(off, token, false);
            if (res.status === 401 && token !== SUPABASE_KEY) {
              res = await fetchPage(off, SUPABASE_KEY, false);
            }
            if (!res.ok) {
              const err = await res.text();
              throw new Error(err || res.statusText);
            }
            return res.json();
          })
        );

        return [firstData, ...remainingPages].flat();
      }

      // Fallback: If content-range was missing, paginate sequentially
      let allData = [...firstData];
      let offset = limit;
      let hasMore = true;

      while (hasMore) {
        let res = await fetchPage(offset, token, false);
        if (res.status === 401 && token !== SUPABASE_KEY) {
          token = SUPABASE_KEY;
          res = await fetchPage(offset, token, false);
        }

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || res.statusText);
        }

        const data = await res.json();
        allData = allData.concat(data);

        if (data.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }

      return allData;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes – avoid redundant refetches on navigation
  });
}

export function useInsertRow(table: TableName) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (row: Record<string, any>) => {
      const { data, error } = await (supabase.from as any)(table).insert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Created successfully" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateRow(table: TableName) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...row }: Record<string, any>) => {
      const { data, error } = await (supabase.from as any)(table).update(row).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Updated successfully" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteRow(table: TableName) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Deleted successfully" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useBulkUpsertRows(table: TableName) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rows: Record<string, any>[]) => {
      if (!Array.isArray(rows) || rows.length === 0) return [];

      const prepared = rows.map((row) => {
        const next = { ...row };
        if (next.id === "" || next.id === undefined || next.id === null) {
          delete next.id;
        }
        return next;
      });

      const chunkSize = 200;
      let affected: any[] = [];
      for (let i = 0; i < prepared.length; i += chunkSize) {
        const chunk = prepared.slice(i, i + chunkSize);
        const { data, error } = await (supabase.from as any)(table)
          .upsert(chunk, { onConflict: "id" })
          .select("id");

        if (error) throw error;
        affected = affected.concat(data || []);
      }

      return affected;
    },
    onSuccess: (_data, rows) => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: `Imported ${rows.length} rows successfully` });
    },
    onError: (e: Error) => toast({ title: "Import failed", description: e.message, variant: "destructive" }),
  });
}
