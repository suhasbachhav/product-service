import {
    DynamoDBClient,
    TransactWriteItemsCommand,
  } from "@aws-sdk/client-dynamodb";
  import { v4 as uuidv4 } from "uuid";
  
 
  const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
  const productsTableName = process.env.PRODUCTS_TABLE_NAME;
  const stockTableName = process.env.STOCK_TABLE_NAME;

  const headers = {
    "Access-Control-Allow-Origin": "https://d12ge7e5mdcb2a.cloudfront.net",
    "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  };

  export const handler = async (event: any) => {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }
    try {
      const body = JSON.parse(event.body);
      const { title, description, price, count } = body;
      const productId = uuidv4();
  
      if (!title || !price || !count) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: "Invalid input" }) };
      }
      console.log('here1')
      // Transactional Write
      const command = new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: productsTableName,
              Item: {
                id: { S: productId },
                title: { S: title },
                description: { S: description },
                price: { N: price.toString() },
              },
            },
          },
          {
            Put: {
              TableName: stockTableName,
              Item: {
                product_id: { S: productId },
                count: { N: count.toString() },
              },
            },
          },
        ],
      });
  
      await dynamoDB.send(command);
      console.log({
        statusCode: 201,
        headers,
        body: JSON.stringify({ message: "Product created successfully", productId }),
      })
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ message: "Product created successfully", productId }),
      };
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error:", err.message);
      } else {
        console.error("Error:", err);
      }
      return { statusCode: 500, headers, body: JSON.stringify({ message: "Internal Server Error" }) };
    }
  };