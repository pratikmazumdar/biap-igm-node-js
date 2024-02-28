import { v4 as uuidv4 } from 'uuid';
import { Methods } from '../shared/constants';
import getSignedUrlForUpload from './s3Util';
import { Context, IssueProps } from '../interfaces/issue';

export const getEnv = (name: string): string => {
  const val: string | undefined = process.env[name];
  if (val === undefined || val === null) {
    throw `Missing Env: ${name}`;
  }

  return val;
};

export const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export function transform(response: { context: Context; message: { issue: IssueProps } }) {
  return {
    context: response?.context,
    message: { issue: { ...response?.message?.issue } },
  };
}

export async function uploadImage(base64: string) {
  try {
    const matches: RegExpMatchArray | null = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches && matches.length !== 3) {
      throw new Error('Invalid input string');
    }

    const blob = b64toBlob(base64.split(';base64').pop() as string);
    const resp = await getSignedUrlForUpload({
      path: uuidv4(),
      filetype: 'png',
    });

    fetch(resp?.urls, {
      method: Methods.PUT,
      headers: { 'Content-Type': 'image/*' },
      body: blob,
    });
    return resp?.publicUrl;
  } catch (err) {
    return err;
  }
}
