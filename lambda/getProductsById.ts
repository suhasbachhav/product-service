export const handler = async (event: any) => {
    const products = JSON.parse(process.env.PRODUCTS || '[]');
    const productId = event.productId || event.body?.productId || event.queryStringParameters?.productId;
    const product = products.find((p: any) => p.id === productId);
  
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }
  
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  };