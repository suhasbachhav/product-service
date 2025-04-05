
import { Handler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTable = process.env.PRODUCTS_TABLE as string;
const stockTable = process.env.STOCK_TABLE as string;

export const handler: Handler = async () => {
  try {
    const productsCommand = new ScanCommand({ TableName: productsTable });
    const productsData = await dynamoDB.send(productsCommand);

    const products = (productsData.Items || []).map((item) => ({
      id: item.id.S,
      title: item.title.S,
      description: item.description?.S,
      price: item.price?.N ? parseFloat(item.price.N) : 0,
    }));

    const stockCommand = new ScanCommand({ TableName: stockTable });
    const stockData = await dynamoDB.send(stockCommand);

    const stock = (stockData.Items || []).map((item) => ({
      product_id: item.product_id.S,
      count: item.count?.N ? parseInt(item.count.N, 10) : 0,
    }));

    const joinedData = products.map((product) => {
      const stockItem = stock.find((s) => s.product_id === product.id);
      return {
        ...product,
        count: stockItem?.count || 0,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(joinedData),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};