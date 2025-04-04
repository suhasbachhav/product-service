// test/getProductsById.test.ts
import { handler } from "../lib/lambda/getProductsById";

test('should return a product by ID', async () => {
  process.env.PRODUCTS = JSON.stringify([
    { id: '1', name: 'Product 1', price: 100 },
    { id: '2', name: 'Product 2', price: 200 },
  ]);

  const response = await handler({ pathParameters: { productId: '1' } });
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body).name).toBe('Product 1');
});

test('should return 404 if product not found', async () => {
  process.env.PRODUCTS = JSON.stringify([
    { id: '1', name: 'Product 1', price: 100 },
  ]);

  const response = await handler({ pathParameters: { productId: '2' } });
  expect(response.statusCode).toBe(404);
  expect(JSON.parse(response.body).message).toBe('Product not found');
});