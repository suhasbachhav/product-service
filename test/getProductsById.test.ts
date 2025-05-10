process.env.PRODUCTS_TABLE_NAME = 'products_v1'; 
process.env.STOCK_TABLE_NAME = 'stocks_v1';

import { handler } from '../lambda/getProductsById';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';


const ddbMock = mockClient(DynamoDBClient);

describe('getProductsById', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should return 400 if productId is missing', async () => {
    const response = await handler({ pathParameters: {} });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Product ID is required' });
  });

  it('should return 404 if product not found', async () => {
    ddbMock.on(GetItemCommand).resolves({});

    const response = await handler({ pathParameters: { productId: '123' } });
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ message: 'Product not found' });
  });

  it('should return 200 with product data if found', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: {
        id: { S: '123' },
        title: { S: 'Test Product' },
        description: { S: 'A test product' },
        price: { N: '100' },
      },
    });

    const response = await handler({ pathParameters: { productId: '123' } });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      id: '123',
      title: 'Test Product',
      description: 'A test product',
      price: 100,
    });
  });

  it('should handle unexpected errors', async () => {
    ddbMock.on(GetItemCommand).rejects(new Error('DynamoDB error'));

    const response = await handler({ pathParameters: { productId: '123' } });
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' });
  });
});
