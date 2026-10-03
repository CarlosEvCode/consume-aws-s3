const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost.floci.io:4566',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
    },
    forcePathStyle: true
});

const BUCKET = process.env.AWS_S3_BUCKET || 'laboratorio-floci';

exports.handler = async () => {
    const data = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET }));
    const total = (data.Contents || []).length;

    console.log(`[RUTINA S3] Fecha: ${new Date().toISOString()} | Total archivos en ${BUCKET}: ${total}`);

    return { total };
};