import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDbClient = new DynamoDBClient({ region: "eu-central-1" });
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

const PRODUCTS_TABLE_NAME = "Products";
const STOCK_TABLE_NAME = "Stock";

const seedTables = async () => {
  const products = [
    {
      id: uuidv4(),
      title: "Laptop",
      description: "A laptop",
      price: 1000,
    },
    { id: uuidv4(), title: "Phone", description: "A smartphone", price: 500 },
    {
      id: uuidv4(),
      title: "Tablet",
      description: "A tablet",
      price: 300,
    },
  ];

  const stock = [
    { product_id: products[0].id, count: 100 },
    { product_id: products[1].id, count: 200 },
    { product_id: products[2].id, count: 50 },
  ];

  try {
    for (const Item of products) {
      await docClient.send(
        new PutCommand({
          TableName: PRODUCTS_TABLE_NAME,
          Item,
        })
      );
      console.log(`Inserted into Products: ${JSON.stringify(Item)}`);
    }

    for (const Item of stock) {
      await docClient.send(
        new PutCommand({
          TableName: STOCK_TABLE_NAME,
          Item,
        })
      );
      console.log(`Inserted into Stock: ${JSON.stringify(Item)}`);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding tables:", error);
  }
};

seedTables();
