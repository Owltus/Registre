/* eslint-disable react-hooks/static-components */
import { getChapterIcon, type ChapterRow } from "@/lib/navigation"

interface ChapterHeaderProps {
  chapter: ChapterRow
}

export function ChapterHeader({ chapter }: ChapterHeaderProps) {
  // Référence stable depuis iconMap — pas de re-création de composant
  const Icon = getChapterIcon(chapter.icon)  

  return (
    <div className="mb-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{chapter.label}</h1>
          <p className="mt-2 text-muted-foreground">{chapter.description}</p>
        </div>
      </div>
    </div>
  )
}
