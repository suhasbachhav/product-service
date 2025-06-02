process.env.PRODUCTS_TABLE_NAME = 'products_v1'; 
process.env.STOCK_TABLE_NAME = 'stocks_v1';

import { handler } from '../lambda/createProduct';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

const ddbMock = mockClient(DynamoDBClient);

describe('createProduct', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.PRODUCTS_TABLE = 'products_v1'; 
    process.env.STOCKS_TABLE = 'stocks_v1';
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await handler({ body: JSON.stringify({}) });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid input' });
  });

  it('should return 201 if product is created successfully', async () => {
    ddbMock.on(TransactWriteItemsCommand).resolves({});

    const response = await handler({
      body: JSON.stringify({
        title: 'Test Product',
        description: 'Test Description',
        price: 199,
        count: 10,
      }),
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({ message: 'Product created' });
  });

  it('should return 500 if DynamoDB transaction fails', async () => {
    ddbMock.on(TransactWriteItemsCommand).rejects(new Error('Transaction failed'));

    const response = await handler({
      body: JSON.stringify({
        title: 'Test Product',
        description: 'Test Description',
        price: 199,
        count: 10,
      }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' });
  });

  it('should handle missing description gracefully', async () => {
    ddbMock.on(TransactWriteItemsCommand).resolves({});

    const response = await handler({
      body: JSON.stringify({
        title: 'Product No Desc',
        price: 100,
        count: 3,
      }),
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({ message: 'Product created' });
  });
});
