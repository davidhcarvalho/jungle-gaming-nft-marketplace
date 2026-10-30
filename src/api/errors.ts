import axios from 'axios'

import type { ApiError } from '@/types/api'

export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data) {
    return error.response.data
  }

  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return { code: 'timeout', message: 'A solicitação excedeu o tempo limite.' }
  }

  return { code: 'network', message: 'Não foi possível conectar ao serviço.' }
}
