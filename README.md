# 3D Graph Viewer - 実験アプリケーション

3Dグラフを用いた心理学実験のためのWebアプリケーションです。被験者が3D空間に配置されたグラフを操作し、最短経路の選択や最も遠いノードの選択などのタスクを実行します。

## 概要

このプロジェクトは、3D空間に配置されたグラフ（ノードとエッジ）を可視化し、被験者がグラフ上でタスクを実行するための実験プラットフォームです。複数の表示条件（2D/3D、回転速度など）を提供し、実験データを自動的に記録します。

## 主な機能

- **3Dグラフの可視化**: Three.jsを使用した3Dレンダリング
- **複数の表示条件**: 2D/3D表示、回転速度の違いなど
- **タスク実行**: 最短経路選択、最も遠いノード選択などのタスク
- **データ記録**: 実験結果の自動記録（localStorage + 将来のサーバー保存対応）
- **アンケート機能**: 各トライアル後の主観評価
- **データエクスポート**: CSV/JSON形式でのデータエクスポート
- **グラフの回転制御**: 回転の一時停止/再開機能
- **マウスホバー**: ノードの視認性向上のためのホバー効果

## 起動方法

### 前提条件
- Node.js (v16以上)
- npm または yarn

### インストール
```bash
# リポジトリをクローン
git clone <repository-url>
cd graph-3d-viewer

# 依存関係をインストール
npm install
```

### 開発サーバーの起動
```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

### ビルド
```bash
# 本番用ビルド
npm run build

# プレビュー
npm run preview
```

## 使用方法

### 1. 実験の実行

1. 参加者IDを入力して実験を開始
2. タスクの説明を読む
3. 各トライアルでグラフを操作してタスクを実行
4. 必要に応じてアンケートに回答
5. 実験完了後、データをエクスポート

### 2. グラフの操作

- **ノードの選択**: マウスでノードをクリック
- **グラフの回転**: 条件C/Dでは自動回転（一時停止ボタンで制御可能）
- **マウスホバー**: ノードにマウスを重ねると赤色に光る
- **ハイライト**: 緑色に光っているノードが開始ノード（タスク2）

### 3. データの保存

- **自動保存**: 各トライアル完了時にlocalStorageに自動保存
- **エクスポート**: 実験完了画面でCSV/JSON形式でダウンロード可能
- **サーバー保存**: 将来的にサーバー側にも自動保存（現在は開発中）

## Vercelへのデプロイ

### 前提条件

- Vercelアカウント（[vercel.com](https://vercel.com)で無料登録可能）
- GitHub/GitLab/Bitbucketアカウント（Gitリポジトリが必要）

### デプロイ手順

1. **Gitリポジトリの準備**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

2. **Vercelにプロジェクトをインポート**
   - [Vercel Dashboard](https://vercel.com/dashboard)にログイン
   - "Add New..." → "Project" を選択
   - Gitリポジトリを選択
   - プロジェクト設定を確認（自動検出されるはず）
   - "Deploy" をクリック

3. **環境変数の設定（将来のデータベース接続用）**
   - Vercel Dashboard → プロジェクト → Settings → Environment Variables
   - `.env.example` を参考に必要な環境変数を設定

4. **デプロイの確認**
   - デプロイが完了すると、VercelからURLが提供されます
   - そのURLにアクセスして動作を確認

### 注意事項

- 現在、データはlocalStorageとダウンロードファイルに保存されます
- サーバー側への自動保存機能は将来実装予定です
- データを確実に保存するには、実験完了後にCSV/JSONをエクスポートしてください

## 技術スタック

- **フロントエンド**: React, TypeScript, Vite
- **3Dライブラリ**: Three.js
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel
- **データ保存**: localStorage（現在）、サーバー側保存（将来実装予定）

## ファイル構成

```
src/
├── components/       # Reactコンポーネント
│   ├── GraphDisplay.tsx
│   ├── TrialRunner.tsx
│   ├── TaskDisplay.tsx
│   └── ...
├── lib/             # ライブラリ関数
│   ├── graph-viewer.ts    # 3Dグラフの可視化
│   ├── data-logger.ts     # データ保存機能
│   └── ...
├── types/           # TypeScript型定義
├── config/          # 設定ファイル
└── locales/         # 多言語対応（日本語）

public/
├── conditions.csv   # 実験条件ファイル
└── graphs/          # グラフデータファイル

api/                 # Vercel Serverless Functions（将来実装）
```

## 開発者向け情報

### データ保存の仕組み

- **現在**: localStorageに保存 + CSV/JSONエクスポート
- **将来**: Vercel Serverless Functions + データベース（Supabase等）に保存予定

### サーバー側保存の実装（将来）

`src/lib/data-logger.ts` にサーバー保存用の関数が準備されています。将来的に以下のAPIエンドポイントを実装する予定です：

- `api/save-trial.ts` - トライアル結果の保存
- `api/save-survey.ts` - アンケート結果の保存
- `api/complete-experiment.ts` - 実験完了の記録

詳細はコード内のコメントを参照してください。

