import { Handler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTable = process.env.PRODUCTS_TABLE as string;
const stockTable = process.env.STOCK_TABLE as string;

export const handler: Handler = async (event: any) => {
  try {
    console.log('Event:', event);
    const body = JSON.parse(event.body);
    console.log('event.body:', event.body);

    const productId = new Date().toISOString().replace(/[-:TZ]/g, '.') + Math.random().toString().substring(2,7);
    const newProduct = {
      id: { S: productId },
      title: { S: body.title },
      description: { S: body.description },
      price: { N: body.price.toString() },
    };

    const stock = {
      product_id: { S: productId },
      count: { N: (body.count || 0).toString() },
    };

    // Add product to the PRODUCTS_TABLE
    const productCommand = new PutItemCommand({
      TableName: productsTable,
      Item: newProduct,
    });
    await dynamoDB.send(productCommand);

    // Add stock to the STOCK_TABLE
    const stockCommand = new PutItemCommand({
      TableName: stockTable,
      Item: stock,
    });
    await dynamoDB.send(stockCommand);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Product successfully created.' }),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
