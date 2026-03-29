'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ posts: 0, regencies: 0, hashtags: 0 });
  const [globalStats, setGlobalStats] = useState({ views: 0, likes: 0, saves: 0 });
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [topAds, setTopAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, regenciesRes, hashtagsRes] = await Promise.all([
          fetch('/api/posts?admin=true'),
          fetch('/api/regencies'),
          fetch('/api/hashtags')
        ]);
        const posts = await postsRes.json();
        const regencies = await regenciesRes.json();
        const hashtags = await hashtagsRes.json();
        
        setStats({ 
          posts: Array.isArray(posts) ? posts.length : 0, 
          regencies: Array.isArray(regencies) ? regencies.length : 0, 
          hashtags: Array.isArray(hashtags) ? hashtags.length : 0 
        });

        if (Array.isArray(posts)) {
          // Calculate global stats for ENTIRE archive
          const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
          const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
          const totalSaves = posts.reduce((acc, p) => acc + (p.saves || 0), 0);
          setGlobalStats({ views: totalViews, likes: totalLikes, saves: totalSaves });

          // Sort by views desc for top posts display (showing all items) separated by type
          const sortedPosts = [...posts].filter(p => !p.isAd).sort((a, b) => (b.views || 0) - (a.views || 0));
          const sortedAds = [...posts].filter(p => !!p.isAd).sort((a, b) => (b.views || 0) - (a.views || 0));
          setTopPosts(sortedPosts);
          setTopAds(sortedAds);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Prepare chart data for 5 different lines (top 5 posts)
  // Prepare chart data function for dynamic arrays
  const getChartData = (targetList: any[]) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIndex = new Date().getDay();
    const adjustedIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
    
    const labels = days.slice(0, adjustedIndex + 1);
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];
    const targetPosts = targetList.slice(0, 5);
    
    const datasets = targetPosts.map((post, index) => {
      const currentViews = post.views || 0;
      const createdAt = new Date(post.createdAt);
      const createdDayIndex = createdAt.getDay();
      const adjustedCreatedIndex = createdDayIndex === 0 ? 6 : createdDayIndex - 1;
      
      const dataPoints = [];
      const totalPoints = adjustedIndex + 1;
      
      for (let i = 0; i < totalPoints; i++) {
        if (i < adjustedCreatedIndex) {
          dataPoints.push(0);
        } else if (i === totalPoints - 1) {
          dataPoints.push(currentViews);
        } else {
          const totalLifeSpanDays = (totalPoints - 1) - adjustedCreatedIndex;
          if (totalLifeSpanDays <= 0) {
            dataPoints.push(0);
          } else {
            const currentDayProgress = i - adjustedCreatedIndex;
            const ratio = (currentDayProgress + 1) / (totalLifeSpanDays + 1);
            dataPoints.push(Math.floor(currentViews * ratio));
          }
        }
      }

      return {
        label: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title,
        data: dataPoints,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 3.5,
        fill: false,
      };
    });

    return { labels, datasets };
  };

  const chartDataRegular = useMemo(() => getChartData(topPosts), [topPosts]);
  const chartDataAds = useMemo(() => getChartData(topAds), [topAds]);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 10, weight: 700 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 12, weight: 800 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true, color: 'rgba(0,0,0,0.03)' },
        ticks: { color: '#a1a1aa', font: { weight: 700, size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { weight: 600, size: 10 } }
      }
    },
  };

  if (status === 'loading' || loading) return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-[10px] font-black tracking-[0.2em] uppercase">Syncing Archive</p>
      </div>
    </div>
  );

  const renderLeaderboard = (title: string, subtitle: string, items: any[]) => (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-2">{title}</h2>
          <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">{subtitle}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100/50">
              <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rank</th>
              <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Content Mapping</th>
              <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">KPI Metrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100/50">
            {items.length > 0 ? items.map((post, idx) => (
              <tr key={post.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-10 py-6">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black ${
                    idx === 0 ? 'bg-amber-500 text-white' : 
                    idx === 1 ? 'bg-zinc-900 text-white' : 
                    idx === 2 ? 'bg-zinc-200 text-zinc-600' : 
                    'bg-zinc-100 text-zinc-400'
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-gray-200 relative transition-all">
                      {post.images?.[0] ? (
                        post.images[0].type === 'VIDEO' ? (
                          <div className="w-full h-full relative">
                            <video src={post.images[0].url} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" muted loop autoPlay playsInline />
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        ) : (
                          <img src={post.images[0].url} alt="" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" />
                        )
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <Link 
                        href={`/?post=${post.slug}`}
                        target="_blank"
                        className="font-bold text-zinc-900 text-base truncate hover:text-amber-500 transition-colors tracking-tight flex items-center gap-1.5"
                      >
                        {post.title}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </Link>
                      <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mt-0.5">{post.regency?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-40 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min(100, (post.views / (items[0]?.views || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[15px] font-black text-zinc-900 tabular-nums leading-none tracking-tighter">{post.views || 0}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reach</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span className="text-[11px] font-black text-zinc-500">{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        <span className="text-[11px] font-black text-zinc-500">{post.saves || 0}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-10 py-24 text-center text-zinc-400 font-medium italic">Establishing digital footprint...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl animate-in fade-in duration-500">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-1">Bali Archive Dashboard</h1>
          <p className="text-zinc-400 font-medium">Monitoring the pulse of Bali&apos;s digital archives</p>
        </div>
        <Link 
          href="/admin/posts/new" 
          className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 text-white font-bold text-sm hover:bg-black transition-all active:scale-[0.98] rounded-xl"
        >
          Add Destination
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Regular Posts Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight leading-none mb-1">Regular Content Forecast</h2>
                <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">7-Day trending signals per top posting</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest">Organic Feed</span>
            </div>
            <div className="h-[320px] w-full">
              {topPosts.length > 0 ? (
                <Line data={chartDataRegular} options={chartOptions as any} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  <p className="text-sm font-bold text-zinc-400 italic">Awating data signals...</p>
                  <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Views will appear once visitors explore the feed</p>
                </div>
              )}
            </div>
          </div>

          {/* Ads Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-zinc-900 tracking-tight leading-none mb-1">Advertisement Growth</h2>
                <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">7-Day trending signals for sponsors</p>
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">Sponsored Feed</span>
            </div>
            <div className="h-[320px] w-full">
              {topAds.length > 0 ? (
                <Line data={chartDataAds} options={chartOptions as any} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  <p className="text-sm font-bold text-zinc-400 italic">Awating sponsor data...</p>
                  <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Ad growth will be tracked here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-7 bg-white rounded-2xl border border-gray-200 flex flex-col justify-center relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Public Destinations</p>
              <h3 className="text-4xl font-black text-zinc-900 tracking-tight">{stats.posts}</h3>
              <div className="mt-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{stats.regencies} Regencies</span>
              </div>
            </div>
          </div>
          <div className="p-7 bg-white rounded-2xl border border-gray-200 flex flex-col justify-center">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Digital Reach</p>
            <h3 className="text-4xl font-black text-zinc-900 tracking-tight">{globalStats.views}</h3>
            <div className="mt-4 flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] tracking-widest uppercase">
              Total Impression Accumulation
            </div>
          </div>
          <div className="p-7 bg-white rounded-2xl border border-gray-200 flex flex-col justify-center">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">User Engagement</p>
            <div className="flex items-center gap-8 mt-1">
              <div>
                <span className="text-2xl font-black text-zinc-900">{globalStats.likes}</span>
                <span className="text-[10px] font-bold text-zinc-400 ml-2 tracking-widest uppercase">Likes</span>
              </div>
              <div className="w-px h-8 bg-black/5"></div>
              <div>
                <span className="text-2xl font-black text-zinc-900">{globalStats.saves}</span>
                <span className="text-[10px] font-bold text-zinc-400 ml-2 tracking-widest uppercase">Saves</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-16">
        {renderLeaderboard("Regular Content Leaderboard", "Top converting organic items in the archive", topPosts)}
        {renderLeaderboard("Advertisement Leaderboard", "Top converting sponsored campaigns", topAds)}
      </div>
    </div>
  );
}
