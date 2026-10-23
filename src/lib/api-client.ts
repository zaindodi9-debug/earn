// Thin fetch wrappers around the EarnGames backend API.
// All functions return parsed JSON or throw an Error with the API message.

import type {
  Game,
  GameLevel,
  SafeUser,
  StatsResult,
  SubmitProgressResult,
  UserProgress,
  UserWithRelations,
} from '@/components/platform/types'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })
  let data: any = null
  try {
    data = await res.json()
  } catch {
    /* ignore non-json */
  }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Permintaan gagal (${res.status})`
    throw new ApiError(msg, res.status)
  }
  return data as T
}

/* ---------------------- Auth ---------------------- */

export function getMe(): Promise<{ user: SafeUser | null }> {
  return request<{ user: SafeUser | null }>('/api/auth')
}

export function login(email: string, password: string): Promise<{ user: SafeUser }> {
  return request<{ user: SafeUser }>('/api/auth', {
    method: 'PUT',
    body: JSON.stringify({ email, password }),
  })
}

export function register(name: string, email: string, password: string): Promise<{ user: SafeUser }> {
  return request<{ user: SafeUser }>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function logout(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/auth', { method: 'DELETE' })
}

/* ---------------------- Games ---------------------- */

export function getGames(): Promise<{ games: Game[] }> {
  return request<{ games: Game[] }>('/api/games')
}

export function createGame(body: Partial<Game>): Promise<{ game: Game }> {
  return request<{ game: Game }>('/api/games', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateGame(id: string, body: Partial<Game>): Promise<{ game: Game }> {
  return request<{ game: Game }>(`/api/games/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteGame(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/games/${id}`, { method: 'DELETE' })
}

/* ---------------------- Levels ---------------------- */

export function getLevels(gameId?: string): Promise<{ levels: GameLevel[] }> {
  const qs = gameId ? `?gameId=${encodeURIComponent(gameId)}` : ''
  return request<{ levels: GameLevel[] }>(`/api/levels${qs}`)
}

export function createLevel(body: Partial<GameLevel>): Promise<{ level: GameLevel }> {
  return request<{ level: GameLevel }>('/api/levels', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateLevel(id: string, body: Partial<GameLevel>): Promise<{ level: GameLevel }> {
  return request<{ level: GameLevel }>(`/api/levels/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteLevel(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/levels/${id}`, { method: 'DELETE' })
}

/* ---------------------- Users (admin) ---------------------- */

export function getUsers(): Promise<{ users: SafeUser[] }> {
  return request<{ users: SafeUser[] }>('/api/users')
}

export function getUser(id: string): Promise<{ user: UserWithRelations }> {
  return request<{ user: UserWithRelations }>(`/api/users/${id}`)
}

export function createUser(body: {
  email: string
  name?: string
  password: string
  role?: 'ADMIN' | 'USER'
  points?: number
}): Promise<{ user: SafeUser }> {
  return request<{ user: SafeUser }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateUser(
  id: string,
  body: {
    name?: string
    email?: string
    role?: 'ADMIN' | 'USER'
    status?: 'ACTIVE' | 'SUSPENDED'
    password?: string
    pointsDelta?: number
  }
): Promise<{ user: SafeUser }> {
  return request<{ user: SafeUser }>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteUser(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/users/${id}`, { method: 'DELETE' })
}

/* ---------------------- Progress ---------------------- */

export function getProgress(): Promise<{ progress: UserProgress[] }> {
  return request<{ progress: UserProgress[] }>('/api/progress')
}

export function submitProgress(
  gameLevelId: string,
  score: number,
  timeSec?: number
): Promise<SubmitProgressResult> {
  return request<SubmitProgressResult>('/api/progress', {
    method: 'POST',
    body: JSON.stringify({ gameLevelId, score, timeSec }),
  })
}

/* ---------------------- Stats (admin) ---------------------- */

export function getStats(): Promise<StatsResult> {
  return request<StatsResult>('/api/stats')
}
