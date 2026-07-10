// LOGO DE ZERCX AI
// Componente del logo con efecto de brillo animado.
// Importa la imagen en @assets/ para cambiar el logo.
import logoImg from "@assets/20260709_200824_0000_1783649408835.png";

interface LogoZerCXProps {
  className?: string;
}

export function OnyxLogo({ className = "w-12 h-12" }: LogoZerCXProps) {
  return (
    <img
      src={logoImg}
      alt="ZerCX AI"
      className={`object-contain animate-logo-glow rounded-xl ${className}`}
    />
  );
}
