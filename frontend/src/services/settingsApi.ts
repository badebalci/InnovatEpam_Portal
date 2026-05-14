import api from './api'
import type { AppSettings } from '../types'

export const settingsApi = {
  async getSettings(): Promise<AppSettings> {
    const res = await api.get<AppSettings>('/settings')
    return res.data
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await api.put<AppSettings>('/settings', settings)
    return res.data
  },
}
