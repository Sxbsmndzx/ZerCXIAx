import crossesImg from "@assets/566f68f4dabb6782b24f5c55bef77f34_1779830133528.jpg";
import lotusImg from "@assets/c0a65bac877a406139806ccfc5f34f4e_1779830133552.jpg";

interface OnyxLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function OnyxLogo({ className = "", size = "md" }: OnyxLogoProps) {
  const sizes = {
    sm: { crosses: "w-8 h-8", lotus: "w-10 h-10", wrapper: "w-8 h-10" },
    md: { crosses: "w-12 h-12", lotus: "w-14 h-14", wrapper: "w-12 h-14" },
    lg: { crosses: "w-20 h-20", lotus: "w-24 h-24", wrapper: "w-20 h-24" },
    xl: { crosses: "w-32 h-32", lotus: "w-36 h-36", wrapper: "w-32 h-40" },
  };

  const s = sizes[size];

  return (
    <div className={`relative flex flex-col items-center justify-end ${s.wrapper} ${className}`}>
      {/* Animated lotus — behind and below */}
      <img
        src={lotusImg}
        alt=""
        className={`absolute bottom-0 ${s.lotus} object-contain opacity-70 animate-lotus`}
        aria-hidden
      />
      {/* 3 diamond crosses — on top */}
      <img
        src={crossesImg}
        alt="Onyx"
        className={`relative z-10 ${s.crosses} object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] animate-crosses-shimmer`}
      />
    </div>
  );
}

/* Simpler version for tiny icon use (sidebar avatar, favicon spot) */
export function OnyxLogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src={crossesImg}
      alt="Onyx"
      className={`${className} object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
    />
  );
}
