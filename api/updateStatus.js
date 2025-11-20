const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { tracking_id, new_status, note, changed_by } = req.body;

    const { data: issue } = await supabase
      .from("issues")
      .select("*")
      .eq("tracking_id", tracking_id)
      .single();

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Update main issue
    const { error: updateErr } = await supabase
      .from("issues")
      .update({
        status: new_status,
        updated_at: new Date()
      })
      .eq("tracking_id", tracking_id);

    if (updateErr) {
      return res.status(500).json({ error: "Failed to update issue" });
    }

    // Insert into history
    await supabase.from("issue_history").insert([
      {
        issue_id: issue.id,
        old_status: issue.status,
        new_status,
        note,
        changed_by
      }
    ]);

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
};
