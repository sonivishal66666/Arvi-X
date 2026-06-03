'use client';

import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, ArrowRight, Zap, GraduationCap, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

const openings = [
  { id: '1', title: 'Senior AI Engineer', category: 'Engineering', location: 'Remote / Bangalore', type: 'Full-Time', salary: '₹35L - ₹50L', icon: Cpu },
  { id: '2', title: 'Lead UI/UX Designer', category: 'Design', location: 'Gurugram Office', type: 'Full-Time', salary: '₹22L - ₹32L', icon: Zap },
  { id: '3', title: 'Operations Lead - Dispatch', category: 'Operations', location: 'Mumbai HQ', type: 'Full-Time', salary: '₹18L - ₹25L', icon: Briefcase },
  { id: '4', title: 'Infrastructure Intern', category: 'Engineering', location: 'Gurugram Office', type: 'Internship', salary: '₹40K/month', icon: GraduationCap },
];

export default function CareersPage() {
  const handleApply = (title: string) => {
    toast.success(`Application portal initialized for ${title}!`);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-blue-500/10 top-10 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-cyan-500/10 bottom-10 -right-48" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Build the Future of Transit</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Careers at Arvis X
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Join an elite group of engineers, designers, and operators rewriting global transit infrastructure with clean design and neural networks.
          </p>
        </motion.div>

        {/* Job Listings */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6 text-white/90" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Open Positions</h2>
          {openings.map((job, i) => {
            const Icon = job.icon;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 rounded-[28px]">
                  <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 text-indigo-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{job.title}</h3>
                          <Badge variant="secondary" className="bg-white/5 border-white/5 text-white/70 text-[10px] uppercase font-semibold">{job.category}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400/80" /> {job.location}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-purple-400/80" /> {job.type}</span>
                          <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-400/80" /> {job.salary}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleApply(job.title)}
                      className="bg-white/5 hover:bg-white/10 text-white hover:text-white border border-white/10 rounded-2xl px-6 h-12 flex items-center justify-center font-semibold group self-stretch md:self-auto"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform text-indigo-400" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
