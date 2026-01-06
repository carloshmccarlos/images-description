'use client';

import { motion } from 'framer-motion';
import { Sparkles, Upload, Brain, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  progress: number;
  status: 'uploading' | 'analyzing';
  translations: {
    progressUploading: string;
    progressAnalyzing: string;
    progressSaving: string;
  };
}

export function AnalysisProgress({ progress, status, translations }: AnalysisProgressProps) {
  const steps = [
    { 
      key: 'upload', 
      icon: Upload, 
      label: translations.progressUploading,
      active: status === 'uploading' && progress < 30,
      complete: progress >= 30,
    },
    { 
      key: 'analyze', 
      icon: Brain, 
      label: translations.progressAnalyzing,
      active: status === 'analyzing' || (progress >= 30 && progress < 90),
      complete: progress >= 90,
    },
    { 
      key: 'save', 
      icon: Save, 
      label: translations.progressSaving,
      active: progress >= 90 && progress < 100,
      complete: progress >= 100,
    },
  ];

  return (
    <Card className="border border-zinc-200 bg-white/75 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
      <CardContent className="py-12">
        <div className="max-w-md mx-auto space-y-8">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/25"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-center text-sm font-medium text-zinc-500">
              {progress}%
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                    step.active 
                      ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20' 
                      : step.complete
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.active 
                      ? 'bg-blue-500 text-white' 
                      : step.complete
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                  }`}>
                    {step.active ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`font-medium ${
                    step.active 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : step.complete
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-zinc-500'
                  }`}>
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
