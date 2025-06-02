import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export abstract class BaseRepository {
  protected readonly client: DynamoDBClient;
  protected readonly docClient: DynamoDBDocumentClient;
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.client = new DynamoDBClient({ region: process.env.AWS_REGION });
    this.docClient = DynamoDBDocumentClient.from(this.client);
    this.tableName = tableName;
  }
}
