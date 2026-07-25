// LAYOUT PRINCIPAL — Sidebar fijo en desktop, drawer en móvil.
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
    <div
      className="flex h-[100dvh] text-foreground overflow-hidden relative"
      style={{
        backgroundImage: "url('/fondo-zercx.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Capa de fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-background/84 pointer-events-none z-0" />
      {/* Gradiente decorativo en esquinas */}
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-primary/3 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[250px] bg-primary/2 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-[272px] flex-shrink-0 h-full relative z-10 animate-sidebar-in sidebar-gradient-border">
        <ChatSidebar />
      </div>

      {/* Sidebar Mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[272px] border-r border-border/50 bg-sidebar/96 backdrop-blur-2xl text-sidebar-foreground"
        >
          <ChatSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        {/* Botón hamburguesa — solo móvil */}
        <div className="absolute top-3.5 left-4 z-20 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="rounded-full w-9 h-9 glass-panel border-border/40 shadow-lg backdrop-blur-xl hover:border-primary/30 transition-all"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido con fade-slide de entrada */}
        <div className="flex-1 overflow-hidden relative animate-page-in">
          {children}
        </div>
      </div>
    </div>
  );
}
