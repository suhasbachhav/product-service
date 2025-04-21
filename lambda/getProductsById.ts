import { GetItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productsTableName = process.env.PRODUCTS_TABLE_NAME;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET",
};

export const handler = async (event: any) => {
  try {
    const productId = event.pathParameters?.productId;

    // Validate productId
    if (!productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Product ID is required" }),
      };
    }

    // Query DynamoDB to fetch product by id
    const productCommand = new GetItemCommand({
      TableName: productsTableName,
      Key: {
        id: { S: productId }, // Use correct partition key name and type (`S` for String)
      },
    });

    const productResult = await dynamoDB.send(productCommand);
    const productItem = productResult.Item;

    // Check if product exists
    if (!productItem) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    // Format response
    const product = {
      id: productItem.id.S,
      title: productItem.title.S,
      description: productItem.description?.S || null,
      price: productItem.price?.N ? parseFloat(productItem.price.N) : null,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product by ID:", error.message);
    } else {
      console.error("Error fetching product by ID:", error);
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};