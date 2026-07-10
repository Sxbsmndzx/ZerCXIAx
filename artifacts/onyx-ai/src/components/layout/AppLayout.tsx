// LAYOUT PRINCIPAL DEL CHAT
// Envuelve todas las páginas internas (chat, historial, configuración, etc.)
// Contiene el sidebar en desktop y el menú hamburguesa en móvil.
// El fondo usa la imagen ZerCX (public/fondo-zercx.png) con una capa oscura encima.
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
      {/* Capa oscura sobre la imagen para legibilidad */}
      <div className="absolute inset-0 bg-background/80 pointer-events-none z-0" />

      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-[300px] flex-shrink-0 border-r border-border h-full relative z-10">
        <ChatSidebar />
      </div>

      {/* Sidebar Mobile (drawer) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[300px] border-r-border bg-sidebar text-sidebar-foreground">
          <ChatSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        {/* Botón menú hamburguesa (solo móvil) */}
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
