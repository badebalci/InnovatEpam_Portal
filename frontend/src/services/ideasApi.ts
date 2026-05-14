import api from './api'
import type { IdeaDetail, IdeaSummary, PagedResult } from '../types'

export interface GetIdeasParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  status?: string
}

export const ideasApi = {
  async getIdeas(params: GetIdeasParams = {}) {
    const res = await api.get<PagedResult<IdeaSummary>>('/ideas', { params })
    return res.data
  },

  async getIdeaById(id: number) {
    const res = await api.get<IdeaDetail>(`/ideas/${id}`)
    return res.data
  },

  async createIdea(formData: FormData) {
    const res = await api.post<IdeaDetail>('/ideas', formData)
    return res.data
  },

  async updateDraft(id: number, formData: FormData) {
    const res = await api.patch<IdeaDetail>(`/ideas/${id}`, formData)
    return res.data
  },

  async deleteIdea(id: number) {
    await api.delete(`/ideas/${id}`)
  },

  async advanceStage(id: number, comment: string) {
    const res = await api.patch<IdeaDetail>(`/ideas/${id}/advance`, { comment })
    return res.data
  },

  async rejectIdea(id: number, comment: string) {
    const res = await api.patch<IdeaDetail>(`/ideas/${id}/reject`, { comment })
    return res.data
  },

  async setBlindReview(id: number, isBlindReview: boolean) {
    const res = await api.patch<IdeaDetail>(`/ideas/${id}/blind-review`, { isBlindReview })
    return res.data
  },

  async downloadAttachment(ideaId: number, attachmentId: number, fileName: string) {
    const res = await api.get(`/ideas/${ideaId}/attachment/${attachmentId}`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  },

  getAttachmentUrl(id: number) {
    return `/api/ideas/${id}/attachments`
  },
}
