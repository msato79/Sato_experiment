# 実験データ検証クエリ集

このドキュメントでは、4人実験後のデータ検証に使用するSQLクエリをまとめています。

## 1. ラテン方格法の検証

### 1.1. 各セット×各条件の組み合わせ数（最重要）

```sql
-- 各セット×各条件が均等に割り当てられているか確認
SELECT 
  set_id,
  condition,
  COUNT(*) as trial_count,
  COUNT(DISTINCT participant_id) as participant_count
FROM experiment_results
WHERE set_id IS NOT NULL
GROUP BY set_id, condition
ORDER BY set_id, condition;
```

**期待される結果（4人の場合）**:
- 各セット（1, 2, 3, 4）×各条件（A, B, C, D）で`trial_count` = 3（各セット3ペア × 1被験者）
- 各セット×各条件で`participant_count` = 1（各組み合わせが1人の被験者に割り当てられる）
- 合計16行（4セット × 4条件）

### 1.2. 被験者ごとの条件分布

```sql
-- 各被験者が各条件を3回ずつ体験しているか確認
SELECT 
  participant_id,
  condition,
  COUNT(*) as trial_count,
  COUNT(DISTINCT set_id) as set_count
FROM experiment_results
GROUP BY participant_id, condition
ORDER BY participant_id::integer, condition;
```

**期待される結果（4人の場合）**:
- 各被験者で各条件（A, B, C, D）が3回ずつ（タスクA: 1回、タスクB: 2回、またはその逆）
- 各被験者で各条件が4つのセットすべてで見られる（`set_count` = 4）

### 1.3. セットごとの条件割り当てパターン

```sql
-- 各セットで各条件が1回ずつ割り当てられているか確認
SELECT 
  set_id,
  COUNT(DISTINCT condition) as condition_count,
  STRING_AGG(DISTINCT condition, ', ' ORDER BY condition) as conditions,
  COUNT(DISTINCT participant_id) as participant_count
FROM experiment_results
WHERE set_id IS NOT NULL
GROUP BY set_id
ORDER BY set_id;
```

**期待される結果（4人の場合）**:
- 各セットで`condition_count` = 4（A, B, C, Dすべて）
- 各セットで`participant_count` =  = 4（4人の被験者に1回ずつ）

### 1.4. ノードペアの条件カバレッジ

```sql
-- 各ノードペアが4つの条件すべてで見られるか確認
SELECT 
  node_pair_id,
  COUNT(DISTINCT condition) as condition_count,
  STRING_AGG(DISTINCT condition, ', ' ORDER BY condition) as conditions,
  COUNT(DISTINCT participant_id) as participant_count
FROM experiment_results
WHERE node_pair_id IS NOT NULL
GROUP BY node_pair_id
ORDER BY node_pair_id;
```

**期待される結果（4人の場合）**:
- 各ノードペアで`condition_count` = 4（A, B, C, Dすべて）
- 各ノードペアで`participant_count` = 4（4人の被験者に1回ずつ）

### 1.5. ラテン方格パターンの確認

```sql
-- 被験者ごとのセット×条件の割り当てを確認
SELECT 
  participant_id,
  set_id,
  condition,
  COUNT(*) as trial_count
FROM experiment_results
WHERE set_id IS NOT NULL
GROUP BY participant_id, set_id, condition
ORDER BY participant_id::integer, set_id, condition;
```

**期待される結果（4人の場合）**:
- 被験者1: セット1→A, セット2→B, セット3→C, セット4→D
- 被験者2: セット1→B, セット2→C, セット3→D, セット4→A
- 被験者3: セット1→C, セット2→D, セット3→A, セット4→B
- 被験者4: セット1→D, セット2→A, セット3→B, セット4→C

## 2. データの完全性チェック

### 2.1. 被験者ごとのトライアル数

```sql
-- 各被験者が24トライアル完了しているか確認
SELECT 
  participant_id,
  COUNT(*) as total_trials,
  COUNT(DISTINCT task) as task_count,
  COUNT(CASE WHEN task = 'A' THEN 1 END) as task_a_trials,
  COUNT(CASE WHEN task = 'B' THEN 1 END) as task_b_trials
FROM experiment_results
GROUP BY participant_id
ORDER BY participant_id::integer;
```

**期待される結果**:
- `total_trials` = 24（各被験者）
- `task_count` = 2（AとB）
- `task_a_trials` = 12
- `task_b_trials` = 12

### 2.2. アンケートデータの完全性

```sql
-- 各被験者がタスクAとタスクBの両方のアンケートを完了しているか確認
SELECT 
  participant_id,
  COUNT(*) as survey_count,
  STRING_AGG(DISTINCT task, ', ' ORDER BY task) as tasks,
  COUNT(CASE WHEN task = 'A' THEN 1 END) as task_a_survey,
  COUNT(CASE WHEN task = 'B' THEN 1 END) as task_b_survey
FROM experiment_surveys
GROUP BY participant_id
ORDER BY participant_id::integer;
```

**期待される結果**:
- `survey_count` = 2（各被験者）
- `tasks` = 'A, B'
- `task_a_survey` = 1
- `task_b_survey` = 1

### 2.3. 実験完了記録の確認

```sql
-- 各被験者の実験完了記録を確認
SELECT 
  participant_id,
  start_time,
  end_time,
  EXTRACT(EPOCH FROM (end_time - start_time)) / 60 as duration_minutes
FROM experiment_completions
ORDER BY participant_id::integer;
```

**期待される結果**:
- 各被験者で1行の記録
- `start_time`と`end_time`が記録されている
- `duration_minutes`が妥当な範囲（例: 10-60分）

## 3. データの整合性チェック

### 3.1. 必須フィールドの欠損チェック

```sql
-- 必須フィールドが欠けていないか確認
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
FROM experiment_results;
```

**期待される結果**: すべてのカウントが同じ（データが完全）

### 3.2. データ型の妥当性チェック

```sql
-- データ型が正しいか確認
SELECT 
  task,
  COUNT(*) as count,
  COUNT(CASE WHEN task NOT IN ('A', 'B') THEN 1 END) as invalid_task
FROM experiment_results
GROUP BY task;

SELECT 
  condition,
  COUNT(*) as count,
  COUNT(CASE WHEN condition NOT IN ('A', 'B', 'C', 'D') THEN 1 END) as invalid_condition
FROM experiment_results
GROUP BY condition;
```

**期待される結果**: `invalid_task`と`invalid_condition`が0

### 3.3. 反応時間の妥当性チェック

```sql
-- 反応時間が妥当な範囲か確認
SELECT 
  participant_id,
  MIN(reaction_time_ms) as min_rt,
  MAX(reaction_time_ms) as max_rt,
  ROUND(AVG(reaction_time_ms), 2) as avg_rt,
  COUNT(CASE WHEN reaction_time_ms < 100 THEN 1 END) as too_fast,
  COUNT(CASE WHEN reaction_time_ms > 300000 THEN 1 END) as too_slow
FROM experiment_results
GROUP BY participant_id
ORDER BY participant_id::integer;
```

**期待される結果**:
- `min_rt` > 100（あまりに短い反応時間がない）
- `max_rt` < 300000（5分以内）
- `too_fast` = 0
- `too_slow` = 0

## 4. 統計的な確認

### 4.1. 条件ごとのパフォーマンス概要

```sql
-- 条件ごとの正答率と平均反応時間
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

### 4.2. 被験者ごとのパフォーマンス概要

```sql
-- 被験者ごとの正答率と平均反応時間
SELECT 
  participant_id,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms
FROM experiment_results
GROUP BY participant_id
ORDER BY participant_id::integer;
```

## 5. 総合検証クエリ（一括確認）

```sql
-- 4人実験の総合検証
WITH validation AS (
  SELECT 
    -- 被験者数
    COUNT(DISTINCT participant_id) as participant_count,
    
    -- トライアル数
    COUNT(*) as total_trials,
    COUNT(DISTINCT participant_id) * 24 as expected_trials,
    
    -- ラテン方格法の検証
    COUNT(DISTINCT set_id) as set_count,
    COUNT(DISTINCT condition) as condition_count,
    
    -- セット×条件の組み合わせ数
    (SELECT COUNT(*) FROM (
      SELECT set_id, condition
      FROM experiment_results
      WHERE set_id IS NOT NULL
      GROUP BY set_id, condition
    ) sub) as set_condition_combinations,
    
    -- アンケート数
    (SELECT COUNT(*) FROM experiment_surveys) as survey_count,
    (SELECT COUNT(DISTINCT participant_id) FROM experiment_surveys) as survey_participants,
    
    -- 実験完了記録数
    (SELECT COUNT(*) FROM experiment_completions) as completion_count
)
SELECT 
  participant_count,
  total_trials,
  expected_trials,
  CASE WHEN total_trials = expected_trials THEN '✓' ELSE '✗' END as trials_match,
  set_count,
  condition_count,
  set_condition_combinations,
  CASE WHEN set_condition_combinations = 16 THEN '✓' ELSE '✗' END as latin_square_valid,
  survey_count,
  survey_participants,
  CASE WHEN survey_count = participant_count * 2 THEN '✓' ELSE '✗' END as surveys_complete,
  completion_count,
  CASE WHEN completion_count = participant_count THEN '✓' ELSE '✗' END as completions_match
FROM validation;
```

**期待される結果（4人の場合）**:
- `participant_count` = 4
- `total_trials` = 96（4人 × 24トライアル）
- `trials_match` = ✓
- `set_count` = 4
- `condition_count` 4`
- `set_condition_combinations` = 16
- `latin_square_valid` = ✓
- `survey_count` = 8（4人 × 2タスク）
- `surveys_complete` = ✓
- `completion_count` = 4
- `completions_match` = ✓

## 6. クイックチェックリスト

4人実験後の確認項目：

- [ ] 各被験者が24トライアル完了している
- [ ] 各被験者が各条件（A, B, C, D）を3回ずつ体験している
- [ ] 各セット×各条件の組み合わせが均等に割り当てられている（各3回）
- [ ] 各ノードペアが4つの条件すべてで見られている
- [ ] 各被験者がタスクAとタスクBの両方のアンケートを完了している
- [ ] 実験完了記録が4人分存在する
- [ ] データに欠損がない
- [ ] 反応時間が妥当な範囲内

## 7. 問題が見つかった場合

### データが不完全な場合

```sql
-- 不完全なデータを持つ被験者を特定
SELECT 
  participant_id,
  COUNT(*) as trial_count
FROM experiment_results
GROUP BY participant_id
HAVING COUNT(*) < 24
ORDER BY participant_id::integer;
```

### ラテン方格法が正しく機能していない場合

```sql
-- 不均等な組み合わせを特定
SELECT 
  set_id,
  condition,
  COUNT(*) as trial_count
FROM experiment_results
WHERE set_id IS NOT NULL
GROUP BY set_id, condition
HAVING COUNT(*) != 3  -- 4人の場合、各組み合わせは3回
ORDER BY set_id, condition;
```

