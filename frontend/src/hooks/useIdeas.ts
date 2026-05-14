import { useState, useCallback } from 'react'
import { ideasApi, type GetIdeasParams } from '../services/ideasApi'
import type { IdeaSummary } from '../types'
import { DEFAULT_PAGE_SIZE } from '../lib/constants'

export function useIdeas() {
  const [ideas, setIdeas] = useState<IdeaSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPageState] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearchState] = useState('')
  const [category, setCategoryState] = useState('')
  const [status, setStatusState] = useState('')

  const fetchIdeas = useCallback(
    async (params: GetIdeasParams) => {
      setIsLoading(true)
      try {
        const result = await ideasApi.getIdeas(params)
        setIdeas(result.items)
        setTotalCount(result.totalCount)
      } catch {
        // handled by caller
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const setPage = useCallback(
    (p: number) => {
      setPageState(p)
      fetchIdeas({ page: p, pageSize: DEFAULT_PAGE_SIZE, search, category, status })
    },
    [fetchIdeas, search, category, status]
  )

  const setSearch = useCallback(
    (s: string) => {
      setSearchState(s)
      setPageState(1)
      fetchIdeas({ page: 1, pageSize: DEFAULT_PAGE_SIZE, search: s, category, status })
    },
    [fetchIdeas, category, status]
  )

  const setCategory = useCallback(
    (c: string) => {
      setCategoryState(c)
      setPageState(1)
      fetchIdeas({ page: 1, pageSize: DEFAULT_PAGE_SIZE, search, category: c, status })
    },
    [fetchIdeas, search, status]
  )

  const setStatus = useCallback(
    (st: string) => {
      setStatusState(st)
      setPageState(1)
      fetchIdeas({ page: 1, pageSize: DEFAULT_PAGE_SIZE, search, category, status: st })
    },
    [fetchIdeas, search, category]
  )

  const refresh = useCallback(() => {
    fetchIdeas({ page, pageSize: DEFAULT_PAGE_SIZE, search, category, status })
  }, [fetchIdeas, page, search, category, status])

  return {
    ideas,
    totalCount,
    page,
    isLoading,
    search,
    category,
    status,
    fetchIdeas,
    setPage,
    setSearch,
    setCategory,
    setStatus,
    refresh,
  }
}
