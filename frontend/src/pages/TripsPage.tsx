export function TripsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Trip Management</h2>
        <p className="text-muted-foreground">Create, dispatch, complete, and cancel trips</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Trip lifecycle: Draft → Dispatched → Completed / Cancelled. API: <code>/api/trips</code>
      </p>
    </div>
  );
}
