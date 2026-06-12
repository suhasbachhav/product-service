import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import * as csvParser from "csv-parser";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event: any) => {
  try {
    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      throw new Error("BUCKET_NAME environment variable is not set");
    }

    const results: any[] = [];

    for (const record of event.Records) {
      const objectKey = record.s3.object.key;

      console.log(`Processing file: ${objectKey} from bucket: ${bucketName}`);

      const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
      const response = await s3Client.send(command);

      if (!response.Body || !(response.Body instanceof Readable)) {
        throw new Error("Failed to get object or object body is not readable");
      }

      const stream = response.Body as Readable;

      await new Promise((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on("data", (data) => results.push(data))
          .on("end", resolve)
          .on("error", reject);
      });
    }

    console.log("Parsed CSV data:", results);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File parsed successfully", data: results }),
    };
  } catch (error) {
    console.error("Error processing file:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: errorMessage }),
    };
  }
};