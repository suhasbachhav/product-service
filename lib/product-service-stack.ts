import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

interface ProductServiceStackProps extends cdk.StackProps {
  productsTable: dynamodb.Table; // Add productsTable as a property
  stockTable: dynamodb.Table;    // Add stockTable as a property
}

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ProductServiceStackProps) {
    super(scope, id, props);

    // Lambda for getProductsList
    const getProductsListLambda = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: props.productsTable.tableName,
        STOCK_TABLE_NAME: props.stockTable.tableName,
        UI_URL:  'https://d12ge7e5mdcb2a.cloudfront.net',
      },
    });

    props.productsTable.grantReadData(getProductsListLambda);
    props.stockTable.grantReadData(getProductsListLambda);

    // Create API Gateway and integrate with Lambda
    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service',
    });

    // Lambda for getProductsById
    const getProductsByIdLambda = new lambda.Function(this, "GetProductsByIdLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "getProductsById.handler",
      environment: {
        PRODUCTS_TABLE_NAME: props.productsTable.tableName,
        STOCK_TABLE_NAME: props.stockTable.tableName,
        UI_URL:  'https://d12ge7e5mdcb2a.cloudfront.net',
      },
    });

    props.productsTable.grantReadData(getProductsByIdLambda);
    props.stockTable.grantReadData(getProductsByIdLambda);

    const createProductLambda = new lambda.Function(this, "CreateProductLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "createProduct.handler",
      environment: {
        PRODUCTS_TABLE_NAME: props.productsTable.tableName,
        STOCK_TABLE_NAME: props.stockTable.tableName,
        UI_URL:  'https://d12ge7e5mdcb2a.cloudfront.net',
      },
    });
    
    props.productsTable.grantWriteData(createProductLambda);
    props.stockTable.grantWriteData(createProductLambda);
    
    // /products endpoint
    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));

    // /products/{productId} endpoint
    const productByIdResource = productsResource.addResource('{productId}');
    productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));


    // Add POST route to API Gateway
    productsResource.addMethod("POST", new apigateway.LambdaIntegration(createProductLambda));
  }
}