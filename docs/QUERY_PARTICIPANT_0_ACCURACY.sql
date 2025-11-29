-- ============================================
-- 参加者ID '0' の正答率を調べるSQLクエリ
-- ============================================

-- ============================================
-- 1. 全体の正答率
-- ============================================
SELECT 
  participant_id,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN NOT correct THEN 1 ELSE 0 END) as incorrect_count,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage
FROM experiment_results
WHERE participant_id = '0'
GROUP BY participant_id;

-- ============================================
-- 2. タスクごとの正答率
-- ============================================
SELECT 
  participant_id,
  task,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN NOT correct THEN 1 ELSE 0 END) as incorrect_count,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage
FROM experiment_results
WHERE participant_id = '0'
GROUP BY participant_id, task
ORDER BY task;

-- ============================================
-- 3. 条件ごとの正答率
-- ============================================
SELECT 
  participant_id,
  condition,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN NOT correct THEN 1 ELSE 0 END) as incorrect_count,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage
FROM experiment_results
WHERE participant_id = '0'
GROUP BY participant_id, condition
ORDER BY condition;

-- ============================================
-- 4. タスク×条件の組み合わせごとの正答率
-- ============================================
SELECT 
  participant_id,
  task,
  condition,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN NOT correct THEN 1 ELSE 0 END) as incorrect_count,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage
FROM experiment_results
WHERE participant_id = '0'
GROUP BY participant_id, task, condition
ORDER BY task, condition;

-- ============================================
-- 5. 詳細な正答率レポート（タスク、条件、軸オフセット別）
-- ============================================
SELECT 
  participant_id,
  task,
  condition,
  axis_offset,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
  SUM(CASE WHEN NOT correct THEN 1 ELSE 0 END) as incorrect_count,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage,
  ROUND(AVG(reaction_time_ms), 0) as avg_reaction_time_ms,
  ROUND(AVG(click_count), 1) as avg_click_count
FROM experiment_results
WHERE participant_id = '0'
GROUP BY participant_id, task, condition, axis_offset
ORDER BY task, condition, axis_offset;

-- ============================================
-- 6. 各トライアルの詳細（正誤を含む）
-- ============================================
SELECT 
  participant_id,
  task,
  trial_id,
  condition,
  correct,
  reaction_time_ms,
  click_count,
  timestamp
FROM experiment_results
WHERE participant_id = '0'
ORDER BY task, timestamp;

-- ============================================
-- 7. 正答率のサマリー（全体、タスク別、条件別を1つのクエリで）
-- ============================================
WITH overall_stats AS (
  SELECT 
    '全体' as category,
    NULL as subcategory,
    COUNT(*) as total_trials,
    SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
    ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage
  FROM experiment_results
  WHERE participant_id = '0'
),
task_stats AS (
  SELECT 
    'タスク別' as category,
    task as subcategory,
    COUNT(*) as total_trials,
    SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
    ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage
  FROM experiment_results
  WHERE participant_id = '0'
  GROUP BY task
),
condition_stats AS (
  SELECT 
    '条件別' as category,
    condition as subcategory,
    COUNT(*) as total_trials,
    SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
    ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage
  FROM experiment_results
  WHERE participant_id = '0'
  GROUP BY condition
)
SELECT * FROM overall_stats
UNION ALL
SELECT * FROM task_stats
UNION ALL
SELECT * FROM condition_stats
ORDER BY category, subcategory;

