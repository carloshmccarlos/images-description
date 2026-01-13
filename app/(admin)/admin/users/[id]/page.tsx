'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Globe, 
  BookOpen,
  BarChart3,
  Award,
  Clock,
  Ban,
  CheckCircle,
  Trash2,
  Pencil,
  Loader2,
  Image as ImageIcon,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'suspended';
  role: 'user' | 'admin' | 'super_admin';
  motherLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  dailyLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalWordsLearned: number;
  totalAnalyses: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

interface RecentAnalysis {
  id: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  vocabularyCount: number;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('admin');
  const { locale } = useLanguage();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserDetail() {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        const data = await response.json();

        if (data.success) {
          // API returns flat structure with user data, stats, and recentAnalyses
          const userData = data.data;
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            status: userData.status,
            role: userData.role,
            motherLanguage: userData.motherLanguage,
            learningLanguage: userData.learningLanguage,
            proficiencyLevel: userData.proficiencyLevel,
            dailyLimit: userData.dailyLimit,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
          });
          setStats(userData.stats);
          setRecentAnalyses(userData.recentAnalyses || []);
        } else {
          toast({ title: t('toast.error'), description: data.error, variant: 'destructive' });
          if (data.error === 'User not found') {
            router.push(`/${locale}/admin/users`);
          }
        }
      } catch {
        toast({ title: t('toast.error'), description: t('toast.fetchError'), variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserDetail();
  }, [userId, router, toast, t, locale]);

  const handleStatusChange = async (action: 'suspend' | 'reactivate') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();

      if (data.success) {
        toast({ 
          title: t('toast.success'), 
          description: action === 'suspend' ? t('toast.userSuspended') : t('toast.userReactivated')
        });
        setUser(prev => prev ? { ...prev, status: data.data.status } : null);
      } else {
        toast({ title: t('toast.error'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('toast.error'), description: t('toast.statusError'), variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: t('toast.success'), description: t('toast.userDeleted') });
        router.push(`/${locale}/admin/users`);
      } else {
        toast({ title: t('toast.error'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('toast.error'), description: t('toast.deleteError'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English',
      'zh-cn': '中文（简体）',
      'zh-tw': '中文（繁體）',
      ja: '日本語',
      ko: '한국어',
    };
    return languages[code] || code;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-gray-500">{t('users.noUsers')}</p>
        <Link href={`/${locale}/admin/users`}>
          <Button className="mt-4">{t('userDetail.backToUsers')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Link href={`/${locale}/admin/users`} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('userDetail.backToUsers')}
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name || t('userDetail.notSet')}</h1>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                  {user.role.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.status)}`}>
                  {user.status === 'active' ? t('users.statusActive') : t('users.statusSuspended')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
              className="border-gray-200 text-gray-700 hover:text-gray-900"
            >
              <Pencil className="w-4 h-4 mr-2" />
              {t('users.editUser')}
            </Button>
            {user.status === 'active' ? (
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange('suspend')}
                className="border-amber-200 text-amber-600 hover:bg-amber-50"
              >
                <Ban className="w-4 h-4 mr-2" />
                {t('users.suspendUser')}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange('reactivate')}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('users.reactivateUser')}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(true)}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('users.deleteUser')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('userDetail.userInformation')}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('userDetail.email')}</p>
                    <p className="text-gray-700">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('userDetail.name')}</p>
                    <p className="text-gray-700">{user.name || t('userDetail.notSet')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('userDetail.joined')}</p>
                    <p className="text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('userDetail.languageSettings')}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('userDetail.motherLanguage')}</p>
                    <p className="text-gray-700">{getLanguageName(user.motherLanguage)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('userDetail.learningLanguage')}</p>
                    <p className="text-gray-700">{getLanguageName(user.learningLanguage)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('userDetail.proficiencyLevel')}</p>
                    <p className="text-gray-700 capitalize">{user.proficiencyLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Limit Card */}
            <DailyLimitCard 
              userId={user.id}
              currentLimit={user.dailyLimit}
              onLimitUpdated={(newLimit) => setUser(prev => prev ? { ...prev, dailyLimit: newLimit } : null)}
            />
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">{t('userDetail.totalAnalyses')}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 font-serif">{stats.totalAnalyses}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs">{t('userDetail.wordsLearned')}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 font-serif">{stats.totalWordsLearned}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">{t('userDetail.currentStreak')}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 font-serif">{stats.currentStreak} {t('userDetail.days')}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{t('userDetail.lastActivity')}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.lastActivityDate 
                      ? new Date(stats.lastActivityDate).toLocaleDateString() 
                      : t('userDetail.never')}
                  </p>
                </div>
              </div>
            )}

            {/* Recent Analyses */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('userDetail.recentAnalyses')}</h2>
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('userDetail.noAnalyses')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentAnalyses.map((analysis) => (
                    <div 
                      key={analysis.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                    >
                      <div className="aspect-video relative bg-gray-100">
                        {analysis.imageUrl && (
                          <Image 
                            src={analysis.imageUrl} 
                            alt="Analysis" 
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-700 line-clamp-2">{analysis.description}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{analysis.vocabularyCount} {t('userDetail.words')}</span>
                          <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <EditUserDetailModal 
        isOpen={isEditModalOpen}
        user={user}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updatedUser) => {
          setUser(updatedUser);
          setIsEditModalOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
            <DialogDescription className="text-gray-500">
              {t('deleteDialog.description')} <span className="text-gray-900 font-medium">{user.email}</span>? 
              {t('deleteDialog.warningWithCount')} {stats?.totalAnalyses || 0} {t('deleteDialog.analyses')}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-gray-200 text-gray-600"
            >
              {t('deleteDialog.cancel')}
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// Edit User Detail Modal Component
function EditUserDetailModal({ 
  isOpen, 
  user,
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  user: UserDetail;
  onClose: () => void; 
  onSuccess: (user: UserDetail) => void;
}) {
  const t = useTranslations('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: user.email,
    name: user.name || '',
    role: user.role,
    status: user.status,
    motherLanguage: user.motherLanguage,
    learningLanguage: user.learningLanguage,
    proficiencyLevel: user.proficiencyLevel,
  });
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      email: user.email,
      name: user.name || '',
      role: user.role,
      status: user.status,
      motherLanguage: user.motherLanguage,
      learningLanguage: user.learningLanguage,
      proficiencyLevel: user.proficiencyLevel,
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: t('toast.success'), description: t('toast.userUpdated') });
        onSuccess({
          ...user,
          ...formData,
          name: formData.name || null,
        });
      } else {
        toast({ title: t('toast.error'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('toast.error'), description: t('toast.updateError'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-violet-600" />
            {t('userForm.editTitle')}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {t('userForm.editSubtitle')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-gray-700">{t('userForm.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white border-gray-200 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-700">{t('userForm.name')}</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white border-gray-200 text-gray-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">{t('userForm.role')}</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, role: v as typeof formData.role }))}
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="user">{t('users.roleUser')}</SelectItem>
                  <SelectItem value="admin">{t('users.roleAdmin')}</SelectItem>
                  <SelectItem value="super_admin">{t('users.roleSuperAdmin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">{t('userForm.status')}</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as typeof formData.status }))}
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="active">{t('users.statusActive')}</SelectItem>
                  <SelectItem value="suspended">{t('users.statusSuspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">{t('userForm.motherLanguage')}</Label>
              <Select 
                value={formData.motherLanguage} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, motherLanguage: v }))}
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh-cn">中文（简体）</SelectItem>
                  <SelectItem value="zh-tw">中文（繁體）</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">{t('userForm.learningLanguage')}</Label>
              <Select 
                value={formData.learningLanguage} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, learningLanguage: v }))}
              >
                <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh-cn">中文（简体）</SelectItem>
                  <SelectItem value="zh-tw">中文（繁體）</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">{t('userForm.proficiencyLevel')}</Label>
            <Select 
              value={formData.proficiencyLevel} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, proficiencyLevel: v }))}
            >
              <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="border-gray-200 text-gray-600"
            >
              {t('userForm.cancel')}
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('userForm.saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// Daily Limit Card Component
function DailyLimitCard({ 
  userId, 
  currentLimit, 
  onLimitUpdated 
}: { 
  userId: string; 
  currentLimit: number; 
  onLimitUpdated: (newLimit: number) => void;
}) {
  const t = useTranslations('admin');
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(currentLimit.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    const limitValue = parseInt(newLimit, 10);
    if (isNaN(limitValue) || limitValue < 1 || limitValue > 1000) {
      toast({ 
        title: t('toast.error'), 
        description: 'Daily limit must be between 1 and 1000', 
        variant: 'destructive' 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyLimit: limitValue }),
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: t('toast.success'), description: 'Daily limit updated successfully' });
        onLimitUpdated(limitValue);
        setIsEditing(false);
      } else {
        toast({ title: t('toast.error'), description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: t('toast.error'), description: 'Failed to update daily limit', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Daily Limit</h2>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Gauge className="w-5 h-5 text-gray-400" />
        <div className="flex-1">
          <p className="text-xs text-gray-500">Analyses per day</p>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min="1"
                max="1000"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-24 h-8 bg-white border-gray-200 text-gray-900"
              />
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSubmitting}
                className="h-8 bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setNewLimit(currentLimit.toString());
                }}
                className="h-8 text-gray-500"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 font-serif">{currentLimit}</p>
          )}
        </div>
      </div>
    </div>
  );
}
