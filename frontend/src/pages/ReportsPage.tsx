import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { downloadAnalyticsCsv, getAnalyticsReport } from "@/api/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOperationsRealtime } from "@/hooks/useOperationsRealtime";

export function ReportsPage() {
  useOperationsRealtime(); 
  const { data: report, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: getAnalyticsReport });
  
  async function exportCsv() { 
    try { 
      const csv = await downloadAnalyticsCsv(); 
      const url = URL.createObjectURL(csv); 
      const link = document.createElement("a"); 
      link.href = url; 
      link.download = "transitops-report.csv"; 
      link.click(); 
      URL.revokeObjectURL(url); 
      toast.success("CSV report downloaded"); 
    } catch (error) { 
      toast.error(error instanceof Error ? error.message : "Unable to export report"); 
    } 
  }
  
  const totalRevenue = report?.vehicles.reduce((sum, item) => sum + item.totalRevenue, 0) ?? 0; 
  const totalCost = report?.fleetSummary.totalOperationalCost ?? 0;
  
  const averageRoi = report?.vehicles.length ? report.vehicles.reduce((sum, item) => sum + item.roi, 0) / report.vehicles.length : 0;
  const overallRoi = totalCost > 0 ? (totalRevenue - totalCost) / totalCost : 0;

  // Sort vehicles by cost for the "TOP CONSUMER VEHICLES" chart
  const costSortedVehicles = report?.vehicles ? [...report.vehicles].sort((a, b) => b.operationalCost - a.operationalCost).slice(0, 3) : [];
  
  const customColors = ["#ef4444", "#f97316", "#334155"]; // Red, Orange, Slate

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">7. Reports & Analytics</h1>
        <Button onClick={exportCsv} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 shadow-md transition-colors" size="lg">
          Export CSV
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">AVG. FUEL EFFICIENCY</p>
            <p className="text-3xl font-bold">{isLoading ? "—" : `${report?.fleetSummary.avgFuelEfficiency ?? 0} km/L`}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">FLEET'S OPERATIONAL ROI</p>
            <p className="text-3xl font-bold">{isLoading ? "—" : `${(averageRoi * 100).toFixed(1)}%`}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">TOTAL OPERATIONAL COST</p>
            <p className="text-3xl font-bold">{isLoading ? "—" : `₹${totalCost.toLocaleString()}`}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-slate-700 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">OVERALL ROI</p>
            <p className="text-3xl font-bold">{isLoading ? "—" : `${(overallRoi * 100).toFixed(1)}%`}</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm font-medium text-muted-foreground">
        ROI = (Revenue - Total Operational Cost) / Total Operational Cost
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">REVENUE BY VEHICLE</h2>
          <Card className="shadow-sm border-muted">
            <CardContent className="pt-6">
              <div className="h-[300px]">
                {report?.vehicles.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.vehicles} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(value) => `₹${value / 1000}k`} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">TOP CONSUMING VEHICLES</h2>
          <Card className="shadow-sm border-muted">
            <CardContent className="pt-6">
              <div className="h-[300px]">
                {costSortedVehicles.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costSortedVehicles} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(value) => `₹${value / 1000}k`} />
                      <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#1e293b", fontWeight: 500 }} dx={-10} width={80} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Cost']} />
                      <Bar dataKey="operationalCost" radius={[0, 4, 4, 0]} barSize={24}>
                        {costSortedVehicles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={customColors[index % customColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Empty() { 
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      No completed-trip data yet.
    </div>
  ); 
}
