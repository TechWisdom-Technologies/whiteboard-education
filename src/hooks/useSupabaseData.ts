import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TableName = "countries" | "universities" | "courses" | "accommodations" | "scholarships" | "language_centers" | "blogs" | "events" | "leads" | "intake_reminders" | "account_managers" | "platform_tutorials";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useTableData(table: TableName, options?: { select?: string; orderBy?: string }) {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const orderCol = options?.orderBy || "created_at";
      const ascending = !!options?.orderBy;
      const dir = ascending ? "asc" : "desc";
      const selectParam = options?.select || "*";

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

      const fetchPage = async (offset: number, authToken: string) => {
        const url = `${baseUrl}&offset=${offset}&limit=${1000}`;
        const res = await fetch(url, {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${authToken}`,
          },
        });
        return res;
      };
      
      let allData: any[] = [];
      let offset = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        let res = await fetchPage(offset, token);

        // If a user-session token returned 401 (expired/stale), retry with the anon key
        if (res.status === 401 && token !== SUPABASE_KEY) {
          token = SUPABASE_KEY;
          res = await fetchPage(offset, token);
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
