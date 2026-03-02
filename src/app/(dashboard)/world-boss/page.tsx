import { useState } from 'react';
import { Swords, Users, Zap, Shield, Clock } from 'lucide-react';
import { CreateBossDialog } from '@/components/world-boss/CreateBossDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWorldBossCurrent, useWorldBossHistory, useAdminEndBoss } from '@/hooks/useWorldBoss';
import { ELEMENT_CONFIG, DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/types/world-boss';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
  return Math.floor(diff / 86400) + ' ngày trước';
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

export default function WorldBossPage() {
  const { data: currentData, isLoading: currentLoading } = useWorldBossCurrent();
  const { data: historyData, isLoading: historyLoading } = useWorldBossHistory(20);
  const endBoss = useAdminEndBoss();
  const [createOpen, setCreateOpen] = useState(false);

  const boss = currentData?.data?.boss;
  const history = historyData?.data?.bosses ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Swords className="w-7 h-7 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-100">World Boss</h1>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Swords className="w-4 h-4" />+ Tạo Boss Mới
        </Button>
        <CreateBossDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>

      {/* Current Boss Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <span>Boss Hiện Tại</span>
            {currentLoading && (
              <span className="text-xs text-gray-500 font-normal">Đang tải...</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentData?.data?.active || !boss ? (
            <div className="text-center py-10 text-gray-500">
              <span className="text-4xl">🌾</span>
              <p className="mt-2">Không có boss active</p>
              <p className="text-xs mt-1">Sensor đang bình thường hoặc boss chưa được tạo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Boss name + badges */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-100">{boss.bossName}</h2>
                  {boss.bossTitle && (
                    <p className="text-sm text-gray-400 mt-0.5">{boss.bossTitle}</p>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {/* Element */}
                    {ELEMENT_CONFIG[boss.element] && (
                      <Badge className="bg-gray-700 text-gray-200">
                        {ELEMENT_CONFIG[boss.element].icon} {ELEMENT_CONFIG[boss.element].label}
                      </Badge>
                    )}
                    {/* Weakness */}
                    {ELEMENT_CONFIG[boss.weakness] && (
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        Yếu: {ELEMENT_CONFIG[boss.weakness].icon}{' '}
                        {ELEMENT_CONFIG[boss.weakness].label}
                      </Badge>
                    )}
                    {/* Difficulty */}
                    {DIFFICULTY_CONFIG[boss.difficulty] && (
                      <Badge className={DIFFICULTY_CONFIG[boss.difficulty].color}>
                        {DIFFICULTY_CONFIG[boss.difficulty].label}
                      </Badge>
                    )}
                  </div>
                </div>
                {/* End boss button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shrink-0"
                      disabled={endBoss.isPending}
                    >
                      {endBoss.isPending ? 'Đang xử lý...' : '🛑 Kết Thúc Boss'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700 text-gray-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kết thúc boss?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Boss <strong className="text-gray-200">{boss.bossName}</strong> sẽ bị kết
                        thúc. Phần thưởng sẽ được phân phối cho{' '}
                        <strong className="text-gray-200">{boss.participantCount}</strong> người
                        chơi.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700">
                        Huỷ
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => endBoss.mutate({ eventId: boss.id, reason: 'manual' })}
                      >
                        Kết Thúc
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* HP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">HP</span>
                  <span className="text-gray-300 font-mono">
                    {(boss.currentHp ?? 0).toLocaleString()} /{' '}
                    {(boss.stats.max_hp ?? boss.stats.hp).toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={(boss.hpPercent ?? 0) * 100}
                  className="h-3 bg-gray-700 [&>div]:bg-red-500"
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-100">{boss.participantCount}</p>
                  <p className="text-xs text-gray-400">Người chơi</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-100">
                    {formatCountdown(boss.timeRemaining ?? 0)}
                  </p>
                  <p className="text-xs text-gray-400">Còn lại</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <Zap className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-100">{boss.stats.atk}</p>
                  <p className="text-xs text-gray-400">ATK</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <Shield className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-100">{boss.stats.def}</p>
                  <p className="text-xs text-gray-400">DEF</p>
                </div>
              </div>

              {/* Skills */}
              {boss.skills && boss.skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {boss.skills.map((skill: { name: string; description: string }, i: number) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-gray-600 text-gray-300 text-xs"
                        title={skill.description}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Lịch Sử Boss</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="p-6 text-center text-gray-500 text-sm">Đang tải...</div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Chưa có lịch sử</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-gray-400">Boss</TableHead>
                  <TableHead className="text-gray-400">Element</TableHead>
                  <TableHead className="text-gray-400">Độ khó</TableHead>
                  <TableHead className="text-gray-400">Trạng thái</TableHead>
                  <TableHead className="text-gray-400 text-right">Người chơi</TableHead>
                  <TableHead className="text-gray-400 text-right">Tổng sát thương</TableHead>
                  <TableHead className="text-gray-400">Bắt đầu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry: import('@/types/world-boss').WorldBossHistoryEntry) => {
                  const el = ELEMENT_CONFIG[entry.element];
                  const diff = DIFFICULTY_CONFIG[entry.difficulty];
                  const stat = STATUS_CONFIG[entry.status];
                  return (
                    <TableRow
                      key={entry.id}
                      className="border-gray-700 hover:bg-gray-700/50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-200">{entry.bossName}</TableCell>
                      <TableCell>
                        {el ? (
                          <span className={`${el.color} text-sm`}>
                            {el.icon} {el.label}
                          </span>
                        ) : (
                          <span className="text-gray-500">{entry.element}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {diff ? (
                          <Badge className={`${diff.color} text-xs`}>{diff.label}</Badge>
                        ) : (
                          <span className="text-gray-500">{entry.difficulty}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {stat ? (
                          <Badge className={`${stat.color} text-xs`}>{stat.label}</Badge>
                        ) : (
                          <span className="text-gray-500">{entry.status}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {entry.totalParticipants}
                      </TableCell>
                      <TableCell className="text-right text-gray-300 font-mono text-sm">
                        {(entry.totalDamageDealt ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {timeAgo(entry.startedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
