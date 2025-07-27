import { S3Client } from "@aws-sdk/client-s3";

declare global {
  var cachedS3: S3Client;
}

let s3: S3Client;

if (process.env.NODE_ENV === "production") {
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string,
    },
  });
}
else {
  if (!global.cachedS3) {
    global.cachedS3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string,
      },
    });
  }
  s3 = global.cachedS3;
}

export default s3;