import api from './api'
import type { IdeaDetail, EvaluatePayload } from '../types'

export const evaluationsApi = {
  async startReview(ideaId: number) {
    const res = await api.patch<IdeaDetail>(`/ideas/${ideaId}/review`)
    return res.data
  },

  async evaluate(ideaId: number, data: EvaluatePayload) {
    const res = await api.post<IdeaDetail>(`/ideas/${ideaId}/evaluate`, data)
    return res.data
  },
}
