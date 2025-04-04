import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MOCK_PRODUCTS } from '../data/mock-products';
import { generateResponse } from '../utils/response-utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const productId = event.pathParameters?.productId;

        if (!productId) {
            return generateResponse(400, { message: 'Product ID is required' });
        }

        const product = MOCK_PRODUCTS.find((p) => p.id === productId);

        if (!product) {
            return generateResponse(404, { message: 'Product not found' });
        }

        return generateResponse(200, product);
    } catch (error) {
        return generateResponse(500, { message: 'Internal Server Error' });
    }
};