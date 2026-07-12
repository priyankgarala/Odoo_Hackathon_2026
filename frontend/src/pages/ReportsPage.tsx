export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Fuel efficiency, operational cost, and vehicle ROI</p>
      </div>
      <p className="text-sm text-muted-foreground">
        APIs: <code>/api/reports/analytics</code> and <code>/api/reports/export/csv</code>
      </p>
    </div>
  );
}
