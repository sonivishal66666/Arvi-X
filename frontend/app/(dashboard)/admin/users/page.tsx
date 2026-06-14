'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Shield, ShieldOff } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'VENDOR' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  _count: { bookings: number };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ROLE_OPTIONS = ['ALL', 'USER', 'VENDOR', 'ADMIN'] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.role = roleFilter;
      const { data } = await adminApi.users(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (user: User) => {
    setTogglingIds((prev) => new Set(prev).add(user.id));
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
      toast.success(`User ${user.isActive ? 'banned' : 'activated'} successfully`);
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setTogglingIds((prev) => { const next = new Set(prev); next.delete(user.id); return next; });
    }
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    fetchUsers(1);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-1">Manage platform users and their access</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  {ROLE_OPTIONS.map((role) => (
                    <Button
                      key={role}
                      variant={roleFilter === role ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleRoleFilterChange(role)}
                    >
                      {role === 'ALL' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Users ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Bookings</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/20">
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="py-3 px-4">
                              <div className="h-4 bg-muted/50 rounded animate-pulse" style={{ width: j === 0 ? 140 : j === 7 ? 80 : 100 }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">No users found</p>
                            <p className="text-sm text-muted-foreground/60">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user, i) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium">{user.name}</span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                          <td className="py-3 px-4 text-muted-foreground">{user.phone || '—'}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                user.role === 'ADMIN' ? 'default' :
                                user.role === 'VENDOR' ? 'warning' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.isActive ? 'success' : 'destructive'} className="text-xs">
                              {user.isActive ? 'Active' : 'Banned'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center text-muted-foreground">{user._count.bookings}</td>
                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant={user.isActive ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleStatus(user)}
                              disabled={togglingIds.has(user.id)}
                            >
                              {togglingIds.has(user.id) ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : user.isActive ? (
                                <ShieldOff className="w-4 h-4" />
                              ) : (
                                <Shield className="w-4 h-4" />
                              )}
                              <span className="ml-1.5">{user.isActive ? 'Ban' : 'Activate'}</span>
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-[36px]"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
