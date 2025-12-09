import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class CognitoStack extends cdk.Stack {
  public readonly userPoolId: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      "ImportedUserPool",
      "ap-northeast-1_MD7zqiZga"
    );

    this.userPoolId = userPool.userPoolId;

    new cdk.CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
  }
}
