'use client';

import { motion } from 'framer-motion';
import { User, Mail, Calendar, Activity, Award, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'suspended';
  role: 'user' | 'admin' | 'super_admin';
  motherLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  createdAt: Date;
  stats: {
    totalWordsLearned: number;
    totalAnalyses: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date | null;
  };
}

interface UserDetailCardProps {
  user: UserDetail;
  onSuspend: () => void;
  onReactivate: () => void;
  className?: string;
}

export function UserDetailCard({
  user,
  onSuspend,
  onReactivate,
  className,
}: UserDetailCardProps) {
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-linear-to-br from-[#141416] to-[#1c1c1f] border border-[#2a2a2e] rounded-2xl p-6 shadow-lg shadow-black/20',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 ring-2 ring-[#2a2a2e]">
            <AvatarFallback className="bg-linear-to-br from-violet-600 to-rose-500 text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {user.name || 'Unnamed User'}
            </h2>
            <p className="text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                user.status === 'active' 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/20 text-rose-400"
              )}>
                {user.status}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-400">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {user.status === 'active' ? (
            <Button
              onClick={onSuspend}
              variant="outline"
              size="sm"
              className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
            >
              <Pause className="w-4 h-4 mr-2" />
              Suspend
            </Button>
          ) : (
            <Button
              onClick={onReactivate}
              variant="outline"
              size="sm"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Play className="w-4 h-4 mr-2" />
              Reactivate
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Profile Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Mother Language</p>
                <p className="text-sm text-white">{user.motherLanguage}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Learning Language</p>
                <p className="text-sm text-white">{user.learningLanguage}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Proficiency Level</p>
                <p className="text-sm text-white capitalize">{user.proficiencyLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Joined</p>
                <p className="text-sm text-white">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Learning Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1c1c1f] rounded-lg p-3 border border-[#2a2a2e]">
              <p className="text-xs text-zinc-500">Words Learned</p>
              <p className="text-lg font-semibold text-white">
                {user.stats.totalWordsLearned.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1c1c1f] rounded-lg p-3 border border-[#2a2a2e]">
              <p className="text-xs text-zinc-500">Analyses</p>
              <p className="text-lg font-semibold text-white">
                {user.stats.totalAnalyses.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1c1c1f] rounded-lg p-3 border border-[#2a2a2e]">
              <p className="text-xs text-zinc-500">Current Streak</p>
              <p className="text-lg font-semibold text-white">
                {user.stats.currentStreak} days
              </p>
            </div>
            <div className="bg-[#1c1c1f] rounded-lg p-3 border border-[#2a2a2e]">
              <p className="text-xs text-zinc-500">Longest Streak</p>
              <p className="text-lg font-semibold text-white">
                {user.stats.longestStreak} days
              </p>
            </div>
          </div>
          {user.stats.lastActivityDate && (
            <div className="flex items-center gap-3 pt-2">
              <Activity className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Last Activity</p>
                <p className="text-sm text-white">
                  {formatDate(user.stats.lastActivityDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}