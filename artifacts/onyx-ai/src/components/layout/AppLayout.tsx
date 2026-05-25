import { ReactNode, useState } from "react";
import { ChatSidebar } from "../chat/ChatSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-[300px] flex-shrink-0 border-r border-border h-full">
        <ChatSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[300px] border-r-border bg-sidebar text-sidebar-foreground">
          <ChatSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <div className="absolute top-4 left-4 z-20 lg:hidden">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
            className="rounded-full w-10 h-10 bg-background/80 backdrop-blur-md border-border shadow-sm"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
}
