export function OnyxLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor" />
      <path d="M12 6L6 12L12 18L18 12L12 6Z" fill="var(--color-background)" />
    </svg>
  );
}
