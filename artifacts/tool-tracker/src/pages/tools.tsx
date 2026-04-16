import { useState } from "react";
import { useListTools, useDeleteTool, getListToolsQueryKey, useListLocations, useUpdateTool } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Search, MapPin, Wrench, AlertTriangle, Trash2, CalendarDays, Filter } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Tool } from "@workspace/api-client-react";

export default function ToolsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [locationId, setLocationId] = useState<string>("_all");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const { data: tools, isLoading } = useListTools({ 
    search: debouncedSearch || undefined, 
    locationId: locationId !== "_all" ? Number(locationId) : undefined 
  });
  
  const { data: locations } = useListLocations();
  const deleteTool = useDeleteTool();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const timeoutId = setTimeout(() => setDebouncedSearch(e.target.value), 300);
    return () => clearTimeout(timeoutId);
  };

  const handleDelete = (id: number) => {
    deleteTool.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Tool deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setSelectedTool(null);
      },
      onError: () => {
        toast({ title: "Failed to delete tool", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Wrench className="w-8 h-8 text-primary" />
          Tool Inventory
        </h1>
        <p className="text-muted-foreground mt-1">Manage and track all tools across locations.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tools by name, category, or description..." 
            className="pl-9 bg-card border-border"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="bg-card border-border">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="All Locations" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Locations</SelectItem>
              {locations?.map(loc => (
                <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tools?.length === 0 ? (
        <div className="text-center py-12 bg-card border border-dashed border-border rounded-lg">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No tools found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tools?.map((tool) => (
            <Dialog key={tool.id} open={selectedTool?.id === tool.id} onOpenChange={(open) => !open && setSelectedTool(null)}>
              <DialogTrigger asChild>
                <Card 
                  className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTool(tool)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{tool.name}</CardTitle>
                      <Badge 
                        variant={tool.condition === 'excellent' || tool.condition === 'good' ? 'default' : tool.condition === 'fair' ? 'secondary' : 'destructive'}
                        className="capitalize"
                      >
                        {tool.condition}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {tool.locationName || "Unassigned"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="font-mono bg-muted px-2 py-1 rounded">{tool.category || 'Uncategorized'}</span>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-border">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" />
                    {selectedTool?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Tool ID: {selectedTool?.id}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</span>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{selectedTool?.locationName}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Condition</span>
                      <div className="flex items-center gap-2">
                        {selectedTool?.condition === 'poor' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        <Badge 
                          variant={selectedTool?.condition === 'excellent' || selectedTool?.condition === 'good' ? 'default' : selectedTool?.condition === 'fair' ? 'secondary' : 'destructive'}
                          className="capitalize"
                        >
                          {selectedTool?.condition}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</span>
                      <div className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block w-fit">
                        {selectedTool?.category || 'None'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Added On</span>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        {selectedTool?.createdAt ? format(new Date(selectedTool.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</span>
                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md border border-border">
                      {selectedTool?.description || "No description provided."}
                    </p>
                  </div>
                  
                  {(selectedTool?.latitude && selectedTool?.longitude) && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Coordinates</span>
                      <p className="text-sm font-mono text-muted-foreground">
                        {selectedTool.latitude.toFixed(6)}, {selectedTool.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between items-center border-t border-border pt-4 mt-2">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => selectedTool?.id && handleDelete(selectedTool.id)}
                    disabled={deleteTool.isPending}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Tool
                  </Button>
                  {/* Note: Update logic would go here if editing was supported inside the modal */}
                  <Button type="button" variant="outline" onClick={() => setSelectedTool(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}