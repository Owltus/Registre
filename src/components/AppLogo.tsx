import { ShieldCheck } from "lucide-react"

interface AppLogoProps {
  className?: string
  size?: number
}

/**
 * Logo de l'application Registre.
 */
export function AppLogo({ className, size = 24 }: AppLogoProps) {
  return <ShieldCheck className={className} width={size} height={size} />
}
