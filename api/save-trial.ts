import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS設定（フロントエンドからのアクセスを許可）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 環境変数からSupabase認証情報を取得
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const trialData = req.body;

    // データベースに挿入
    const { data, error } = await supabase
      .from('experiment_results')
      .insert({
        participant_id: trialData.subject_id,
        task: trialData.task,
        trial_id: trialData.trial_id,
        condition: trialData.condition,
        axis_offset: trialData.axis_offset,
        graph_file: trialData.graph_file,
        highlighted_nodes: Array.isArray(trialData.highlighted_nodes) 
          ? trialData.highlighted_nodes.join(',') 
          : trialData.highlighted_nodes,
        answer: trialData.answer,
        correct: trialData.correct,
        reaction_time_ms: trialData.reaction_time_ms,
        click_count: trialData.click_count,
        timestamp: trialData.timestamp,
        survey_clarity: trialData.survey_response?.clarity || null,
        survey_fatigue: trialData.survey_response?.fatigue || null,
        survey_timestamp: trialData.survey_response?.timestamp || null,
      });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}





