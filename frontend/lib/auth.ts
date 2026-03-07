const AUTH_KEY = "petpooja_authenticated"

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(AUTH_KEY) === "true"
}

export function setAuthenticated(): void {
  sessionStorage.setItem(AUTH_KEY, "true")
}

export function clearAuthenticated(): void {
  sessionStorage.removeItem(AUTH_KEY)
}
