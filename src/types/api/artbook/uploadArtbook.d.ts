export type UploadArtbookRequest = {
  title: string
  description: string
  handle: string
  image_url: string | null
//   fileKey?: string | null
}

export type UploadArtbookResponse = {
  id: string
  title: string
  description: string
  handle: string
  image_url: string | null
//   createdAt: string
}