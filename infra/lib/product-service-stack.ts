import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { createLambda } from "./utils/create-lambda";

interface ProductServiceStackProps extends cdk.StackProps {
  productsTable: dynamodb.Table; // Add productsTable as a property
  stockTable: dynamodb.Table;    // Add stockTable as a property
}

export class ProductServiceStack extends cdk.Stack {
  // private productTable: dynamodb.Table;
  // private stockTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ProductServiceStackProps) {
    super(scope, id, props);
/* 
    // Create tables
     props.productsTable = new dynamodb.Table(this, "Products", {
      tableName: "Products",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    props.stockTable = new dynamodb.Table(this, "Stock", {
      tableName: "Stock",
      partitionKey: { name: "product_id", type: dynamodb.AttributeType.STRING },
    });
 */
    const api = new apigateway.RestApi(this, "ProductServiceApi", {
      restApiName: "Product Service API",
      description: "This API serves the Product Service.",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET"],
      },
    });

    // Create lambdas
    const getProductsLambda = createLambda(this, "getProducts", {
      PRODUCTS_TABLE_NAME: props.productsTable.tableName,
      STOCK_TABLE_NAME: props.stockTable.tableName,
    });
     props.productsTable.grantReadData(getProductsLambda);
    props.stockTable.grantReadData(getProductsLambda);

    const getProductByIdLambda = createLambda(this, "getProductById", {
      PRODUCTS_TABLE_NAME:  props.productsTable.tableName,
      STOCK_TABLE_NAME: props.stockTable.tableName,
    });
     props.productsTable.grantReadData(getProductByIdLambda);
    props.stockTable.grantReadData(getProductByIdLambda);

    const createProductLambda = createLambda(this, "createProduct", {
      PRODUCTS_TABLE_NAME:  props.productsTable.tableName,
      STOCK_TABLE_NAME: props.stockTable.tableName,
    });
     props.productsTable.grantWriteData(createProductLambda);
    props.stockTable.grantWriteData(createProductLambda);

    // Create integrations
    const getProductsLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsLambda,
      {
        proxy: false,
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
      }
    );

    const getProductByIdLambdaIntegration = new apigateway.LambdaIntegration(
      getProductByIdLambda,
      {
        proxy: false,
        requestTemplates: {
          "application/json": `{"productId": "$input.params('productId')"}`,
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
          {
            statusCode: "404",
            selectionPattern: ".*[Not Found].*",
            responseTemplates: {
              "application/json": `{"message": "Resource not found"}`,
            },
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
        ],
      }
    );

    const createProductLambdaIntegration = new apigateway.LambdaIntegration(
      createProductLambda,
      {
        proxy: false,
        requestTemplates: {
          "application/json": `{
            "title": "$input.path('$.title')",
            "description": "$input.path('$.description')",
            "price": "$input.path('$.price')"
          }`,
        },
        integrationResponses: [
          {
            statusCode: "201",
            responseTemplates: {
              "application/json": `$input.json('$')`,
            },
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
          {
            statusCode: "400",
            selectionPattern: ".*[Bad Request].*",
            responseTemplates: {
              "application/json": `{"message": "Invalid request body"}`,
            },
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": "'*'",
            },
          },
        ],
      }
    );

    // Create resources
    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", getProductsLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    });

    productsResource.addMethod("POST", createProductLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "201",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
        {
          statusCode: "400",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    });

    const productByIdResource = productsResource.addResource("{productId}");
    productByIdResource.addMethod("GET", getProductByIdLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
        {
          statusCode: "404",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    });
  }
}
