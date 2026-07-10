import logoImg from "@assets/20260709_195203_0000_1783648474000.png";

interface OnyxLogoProps {
  className?: string;
}

export function OnyxLogo({ className = "w-12 h-12" }: OnyxLogoProps) {
  return (
    <img
      src={logoImg}
      alt="ZerOne"
      className={`object-contain animate-logo-glow rounded-xl ${className}`}
    />
  );
}
