import { handler } from "../lambda/getProductsById";

test('should return a product by ID', async () => {
  process.env.PRODUCTS = JSON.stringify([
    {
        id: '1',
        title: 'Smartphone',
        description: 'A high-end smartphone with a powerful processor and excellent camera.',
        price: 699,
        logoUrl: 'https://example.com/images/smartphone.jpg',
        count: 50,
      },
      {
        id: '2',
        title: 'Laptop',
        description: 'A lightweight laptop with a long battery life, perfect for work and travel.',
        price: 999,
        logoUrl: 'https://example.com/images/laptop.jpg',
        count: 30,
      },
  ]);

  const response = await handler({ pathParameters: { productId: '1' } });
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body).title).toBe('Smartphone');
});

test('should return 404 if product not found', async () => {
  process.env.PRODUCTS = JSON.stringify([
    {
        id: '1',
        title: 'Smartphone',
        description: 'A high-end smartphone with a powerful processor and excellent camera.',
        price: 699,
        logoUrl: 'https://example.com/images/smartphone.jpg',
        count: 50,
      },
  ]);

  const response = await handler({ pathParameters: { productId: '2' } });
  expect(response.statusCode).toBe(404);
  expect(JSON.parse(response.body).message).toBe('Product not found');
});