import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class AssitechNetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly appSecurityGroup: ec2.SecurityGroup;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with public subnets only (no NAT Gateway for free tier)
    this.vpc = new ec2.Vpc(this, 'AssiTechVpc', {
      maxAzs: 2,
      natGateways: 0, // No NAT Gateway - saves ~$32/month
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Security Group for Application (EC2)
    this.appSecurityGroup = new ec2.SecurityGroup(this, 'AppSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for AssiTech application EC2 instance',
      allowAllOutbound: true,
    });

    // Allow HTTP traffic
    this.appSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );

    // Allow HTTPS traffic
    this.appSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic'
    );

    // Allow SSH from anywhere (you should restrict this to your IP in production)
    this.appSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access (restrict to your IP in production)'
    );

    // Allow Backend API port
    this.appSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'Allow Backend API traffic'
    );

    // Security Group for Database
    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for AssiTech RDS PostgreSQL database',
      allowAllOutbound: false,
    });

    // Allow PostgreSQL traffic from application security group
    this.databaseSecurityGroup.addIngressRule(
      this.appSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL traffic from application'
    );

    // Outputs
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: 'AssiTechVpcId',
    });

    new cdk.CfnOutput(this, 'AppSecurityGroupId', {
      value: this.appSecurityGroup.securityGroupId,
      description: 'Application Security Group ID',
      exportName: 'AssiTechAppSecurityGroupId',
    });

    new cdk.CfnOutput(this, 'DatabaseSecurityGroupId', {
      value: this.databaseSecurityGroup.securityGroupId,
      description: 'Database Security Group ID',
      exportName: 'AssiTechDatabaseSecurityGroupId',
    });
  }
}
