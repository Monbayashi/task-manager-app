import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as path from "path";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

// ALBを外部から受け取るためのPropsを定義
interface FrontendStackProps extends cdk.StackProps {
  alb: elbv2.ApplicationLoadBalancer;
  domainName: string;
  certificateArn: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly url: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // ===== S3 + CloudFront 作成 =====
    const bucket = new s3.Bucket(this, "SiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS_ONLY,
      publicReadAccess: true,
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      domainNames: [props.domainName],
      certificate: acm.Certificate.fromCertificateArn(
        this,
        "Certificate",
        props.certificateArn
      ),
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3StaticWebsiteOrigin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: new cloudfront.OriginRequestPolicy(
          this,
          "SpaOriginRequestPolicy",
          {
            originRequestPolicyName: "SPA-Query-Headers-Only",
            queryStringBehavior:
              cloudfront.OriginRequestQueryStringBehavior.all(),
            cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
            headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
              "Origin",
              "Accept"
            ),
          }
        ),
      },
      additionalBehaviors: {
        "api/*": {
          origin: new cloudfrontOrigins.LoadBalancerV2Origin(props.alb, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
      },
    });

    // Route 53へのエイリアスレコードの追加
    const zone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    });
    new route53.ARecord(this, "CloudFrontAliasRecord", {
      zone: zone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
    });

    // S3デプロイ
    new s3deploy.BucketDeployment(this, "DeploySite", {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, "../../apps/frontend/out")),
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    this.url = `https://${props.domainName}`;

    new cdk.CfnOutput(this, "PortfolioURL", {
      value: this.url,
      description: "ポートフォリオURL",
    });

    new cdk.CfnOutput(this, "ApiHealthCheck", {
      value: `${this.url}/api/health`,
    });
  }
}
