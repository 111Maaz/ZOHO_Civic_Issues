import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Security check: verify secret header
  if (req.headers["x-bot-secret"] !== process.env.BOT_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const {
    issue_type,
    location_text,
    description,
    image_file_url,
    reporter_name,
    reporter_phone,
    reporter_email
  } = req.body;

  // Generate tracking ID using your SQL function
  const { data: trackingData } = await supabase.rpc("generate_tracking_id");
  const tracking_id = trackingData;

  // Insert issue
  const { data, error } = await supabase
    .from("issues")
    .insert([
      {
        tracking_id,
        issue_type,
        description,
        location_text,
        reporter_name,
        reporter_phone,
        reporter_email,
        image_path: image_file_url || null
      }
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // RETURN tracking_id FOR ZOHO
  return res.status(200).json({
    status: "success",
    tracking_id: tracking_id
  });
}
