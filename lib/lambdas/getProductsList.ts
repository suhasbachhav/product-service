import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MOCK_PRODUCTS } from '../data/mock-products';
import { generateResponse } from '../utils/response-utils';

export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        return generateResponse(200, MOCK_PRODUCTS);
    } catch (error) {
        return generateResponse(500, { message: 'Internal Server Error' });
    }
};