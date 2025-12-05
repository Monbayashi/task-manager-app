# タスク管理アプリケーション

ポートフォリオ用に作成

## 概要

turborepoを使ってモノリポ構成で作成

## フォルダ構造

```
.
├── .husky/
│   └── pre-commit
├── .vscode/
│   └── settings.json
├── apps/                   # アプリケーション
│   ├── backend/            # Nestjs (ECS Fargate Spot)
│   │   └── ...
│   ├── frontend/           # Nextjs SPA (S3)
│   │   └── ...
│   └── invitation-service/ # Nestjs Standalone (Lambda) ※DyanmoDB Streamにて起動
│       └── ...
├── packages/               # 共通ライブラリ
│   ├── api-models/
│   │   └── ...
│   ├── eslint-config/
│   │   └── ...
│   ├── jest-config/
│   │   └── ...
│   ├── typescript-config/
│   │   └── ...
│   └── types/
│       └── ...
├── infra/                  # インフラ (CDK, Localstack)
│   ├── bin/
│   │   └── app.ts
│   ├── lib/
│   │   ├── dynamodb-stack.ts
│   │   └── lambda-stack.ts
│   ├── cdk.json
│   └── package.json
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── turbo.json
└── ...
```

## 開発環境に必要物

| ソフト          | 説明                       | リンク                                                                                |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| vscode          | エディター                 | https://code.visualstudio.com/download                                                |
| docker          | Dynamo用                   | https://docs.docker.jp/desktop/install/windows-install.html                           |
| NoSQL Workbench | Dynamo用                   | https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/workbench.html |
| Volta           | Nodeバージョンマネージャー | https://docs.volta.sh/guide/getting-started                                           |
| node (volta)    | v22以上                    | volta install node #最新のLTS取得                                                     |
| pnpm (in Volta) | v10以上                    | volta install pnpm #最新のpnpm                                                        |
| git             | バージョン管理             | https://git-scm.com/install                                                           |
| aws cli         | AWS用                      | https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html   |

## 開発作業手順

### ENVファイルを作成

#### apps/frontend/.env

```
# 担当者に聞いてください。
NEXT_PUBLIC_COGNITO_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_DOMAIN=
NEXT_COGNITO_ISSUER=
```

#### apps/backend/.env.develop

```
BACKEND_PREFIX=api
BACKEND_PORT=3001
# AWS
AWS_REGION=ap-northeast-1
AWS_DYNAMO_ENDPOINT=http://localhost:4566
AWS_DYNAMO_TASK_TABLE=task-table-v3
AWS_DYNAMO_INVITATION_TABLE=task-table-invitation-v3
AWS_COGNITO_USER_POOL_ID=ap-northeast-1_MD7zqiZga
AWS_COGNITO_CLIENT_ID=7oa3l9iv02dr6vv6du8b0aqehm
```

#### apps/backend/.env.test

```
BACKEND_PREFIX=api
BACKEND_PORT=3001
# AWS
AWS_REGION=ap-northeast-1
AWS_DYNAMO_ENDPOINT=http://localhost:4566
AWS_DYNAMO_TASK_TABLE=task-table-v3
AWS_DYNAMO_INVITATION_TABLE=task-table-invitation-v3
AWS_COGNITO_USER_POOL_ID=ap-northeast-1_MD7zqiZga
AWS_COGNITO_CLIENT_ID=7oa3l9iv02dr6vv6du8b0aqehm
```

#### apps/invitation-service/.env.test

```
# AWS
AWS_REGION=ap-northeast-1
AWS_SNS_ENDPOINT=http://localhost:4566
AWS_SNS_TOPIC_ARN=arn:aws:sns:ap-northeast-1:000000000000:invitation-topic
```

### ROOTの配下でコマンド

```
# ========== 初回のみ ==========
git clone https://github.com/Monbayashi/task-manager-app.git

# 依存環境インストール
pnpm install

# ビルド (localstack起動に必要)
pnpm turbo build

# ========== 起動毎 ==========
# localstack 起動 + DyanamoDB, Lambdaの初期デプロイ
pnpm localstack:up

# frontend,backend 起動
pnpm turbo dev --filter=frontend
pnpm turbo dev --filter=backend

# invitation-service 起動 (CloudWatchのログ確認 + build度に自動デプロイ)
# ※チーム招待をすることでログが出ることを確認できる。
pnpm localstack:dev

```

## コメントのタグ一覧

| タグ        | 説明               |
| ----------- | ------------------ |
| TODO        | 後でやること       |
| FIXME       | 今すぐ直したい問題 |
| NOTE / INFO | 補足説明や背景情報 |
| HACK        | 苦肉の策コード     |
| BUG         | 明確なバグ         |
| REFACTOR    | リファクタ対象     |
| OPTIMIZE    | パフォーマンス改善 |
