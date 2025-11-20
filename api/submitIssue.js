export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    // Verify Bot Secret
    if (req.headers["x-bot-secret"] !== process.env.BOT_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    try {
      const {
        issue_type,
        location_text,
        description,
        image_file_url,
        reporter_name,
        reporter_phone,
        reporter_email,
      } = req.body;
  
      const tracking_id = `CIV-${Date.now()}`;
  
      const { data, error } = await supabase
        .from("issues")
        .insert({
          tracking_id,
          issue_type,
          location_text,
          description,
          image_path: image_file_url,
          reporter_name,
          reporter_phone,
          reporter_email
        })
        .select()
        .single();
  
      if (error) throw error;
  
      // ** THIS RESPONSE IS REQUIRED BY ZOHO TO MARK SUCCESS **
      return res.status(200).json({
        success: true,
        tracking_id,
      });
  
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
  