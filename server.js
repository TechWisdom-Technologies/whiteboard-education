import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// PostgreSQL Connection Pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error acquiring client from pool:", err.stack);
  } else {
    console.log("🐘 Connected to Local PostgreSQL Database successfully!");
    release();
  }
});

// Helper to map Supabase table names to local database queries
// Generates basic SELECT/INSERT/UPDATE/DELETE dynamically
app.get(["/api/:table", "/rest/v1/:table"], async (req, res) => {
  const { table } = req.params;
  const queryParams = req.query;

  try {
    let sql = `SELECT * FROM public.${table}`;
    const values = [];
    const whereClauses = [];

    // Filter by columns passed as query params (e.g., ?id=abc or ?university_id=xyz)
    let valIndex = 1;
    for (const [key, val] of Object.entries(queryParams)) {
      if (["select", "order", "limit", "offset"].includes(key)) continue;
      
      if (val === "null") {
        whereClauses.push(`public.${table}.${key} IS NULL`);
      } else {
        // Handle postgrest syntax like eq.value
        let cleanVal = val;
        if (typeof val === "string" && val.startsWith("eq.")) {
          cleanVal = val.substring(3);
        }
        whereClauses.push(`public.${table}.${key} = $${valIndex}`);
        values.push(cleanVal);
        valIndex++;
      }
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Ordering
    if (queryParams.order) {
      // Format: order=column.asc or order=column.desc
      const [col, dir] = queryParams.order.toString().split(".");
      sql += ` ORDER BY public.${table}.${col} ${dir === "desc" ? "DESC" : "ASC"}`;
    }

    // Limit & Offset
    if (queryParams.limit) {
      sql += ` LIMIT ${parseInt(queryParams.limit.toString())}`;
    }
    if (queryParams.offset) {
      sql += ` OFFSET ${parseInt(queryParams.offset.toString())}`;
    }

    const result = await pool.query(sql, values);
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching from ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Get single row helper (Supabase .single())
app.get(["/api/:table/single", "/rest/v1/:table/single"], async (req, res) => {
  const { table } = req.params;
  const queryParams = req.query;

  try {
    let sql = `SELECT * FROM public.${table}`;
    const values = [];
    const whereClauses = [];

    let valIndex = 1;
    for (const [key, val] of Object.entries(queryParams)) {
      let cleanVal = val;
      if (typeof val === "string" && val.startsWith("eq.")) {
        cleanVal = val.substring(3);
      }
      whereClauses.push(`public.${table}.${key} = $${valIndex}`);
      values.push(cleanVal);
      valIndex++;
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }
    sql += ` LIMIT 1`;

    const result = await pool.query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Row not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insert Row
app.post(["/api/:table", "/rest/v1/:table"], async (req, res) => {
  const { table } = req.params;
  const row = req.body;

  try {
    const columns = Object.keys(row).join(", ");
    const placeholders = Object.keys(row).map((_, i) => `$${i + 1}`).join(", ");
    const values = Object.values(row);

    const sql = `INSERT INTO public.${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(`Error inserting into ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk Upsert Row (custom endpoint for useBulkUpsertRows)
app.post(["/api/:table/upsert", "/rest/v1/:table/upsert"], async (req, res) => {
  const { table } = req.params;
  const rows = req.body; // Expects an array

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.json([]);
  }

  try {
    const affectedIds = [];
    for (const row of rows) {
      const columns = Object.keys(row).join(", ");
      const placeholders = Object.keys(row).map((_, i) => `$${i + 1}`).join(", ");
      const values = Object.values(row);
      
      // Build ON CONFLICT clause assuming 'id' is the primary key
      const updates = Object.keys(row)
        .filter(k => k !== "id")
        .map((k, i) => `${k} = EXCLUDED.${k}`)
        .join(", ");

      let sql = `INSERT INTO public.${table} (${columns}) VALUES (${placeholders})`;
      if (updates) {
        sql += ` ON CONFLICT (id) DO UPDATE SET ${updates}`;
      } else {
        sql += ` ON CONFLICT (id) DO NOTHING`;
      }
      sql += ` RETURNING id`;

      const result = await pool.query(sql, values);
      if (result.rows[0]) {
        affectedIds.push(result.rows[0]);
      }
    }
    res.json(affectedIds);
  } catch (err) {
    console.error(`Error upserting into ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Update Row
app.patch(["/api/:table", "/rest/v1/:table"], async (req, res) => {
  const { table } = req.params;
  const { id, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing row ID for update" });
  }

  try {
    const setClauses = [];
    const values = [];
    let valIndex = 1;

    for (const [key, val] of Object.entries(updates)) {
      setClauses.push(`${key} = $${valIndex}`);
      values.push(val);
      valIndex++;
    }

    values.push(id);
    const sql = `UPDATE public.${table} SET ${setClauses.join(", ")} WHERE id = $${valIndex} RETURNING *`;
    const result = await pool.query(sql, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Row not found for update" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Row
app.delete(["/api/:table", "/rest/v1/:table"], async (req, res) => {
  const { table } = req.params;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing row ID for delete" });
  }

  try {
    const sql = `DELETE FROM public.${table} WHERE id = $1 RETURNING *`;
    const result = await pool.query(sql, [id]);
    res.json({ message: "Deleted successfully", deleted: result.rows[0] });
  } catch (err) {
    console.error(`Error deleting from ${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// MOCK AUTH ENDPOINTS
// ================================================================
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, options } = req.body;
  try {
    // 1. Create user in auth.users
    const userSql = `INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data) VALUES ($1, $2, $3) RETURNING *`;
    const userResult = await pool.query(userSql, [email, password || "", JSON.stringify(options?.data || {})]);
    const user = userResult.rows[0];

    // 2. Assign 'user' role by default
    await pool.query(`INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'user')`, [user.id]);

    // 3. Create profile via trigger or manually
    // Since our local-db-setup has the handles_new_user trigger, it will auto-create profile!

    res.json({ data: { user, session: { access_token: "mock-token", user } }, error: null });
  } catch (err) {
    res.json({ data: { user: null, session: null }, error: { message: err.message } });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query(`SELECT * FROM auth.users WHERE email = $1`, [email]);
    if (userResult.rows.length === 0) {
      return res.json({ data: { user: null, session: null }, error: { message: "User not found" } });
    }
    const user = userResult.rows[0];
    
    // Verify password using bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.encrypted_password || "");
    if (!isPasswordValid) {
      return res.json({ data: { user: null, session: null }, error: { message: "Invalid password" } });
    }

    res.json({ data: { user, session: { access_token: "mock-token", user } }, error: null });
  } catch (err) {
    res.json({ data: { user: null, session: null }, error: { message: err.message } });
  }
});

app.get("/api/auth/session", (req, res) => {
  // Return a mock session or empty
  res.json({ data: { session: null }, error: null });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Local API Server is running on http://localhost:${PORT}`);
});
