import { APP_NAME } from "@/lib/navigation"

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Accueil</h1>
      <p className="mt-2 text-muted-foreground">
        Bienvenue dans {APP_NAME}.
      </p>
    </div>
  )
}
