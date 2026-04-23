import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";




const trafficData = [
  { month: "Jan", visitors: 186, signups: 80 },
  { month: "Feb", visitors: 305, signups: 120 },
  { month: "Mar", visitors: 237, signups: 98 },
  { month: "Apr", visitors: 73, signups: 30 },
  { month: "May", visitors: 209, signups: 110 },
  { month: "Jun", visitors: 214, signups: 95 },
  { month: "Jul", visitors: 256, signups: 105 },
  { month: "Aug", visitors: 298, signups: 130 },
  { month: "Sep", visitors: 244, signups: 102 },
  { month: "Oct", visitors: 312, signups: 150 },
  { month: "Nov", visitors: 280, signups: 125 },
  { month: "Dec", visitors: 330, signups: 170 }
];








const salesData = [
  { month: "Jan", sales: 1200 },
  { month: "Feb", sales: 1800 },
  { month: "Mar", sales: 1500 },
  { month: "Apr", sales: 900 },
  { month: "May", sales: 1600 },
  { month: "Jun", sales: 1750 },
  { month: "Jul", sales: 1900 },
  { month: "Aug", sales: 2100 },
  { month: "Sep", sales: 1700 },
  { month: "Oct", sales: 2200 },
  { month: "Nov", sales: 2000 },
  { month: "Dec", sales: 2500 }
];

export default function Dashboard() {
  const trafficChartConfig = React.useMemo(
    () => ({
      visitors: { label: "Visitors", color: "#3b82f6" },
      signups: { label: "Signups", color: "#10b981" }
    }),
    []
  );

  const salesChartConfig = React.useMemo(
    () => ({
      sales: { label: "Sales", color: "#a855f7" }
    }),
    []
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-card/30 p-4 lg:block">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-semibold">My Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview & reports</p>
        </div>
        <nav className="space-y-1">
          <Link
            to="#overview"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Overview
          </Link>
          <Link
            to="#traffic"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Traffic
          </Link>
          <Link
            to="#sales"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Sales
          </Link>
          <Link
            to="#settings"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Settings
          </Link>
          <Link
            to="/"
            className="mt-4 block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Back to Home
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 id="overview" className="text-2xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Key metrics and charts for your product.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{trafficData.reduce((acc, d) => acc + d.visitors, 0)}</div>
              <p className="text-xs text-muted-foreground">Year to date</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{trafficData.reduce((acc, d) => acc + d.signups, 0)}</div>
              <p className="text-xs text-muted-foreground">Year to date</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${salesData.reduce((acc, d) => acc + d.sales, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Year to date</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Traffic chart */}
          <Card>
            <CardHeader>
              <CardTitle id="traffic">Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[360px]">
              <ChartContainer config={trafficChartConfig} className="h-full w-full">
                <LineChart data={trafficData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="4 4" className="stroke-border/50" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} dy={8} />
                  <YAxis tickLine={false} axisLine={false} dx={-8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="var(--color-visitors)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke="var(--color-signups)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Sales chart */}
          <Card>
            <CardHeader>
              <CardTitle id="sales">Sales by Month</CardTitle>
            </CardHeader>
            <CardContent className="h-[360px]">
              <ChartContainer config={salesChartConfig} className="h-full w-full">
                <BarChart data={salesData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="4 4" className="stroke-border/50" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} dy={8} />
                  <YAxis tickLine={false} axisLine={false} dx={-8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
