import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createLambda } from "./utils/create-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "ImportBucket", {
      versioned: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    const api = new apigateway.RestApi(this, "ImportServiceApi", {
      restApiName: "Import Service API",
      description: "This API serves the Import Service.",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET"],
      },
    });

    // Import Products File
    const importProductsFileLambda = createLambda(this, "importProductsFile", {
      BUCKET_NAME: bucket.bucketName,
    });

    bucket.grantReadWrite(importProductsFileLambda);

    const importProductsFileLambdaIntegration =
      new apigateway.LambdaIntegration(importProductsFileLambda, {
        proxy: false,
        requestTemplates: {
          "application/json": `{"fileName": "$input.params('fileName')"}`,
        },
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": `$input.json('$')`,
            },
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
        ],
      });

    api.root
      .addResource("import")
      .addMethod("GET", importProductsFileLambdaIntegration, {
        requestParameters: {
          "method.request.querystring.fileName": true,
        },
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      });

    // Import File Parser
    const importFileParserLambda = createLambda(this, "importFileParser", {
      BUCKET_NAME: bucket.bucketName,
    });

    bucket.grantReadWrite(importFileParserLambda);

    // Configure S3 event notification for the uploaded folder
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: "uploaded/" }
    );
  }
}
