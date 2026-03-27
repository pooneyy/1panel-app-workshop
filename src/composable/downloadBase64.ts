import type { MaybeRef, Ref } from 'vue';
import _ from 'lodash';
import { get } from '@vueuse/core';

export {
  getMimeTypeFromBase64,
  getMimeTypeFromExtension, getExtensionFromMimeType,
  useDownloadFileFromBase64, useDownloadFileFromBase64Refs,
  previewImageFromBase64,
};

// MIME 类型映射表
const mimeTypeToExtension: Record<string, string> = {
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/javascript': 'js',
  'application/json': 'json',
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
  'application/x-tar': 'tar',
  'application/gzip': 'gz',
};

const extensionToMimeType: Record<string, string> = {
  'txt': 'text/plain',
  'html': 'text/html',
  'htm': 'text/html',
  'css': 'text/css',
  'js': 'text/javascript',
  'json': 'application/json',
  'pdf': 'application/pdf',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'ogv': 'video/ogg',
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
};

const commonMimeTypesSignatures = {
  'JVBERi0': 'application/pdf',
  'R0lGODdh': 'image/gif',
  'R0lGODlh': 'image/gif',
  'iVBORw0KGgo': 'image/png',
  '/9j/': 'image/jpg',
};

// 替代 mime-types 的函数
function getExtensionFromMimeType(mimeType: string): string | false {
  return mimeTypeToExtension[mimeType.toLowerCase()] || false;
}

function getMimeTypeFromExtension(extension: string): string | false {
  return extensionToMimeType[extension.toLowerCase()] || false;
}

function getMimeTypeFromBase64({ base64String }: { base64String: string }) {
  const [,mimeTypeFromBase64] = base64String.match(/data:(.*?);base64/i) ?? [];

  if (mimeTypeFromBase64) {
    return { mimeType: mimeTypeFromBase64 };
  }

  const inferredMimeType = _.find(commonMimeTypesSignatures, (_mimeType, signature) => base64String.startsWith(signature));

  if (inferredMimeType) {
    return { mimeType: inferredMimeType };
  }

  return { mimeType: undefined };
}

function getFileExtensionFromMimeType({
  mimeType,
  defaultExtension = 'txt',
}: {
  mimeType: string | undefined
  defaultExtension?: string
}) {
  if (mimeType) {
    return getExtensionFromMimeType(mimeType) ?? defaultExtension;
  }

  return defaultExtension;
}

function downloadFromBase64({ sourceValue, filename, extension, fileMimeType }:
{ sourceValue: string; filename?: string; extension?: string; fileMimeType?: string }) {
  if (sourceValue === '') {
    throw new Error('Base64 string is empty');
  }

  const defaultExtension = extension ?? 'txt';
  const { mimeType } = getMimeTypeFromBase64({ base64String: sourceValue });
  let base64String = sourceValue;
  if (!mimeType) {
    const targetMimeType = fileMimeType ?? getMimeTypeFromExtension(defaultExtension);
    base64String = `data:${targetMimeType};base64,${sourceValue}`;
  }

  const cleanExtension = extension ?? getFileExtensionFromMimeType(
    { mimeType, defaultExtension });
  let cleanFileName = filename ?? `file.${cleanExtension}`;
  if (extension && !cleanFileName.endsWith(`.${extension}`)) {
    cleanFileName = `${cleanFileName}.${cleanExtension}`;
  }

  const a = document.createElement('a');
  a.href = base64String;
  a.download = cleanFileName;
  a.click();
}

function useDownloadFileFromBase64(
  { source, filename, extension }:
  { source: MaybeRef<string>; filename?: MaybeRef<string>; extension?: MaybeRef<string> }) {
  return {
    download() {
      downloadFromBase64({ sourceValue: get(source), filename: get(filename), extension: get(extension) });
    },
  };
}

function previewImageFromBase64(base64String: string): HTMLImageElement {
  if (base64String === '') {
    throw new Error('Base64 string is empty');
  }

  const img = document.createElement('img');
  img.src = base64String;

  const container = document.createElement('div');
  container.appendChild(img);

  const previewContainer = document.getElementById('previewContainer');
  if (previewContainer) {
    previewContainer.innerHTML = '';
    previewContainer.appendChild(container);
  }
  else {
    throw new Error('Preview container element not found');
  }

  return img;
}

function useDownloadFileFromBase64Refs(
  { source, filename, extension }:
  { source: Ref<string>; filename?: Ref<string>; extension?: Ref<string> }) {
  return {
    download() {
      downloadFromBase64({ sourceValue: source.value, filename: filename?.value, extension: extension?.value });
    },
  };
}
