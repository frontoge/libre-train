import type { Readable } from 'stream';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

/**
 * Thin wrapper around an S3-compatible object store (Garage). Every operation takes an
 * explicit `bucket` so additional image domains can live in their own buckets later.
 */

const endpoint = process.env.GARAGE_ENDPOINT;
const region = process.env.GARAGE_REGION ?? 'garage';
const accessKeyId = process.env.GARAGE_ACCESS_KEY;
const secretAccessKey = process.env.GARAGE_SECRET_KEY;

export const isStorageConfigured = (): boolean => Boolean(endpoint && accessKeyId && secretAccessKey);

export const getLogoBucket = (): string => process.env.GARAGE_BUCKET ?? 'libre-train-logos';

let client: S3Client | null = null;

const getClient = (): S3Client => {
	if (!isStorageConfigured()) {
		throw new Error('Object storage is not configured (set GARAGE_ENDPOINT, GARAGE_ACCESS_KEY, GARAGE_SECRET_KEY).');
	}
	if (!client) {
		client = new S3Client({
			endpoint,
			region,
			// Garage only supports path-style addressing.
			forcePathStyle: true,
			credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
		});
	}
	return client;
};

export const putObject = async (bucket: string, key: string, body: Buffer, contentType: string): Promise<void> => {
	await getClient().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
};

export type StorageObject = {
	stream: Readable;
	contentType?: string;
	contentLength?: number;
};

export const getObject = async (bucket: string, key: string): Promise<StorageObject> => {
	const result = await getClient().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
	return {
		stream: result.Body as Readable,
		contentType: result.ContentType,
		contentLength: result.ContentLength,
	};
};

export const deleteObject = async (bucket: string, key: string): Promise<void> => {
	await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};
