import imageCompression from 'browser-image-compression';
import { IMAGE_CONFIG } from '@/lib/constants';

const SKIP_COMPRESSION_THRESHOLD = 500 * 1024; // 500KB

export async function compressImage(file: File): Promise<File> {
  // If already under 500KB, return as-is (no compression needed)
  if (file.size <= SKIP_COMPRESSION_THRESHOLD) {
    return file;
  }

  const targetBytes = IMAGE_CONFIG.maxSizeBytes;
  const targetSizeMB = targetBytes / (1024 * 1024);
  const targetFileType = 'image/jpeg' as const;

  const maxDimensions = [1920, 1600, 1280, 1024, 800, 640];
  const qualities = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4];

  let workingFile: File = file;

  const toJpgName = (name: string) => {
    if (/\.jpe?g$/i.test(name)) return name;
    if (/\.[^.]+$/.test(name)) return name.replace(/\.[^.]+$/, '.jpg');
    return `${name}.jpg`;
  };

  for (const maxWidthOrHeight of maxDimensions) {
    for (const initialQuality of qualities) {
      const compressedFile = await imageCompression(workingFile, {
        maxSizeMB: targetSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: targetFileType,
        initialQuality,
        maxIteration: 10,
      });

      workingFile = new File([compressedFile], toJpgName(compressedFile.name), {
        type: targetFileType,
        lastModified: compressedFile.lastModified,
      });
      if (workingFile.size <= targetBytes) {
        return workingFile;
      }
    }
  }

  return workingFile;
}

export function validateImageType(file: File): boolean {
  return IMAGE_CONFIG.supportedTypes.includes(
    file.type as typeof IMAGE_CONFIG.supportedTypes[number]
  );
}

export function validateImageSize(file: File): boolean {
  return file.size <= IMAGE_CONFIG.maxSizeBytes;
}

export function getFileSizeDisplay(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
