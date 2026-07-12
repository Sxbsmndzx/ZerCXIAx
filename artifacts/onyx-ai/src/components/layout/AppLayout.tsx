// LAYOUT PRINCIPAL — envuelve todas las páginas internas
// Sidebar fijo en desktop, drawer (Sheet) en móvil.
// El contenido principal tiene animación de entrada estilo iOS.
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
      {/* Capa oscura para legibilidad */}
      <div className="absolute inset-0 bg-background/82 pointer-events-none z-0" />

      {/* Sidebar Desktop — glassmorphism */}
      <div className="hidden lg:flex w-[280px] flex-shrink-0 border-r border-border/60 h-full relative z-10 glass-panel animate-sidebar-in">
        <ChatSidebar />
      </div>

      {/* Sidebar Mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-r border-border/60 bg-sidebar/95 backdrop-blur-2xl text-sidebar-foreground">
          <ChatSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Área de contenido principal con animación de página */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        {/* Botón hamburguesa — solo móvil */}
        <div className="absolute top-4 left-4 z-20 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="rounded-full w-10 h-10 glass-panel border-border/50 shadow-md backdrop-blur-xl"
          >
            <Menu className="h-5 w-5" />
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
