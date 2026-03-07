import { useState } from 'react';
import {
  useAdminSessions,
  useAdminQueue,
  useCreateSession,
  useAssignSpotlights,
  useAssignSides,
  useActivateSession,
  useCancelSession,
  useSpotlightSuggestions,
  useAuctionStats,
  useDetailedStats,
  useAuctionsBySession,
  useAuctionDetailAdmin,
} from '@/hooks/useAuctionAdmin';
import type { AuctionSession, AuctionQueueItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Gavel,
  Plus,
  Star,
  Tag,
  Zap,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  Users,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  }
> = {
  scheduled: { label: 'Scheduled', variant: 'info' },
  active: { label: 'Active', variant: 'success' },
  ended: { label: 'Ended', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  queued: { label: 'Queued', variant: 'outline' },
  assigned: { label: 'Assigned', variant: 'default' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BidHistorySection({ auctionId }: { auctionId: string }) {
  const { data: detail, isLoading } = useAuctionDetailAdmin(auctionId);

  if (isLoading) return <p className="py-2 text-xs text-muted-foreground">Đang tải...</p>;
  if (!detail) return <p className="py-2 text-xs text-muted-foreground">Không có dữ liệu.</p>;

  const leaderboard: any[] = detail.leaderboard ?? [];

  return (
    <div className="mt-2 overflow-hidden rounded-lg border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Bidder</th>
            <th className="p-2 text-right">Bids</th>
            <th className="p-2 text-right">Giá cao nhất (AVAX)</th>
            <th className="p-2 text-right">Kết quả</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-3 text-center text-muted-foreground">
                Không có bid nào
              </td>
            </tr>
          ) : (
            leaderboard.map((entry: any) => (
              <tr key={entry.rank} className="border-t">
                <td className="p-2">{entry.rank}</td>
                <td className="p-2 font-medium">{entry.playerName}</td>
                <td className="p-2 text-right">{entry.bidCount}</td>
                <td className="p-2 text-right">{entry.lastBidAvax}</td>
                <td className="p-2 text-right">
                  {entry.isWinner ? (
                    <Badge variant="default" className="text-[10px]">
                      🏆 Winner
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AuctionAdminPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [spotlightSessionId, setSpotlightSessionId] = useState<string | null>(null);
  const [selectedSpotlights, setSelectedSpotlights] = useState<string[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedAuction, setExpandedAuction] = useState<string | null>(null);

  const { data: sessionsRes, isLoading: sessionsLoading } = useAdminSessions();
  const { data: queueRes, isLoading: queueLoading } = useAdminQueue();
  const { data: statsRes } = useAuctionStats();
  const { data: detailedStats } = useDetailedStats();
  const { data: sessionAuctions, isLoading: auctionsLoading } =
    useAuctionsBySession(expandedSession);
  const { data: suggestionsRes, refetch: fetchSuggestions } = useSpotlightSuggestions();

  const createSession = useCreateSession();
  const assignSpotlights = useAssignSpotlights();
  const assignSides = useAssignSides();
  const activateSession = useActivateSession();
  const cancelSession = useCancelSession();

  const sessions: AuctionSession[] = sessionsRes ?? [];
  const queueItems: AuctionQueueItem[] = queueRes ?? [];
  const stats = statsRes ?? null;
  const endedSessions = sessions.filter((s) => s.status === 'ended');

  // Create form
  const [form, setForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    durationMinutes: 30,
    slotCount: 10,
  });

  const handleCreate = () => {
    if (!form.name || !form.startTime || !form.endTime) {
      toast.error('Vui long dien day du thong tin');
      return;
    }
    createSession.mutate(form, {
      onSuccess: () => {
        setCreateOpen(false);
        setForm({ name: '', startTime: '', endTime: '', durationMinutes: 30, slotCount: 10 });
      },
    });
  };

  // Spotlight picker
  const toggleSpotlight = (queueId: string) => {
    setSelectedSpotlights((prev) =>
      prev.includes(queueId) ? prev.filter((id) => id !== queueId) : [...prev, queueId],
    );
  };

  const handleAssignSpotlights = () => {
    if (!spotlightSessionId || selectedSpotlights.length === 0) return;
    assignSpotlights.mutate(
      { sessionId: spotlightSessionId, queueIds: selectedSpotlights },
      {
        onSuccess: () => {
          setSpotlightSessionId(null);
          setSelectedSpotlights([]);
        },
      },
    );
  };

  const openSpotlightPicker = (sessionId: string) => {
    setSpotlightSessionId(sessionId);
    setSelectedSpotlights([]);
    fetchSuggestions();
  };

  const queuedItems = queueItems.filter((item) => {
    const q = item.queue || (item as any);
    return q.status === 'queued';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gavel className="h-7 w-7 text-amber-500" />
          <h1 className="text-2xl font-bold">Quan ly Dau Gia</h1>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{stats.total_sessions ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active_sessions ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Auctions</p>
              <p className="text-2xl font-bold">{stats.total_auctions ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Bids</p>
              <p className="text-2xl font-bold">{stats.total_bids ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
          <TabsTrigger value="queue">Queue ({queueItems.length})</TabsTrigger>
          <TabsTrigger value="history">Lich su ({endedSessions.length})</TabsTrigger>
        </TabsList>

        {/* ======================== SESSIONS TAB ======================== */}
        <TabsContent value="sessions" className="space-y-4">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tao phien moi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Tao phien dau gia</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Ten phien</Label>
                  <Input
                    placeholder="Flash Friday 20:00"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Bat dau</Label>
                  <Input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Ket thuc</Label>
                  <Input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Thoi luong (phut)</Label>
                    <Input
                      type="number"
                      value={form.durationMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, durationMinutes: +e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Slot count</Label>
                    <Input
                      type="number"
                      value={form.slotCount}
                      onChange={(e) => setForm((f) => ({ ...f, slotCount: +e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={createSession.isPending}
                  className="w-full"
                >
                  {createSession.isPending ? 'Dang tao...' : 'Tao phien'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {sessionsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Dang tai...
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Chua co phien nao. Bam "Tao phien moi" de bat dau.
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{session.name}</CardTitle>
                    <StatusBadge status={session.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {session.duration_minutes} phut | Slots: {session.slot_count} | Auctions:{' '}
                      {session.auction_count ?? 0} (active: {session.active_auctions ?? 0})
                    </p>
                    <p>
                      {formatDate(session.start_time)} → {formatDate(session.end_time)}
                    </p>
                  </div>

                  {session.status === 'scheduled' && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openSpotlightPicker(session.id)}
                      >
                        <Star className="mr-1 h-4 w-4" />
                        Chon Spotlight
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Gan tat ca NFT con lai vao phien phu?'))
                            assignSides.mutate(session.id);
                        }}
                      >
                        <Tag className="mr-1 h-4 w-4" />
                        Gan Side
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (confirm('Activate phien ngay? Dau gia se bat dau.'))
                            activateSession.mutate(session.id);
                        }}
                      >
                        <Zap className="mr-1 h-4 w-4" />
                        Activate ngay
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Huy phien nay?')) cancelSession.mutate(session.id);
                        }}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Huy
                      </Button>
                    </div>
                  )}

                  {session.status === 'active' && (
                    <Badge variant="success" className="animate-pulse">
                      Dang dien ra
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ======================== QUEUE TAB ======================== */}
        <TabsContent value="queue" className="space-y-3">
          {queueLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Dang tai...
            </div>
          ) : queueItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Hang cho trong. Seller chua gui NFT nao.
              </CardContent>
            </Card>
          ) : (
            queueItems.map((item) => {
              const q = item.queue || (item as any);
              return (
                <Card key={q.id}>
                  <CardContent className="flex items-center gap-3 py-3">
                    {q.nftImageUrl && (
                      <img src={q.nftImageUrl} alt="" className="h-12 w-12 rounded object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{q.nftName || `Token #${q.tokenId}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {q.nftRarity && `${q.nftRarity} | `}
                        {q.startPriceAvax} AVAX
                        {item.sellerName && ` | by ${item.sellerName}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={q.status} />
                      {q.assignedType && (
                        <p className="mt-1 text-xs text-muted-foreground">{q.assignedType}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ======================== HISTORY TAB ======================== */}
        <TabsContent value="history" className="space-y-6">
          {/* Stats cards */}
          {detailedStats && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gavel className="h-4 w-4" />
                    <p className="text-sm">Tong phien</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{detailedStats.total_sessions ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-sm">Tong auctions</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{detailedStats.total_auctions ?? 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {detailedStats.ended_auctions ?? 0} da ket thuc
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <p className="text-sm">Tong bids</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{detailedStats.total_bids ?? 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {detailedStats.unique_bidders ?? 0} bidders
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <p className="text-sm">Volume AVAX</p>
                  </div>
                  <p className="mt-1 text-2xl font-bold">
                    {Number(detailedStats.total_avax_volume ?? 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {detailedStats.ogn_burned_bids ?? 0} OGN burned
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ended sessions list */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Phien da ket thuc ({endedSessions.length})</h3>

            {endedSessions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Chua co phien nao ket thuc.
                </CardContent>
              </Card>
            ) : (
              endedSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer pb-2 transition-colors hover:bg-muted/50"
                    onClick={() =>
                      setExpandedSession(expandedSession === session.id ? null : session.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {expandedSession === session.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <CardTitle className="text-base">{session.name}</CardTitle>
                        <Badge variant="secondary">Ket thuc</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(session.start_time)}
                        </span>
                        <span>{session.duration_minutes} phut</span>
                        <span>{session.auction_count ?? 0} auctions</span>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedSession === session.id && (
                    <CardContent className="space-y-4 pt-0">
                      {/* Session config */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded bg-muted/30 p-2">
                          <p className="text-muted-foreground">Bat dau</p>
                          <p className="font-medium">{formatDate(session.start_time)}</p>
                        </div>
                        <div className="rounded bg-muted/30 p-2">
                          <p className="text-muted-foreground">Ket thuc</p>
                          <p className="font-medium">{formatDate(session.end_time)}</p>
                        </div>
                        <div className="rounded bg-muted/30 p-2">
                          <p className="text-muted-foreground">Bid cost</p>
                          <p className="font-medium">
                            {session.bid_cost_ogn} OGN • Free: {session.free_bids_per_session}
                          </p>
                        </div>
                      </div>

                      {/* Auctions in session */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Auctions trong phien</h4>

                        {auctionsLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Dang tai...
                          </div>
                        ) : !sessionAuctions || sessionAuctions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Khong co auction nao.</p>
                        ) : (
                          sessionAuctions.map((auction: any) => (
                            <Card key={auction.id} className="bg-muted/20">
                              <CardContent className="py-3">
                                <div className="flex items-center gap-3">
                                  {auction.nftImageUrl && (
                                    <img
                                      src={auction.nftImageUrl}
                                      alt=""
                                      className="h-12 w-12 rounded object-cover"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate text-sm font-medium">
                                        Token #{auction.tokenId}
                                      </p>
                                      {auction.auctionType === 'spotlight' ? (
                                        <Badge variant="default" className="text-[10px]">
                                          Spotlight
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-[10px]">
                                          Side
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {auction.bidCount} bids • {auction.sellerName}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <StatusBadge status={auction.status} />
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    setExpandedAuction(
                                      expandedAuction === auction.id ? null : auction.id,
                                    )
                                  }
                                  className="mt-2 text-xs text-primary hover:underline"
                                >
                                  {expandedAuction === auction.id
                                    ? 'An bid summary'
                                    : 'Xem bid summary'}
                                </button>

                                {expandedAuction === auction.id && (
                                  <BidHistorySection auctionId={auction.id} />
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Revenue / detailed stats breakdown */}
          {detailedStats && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue &amp; Spectator Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  {[
                    { key: 'total_avax_volume', label: 'Total AVAX Volume' },
                    { key: 'ogn_burned_bids', label: 'OGN Burned (bids)' },
                    { key: 'ogn_burned_entry_fees', label: 'OGN Burned (entry fees)' },
                    { key: 'total_spectator_bets', label: 'Spectator Bets' },
                    { key: 'total_bet_pool', label: 'Bet Pool (OGN)' },
                    { key: 'winning_bets', label: 'Winning Bets' },
                    { key: 'losing_bets', label: 'Losing Bets' },
                    { key: 'total_bet_payout', label: 'Bet Payout (OGN)' },
                    { key: 'avg_bids_per_auction', label: 'Avg Bids/Auction' },
                  ].map(({ key, label }) => (
                    <div key={key} className="rounded bg-muted/30 p-2">
                      <p className="text-muted-foreground">{label}</p>
                      <p className="font-medium">
                        {typeof detailedStats[key] === 'number'
                          ? Number(detailedStats[key]).toLocaleString()
                          : String(detailedStats[key] ?? '—')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ======================== SPOTLIGHT PICKER MODAL ======================== */}
      <Dialog
        open={!!spotlightSessionId}
        onOpenChange={() => {
          setSpotlightSessionId(null);
          setSelectedSpotlights([]);
        }}
      >
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Star className="mr-2 inline h-5 w-5 text-amber-500" />
              Chon Spotlight NFTs
            </DialogTitle>
          </DialogHeader>

          {/* Suggestions */}
          {suggestionsRes && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium">Goi y (gia cao nhat):</p>
              <div className="flex flex-wrap gap-2">
                {(suggestionsRes?.byPrice || []).slice(0, 3).map((s: any) => {
                  const q = s.queue || s;
                  return (
                    <Badge
                      key={q.id}
                      variant={selectedSpotlights.includes(q.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSpotlight(q.id)}
                    >
                      {q.nftName || `#${q.tokenId}`} ({q.startPriceAvax} AVAX)
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Queue list */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Da chon: {selectedSpotlights.length}</p>
            {queuedItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Khong co NFT nao dang cho
              </p>
            ) : (
              queuedItems.map((item) => {
                const q = item.queue || (item as any);
                const isChecked = selectedSpotlights.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`flex cursor-pointer items-center gap-3 rounded border p-2 transition-colors ${
                      isChecked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSpotlight(q.id)}
                  >
                    <Checkbox checked={isChecked} />
                    {q.nftImageUrl && (
                      <img src={q.nftImageUrl} alt="" className="h-10 w-10 rounded" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{q.nftName || `Token #${q.tokenId}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.nftRarity && `${q.nftRarity} | `}
                        {q.startPriceAvax} AVAX
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button
            onClick={handleAssignSpotlights}
            disabled={selectedSpotlights.length === 0 || assignSpotlights.isPending}
            className="w-full"
          >
            {assignSpotlights.isPending
              ? 'Dang gan...'
              : `Gan ${selectedSpotlights.length} Spotlight`}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
