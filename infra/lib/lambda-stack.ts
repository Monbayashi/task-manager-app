import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as path from "path";

interface LambdaStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // SNS トピック作成
    const topic = new sns.Topic(this, "InvitationTopic", {
      topicName: "invitation-topic",
      displayName: "Invitation Email Topic",
    });

    // Lambda作成
    const handler = new lambda.Function(this, "InvitationHandler", {
      functionName: `InvitationHandler`, // 後で`${envPrefix}-InvitationHandler`
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../apps/invitation-service/dist")
      ),
      environment: {
        TABLE_NAME: props.table.tableName,
        SNS_TOPIC_ARN: topic.topicArn,
        NODE_OPTIONS: "--enable-source-maps",
      },
    });

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
      retention: logs.RetentionDays.ONE_WEEK, // 保存期間
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // SNS トピックに、Lambda 関数がメッセージを送信（Publish）できる権限を付与
    topic.grantPublish(handler);

    // 出力
    new cdk.CfnOutput(this, "TopicArn", {
      value: topic.topicArn,
      description: "SNS Topic ARN for testing",
      exportName: "InvitationTopicArn",
    });

    props.table.grantStreamRead(handler);
  }
}
