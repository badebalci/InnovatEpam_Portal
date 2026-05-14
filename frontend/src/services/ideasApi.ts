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
    const res = await api.post<IdeaDetail>('/ideas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async downloadAttachment(id: number, fileName: string) {
    const res = await api.get(`/ideas/${id}/attachment`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  },

  getAttachmentUrl(id: number) {
    return `/api/ideas/${id}/attachment`
  },
}
