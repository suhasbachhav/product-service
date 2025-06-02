process.env.PRODUCTS_TABLE_NAME = 'products_v1'; 
process.env.STOCK_TABLE_NAME = 'stocks_v1';

import { handler } from '../lambda/getProductsList';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const ddbMock = mockClient(DynamoDBClient);


describe('getProductsList', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should return 200 with merged product and stock data', async () => {
    ddbMock.on(ScanCommand).resolvesOnce({
      Items: [
        {
          id: { S: '1' },
          title: { S: 'Product 1' },
          description: { S: 'Desc 1' },
          price: { N: '50' },
        },
      ],
    }).resolvesOnce({
      Items: [
        {
          product_id: { S: '1' },
          count: { N: '5' },
        },
      ],
    });

    const response = await handler();
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([
      {
        id: '1',
        title: 'Product 1',
        description: 'Desc 1',
        price: 50,
        count: 5,
      },
    ]);
  });

  it('should return 500 on error', async () => {
    ddbMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

    const response = await handler();
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' });
  });
});
