import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function ({ fileName }: { fileName?: string }) {
  console.log("importProductsFile", fileName);

  if (!fileName) {
    throw new Error("fileName is required");
  }

  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const bucketName = process.env.BUCKET_NAME;

  if (!bucketName) {
    throw new Error("BUCKET_NAME environment variable is not set");
  }

  const key = `uploaded/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: "text/csv",
  });

  try {
    return getSignedUrl(s3Client, command, { expiresIn: 300 });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
}
