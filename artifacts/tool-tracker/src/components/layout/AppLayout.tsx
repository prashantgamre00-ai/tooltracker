import { Link, useLocation } from "wouter";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Wrench, MapPin, LayoutDashboard, PlusCircle } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-border bg-sidebar h-full z-10 hidden md:flex flex-col">
          <SidebarHeader className="p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
              <Wrench className="w-6 h-6" />
              <span>TOOLTRACK</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/"}>
                  <Link href="/" className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/tools") && location !== "/tools/new"}>
                  <Link href="/tools" className="flex items-center gap-3">
                    <Wrench className="w-5 h-5" />
                    <span>Inventory</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/tools/new"}>
                  <Link href="/tools/new" className="flex items-center gap-3">
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Tool</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/locations")}>
                  <Link href="/locations" className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <span>Locations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 overflow-auto bg-background flex flex-col h-full w-full">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar sticky top-0 z-20">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <Wrench className="w-5 h-5" />
              <span>TOOLTRACK</span>
            </Link>
            <div className="flex items-center gap-2">
               <Link href="/tools/new" className="p-2 rounded-md hover:bg-muted text-foreground">
                  <PlusCircle className="w-5 h-5" />
               </Link>
               <Link href="/locations" className="p-2 rounded-md hover:bg-muted text-foreground">
                  <MapPin className="w-5 h-5" />
               </Link>
               <Link href="/tools" className="p-2 rounded-md hover:bg-muted text-foreground">
                  <Wrench className="w-5 h-5" />
               </Link>
            </div>
          </header>

          <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
