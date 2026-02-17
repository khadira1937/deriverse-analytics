'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  FileText,
  Settings,
  Zap,
  Shield,
  Orbit,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    desc: 'Comprehensive dashboard with equity curves, drawdown analysis, and performance metrics',
  },
  {
    icon: TrendingUp,
    title: 'Trade History',
    desc: 'Detailed trade logs with filtering, analysis, and export capabilities',
  },
  {
    icon: BookOpen,
    title: 'Trading Journal',
    desc: 'Document your setups, mistakes, and lessons learned to improve over time',
  },
  {
    icon: FileText,
    title: 'Smart Reports',
    desc: 'Generate professional reports with customizable date ranges and export formats',
  },
  {
    icon: Zap,
    title: 'Multi-Source Data',
    desc: 'Support for demo datasets, CSV imports, and on-chain Deriverse (Solana) wallet integration',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    desc: 'Your data stays with you. No private keys stored, read-only wallet connection',
  },
];

const stats = [
  { label: 'Max Trades Analyzed', value: '10K+' },
  { label: 'Supported Symbols', value: '500+' },
  { label: 'Export Formats', value: '3+' },
  { label: 'No Setup Required', value: 'Zero Config' },
];

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">Built for Deriverse</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 text-balance">
            Professional Trading Analytics
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              for Deriverse Traders
            </span>
          </h1>

          <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto text-balance">
            A comprehensive trading journal + portfolio analytics for active Deriverse traders.
            Track performance, analyze risk, and generate reports — privacy-first with read-only access.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-black w-full sm:w-auto">
                Enter Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                <Settings className="w-4 h-4" />
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="glass-panel border-white/10 p-4 text-center">
                <p className="text-2xl font-bold text-cyan-400">{stat.value}</p>
                <p className="text-xs text-white/60 mt-1">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 border-t border-white/10">
        <motion.div
          className="mx-auto max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-white/60">
              Comprehensive tools for serious traders who want to improve
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="glass-panel border-white/10 p-6 h-full group hover:border-cyan-400/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/60">{feature.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 border-t border-white/10">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to analyze your trading?
          </h2>
          <p className="text-white/60 mb-8">
            Start with our demo dataset or connect your own data. No installation required.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-black">
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Orbit className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white">Derivision</span>
            </div>
            <p className="text-sm text-white/60">
              Privacy-first trading analytics for Deriverse (on Solana).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
