-- ============================================
-- Supabaseデータベース設定用SQLスクリプト
-- ============================================
-- このファイルをSupabaseのSQL Editorで実行してください
-- 実行順序: 1. テーブル作成 → 2. インデックス作成 → 3. RLS設定

-- ============================================
-- 1. テーブルの作成
-- ============================================

-- トライアル結果を保存するテーブル
CREATE TABLE IF NOT EXISTS experiment_results (
  id BIGSERIAL PRIMARY KEY,
  participant_id TEXT NOT NULL,
  task TEXT NOT NULL CHECK (task IN ('A', 'B')),
  trial_id TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('A', 'B', 'C', 'D')),
  axis_offset INTEGER NOT NULL CHECK (axis_offset IN (0, 1)),
  graph_file TEXT NOT NULL,
  node_pair_id TEXT,
  set_id INTEGER CHECK (set_id BETWEEN 1 AND 4),  -- ラテン方格法用
  node1 INTEGER,  -- ノード1のID（分析用）
  node2 INTEGER,  -- ノード2のID（分析用）
  highlighted_nodes TEXT NOT NULL,  -- カンマ区切り文字列 (例: "7,8")
  answer TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  reaction_time_ms INTEGER NOT NULL,
  click_count INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- タスク終了後のアンケート結果を保存するテーブル
CREATE TABLE IF NOT EXISTS experiment_surveys (
  id BIGSERIAL PRIMARY KEY,
  participant_id TEXT NOT NULL,
  task TEXT NOT NULL CHECK (task IN ('A', 'B')),
  ranking_A INTEGER NOT NULL CHECK (ranking_A BETWEEN 1 AND 4),
  ranking_B INTEGER NOT NULL CHECK (ranking_B BETWEEN 1 AND 4),
  ranking_C INTEGER NOT NULL CHECK (ranking_C BETWEEN 1 AND 4),
  ranking_D INTEGER NOT NULL CHECK (ranking_D BETWEEN 1 AND 4),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, task)  -- 1被験者につき1タスク1アンケート
);

-- 実験の開始・終了時刻を記録するテーブル（オプション）
CREATE TABLE IF NOT EXISTS experiment_completions (
  id BIGSERIAL PRIMARY KEY,
  participant_id TEXT NOT NULL UNIQUE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. インデックスの作成
-- ============================================

-- experiment_resultsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_experiment_results_participant_id ON experiment_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_experiment_results_node_pair_id ON experiment_results(node_pair_id);
CREATE INDEX IF NOT EXISTS idx_experiment_results_set_id ON experiment_results(set_id);
CREATE INDEX IF NOT EXISTS idx_experiment_results_condition ON experiment_results(condition);
CREATE INDEX IF NOT EXISTS idx_experiment_results_task ON experiment_results(task);
CREATE INDEX IF NOT EXISTS idx_experiment_results_timestamp ON experiment_results(timestamp);

-- experiment_surveysテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_experiment_surveys_participant_id ON experiment_surveys(participant_id);
CREATE INDEX IF NOT EXISTS idx_experiment_surveys_task ON experiment_surveys(task);

-- experiment_completionsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_experiment_completions_participant_id ON experiment_completions(participant_id);

-- ============================================
-- 3. Row Level Security (RLS) の設定
-- ============================================

-- RLSを有効化
ALTER TABLE experiment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_completions ENABLE ROW LEVEL SECURITY;

-- Service Role Keyでの全アクセスを許可（Vercel API経由）
-- 注意: Service Role Keyは管理者権限を持つため、サーバー側でのみ使用してください

-- experiment_resultsテーブルのポリシー
DROP POLICY IF EXISTS "Allow service role full access to experiment_results" ON experiment_results;
CREATE POLICY "Allow service role full access to experiment_results"
ON experiment_results
FOR ALL
USING (true)
WITH CHECK (true);

-- experiment_surveysテーブルのポリシー
DROP POLICY IF EXISTS "Allow service role full access to experiment_surveys" ON experiment_surveys;
CREATE POLICY "Allow service role full access to experiment_surveys"
ON experiment_surveys
FOR ALL
USING (true)
WITH CHECK (true);

-- experiment_completionsテーブルのポリシー
DROP POLICY IF EXISTS "Allow service role full access to experiment_completions" ON experiment_completions;
CREATE POLICY "Allow service role full access to experiment_completions"
ON experiment_completions
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- 4. 確認用クエリ（実行後、データが正しく保存されるか確認）
-- ============================================

-- テーブル一覧の確認
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name LIKE 'experiment%';

-- テーブル構造の確認
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'experiment_results'
-- ORDER BY ordinal_position;

