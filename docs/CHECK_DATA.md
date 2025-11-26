# データ送信確認ガイド（1人分）

このガイドでは、1人分のデータがSupabaseに正しく送信されているかを確認する方法を説明します。

## 方法1: Supabaseダッシュボードで直接確認（最も簡単）

### ステップ1: Table Editorで確認

1. Supabaseダッシュボードにログイン
2. 左メニューから「Table Editor」をクリック
3. `experiment_results`テーブルを選択
4. データが表示されているか確認

### ステップ2: フィルタリング

1. `participant_id`列のヘッダーをクリック
2. 「Filter」を選択
3. 被験者ID（例: `1`）を入力
4. その被験者のデータのみが表示されます

**確認ポイント**:
- データが24行表示される（タスクA: 12、タスクB: 12）
- `condition`列にA, B, C, Dが含まれている
- `set_id`列に1, 2, 3, 4が含まれている
- `node_pair_id`が正しく記録されている

## 方法2: SQL Editorで確認（推奨）

### ステップ1: SQL Editorを開く

1. Supabaseダッシュボードで「SQL Editor」をクリック
2. 「New query」をクリック

### ステップ2: 基本的な確認クエリ

#### クエリ1: 被験者1の全データを確認

```sql
SELECT * 
FROM experiment_results 
WHERE participant_id = '1'
ORDER BY timestamp ASC;
```

**確認ポイント**:
- 24行のデータが表示される
- `trial_id`が正しく記録されている
- `task`がAとBの両方含まれている
- `condition`がA, B, C, Dのすべて含まれている
- `node_pair_id`が正しく記録されている
- `set_id`が1, 2, 3, 4のすべて含まれている

#### クエリ2: データの件数を確認

```sql
SELECT 
  participant_id,
  COUNT(*) as total_trials,
  COUNT(DISTINCT task) as task_count,
  COUNT(DISTINCT condition) as condition_count,
  COUNT(DISTINCT set_id) as set_count
FROM experiment_results
WHERE participant_id = '1'
GROUP BY participant_id;
```

**期待される結果**:
- `total_trials`: 24
- `task_count`: 2（AとB）
- `condition_count`: 4（A, B, C, D）
- `set_count`: 4（1, 2, 3, 4）

#### クエリ3: タスク別のデータ数を確認

```sql
SELECT 
  task,
  COUNT(*) as trial_count,
  COUNT(DISTINCT condition) as condition_count,
  COUNT(DISTINCT set_id) as set_count
FROM experiment_results
WHERE participant_id = '1'
GROUP BY task;
```

**期待される結果**:
- タスクA: `trial_count` = 12, `condition_count` = 4, `set_count` = 4
- タスクB: `trial_count` = 12, `condition_count` = 4, `set_count` = 4

#### クエリ4: 条件ごとのデータ数を確認

```sql
SELECT 
  condition,
  COUNT(*) as trial_count,
  COUNT(DISTINCT set_id) as set_count
FROM experiment_results
WHERE participant_id = '1'
GROUP BY condition
ORDER BY condition;
```

**期待される結果**:
- 各条件（A, B, C, D）で`trial_count` = 6（タスクA: 3、タスクB: 3）
- 各条件で`set_count` = 4（すべてのセットが含まれる）

#### クエリ5: セットごとの条件割り当てを確認（ラテン方格法の検証）

```sql
SELECT 
  set_id,
  condition,
  COUNT(*) as trial_count
FROM experiment_results
WHERE participant_id = '1' AND set_id IS NOT NULL
GROUP BY set_id, condition
ORDER BY set_id, condition;
```

**期待される結果**:
- 各セット（1, 2, 3, 4）で各条件（A, B, C, D）が1回ずつ
- 合計16行（4セット × 4条件）

#### クエリ6: ノードペアの条件カバレッジを確認

```sql
SELECT 
  node_pair_id,
  COUNT(DISTINCT condition) as condition_count,
  STRING_AGG(DISTINCT condition, ', ' ORDER BY condition) as conditions
FROM experiment_results
WHERE participant_id = '1' AND node_pair_id IS NOT NULL
GROUP BY node_pair_id
ORDER BY node_pair_id;
```

**期待される結果**:
- 各ノードペアで`condition_count` = 1（1人の被験者では各ペアは1つの条件のみ）
- ただし、全体で見ると各ペアが4つの条件すべてで見られる必要がある

## 方法3: データの整合性チェック

### チェック1: 必須フィールドが欠けていないか

```sql
SELECT 
  COUNT(*) as total_rows,
  COUNT(participant_id) as has_participant_id,
  COUNT(task) as has_task,
  COUNT(condition) as has_condition,
  COUNT(trial_id) as has_trial_id,
  COUNT(node_pair_id) as has_node_pair_id,
  COUNT(set_id) as has_set_id,
  COUNT(node1) as has_node1,
  COUNT(node2) as has_node2,
  COUNT(answer) as has_answer,
  COUNT(correct) as has_correct,
  COUNT(reaction_time_ms) as has_reaction_time
FROM experiment_results
WHERE participant_id = '1';
```

**期待される結果**: すべてのカウントが24（データが完全）

### チェック2: データ型が正しいか

```sql
SELECT 
  participant_id,
  task,
  condition,
  set_id,
  node1,
  node2,
  correct,
  reaction_time_ms,
  click_count,
  timestamp
FROM experiment_results
WHERE participant_id = '1'
LIMIT 5;
```

**確認ポイント**:
- `task`が'A'または'B'
- `condition`が'A', 'B', 'C', 'D'のいずれか
- `set_id`が1, 2, 3, 4のいずれか
- `correct`がtrueまたはfalse
- `reaction_time_ms`が正の数
- `timestamp`が正しい日時形式

## 方法4: アンケートデータの確認

### アンケート結果を確認

```sql
SELECT * 
FROM experiment_surveys 
WHERE participant_id = '1'
ORDER BY task;
```

**期待される結果**:
- 2行のデータ（タスクAとタスクB）
- 各タスクで`ranking_A`, `ranking_B`, `ranking_C`, `ranking_D`が1-4の値
- 各タスクで1-4の値が1回ずつ（重複なし）

## 方法5: 実験完了記録の確認

```sql
SELECT * 
FROM experiment_completions 
WHERE participant_id = '1';
```

**期待される結果**:
- 1行のデータ
- `start_time`と`end_time`が記録されている
- `end_time`が`start_time`より後

## トラブルシューティング

### データが表示されない場合

1. **テーブルが存在するか確認**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
     AND table_name LIKE 'experiment%';
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

### データが不完全な場合

- 24トライアル未満: 実験が途中で終了した可能性
- 条件が4つ未満: ラテン方格法が正しく機能していない可能性
- `set_id`がNULL: CSVファイルの読み込みに問題がある可能性

### データが重複している場合

- 同じ`trial_id`が複数回出現: 実験が複数回実行された可能性

## クイックチェックリスト

1人分のデータを確認する際のチェックリスト：

- [ ] データが24行存在する（タスクA: 12、タスクB: 12）
- [ ] `task`がAとBの両方含まれている
- [ ] `condition`がA, B, C, Dのすべて含まれている
- [ ] `set_id`が1, 2, 3, 4のすべて含まれている
- [ ] 各条件が6回ずつ出現している（タスクA: 3、タスクB: 3）
- [ ] 各セットが6回ずつ出現している（タスクA: 3、タスクB: 3）
- [ ] `node_pair_id`が正しく記録されている
- [ ] `node1`と`node2`が正しく記録されている
- [ ] `answer`が記録されている
- [ ] `correct`が記録されている
- [ ] `reaction_time_ms`が正の数
- [ ] `timestamp`が正しい日時形式
- [ ] アンケートデータが2行存在する（タスクAとタスクB）
- [ ] 実験完了記録が1行存在する

## 次のステップ

データが正しく保存されていることを確認したら：

1. **ラテン方格法の検証**: 複数の被験者で実施後、各セット×各条件が均等に割り当てられているか確認
2. **データ分析**: 条件ごとのパフォーマンスを比較
3. **追加の被験者**: 必要に応じて追加の被験者で実験を実施

