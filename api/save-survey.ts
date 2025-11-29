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

    const { participantId, surveyResponse } = req.body;

    if (!participantId || !surveyResponse) {
      return res.status(400).json({ error: 'Missing participantId or surveyResponse' });
    }

    // データベースに挿入
    // 注意: PostgreSQLでは引用符なしの識別子は小文字に変換されるため、小文字で指定
    const { data, error } = await supabase
      .from('experiment_surveys')
      .insert({
        participant_id: participantId,
        task: surveyResponse.task,
        preferred_condition: surveyResponse.preferredCondition,
        timestamp: surveyResponse.timestamp,
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

