import * as cdk from "aws-cdk-lib";
import { DynamoDBStack } from "../lib/dynamodb-stack";
import { LambdaStack } from "../lib/lambda-stack";
import { CognitoStack } from "../lib/cognito-stack";
import { NetworkStack } from "../lib/network-stack";
import { BackendStack } from "../lib/backend-stack";
import { FrontendStack } from "../lib/front-end.stack";

const app = new cdk.App();

// 共通定数
const DOMAIN_NAME = "joji-monbayashi.click";
const CERTIFICATE_ARN =
  "arn:aws:acm:us-east-1:421748860658:certificate/c97cc231-7fee-425e-806c-c928fc3441f8";

// コンテキストから環境を取得
const envKey = app.node.tryGetContext("env") || "local";
const isLocal = envKey === "local";

const env = {
  account: isLocal ? "000000000000" : process.env.CDK_DEFAULT_ACCOUNT,
  region: "ap-northeast-1",
};

// Stack作成
const dynamoStack = new DynamoDBStack(app, "DynamoDBStack", { env });

// LambdaはinvitationTableのStreamを監視
new LambdaStack(app, "LambdaStack", {
  env,
  table: dynamoStack.invitationTable,
  domainName: DOMAIN_NAME,
});

// 本番専用: localstack不可
if (!isLocal) {
  new CognitoStack(app, "CognitoStack", { env });
  const networkStack = new NetworkStack(app, "NetworkStack", { env });
  // 2. バックエンドスタックを作成
  const backendStack = new BackendStack(app, "BackendStack", {
    env,
    vpc: networkStack.vpc,
    cluster: networkStack.cluster,
    alb: networkStack.alb,
    invitationTable: dynamoStack.invitationTable,
    taskTable: dynamoStack.taskTable,
    // 👇 DOMAIN_NAME を渡す
    domainName: DOMAIN_NAME,
  });

  // 3. フロントエンド/配信スタックを作成
  new FrontendStack(app, "FrontendStack", {
    env,
    alb: networkStack.alb,
    // 👇 DOMAIN_NAME と CERTIFICATE_ARN を渡す
    domainName: DOMAIN_NAME,
    certificateArn: CERTIFICATE_ARN,
  });
}

app.synth();
