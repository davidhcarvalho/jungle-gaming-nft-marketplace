import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'
import { getCurrentSession, login, logout, signup } from '@/features/auth/api'
import type { AuthPayload, SignupPayload } from '@/types/api'
import type { Session } from '@/types/domain'

export const sessionQueryOptions = queryOptions({
  queryKey: queryKeys.auth.session,
  queryFn: ({ signal }) => getCurrentSession(signal),
  staleTime: 0,
  retry: false,
})

export function useSession() {
  return useQuery(sessionQueryOptions)
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AuthPayload) => login(payload),
    onSuccess: async ({ session }) => {
      await clearPrivateQueries(queryClient)
      queryClient.setQueryData<Session | null>(queryKeys.auth.session, session)
    },
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),
    onSuccess: async ({ session }) => {
      await clearPrivateQueries(queryClient)
      queryClient.setQueryData<Session | null>(queryKeys.auth.session, session)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      await clearPrivateQueries(queryClient)
      queryClient.setQueryData<Session | null>(queryKeys.auth.session, null)
    },
  })
}

export async function clearPrivateQueries(queryClient: ReturnType<typeof useQueryClient>) {
  const isPrivateQuery = (query: { queryKey: readonly unknown[] }) => query.queryKey[0] === 'private'
  await queryClient.cancelQueries({ predicate: isPrivateQuery })
  queryClient.removeQueries({ predicate: isPrivateQuery })
}
