import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "./useQuery"
import { useMutation } from "./useMutation"
import type { ChapterRow, ClasseurRow } from "@/lib/navigation"
import { DEFAULT_REGISTRY_NAME, buildEstablishment } from "@/lib/navigation"

/**
 * Hook partagé par les 4 pages de détail (Document, TrackingSheet, SignatureSheet, Intercalaire).
 * Factorise : useParams, backPath, chargement classeur/chapitre, mutation.
 */
export function useDetailPage<T>(table: string) {
  const { id, chapterId, classeurId } = useParams<{ id: string; chapterId: string; classeurId: string }>()
  const navigate = useNavigate()

  const backPath = classeurId && chapterId
    ? `/classeurs/${classeurId}/chapitres/${chapterId}`
    : chapterId ? `/chapitres/${chapterId}` : "/"

  // Chargement de l'item principal
  const filters = useMemo(() => ({ id: Number(id) }), [id])
  const { data, loading, refetch } = useQuery<T>(table, filters)
  const item = data[0] ?? null

  // Chargement du classeur
  const classeurFilters = useMemo(() => ({ id: Number(classeurId) }), [classeurId])
  const { data: classeurRows } = useQuery<ClasseurRow>("classeurs", classeurFilters)
  const classeur = classeurRows[0] ?? null
  const classeurName = classeur?.name ?? DEFAULT_REGISTRY_NAME
  const establishment = buildEstablishment(classeur)

  // Chargement du chapitre
  const chapterFilters = useMemo(() => ({ id: Number(chapterId) }), [chapterId])
  const { data: chapterRows } = useQuery<ChapterRow>("chapters", chapterFilters)
  const chapter = chapterRows[0] ?? null

  // Mutation
  const { update } = useMutation(table)

  return {
    id,
    chapterId,
    classeurId,
    navigate,
    backPath,
    item,
    loading,
    refetch,
    classeurName,
    establishment,
    chapter,
    update,
  }
}
