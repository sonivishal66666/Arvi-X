'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, phone: user.phone || '' });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await userApi.updateProfile(form);
      setUser(data.user);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Update failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="pt-24 min-h-screen">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>

          <form onSubmit={handleSave} className="glass rounded-3xl p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="pl-10 glass border-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.email} disabled className="pl-10 glass border-white/10 opacity-60" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="pl-10 glass border-white/10" />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
