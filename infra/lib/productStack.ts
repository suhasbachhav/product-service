import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from 'aws-cdk-lib';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const TableName = 'products_v1';

const __filename = fileURLToPath(import.meta.url); // Get the current file's path
const __dirname = dirname(__filename); 

export class ProductStack extends Stack {
  readonly productsTableArn: string;
  readonly productsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, "products_v1", {
      tableName: TableName,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      }
    });

    this.productsTableArn = productsTable.tableArn; // Export Table ARN for external use
    this.productsTable = productsTable; // Export Table instance for granting permissions

    const addProductsLambda = new lambda.Function(this, 'AddProductsLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'handler.addProducts',
      code: lambda.Code.fromAsset(join(__dirname, './')), 
      environment: {
        TABLE_NAME: TableName,
      },
    });

    productsTable.grantWriteData(addProductsLambda); 
  }
}
