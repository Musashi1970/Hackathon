export function PetpoojaVaniLogo({ size = 32, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) {
  const brandColor = "#CF1F2E"
  const neutralColor = variant === "dark" ? "#FFFFFF" : "#64748B"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Petpooja Vani logo"
    >
      {/* Background circle */}
      <rect width="40" height="40" rx="10" fill={brandColor} />

      {/* Interlocking loops - inspired by Petpooja, shaped like a speech/voice waveform */}
      {/* Left loop */}
      <path
        d="M12 20C12 16 14.5 13 18 13C21.5 13 23 15.5 23 18C23 20.5 21 22 19 22"
        stroke={neutralColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right loop */}
      <path
        d="M28 20C28 24 25.5 27 22 27C18.5 27 17 24.5 17 22C17 19.5 19 18 21 18"
        stroke={neutralColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Voice wave dots */}
      <circle cx="31" cy="16" r="1.5" fill={neutralColor} opacity="0.8" />
      <circle cx="33" cy="20" r="1.5" fill={neutralColor} opacity="0.5" />
      <circle cx="31" cy="24" r="1.5" fill={neutralColor} opacity="0.8" />
    </svg>
  )
}
