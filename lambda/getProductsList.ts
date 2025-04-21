import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME;
const stockTableName = process.env.STOCK_TABLE_NAME;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET",
};

export const handler = async () => {
  try {

    // Validate environment variables
    if (!productsTableName || !stockTableName) {
      throw new Error("Missing table names in environment variables");
    }

    // Fetch products from DynamoDB
    const productsResult = await dynamoDB.send(new ScanCommand({ TableName: productsTableName }));
    const stockResult = await dynamoDB.send(new ScanCommand({ TableName: stockTableName }));

    const products = productsResult.Items || [];
    const stock = stockResult.Items || [];


    // Join products and stock tables
    const detailedProducts = products.map((product) => {
      const stockItem = stock.find((stock) => stock.product_id.S === product.id.S);
      return {
        id: product.id.S,
        title: product.title.S,
        description: product.description ? product.description.S : null,
        price: product.price.N ? parseInt(product.price.N) : 0,
        count: stockItem && stockItem.count.N ? parseInt(stockItem.count.N) : 0,
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(detailedProducts),
    };
  } catch (error) {
    console.error("Error fetching products list:", (error as Error).message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};