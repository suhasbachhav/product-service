import { handler } from '../lib/lambdas/getProductsById';
import { MOCK_PRODUCTS } from '../lib/data/mock-products';

describe('getProductsById', () => {
    it('should return a 400 if pathParameters is undefined', async () => {
        // Test case for when the pathParameters are undefined
        const event = { pathParameters: undefined } as any;
        const result = await handler(event);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body)).toEqual({ message: 'Product ID is required' });
    });

    it('should return a 404 if product is not found', async () => {
        // Test case for a product that doesn't exist
        const event = { pathParameters: { productId: '999' } } as any; // `999` doesn't exist in the mock
        const result = await handler(event);
        expect(result.statusCode).toEqual(404);
        expect(JSON.parse(result.body)).toEqual({ message: 'Product not found' });
    });

    it('should return the correct product when given a valid product ID', async () => {
        // Test case for a valid product
        const event = { pathParameters: { productId: '1' } } as any; // `1` exists in the mock
        const result = await handler(event);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(MOCK_PRODUCTS[0]);
    });
});