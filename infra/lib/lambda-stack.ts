import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as logs from "aws-cdk-lib/aws-logs";
import * as path from "path";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface LambdaStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  domainName: string;
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const isLocal = scope.node.tryGetContext("env") === "local";

    // Lambda作成
    const handler = new lambda.Function(this, "InvitationHandler", {
      functionName: `InvitationHandler`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../apps/invitation-service/dist")
      ),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        INVITATION_LOG_LEVEL: "info",
        INVITATION_RETRY_TIMEOUT: "1000",
        NODE_OPTIONS: "--enable-source-maps",
        // 本番・ローカルの条件分岐
        NODE_ENV: isLocal ? "development" : "production",
        ...(isLocal && {
          AWS_SES_ENDPOINT: "http://host.docker.internal:4566",
        }),
        AWS_SES_FROM_EMAIL: "noreply@joji-monbayashi.click",
        INVITATION_LINK_ORIGIN: isLocal
          ? "http://localhost:3000"
          : `https://${props.domainName}`,
      },
    });

    // IAM権限付与: SES SendEmail の追加
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
        effect: Effect.ALLOW,
      })
    );

    // DynamoDBのStreamイベント設定
    handler.addEventSource(
      new eventsources.DynamoEventSource(props.table, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 1,
      })
    );

    // DynamoDB テーブルの Stream（変更ログ）を、Lambda 関数が読む権限を付与
    props.table.grantStreamRead(handler);

    // ロググループ作成 invitation
    new logs.LogGroup(this, "InvitationHandlerLogGroup", {
      logGroupName: "/aws/lambda/InvitationHandler",
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
