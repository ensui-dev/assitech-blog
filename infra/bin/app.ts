#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AssitechNetworkStack } from '../lib/network-stack';
import { AssitechEcrStack } from '../lib/ecr-stack';
import { AssitechCodeBuildStack } from '../lib/codebuild-stack';
import { AssitechDatabaseStack } from '../lib/database-stack';
import { AssitechComputeStack } from '../lib/compute-stack';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = new cdk.App();

const env = {
  account: process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const appName = process.env.APP_NAME || 'assitech';
const environment = process.env.ENVIRONMENT || 'prod';

// Network Stack - VPC, Subnets, Security Groups
const networkStack = new AssitechNetworkStack(app, `${appName}-network-${environment}`, {
  env,
  description: 'Network infrastructure for AssiTech blog application',
});

// ECR Stack - Container Registries
const ecrStack = new AssitechEcrStack(app, `${appName}-ecr-${environment}`, {
  env,
  description: 'ECR repositories for AssiTech Docker images',
});

// CodeBuild Stack - CI/CD Pipeline
const codeBuildStack = new AssitechCodeBuildStack(app, `${appName}-codebuild-${environment}`, {
  env,
  backendRepository: ecrStack.backendRepository,
  frontendRepository: ecrStack.frontendRepository,
  description: 'CodeBuild project for building and pushing Docker images',
});

// Database Stack - RDS PostgreSQL
const databaseStack = new AssitechDatabaseStack(app, `${appName}-database-${environment}`, {
  env,
  vpc: networkStack.vpc,
  databaseSecurityGroup: networkStack.databaseSecurityGroup,
  description: 'RDS PostgreSQL database for AssiTech',
});

// Compute Stack - EC2 instance running Docker containers
const computeStack = new AssitechComputeStack(app, `${appName}-compute-${environment}`, {
  env,
  vpc: networkStack.vpc,
  appSecurityGroup: networkStack.appSecurityGroup,
  backendRepository: ecrStack.backendRepository,
  frontendRepository: ecrStack.frontendRepository,
  database: databaseStack.database,
  dbSecretArn: databaseStack.dbSecretArn,
  description: 'EC2 compute resources for AssiTech',
});

// Add dependencies
// codeBuildStack depends on ecrStack automatically via repository props
databaseStack.addDependency(networkStack);
computeStack.addDependency(networkStack);
computeStack.addDependency(ecrStack);
computeStack.addDependency(databaseStack);

// Add tags to all stacks
const tags = {
  Application: appName,
  Environment: environment,
  ManagedBy: 'CDK',
};

Object.entries(tags).forEach(([key, value]) => {
  cdk.Tags.of(app).add(key, value);
});

app.synth();
