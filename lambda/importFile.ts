import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from 'aws-sdk';
const csv = require('csv-parser');

const s3 = new AWS.S3({ region: 'ap-south-1', signatureVersion: 'v4' });
const bucketName = 'infrastack-websitebucket75c24d94-suhas';

export const handler: APIGatewayProxyHandler = async (event) => {
  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing "name" query parameter' }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json",
      }
    };
  }

  const params = {
    Bucket: bucketName,
    Key: `uploaded/${fileName}`,
    Expires: 60,
    ContentType: 'text/csv',
  };

  try {
    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: signedUrl }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json",
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Could not generate signed URL', error: err }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json",
      }
    };
  }
};
