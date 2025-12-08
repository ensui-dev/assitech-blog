import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  appSecurityGroup: ec2.SecurityGroup;
  backendRepository: ecr.Repository;
  frontendRepository: ecr.Repository;
  database: rds.DatabaseInstance;
  dbSecretArn: string;
}

export class AssitechComputeStack extends cdk.Stack {
  public readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const keyPairName = process.env.EC2_KEY_PAIR_NAME;
    const instanceType = process.env.EC2_INSTANCE_TYPE || 't3.medium';

    // Create application secrets
    const appSecret = new secretsmanager.Secret(this, 'ApplicationSecret', {
      secretName: 'assitech/application/env',
      description: 'AssiTech application environment variables',
      secretObjectValue: {
        HUGGINGFACE_API_KEY: cdk.SecretValue.unsafePlainText(process.env.HUGGINGFACE_API_KEY || ''),
        HUGGINGFACE_MODEL: cdk.SecretValue.unsafePlainText(process.env.HUGGINGFACE_MODEL || 'microsoft/Phi-3-mini-4k-instruct'),
        UNSPLASH_ACCESS_KEY: cdk.SecretValue.unsafePlainText(process.env.UNSPLASH_ACCESS_KEY || ''),
        JWT_SECRET: cdk.SecretValue.unsafePlainText(process.env.JWT_SECRET || ''),
        ADMIN_EMAIL: cdk.SecretValue.unsafePlainText(process.env.ADMIN_EMAIL || 'admin@assitech.com'),
        ADMIN_PASSWORD: cdk.SecretValue.unsafePlainText(process.env.ADMIN_PASSWORD || ''),
        ARTICLE_GENERATION_CRON: cdk.SecretValue.unsafePlainText(process.env.ARTICLE_GENERATION_CRON || '0 2 * * *'),
      },
    });

    // IAM Role for EC2
    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
      ],
    });

    // Grant ECR pull permissions
    props.backendRepository.grantPull(role);
    props.frontendRepository.grantPull(role);

    // Grant access to secrets
    const dbSecret = secretsmanager.Secret.fromSecretCompleteArn(this, 'DbSecret', props.dbSecretArn);
    dbSecret.grantRead(role);
    appSecret.grantRead(role);

    // Get latest Amazon Linux 2023 AMI
    const ami = ec2.MachineImage.latestAmazonLinux2023({
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // Reference existing key pair using the new API
    const keyPair = keyPairName
      ? ec2.KeyPair.fromKeyPairName(this, 'KeyPair', keyPairName)
      : undefined;

    // Create EC2 instance
    this.instance = new ec2.Instance(this, 'AppInstance', {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: new ec2.InstanceType(instanceType),
      machineImage: ami,
      securityGroup: props.appSecurityGroup,
      role: role,
      keyPair: keyPair,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(30, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
      requireImdsv2: true,
    });

    // Load user data script
    const userDataScript = readFileSync(join(__dirname, '../scripts/user-data.sh'), 'utf8');

    // Replace placeholders in user data
    const processedUserData = userDataScript
      .replace('{{AWS_REGION}}', this.region)
      .replace('{{AWS_ACCOUNT_ID}}', this.account)
      .replace('{{BACKEND_REPO}}', props.backendRepository.repositoryUri)
      .replace('{{FRONTEND_REPO}}', props.frontendRepository.repositoryUri)
      .replace('{{DB_HOST}}', props.database.dbInstanceEndpointAddress)
      .replace('{{DB_PORT}}', props.database.dbInstanceEndpointPort)
      .replace('{{DB_SECRET_ARN}}', props.dbSecretArn)
      .replace('{{APP_SECRET_ARN}}', appSecret.secretArn)
      .replace('{{DB_NAME}}', process.env.DB_NAME || 'blogdb');

    this.instance.addUserData(processedUserData);

    // Outputs
    new cdk.CfnOutput(this, 'InstanceId', {
      value: this.instance.instanceId,
      description: 'EC2 Instance ID',
      exportName: 'AssiTechInstanceId',
    });

    new cdk.CfnOutput(this, 'InstancePublicIp', {
      value: this.instance.instancePublicIp,
      description: 'EC2 Instance Public IP',
      exportName: 'AssiTechInstancePublicIp',
    });

    new cdk.CfnOutput(this, 'ApplicationUrl', {
      value: `http://${this.instance.instancePublicDnsName}`,
      description: 'Application URL',
      exportName: 'AssiTechApplicationUrl',
    });

    new cdk.CfnOutput(this, 'AdminUrl', {
      value: `http://${this.instance.instancePublicDnsName}/login`,
      description: 'Admin Login URL',
      exportName: 'AssiTechAdminUrl',
    });
  }
}
