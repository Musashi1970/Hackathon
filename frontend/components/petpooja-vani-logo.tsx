/* eslint-disable @next/next/no-img-element */
export function PetpoojaVaniLogo({ size = 32 }: { size?: number; variant?: "dark" | "light" }) {
  return (
    <img
      src="/petpooja-logo.png"
      alt="Petpooja logo"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  )
}
