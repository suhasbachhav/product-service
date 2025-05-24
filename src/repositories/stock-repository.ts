import { BaseRepository } from "./base-repository";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export interface Stock {
  product_id: string;
  count: number;
}

export class StockRepository extends BaseRepository {
  constructor() {
    super("Stock");
  }

  async create(item: Stock): Promise<Stock> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });

    await this.docClient.send(command);

    return item;
  }

  async get(product_id: string): Promise<Stock | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { product_id },
    });

    const response = await this.docClient.send(command);
    return response.Item as Stock | null;
  }

  async list(): Promise<Stock[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const response = await this.docClient.send(command);
    return response.Items as Stock[];
  }
}
