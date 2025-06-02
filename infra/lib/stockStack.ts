import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from 'aws-cdk-lib';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url); // Get the current file's path
const __dirname = dirname(__filename); 

const TableName = 'stock_v1';

export class StockStack extends Stack {
  readonly stockTableArn: string;
  readonly stockTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stockTable = new dynamodb.Table(this, "stock_v1", {
      tableName: TableName,
      partitionKey: {
        name: "product_id",
        type: dynamodb.AttributeType.STRING,
      }
    });

    this.stockTableArn = stockTable.tableArn; // Export Table ARN for external use
    this.stockTable = stockTable; // Export Table instance for granting permissions

    const addStockLambda = new lambda.Function(this, 'AddStockLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'handler.addStock',
      code: lambda.Code.fromAsset(join(__dirname, './')), 
      environment: {
        TABLE_NAME: TableName,
      },
    });

    stockTable.grantWriteData(addStockLambda); // Grant write permissions for `addStock` Lambda
  }
}