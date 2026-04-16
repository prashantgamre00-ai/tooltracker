import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListLocations, useCreateLocation, useDeleteLocation, getListLocationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Trash2, Map, Building2, Navigation, Loader2 } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters."),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export default function LocationsList() {
  const { data: locations, isLoading } = useListLocations();
  const createLocation = useCreateLocation();
  const deleteLocation = useDeleteLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const getLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser", variant: "destructive" });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude);
        form.setValue("longitude", position.coords.longitude);
        toast({ title: "Location updated successfully" });
        setIsGettingLocation(false);
      },
      (error) => {
        toast({ title: "Failed to get location", description: error.message, variant: "destructive" });
        setIsGettingLocation(false);
      }
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createLocation.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Location created successfully" });
        queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() });
        setIsAddModalOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Failed to create location", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteLocation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Location deleted successfully" });
        queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete location", description: "Ensure there are no tools assigned to this location.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            Locations & Job Sites
          </h1>
          <p className="text-muted-foreground mt-1">Manage physical sites where tools are stored or used.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold">
              <Plus className="w-4 h-4" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-border">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>
                Create a new site or storage area to assign tools to.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Main Warehouse, Site B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123 Industrial Pkwy" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted p-4 rounded-lg border border-border mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Coordinates (Optional)</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={getLocation}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Navigation className="w-3 h-3 mr-2" />}
                      Detect
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any" 
                              className="font-mono text-xs h-8" 
                              placeholder="Latitude"
                              {...field}
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any" 
                              className="font-mono text-xs h-8" 
                              placeholder="Longitude"
                              {...field}
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createLocation.isPending}>
                    {createLocation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Location
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : locations?.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-lg">
          <Map className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No locations created yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Create locations to assign tools to specific job sites, vehicles, or storage areas.</p>
          <Button className="mt-6" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Your First Location
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations?.map((location) => (
            <Card key={location.id} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {location.name}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                    onClick={() => handleDelete(location.id)}
                    disabled={deleteLocation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-start gap-1 mt-2 line-clamp-2 min-h-[40px]">
                  {location.address || "No physical address provided."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground border-t border-border pt-3 mt-1 flex justify-between items-center">
                  <span>Added {format(new Date(location.createdAt), 'MMM d, yyyy')}</span>
                  {(location.latitude && location.longitude) && (
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> GPS Set
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}