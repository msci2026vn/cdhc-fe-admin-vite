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
import { Gavel, Plus, Star, Tag, Zap, XCircle, RefreshCw } from 'lucide-react';
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

export default function AuctionAdminPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [spotlightSessionId, setSpotlightSessionId] = useState<string | null>(null);
  const [selectedSpotlights, setSelectedSpotlights] = useState<string[]>([]);

  const { data: sessionsRes, isLoading: sessionsLoading } = useAdminSessions();
  const { data: queueRes, isLoading: queueLoading } = useAdminQueue();
  const { data: statsRes } = useAuctionStats();
  const { data: suggestionsRes, refetch: fetchSuggestions } = useSpotlightSuggestions();

  const createSession = useCreateSession();
  const assignSpotlights = useAssignSpotlights();
  const assignSides = useAssignSides();
  const activateSession = useActivateSession();
  const cancelSession = useCancelSession();

  const sessions: AuctionSession[] = sessionsRes ?? [];
  const queueItems: AuctionQueueItem[] = queueRes ?? [];
  const stats = statsRes ?? null;

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
    const q = item.queue || item;
    return (q as any).status === 'queued';
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
                    {q.nft_image_url && (
                      <img
                        src={q.nft_image_url}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{q.nft_name || `Token #${q.token_id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {q.nft_rarity && `${q.nft_rarity} | `}
                        {q.start_price_avax} AVAX
                        {item.seller_name && ` | by ${item.seller_name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={q.status} />
                      {q.assigned_type && (
                        <p className="mt-1 text-xs text-muted-foreground">{q.assigned_type}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
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
                      {q.nft_name || `#${q.token_id}`} ({q.start_price_avax} AVAX)
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
                    {q.nft_image_url && (
                      <img src={q.nft_image_url} alt="" className="h-10 w-10 rounded" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{q.nft_name || `Token #${q.token_id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.nft_rarity && `${q.nft_rarity} | `}
                        {q.start_price_avax} AVAX
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
