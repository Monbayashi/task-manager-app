# Infrastructure (AWS CDK)

AWS CDK (TypeScript) で記述されたインフラストラクチャ定義です。  
このプロジェクトの全リソース（VPC、ECS Fargate、Lambda、DynamoDB、Cognito、S3+CloudFrontなど）をコードで管理しています。

| カテゴリ  | 技術詳細             |
| --------- | -------------------- |
| IaCツール | AWS CDK (TypeScript) |

## フォルダ構造

```
infra/
├── bin/
│   └── app.ts                    # CDKアプリのエントリーポイント
├── lib/
│   ├── backend.stack.ts
│   ├── cognito.stack.ts
│   ├── dynamodb.stack.ts
│   ├── frontend.stack.ts
│   └── lambda.stack.ts
│   └── network.stack.ts
├── scripts/                      # frontend用のbuildスクリプト (next.jsのbuildにバグあり)
├── cdk.json                      # CDK設定（app、contextなど）
└── package.json                  # 依存関係
```

※ nextjs バグissue: https://github.com/vercel/next.js/issues/85374

## 注意点

- ローカルでデプロイするには適切なAWS権限が必要です。
  - Github Actionsでデプロイする想定
  - 初回のbootstrapの時に必要な場合があるが基本不要
