// FONDO ANIMADO — Login y Registro
// Usa la imagen de ZerCX como fondo con los orbes de color encima.
// Para cambiar la imagen, reemplaza fondo-zercx.png en la carpeta public/.
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Imagen de fondo ZerCX (cruces y estrellas) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/fondo-zercx.png')" }}
      />

      {/* Capa oscura semitransparente para que el texto sea legible */}
      <div className="absolute inset-0 bg-background/70" />

      {/* Orbe cian — esquina superior izquierda */}
      <div
        className="absolute rounded-full blur-[120px] opacity-15 animate-orb-1"
        style={{
          width: "500px",
          height: "500px",
          background: "hsl(var(--primary))",
          top: "-150px",
          left: "-150px",
        }}
      />

      {/* Orbe púrpura — esquina inferior derecha */}
      <div
        className="absolute rounded-full blur-[160px] opacity-10 animate-orb-2"
        style={{
          width: "600px",
          height: "600px",
          background: "hsl(270 80% 60%)",
          bottom: "-250px",
          right: "-150px",
        }}
      />
    </div>
  );
}
