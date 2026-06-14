'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Vendor {
  id: string;
  businessName: string;
  commission: number;
  onboardingStep: string;
  isVerified: boolean;
  createdAt: string;
  user: { name: string; email: string; phone: string };
  _count: { services: number };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const VERIFIED_FILTERS = ['ALL', 'PENDING', 'VERIFIED'] as const;

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('ALL');
  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());

  const fetchVendors = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (verifiedFilter === 'PENDING') params.isVerified = false;
      else if (verifiedFilter === 'VERIFIED') params.isVerified = true;
      const { data } = await adminApi.vendors(params);
      setVendors(data.vendors);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  }, [search, verifiedFilter]);

  useEffect(() => {
    fetchVendors(1);
  }, [fetchVendors]);

  useEffect(() => {
    const timer = setTimeout(() => fetchVendors(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleVerify = async (vendor: Vendor) => {
    setVerifyingIds((prev) => new Set(prev).add(vendor.id));
    try {
      await adminApi.verifyVendor(vendor.id);
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, isVerified: true } : v)));
      toast.success(`${vendor.businessName} verified successfully`);
    } catch {
      toast.error('Failed to verify vendor');
    } finally {
      setVerifyingIds((prev) => { const next = new Set(prev); next.delete(vendor.id); return next; });
    }
  };

  const handleVerifiedFilterChange = (filter: string) => {
    setVerifiedFilter(filter);
    fetchVendors(1);
  };

  const handlePageChange = (page: number) => {
    fetchVendors(page);
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
              <h1 className="text-3xl font-bold">Vendor Management</h1>
              <p className="text-muted-foreground mt-1">Manage and verify vendors on the platform</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by business name or owner..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  {VERIFIED_FILTERS.map((filter) => (
                    <Button
                      key={filter}
                      variant={verifiedFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVerifiedFilterChange(filter)}
                    >
                      {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vendors ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Business Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Owner Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Services</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Verified</th>
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
                    ) : vendors.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">No vendors found</p>
                            <p className="text-sm text-muted-foreground/60">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor, i) => (
                        <motion.tr
                          key={vendor.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium">{vendor.businessName}</span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{vendor.user.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{vendor.user.email}</td>
                          <td className="py-3 px-4 text-muted-foreground">{vendor.user.phone || '—'}</td>
                          <td className="py-3 px-4 text-center text-muted-foreground">{vendor._count.services}</td>
                          <td className="py-3 px-4">
                            <Badge variant={vendor.isVerified ? 'success' : 'warning'} className="text-xs">
                              {vendor.isVerified ? 'Verified' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                            {formatDate(vendor.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!vendor.isVerified && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerify(vendor)}
                                disabled={verifyingIds.has(vendor.id)}
                                className="text-emerald-600 border-emerald-600/30 hover:bg-emerald-500/10"
                              >
                                {verifyingIds.has(vendor.id) ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                <span className="ml-1.5">Verify</span>
                              </Button>
                            )}
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
