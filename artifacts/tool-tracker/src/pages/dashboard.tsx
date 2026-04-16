import { useGetDashboardSummary, useGetToolsByLocation, useGetRecentTools } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { MapPin, Wrench, AlertTriangle, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: locationCounts, isLoading: loadingLocations } = useGetToolsByLocation();
  const { data: recentTools, isLoading: loadingRecent } = useGetRecentTools();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your tool inventory and locations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tools</CardTitle>
            <Wrench className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{summary?.totalTools || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Locations</CardTitle>
            <MapPin className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold">{summary?.totalLocations || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Active Site</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-xl font-bold truncate" title={summary?.mostActiveLocation || "N/A"}>
                {summary?.mostActiveLocation || "N/A"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Poor Condition</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold text-destructive">
                {summary?.toolsByCondition?.poor || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Location Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLocations ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : locationCounts?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No location data available.</p>
            ) : (
              <div className="space-y-4">
                {locationCounts?.map((loc) => (
                  <div key={loc.locationId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{loc.locationName}</span>
                    </div>
                    <Badge variant="secondary" className="font-mono">{loc.toolCount}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recently Added Tools</CardTitle>
            <Link href="/tools" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </CardHeader>
          <CardContent>
            {loadingRecent ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentTools?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tools added recently.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTools?.map((tool) => (
                    <TableRow key={tool.id} className="border-border">
                      <TableCell className="font-medium">{tool.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{tool.locationName || "Unassigned"}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={tool.condition === 'excellent' || tool.condition === 'good' ? 'default' : tool.condition === 'fair' ? 'secondary' : 'destructive'}
                          className="capitalize text-xs"
                        >
                          {tool.condition}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
