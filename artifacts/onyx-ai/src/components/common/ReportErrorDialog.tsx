import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Mail, Send } from "lucide-react";

const SUPPORT_EMAIL = "Onyxaisupport@gmail.com";

const ERROR_TYPES = [
  "El chat no responde o tarda demasiado",
  "Error al cargar el historial",
  "Problema con el inicio de sesión",
  "Respuesta incorrecta de la IA",
  "Problema con la configuración",
  "Error visual o de diseño",
  "Otro problema",
];

interface ReportErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportErrorDialog({ open, onOpenChange }: ReportErrorDialogProps) {
  const [errorType, setErrorType] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    const subject = encodeURIComponent(`[Onyx AI] Reporte de error: ${errorType || "Problema general"}`);
    const body = encodeURIComponent(
      `TIPO DE PROBLEMA:\n${errorType || "No especificado"}\n\n` +
      `DESCRIPCIÓN:\n${description || "No proporcionada"}\n\n` +
      `PASOS PARA REPRODUCIRLO:\n${steps || "No especificados"}\n\n` +
      `---\nEnviado desde Onyx AI`
    );
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setErrorType("");
      setDescription("");
      setSteps("");
      setSent(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Informar un error
          </DialogTitle>
          <DialogDescription>
            Cuéntanos qué pasó y te ayudaremos. Tu reporte se enviará a{" "}
            <span className="font-medium text-primary">{SUPPORT_EMAIL}</span>.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">¡Reporte preparado!</h3>
              <p className="text-sm text-muted-foreground">
                Se abrió tu aplicación de correo con el mensaje listo. Solo envíalo y nuestro equipo lo revisará.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">Cerrar</Button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>Tipo de problema</Label>
              <Select value={errorType} onValueChange={setErrorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de error..." />
                </SelectTrigger>
                <SelectContent>
                  {ERROR_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del problema</Label>
              <Textarea
                id="description"
                placeholder="Describe qué sucedió con el mayor detalle posible..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps">Pasos para reproducirlo (opcional)</Label>
              <Textarea
                id="steps"
                placeholder="1. Abrí el chat&#10;2. Escribí un mensaje&#10;3. Apareció el error..."
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
              <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
              <span>Se abrirá tu app de correo con el mensaje ya redactado para <strong className="text-foreground">{SUPPORT_EMAIL}</strong></span>
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={!errorType && !description}
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                Redactar correo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
