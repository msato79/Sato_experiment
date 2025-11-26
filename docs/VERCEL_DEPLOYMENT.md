# Vercelデプロイ手順

このドキュメントでは、Vercelへのデプロイと環境変数の設定手順を説明します。

## 前提条件

- Supabaseプロジェクトが作成済み（ステップ1-3完了）
- Supabaseの環境変数（Project URL、Service Role Key）を取得済み
- GitHubアカウント（Vercelと連携するため）

## ステップ1: Vercelアカウントの作成・ログイン

1. [Vercel](https://vercel.com/)にアクセス
2. 「Sign Up」をクリックしてアカウント作成（GitHubアカウントで連携推奨）
3. または既存アカウントで「Log In」

## ステップ2: プロジェクトをGitHubにプッシュ

VercelはGitHubリポジトリと連携してデプロイします。

### 2.1. GitHubリポジトリの作成

1. GitHubにログイン
2. 「New repository」をクリック
3. リポジトリ名を入力（例: `graph-3d-viewer-experiment`）
4. 「Public」または「Private」を選択
5. 「Create repository」をクリック

### 2.2. ローカルプロジェクトをGitHubにプッシュ

ターミナルで以下のコマンドを実行：

```bash
# プロジェクトディレクトリに移動
cd "/Users/satomitsuru/Documents/研究室/実験プログラム/Sato2025Graph-3d-Viewer-mainのコピー"

# Gitリポジトリを初期化（まだの場合）
git init

# .gitignoreファイルを確認（存在しない場合は作成）
# node_modules、.env、distなどは除外する

# 変更をステージング
git add .

# 初回コミット
git commit -m "Initial commit: Graph 3D Viewer Experiment"

# GitHubリポジトリをリモートとして追加（YOUR_USERNAMEとYOUR_REPO_NAMEを置き換え）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# メインブランチを設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**注意**: `.env`ファイルや機密情報はGitHubにプッシュしないでください。

## ステップ3: Vercelでプロジェクトをインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」を選択
3. GitHubアカウントを連携（まだの場合）
4. 作成したリポジトリを選択
5. 「Import」をクリック

## ステップ4: プロジェクト設定

### 4.1. Framework Presetの確認

Vercelが自動検出する場合がありますが、以下を確認：

- **Framework Preset**: `Vite` または `Other`
- **Root Directory**: `./`（プロジェクトルート）
- **Build Command**: `npm run build`（自動検出されるはず）
- **Output Directory**: `dist`（自動検出されるはず）
- **Install Command**: `npm install`（自動検出されるはず）

### 4.2. 環境変数の設定

**重要**: デプロイ前に環境変数を設定してください。

1. 「Environment Variables」セクションを開く
2. 以下の環境変数を追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co`（SupabaseのProject URL） | Production, Preview, Development すべて |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（SupabaseのService Role Key） | Production, Preview, Development すべて |

**設定方法**:
1. 「Add New」をクリック
2. **Key**に`SUPABASE_URL`を入力
3. **Value**にSupabaseのProject URLを貼り付け
4. **Environment**で「Production」「Preview」「Development」すべてにチェック
5. 「Add」をクリック
6. 同様に`SUPABASE_SERVICE_ROLE_KEY`も追加

**注意**: 
- `SUPABASE_SERVICE_ROLE_KEY`は機密情報です。値は非表示になりますが、正しく入力してください。
- 環境変数はデプロイ後に反映されます。

### 4.3. その他の設定（オプション）

- **Project Name**: プロジェクト名を変更可能
- **Team**: チームに所属している場合は選択

## ステップ5: デプロイの実行

1. 設定が完了したら「Deploy」をクリック
2. ビルドプロセスが開始されます（1-3分程度）
3. デプロイが完了すると、URLが表示されます（例: `https://your-project.vercel.app`）

## ステップ6: デプロイの確認

### 6.1. ビルドログの確認

1. デプロイページで「View Function Logs」をクリック
2. エラーがないか確認
3. エラーがある場合は、ログを確認して修正

### 6.2. 動作確認

1. デプロイされたURLにアクセス
2. 実験アプリが正常に表示されるか確認
3. 被験者IDを入力して実験を開始
4. 1つのトライアルを完了
5. Supabaseダッシュボードでデータが保存されているか確認

### 6.3. Supabaseでのデータ確認

1. Supabaseダッシュボードで「Table Editor」を開く
2. `experiment_results`テーブルを選択
3. 保存されたデータを確認：
   - `participant_id`: 入力した被験者ID
   - `trial_id`: トライアルID
   - `condition`: 割り当てられた条件（A, B, C, D）
   - `set_id`: セットID（1-4）
   - `node1`, `node2`: ノードID
   - その他のデータ

## ステップ7: カスタムドメインの設定（オプション）

必要に応じて、カスタムドメインを設定できます。

1. Vercelダッシュボードで「Settings」→「Domains」を開く
2. ドメイン名を入力
3. DNS設定の指示に従う

## トラブルシューティング

### ビルドエラーが発生する場合

1. **ログを確認**
   - Vercelダッシュボードの「Deployments」→「View Function Logs」
   - エラーメッセージを確認

2. **よくあるエラー**
   - **環境変数が設定されていない**: 環境変数が正しく設定されているか確認
   - **TypeScriptエラー**: ローカルで`npm run build`を実行してエラーを確認
   - **依存関係エラー**: `package.json`の依存関係を確認

3. **ローカルでビルドテスト**
   ```bash
   npm install
   npm run build
   ```

### APIエンドポイントが動作しない場合

1. **環境変数の確認**
   - Vercelダッシュボードで環境変数が正しく設定されているか確認
   - 環境変数名にタイポがないか確認

2. **APIログの確認**
   - Vercelダッシュボードの「Functions」タブでAPIエンドポイントのログを確認
   - `/api/save-trial`、`/api/save-survey`、`/api/complete-experiment`のログを確認

3. **Supabase接続の確認**
   - Supabaseダッシュボードで「Logs」→「Postgres Logs」を確認
   - エラーメッセージを確認

### データが保存されない場合

1. **ブラウザのコンソールを確認**
   - 開発者ツール（F12）を開く
   - 「Console」タブでエラーメッセージを確認

2. **ネットワークタブを確認**
   - 「Network」タブでAPIリクエストを確認
   - `/api/save-trial`へのリクエストが送信されているか確認
   - レスポンスのステータスコードを確認（200が正常）

3. **SupabaseのRLSポリシーを確認**
   - Service Role Keyを使用している場合、RLSは無視されます
   - それでもエラーが出る場合は、SQLスクリプトを再実行

## 環境変数の更新

環境変数を変更した場合：

1. Vercelダッシュボードで「Settings」→「Environment Variables」を開く
2. 変数を編集または削除
3. 「Save」をクリック
4. 新しいデプロイを実行（自動的に再デプロイされる場合もあります）

## 次のステップ

デプロイが完了したら：

1. **テスト実験の実行**
   - 複数の被験者ID（1, 2, 3, 4など）で実験を実行
   - 各被験者で異なる条件が割り当てられるか確認

2. **データの確認**
   - Supabaseでデータが正しく保存されているか確認
   - ラテン方格法が正しく機能しているか確認（各セット×各条件が均等に割り当てられているか）

3. **本番環境での使用**
   - 実際の被験者にURLを共有
   - 被験者IDを順番に割り当て（1, 2, 3...）

## 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Vercel環境変数の設定](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercelデプロイメントガイド](https://vercel.com/docs/concepts/deployments/overview)

