const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

async function uploadToS3(file) {
  if (!file) return null;

  const uniqueName = `${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: uniqueName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  });

  await s3Client.send(command);

  return `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueName}`;
}

module.exports = { uploadToS3 };
