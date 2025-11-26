import { createClient } from '@supabase/supabase-js';

// 環境変数から取得（後で設定します）
// 注意: このファイルは現在使用されていません（Vercel API経由でSupabaseにアクセス）
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);





