import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);
const s3 = new XAWS.S3({
  signatureVersion: 'v4',
});

export class AttachmentUtils {
  constructor(
    private readonly attachmentS3Bucket = process.env.ATTACHMENT_S3_BUCKET,
    private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION) { }

  public async createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return s3.getSignedUrl('putObject', {
      Bucket: this.attachmentS3Bucket,
      Key: todoId,
      Expires: Number(this.signedUrlExpiration)
    });
  }

}