import * as React from "react";
import { Home, BarChart3, Settings, PieChart, Users, DollarSign } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
  { month: "Jul", desktop: 180, mobile: 150 },
  { month: "Aug", desktop: 250, mobile: 170 },
  { month: "Sep", desktop: 220, mobile: 160 },
  { month: "Oct", desktop: 290, mobile: 200 },
  { month: "Nov", desktop: 320, mobile: 230 },
  { month: "Dec", desktop: 360, mobile: 260 },
];

const trafficData = [
  { channel: "Organic", visits: 1200 },
  { channel: "Paid", visits: 900 },
  { channel: "Referral", visits: 650 },
  { channel: "Social", visits: 780 },
  { channel: "Email", visits: 410 },
];

const revenueChartConfig: ChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2, 210 100% 56%))",
  },
};

const trafficChartConfig: ChartConfig = {
  visits: {
    label: "Visits",
    color: "hsl(var(--chart-3, 28 90% 54%))",
  },
};

function SidebarNav() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background/60 p-4 lg:block">
      <div className="mb-6 px-2">
        <div className="text-lg font-semibold tracking-tight">Acme Corp</div>
        <div className="text-xs text-muted-foreground">Admin Dashboard</div>
      </div>
      <nav aria-label="Sidebar" className="space-y-1">
        <a
          href="#overview"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-accent hover:text-accent-foreground"
        >
          <Home className="h-4 w-4" /> Overview
        </a>
        <a
          href="#analytics"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-accent hover:text-accent-foreground"
        >
          <BarChart3 className="h-4 w-4" /> Analytics
        </a>
        <a
          href="#settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-4 w-4" /> Settings
        </a>
      </nav>
      <div className="mt-8">
        <div className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shortcuts</div>
        <nav className="mt-2 space-y-1">
          <a
            href="#revenue"
            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Revenue
          </a>
          <a
            href="#traffic"
            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Traffic
          </a>
        </nav>
      </div>
    </aside>
  );
}

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />

      <main className="flex-1">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Key metrics and insights at a glance</p>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
          {/* KPI Cards */}
          <section id="overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$86,000</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,340</div>
                <p className="text-xs text-muted-foreground">+3.1% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.7%</div>
                <p className="text-xs text-muted-foreground">+0.5% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,208</div>
                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
              </CardContent>
            </Card>
          </section>

          {/* Revenue Area Chart */}
          <section id="analytics" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue (Desktop vs Mobile)</CardTitle>
                <CardDescription>Monthly revenue breakdown by device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer config={revenueChartConfig} className="h-full">
                    <ResponsiveContainer>
                      <AreaChart data={revenueData} margin={{ left: 12, right: 12 }}>
                        <defs>
                          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={40} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="desktop"
                          stroke="var(--color-desktop)"
                          fill="url(#fillDesktop)"
                          strokeWidth={2}
                          activeDot={{ r: 4 }}
                          name="Desktop"
                        />
                        <Area
                          type="monotone"
                          dataKey="mobile"
                          stroke="var(--color-mobile)"
                          fill="url(#fillMobile)"
                          strokeWidth={2}
                          activeDot={{ r: 4 }}
                          name="Mobile"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Channels Bar Chart */}
            <Card id="traffic" className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Traffic by Channel</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer config={trafficChartConfig} className="h-full">
                    <ResponsiveContainer>
                      <BarChart data={trafficData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="channel" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={40} />
                        <Tooltip />
                        <Bar dataKey="visits" radius={[6, 6, 0, 0]} fill="var(--color-visits)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
