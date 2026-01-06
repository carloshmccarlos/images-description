'use client';

import { motion } from 'framer-motion';
import { Upload, Brain, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingAnalysisProps {
  stage: 'uploading' | 'analyzing';
}

const stages = {
  uploading: {
    icon: Upload,
    title: 'Uploading Image',
    description: 'Preparing your image for analysis...',
    progress: 25,
  },
  analyzing: {
    icon: Brain,
    title: 'Analyzing with AI',
    description: 'Extracting vocabulary and generating descriptions...',
    progress: 75,
  },
};

export function LoadingAnalysis({ stage }: LoadingAnalysisProps) {
  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  return (
    <Card className="overflow-hidden border border-zinc-200 bg-white/75 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/40 relative">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_bottom,rgba(24,24,27,0.03)_1px,transparent_1px)] bg-size-[100%_20px] dark:opacity-10" />
      <CardContent className="py-16 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Animated Icon */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-24 h-24 rounded-3xl bg-linear-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative z-10"
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Orbiting particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-linear-to-r from-sky-400 to-emerald-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 1.33,
                }}
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 -50px',
                }}
              />
            ))}
          </div>

          {/* Text */}
          <div className="space-y-3 max-w-md">
            <motion.h3
              key={currentStage.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white"
            >
              {currentStage.title}
            </motion.h3>
            <motion.p
              key={currentStage.description}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-500 text-lg leading-relaxed"
            >
              {currentStage.description}
            </motion.p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-sm">
            <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/30 shadow-inner">
              <motion.div
                className="h-full bg-linear-to-r from-sky-600 via-teal-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${currentStage.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Fun facts while waiting */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 text-sm text-zinc-500 font-medium"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI is identifying objects and generating vocabulary...</span>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
