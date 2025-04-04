// test/getProductsList.test.ts
import { handler } from '../lib/lambda/getProductsList';

test('should return all products', async () => {
  process.env.PRODUCTS = JSON.stringify([
    { id: '1', name: 'Product 1', price: 100 },
    { id: '2', name: 'Product 2', price: 200 },
  ]);

  const response = await handler({});
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body)).toHaveLength(2);
});