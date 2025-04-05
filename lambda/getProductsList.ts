export const handler = async (event: any) => {
    const products = JSON.parse(process.env.PRODUCTS || '[]');
    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  };