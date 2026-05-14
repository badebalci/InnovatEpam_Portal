export type Role = 'Submitter' | 'AdminEvaluator'

export type IdeaStatus =
  | 'Draft'
  | 'Submitted'
  | 'InitialReview'
  | 'TechnicalReview'
  | 'FinalReview'
  | 'Accepted'
  | 'Rejected'
  | 'UnderReview' // legacy

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
  isBlindReview: boolean
  overallScore: number | null
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
  scoreFunctionality: number
  scoreReliability: number
  scoreUsability: number
  scoreMaintainability: number
  scoreEfficiency: number
  overallScore: number
}

export interface StageTransitionInfo {
  id: number
  fromStatus: IdeaStatus
  toStatus: IdeaStatus
  evaluatorName: string
  comment: string
  transitionedAt: string
}

export interface IdeaDetail {
  id: number
  title: string
  description: string
  category: IdeaCategory
  status: IdeaStatus
  submitterId: number
  submitterName: string
  isBlindReview: boolean
  createdAt: string
  updatedAt: string
  attachments: AttachmentInfo[]
  evaluation: EvaluationInfo | null
  stageHistory: StageTransitionInfo[]
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
  scoreFunctionality?: number
  scoreReliability?: number
  scoreUsability?: number
  scoreMaintainability?: number
  scoreEfficiency?: number
}

export interface AppSettings {
  blindReviewDefault: boolean
}
