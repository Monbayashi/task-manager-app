# Task Manager App

**本番環境（Frontend）**  
https://joji-monbayashi.click/

**テスト用アカウント（maildrop.ccを使用）**

| ユーザー名   | メールアドレス                        | パスワード  | メール受信リンク                                             |
| ------------ | ------------------------------------- | ----------- | ------------------------------------------------------------ |
| TEST-USER-01 | monbayashi-test1-x8f2mkq9@maildrop.cc | T3st!User01 | https://maildrop.cc/inbox/?mailbox=monbayashi-test1-x8f2mkq9 |
| TEST-USER-02 | monbayashi-test2-x8f2mkq9@maildrop.cc | T3st!User02 | https://maildrop.cc/inbox/?mailbox=monbayashi-test2-x8f2mkq9 |

**招待メール動作確認**  
SESサンドボックスモードのため、招待先メールアドレスは事前にSESコンソールで認証済みである必要があります（上記テストユーザー宛はOK）。

## プロジェクト概要

Turborepo で管理されたモノレポ構成のタスク管理フルスタックアプリケーションです。  
ポートフォリオ用に、フロントエンドからバックエンド、インフラ（IaC）まで一貫して自分で構築したことをアピールするために作成しました。

- モダンなモノレポ開発（Turborepo + pnpm）
- TypeScript による型安全なフルスタック実装
- AWS サーバーレス／コンテナ混合アーキテクチャ
- LocalStack による完全ローカル開発環境の再現

## 主な機能

- タスクのCRUD（作成・一覧・更新・削除）
- チーム管理（作成・一覧・更新・削除予定）
- チームタグの管理（作成・一覧・更新・削除）
- 優先度・期限・ステータス管理
- AWS Cognitoによる認証（メール/パスワード + Googleログイン対応）
- メール招待によるユーザーコラボレーション（DynamoDB Stream → Lambda → SES）
- タスクの検索・フィルタリング（ステータス、期間、日付ソート）

## 技術スタック

| カテゴリ       | 技術詳細                                       |
| -------------- | ---------------------------------------------- |
| フロントエンド | Next.js (App Router), TypeScript, Tailwind CSS |
| バックエンド   | NestJS (ECS Fargate Spot で稼働)               |
| 招待サービス   | NestJS Standalone (AWS Lambda)                 |
| データベース   | Amazon DynamoDB                                |
| 認証           | Amazon Cognito                                 |
| インフラ       | AWS CDK (TypeScript), LocalStack               |
| デプロイ       | S3 (フロント), ECS Fargate Spot, Lambda        |
| パッケージ管理 | pnpm Workspaces + Turborepo                    |
| テスト・Lint   | Jest, ESLint, Prettier, Husky                  |

## 全体構成

```
/
├── apps/
│ ├── backend/    # NestJS API (ECS Fargate)
│ ├── frontend/   # Next.js SPA (S3 + CloudFront)
│ └── invitation/ # Invitation Lambda (SES)
│
├── infra/ # CDK のコード
│
├── packages/ # 共通パッケージ（DTO, utils など）
│ ├── api-moddels       # frontend,backendで共通に使用する、Schemaや型を指定
│ ├── eslint-config     # eslint
│ ├── jset-config       # jest
│ └── typescript-config # tsconfig
│
└── turbo.json # Turborepo 設定
```

## 前提条件（必要なソフトウェア）

- Node.js（v22以上、Volta推奨）
- pnpm（v10以上）
- Docker & Docker Compose
- Git
- VS Code

## ローカル開発環境の立ち上げ

### ローカル環境必要な設定

```bash
# リポジトリをクローン
git clone https://github.com/Monbayashi/task-manager-app.git
cd task-manager-app

# 依存関係インストール
pnpm install
```

### 環境変数 (作成)

※ポートフォリオ用に起動できるように記載しています。

#### backend (.env.development, .env.test)

```
# --------------- apps/backend/.env.development ---------------
BACKEND_PREFIX=api
BACKEND_PORT=3001
BACKEND_LOG_LEVEL=info
BACKEND_CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
AWS_REGION=ap-northeast-1
AWS_DYNAMO_ENDPOINT=http://localhost:4566
AWS_DYNAMO_TASK_TABLE=task-table-v3
AWS_DYNAMO_INVITATION_TABLE=task-table-invitation-v3
AWS_COGNITO_USER_POOL_ID=ap-northeast-1_MD7zqiZga
AWS_COGNITO_CLIENT_ID=7oa3l9iv02dr6vv6du8b0aqehm

# --------------- apps/backend/.env.test ---------------
BACKEND_PREFIX=api
BACKEND_PORT=3001
BACKEND_LOG_LEVEL=silent
BACKEND_CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
AWS_REGION=ap-northeast-1
AWS_DYNAMO_ENDPOINT=http://localhost:4567
AWS_DYNAMO_TASK_TABLE=task-table-v3
AWS_DYNAMO_INVITATION_TABLE=task-table-invitation-v3
AWS_COGNITO_USER_POOL_ID=ap-northeast-1_test
AWS_COGNITO_CLIENT_ID=test_client
```

#### frontend (.env.development)

```
# --------------- apps/frontend/.env.development ---------------
NEXT_PUBLIC_COGNITO_POOL_ID=ap-northeast-1_MD7zqiZga
NEXT_PUBLIC_COGNITO_CLIENT_ID=7oa3l9iv02dr6vv6du8b0aqehm
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000/
NEXT_PUBLIC_DOMAIN=ap-northeast-1md7zqizga.auth.ap-northeast-1.amazoncognito.com
```

#### invitation-service (.env.local)

```
# --------------- apps/invitation-service/.env.local ---------------
INVITATION_LOG_LEVEL=silent
INVITATION_LINK_ORIGIN=http://localhost:3000
INVITATION_RETRY_TIMEOUT=1
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
AWS_REGION=ap-northeast-1
AWS_SES_ENDPOINT=http://localhost:4566
AWS_SES_FROM_EMAIL=noreply@joji-monbayashi.click
```

#### 起動コマンド

```bash
# 1. LocalStack（AWSローカルエミュレータ）起動
pnpm localstack:up

# 2. 各アプリを開発モードで起動
# ターミナルを4つ開いて以下を実行
pnpm turbo dev --filter=frontend      # http://localhost:3000
pnpm turbo dev --filter=backend       # http://localhost:3001
# ※ログが文字化けする場合は、cd apps/backend && pnpm dev
pnpm localstack:dev                   # 招待用Lambda（自動ビルド & deploy）
docker-compose logs -f                # DcokerComposeのログ
```

#### 起動確認

1. localhost:3000にアクセス (ログインページ表示)
2. テスト用アカウントでログイン (TEST-USER-01)
3. wellcomページで新規ユーザ登録
4. チーム設定画面に遷移 -> チーム招待 (monbayashi-test2-x8f2mkq9@maildrop.cc)
5. DockerComposeのログに"チーム 招待メール送信成功"が表示される。

## CI / CD

このリポジトリでは GitHub Actions を利用して CI / CD を実装しています。

※ https://github.com/Monbayashi/task-manager-app/actions

### CI（自動テスト）

`main` ブランチへの push および Pull Request に対して以下の CI が自動実行されます：

- Node.js のセットアップ
- pnpm 依存関係のインストール
- LocalStack（DynamoDB）を利用した統合テスト
- TurboRepo による test:ci の実行

CI ワークフロー: `.github/workflows/ci-test.yml`

### CD（デプロイ）

デプロイは GitHub Actions の 手動で`workflow_dispatch` で実行します。  
AWS アクセスキーは不要で、GitHub → AWS の **OIDC** を利用しています。

※ `main`ブランチでのみ実行可能

| カテゴリ            | 技術詳細                                  | 役割                                                    |
| :------------------ | :---------------------------------------- | :------------------------------------------------------ |
| フロントエンド      | `.github/workflows/deploy-frontend.yml`   | Frontend デプロイ                                       |
| バックエンド        | `.github/workflows/deploy-backend.yml`    | Backend デプロイ                                        |
| 招待サービス        | `.github/workflows/deploy-invitation.yml` | Invitation Service デプロイ                             |
| **Cron デプロイ**   | `.github/workflows/cron-deploy-all.yml`   | **（毎朝9:00 JST）夜間停止したリソースの再構築**        |
| **Cron デストロイ** | `.github/workflows/cron-destroy-all.yml`  | **（毎晩23:00 JST）コスト削減のためのリソース完全削除** |
