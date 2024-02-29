import AWS from 'aws-sdk';
import { logger } from '../shared/logger.js';

async function getSignedUrlForUpload(data: any): Promise<any> {
  const version = process.env.S3_VERSION;
  const region = process.env.S3_REGION;
  const bucket = process.env.S3_BUCKET;
  const publicPath = process.env.S3_PUBLIC_PATH;

  logger.info({ version, region, bucket, publicPath });

  //TODO:move to ext config
  const s3 = new AWS.S3({
    useAccelerateEndpoint: false,
    signatureVersion: version,
    region: region,
  });

  const signedUrlExpireSeconds = 60 * 60;

  const myBucket = bucket;

  logger.info(process.env.PROTOCOL_BASE_URL);
  logger.info('s3------>', s3);
  logger.info('bucket------>', bucket);
  logger.info('data------>', data);
  //TODO: Use Axios to send http request
  try {
    const myKey = data.path + '/' + crypto.randomUUID() + data.fileType.replace(/^\.?/, '.');
    const params = {
      Bucket: myBucket,
      Key: myKey,
      Expires: signedUrlExpireSeconds,
    };
    return await new Promise((resolve, reject) =>
      s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
          logger.info('Error getting presigned url from AWS S3', err);
          reject({
            success: false,
            message: 'Pre-Signed URL error',
            urls: url,
          });
        } else {
          const publicUrl = 'https://' + bucket + '.' + `s3.${region}.amazonaws.com` + '/' + myKey;

          resolve({
            success: true,
            message: 'AWS SDK S3 Pre-signed urls generated successfully.',
            path: myKey,
            urls: url,
            publicUrl: publicUrl,
          });
        }
      }),
    );
  } catch (err) {
    return err;
  }
}

export default getSignedUrlForUpload;
