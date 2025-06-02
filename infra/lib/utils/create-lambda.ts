import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { fileURLToPath } from "url";

export const createLambda = (
  scope: Construct,
  name: string,
  environment: Record<string, string>
): lambda.Function => {
  return new lambda.Function(scope, name, {
    runtime: lambda.Runtime.NODEJS_20_X,
    memorySize: 1024,
    timeout: cdk.Duration.seconds(5),
    handler: `${name}/index.default`,
    code: lambda.Code.fromAsset(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../../resources")
    ),
    environment,
  });
};
