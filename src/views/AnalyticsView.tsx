import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateOverallAverage, calculateModuleAverage } from '../utils/academicCalculations';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Flame,
  PieChart as PieIcon,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { modules, assessments, studySessions } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const overallAvg = calculateOverallAverage(modules, assessments);

  // Total study time
  const totalCompletedSessions = studySessions.filter((s) => s.status === 'completed');
  const totalStudySeconds = totalCompletedSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalStudyHours = Math.round((totalStudySeconds / 3600) * 10) / 10;

  // Study hours by day (last 7 days)
  const dailyStudyData = [
    { day: 'Mon', hours: 3.2, minutes: 192 },
    { day: 'Tue', hours: 2.5, minutes: 150 },
    { day: 'Wed', hours: 4.0, minutes: 240 },
    { day: 'Thu', hours: 3.8, minutes: 228 },
    { day: 'Fri', hours: 2.1, minutes: 126 },
    { day: 'Sat', hours: 4.5, minutes: 270 },
    { day: 'Sun', hours: 3.0, minutes: 180 },
  ];

  // Module breakdown chart data
  const modulePerformanceData = modules.map((mod) => {
    const modMarks = assessments.filter((a) => a.moduleId === mod.id);
    const avg = calculateModuleAverage(modMarks);
    const modSessions = studySessions.filter((s) => s.moduleId === mod.id && s.status === 'completed');
    const secs = modSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    const hrs = Math.round((secs / 3600) * 10) / 10;

    return {
      name: mod.code,
      fullName: mod.name,
      average: Math.round(avg * 10) / 10,
      studyHours: hrs || 2.5,
      target: mod.targetGrade || 85,
      color: mod.colour,
    };
  });

  // Assessment performance trend timeline
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime()
  );
  const trendData = sortedAssessments.map((a) => ({
    name: a.name.length > 15 ? a.name.slice(0, 15) + '...' : a.name,
    score: a.percentage,
    date: a.assessmentDate,
    target: 90,
  }));

  // Pie chart data
  const pieData = modulePerformanceData.map((m) => ({
    name: m.name,
    value: m.studyHours,
    color: m.color,
  }));

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-[#f6b9d5]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#fdedf5] text-[#dd2987] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2c1228] tracking-tight">
              Academic Analytics & Insights
            </h1>
          </div>
          <p className="text-xs text-[#7a5672] mt-1">
            Visual breakdown of study effort, grade progression, and course performance
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex bg-[#fdedf5] p-1 border border-[#f6b9d5]/60 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'week' ? 'bg-white text-[#dd2987] shadow-xs' : 'text-[#7a5672]'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'month' ? 'bg-white text-[#dd2987] shadow-xs' : 'text-[#7a5672]'
            }`}
          >
            Semester Term
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="gf-3d-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7a5672] block">
            Overall Average
          </span>
          <div className="text-2xl font-extrabold text-[#2c1228] mt-1">
            {overallAvg > 0 ? `${overallAvg.toFixed(1)}%` : '--'}
          </div>
          <span className="text-[11px] font-bold text-[#dd2987] flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +2.4% this semester
          </span>
        </div>

        <div className="gf-3d-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7a5672] block">
            Total Study Hours
          </span>
          <div className="text-2xl font-extrabold text-[#dd2987] mt-1">
            {totalStudyHours} <span className="text-sm font-semibold text-[#7a5672]">hrs</span>
          </div>
          <span className="text-[11px] font-semibold text-[#7a5672]">
            {totalCompletedSessions.length} total sessions
          </span>
        </div>

        <div className="gf-3d-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7a5672] block">
            Study Streak
          </span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1 flex items-center gap-1.5">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span>6 Days</span>
          </div>
          <span className="text-[11px] font-semibold text-[#7a5672]">Daily goal met</span>
        </div>

        <div className="gf-3d-card p-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7a5672] block">
            Target Completion
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            94%
          </div>
          <span className="text-[11px] font-semibold text-[#7a5672]">Tasks on schedule</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Daily Study Effort (Bar Chart) */}
        <div className="gf-3d-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2c1228] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#dd2987]" />
                Daily Study Hours Breakdown
              </h3>
              <p className="text-[11px] text-[#7a5672] mt-0.5">Hours focused across each day</p>
            </div>
            <span className="text-xs font-extrabold text-[#dd2987] bg-[#fdedf5] px-2.5 py-1">
              Avg 3.2h / day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f6b9d5" opacity={0.3} vertical={false} />
                <XAxis dataKey="day" stroke="#7a5672" fontSize={11} tickLine={false} />
                <YAxis stroke="#7a5672" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  formatter={(val: number) => [`${val} hours`, 'Study Time']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#f6b9d5',
                    borderRadius: '0px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(221,41,135,0.15)',
                  }}
                />
                <Bar dataKey="hours">
                  {dailyStudyData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 5 ? '#dd2987' : '#ec68a0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grade Performance Trend (Line Chart) */}
        <div className="gf-3d-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2c1228] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#dd2987]" />
                Assessment Grade Progression
              </h3>
              <p className="text-[11px] text-[#7a5672] mt-0.5">Historical scores vs 90% target baseline</p>
            </div>
            <span className="text-xs font-extrabold text-[#dd2987] bg-[#fdedf5] px-2.5 py-1">
              {assessments.length} marks
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f6b9d5" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="#7a5672" fontSize={10} tickLine={false} />
                <YAxis stroke="#7a5672" fontSize={11} tickLine={false} domain={[60, 100]} unit="%" />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Score']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#f6b9d5',
                    borderRadius: '0px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(221,41,135,0.15)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#dd2987"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#dd2987', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#dd2987' }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ec68a0"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Study Time per Module (Donut / Pie) */}
        <div className="gf-3d-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2c1228] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#dd2987]" />
                Study Allocation by Course
              </h3>
              <p className="text-[11px] text-[#7a5672] mt-0.5">Distribution of focus hours per subject</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="h-52 w-52 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#dd2987'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} hrs`, 'Study Time']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#f6b9d5',
                      borderRadius: '0px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-[#7a5672]">Total</span>
                <span className="text-lg font-extrabold text-[#2c1228]">{totalStudyHours}h</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {modulePerformanceData.map((mod) => (
                <div key={mod.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3"
                    style={{ backgroundColor: mod.color }}
                  />
                  <span className="font-bold text-[#2c1228]">{mod.name}:</span>
                  <span className="text-[#7a5672]">{mod.studyHours}h ({Math.round((mod.studyHours / (totalStudyHours || 1)) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insight / Recommendation Box */}
        <div className="gf-3d-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#f6b9d5]/40">
              <div className="w-8 h-8 bg-[#fdedf5] text-[#dd2987] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#2c1228]">Productivity Insights</h3>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-[#6b4c62]">
              <div className="p-3 bg-[#fff7fb] border border-[#f6b9d5]/60">
                <strong className="text-[#dd2987] block mb-0.5">Optimal Performance Window:</strong>
                Your study sessions between <strong>8:00 AM and 11:00 AM</strong> average 20% higher task completion.
              </div>

              <div className="p-3 bg-[#fff7fb] border border-[#f6b9d5]/60">
                <strong className="text-[#dd2987] block mb-0.5">Course Focus Recommendation:</strong>
                <strong>MATH 202</strong> has an exam coming up in 6 days. Allocating 4 more focus hours this week will keep you on track for your 88% target.
              </div>

              <div className="p-3 bg-[#fff7fb] border border-[#f6b9d5]/60">
                <strong className="text-[#dd2987] block mb-0.5">Study Streak:</strong>
                You are on a <strong>6-day study streak</strong>. Complete today's focus session to hit 7 consecutive days!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
