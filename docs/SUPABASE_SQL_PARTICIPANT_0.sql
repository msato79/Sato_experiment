-- ============================================
-- 参加者ID '0' のテストデータ挿入用SQLスクリプト
-- ============================================
-- このファイルをSupabaseのSQL Editorで実行してください
-- 注意: 既存のデータがある場合は、先に削除してから実行してください

-- ============================================
-- 1. 既存データの削除（参加者ID '0'のデータがある場合）
-- ============================================

DELETE FROM experiment_results WHERE participant_id = '0';
DELETE FROM experiment_surveys WHERE participant_id = '0';
DELETE FROM experiment_completions WHERE participant_id = '0';

-- ============================================
-- 2. 実験開始時刻の記録
-- ============================================

INSERT INTO experiment_completions (participant_id, start_time, end_time)
VALUES ('0', NOW() - INTERVAL '30 minutes', NULL)
ON CONFLICT (participant_id) DO UPDATE SET start_time = NOW() - INTERVAL '30 minutes';

-- ============================================
-- 3. タスクAのトライアル結果（サンプルデータ）
-- ============================================

INSERT INTO experiment_results (
  participant_id, task, trial_id, condition, axis_offset, graph_file,
  node_pair_id, set_id, node1, node2, highlighted_nodes,
  answer, correct, reaction_time_ms, click_count, timestamp
) VALUES
-- タスクAのトライアル1-12（各条件3回ずつ）
('0', 'A', 'taskA_trial_1', 'A', 0, 'graph_small_A.csv', 'pair_1', 1, 1, 5, '1,5', '2', true, 2500, 1, NOW() - INTERVAL '25 minutes'),
('0', 'A', 'taskA_trial_2', 'B', 0, 'graph_small_A.csv', 'pair_2', 1, 2, 6, '2,6', '3', true, 3200, 1, NOW() - INTERVAL '24 minutes'),
('0', 'A', 'taskA_trial_3', 'C', 0, 'graph_small_B.csv', 'pair_3', 1, 3, 7, '3,7', '2', true, 2800, 1, NOW() - INTERVAL '23 minutes'),
('0', 'A', 'taskA_trial_4', 'D', 0, 'graph_small_B.csv', 'pair_4', 1, 4, 8, '4,8', '3', false, 3500, 1, NOW() - INTERVAL '22 minutes'),
('0', 'A', 'taskA_trial_5', 'A', 1, 'graph_small_C.csv', 'pair_5', 2, 5, 9, '5,9', '2', true, 2400, 1, NOW() - INTERVAL '21 minutes'),
('0', 'A', 'taskA_trial_6', 'B', 1, 'graph_small_C.csv', 'pair_6', 2, 6, 10, '6,10', '2', true, 3100, 1, NOW() - INTERVAL '20 minutes'),
('0', 'A', 'taskA_trial_7', 'C', 0, 'graph_small_D.csv', 'pair_7', 3, 7, 11, '7,11', '3', true, 2900, 1, NOW() - INTERVAL '19 minutes'),
('0', 'A', 'taskA_trial_8', 'D', 0, 'graph_small_D.csv', 'pair_8', 3, 8, 12, '8,12', '2', false, 3600, 1, NOW() - INTERVAL '18 minutes'),
('0', 'A', 'taskA_trial_9', 'A', 1, 'graph_medium_A.csv', 'pair_9', 4, 9, 13, '9,13', '3', true, 2700, 1, NOW() - INTERVAL '17 minutes'),
('0', 'A', 'taskA_trial_10', 'B', 1, 'graph_medium_A.csv', 'pair_10', 4, 10, 14, '10,14', '2', true, 3300, 1, NOW() - INTERVAL '16 minutes'),
('0', 'A', 'taskA_trial_11', 'C', 0, 'graph_medium_B.csv', 'pair_11', 1, 11, 15, '11,15', '3', true, 3000, 1, NOW() - INTERVAL '15 minutes'),
('0', 'A', 'taskA_trial_12', 'D', 0, 'graph_medium_B.csv', 'pair_12', 1, 12, 16, '12,16', '2', true, 3400, 1, NOW() - INTERVAL '14 minutes');

-- ============================================
-- 4. タスクAのアンケート結果
-- ============================================
-- 注意: 新しい構造（preferred_condition）を使用する場合と古い構造（ranking_A-D）を使用する場合で選択してください

-- 新しい構造（preferred_condition）を使用する場合
-- INSERT INTO experiment_surveys (participant_id, task, preferred_condition, timestamp)
-- VALUES ('0', 'A', 'B', NOW() - INTERVAL '13 minutes')
-- ON CONFLICT (participant_id, task) DO UPDATE SET preferred_condition = 'B', timestamp = NOW() - INTERVAL '13 minutes';

-- 古い構造（ranking_A-D）を使用する場合（テーブル構造がまだ更新されていない場合）
INSERT INTO experiment_surveys (participant_id, task, ranking_A, ranking_B, ranking_C, ranking_D, timestamp)
VALUES ('0', 'A', 2, 1, 3, 4, NOW() - INTERVAL '13 minutes')
ON CONFLICT (participant_id, task) DO UPDATE SET 
  ranking_A = 2, 
  ranking_B = 1, 
  ranking_C = 3, 
  ranking_D = 4, 
  timestamp = NOW() - INTERVAL '13 minutes';

-- ============================================
-- 5. タスクBのトライアル結果（サンプルデータ）
-- ============================================

INSERT INTO experiment_results (
  participant_id, task, trial_id, condition, axis_offset, graph_file,
  node_pair_id, set_id, node1, node2, highlighted_nodes,
  answer, correct, reaction_time_ms, click_count, timestamp
) VALUES
-- タスクBのトライアル1-12（各条件3回ずつ）
('0', 'B', 'taskB_trial_1', 'A', 0, 'graph_small_A.csv', 'pair_1', 1, 1, 5, '1,5', '3,7', true, 4500, 3, NOW() - INTERVAL '12 minutes'),
('0', 'B', 'taskB_trial_2', 'B', 0, 'graph_small_A.csv', 'pair_2', 1, 2, 6, '2,6', '4,8', true, 5200, 2, NOW() - INTERVAL '11 minutes'),
('0', 'B', 'taskB_trial_3', 'C', 0, 'graph_small_B.csv', 'pair_3', 1, 3, 7, '3,7', '5,9', true, 4800, 3, NOW() - INTERVAL '10 minutes'),
('0', 'B', 'taskB_trial_4', 'D', 0, 'graph_small_B.csv', 'pair_4', 1, 4, 8, '4,8', '6,10', false, 5500, 4, NOW() - INTERVAL '9 minutes'),
('0', 'B', 'taskB_trial_5', 'A', 1, 'graph_small_C.csv', 'pair_5', 2, 5, 9, '5,9', '7,11', true, 4400, 2, NOW() - INTERVAL '8 minutes'),
('0', 'B', 'taskB_trial_6', 'B', 1, 'graph_small_C.csv', 'pair_6', 2, 6, 10, '6,10', '8,12', true, 5100, 3, NOW() - INTERVAL '7 minutes'),
('0', 'B', 'taskB_trial_7', 'C', 0, 'graph_small_D.csv', 'pair_7', 3, 7, 11, '7,11', '9,13', true, 4900, 2, NOW() - INTERVAL '6 minutes'),
('0', 'B', 'taskB_trial_8', 'D', 0, 'graph_small_D.csv', 'pair_8', 3, 8, 12, '8,12', '10,14', true, 5600, 3, NOW() - INTERVAL '5 minutes'),
('0', 'B', 'taskB_trial_9', 'A', 1, 'graph_medium_A.csv', 'pair_9', 4, 9, 13, '9,13', '11,15', true, 4700, 2, NOW() - INTERVAL '4 minutes'),
('0', 'B', 'taskB_trial_10', 'B', 1, 'graph_medium_A.csv', 'pair_10', 4, 10, 14, '10,14', '12,16', true, 5300, 3, NOW() - INTERVAL '3 minutes'),
('0', 'B', 'taskB_trial_11', 'C', 0, 'graph_medium_B.csv', 'pair_11', 1, 11, 15, '11,15', '13,17', true, 5000, 2, NOW() - INTERVAL '2 minutes'),
('0', 'B', 'taskB_trial_12', 'D', 0, 'graph_medium_B.csv', 'pair_12', 1, 12, 16, '12,16', '14,18', true, 5400, 3, NOW() - INTERVAL '1 minute');

-- ============================================
-- 6. タスクBのアンケート結果
-- ============================================

-- 新しい構造（preferred_condition）を使用する場合
-- INSERT INTO experiment_surveys (participant_id, task, preferred_condition, timestamp)
-- VALUES ('0', 'B', 'C', NOW())
-- ON CONFLICT (participant_id, task) DO UPDATE SET preferred_condition = 'C', timestamp = NOW();

-- 古い構造（ranking_A-D）を使用する場合（テーブル構造がまだ更新されていない場合）
INSERT INTO experiment_surveys (participant_id, task, ranking_A, ranking_B, ranking_C, ranking_D, timestamp)
VALUES ('0', 'B', 3, 2, 1, 4, NOW())
ON CONFLICT (participant_id, task) DO UPDATE SET 
  ranking_A = 3, 
  ranking_B = 2, 
  ranking_C = 1, 
  ranking_D = 4, 
  timestamp = NOW();

-- ============================================
-- 7. 実験終了時刻の更新
-- ============================================

UPDATE experiment_completions 
SET end_time = NOW() 
WHERE participant_id = '0';

-- ============================================
-- 8. 確認用クエリ
-- ============================================

-- 参加者ID '0'のトライアル結果を確認
-- SELECT COUNT(*) as trial_count, task, condition
-- FROM experiment_results
-- WHERE participant_id = '0'
-- GROUP BY task, condition
-- ORDER BY task, condition;

-- 参加者ID '0'のアンケート結果を確認
-- SELECT * FROM experiment_surveys WHERE participant_id = '0';

-- 参加者ID '0'の実験完了情報を確認
-- SELECT * FROM experiment_completions WHERE participant_id = '0';

