# Supabaseデータベース設定手順

このドキュメントでは、実験データを保存するためのSupabaseデータベースの設定手順を説明します。

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成（またはログイン）
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: プロジェクト名（例: `graph-experiment`）
   - **Database Password**: 強力なパスワードを設定（後で必要）
   - **Region**: 最寄りのリージョンを選択（例: `Tokyo (ap-northeast-1)`）
4. 「Create new project」をクリック
5. プロジェクトの作成完了を待つ（1-2分）

## 2. データベーステーブルの作成

Supabaseのダッシュボードで「SQL Editor」を開き、以下のSQLを実行します。

### 2.1. `experiment_results`テーブル（トライアル結果）

```sql
-- トライアル結果を保存するテーブル
CREATE TABLE experiment_results (
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

-- インデックスの作成（クエリパフォーマンス向上）
CREATE INDEX idx_experiment_results_participant_id ON experiment_results(participant_id);
CREATE INDEX idx_experiment_results_node_pair_id ON experiment_results(node_pair_id);
CREATE INDEX idx_experiment_results_set_id ON experiment_results(set_id);
CREATE INDEX idx_experiment_results_condition ON experiment_results(condition);
CREATE INDEX idx_experiment_results_task ON experiment_results(task);
CREATE INDEX idx_experiment_results_timestamp ON experiment_results(timestamp);
```

### 2.2. `experiment_surveys`テーブル（アンケート結果）

```sql
-- タスク終了後のアンケート結果を保存するテーブル
CREATE TABLE experiment_surveys (
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

-- インデックスの作成
CREATE INDEX idx_experiment_surveys_participant_id ON experiment_surveys(participant_id);
CREATE INDEX idx_experiment_surveys_task ON experiment_surveys(task);
```

### 2.3. `experiment_completions`テーブル（実験完了記録、オプション）

```sql
-- 実験の開始・終了時刻を記録するテーブル（オプション）
CREATE TABLE experiment_completions (
  id BIGSERIAL PRIMARY KEY,
  participant_id TEXT NOT NULL UNIQUE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_experiment_completions_participant_id ON experiment_completions(participant_id);
```

## 3. Row Level Security (RLS) の設定

セキュリティのため、RLSを有効化します。

### 3.1. RLSを有効化

```sql
-- RLSを有効化
ALTER TABLE experiment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_completions ENABLE ROW LEVEL SECURITY;
```

### 3.2. サービスロールキーでのアクセスを許可

VercelのAPIエンドポイントからService Role Keyを使用してアクセスするため、以下のポリシーを設定します：

```sql
-- Service Role Keyでの全アクセスを許可（Vercel API経由）
-- 注意: Service Role Keyは管理者権限を持つため、サーバー側でのみ使用してください

-- experiment_resultsテーブル
CREATE POLICY "Allow service role full access to experiment_results"
ON experiment_results
FOR ALL
USING (true)
WITH CHECK (true);

-- experiment_surveysテーブル
CREATE POLICY "Allow service role full access to experiment_surveys"
ON experiment_surveys
FOR ALL
USING (true)
WITH CHECK (true);

-- experiment_completionsテーブル
CREATE POLICY "Allow service role full access to experiment_completions"
ON experiment_completions
FOR ALL
USING (true)
WITH CHECK (true);
```

**重要**: これらのポリシーは、Service Role Keyを使用する場合のみ有効です。フロントエンドから直接アクセスする場合は、より厳格なポリシーが必要です。

## 4. 環境変数の取得

Vercelにデプロイする際に必要な環境変数を取得します。

### 4.1. Supabaseダッシュボードで取得

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の情報をコピー：
   - **Project URL**: `https://xxxxx.supabase.co` の形式
   - **service_role key**: 「service_role」セクションの「secret」キー（⚠️ 注意: このキーは機密情報です）

### 4.2. Vercelに環境変数を設定

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」を開く
3. 以下の環境変数を追加：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | SupabaseプロジェクトURL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Service Role Key（secret） |

**注意**: 
- `SUPABASE_SERVICE_ROLE_KEY`は機密情報です。GitHubにコミットしないでください。
- Vercelの環境変数は、本番環境（Production）、プレビュー環境（Preview）、開発環境（Development）で個別に設定できます。

## 5. データの確認方法

### 5.1. Supabaseダッシュボードで確認

1. Supabaseダッシュボードで「Table Editor」を開く
2. `experiment_results`テーブルを選択
3. 保存されたデータを確認

### 5.2. SQLクエリで確認

SQL Editorで以下のクエリを実行：

```sql
-- 全トライアル結果を確認
SELECT * FROM experiment_results ORDER BY timestamp DESC LIMIT 100;

-- 被験者ごとのトライアル数を確認
SELECT participant_id, COUNT(*) as trial_count 
FROM experiment_results 
GROUP BY participant_id 
ORDER BY participant_id;

-- 条件ごとのトライアル数を確認
SELECT condition, COUNT(*) as trial_count 
FROM experiment_results 
GROUP BY condition 
ORDER BY condition;

-- セットごとの条件割り当てを確認（ラテン方格法の検証）
SELECT set_id, condition, COUNT(*) as count
FROM experiment_results
WHERE set_id IS NOT NULL
GROUP BY set_id, condition
ORDER BY set_id, condition;
```

## 6. データのエクスポート

### 6.1. CSV形式でエクスポート

SQL Editorで以下のクエリを実行し、「Download CSV」をクリック：

```sql
-- 全データをCSV形式でエクスポート
SELECT 
  participant_id,
  task,
  trial_id,
  condition,
  axis_offset,
  graph_file,
  node_pair_id,
  set_id,
  node1,
  node2,
  highlighted_nodes,
  answer,
  correct,
  reaction_time_ms,
  click_count,
  timestamp
FROM experiment_results
ORDER BY participant_id, timestamp;
```

### 6.2. アンケート結果のエクスポート

```sql
SELECT 
  participant_id,
  task,
  ranking_A,
  ranking_B,
  ranking_C,
  ranking_D,
  timestamp
FROM experiment_surveys
ORDER BY participant_id, task;
```

## 7. トラブルシューティング

### 7.1. データが保存されない場合

1. **環境変数の確認**
   - Vercelの環境変数が正しく設定されているか確認
   - 環境変数名にタイポがないか確認

2. **APIエンドポイントの確認**
   - Vercelの「Functions」タブでAPIエンドポイントのログを確認
   - エラーメッセージを確認

3. **Supabaseのログ確認**
   - Supabaseダッシュボードで「Logs」→「Postgres Logs」を確認
   - エラーメッセージを確認

### 7.2. RLSエラーの場合

Service Role Keyを使用している場合、RLSポリシーは無視されます。エラーが発生する場合は、以下を確認：

1. 環境変数`SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか
2. APIエンドポイントでService Role Keyを使用しているか（`createClient`の第2引数）

### 7.3. テーブルが存在しないエラーの場合

1. SQL Editorでテーブルが作成されているか確認：
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. テーブル名にタイポがないか確認（`experiment_results`）

## 8. セキュリティのベストプラクティス

1. **Service Role Keyの保護**
   - Service Role Keyはサーバー側（Vercel API）でのみ使用
   - フロントエンドコードに含めない
   - GitHubにコミットしない

2. **RLSの活用**
   - フロントエンドから直接アクセスする場合は、適切なRLSポリシーを設定
   - 現在の実装では、Vercel API経由のみでアクセスするため、Service Role Keyを使用

3. **定期的なバックアップ**
   - Supabaseの自動バックアップを有効化
   - 重要なデータは定期的にエクスポート

## 9. 次のステップ

データベースの設定が完了したら：

1. Vercelにデプロイ
2. テスト被験者でデータが正しく保存されるか確認
3. データ分析用のクエリを作成

## 10. 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel環境変数の設定](https://vercel.com/docs/concepts/projects/environment-variables)

