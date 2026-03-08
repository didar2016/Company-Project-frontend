'use client';

import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  Clock, 
  MousePointerClick, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// --- Dummy Data ---

const dailyTraffic = [
  { date: 'Mon', users: 2400, sessions: 4000 },
  { date: 'Tue', users: 1398, sessions: 3000 },
  { date: 'Wed', users: 9800, sessions: 2000 },
  { date: 'Thu', users: 3908, sessions: 2780 },
  { date: 'Fri', users: 4800, sessions: 1890 },
  { date: 'Sat', users: 3800, sessions: 2390 },
  { date: 'Sun', users: 4300, sessions: 3490 },
];

const acquisitionData = [
  { source: 'Direct', value: 4000 },
  { source: 'Social', value: 3000 },
  { source: 'Organic', value: 2000 },
  { source: 'Referral', value: 2780 },
];

const pageViews = [
  { page: '/home', views: 12500 },
  { page: '/rooms', views: 8900 },
  { page: '/contact', views: 4200 },
  { page: '/about', views: 3100 },
  { page: '/booking', views: 2800 },
];

const deviceData = [
  { name: 'Desktop', value: 65, color: '#3b82f6' },
  { name: 'Mobile', value: 25, color: '#8b5cf6' },
  { name: 'Tablet', value: 10, color: '#f59e0b' },
];

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground">
          Real-time insights and performance metrics for your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3" /> +12%
              </span> 
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4m 32s</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-red-500 flex items-center mr-1">
                <ArrowDownRight className="h-3 w-3" /> -2.1%
              </span> 
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.5%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3" /> +4%
              </span> 
              <span className="ml-1">Improvement</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground mt-1">
              +201 since last hour
            </p>
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Traffic</CardTitle>
            <CardDescription>
              Daily active users over the past week.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTraffic}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Pages by Views</CardTitle>
            <CardDescription>
              Most visited pages across your website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pageViews.map((page, i) => (
                <div key={page.page} className="flex items-center">
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{page.page}</span>
                      <span className="text-sm text-muted-foreground">{page.views.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${(page.views / 15000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

      </div>

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Acquisition Channels</CardTitle>
            <CardDescription>Where your users are coming from.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={acquisitionData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="source" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={60}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Sessions by device type.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
              {deviceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full" 
                        style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sessions by Country</CardTitle>
            <CardDescription>Top locations (Realtime)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span>
                  <span className="text-sm font-medium">United States</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '45%' }} />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇬🇧</span>
                  <span className="text-sm font-medium">United Kingdom</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '12%' }} />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">12%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇩🇪</span>
                  <span className="text-sm font-medium">Germany</span>
                </div>
                 <div className="flex items-center gap-2">
                   <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '8%' }} />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">8%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇫🇷</span>
                  <span className="text-sm font-medium">France</span>
                </div>
                 <div className="flex items-center gap-2">
                   <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '6%' }} />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">6%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div> */}
    </div>
  );
}
