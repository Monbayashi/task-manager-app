// packages/backend/scripts/create-tables.ts
import {
  DynamoDBClient,
  CreateTableCommand,
  BillingMode,
  ScalarAttributeType,
  KeyType,
  StreamViewType,
  ProjectionType,
  type CreateTableCommandInput,
} from '@aws-sdk/client-dynamodb';
import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { DEFAULT_USER1 } from '../test/data/default-data';

const client = new DynamoDBClient({
  endpoint: 'http://localhost:4567',
  region: 'ap-northeast-1',
});

const tables: CreateTableCommandInput[] = [
  // ====================
  // 1. task-table-invitation-v3
  // ====================
  {
    TableName: 'task-table-invitation-v3',
    KeySchema: [
      { AttributeName: 'PK', KeyType: KeyType.HASH },
      { AttributeName: 'SK', KeyType: KeyType.RANGE },
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'SK', AttributeType: ScalarAttributeType.S },
    ],
    BillingMode: BillingMode.PROVISIONED,
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: StreamViewType.NEW_AND_OLD_IMAGES,
    },
  },

  // ====================
  // 2. task-table-v3（メイン + 9つのGSI）
  // ====================
  {
    TableName: 'task-table-v3',
    KeySchema: [
      { AttributeName: 'PK', KeyType: KeyType.HASH },
      { AttributeName: 'SK', KeyType: KeyType.RANGE },
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'SK', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'start_sort_sk', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'end_sort_sk', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'status_group1', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'status_group2', AttributeType: ScalarAttributeType.S },
      { AttributeName: 'status_group3', AttributeType: ScalarAttributeType.S },
    ],
    BillingMode: BillingMode.PROVISIONED,
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    GlobalSecondaryIndexes: [
      // GSI 1: GSI_Invert
      {
        IndexName: 'GSI_Invert',
        KeySchema: [
          { AttributeName: 'SK', KeyType: KeyType.HASH },
          { AttributeName: 'PK', KeyType: KeyType.RANGE },
        ],
        Projection: { ProjectionType: ProjectionType.ALL },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      // GSI 2: GSI_Status_Start_Sort_All
      {
        IndexName: 'GSI_Status_Start_Sort_All',
        KeySchema: [
          { AttributeName: 'PK', KeyType: KeyType.HASH },
          { AttributeName: 'start_sort_sk', KeyType: KeyType.RANGE },
        ],
        Projection: { ProjectionType: ProjectionType.ALL },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      // GSI 3: GSI_Status_End_Sort_All
      {
        IndexName: 'GSI_Status_End_Sort_All',
        KeySchema: [
          { AttributeName: 'PK', KeyType: KeyType.HASH },
          { AttributeName: 'end_sort_sk', KeyType: KeyType.RANGE },
        ],
        Projection: { ProjectionType: ProjectionType.ALL },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      // GSI 4〜9: Group 1〜3
      ...['1', '2', '3'].flatMap((group) => [
        {
          IndexName: `GSI_Status_Start_Sort_Group${group}`,
          KeySchema: [
            { AttributeName: `status_group${group}`, KeyType: KeyType.HASH },
            { AttributeName: 'start_sort_sk', KeyType: KeyType.RANGE },
          ],
          Projection: { ProjectionType: ProjectionType.ALL },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        },
        {
          IndexName: `GSI_Status_End_Sort_Group${group}`,
          KeySchema: [
            { AttributeName: `status_group${group}`, KeyType: KeyType.HASH },
            { AttributeName: 'end_sort_sk', KeyType: KeyType.RANGE },
          ],
          Projection: { ProjectionType: ProjectionType.ALL },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        },
      ]),
    ],
  },
];

const testDatas: PutCommandInput[] = [
  // 1. ユーザー作成
  {
    TableName: 'task-table-v3',
    Item: {
      PK: `USER#${DEFAULT_USER1.userId}`,
      SK: `USER#${DEFAULT_USER1.userId}`,
      type: 'user',
      user_email: DEFAULT_USER1.email,
      user_name: DEFAULT_USER1.userName,
      user_createdAt: DEFAULT_USER1.userCreatedAt,
    },
  },
  // 2. チーム作成
  {
    TableName: 'task-table-v3',
    Item: {
      PK: `TEAM#${DEFAULT_USER1.teamId}`,
      SK: `TEAM#${DEFAULT_USER1.teamId}`,
      type: 'team',
      team_name: DEFAULT_USER1.teamName,
      team_discription: '',
    },
  },
  // 3. ユーザーのチーム所属
  {
    TableName: 'task-table-v3',
    Item: {
      PK: `USER#${DEFAULT_USER1.userId}`,
      SK: `TEAM#${DEFAULT_USER1.teamId}`,
      type: 'user_team',
      user_team_role: 'admin',
      user_team_joinedAt: DEFAULT_USER1.teamJoinedAt,
      team_name: DEFAULT_USER1.teamName,
    },
  },
  // 3. チームのメンバー追加
  {
    TableName: 'task-table-v3',
    Item: {
      PK: `TEAM#${DEFAULT_USER1.teamId}`,
      SK: `USER#${DEFAULT_USER1.userId}`,
      type: 'team_user',
      user_team_role: 'admin',
      user_team_joinedAt: DEFAULT_USER1.teamJoinedAt,
      user_name: DEFAULT_USER1.userName,
    },
  },
];

/** テストテーブル作成 */
async function main() {
  // テーブル作成
  for (const params of tables) {
    try {
      await client.send(new CreateTableCommand(params));
      console.log(`テーブルを作成しました: ${params.TableName}`);
    } catch (error: any) {
      if (error.name === 'ResourceInUseException') {
        console.log(`テーブルは既に存在しています: ${params.TableName}`);
      } else {
        console.error('テーブル作成に失敗しました:', params.TableName, error);
        throw error;
      }
    }
  }
  console.log('すべてのテーブルが正常に作成されました！');
  // データ作成
  for (const data of testDatas) {
    try {
      await client.send(new PutCommand(data));
    } catch (error: any) {
      console.error('データ作成に失敗しました:', error);
      throw error;
    }
  }
  console.error('テストデータが正常に作成されました！');
}

main().catch((err) => {
  console.error('テーブル作成に失敗しました:', err);
  process.exit(1);
});
