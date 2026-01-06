'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { compressImage, validateImageType, validateImageSize, getFileSizeDisplay } from '@/lib/image/compression';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  onClear: () => void;
  selectedImage: string | null;
  isUploading?: boolean;
}

export function ImageUploader({
  onImageSelect,
  onClear,
  selectedImage,
  isUploading = false,
}: ImageUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const { t } = useTranslation('analyze');

  const handleFile = useCallback(async (file: File) => {
    if (!validateImageType(file)) {
      toast.error(t('uploader.invalidType'), { description: t('uploader.invalidTypeDesc') });
      return;
    }

    setIsCompressing(true);
    try {
      const compressedFile = await compressImage(file);

      if (!validateImageSize(compressedFile)) {
        toast.error(t('uploader.tooLarge'), { description: t('uploader.tooLargeDesc') });
        return;
      }

      const preview = URL.createObjectURL(compressedFile);
      onImageSelect(compressedFile, preview);

      if (compressedFile.size < file.size) {
        toast.success(t('uploader.compressed'), {
          description: `${getFileSizeDisplay(file.size)} → ${getFileSizeDisplay(compressedFile.size)}`,
        });
      }
    } catch {
      toast.error(t('uploader.compressionFailed'), { description: t('uploader.compressionFailedDesc') });
    } finally {
      setIsCompressing(false);
    }
  }, [onImageSelect, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFile(acceptedFiles[0]);
      }
    },
  });

  if (selectedImage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl shadow-zinc-200/50 dark:border-zinc-800 dark:shadow-none bg-white dark:bg-zinc-950 max-w-4xl mx-auto"
      >
        <div className="aspect-video relative group max-h-[520px]">
          <Image
            src={selectedImage}
            alt="Selected"
            fill
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {!isUploading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4 rounded-full w-10 h-10 shadow-lg active:scale-95 transition-all opacity-0 group-hover:opacity-100"
              onClick={onClear}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {isUploading && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <p className="text-white font-bold tracking-tight">{t('uploader.processing')}</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-3 border-dashed rounded-3xl p-12 transition-all duration-300 cursor-pointer overflow-hidden min-h-[320px] flex items-center justify-center',
        isDragActive
          ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5'
          : 'border-zinc-200 hover:border-sky-400 bg-white/50 hover:bg-sky-50/30 dark:border-zinc-800 dark:bg-zinc-950/30 dark:hover:bg-sky-500/5',
        isCompressing && 'pointer-events-none opacity-50'
      )}
    >
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] pointer-events-none" />
      <input {...getInputProps()} />
      <AnimatePresence mode="wait">
        {isCompressing ? (
          <motion.div
            key="compressing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-6 relative z-10"
          >
            <div className="w-20 h-20 rounded-3xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center border border-sky-100 dark:border-sky-800 animate-pulse">
              <Loader2 className="h-10 w-10 animate-spin text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">{t('uploader.optimizing')}</p>
              <p className="text-zinc-500 font-medium">{t('uploader.optimizingHint')}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-8 relative z-10"
          >
            <div className={cn(
              "w-24 h-24 rounded-[32px] flex items-center justify-center transition-all duration-500 shadow-xl",
              isDragActive 
                ? "bg-emerald-500 text-white rotate-12 scale-110 shadow-emerald-500/20" 
                : "bg-white dark:bg-zinc-900 text-zinc-400 group-hover:text-sky-500 border border-zinc-100 dark:border-zinc-800"
            )}>
              {isDragActive ? (
                <ImageIcon className="h-12 w-12" />
              ) : (
                <Upload className="h-12 w-12" />
              )}
            </div>
            <div className="text-center space-y-3">
              <div className="space-y-1">
                <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {isDragActive ? t('uploader.dropTitle') : t('uploader.captureTitle')}
                </p>
                <p className="text-zinc-500 font-medium text-lg">
                  {isDragActive ? t('uploader.dropHint') : t('uploader.dragHint')}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {['JPG', 'PNG', 'WEBP'].map(ext => (
                  <span key={ext} className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black tracking-widest text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
