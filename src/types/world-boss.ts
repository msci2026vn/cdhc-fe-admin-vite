// ===== API Responses =====

export interface WorldBossCurrent {
  active: boolean;
  boss?: WorldBossInfo;
}

export interface WorldBossInfo {
  id: string;
  bossName: string;
  bossTitle: string;
  element: string;
  weakness: string;
  baseSprite: string;
  difficulty: string;
  durationMinutes: number;
  startedAt: string;
  currentHp: number;
  hpPercent: number;
  participantCount: number;
  stats: { hp: number; max_hp: number; atk: number; def: number; crit_rate: number };
  skills: Array<{ name: string; description: string; type?: string }>;
  lore: string | null;
  storyPreview: string | null;
  storyFull: string | null;
  leaderboard: Array<{ userId: string; damage: number; username?: string }>;
  feed: Array<{ userId: string; damage: number; isCrit?: boolean; timestamp: number }>;
  timeRemaining: number;
}

export interface WorldBossHistoryEntry {
  id: string;
  bossName: string;
  element: string;
  difficulty: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  totalParticipants: number;
  totalDamageDealt: number;
  triggerType?: string;
}

export interface AdminCreateResponse {
  mode: string;
  event: { id: string };
  boss: {
    bossName: string;
    element: string;
    difficulty: string;
    hp: number;
    durationMinutes: number;
    hasStory: boolean;
  };
}

// ===== Create Payloads (3 modes) =====

export interface AdminCreatePreset {
  mode: 'preset';
  preset: string;
  difficulty?: string;
  overrides?: {
    durationMinutes?: number;
    stats?: { hp?: number; atk?: number; def?: number; critRate?: number };
  };
}

export interface AdminCreateAI {
  mode: 'ai';
  severity: string;
  mockSensor?: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
    soilPh?: number;
    lightLevel?: number;
  };
  overrides?: { durationMinutes?: number; stats?: { hp?: number } };
}

export interface AdminCreateCustom {
  mode: 'custom';
  bossName: string;
  bossTitle?: string;
  element: string;
  weakness: string;
  baseSprite: string;
  difficulty: string;
  durationMinutes: number;
  stats: { hp: number; atk: number; def: number; critRate: number };
  skills?: Array<{
    mechanicId: string;
    name: string;
    description: string;
    multiplier: number;
    trigger: string;
  }>;
  storyPreview?: string;
  storyFull?: string;
}

export type AdminCreateBossPayload = AdminCreatePreset | AdminCreateAI | AdminCreateCustom;

// ===== Config Maps =====

export const ELEMENT_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  fire: { icon: '🔥', label: 'Lửa', color: 'text-orange-500' },
  ice: { icon: '❄️', label: 'Băng', color: 'text-cyan-400' },
  water: { icon: '💧', label: 'Nước', color: 'text-blue-500' },
  wind: { icon: '🌀', label: 'Gió', color: 'text-green-400' },
  poison: { icon: '☠️', label: 'Độc', color: 'text-purple-500' },
  chaos: { icon: '💥', label: 'Hỗn Loạn', color: 'text-red-500' },
};

export const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normal', color: 'bg-gray-500 text-white' },
  hard: { label: 'Hard', color: 'bg-yellow-500 text-black' },
  extreme: { label: 'Extreme', color: 'bg-orange-500 text-white' },
  catastrophic: { label: 'Catastrophic', color: 'bg-red-600 text-white' },
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: '🟢 Active', color: 'bg-blue-500 text-white' },
  defeated: { label: '💀 Defeated', color: 'bg-green-600 text-white' },
  expired: { label: '⏰ Expired', color: 'bg-gray-500 text-white' },
};

export const PRESET_OPTIONS = [
  { value: 'ray_nau', label: '🦗 Rầy Nâu' },
  { value: 'nhen_do', label: '🕷️ Nhện Đỏ' },
  { value: 'dao_on', label: '🍄 Đạo Ôn' },
  { value: 'oc_buou', label: '🐌 Ốc Bươu Vàng' },
  { value: 'nam_re', label: '🍄 Nấm Rễ' },
  { value: 'chau_chau', label: '🦗 Châu Chấu' },
  { value: 'bo_xit', label: '🪲 Bọ Xít' },
  { value: 'sau_duc_than', label: '🐛 Sâu Đục Thân' },
];

// GET /api/world-boss/admin/detail/:eventId
export interface BossDetailResponse {
  event: {
    id: string;
    bossName: string;
    bossTitle: string;
    element: string;
    weakness: string;
    difficulty: string;
    baseSprite: string;
    status: string;
    triggerType: string;
    startedAt: string;
    endedAt: string | null;
    durationMinutes: number;
    durationActual: number | null;
    totalParticipants: number;
    totalDamageDealt: number;
  };
  stats: { hp: number; max_hp: number; atk: number; def: number; crit_rate: number };
  skills: Array<{
    name: string;
    description: string;
    damage_multi?: number;
    type?: string;
    trigger?: string;
  }>;
  story: { lore: string | null; storyFull: string | null };
  visualVariant: { colorShift?: string; scale?: number; aura?: string; glowColor?: string };
  rewardPool: { exp?: number; ogn?: number; special_item?: string };
  leaderboard: Array<{
    rank: number;
    userId: string;
    username: string | null;
    totalDamage: number;
    hitsCount: number;
    bestSingleHit: number;
    maxCombo: number;
    contributionPercent: number;
  }>;
  rewardSummary: {
    tierCounts: { legendary: number; epic: number; rare: number; common: number };
    totalXp: number;
    totalOgn: number;
    lastHitter: { userId: string; username: string | null } | null;
  };
  costEstimate: { triggerType: string; aiTokenCost: string; note: string };
}
