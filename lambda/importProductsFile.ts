import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Readable } from "stream";
import * as csvParser from "csv-parser";

const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });

exports.handler = async (event: any) => {
  try {
    const productsTable = process.env.PRODUCTS_TABLE;

    if (!productsTable) {
      throw new Error("PRODUCTS_TABLE environment variable is not set");
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "CSV file content is required in the request body" }),
      };
    }

    // Parse the CSV content from the request body
    const csvContent = event.body;
    const stream = Readable.from(csvContent);

    const records: any[] = [];

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on("data", (data) => records.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("Parsed records:", records);

    // Store each record in DynamoDB
    for (const record of records) {
      const dynamoCommand = new PutItemCommand({
        TableName: productsTable,
        Item: {
          id: { S: record.id },
          title: { S: record.title },
          description: { S: record.description },
          price: { N: record.price },
        },
      });

      await dynamoDBClient.send(dynamoCommand);
      console.log(`Stored record in DynamoDB: ${JSON.stringify(record)}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "CSV data stored successfully in DynamoDB" }),
    };
  } catch (error) {
    console.error("Error processing file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
