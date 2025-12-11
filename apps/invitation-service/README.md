# Invitation Service (AWS Lambda)

招待メール送信専用の NestJS スタンドアロンアプリケーションです。  
DynamoDB Stream トリガーにより起動され、AWS SES 経由で招待リンクを送信します。

## 技術スタック

| カテゴリ       | 技術詳細                         |
| -------------- | -------------------------------- |
| フレームワーク | NestJS (Standalone)              |
| メール送信     | AWS SES (AWS SDK v3)             |
| ログ           | Pino                             |
| デプロイ       | AWS Lambda (GitHub Actions 経由) |

## フォルダ構造（主な部分）

```
invitation-service/
├── src/
│   ├── common/                       # 共通ユーティリティ
│   │   ├── config/                   #  - 環境変数モジュール
│   │   └── logger/                   #  - Logger (Pino)
│   ├── invitation/
│   │   └── invitation.service.ts     # メイン処理
│   ├── shared/                       # 共通ユーティリティ
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env.local                        # 環境変数例
├── package.json                      # 依存関係
└── webpack.config.js                 # webpackバンドル
```

## ローカル開発

```bash
# 開発モード起動
pnpm dev
```

API: http://localhost:3001/api

## テスト

```bash
pnpm test
```

### カバレッジ範囲

```
collectCoverageFrom: [
  "./src/**/*.ts",
  "!./src/**/*.test.ts",
  "!./src/**/*.spec.ts",
],
```
