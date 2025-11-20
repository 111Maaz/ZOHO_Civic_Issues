const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateTrackingId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CIV-${date}-${random}`;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Optional secret protection
    const secret = req.headers["x-bot-secret"];
    if (process.env.BOT_SECRET && secret !== process.env.BOT_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body;

    const {
      issue_type,
      description,
      location_text,
      location_lat,
      location_lng,
      reporter_name,
      reporter_phone,
      reporter_email,
      image_file_url,
      image_base64
    } = body;

    // 1. Determine department
    const { data: deptMatch } = await supabase
      .from("departments")
      .select("*")
      .ilike("name", `%${issue_type}%`)
      .limit(1);

    let department = deptMatch?.[0];

    // Fallback: first department in DB
    if (!department) {
      const { data: firstDept } = await supabase
        .from("departments")
        .select("*")
        .limit(1);
      department = firstDept?.[0];
    }

    // 2. Generate tracking ID
    const tracking_id = generateTrackingId();

    // 3. Handle image upload
    let image_path = null;

    if (image_base64 || image_file_url) {
      let buffer;

      if (image_base64) {
        buffer = Buffer.from(image_base64, "base64");
      } else {
        const resp = await fetch(image_file_url);
        const arr = await resp.arrayBuffer();
        buffer = Buffer.from(arr);
      }

      const fileName = `issue-${Date.now()}.jpg`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("issue-images")
        .upload(fileName, buffer, {
          contentType: "image/jpeg"
        });

      if (!uploadError) {
        image_path = uploadData.path;
      }
    }

    // 4. Insert issue
    const { data: issue, error } = await supabase
      .from("issues")
      .insert([
        {
          tracking_id,
          reporter_name,
          reporter_phone,
          reporter_email,
          issue_type,
          department_id: department?.id || null,
          description,
          location_text,
          location_lat,
          location_lng,
          image_path,
          status: "open"
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "DB Insert failed", details: error });
    }

    // 5. Insert history record
    await supabase.from("issue_history").insert([
      {
        issue_id: issue.id,
        old_status: null,
        new_status: "open",
        note: "Issue created",
        changed_by: reporter_name || "Anonymous"
      }
    ]);

    // 6. (Optional) Department webhook notify
    if (department?.webhook_url) {
      try {
        await fetch(department.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "new_issue",
            tracking_id,
            issue
          })
        });
      } catch (err) {
        console.log("Department webhook failed:", err);
      }
    }

    return res.json({ ok: true, tracking_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
