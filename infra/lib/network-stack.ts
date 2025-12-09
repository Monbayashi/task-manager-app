// lib/network-stack.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;
  public readonly cluster: ecs.ICluster;
  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Vpc (既存のルックアップを使用)
    this.vpc = ec2.Vpc.fromLookup(this, "Vpc", { isDefault: true });

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, "Cluster", { vpc: this.vpc });

    // ALB
    this.alb = new elbv2.ApplicationLoadBalancer(this, "ALB", {
      vpc: this.vpc,
      internetFacing: true,
    });

    // ALBのDNS名を他のスタックで利用できるようにエクスポート
    new cdk.CfnOutput(this, "ALBDnsName", {
      value: this.alb.loadBalancerDnsName,
      exportName: `${this.stackName}-ALBDnsName`,
    });
  }
}
