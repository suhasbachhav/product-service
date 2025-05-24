export const mockProducts = [
  {
    id: "1",
    title: "Product 1",
    description: "Product 1 description",
    price: 100,
    count: 10,
  },
  {
    id: "2",
    title: "Product 2",
    description: "Product 2 description",
    price: 200,
    count: 20,
  },
  {
    id: "3",
    title: "Product 3",
    description: "Product 3 description",
    price: 300,
    count: 30,
  },
];

// Helper method to add artificial delay retrieving data
// just so we can demonstrate async/await in the lambda functions
const withDelay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 50);
  });
};

export const getProducts = () => {
  return withDelay(mockProducts);
};

export const getProductById = (id: string) => {
  const product = mockProducts.find((p) => p.id === id);
  return withDelay(product);
};
