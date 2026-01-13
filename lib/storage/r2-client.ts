import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

function getR2Config(): R2Config {
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new Error('R2 is not configured');
  }

  return { endpoint, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

function getS3Client(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const config = getR2Config();
  const s3Client = getS3Client(config);

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `${config.publicUrl}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const config = getR2Config();
  const s3Client = getS3Client(config);

  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  await s3Client.send(command);
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const config = getR2Config();
  const s3Client = getS3Client(config);

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const config = getR2Config();
  const s3Client = getS3Client(config);

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export function generateImageKey(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `images/${userId}/${timestamp}_${sanitizedFilename}`;
}

export function getKeyFromUrl(url: string): string {
  try {
    const config = getR2Config();
    const target = new URL(url);
    const base = new URL(config.publicUrl);

    if (target.origin !== base.origin) return url;

    const basePath = base.pathname.endsWith('/') ? base.pathname : `${base.pathname}/`;
    if (!target.pathname.startsWith(basePath)) return url;

    const key = target.pathname.slice(basePath.length);
    return key.startsWith('/') ? key.slice(1) : key;
  } catch {
    try {
      const config = getR2Config();
      if (url.startsWith(`${config.publicUrl}/`)) {
        return url.slice(`${config.publicUrl}/`.length);
      }
    } catch {}
    return url;
  }
}
