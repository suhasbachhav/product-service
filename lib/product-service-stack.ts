import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Mock data
    const products = [
      {
        id: '1',
        title: 'Smartphone',
        description: 'A high-end smartphone with a powerful processor and excellent camera.',
        price: 699,
        logoUrl: 'https://example.com/images/smartphone.jpg',
        count: 50,
      },
      {
        id: '2',
        title: 'Laptop',
        description: 'A lightweight laptop with a long battery life, perfect for work and travel.',
        price: 999,
        logoUrl: 'https://example.com/images/laptop.jpg',
        count: 30,
      },
      {
        id: '3',
        title: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones with superior sound quality.',
        price: 199,
        logoUrl: 'https://example.com/images/headphones.jpg',
        count: 100,
      },
      {
        id: '4',
        title: 'Smartwatch',
        description: 'A smartwatch with fitness tracking and notification features.',
        price: 249,
        logoUrl: 'https://example.com/images/smartwatch.jpg',
        count: 75,
      },
      {
        id: '5',
        title: 'Gaming Console',
        description: 'A next-generation gaming console with stunning graphics and performance.',
        price: 499,
        logoUrl: 'https://example.com/images/console.jpg',
        count: 20,
      },
      {
        id: '6',
        title: 'Tablet',
        description: 'A versatile tablet with a large display and powerful performance.',
        price: 399,
        logoUrl: 'https://example.com/images/tablet.jpg',
        count: 40,
      },
      {
        id: '7',
        title: 'Bluetooth Speaker',
        description: 'A portable Bluetooth speaker with excellent sound quality and battery life.',
        price: 149,
        logoUrl: 'https://example.com/images/speaker.jpg',
        count: 60,
      },
      {
        id: '8',
        title: '4K TV',
        description: 'A 55-inch 4K Ultra HD TV with vibrant colors and smart features.',
        price: 799,
        logoUrl: 'https://example.com/images/tv.jpg',
        count: 15,
      },
      {
        id: '9',
        title: 'Camera',
        description: 'A DSLR camera with high resolution and advanced features for photography enthusiasts.',
        price: 1200,
        logoUrl: 'https://example.com/images/camera.jpg',
        count: 25,
      },
      {
        id: '10',
        title: 'Drone',
        description: 'A compact drone with a 4K camera and advanced flight controls.',
        price: 899,
        logoUrl: 'https://example.com/images/drone.jpg',
        count: 10,
      },
    ];

    // Lambda for getProductsList
    const getProductsListLambda = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS: JSON.stringify(products),
      },
    });

    // Lambda for getProductsById
    const getProductsByIdLambda = new lambda.Function(this, 'GetProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCTS: JSON.stringify(products),
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service',
    });

    // /products endpoint
    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));

    // /products/{productId} endpoint
    const productByIdResource = productsResource.addResource('{productId}');
    productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));
  }
}