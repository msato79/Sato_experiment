-- ============================================
-- 参加者ID "shiima" のデータ解析用SQLクエリ
-- ============================================
-- このファイルはSupabaseのSQL Editorで実行してください

-- ============================================
-- 1. 基本情報の確認
-- ============================================

-- 1.1. 参加者"shiima"の全トライアル結果を時系列順で表示
SELECT 
  id,
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
  timestamp,
  created_at
FROM experiment_results
WHERE participant_id = 'shiima'
ORDER BY timestamp ASC;

-- 1.2. 参加者"shiima"のトライアル数とタスク別の内訳
SELECT 
  COUNT(*) as total_trials,
  COUNT(DISTINCT task) as task_count,
  COUNT(CASE WHEN task = 'A' THEN 1 END) as task_a_trials,
  COUNT(CASE WHEN task = 'B' THEN 1 END) as task_b_trials,
  COUNT(DISTINCT condition) as condition_count,
  COUNT(DISTINCT graph_file) as graph_count,
  MIN(timestamp) as first_trial_time,
  MAX(timestamp) as last_trial_time
FROM experiment_results
WHERE participant_id = 'shiima';

-- ============================================
-- 2. タスク別の詳細分析
-- ============================================

-- 2.1. タスクA（最短経路の距離）の結果
SELECT 
  trial_id,
  condition,
  axis_offset,
  graph_file,
  node_pair_id,
  node1,
  node2,
  answer,
  correct,
  reaction_time_ms,
  click_count,
  timestamp
FROM experiment_results
WHERE participant_id = 'shiima' AND task = 'A'
ORDER BY timestamp ASC;

-- 2.2. タスクB（共通隣接ノード）の結果
SELECT 
  trial_id,
  condition,
  axis_offset,
  graph_file,
  node_pair_id,
  node1,
  node2,
  answer,
  correct,
  reaction_time_ms,
  click_count,
  timestamp
FROM experiment_results
WHERE participant_id = 'shiima' AND task = 'B'
ORDER BY timestamp ASC;

-- ============================================
-- 3. 条件別のパフォーマンス分析
-- ============================================

-- 3.1. 条件別の正答率と平均反応時間（全体）
SELECT 
  condition,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(MIN(reaction_time_ms), 2) as min_reaction_time_ms,
  ROUND(MAX(reaction_time_ms), 2) as max_reaction_time_ms,
  ROUND(STDDEV(reaction_time_ms), 2) as stddev_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count
FROM experiment_results
WHERE participant_id = 'shiima'
GROUP BY condition
ORDER BY condition;

-- 3.2. 条件別のパフォーマンス（タスク別）
SELECT 
  task,
  condition,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count
FROM experiment_results
WHERE participant_id = 'shiima'
GROUP BY task, condition
ORDER BY task, condition;

-- ============================================
-- 4. タスク別のパフォーマンス分析
-- ============================================

-- 4.1. タスクAのパフォーマンス
SELECT 
  condition,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count
FROM experiment_results
WHERE participant_id = 'shiima' AND task = 'A'
GROUP BY condition
ORDER BY condition;

-- 4.2. タスクBのパフォーマンス
SELECT 
  condition,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count
FROM experiment_results
WHERE participant_id = 'shiima' AND task = 'B'
GROUP BY condition
ORDER BY condition;

-- ============================================
-- 5. ノードペア別の分析
-- ============================================

-- 5.1. ノードペアごとの正答率と反応時間
SELECT 
  node_pair_id,
  task,
  condition,
  COUNT(*) as trial_count,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count,
  node1,
  node2
FROM experiment_results
WHERE participant_id = 'shiima' AND node_pair_id IS NOT NULL
GROUP BY node_pair_id, task, condition, node1, node2
ORDER BY task, node_pair_id, condition;

-- 5.2. ノードペアごとの詳細（全トライアル）
SELECT 
  node_pair_id,
  task,
  condition,
  node1,
  node2,
  answer,
  correct,
  reaction_time_ms,
  click_count,
  timestamp
FROM experiment_results
WHERE participant_id = 'shiima' AND node_pair_id IS NOT NULL
ORDER BY node_pair_id, task, timestamp ASC;

-- ============================================
-- 6. アンケート結果の確認
-- ============================================

-- 6.1. 参加者"shiima"のアンケート結果
SELECT 
  id,
  participant_id,
  task,
  ranking_A,
  ranking_B,
  ranking_C,
  ranking_D,
  timestamp,
  created_at
FROM experiment_surveys
WHERE participant_id = 'shiima'
ORDER BY task;

-- ============================================
-- 7. 実験完了記録の確認
-- ============================================

-- 7.1. 参加者"shiima"の実験開始・終了時刻
SELECT 
  participant_id,
  start_time,
  end_time,
  CASE 
    WHEN end_time IS NOT NULL THEN 
      ROUND(EXTRACT(EPOCH FROM (end_time - start_time)) / 60, 2)
    ELSE NULL
  END as duration_minutes,
  created_at
FROM experiment_completions
WHERE participant_id = 'shiima';

-- ============================================
-- 8. 時系列分析
-- ============================================

-- 8.1. トライアル順での正答率の推移（移動平均）
-- 注意: PostgreSQLのウィンドウ関数を使用
SELECT 
  task,
  condition,
  trial_id,
  timestamp,
  correct,
  reaction_time_ms,
  click_count,
  -- 直近5トライアルの正答率（移動平均）
  ROUND(
    100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) 
    OVER (
      PARTITION BY task, condition 
      ORDER BY timestamp 
      ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ) / 
    COUNT(*) 
    OVER (
      PARTITION BY task, condition 
      ORDER BY timestamp 
      ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 
    2
  ) as moving_accuracy_5trials
FROM experiment_results
WHERE participant_id = 'shiima'
ORDER BY timestamp ASC;

-- 8.2. 時系列での反応時間の推移
SELECT 
  task,
  condition,
  trial_id,
  timestamp,
  reaction_time_ms,
  click_count,
  correct,
  -- 直近5トライアルの平均反応時間（移動平均）
  ROUND(
    AVG(reaction_time_ms) 
    OVER (
      PARTITION BY task, condition 
      ORDER BY timestamp 
      ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ), 
    2
  ) as moving_avg_rt_5trials
FROM experiment_results
WHERE participant_id = 'shiima'
ORDER BY timestamp ASC;

-- ============================================
-- 9. エラー分析
-- ============================================

-- 9.1. 誤答の詳細
SELECT 
  task,
  condition,
  trial_id,
  node_pair_id,
  node1,
  node2,
  answer,
  correct,
  reaction_time_ms,
  click_count,
  timestamp
FROM experiment_results
WHERE participant_id = 'shiima' AND correct = false
ORDER BY timestamp ASC;

-- 9.2. 誤答率が高い条件・タスクの組み合わせ
SELECT 
  task,
  condition,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 0 ELSE 1 END) as error_count,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 0 ELSE 1 END) / COUNT(*), 2) as error_rate_percent
FROM experiment_results
WHERE participant_id = 'shiima'
GROUP BY task, condition
ORDER BY error_rate_percent DESC;

-- ============================================
-- 10. 統計サマリー（分析用）
-- ============================================

-- 10.1. 参加者"shiima"の包括的な統計サマリー
SELECT 
  'Overall' as category,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(STDDEV(reaction_time_ms), 2) as stddev_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count
FROM experiment_results
WHERE participant_id = 'shiima'

UNION ALL

SELECT 
  'Task A' as category,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(STDDEV(reaction_time_ms), 2) as stddev_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count
FROM experiment_results
WHERE participant_id = 'shiima' AND task = 'A'

UNION ALL

SELECT 
  'Task B' as category,
  COUNT(*) as total_trials,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END) as correct_trials,
  ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percent,
  ROUND(AVG(reaction_time_ms), 2) as avg_reaction_time_ms,
  ROUND(STDDEV(reaction_time_ms), 2) as stddev_reaction_time_ms,
  ROUND(AVG(click_count), 2) as avg_click_count
FROM experiment_results
WHERE participant_id = 'shiima' AND task = 'B';

-- ============================================
-- 11. CSVエクスポート用クエリ
-- ============================================

-- 11.1. 全トライアル結果をCSVエクスポート用に整形
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
WHERE participant_id = 'shiima'
ORDER BY timestamp ASC;

-- 11.2. アンケート結果をCSVエクスポート用に整形
SELECT 
  participant_id,
  task,
  ranking_A,
  ranking_B,
  ranking_C,
  ranking_D,
  timestamp
FROM experiment_surveys
WHERE participant_id = 'shiima'
ORDER BY task;

