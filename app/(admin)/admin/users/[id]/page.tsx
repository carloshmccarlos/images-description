'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Image as ImageIcon
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

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'suspended';
  role: 'user' | 'admin' | 'super_admin';
  motherLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
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
          setUser(data.data.user);
          setStats(data.data.stats);
          setRecentAnalyses(data.data.recentAnalyses || []);
        } else {
          toast({ title: 'Error', description: data.error, variant: 'destructive' });
          if (data.error === 'User not found') {
            router.push('/admin/users');
          }
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to fetch user details', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserDetail();
  }, [userId, router, toast]);

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
          title: 'Success', 
          description: `User ${action === 'suspend' ? 'suspended' : 'reactivated'} successfully` 
        });
        setUser(prev => prev ? { ...prev, status: data.data.status } : null);
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
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
        toast({ title: 'Success', description: 'User deleted successfully' });
        router.push('/admin/users');
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: 'English', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
      es: 'Spanish', fr: 'French', de: 'German',
    };
    return languages[code] || code;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-zinc-400">User not found</p>
        <Link href="/admin/users">
          <Button className="mt-4">Back to Users</Button>
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
        <Link href="/admin/users" className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name || 'Unnamed User'}</h1>
              <p className="text-zinc-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                  {user.role.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
              className="border-[#2a2a2e] text-zinc-300 hover:text-white"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            {user.status === 'active' ? (
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange('suspend')}
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <Ban className="w-4 h-4 mr-2" />
                Suspend
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleStatusChange('reactivate')}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Reactivate
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(true)}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#141416] border border-[#2a2a2e] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">User Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="text-zinc-300">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Name</p>
                    <p className="text-zinc-300">{user.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Joined</p>
                    <p className="text-zinc-300">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#141416] border border-[#2a2a2e] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Language Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Mother Language</p>
                    <p className="text-zinc-300">{getLanguageName(user.motherLanguage)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Learning Language</p>
                    <p className="text-zinc-300">{getLanguageName(user.learningLanguage)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Proficiency Level</p>
                    <p className="text-zinc-300 capitalize">{user.proficiencyLevel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#141416] border border-[#2a2a2e] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs">Total Analyses</span>
                  </div>
                  <p className="text-2xl font-bold text-white font-serif">{stats.totalAnalyses}</p>
                </div>
                <div className="bg-[#141416] border border-[#2a2a2e] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs">Words Learned</span>
                  </div>
                  <p className="text-2xl font-bold text-white font-serif">{stats.totalWordsLearned}</p>
                </div>
                <div className="bg-[#141416] border border-[#2a2a2e] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">Current Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-white font-serif">{stats.currentStreak} days</p>
                </div>
                <div className="bg-[#141416] border border-[#2a2a2e] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Last Activity</span>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {stats.lastActivityDate 
                      ? new Date(stats.lastActivityDate).toLocaleDateString() 
                      : 'Never'}
                  </p>
                </div>
              </div>
            )}

            {/* Recent Analyses */}
            <div className="bg-[#141416] border border-[#2a2a2e] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Analyses</h2>
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No analyses yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentAnalyses.map((analysis) => (
                    <div 
                      key={analysis.id}
                      className="bg-[#0a0a0b] border border-[#2a2a2e] rounded-lg overflow-hidden hover:border-[#3a3a3e] transition-colors"
                    >
                      <div className="aspect-video relative bg-zinc-900">
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
                        <p className="text-sm text-zinc-300 line-clamp-2">{analysis.description}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                          <span>{analysis.vocabularyCount} words</span>
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
        <DialogContent className="bg-[#141416] border-[#2a2a2e] text-white">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete <span className="text-white font-medium">{user.email}</span>? 
              This action cannot be undone and will remove all their data including {stats?.totalAnalyses || 0} analyses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-[#2a2a2e] text-zinc-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete User
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
        toast({ title: 'Success', description: 'User updated successfully' });
        onSuccess({
          ...user,
          ...formData,
          name: formData.name || null,
        });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141416] border-[#2a2a2e] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-400" />
            Edit User
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update user information and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-zinc-300">Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-[#0a0a0b] border-[#2a2a2e] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-zinc-300">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#0a0a0b] border-[#2a2a2e] text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, role: v as typeof formData.role }))}
              >
                <SelectTrigger className="bg-[#0a0a0b] border-[#2a2a2e] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141416] border-[#2a2a2e]">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as typeof formData.status }))}
              >
                <SelectTrigger className="bg-[#0a0a0b] border-[#2a2a2e] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141416] border-[#2a2a2e]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Mother Language</Label>
              <Select 
                value={formData.motherLanguage} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, motherLanguage: v }))}
              >
                <SelectTrigger className="bg-[#0a0a0b] border-[#2a2a2e] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141416] border-[#2a2a2e]">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Learning Language</Label>
              <Select 
                value={formData.learningLanguage} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, learningLanguage: v }))}
              >
                <SelectTrigger className="bg-[#0a0a0b] border-[#2a2a2e] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141416] border-[#2a2a2e]">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Proficiency Level</Label>
            <Select 
              value={formData.proficiencyLevel} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, proficiencyLevel: v }))}
            >
              <SelectTrigger className="bg-[#0a0a0b] border-[#2a2a2e] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141416] border-[#2a2a2e]">
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
              className="border-[#2a2a2e] text-zinc-400"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
