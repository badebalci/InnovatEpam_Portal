export const MAX_FILE_SIZE_BYTES = 10_485_760 // 10 MB

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'video/mp4',
  'video/quicktime',
  'application/zip',
  'application/x-zip-compressed',
]

export const MAX_ATTACHMENTS_PER_IDEA = 5

export const DEFAULT_PAGE_SIZE = 20

export const IDEA_CATEGORIES = [
  'Technology',
  'Process',
  'Product',
  'People',
  'Other',
] as const

export const IDEA_STATUSES = [
  'Submitted',
  'UnderReview',
  'Accepted',
  'Rejected',
] as const
