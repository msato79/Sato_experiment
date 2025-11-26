-- experiment_surveysテーブルの確認と修正用SQL

-- 1. テーブルが存在するか確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'experiment_surveys';

-- 2. テーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'experiment_surveys'
ORDER BY ordinal_position;

-- 3. テーブルが存在しない場合、またはカラムが不足している場合は再作成
-- 既存のテーブルを削除（データがある場合は注意）
-- DROP TABLE IF EXISTS experiment_surveys CASCADE;

-- 4. テーブルを再作成
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

-- 5. インデックスを作成
CREATE INDEX IF NOT EXISTS idx_experiment_surveys_participant_id ON experiment_surveys(participant_id);
CREATE INDEX IF NOT EXISTS idx_experiment_surveys_task ON experiment_surveys(task);

-- 6. RLSを有効化
ALTER TABLE experiment_surveys ENABLE ROW LEVEL SECURITY;

-- 7. RLSポリシーを作成
DROP POLICY IF EXISTS "Allow service role full access to experiment_surveys" ON experiment_surveys;
CREATE POLICY "Allow service role full access to experiment_surveys"
ON experiment_surveys
FOR ALL
USING (true)
WITH CHECK (true);

-- 8. 確認: テーブル構造を再度確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'experiment_surveys'
ORDER BY ordinal_position;

