interface VoiceAnimationProps {
  isListening: boolean;
}

export function VoiceAnimation({ isListening }: VoiceAnimationProps) {
  if (!isListening) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing rings */}
        <div className="relative flex items-center justify-center">
          {/* Ring 3 - outermost */}
          <div className="absolute rounded-full border border-primary/20 animate-ping-slow"
            style={{ width: "160px", height: "160px" }} />
          {/* Ring 2 */}
          <div className="absolute rounded-full border border-primary/30 animate-ping-medium"
            style={{ width: "120px", height: "120px" }} />
          {/* Ring 1 */}
          <div className="absolute rounded-full border border-primary/50 animate-ping-fast"
            style={{ width: "88px", height: "88px" }} />
          {/* Center button */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.6)]">
            <svg className="w-7 h-7 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
            </svg>
          </div>
        </div>

        {/* Sound bars */}
        <div className="flex items-end gap-1 h-10">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-primary rounded-full animate-sound-bar"
              style={{
                animationDelay: `${i * 80}ms`,
                animationDuration: `${600 + (i % 3) * 150}ms`,
              }}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-lg">Escuchando...</p>
          <p className="text-white/60 text-sm mt-1">Toca para detener</p>
        </div>

        <button
          className="px-6 py-2.5 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
