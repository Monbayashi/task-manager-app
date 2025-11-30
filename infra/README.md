# インフラ

## 概要

## フォルダ構成

```
.
├── .bin/
│   └── app.ts
├── lib/
│   ├── dynamodb-stack.ts
│   └── lambda-stack.ts
├── cdk.json
├── package.json
└── tsconfig.json
```

## 使用ライブラリ

| ライブラリ名  | バージョン | 説明                                                  |
| ------------- | ---------- | ----------------------------------------------------- |
| aws-cdk       | 2.1031.2   | AWSのインフラをコード（コード）で定義・構築・管理する |
| aws-cdk-local | ^3.0.1     | LocalStack用のCDKラッパー                             |

# 動作確認用コマンド

```
# table一覧取得
aws dynamodb list-tables --endpoint-url=http://localhost:4566

# lambda一覧取得
aws lambda list-functions --endpoint-url=http://localhost:4566

# cloudwatch logsのLog group名一覧
aws logs describe-log-groups --endpoint-url=http://localhost:4566

# lambdaのログ確認
aws logs tail /aws/lambda/InvitationHandler --follow --endpoint-url http://localhost:4566

# lambdaの起動確認 (lambdaのログが出力される)
aws dynamodb put-item   --table-name task-table-invitation-v3   --item "{
    \"PK\": {\"S\": \"TEAM#t4\"},
    \"SK\": {\"S\": \"INVITE#i20\"},
    \"type\": {\"S\": \"invitation\"},
    \"email\": {\"S\": \"test1@example.com\"},
    \"role\": {\"S\": \"member\"},
    \"createdAt\": {\"N\": \"$(date +%s)\"},
    \"expiresAt\": {\"N\": \"$(date -d '+7 day' +%s)\"},
    \"invitedBy\": {\"S\": \"USER#u1\"}
  }"   --return-consumed-capacity TOTAL   --endpoint-url http://localhost:4566
```

※ Git Bashを使っていて"/aws/lambda/InvitationHandler"が想定の通り動かない場合以下を実行する必要がある。
export MSYS_NO_PATHCONV=1
※ 戻す場合は以下
unset MSYS_NO_PATHCONV
