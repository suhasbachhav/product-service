import { S3Handler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
const csv = require('csv-parser');

const s3 = new AWS.S3({ region: 'ap-south-1', signatureVersion: 'v4' });

export const handler: S3Handler = async (event) => {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  
      console.log(`Processing file from bucket: ${bucket}, key: ${key}`);
  
      const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
  
      await new Promise<void>((resolve, reject) => {
        s3Stream
          .pipe(csv())
          .on('data', (data: Record<string, string>) => console.log('Parsed record:', data))
          .on('end', () => {
            console.log('Finished parsing file');
            resolve();
          })
          .on('error', (error: Error) => {
            console.error('Error while reading CSV:', error);
            reject(error);
          });
      });
    }
  };