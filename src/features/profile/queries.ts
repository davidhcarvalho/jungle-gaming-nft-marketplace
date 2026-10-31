import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth/queries'
import { queryKeys } from '@/lib/query-keys'
import type { ChangePasswordPayload, UpdateAvatarPayload, UpdateProfilePayload } from '@/types/api'
import { changePassword, deleteAvatar, getProfile, saveAvatar, saveProfile } from './api'

export function useProfile() {
  const session = useSession()
  const userId = session.data?.user.id ?? ''
  return useQuery({ queryKey: queryKeys.private.profile(userId), queryFn: ({ signal }) => getProfile(signal), enabled: Boolean(userId), retry: false })
}
export function useUpdateProfile() {
  const client = useQueryClient(); const session = useSession(); const userId = session.data?.user.id ?? ''
  return useMutation({ mutationFn: (payload: UpdateProfilePayload) => saveProfile(payload), onSuccess: async (profile) => {
    client.setQueryData(queryKeys.private.profile(userId), profile)
    await client.invalidateQueries({ queryKey: queryKeys.auth.session })
  } })
}
export function useUpdateAvatar() {
  const client = useQueryClient(); const session = useSession(); const userId = session.data?.user.id ?? ''
  return useMutation({ mutationFn: (payload: UpdateAvatarPayload | undefined) => payload ? saveAvatar(payload) : deleteAvatar(), onSuccess: (profile) => client.setQueryData(queryKeys.private.profile(userId), profile) })
}
export function useChangePassword() { return useMutation({ mutationFn: (payload: ChangePasswordPayload) => changePassword(payload) }) }
