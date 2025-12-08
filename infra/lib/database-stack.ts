import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  databaseSecurityGroup: ec2.SecurityGroup;
}

export class AssitechDatabaseStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;
  public readonly dbSecretArn: string;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const dbUsername = process.env.DB_USERNAME || 'bloguser';
    const dbName = process.env.DB_NAME || 'blogdb';

    // Create database credentials secret
    const dbSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: 'assitech/database/credentials',
      description: 'AssiTech RDS database credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: dbUsername }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
      },
    });

    this.dbSecretArn = dbSecret.secretArn;

    // Create RDS PostgreSQL instance in public subnet (free tier - no NAT Gateway cost)
    this.database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_1,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC, // Public subnet to avoid NAT Gateway cost
      },
      securityGroups: [props.databaseSecurityGroup],
      databaseName: dbName,
      credentials: rds.Credentials.fromSecret(dbSecret),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageType: rds.StorageType.GP3,
      deletionProtection: false, // Disabled for easier cleanup
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      backupRetention: cdk.Duration.days(1), // Reduced for free tier compatibility
      preferredBackupWindow: '03:00-04:00',
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00',
      enablePerformanceInsights: false, // Disabled to stay in free tier
      cloudwatchLogsExports: ['postgresql'],
      autoMinorVersionUpgrade: true,
      publiclyAccessible: false, // Still not publicly accessible due to security group
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.dbInstanceEndpointAddress,
      description: 'RDS Database Endpoint',
      exportName: 'AssiTechDatabaseEndpoint',
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.database.dbInstanceEndpointPort,
      description: 'RDS Database Port',
      exportName: 'AssiTechDatabasePort',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: dbSecret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: 'AssiTechDatabaseSecretArn',
    });
  }
}
