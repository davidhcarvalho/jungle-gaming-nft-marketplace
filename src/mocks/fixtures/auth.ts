import type { User } from '@/types/domain'

export interface MockAccount extends User {
  passwordDigest: string
}

// Digests are SHA-256 over `kurio-mock-v1:<normalized email>:<demo password>`.
export const mockAccountFixtures: MockAccount[] = [
  {
    id: 'user-ana',
    displayName: 'Ana Colecionadora',
    email: 'ana@kurio.test',
    passwordDigest: 'eb022e49b2443464080402a6fb45f235bfdedd7ca7e3cce5740335318c78c191',
  },
  {
    id: 'user-leo',
    displayName: 'Leo Artista',
    email: 'leo@kurio.test',
    passwordDigest: '264258965bd1c23583d3f7f4b410da48f5aefcd6de074132879ca4e9dde9480d',
  },
]
