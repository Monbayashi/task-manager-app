# Backend (NestJS API)

NestJS で実装された REST API サーバーです。  
ECS Fargate Spot で稼働し、タスク管理のコア機能を提供します。  
DynamoDB を AWS SDK (lib-dynamodb) で直接操作しています。

## 技術スタック

| カテゴリ       | 技術詳細                     |
| -------------- | ---------------------------- |
| フレームワーク | NestJS (TypeScript)          |
| データベース   | AWS DynamoDB (lib-dynamodb)  |
| 認証           | AWS Cognito (aws-jwt-verify) |
| ロギング       | Pino + nestjs-pino           |
| バリデーション | Zod + nestjs-zod             |
| テスト         | Jest                         |

## フォルダ構造

```
backend/
├── scripts/                      # テスト用スクリプト
├── src/
│   ├── common/                   # 共通ユーティリティ
│   │   ├── config/               #  - 環境変数モジュール
│   │   ├── guards/               #  - 認証関連 (Cognito)
│   │   ├── logger/               #  - Logger (Pino)
│   │   └── pipe/                 #  -
│   ├── modules/                  # 機能モジュール (コントローラ・サービス)
│   │   ├── health/               #  - ヘルスチェック
│   │   ├── invitations/          #  - 招待関連
│   │   ├── summary/              #  - 集計関連
│   │   ├── tags/                 #  - タグ関連
│   │   ├── tasks/                #  - タスク関連
│   │   ├── teams/                #  - チーム関連
│   │   └── users/                #  - ユーザ関連
│   ├── types/                    # declare module
│   ├── shared/                   # 共有ユーティリティ (dynamodb-client など)
│   ├── app.module.ts
│   └── main.ts
├── test/                         # Jestテスト
├── .env.development              # develop 環境変数
├── .env.test                     # test 環境変数
├── docker-compose.test.yml       # テスト用 DockerCompose (localstack)
└── package.json                  # 依存関係
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
  "./src/**/*.service.ts",
  "!./src/**/*.test.ts",
  "!./src/**/*.spec.ts",
]
```
