# Frontend (Next.js)

Next.js (App Router) で実装されたタスク管理アプリケーションのフロントエンドです。  
S3 + CloudFront でホスティングされ、本番環境は https://joji-monbayashi.click で動作しています。

## 技術スタック

| カテゴリ        | 技術詳細                             |
| --------------- | ------------------------------------ |
| フレームワーク  | Next.js 16 (App Router)              |
| UI/スタイリング | Tailwind CSS, Headless UI, Heroicons |
| 認証            | AWS Amplify (Cognito)                |
| データフェッチ  | SWR                                  |
| 状態管理        | Zustand                              |
| フォーム        | React Hook Form + Zod                |
| テスト          | Jest                                 |

## フォルダ構造（主な部分）

```
frontend/
├── api/                      # api関連 hooks
├── app/                      # App Routerページ
│   ├── ...                   # 各ページ
│   ├── layout.tsx            # ルートレイアウト
│   └── page.tsx              # ホーム
├── components/               # 共通コンポーネント
│   ├── layout/               #  - ヘッダーやサイドメニューなど
│   └── ui/                   #  - inputやiconやdialogなど
├── lib/                      # ユーティリティ (テストするものをここに配置)
│   ├── schemas/              #  - React Hook Formy用のスキーマ
│   ├── cognit-utils.ts       #  - Cognito関連のユーティリティ
│   └── date-utils.ts         #  - Date関連のユーティリティ
├── public/                   # 静的アセット
├── service/                  # ライブラリの設定など (amplify-client, api-clientなど)
├── store/                    # Zustandストア
├── styles/                   # グローバルCSS
├── .env.development          # develop 環境変数
└── package.json              # 依存関係
```

## ローカル開発

```bash
# 開発モード起動
pnpm dev
```

URL: http://localhost:3000

## テスト

※ libの配下のみをテスト。

```bash
pnpm test
```

### カバレッジ範囲

```
collectCoverageFrom: [
  "lib/**/*.ts",
  "!lib/**/*.test.ts",
  "!lib/**/*.spec.ts",
],
```

## 設計

### Z-index 階層設計

| 階層 | 値の目安 | className             | 用途                                                             |
| ---- | -------- | --------------------- | ---------------------------------------------------------------- |
| 1    | 100〜199 | -                     | （ほぼ使わない・廃止層）                                         |
| 2    | 200      | z-sticky              | ※現在未使用 (ホバーボタンやテーブルのヘッダー固定などに使う予定) |
| 3    | 300      | z-header              | header                                                           |
| 4    | 400      | z-model-backdrop      | modal backdrop                                                   |
| 5    | 410      | z-model               | modal 本体                                                       |
| 6    | 500      | z-popover             | popover / dropdown / tooltip / datepicker / select / combobox    |
| 7    | 600      | z-toast               | toast / notification / alert                                     |
| 8    | 999+     | z-skip-link, z-debbug | skip-link / debug                                                |
