import { apiClient } from '@/api/client'
import type { ChangePasswordPayload, ProfileResponse, UpdateAvatarPayload, UpdateProfilePayload } from '@/types/api'

export async function getProfile(signal?: AbortSignal) { return (await apiClient.get<ProfileResponse>('/profile', { signal })).data }
export async function saveProfile(payload: UpdateProfilePayload) { return (await apiClient.patch<ProfileResponse>('/profile', payload)).data }
export async function saveAvatar(payload: UpdateAvatarPayload) { return (await apiClient.post<ProfileResponse>('/profile/avatar', payload)).data }
export async function deleteAvatar() { return (await apiClient.delete<ProfileResponse>('/profile/avatar')).data }
export async function changePassword(payload: ChangePasswordPayload) { return (await apiClient.post<{ status: 'updated' }>('/profile/password', payload)).data }
