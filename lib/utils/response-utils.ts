export const generateResponse = (statusCode: number, body: unknown) => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    };
};