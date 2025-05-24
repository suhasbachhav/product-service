import { BaseRepository } from "./base-repository";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
}

export class ProductRepository extends BaseRepository {
  constructor() {
    super("Products");
  }

  async create(item: Omit<Product, "id">): Promise<Product> {
    const product: Product = {
      id: uuidv4(),
      ...item,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: product,
    });

    await this.docClient.send(command);

    return product;
  }

  async get(id: string): Promise<Product | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    const response = await this.docClient.send(command);
    return response.Item as Product | null;
  }

  async list(): Promise<Product[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const response = await this.docClient.send(command);
    return response.Items as Product[];
  }
}
