import { SiteText } from './SiteText';
import React from 'react';
import { ContentStatus, TimeStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'time' | 'platform' | 'demo' | 'award';
  status?: ContentStatus;
  timeStatus?: TimeStatus;
  platform?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'status',
  status,
  timeStatus,
  platform,
  className = '',
}) => {
  if (variant === 'demo') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
        <SiteText id="Badge.extra1" /></span>
    );
  }

  if (variant === 'time' && timeStatus) {
    if (timeStatus === 'ongoing') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping"></span>
          <SiteText id="Badge.extra2" /></span>
      );
    }
    if (timeStatus === 'upcoming') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
          <SiteText id="Badge.extra3" /></span>
      );
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
        <SiteText id="Badge.extra4" /></span>
    );
  }

  if (variant === 'status' && status) {
    if (status === 'published') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-300 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
          <SiteText id="Badge.extra5" /></span>
      );
    }
    if (status === 'draft') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-300 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          <SiteText id="Badge.extra6" /></span>
      );
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
        <SiteText id="Badge.extra7" /></span>
    );
  }

  if (variant === 'platform' && platform) {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-600 text-white shadow-sm ${className}`}>
          <SiteText id="Badge.extra8" /></span>
      );
    }
    if (p.includes('tiktok')) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-black text-white shadow-sm ${className}`}>
          <SiteText id="Badge.extra9" /></span>
      );
    }
    if (p.includes('youtube')) {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-600 text-white shadow-sm ${className}`}>
          <SiteText id="Badge.extra10" /></span>
      );
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-700 text-white shadow-sm ${className}`}>
        {platform}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 ${className}`}>
      {children}
    </span>
  );
};
