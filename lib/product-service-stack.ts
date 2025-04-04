import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class ProductServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Lambda: getProductsList
        const getProductsListLambda = new lambda.Function(this, 'getProductsList', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lib/lambdas'),
            handler: 'getProductsList.handler',
        });

        // Lambda: getProductsById
        const getProductsByIdLambda = new lambda.Function(this, 'getProductsById', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lib/lambdas'),
            handler: 'getProductsById.handler',
        });

        // API Gateway
        const api = new apigateway.RestApi(this, 'ProductServiceAPI', {
            restApiName: 'Product Service API',
        });

        // /products
        const products = api.root.addResource('products');
        products.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));

        // /products/{productId}
        const productById = products.addResource('{productId}');
        productById.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));
    }
}