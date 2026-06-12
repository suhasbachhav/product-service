import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';


export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'ImportServiceBucketBySuhasEpam', {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const productsTable = dynamodb.Table.fromTableName(this, 'ExistingProductsTable', 'products');


    console.log('Bucket Name:', bucket.bucketName);

    const importProductsFileLambda = new lambda.Function(this, 'importProductsFile', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'importProductsFile.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
        PRODUCTS_TABLE: productsTable.tableName,
      },
    });

    bucket.grantRead(importProductsFileLambda);
    productsTable.grantWriteData(importProductsFileLambda);

    bucket.grantPut(importProductsFileLambda);

    const api = new apiGateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Service API',
    });

    const importResource = api.root.addResource('import');
    importResource.addMethod('POST', new apiGateway.LambdaIntegration(importProductsFileLambda));

  }
}