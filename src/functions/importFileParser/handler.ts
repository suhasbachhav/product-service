import { S3Event } from "aws-lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import csv from "csv-parser";
import { Readable } from "stream";

export default async function (event: S3Event) {
  console.log("importFileParser", event);

  const s3Client = new S3Client({ region: process.env.AWS_REGION });

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
        stream
          .pipe(csv())
          .on("data", (data) => {
            console.log("Parsed CSV record:", JSON.stringify(data));
          })
          .on("error", (error) => {
            console.error("Error parsing CSV:", error);
            reject(error);
          })
          .on("end", () => {
            console.log(`Finished processing ${key}`);
            resolve(null);
          });
      });
    } catch (error) {
      console.error(`Error processing file ${key}:`, error);
      throw error;
    }
  }
}
