# Supabaseデータ取得ガイド

このドキュメントでは、Supabaseに保存された実験データを取得・分析する方法を説明します。

## 1. Supabaseダッシュボードでの確認

### 1.1. Table Editorで直接確認

1. Supabaseダッシュボードで「Table Editor」を開く
2. `experiment_results`テーブルを選択
3. 保存されたデータが表示されます

### 1.2. データのフィルタリング

Table Editorでは、列ヘッダーをクリックしてフィルタリングできます：
- `participant_id`で被験者を絞り込み
- `task`でタスクA/Bを絞り込み
- `condition`で条件A/B/C/Dを絞り込み

## 2. SQL Editorでクエリを実行

Supabaseダッシュボードの「SQL Editor」で以下のクエリを実行できます。

### 2.1. 基本的なデータ確認

#### 全トライアル結果を確認
```sql
SELECT * 
FROM experiment_results 
ORDER BY timestamp DESC 
LIMIT 100;
```

#### 特定の被験者のデータを確認
```sql
SELECT * 
FROM experiment_results 
WHERE participant_id = '1'
ORDER BY timestamp ASC;
```

#### 被験者ごとのトライアル数を確認
```sql
SELECT 
  participant_id,
  COUNT(*) as trial_count,
  COUNT(DISTINCT task) as task_count
FROM experiment_results 
GROUP BY participant_id 
ORDER BY participant_id::integer;
```

### 2.2. ラテン方格法の検証

#### セットごとの条件割り当てを確認
```sql
SELECT 
  set_id,
  condition,
  COUNT(*) as count,
  COUNT(DISTINCT participant_id) as participant_count
FROM experiment_results
WHERE set_id IS NOT NULL
GROUP BY set_id, condition
ORDER BY set_id, condition;
```

#### 被験者ごとの条件分布を確認
```sql
SELECT 
  participant_id,
  condition,
  COUNT(*) as trial_count
FROM experiment_results
GROUP BY participant_id, condition
ORDER BY participant_id::integer, condition;
```

#### ノードペアごとの条件カバレッジを確認（すべての条件で見られるか）
```sql
SELECT 
  node_pair_id,
  COUNT(DISTINCT condition) as condition_count,
  STRING_AGG(DISTINCT condition, ', ' ORDER BY condition) as conditions
FROM experiment_results
WHERE node_pair_id IS NOT NULL
GROUP BY node_pair_id
ORDER BY node_pair_id;
```

### 2.3. タスク別の分析

#### タスクAの結果（最短経路の距離）
```sql
SELECT 
  participant_id,
  condition,
  node_pair_id,
  node1,
  node2,
  answer,
  correct,
  reaction_time_ms,
  click_count
FROM experiment_results
WHERE task = 'A'
ORDER BY participant_id::integer, timestamp ASC;
```

#### タスクBの結果（共通隣接ノード）
```sql
SELECT 
  participant_id,
  condition,
  node_pair_id,
  node1,
  node2,
  answer,
  correct,
  reaction_time_ms,
  click_count
FROM experiment_results
WHERE task = 'B'
ORDER BY participant_id::integer, timestamp ASC;
```

### 2.4. パフォーマンス分析

#### 条件ごとの正答率
```sql
SELECT 
  condition,
  task,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count
FROM experiment_results
GROUP BY condition, task
ORDER BY condition, task;
```

#### 被験者ごとのパフォーマンス
```sql
SELECT 
  participant_id,
  task,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms
FROM experiment_results
GROUP BY participant_id, task
ORDER BY participant_id::integer, task;
```

#### 条件ごとの平均反応時間（タスク別）
```sql
SELECT 
  condition,
  task,
  COUNT(*) as trial_count,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(MIN(reaction_time_ms), 2) as min_reaction_time_ms,
  ROUND(MAX(reaction_time_ms), 2) as max_reaction_time_ms,
  ROUND(STDDEV(reaction_time_ms), 2) as stddev_reaction_time_ms
FROM experiment_results
GROUP BY condition, task
ORDER BY condition, task;
```

### 2.5. アンケート結果の確認

#### 全アンケート結果
```sql
SELECT * 
FROM experiment_surveys 
ORDER BY participant_id::integer, task;
```

#### 条件ごとの平均順位
```sql
SELECT 
  task,
  ROUND(AVG(ranking_A), 2) as avg_rank_A,
  ROUND(AVG(ranking_B), 2) as avg_rank_B,
  ROUND(AVG(ranking_C), 2) as avg_rank_C,
  ROUND(AVG(ranking_D), 2) as avg_rank_D
FROM experiment_surveys
GROUP BY task;
```

#### 被験者ごとのアンケート結果
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
ORDER BY participant_id::integer, task;
```

### 2.6. 実験完了記録の確認

```sql
SELECT 
  participant_id,
  start_time,
  end_time,
  EXTRACT(EPOCH FROM (end_time - start_time)) / 60 as duration_minutes
FROM experiment_completions
ORDER BY participant_id::integer;
```

## 3. CSV形式でエクスポート

### 3.1. SQL Editorでエクスポート

1. SQL Editorでクエリを実行
2. 結果の下にある「Download CSV」ボタンをクリック
3. CSVファイルがダウンロードされます

### 3.2. 全データをエクスポート

```sql
-- トライアル結果をエクスポート
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
ORDER BY participant_id::integer, timestamp ASC;
```

```sql
-- アンケート結果をエクスポート
SELECT 
  participant_id,
  task,
  ranking_A,
  ranking_B,
  ranking_C,
  ranking_D,
  timestamp
FROM experiment_surveys
ORDER BY participant_id::integer, task;
```

## 4. よく使う分析クエリ

### 4.1. ラテン方格法が正しく機能しているか確認

```sql
-- 各セット×各条件の組み合わせが均等に割り当てられているか
SELECT 
  set_id,
  condition,
  COUNT(*) as trial_count,
  COUNT(DISTINCT participant_id) as participant_count
FROM experiment_results
WHERE set_id IS NOT NULL
GROUP BY set_id, condition
ORDER BY set_id, condition;

-- 期待値: 各セット×各条件で同じ数のトライアル（被験者数に応じて）
```

### 4.2. 条件間の比較（統計分析用）

```sql
-- 条件ごとの詳細統計
SELECT 
  condition,
  task,
  COUNT(*) as n,
  ROUND(AVG(CASE WHEN correct THEN 1.0 ELSE 0.0 END), 3) as accuracy,
  ROUND(AVG(reaction_time_ms), 2) as mean_rt,
  ROUND(STDDEV(reaction_time_ms), 2) as sd_rt,
  ROUND(MIN(reaction_time_ms), 2) as min_rt,
  ROUND(MAX(reaction_time_ms), 2) as max_rt,
  ROUND(AVG(click_count), 2) as mean_clicks
FROM experiment_results
GROUP BY condition, task
ORDER BY condition, task;
```

### 4.3. ノードペアごとの難易度分析

```sql
-- ノードペアごとの正答率と平均反応時間
SELECT 
  node_pair_id,
  task,
  COUNT(*) as trial_count,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms
FROM experiment_results
WHERE node_pair_id IS NOT NULL
GROUP BY node_pair_id, task
ORDER BY task, accuracy_percent DESC;
```

### 4.4. 被験者間の一貫性チェック

```sql
-- 同じノードペアに対する被験者間の回答のばらつき
SELECT 
  node_pair_id,
  task,
  COUNT(DISTINCT participant_id) as participant_count,
  COUNT(*) as total_trials,
  COUNT(DISTINCT answer) as unique_answers,
  STRING_AGG(DISTINCT answer, ', ' ORDER BY answer) as all_answers
FROM experiment_results
WHERE node_pair_id IS NOT NULL
GROUP BY node_pair_id, task
HAVING COUNT(DISTINCT participant_id) > 1
ORDER BY task, node_pair_id;
```

## 5. データの可視化（Supabase Dashboard）

Supabaseダッシュボードでは、一部のデータを可視化できます：

1. 「Reports」セクション（利用可能な場合）
2. または、エクスポートしたCSVをExcelやGoogle Sheetsで開いてグラフを作成

## 6. プログラムからデータを取得（オプション）

PythonやRなどで分析する場合、SupabaseのAPIを使用できます：

### Python例
```python
from supabase import create_client, Client

url = "YOUR_SUPABASE_URL"
key = "YOUR_SUPABASE_ANON_KEY"  # またはService Role Key
supabase: Client = create_client(url, key)

# データを取得
response = supabase.table('experiment_results').select('*').execute()
data = response.data
```

## 7. データのバックアップ

定期的にデータをバックアップすることをお勧めします：

1. SQL Editorで全データをエクスポート
2. または、Supabaseの自動バックアップ機能を使用（有料プランの場合）

## 8. トラブルシューティング

### データが表示されない場合

1. **テーブルが存在するか確認**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **データが実際に保存されているか確認**
   ```sql
   SELECT COUNT(*) FROM experiment_results;
   ```

3. **最新のデータを確認**
   ```sql
   SELECT * 
   FROM experiment_results 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

### クエリが遅い場合

- インデックスが作成されているか確認（`docs/SUPABASE_SQL.sql`で作成済み）
- 必要に応じて追加のインデックスを作成

## 9. 分析のヒント

1. **被験者IDは数値として扱う**: `participant_id::integer`でキャスト
2. **タイムスタンプでソート**: `ORDER BY timestamp ASC`で時系列順
3. **条件ごとの比較**: `GROUP BY condition`で条件間の比較
4. **統計量の計算**: `AVG()`, `STDDEV()`, `MIN()`, `MAX()`を使用

## 10. よく使うクエリテンプレート

### 被験者1の全データ
```sql
SELECT * FROM experiment_results 
WHERE participant_id = '1' 
ORDER BY timestamp ASC;
```

### 条件Aの全データ
```sql
SELECT * FROM experiment_results 
WHERE condition = 'A' 
ORDER BY participant_id::integer, timestamp ASC;
```

### タスクAの正答率
```sql
SELECT 
  condition,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent
FROM experiment_results
WHERE task = 'A'
GROUP BY condition
ORDER BY condition;
```

