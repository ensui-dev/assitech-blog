import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface CodeBuildStackProps extends cdk.StackProps {
  backendRepository: ecr.Repository;
  frontendRepository: ecr.Repository;
}

export class AssitechCodeBuildStack extends cdk.Stack {
  public readonly buildProject: codebuild.Project;

  constructor(scope: Construct, id: string, props: CodeBuildStackProps) {
    super(scope, id, props);

    const githubRepo = process.env.GITHUB_REPO || 'your-username/your-repo';
    const githubBranch = process.env.GITHUB_BRANCH || 'main';
    const githubToken = process.env.GITHUB_TOKEN;

    // CodeBuild project with GitHub webhook for automatic builds
    this.buildProject = new codebuild.Project(this, 'BuildProject', {
      projectName: 'assitech-blog-build',
      description: 'Builds and pushes AssiTech Docker images to ECR',

      // Source from GitHub with webhook for auto-builds on push
      source: codebuild.Source.gitHub({
        owner: githubRepo.split('/')[0],
        repo: githubRepo.split('/')[1],
        webhook: true,
        webhookFilters: [
          codebuild.FilterGroup.inEventOf(
            codebuild.EventAction.PUSH,
          ).andBranchIs(githubBranch),
        ],
      }),

      // Build environment
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true, // Required for Docker builds
        computeType: codebuild.ComputeType.SMALL,
        environmentVariables: {
          AWS_ACCOUNT_ID: {
            value: this.account,
          },
          AWS_REGION: {
            value: this.region,
          },
          BACKEND_REPO_URI: {
            value: props.backendRepository.repositoryUri,
          },
          FRONTEND_REPO_URI: {
            value: props.frontendRepository.repositoryUri,
          },
        },
      },

      // Build specification from buildspec.yml file
      buildSpec: codebuild.BuildSpec.fromSourceFilename('infra/buildspec.yml'),

      // Timeout
      timeout: cdk.Duration.minutes(30),

      // Cache
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.DOCKER_LAYER),
    });

    // Grant ECR permissions
    props.backendRepository.grantPullPush(this.buildProject);
    props.frontendRepository.grantPullPush(this.buildProject);

    // Grant additional permissions for ECR login
    this.buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImage',
        ],
        resources: ['*'],
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'BuildProjectName', {
      value: this.buildProject.projectName,
      description: 'CodeBuild Project Name',
      exportName: 'AssiTechBuildProjectName',
    });

    new cdk.CfnOutput(this, 'BuildProjectArn', {
      value: this.buildProject.projectArn,
      description: 'CodeBuild Project ARN',
      exportName: 'AssiTechBuildProjectArn',
    });

    new cdk.CfnOutput(this, 'ManualBuildCommand', {
      value: `aws codebuild start-build --project-name ${this.buildProject.projectName}`,
      description: 'Command to manually trigger a build',
    });
  }
}
