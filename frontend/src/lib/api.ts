import axios from 'axios'

let accessToken: string | null = null

export function setAccessToken(token: string | null) { accessToken = token }
export function getAccessToken() { return accessToken }

const api = axios.create({ baseURL: '/api', withCredentials: true })

api.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        setAccessToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        setAccessToken(null)
        const base = import.meta.env.BASE_URL.replace(/\/$/, '')
        window.location.href = base + '/app/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
