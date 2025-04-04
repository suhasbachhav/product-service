import { handler } from '../lib/lambdas/getProductsList';
import { MOCK_PRODUCTS } from '../lib/data/mock-products';

describe('getProductsList', () => {
    it('should return all products with a 200 status code', async () => {
        const result = await handler({} as any);
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual(MOCK_PRODUCTS);
    });
});