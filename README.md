# 3D Graph Viewer - 実験アプリケーション
リンク：https://github.com/msato79/Sato_experiment
3Dグラフを用いた心理学実験のためのWebアプリケーションです。被験者が3D空間に配置されたグラフを操作し、最短経路の判定や共通隣接ノードの選択などのタスクを実行します。

## 概要

このプロジェクトは、3D空間に配置されたグラフ（ノードとエッジ）を可視化し、被験者がグラフ上でタスクを実行するための実験プラットフォームです。複数の表示条件（2D/3D、固定視点/自由視点、立体視の有無）を提供し、ラテン方格法による条件割り当てと実験データの自動記録を行います。

## 実験の内容

### タスクA: 最短経路のエッジ数の判定

画面上で2つのノードがハイライトされます。この2つのノード間を、最短経路でたどるときにたどるエッジの本数が2か、それとも3以上かを判定してください。

- **回答**: 「エッジ2本」または「エッジ3本以上」のボタンをクリック
- **トライアル数**: 12問（本番）
- **練習**: 2問（正解フィードバックあり）

### タスクB: 共通隣接ノードの選択

画面上で2つのノードがハイライトされます。この2つのノードの両方に隣接しているノードをすべて選択してください。

- **回答**: ノードをクリックして選択し、すべて選択したら「次へ進む」をクリック
- **共通隣接ノード**: 0個の場合もあります
- **トライアル数**: 12問（本番）
- **練習**: 2問（正解フィードバックあり）

## 主な機能

- **3Dグラフの可視化**: Three.jsを使用した3Dレンダリング
- **複数の表示条件**: 
  - 条件A: 2D表示（平面表示）
  - 条件B: 3D表示（固定視点・立体視なし）
  - 条件C: 3D表示（固定視点・立体視あり）
  - 条件D: 3D表示（自由視点・立体視なし）
- **ラテン方格法による条件割り当て**: 被験者IDに基づいて自動的に条件を割り当て
- **データ記録**: 実験結果の自動記録（Supabase + localStorage）
- **アンケート機能**: 各タスク終了後の主観評価（明確さ、疲労感）
- **データエクスポート**: CSV/JSON形式でのデータエクスポート
- **グラフの回転制御**: 条件Cでは自動回転（一時停止/再開可能）
- **マウスホバー**: ノードの視認性向上のためのホバー効果

## 起動方法

### 前提条件

- Node.js (v16以上)
- npm または yarn
- Supabaseアカウント（データ保存用、オプション）

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

## 実験の流れ

1. **実験情報の確認**: 実験の概要と流れを確認
2. **同意書**: 研究への参加同意
3. **参加者IDの入力**: 参加者IDを入力し、確認画面で確認
4. **タスクAの説明**: タスクAの説明を読む
5. **タスクAの練習**: 2問の練習問題（正解フィードバックあり）
6. **タスクAの本番**: 12問の本番問題
7. **タスクAのアンケート**: 主観評価（明確さ、疲労感）
8. **タスクBの説明**: タスクBの説明を読む
9. **タスクBの練習**: 2問の練習問題（正解フィードバックあり）
10. **タスクBの本番**: 12問の本番問題
11. **タスクBのアンケート**: 主観評価（明確さ、疲労感）
12. **実験完了**: データのエクスポート

## データ保存

### Supabaseへの自動保存

実験データは自動的にSupabaseデータベースに保存されます：

- **experiment_results**: トライアル結果（回答、正誤、反応時間、クリック数など）
- **experiment_surveys**: アンケート結果（各タスクの主観評価）
- **experiment_completions**: 実験完了記録（開始時刻、終了時刻）

### ローカルストレージ

ブラウザのlocalStorageにもデータが保存され、実験完了画面でCSV/JSON形式でエクスポートできます。

### Supabaseの設定

Supabaseデータベースの設定手順については、[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)を参照してください。

## デプロイ

### Vercelへのデプロイ

このアプリケーションはVercelにデプロイできます。詳細な手順については、[docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)を参照してください。

### 環境変数

Vercelにデプロイする際は、以下の環境変数を設定してください：

- `SUPABASE_URL`: SupabaseプロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key（機密情報）

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **3Dライブラリ**: Three.js
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel
- **API**: Vercel Serverless Functions

## ファイル構成

```
src/
├── components/          # Reactコンポーネント
│   ├── TrialRunner.tsx      # トライアル実行コンポーネント
│   ├── GraphDisplay.tsx     # グラフ表示コンポーネント
│   ├── TaskDisplay.tsx      # タスク表示コンポーネント
│   ├── TaskHandlers/        # タスク別ハンドラー
│   │   ├── TaskAHandler.tsx
│   │   └── TaskBHandler.tsx
│   └── ...
├── lib/                # ライブラリ関数
│   ├── graph-viewer.ts      # 3Dグラフの可視化
│   ├── data-logger.ts       # データ保存機能
│   ├── path-finder.ts       # 最短経路・共通隣接ノードの計算
│   ├── csv-parser.ts        # CSVパーサー
│   └── counterbalancing.ts   # ラテン方格法による条件割り当て
├── hooks/              # カスタムフック
│   ├── useConditionsLoader.ts
│   ├── useDataLogging.ts
│   ├── useExperimentPhase.ts
│   └── useTrialManagement.ts
├── types/              # TypeScript型定義
├── locales/            # 多言語対応（日本語）
└── utils/              # ユーティリティ関数

public/
├── conditions.csv      # 実験条件ファイル（ノードペア、タスク、セットID）
└── graphs/             # グラフデータファイル（CSV形式）

api/                    # Vercel Serverless Functions
├── save-trial.ts       # トライアル結果の保存
├── save-survey.ts      # アンケート結果の保存
└── complete-experiment.ts  # 実験完了の記録

docs/                   # ドキュメント
├── SUPABASE_SETUP.md       # Supabase設定手順
├── VERCEL_DEPLOYMENT.md    # Vercelデプロイ手順
├── CHECK_DATA.md           # データ確認ガイド
├── DELETE_DATA.md          # データ削除ガイド
├── LATIN_SQUARE_VALIDATION.md  # ラテン方格法の検証
├── VALIDATION_QUERIES.md   # 検証クエリ集
├── SUPABASE_QUERIES.md     # Supabaseクエリ集
├── TROUBLESHOOTING_SURVEY.md  # トラブルシューティング
└── SUPABASE_SQL.sql        # データベーステーブル作成SQL
```

## ドキュメント

詳細なドキュメントは`docs/`フォルダにあります：

- **[SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)**: Supabaseデータベースの設定手順
- **[VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)**: Vercelへのデプロイ手順
- **[CHECK_DATA.md](docs/CHECK_DATA.md)**: データ確認ガイド
- **[DELETE_DATA.md](docs/DELETE_DATA.md)**: データ削除ガイド
- **[LATIN_SQUARE_VALIDATION.md](docs/LATIN_SQUARE_VALIDATION.md)**: ラテン方格法の検証方法
- **[VALIDATION_QUERIES.md](docs/VALIDATION_QUERIES.md)**: データ検証用SQLクエリ集
- **[SUPABASE_QUERIES.md](docs/SUPABASE_QUERIES.md)**: Supabaseデータ取得・分析用クエリ集
- **[TROUBLESHOOTING_SURVEY.md](docs/TROUBLESHOOTING_SURVEY.md)**: アンケートデータ保存のトラブルシューティング

## 開発者向け情報

### ラテン方格法による条件割り当て

被験者IDを4で割った余りに基づいて、以下のパターンで条件が割り当てられます：

| 被験者ID | パターン | セット1 | セット2 | セット3 | セット4 |
|---------|---------|---------|---------|---------|---------|
| 1, 5, 9, 13... | パターン1 | A | B | C | D |
| 2, 6, 10, 14... | パターン2 | B | C | D | A |
| 3, 7, 11, 15... | パターン3 | C | D | A | B |
| 4, 8, 12, 16... | パターン4 | D | A | B | C |

詳細は`src/lib/counterbalancing.ts`を参照してください。

### データ保存の仕組み

1. **フロントエンド**: `src/lib/data-logger.ts`でデータを準備
2. **APIエンドポイント**: `api/`フォルダのServerless FunctionsでSupabaseに保存
3. **ローカルストレージ**: ブラウザのlocalStorageにも保存（バックアップ用）

### グラフデータの形式

グラフデータはCSV形式で、以下の形式です：

```
N,0,x,y,z
N,1,x,y,z
...
E,0,1
E,1,2
...
```

- `N`: ノード定義（ノードID, x座標, y座標, z座標）
- `E`: エッジ定義（開始ノードID, 終了ノードID）

## ライセンス

このプロジェクトは研究目的で使用されています。

## 連絡先

- 実施分担者: 佐藤充（筑波大学）
- Email: sato@vislab.cs.tsukuba.ac.jp
