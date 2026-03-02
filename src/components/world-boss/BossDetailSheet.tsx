import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAdminBossDetail } from '@/hooks/useWorldBoss';
import { ELEMENT_CONFIG, DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/types/world-boss';

interface Props {
  eventId: string | null;
  onClose: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('vi-VN');
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800/60 rounded p-3 text-center border border-gray-700">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

function SheetSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      <Skeleton className="h-8 w-3/4 bg-gray-700" />
      <Skeleton className="h-4 w-1/2 bg-gray-700" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 bg-gray-700" />
        <Skeleton className="h-6 w-20 bg-gray-700" />
        <Skeleton className="h-6 w-20 bg-gray-700" />
      </div>
      <Separator className="bg-gray-700" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 bg-gray-700 rounded" />
        ))}
      </div>
      <Separator className="bg-gray-700" />
      <Skeleton className="h-[200px] bg-gray-700 rounded" />
    </div>
  );
}

export function BossDetailSheet({ eventId, onClose }: Props) {
  const { data, isLoading, error } = useAdminBossDetail(eventId);
  const [storyOpen, setStoryOpen] = useState(false);

  const el = data ? ELEMENT_CONFIG[data.event.element] : null;
  const weakEl = data ? ELEMENT_CONFIG[data.event.weakness] : null;
  const diff = data ? DIFFICULTY_CONFIG[data.event.difficulty] : null;
  const stat = data ? STATUS_CONFIG[data.event.status] : null;

  return (
    <Sheet open={!!eventId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[620px] bg-gray-900 border-gray-700 text-gray-100 flex flex-col p-0"
      >
        <div className="flex-1 overflow-y-auto p-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-gray-100">Chi Tiết Boss</SheetTitle>
          </SheetHeader>

          {isLoading && <SheetSkeleton />}

          {error && (
            <div className="text-center py-12 text-red-400">
              <p className="text-lg">Không thể tải dữ liệu</p>
              <p className="text-sm text-gray-500 mt-1">{(error as Error).message}</p>
            </div>
          )}

          {data && (
            <div className="space-y-5">
              {/* Boss Identity */}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {el?.icon} {data.event.bossName}
                </h2>
                {data.event.bossTitle && (
                  <p className="text-sm text-gray-400 italic mt-0.5">"{data.event.bossTitle}"</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {el && weakEl && (
                    <Badge className="bg-gray-700 text-gray-200 text-xs">
                      {el.icon} {el.label} → {weakEl.icon} {weakEl.label}
                    </Badge>
                  )}
                  {diff && <Badge className={`${diff.color} text-xs`}>{diff.label}</Badge>}
                  {stat && <Badge className={`${stat.color} text-xs`}>{stat.label}</Badge>}
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Thời gian */}
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">⏰ Thời gian</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-300">
                  <div>
                    <span className="text-gray-500">Bắt đầu:</span>{' '}
                    {formatDateTime(data.event.startedAt)}
                  </div>
                  <div>
                    <span className="text-gray-500">Kết thúc:</span>{' '}
                    {data.event.endedAt ? formatDateTime(data.event.endedAt) : 'Đang diễn ra'}
                  </div>
                  <div>
                    <span className="text-gray-500">Thời lượng:</span>{' '}
                    {data.event.durationActual != null
                      ? `${data.event.durationActual} phút (config: ${data.event.durationMinutes}p)`
                      : `config: ${data.event.durationMinutes} phút`}
                  </div>
                  <div>
                    <span className="text-gray-500">Chi phí AI:</span>{' '}
                    <span className="text-yellow-400">{data.costEstimate.aiTokenCost}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{data.costEstimate.note}</p>
              </div>

              <Separator className="bg-gray-700" />

              {/* Chỉ số */}
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">📊 Chỉ số</h3>
                <div className="grid grid-cols-4 gap-2">
                  <StatBox label="HP" value={formatNumber(data.stats.max_hp)} />
                  <StatBox label="ATK" value={data.stats.atk} />
                  <StatBox label="DEF" value={data.stats.def} />
                  <StatBox label="Crit" value={`${data.stats.crit_rate}%`} />
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Skills */}
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">
                  ⚔️ Skills ({data.skills?.length || 0})
                </h3>
                <div className="space-y-2">
                  {data.skills?.map((s, i) => (
                    <div key={i} className="text-sm flex gap-2 items-start">
                      <span className="text-gray-500 mt-0.5">•</span>
                      <span>
                        <span className="font-medium text-gray-200">{s.name}</span>
                        {s.damage_multi != null && (
                          <span className="text-orange-400 ml-1.5 text-xs">×{s.damage_multi}</span>
                        )}
                        <span className="text-gray-400 ml-1.5">— {s.description}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cốt truyện */}
              {(data.story.lore || data.story.storyFull) && (
                <>
                  <Separator className="bg-gray-700" />
                  <Collapsible open={storyOpen} onOpenChange={setStoryOpen}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-200">📖 Cốt truyện</h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-400 h-7">
                          {storyOpen ? 'Thu gọn' : 'Xem đầy đủ'}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    {data.story.lore && (
                      <p className="text-sm text-gray-400 mt-1.5 italic">{data.story.lore}</p>
                    )}
                    <CollapsibleContent>
                      {data.story.storyFull && (
                        <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap leading-relaxed">
                          {data.story.storyFull}
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}

              <Separator className="bg-gray-700" />

              {/* Chiến trường */}
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">🏟️ Chiến trường</h3>
                <div className="flex gap-6 text-sm text-gray-300">
                  <span>👥 {data.event.totalParticipants} người chơi</span>
                  <span>⚔️ {formatNumber(data.event.totalDamageDealt)} tổng damage</span>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Phần thưởng */}
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">🎁 Phần thưởng</h3>
                <div className="flex flex-wrap gap-3 text-sm mb-2">
                  <span className="text-yellow-400">
                    🟡 Legendary: {data.rewardSummary.tierCounts.legendary}
                  </span>
                  <span className="text-purple-400">
                    🟣 Epic: {data.rewardSummary.tierCounts.epic}
                  </span>
                  <span className="text-blue-400">
                    🔵 Rare: {data.rewardSummary.tierCounts.rare}
                  </span>
                  <span className="text-gray-400">
                    ⚪ Common: {data.rewardSummary.tierCounts.common}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  XP tổng:{' '}
                  <span className="text-green-400 font-mono">
                    {formatNumber(data.rewardSummary.totalXp)}
                  </span>{' '}
                  | OGN tổng:{' '}
                  <span className="text-yellow-400 font-mono">
                    {formatNumber(data.rewardSummary.totalOgn)}
                  </span>
                </div>
                {data.rewardSummary.lastHitter ? (
                  <p className="text-sm mt-1.5 text-gray-300">
                    🗡️ Người hạ gục:{' '}
                    <strong className="text-white">
                      {data.rewardSummary.lastHitter.username ||
                        data.rewardSummary.lastHitter.userId.slice(0, 8)}
                    </strong>
                  </p>
                ) : (
                  <p className="text-sm mt-1.5 text-gray-500">🗡️ Người hạ gục: Không xác định</p>
                )}
              </div>

              <Separator className="bg-gray-700" />

              {/* Bảng xếp hạng */}
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">
                  🏆 Bảng xếp hạng ({data.leaderboard.length})
                </h3>
                <ScrollArea className="h-[300px] rounded border border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800 z-10">
                      <tr className="border-b border-gray-700 text-gray-400">
                        <th className="text-left p-2 w-10">#</th>
                        <th className="text-left p-2">Người chơi</th>
                        <th className="text-right p-2">Damage</th>
                        <th className="text-right p-2">Hits</th>
                        <th className="text-right p-2">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-gray-500">
                            Chưa có ai tham gia
                          </td>
                        </tr>
                      ) : (
                        data.leaderboard.map((p) => (
                          <tr
                            key={p.userId}
                            className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="p-2 font-bold text-gray-300">
                              {p.rank === 1
                                ? '🥇'
                                : p.rank === 2
                                  ? '🥈'
                                  : p.rank === 3
                                    ? '🥉'
                                    : p.rank}
                            </td>
                            <td className="p-2 text-gray-200">
                              {p.username || p.userId.slice(0, 8) + '...'}
                            </td>
                            <td className="p-2 text-right font-mono text-gray-300">
                              {formatNumber(p.totalDamage)}
                            </td>
                            <td className="p-2 text-right text-gray-400">{p.hitsCount}</td>
                            <td className="p-2 text-right text-gray-400">
                              {p.contributionPercent}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
