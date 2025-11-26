# Supabaseデータ削除ガイド

このドキュメントでは、Supabaseに保存された実験データを削除する方法を説明します。

## ⚠️ 注意事項

- **データ削除は元に戻せません**
- 削除前に必ずバックアップを取ることを推奨します
- 本番環境のデータを削除する場合は、特に注意してください

## 方法1: SQL Editorで削除（推奨）

### ステップ1: 現在のデータを確認

削除前に、現在のデータを確認します：

```sql
-- 各テーブルのデータ数を確認
SELECT 
  'experiment_results' as table_name,
  COUNT(*) as row_count
FROM experiment_results
UNION ALL
SELECT 
  'experiment_surveys' as table_name,
  COUNT(*) as row_count
FROM experiment_surveys
UNION ALL
SELECT 
  'experiment_completions' as table_name,
  COUNT(*) as row_count
FROM experiment_completions;
```

### ステップ2: データをエクスポート（バックアップ）

削除前に、データをエクスポートしておくことを推奨します：

```sql
-- experiment_resultsをエクスポート（SQL Editorで実行後、「Download CSV」をクリック）
SELECT * FROM experiment_results ORDER BY timestamp DESC;

-- experiment_surveysをエクスポート
SELECT * FROM experiment_surveys ORDER BY timestamp DESC;

-- experiment_completionsをエクスポート
SELECT * FROM experiment_completions ORDER BY created_at DESC;
```

### ステップ3: データを削除

#### オプションA: すべてのデータを削除

```sql
-- すべてのトライアル結果を削除
DELETE FROM experiment_results;

-- すべてのアンケート結果を削除
DELETE FROM experiment_surveys;

-- すべての実験完了記録を削除
DELETE FROM experiment_completions;
```

#### オプションB: 特定の被験者のデータのみ削除

```sql
-- 被験者1のデータを削除
DELETE FROM experiment_results WHERE participant_id = '1';
DELETE FROM experiment_surveys WHERE participant_id = '1';
DELETE FROM experiment_completions WHERE participant_id = '1';
```

#### オプションC: 複数の被験者のデータを削除

```sql
-- 被験者1と2のデータを削除
DELETE FROM experiment_results WHERE participant_id IN ('1', '2');
DELETE FROM experiment_surveys WHERE participant_id IN ('1', '2');
DELETE FROM experiment_completions WHERE participant_id IN ('1', '2');
```

#### オプションD: 特定の日付以前のデータを削除

```sql
-- 2025年1月1日以前のデータを削除
DELETE FROM experiment_results WHERE timestamp < '2025-01-01';
DELETE FROM experiment_surveys WHERE timestamp < '2025-01-01';
DELETE FROM experiment_completions WHERE created_at < '2025-01-01';
```

### ステップ4: 削除を確認

```sql
-- 削除後のデータ数を確認
SELECT 
  'experiment_results' as table_name,
  COUNT(*) as row_count
FROM experiment_results
UNION ALL
SELECT 
  'experiment_surveys' as table_name,
  COUNT(*) as row_count
FROM experiment_surveys
UNION ALL
SELECT 
  'experiment_completions' as table_name,
  COUNT(*) as row_count
FROM experiment_completions;
```

## 方法2: Table Editorで削除

### ステップ1: Table Editorを開く

1. Supabaseダッシュボードで「Table Editor」を開く
2. 削除したいテーブルを選択（例: `experiment_results`）

### ステップ2: データを選択して削除

1. 削除したい行を選択（チェックボックスをクリック）
2. 複数選択する場合は、Shiftキーを押しながらクリック
3. 上部の「Delete」ボタンをクリック
4. 確認ダイアログで「Confirm」をクリック

**注意**: Table Editorでは一度に削除できる行数に制限がある場合があります。

## 方法3: テーブルごとの削除順序

外部キー制約がある場合、削除順序が重要です：

```sql
-- 1. 子テーブルから削除（外部キー参照があるテーブル）
DELETE FROM experiment_results;
DELETE FROM experiment_surveys;

-- 2. 親テーブルを削除
DELETE FROM experiment_completions;
```

## 方法4: テーブル全体を削除（データとテーブル構造の両方を削除）

**⚠️ 警告**: この方法はテーブル構造も削除します。データだけでなく、テーブル定義も削除されます。

```sql
-- テーブルを削除（CASCADEで依存関係も削除）
DROP TABLE IF EXISTS experiment_results CASCADE;
DROP TABLE IF EXISTS experiment_surveys CASCADE;
DROP TABLE IF EXISTS experiment_completions CASCADE;
```

テーブルを削除した後、再作成する必要があります：

```sql
-- docs/SUPABASE_SQL.sqlの内容を実行してテーブルを再作成
```

## よく使う削除パターン

### パターン1: テストデータのみ削除

```sql
-- 被験者IDが'test'で始まるデータを削除
DELETE FROM experiment_results WHERE participant_id LIKE 'test%';
DELETE FROM experiment_surveys WHERE participant_id LIKE 'test%';
DELETE FROM experiment_completions WHERE participant_id LIKE 'test%';
```

### パターン2: 特定のタスクのデータのみ削除

```sql
-- タスクAのデータのみ削除
DELETE FROM experiment_results WHERE task = 'A';
DELETE FROM experiment_surveys WHERE task = 'A';
```

### パターン3: 不完全なデータを削除

```sql
-- 24トライアル未満の被験者のデータを削除
DELETE FROM experiment_results 
WHERE participant_id IN (
  SELECT participant_id 
  FROM experiment_results 
  GROUP BY participant_id 
  HAVING COUNT(*) < 24
);
```

## 安全な削除手順（推奨）

1. **バックアップを取る**
   ```sql
   -- データをエクスポート（CSV形式）
   ```

2. **削除対象を確認**
   ```sql
   -- 削除するデータをSELECTで確認
   SELECT * FROM experiment_results WHERE participant_id = '1';
   ```

3. **トランザクションで削除（ロールバック可能）**
   ```sql
   BEGIN;
   
   -- 削除を実行
   DELETE FROM experiment_results WHERE participant_id = '1';
   DELETE FROM experiment_surveys WHERE participant_id = '1';
   DELETE FROM experiment_completions WHERE participant_id = '1';
   
   -- 確認して問題なければCOMMIT、問題があればROLLBACK
   -- COMMIT;
   -- ROLLBACK;
   ```

4. **削除を確認**
   ```sql
   -- データが削除されたか確認
   SELECT COUNT(*) FROM experiment_results WHERE participant_id = '1';
   ```

## トラブルシューティング

### 削除ができない場合

1. **RLSポリシーの確認**
   - Service Role Keyを使用している場合、RLSは無視されます
   - それでも削除できない場合は、RLSポリシーを確認

2. **外部キー制約の確認**
   ```sql
   -- 外部キー制約を確認
   SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE constraint_type = 'FOREIGN KEY' 
     AND tc.table_name IN ('experiment_results', 'experiment_surveys', 'experiment_completions');
   ```

3. **権限の確認**
   - Service Role Keyを使用している場合、削除権限はあります
   - それでも削除できない場合は、Supabaseの設定を確認

## クイック削除スクリプト

### すべてのデータを削除（注意して使用）

```sql
-- ⚠️ 警告: すべてのデータが削除されます
-- 実行前に必ずバックアップを取ってください

BEGIN;

DELETE FROM experiment_results;
DELETE FROM experiment_surveys;
DELETE FROM experiment_completions;

-- 確認して問題なければCOMMIT
-- COMMIT;

-- 問題があればROLLBACK
-- ROLLBACK;
```

### 特定の被験者のデータを削除

```sql
-- 被験者IDを指定して削除
BEGIN;

DELETE FROM experiment_results WHERE participant_id = '1';
DELETE FROM experiment_surveys WHERE participant_id = '1';
DELETE FROM experiment_completions WHERE participant_id = '1';

-- 確認して問題なければCOMMIT
-- COMMIT;
```

## 次のステップ

データを削除した後：

1. **テーブル構造を確認**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'experiment_results' 
   ORDER BY ordinal_position;
   ```

2. **新しい実験を開始**
   - 被験者IDを1から再開
   - データが正しく保存されるか確認

