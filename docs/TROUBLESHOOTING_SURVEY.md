# アンケートデータが保存されない場合のトラブルシューティング

## 確認手順

### ステップ1: ブラウザのコンソールでエラーを確認

1. デプロイされたページを開く
2. 開発者ツールを開く（F12キー）
3. 「Console」タブを開く
4. アンケートを送信する
5. 以下のログが表示されるか確認：
   - `[Server Save] Attempting to save survey:` - アンケート送信の試行
   - `[Server Save] Survey response saved successfully:` - 成功
   - `[Server Save] Error saving survey to server:` - エラー

### ステップ2: ネットワークタブでAPIリクエストを確認

1. 開発者ツールの「Network」タブを開く
2. アンケートを送信する
3. `/api/save-survey`へのリクエストを確認：
   - **Status**: 200（成功）か、エラーコード（400, 500など）
   - **Request Payload**: `participantId`と`surveyResponse`が含まれているか
   - **Response**: 成功メッセージかエラーメッセージ

### ステップ3: Vercelのログを確認

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. 「Functions」タブを開く
4. `/api/save-survey`を選択
5. ログを確認：
   - エラーメッセージがないか
   - Supabaseへの接続エラーがないか

### ステップ4: Supabaseのテーブル構造を確認

```sql
-- テーブルが存在するか確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'experiment_surveys';

-- テーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'experiment_surveys'
ORDER BY ordinal_position;
```

**期待される列**:
- `id` (bigint)
- `participant_id` (text)
- `task` (text)
- `ranking_A` (integer)
- `ranking_B` (integer)
- `ranking_C` (integer)
- `ranking_D` (integer)
- `timestamp` (timestamptz)
- `created_at` (timestamptz)

## よくある問題と解決方法

### 問題1: APIエンドポイントが見つからない（404エラー）

**原因**: Vercelにデプロイされていない、またはパスが間違っている

**解決方法**:
1. `api/save-survey.ts`がGitHubリポジトリに含まれているか確認
2. Vercelに再デプロイ
3. Vercelダッシュボードの「Functions」タブで`/api/save-survey`が表示されているか確認

### 問題2: 環境変数が設定されていない（500エラー）

**原因**: `SUPABASE_URL`または`SUPABASE_SERVICE_ROLE_KEY`が設定されていない

**解決方法**:
1. Vercelダッシュボードで「Settings」→「Environment Variables」を開く
2. 以下の環境変数が設定されているか確認：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. 設定されていない場合は追加
4. 再デプロイ

### 問題3: Supabaseのテーブルが存在しない

**原因**: `experiment_surveys`テーブルが作成されていない

**解決方法**:
1. Supabaseダッシュボードで「SQL Editor」を開く
2. `docs/SUPABASE_SQL.sql`の内容を実行
3. 特に以下の部分を確認：
   ```sql
   CREATE TABLE IF NOT EXISTS experiment_surveys (
     ...
   );
   ```

### 問題4: RLSポリシーの問題

**原因**: Row Level Securityが有効で、Service Role Keyでもアクセスできない

**解決方法**:
1. Supabaseダッシュボードで「SQL Editor」を開く
2. 以下のポリシーが作成されているか確認：
   ```sql
   CREATE POLICY "Allow service role full access to experiment_surveys"
   ON experiment_surveys
   FOR ALL
   USING (true)
   WITH CHECK (true);
   ```

### 問題5: データ型の不一致

**原因**: 送信されるデータの型がテーブルの定義と一致していない

**確認方法**:
```sql
-- 最新のエラーを確認
SELECT * 
FROM experiment_surveys 
ORDER BY created_at DESC 
LIMIT 1;
```

**解決方法**:
- `api/save-survey.ts`で送信するデータの型定義を確認
- Supabaseのテーブル定義と一致しているか確認

### 問題6: アンケートが実際に送信されていない

**原因**: フロントエンドで`logSurveyResponse`が呼び出されていない

**確認方法**:
1. ブラウザのコンソールで`[Server Save] Attempting to save survey:`が表示されるか確認
2. 表示されない場合、`App.tsx`の`handleSurveySubmit`が呼び出されているか確認

## デバッグ用のSQLクエリ

### アンケートデータの確認

```sql
-- 全アンケートデータを確認
SELECT * 
FROM experiment_surveys 
ORDER BY timestamp DESC;
```

### エラーログの確認（Supabase）

1. Supabaseダッシュボードで「Logs」→「Postgres Logs」を開く
2. エラーメッセージを確認

## テスト方法

### 手動テスト

1. 実験ページを開く
2. 被験者IDを入力（例: `test1`）
3. 実験を進めてアンケート画面まで到達
4. アンケートに回答して送信
5. ブラウザのコンソールでログを確認
6. Supabaseでデータが保存されているか確認

### APIエンドポイントの直接テスト

Postmanやcurlを使用して直接APIをテスト：

```bash
curl -X POST https://your-project.vercel.app/api/save-survey \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test1",
    "surveyResponse": {
      "task": "A",
      "rankings": {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4
      },
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  }'
```

## 次のステップ

問題が解決しない場合：

1. **ブラウザのコンソールログを確認**
2. **VercelのFunctionログを確認**
3. **SupabaseのPostgresログを確認**
4. **エラーメッセージを記録して調査**

