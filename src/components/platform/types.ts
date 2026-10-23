// Shared platform types — match the backend API contract.

export type SafeUser = {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER' | string
  status: 'ACTIVE' | 'SUSPENDED' | string
  points: number
  avatarUrl: string | null
  createdAt?: string
}

export type GameLevel = {
  id: string
  gameId: string
  levelNumber: number
  name: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' | string
  targetScore: number
  timeLimitSec: number
  rewardPoints: number
  status: 'ACTIVE' | 'LOCKED' | string
  createdAt?: string
  updatedAt?: string
  game?: Game
}

export type Game = {
  id: string
  title: string
  slug: string
  description?: string | null
  category: 'arcade' | 'puzzle' | 'card' | 'sports' | 'strategy' | string
  thumbnailUrl?: string | null
  embedUrl?: string | null
  status: 'DRAFT' | 'ACTIVE' | 'HIDDEN' | string
  sortOrder: number
  createdAt?: string
  updatedAt?: string
  levels?: GameLevel[]
}

export type UserProgress = {
  id: string
  userId: string
  gameLevelId: string
  highScore: number
  bestTimeSec: number | null
  attempts: number
  completed: boolean
  lastPlayedAt: string | null
  createdAt?: string
  updatedAt?: string
  gameLevel?: GameLevel & { game?: Game }
}

export type PointsLedger = {
  id: string
  userId: string
  amount: number
  reason: string
  reference: string | null
  createdAt: string
}

export type UserWithRelations = SafeUser & {
  progress?: UserProgress[]
  pointsLedger?: PointsLedger[]
}

export type StatsResult = {
  totalUsers: number
  totalGames: number
  totalLevels: number
  activeGames: number
  suspendedUsers: number
  totalPlays: number
  totalPointsAwarded: number
  recentUsers: Array<{
    id: string
    email: string
    name: string | null
    createdAt: string
    points: number
    status: string
  }>
  topPlayers: Array<{
    id: string
    email: string
    name: string | null
    points: number
  }>
}

export type SubmitProgressResult = {
  progress: UserProgress
  awarded: number
  points: number
  completed: boolean
}
