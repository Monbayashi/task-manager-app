import * as cdk from "aws-cdk-lib/core";
import { DynamoDBStack } from "../lib/dynamodb-stack";
import { LambdaStack } from "../lib/lambda-stack";

const app = new cdk.App();

// コンテキストから環境を取得
const envKey = app.node.tryGetContext("env") || "local";
const isLocal = envKey === "local";

const env = {
  // region: isLocal ? "ap-northeast-1" : process.env.CDK_DEFAULT_REGION,
  // account: isLocal ? "000000000000" : process.env.CDK_DEFAULT_ACCOUNT,
  account: "000000000000", // LocalStack 用ダミーアカウント
  region: "ap-northeast-1",
};

const dynamoStack = new DynamoDBStack(app, "DynamoDBStack", { env });
new LambdaStack(app, "LambdaStack", {
  env,
  table: dynamoStack.invitationTable,
});

app.synth();
