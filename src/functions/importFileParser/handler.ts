import { S3Event } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import csv from "csv-parser";
import { Readable } from "stream";

export default async function (event: S3Event) {
  console.log("importFileParser", event);

  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
  const queueUrl = process.env.SQS_QUEUE_URL;

  if (!queueUrl) {
    throw new Error("SQS_QUEUE_URL environment variable is not set");
  }

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        throw new Error("Empty file body");
      }

      const stream = response.Body as Readable;

      await new Promise((resolve, reject) => {
        const records: any[] = [];

        stream
          .pipe(csv())
          .on("data", (data) => {
            // Simple validation before pushing
            if (data.title && data.description && data.price) {
              const priceNum = parseFloat(data.price);
              if (!isNaN(priceNum) && priceNum >= 0) {
                records.push(data);
              } else {
                console.warn("Skipping record with invalid price:", data);
              }
            } else {
              console.warn(
                "Skipping record with missing required fields:",
                data
              );
            }
          })
          .on("error", (error) => {
            console.error("Error parsing CSV:", error);
            reject(error);
          })
          .on("end", async () => {
            try {
              // Send each record to SQS
              for (const record of records) {
                const command = new SendMessageCommand({
                  QueueUrl: queueUrl,
                  MessageBody: JSON.stringify(record),
                });

                await sqsClient.send(command);
                console.log("Sent record to SQS:", JSON.stringify(record));
              }

              console.log(
                `Finished processing ${key}, sent ${records.length} records to SQS`
              );
              resolve(null);
            } catch (error) {
              console.error("Error sending messages to SQS:", error);
              reject(error);
            }
          });
      });
    } catch (error) {
      console.error(`Error processing file ${key}:`, error);
      throw error;
    }
  }
}