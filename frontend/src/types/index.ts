export type Role = 'Submitter' | 'AdminEvaluator'

export type IdeaStatus = 'Draft' | 'Submitted' | 'UnderReview' | 'Accepted' | 'Rejected'

export type IdeaCategory = 'Technology' | 'Process' | 'Product' | 'People' | 'Other'

export type EvaluationDecision = 'Accepted' | 'Rejected'

export interface User {
  id: number
  fullName: string
  email: string
  role: Role
}

export interface IdeaSummary {
  id: number
  title: string
  category: IdeaCategory
  status: IdeaStatus
  submitterName: string
  createdAt: string
}

export interface AttachmentInfo {
  id: number
  fileName: string
}

export interface EvaluationInfo {
  decision: EvaluationDecision
  comment: string
  evaluatorName: string
  decidedAt: string
}

export interface IdeaDetail {
  id: number
  title: string
  description: string
  category: IdeaCategory
  status: IdeaStatus
  submitterId: number
  submitterName: string
  createdAt: string
  updatedAt: string
  attachments: AttachmentInfo[]
  evaluation: EvaluationInfo | null
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterPayload {
  email: string
  fullName: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface EvaluatePayload {
  decision: EvaluationDecision
  comment: string
}
