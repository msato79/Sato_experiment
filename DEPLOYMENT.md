# Vercelデプロイ手順

実験プログラムが完成したら、以下の手順でVercelにデプロイします。

## 前提条件

- [ ] 実験プログラムが完成している
- [ ] Supabaseプロジェクトが作成済み
- [ ] SupabaseのAPIキーを取得済み
- [ ] データベーステーブル（`experiment_results`）が作成済み

## デプロイ手順

### ステップ1: GitHubリポジトリの準備

1. **GitHubにログイン**: https://github.com
2. **新しいリポジトリを作成**:
   - 右上の「+」→「New repository」
   - Repository name: `graph-3d-viewer`（任意の名前）
   - Public/Private: どちらでも可
   - 「Create repository」をクリック

### ステップ2: プロジェクトをGitリポジトリに変換

ターミナルでプロジェクトのルートディレクトリに移動して実行：

```bash
# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Graph 3D Viewer experiment"

# メインブランチに設定
git branch -M main

# GitHubリポジトリをリモートとして追加
# （以下は例です。実際のリポジトリURLに置き換えてください）
git remote add origin https://github.com/あなたのユーザー名/graph-3d-viewer.git

# GitHubにプッシュ
git push -u origin main
```

**注意**: `.env.local`ファイルは`.gitignore`に含まれているため、GitHubにプッシュされません（安全です）。

### ステップ3: Vercelアカウントの作成

1. **Vercelにアクセス**: https://vercel.com
2. **「Sign Up」をクリック**
3. **「Continue with GitHub」を選択**（推奨）
   - GitHubアカウントと連携すると、リポジトリの自動インポートが簡単になります

### ステップ4: Vercelにプロジェクトをインポート

1. **Vercelダッシュボード**: https://vercel.com/dashboard
2. **「Add New...」→「Project」をクリック**
3. **GitHubリポジトリを選択**:
   - 「Import Git Repository」でGitHubを選択
   - 作成したリポジトリ（`graph-3d-viewer`）を選択
   - 「Import」をクリック

### ステップ5: プロジェクト設定の確認

Vercelが自動的に設定を検出しますが、確認してください：

- **Framework Preset**: `Vite`（自動検出されるはず）
- **Root Directory**: `./`（そのまま）
- **Build Command**: `npm run build`（自動設定）
- **Output Directory**: `dist`（自動設定）
- **Install Command**: `npm install`（自動設定）

設定を確認したら、**「Deploy」をクリック**（まだ環境変数は設定しません）

### ステップ6: 初回デプロイの完了を待つ

- デプロイには2〜3分かかります
- 「Building...」→「Ready」になれば完了
- この時点では環境変数が設定されていないため、エラーが出る可能性があります（正常です）

### ステップ7: 環境変数の設定

1. **プロジェクトページで「Settings」タブをクリック**
2. **左メニューから「Environment Variables」を選択**
3. **以下の4つの環境変数を追加**:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_SUPABASE_URL` | あなたのSupabase Project URL | ✅ Production<br>✅ Preview<br>✅ Development |
   | `VITE_SUPABASE_ANON_KEY` | あなたのSupabase publishable key | ✅ Production<br>✅ Preview<br>✅ Development |
   | `SUPABASE_URL` | あなたのSupabase Project URL | ✅ Production<br>✅ Preview<br>✅ Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | あなたのSupabase Secret keys (service_role) | ✅ Production<br>✅ Preview<br>✅ Development |

   **各環境変数の追加方法**:
   - 「Name」に変数名を入力
   - 「Value」に値を入力
   - 「Environment」でProduction、Preview、Developmentすべてにチェック
   - 「Save」をクリック

4. **すべての環境変数を追加したら、再デプロイが必要です**:
   - 「Deployments」タブを開く
   - 最新のデプロイメントの右側の「...」メニューをクリック
   - 「Redeploy」を選択
   - 「Redeploy」ボタンをクリック

### ステップ8: 動作確認

1. **デプロイが完了したら、URLが表示されます**（例: `https://your-project.vercel.app`）
2. **そのURLにアクセスして動作確認**:
   - 実験プログラムが正常に動作するか確認
   - データがSupabaseに保存されるか確認（SupabaseダッシュボードのTable Editorで確認）

### ステップ9: カスタムドメインの設定（オプション）

必要に応じて、独自のドメインを設定できます：

1. 「Settings」→「Domains」
2. ドメイン名を入力
3. DNS設定の指示に従う

## トラブルシューティング

### デプロイが失敗する場合

- **環境変数が正しく設定されているか確認**
- **ビルドログを確認**（「Deployments」→ デプロイメントをクリック → 「Build Logs」）
- **ローカルで`npm run build`が成功するか確認**

### データが保存されない場合

- **Supabaseの環境変数が正しく設定されているか確認**
- **Supabaseダッシュボードでテーブルが作成されているか確認**
- **ブラウザのコンソールでエラーを確認**（F12キー）

### APIエンドポイントが404エラーになる場合

- **Vercelの「Functions」タブでAPIエンドポイントが表示されているか確認**
- **`api/`ディレクトリのファイルが正しく配置されているか確認**

## デプロイ後の確認事項

- [ ] 実験プログラムが正常に動作する
- [ ] データがSupabaseに保存される
- [ ] 環境変数が正しく設定されている
- [ ] APIエンドポイントが正常に動作する

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)





