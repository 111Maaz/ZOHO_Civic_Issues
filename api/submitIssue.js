import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Allow POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate BOT SECRET
  const botSecret = req.headers['x-bot-secret'];
  if (!botSecret || botSecret !== process.env.BOT_SECRET) {
    return res.status(401).json({
      error: 'Unauthorized - invalid secret'
    });
  }

  try {
    const {
      issue_type,
      location_text,
      description,
      image_file_url,
      reporter_name,
      reporter_phone,
      reporter_email
    } = req.body;

    // find department_id from departments table
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .eq('name', issue_type)
      .single();

    const department_id = dept?.id || null;

    // generate tracking ID from DB function
    const { data: trackingData } = await supabase.rpc('generate_tracking_id');
    const tracking_id = trackingData;

    // Insert into issues table
    const { error } = await supabase.from('issues').insert({
      tracking_id,
      issue_type,
      location_text,
      description,
      image_path: image_file_url,
      reporter_name,
      reporter_phone,
      reporter_email,
      department_id
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // SUCCESS RESPONSE TO ZOHO
    return res.status(200).json({
      success: true,
      tracking_id: tracking_id
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Server failure',
      details: err.message
    });
  }
}
