# DynamoDBの設計

[リポジトリのトップに戻る](../README.md)

<br/>

- [task-table-v3 テーブル設計](#dynamodb-task-table-v3-テーブル設計)

- [task-table-invitation-v3 テーブル設計](#dynamodb-task-table-invitation-v3-テーブル設計)

<br/>

---

# DynamoDB task-table-v3 テーブル設計

タスク管理 APP メインのテーブル

シングルテーブル設計で作成

## Capacity Settings

| 項目 | 設定値 |
| ---- | ------ |
| WCU  | 5      |
| RCU  | 5      |

## Key Attributes

| キー | 属性名 | 型  | 説明                                                     |
| ---- | ------ | --- | -------------------------------------------------------- |
| PK   | PK     | S   | USER#{userId}, TEAM#{teamId}                             |
| SK   | SK     | S   | USER#{userId}, TEAM#{teamId}, TAG#{tagId}, TASK#{taskId} |

## Non Key Attributes

| Attribute 名          | 型  | 入力例                                                      | 適用エンティティ　   |
| --------------------- | --- | ----------------------------------------------------------- | -------------------- |
| type                  | S   | user, user_team, team, team_user, team_tag, task, counter   | すべて               |
| user_email            | S   | alice-at-example.com                                        | user                 |
| user_name             | S   | monbayashi joji                                             | user, team_user      |
| user_image            | S   | https://...                                                 | user                 |
| user_createdAt        | S   | 2025-11-01                                                  | user                 |
| team_name             | S   | タスク管理 APP 開発チーム                                   | team, user_team      |
| team_discription      | S   | タスク管理 APP 開発チーム用のタスク管理                     | team                 |
| user_team_role        | S   | admin, member                                               | user_team, team_user |
| user_team_joinedAt    | S   | 2025-11-09                                                  | user_team, team_user |
| team_tag_name         | S   | backend, frontend                                           | team_tag             |
| team_tag_color        | M   | { color: string, backgroundColor: string }                  | team_tag             |
| team_task_title       | S   | デプロイ 1                                                  | task                 |
| team_task_discription | S   | タスクの説明 タスクの説明 タスクの説明 タスクの説明         | task                 |
| team_task_status      | S   | todo, doing, done                                           | task                 |
| team_task_startTime   | S   | 2025-11-05                                                  | task                 |
| team_task_endTime     | S   | 2025-12-05                                                  | task                 |
| team_task_tagRef      | SS  | ["TAG#tag1", "TAG#tag2"]                                    | task                 |
| status_group1         | S   | TEAM#{teamId}#Status#todo, TEAM#t{teamId}#Status#doing_done | task                 |
| status_group2         | S   | TEAM#{teamId}#Status#done, TEAM#t{teamId}#Status#todo_doing | task                 |
| status_group3         | S   | TEAM#{teamId}#Status#doing, TEAM#{teamId}#Status#todo_done  | task                 |
| start_sort_sk         | S   | START#2025-11-10                                            | task                 |
| end_sort_sk           | S   | END#2025-11-15                                              | task                 |
| todo                  | N   | 集計用 todo                                                 | counter              |
| doing                 | N   | 集計用 doing                                                | counter              |
| done                  | N   | 集計用 done                                                 | counter              |
| expiresAt             | N   | 集計削除用 **_TTL属性_**                                    | counter              |

## GSI 構成 (9 個)

| GSI 名                       | PK            | SK            | ProjectType | 用途                        |
| ---------------------------- | ------------- | ------------- | ----------- | --------------------------- |
| GSI_Invert                   | SK            | PK            | ALL         | 逆引き用                    |
| GSI_Status_Start_Sort_All    | PK            | start_sort_sk | ALL         | 全ステータス + 開始日ソート |
| GSI_Status_End_Sort_All      | PK            | end_sort_sk   | ALL         | 全ステータス + 終了日ソート |
| GSI_Status_Start_Sort_Group1 | status_group1 | start_sort_sk | ALL         | TODO or DOING+DONE          |
| GSI_Status_End_Sort_Group1   | status_group1 | end_sort_sk   | ALL         | TODO or DOING+DONE          |
| GSI_Status_Start_Sort_Group2 | status_group2 | start_sort_sk | ALL         | TODO+DOING or DONE          |
| GSI_Status_End_Sort_Group2   | status_group2 | end_sort_sk   | ALL         | TODO+DOING or DONE          |
| GSI_Status_Start_Sort_Group3 | status_group3 | start_sort_sk | ALL         | DOING or TODO+DONE          |
| GSI_Status_End_Sort_Group3   | status_group3 | end_sort_sk   | ALL         | DOING or TODO+DONE          |

### ※ GSI_Status_xxxx_Sort_xxxx の詳細

ステータスを網羅するには以下のパターンが存在する。

1. TODO
2. DOING
3. DONE
4. TODO + DOING
5. DOING + DONE
6. TODO + DONE
7. TODO + DOING + DONE

GSI をなるべく減らす為にステータスをグループ化

| ステータス | Group1     | Group2     | Group3    |
| ---------- | ---------- | ---------- | --------- |
| TODO       | todo       | todo_doing | todo_done |
| DOING      | doing_done | todo_doing | doing     |
| DONE       | doing_done | done       | todo_done |

## シングルテーブル具体例

| エンティティ    | PK            | SK             | type      | 含まれる主要属性                                               |
| --------------- | ------------- | -------------- | --------- | -------------------------------------------------------------- |
| ユーザー情報    | USER#{userId} | USER#{userId}  | user      | `user_email`, `user_name`, `user_image`, `user_createdAt`      |
| 所属チーム      | USER#{userId} | TEAM#{teamId}  | user_team | `user_team_role`, `user_team_joinedAt`, `team_name`            |
| チーム情報      | TEAM#{teamId} | TEAM#{teamId}  | team      | `team_name`, `team_discription`                                |
| チームメンバー  | TEAM#{teamId} | USER#{userId}  | team_user | `user_team_role`, `user_team_joinedAt`, `user_name`            |
| チーム タグ     | TEAM#{teamId} | TAG#{tagId}    | team_tag  | `team_tag_name`, `team_tag_color`                              |
| チーム タスク   | TEAM#{teamId} | TASK#{taskId}` | task      | `team_task_title`, `team_task_discription`, `team_task_status` |
|                 |               |                |           | `team_task_startTime`, `team_task_endTime`, `team_task_tagRef` |
|                 |               |                |           | `status_group1` , `status_group2`, `status_group3`             |
|                 |               |                |           | `start_sort_sk`, `end_sort_sk`                                 |
| チーム集計-全て | TEAM#{teamId} | COUNTER#ALL    | counter   | `todo`, `doing`, `done`, `expiresAt`                           |
| チーム集計-日付 | TEAM#{teamId} | COUNTER#{日付} | counter   | `todo`, `doing`, `done`, `expiresAt`                           |

## アクセスパターン

| #   | パターン                            | GSI          |
| --- | ----------------------------------- | ------------ |
| 1   | ユーザー取得                        | Primary      |
| 2   | チームの全ユーザー                  | Primary      |
| 3   | チーム情報                          | Primary      |
| 4   | ユーザーの全チーム                  | Primary      |
| 5   | 全タグ                              | Primary      |
| 6   | タスク詳細                          | Primary      |
| 7   | 初期表示（TODO_DOING + 開始日昇順） | Group2 Start |
| 8   | TODO のみ                           | Group1 Start |
| 9   | 単体タグ + TODO                     | Group1 Start |
| 10  | 複数タグ + TODO                     | Group1 Start |
| 11  | 全ステータス                        | All Start    |
| 12  | 開始日遅延（TODO）                  | Group1 Start |
| 13  | 開始日遅延 + 複数タグ               | Group1 Start |
| 14  | 完了遅延（DOING）                   | Group2 End   |
| 15  | 完了遅延 + 複数タグ                 | Group2 End   |
| 16  | チームの集計                        | Primary      |

<br/><br/><br/>

---

# DynamoDB task-table-invitation-v3 テーブル設計

タスク管理 APP 招待メール送信のテーブル

DynamoDB Stream を使って以下のフローを実施予定

DynamoDB -- stream --> Lambda --> SES(メール送信)

## Capacity Settings

| 項目 | 設定値 |
| ---- | ------ |
| WCU  | 1      |
| RCU  | 1      |

## Key Attributes

| キー | 属性名 | 型  | 説明                                                       |
| ---- | ------ | --- | ---------------------------------------------------------- |
| PK   | PK     | S   | TEAM#{teamId}                                              |
| SK   | SK     | S   | TINVITE#{inviteId} // inviteId は UUID.v7 で登録順にソート |

## Non Key Attributes

| Attribute 名 | 型  | 入力例                   | 適用エンティティ　 |
| ------------ | --- | ------------------------ | ------------------ |
| type         | S   | invitation               | すべて             |
| email        | S   | alice-at-example.com     | invitation         |
| user_role    | S   | admin, member            | invitation         |
| createdAt    | N   | 1768141200 // Unix 秒    | invitation         |
| expiresAt    | N   | 1768227600 **_TTL属性_** | invitation         |
| invitedBy    | S   | "USER#u1"                | invitation         |
| token        | S   | ramdom                   | invitation         |
| team_name    | S   | 招待時点でのチーム名称   | invitation         |

## GSI 構成 (0 個)

※なし

## アクセスパターン

| #   | パターン               | GSI     |
| --- | ---------------------- | ------- |
| 1   | チームごとの招待を取得 | Primary |
| 2   | 招待を取得             | Primary |
