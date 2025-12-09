import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DynamoDBStack extends cdk.Stack {
  public readonly invitationTable: dynamodb.Table;
  public readonly taskTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ====================
    // 1. task-table-invitation-v3
    // ====================
    this.invitationTable = new dynamodb.Table(this, "InvitationTable", {
      tableName: "task-table-invitation-v3",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: "expiresAt", // TTL ※ttlなら設定が不要
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ====================
    // 2. task-table-v3
    // ====================
    this.taskTable = new dynamodb.Table(this, "TaskTable", {
      tableName: "task-table-v3",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      timeToLiveAttribute: "expiresAt", // TTL ※ttlなら設定が不要
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 必要な属性定義（GSI 用）
    // GSI 1: GSI_Invert (SK=HASH, PK=RANGE)
    this.taskTable.addGlobalSecondaryIndex({
      indexName: "GSI_Invert",
      partitionKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: 5,
      writeCapacity: 5,
    });
    // GSI 2: GSI_Status_Start_Sort_All
    this.taskTable.addGlobalSecondaryIndex({
      indexName: "GSI_Status_Start_Sort_All",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "start_sort_sk", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: 5,
      writeCapacity: 5,
    });
    // GSI 3: GSI_Status_End_Sort_All
    this.taskTable.addGlobalSecondaryIndex({
      indexName: "GSI_Status_End_Sort_All",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "end_sort_sk", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: 5,
      writeCapacity: 5,
    });
    // GSI 4-9: Group 1〜3
    ["1", "2", "3"].forEach((group) => {
      // Start Sort
      this.taskTable.addGlobalSecondaryIndex({
        indexName: `GSI_Status_Start_Sort_Group${group}`,
        partitionKey: {
          name: `status_group${group}`,
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: { name: "start_sort_sk", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
        readCapacity: 5,
        writeCapacity: 5,
      });
      // End Sort
      this.taskTable.addGlobalSecondaryIndex({
        indexName: `GSI_Status_End_Sort_Group${group}`,
        partitionKey: {
          name: `status_group${group}`,
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: { name: "end_sort_sk", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
        readCapacity: 5,
        writeCapacity: 5,
      });
    });

    // 出力
    new cdk.CfnOutput(this, "InvitationTableName", {
      value: this.invitationTable.tableName,
      exportName: "InvitationTableName",
    });

    new cdk.CfnOutput(this, "TaskTableName", {
      value: this.taskTable.tableName,
      exportName: "TaskTableName",
    });
  }
}
