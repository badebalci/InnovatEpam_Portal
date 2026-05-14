import api from './api'
import type { LoginResponse, RegisterPayload, LoginPayload } from '../types'

export const authApi = {
  async register(data: RegisterPayload) {
    const res = await api.post<{ message: string }>('/auth/register', data)
    return res.data
  },

  async login(data: LoginPayload) {
    const res = await api.post<LoginResponse>('/auth/login', data)
    return res.data
  },

  async refresh() {
    const res = await api.post<{ accessToken: string }>('/auth/refresh')
    return res.data
  },

  async logout() {
    await api.post('/auth/logout')
  },
}
