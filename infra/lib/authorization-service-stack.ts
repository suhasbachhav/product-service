import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createLambda } from "./utils/create-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class AuthorizationServiceStack extends cdk.Stack {
  private basicAuthorizerLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    if (!process.env.GITHUB_USER) {
      throw new Error("GITHUB_USER is not set");
    }

    this.basicAuthorizerLambda = createLambda(this, "basicAuthorizer", {
      [process.env.GITHUB_USER]: "test password",
    });

    new cdk.CfnOutput(this, "BasicAuthorizerLambdaArn", {
      value: this.basicAuthorizerLambda.functionArn,
      exportName: "BasicAuthorizerLambdaArn",
    });
  }
}