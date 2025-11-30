# Invitation Service

## 概要

チームに参加招待を送信する処理

```mermaid
flowchart LR
    A[DynamoDB<br/>task-table-invitation-v3] --> B[Lambda<br/>InvitationHandler]
    B --> C[SNS<br/>InvitationTopic]
```

※ Nestjsはスタンドアロンアプリで作成。※ buildはwebpackでバンドル

## フォルダ構成

```
.
├── .src/
│   ├──invitaion/
│   │   ├── invitaion.service.spec.ts
│   │   └── invitation.service.ts
│   ├── app.module.ts
│   └── main.ts
├── nest-cli.json
├── webpack.config.js
├── package.json
└── tsconfig.json
```

## 使用ライブラリ

| ライブラリ名        | バージョン | 説明                                                            |
| ------------------- | ---------- | --------------------------------------------------------------- |
| nestjs              | 11.0.1     | バックエンドフレームワーク (スタンドアロンアプリケーション可能) |
| aws-lambda          | 1.0.7      |                                                                 |
| @aws-sdk/client-sns | ^3.932.0   | sns sdk                                                         |

## テスト範囲

xxxx.service.tsのみテスト
