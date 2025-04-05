import { handler } from '../lambda/getProductsList';

test('should return all products', async () => {
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

  const response = await handler({});
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body)).toHaveLength(2);
});