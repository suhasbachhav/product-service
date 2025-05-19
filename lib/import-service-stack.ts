import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = new s3.Bucket(this, 'ImportBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        }
      ]
    });

    const importProductsFileLambda = new NodejsFunction(this, 'ImportProductsFileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'importFile.handler',
      environment: {
        BUCKET_NAME: importBucket.bucketName,
      },
    });

    importBucket.grantPut(importProductsFileLambda);

    const api = new apigateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Service',
    });
    
    const importResource = api.root.addResource('import', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'PUT', 'OPTIONS'],
        allowHeaders: ['*'],
      },
    });
    
    importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFileLambda), {
      requestParameters: {
        'method.request.querystring.name': true,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
          },
        },
      ],
    });

    const importFileParserLambda = new NodejsFunction(this, 'ImportFileParserLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'importFileParser.handler',
    });
    
    importBucket.grantRead(importFileParserLambda);
    
    importFileParserLambda.addEventSource(new S3EventSource(importBucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: 'uploaded/' }],
    }));
    

    new cdk.CfnOutput(this, 'ImportBucketName', {
      value: importBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'ImportAPI', {
      value: api.url,
    });

    
    new cdk.CfnOutput(this, 'DistributionId', {
        value: 'E3IDOV53MUMDP3',
    });
  
    new cdk.CfnOutput(this, 'CloudFrontURL', {
    value: 'd12ge7e5mdcb2a.cloudfront.net',
    });
  
    
  }
}