import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class AssitechEcrStack extends cdk.Stack {
  public readonly backendRepository: ecr.Repository;
  public readonly frontendRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Backend repository
    this.backendRepository = new ecr.Repository(this, 'BackendRepository', {
      repositoryName: 'assitech-backend',
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          description: 'Keep last 10 images',
          maxImageCount: 10,
        },
      ],
    });

    // Frontend repository
    this.frontendRepository = new ecr.Repository(this, 'FrontendRepository', {
      repositoryName: 'assitech-frontend',
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          description: 'Keep last 10 images',
          maxImageCount: 10,
        },
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, 'BackendRepositoryUri', {
      value: this.backendRepository.repositoryUri,
      description: 'Backend ECR Repository URI',
      exportName: 'AssiTechBackendRepoUri',
    });

    new cdk.CfnOutput(this, 'FrontendRepositoryUri', {
      value: this.frontendRepository.repositoryUri,
      description: 'Frontend ECR Repository URI',
      exportName: 'AssiTechFrontendRepoUri',
    });
  }
}
