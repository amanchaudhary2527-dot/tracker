import React from 'react';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-3xl font-bold font-sans text-slate-900 dark:text-white mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-100/50 dark:border-slate-800">
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/60 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {subtitle}
        </span>
        {trend && (
          <span
            className={`font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  );
};
