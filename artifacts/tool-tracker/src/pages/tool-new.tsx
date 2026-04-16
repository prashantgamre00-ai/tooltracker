import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateTool, useListLocations, getListToolsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navigation, Loader2, PlusCircle, Wrench } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
  locationId: z.coerce.number().min(1, "Location is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export default function ToolNew() {
  const [, setLocation] = useLocation();
  const { data: locations, isLoading: loadingLocations } = useListLocations();
  const createTool = useCreateTool();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      condition: "good",
      locationId: 0,
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
    createTool.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Tool added successfully" });
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setLocation("/tools");
      },
      onError: (err) => {
        toast({ title: "Failed to add tool", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <PlusCircle className="w-8 h-8 text-primary" />
          Add New Tool
        </h1>
        <p className="text-muted-foreground mt-1">Register a new tool into the inventory system.</p>
      </div>

      <Card className="border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tool Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. DeWalt 20V Max Drill" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Power Tools" className="bg-background" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Storage Location / Job Site</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ""}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations?.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                              {loc.name} {loc.address ? `(${loc.address})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description / Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Serial numbers, maintenance notes, etc." 
                          className="resize-none bg-background h-24" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-primary" />
                      GPS Coordinates
                    </h4>
                    <p className="text-xs text-muted-foreground">Optional: Tag the exact physical location of this tool.</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={getLocation}
                    disabled={isGettingLocation}
                    className="bg-background"
                  >
                    {isGettingLocation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                    Detect Location
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any" 
                            className="bg-background font-mono text-sm" 
                            placeholder="0.000000"
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
                        <FormLabel className="text-xs">Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any" 
                            className="bg-background font-mono text-sm" 
                            placeholder="0.000000"
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
            </CardContent>
            <CardFooter className="flex justify-end gap-4 border-t border-border pt-6 mt-4">
              <Button type="button" variant="ghost" onClick={() => setLocation("/tools")}>Cancel</Button>
              <Button type="submit" className="font-bold tracking-wide" disabled={createTool.isPending}>
                {createTool.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Tool
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}