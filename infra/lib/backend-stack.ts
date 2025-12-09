// lib/backend-stack.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";

interface BackendStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  alb: elbv2.ApplicationLoadBalancer;
  invitationTable: dynamodb.Table;
  taskTable: dynamodb.Table;
  domainName: string;
}

export class BackendStack extends cdk.Stack {
  public readonly taskDef: ecs.FargateTaskDefinition;
  public readonly service: ecs.FargateService;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Dockerイメージアセットの定義
    const image = new ecrAssets.DockerImageAsset(this, "BackendImage", {
      directory: path.join(__dirname, "../../"),
      file: "Dockerfile.backend",
    });

    // タスク定義
    this.taskDef = new ecs.FargateTaskDefinition(this, "TaskDef", {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    // Container定義
    this.taskDef.addContainer("Backend", {
      image: ecs.ContainerImage.fromDockerImageAsset(image),
      portMappings: [{ containerPort: 3001 }],
      environment: {
        NODE_ENV: "production",
        BACKEND_PREFIX: "api",
        BACKEND_PORT: "3001",
        BACKEND_LOG_LEVEL: "info",
        BACKEND_CORS_ORIGIN: `https://${props.domainName}`,
        AWS_REGION: "ap-northeast-1",
        AWS_DYNAMO_TASK_TABLE: "task-table-v3",
        AWS_DYNAMO_INVITATION_TABLE: "task-table-invitation-v3",
        AWS_COGNITO_USER_POOL_ID: "ap-northeast-1_MD7zqiZga",
        AWS_COGNITO_CLIENT_ID: "7oa3l9iv02dr6vv6du8b0aqehm",
      },
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "backend" }),
    });

    // Service定義
    this.service = new ecs.FargateService(this, "Service", {
      cluster: props.cluster,
      taskDefinition: this.taskDef,
      capacityProviderStrategies: [
        { capacityProvider: "FARGATE_SPOT", weight: 1 },
      ],
      desiredCount: 1,
      assignPublicIp: true,
    });

    // ALBのリスナーとターゲットグループを設定
    props.alb
      .addListener("Listener", { port: 80, open: true })
      .addTargets("Target", {
        port: 3001,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targets: [this.service],
        healthCheck: { path: "/api/health" },
      });

    // 権限付与
    props.invitationTable.grantReadWriteData(this.taskDef.taskRole);
    props.taskTable.grantReadWriteData(this.taskDef.taskRole);
  }
}
