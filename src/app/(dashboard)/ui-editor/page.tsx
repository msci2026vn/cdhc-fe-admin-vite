'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Save, RotateCcw, Move, Monitor, ChevronRight } from 'lucide-react';
import {
  useUIScreens,
  useUIPositions,
  useUISave,
  useUIReset,
  UIPositionsMap,
  UIPosition,
} from '@/hooks/useUIConfig';

// Default fallback từ ui-match.json — hardcode keys
const SCREEN_OPTIONS = [
  { value: 'world-boss', label: 'World Boss Battle' },
  { value: 'campaign', label: 'Campaign Battle' },
  { value: 'pvp', label: 'PVP Battle' },
  { value: 'farm', label: 'Farm Screen' },
];

const CANVAS_W = 390;
const CANVAS_H = 693;

export default function UIEditorPage() {
  const [selectedScreen, setSelectedScreen] = useState('world-boss');
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [localPos, setLocalPos] = useState<UIPositionsMap>({});
  const [isDirty, setIsDirty] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { data: screens } = useUIScreens();
  const { data: remotePos, isLoading } = useUIPositions(selectedScreen);
  const { mutate: save, isPending: isSaving } = useUISave();
  const { mutate: reset, isPending: isResetting } = useUIReset();

  // Sync remote → local khi load
  useEffect(() => {
    if (remotePos) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPos(remotePos);

      setIsDirty(false);
    }
  }, [remotePos, selectedScreen]);

  // Drag to move element
  const handleMouseDown = useCallback(
    (name: string, e: React.MouseEvent) => {
      e.preventDefault();
      setSelectedEl(name);
      const canvas = canvasRef.current?.getBoundingClientRect();
      if (!canvas) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const pos = localPos[name];
      if (!pos) return;
      const startLeft = parseFloat(pos.left);
      const startTop = parseFloat(pos.top);
      const scaleX = CANVAS_W / canvas.width;
      const scaleY = CANVAS_H / canvas.height;

      const onMove = (mv: MouseEvent) => {
        const dx = (mv.clientX - startX) * scaleX;
        const dy = (mv.clientY - startY) * scaleY;
        setLocalPos((prev) => ({
          ...prev,
          [name]: {
            ...prev[name],
            left: `${+(startLeft + (dx / CANVAS_W) * 100).toFixed(2)}%`,
            top: `${+(startTop + (dy / CANVAS_H) * 100).toFixed(2)}%`,
          },
        }));
        setIsDirty(true);
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [localPos],
  );

  // Manual coord edit
  const handleCoordChange = (field: keyof UIPosition, value: string) => {
    if (!selectedEl) return;
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setLocalPos((prev) => ({
      ...prev,
      [selectedEl]: { ...prev[selectedEl], [field]: `${num}%` },
    }));
    setIsDirty(true);
  };

  // Nudge ±0.5%
  const nudge = (dx: number, dy: number) => {
    if (!selectedEl) return;
    setLocalPos((prev) => ({
      ...prev,
      [selectedEl]: {
        ...prev[selectedEl],
        left: `${+(parseFloat(prev[selectedEl].left) + dx).toFixed(2)}%`,
        top: `${+(parseFloat(prev[selectedEl].top) + dy).toFixed(2)}%`,
      },
    }));
    setIsDirty(true);
  };

  const handleSave = () => save({ screen: selectedScreen, data: localPos });
  const handleReset = () => reset(selectedScreen);
  const sel = selectedEl ? localPos[selectedEl] : null;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="w-6 h-6" /> UI Editor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kéo thả để chỉnh vị trí các element. Save để áp dụng ngay cho tất cả user.
          </p>
        </div>
        <div className="flex gap-2">
          {isDirty && <Badge variant="destructive">Chưa lưu</Badge>}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isResetting}>
                <RotateCcw className="w-4 h-4 mr-1" /> Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset về mặc định?</AlertDialogTitle>
                <AlertDialogDescription>
                  Xóa toàn bộ config đã lưu của screen "{selectedScreen}". Frontend sẽ fallback về
                  ui-match.json mặc định.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} disabled={isSaving || !isDirty}>
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* Tabs — mỗi screen 1 tab */}
      <Tabs
        value={selectedScreen}
        onValueChange={(v) => {
          setSelectedScreen(v);
          setSelectedEl(null);
          setIsDirty(false);
          setLocalPos({});
        }}
      >
        <TabsList className="w-full justify-start">
          {SCREEN_OPTIONS.map((s) => (
            <TabsTrigger key={s.value} value={s.value} className="relative">
              {s.label}
              {/* Dot nếu screen đã có data lưu */}
              {screens?.some((sc) => sc.screen === s.value) && (
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {SCREEN_OPTIONS.map((s) => (
          <TabsContent key={s.value} value={s.value} className="mt-4">
            {/* Saved info bar */}
            {screens?.find((sc) => sc.screen === s.value) && (
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                <Badge variant="secondary">
                  Đã lưu •{' '}
                  {new Date(screens.find((sc) => sc.screen === s.value)!.updatedAt).toLocaleString(
                    'vi',
                  )}{' '}
                  • {screens.find((sc) => sc.screen === s.value)!.updatedBy}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-[1fr_300px] gap-4 items-start">
              {/* Canvas */}
              <Card className="overflow-hidden">
                <CardContent className="pt-4">
                  <div className="flex justify-center">
                    <div
                      ref={canvasRef}
                      className="relative bg-gray-900 rounded overflow-hidden"
                      style={{
                        width: Math.round(CANVAS_W * 0.75),
                        height: Math.round(CANVAS_H * 0.75),
                      }}
                    >
                      <div
                        style={{
                          transform: 'scale(0.75)',
                          transformOrigin: 'top left',
                          width: CANVAS_W,
                          height: CANVAS_H,
                          position: 'relative',
                        }}
                      >
                        {/* Zone guides */}
                        {[
                          {
                            top: '0%',
                            height: '22%',
                            label: 'Boss Area',
                            color: 'rgba(248,81,73,0.05)',
                          },
                          {
                            top: '22%',
                            height: '12%',
                            label: 'Player Area',
                            color: 'rgba(63,185,80,0.05)',
                          },
                          {
                            top: '34%',
                            height: '46%',
                            label: 'Gem Board',
                            color: 'rgba(88,166,255,0.05)',
                          },
                          {
                            top: '80%',
                            height: '20%',
                            label: 'Bottom HUD',
                            color: 'rgba(227,179,65,0.05)',
                          },
                        ].map((z) => (
                          <div
                            key={z.label}
                            style={{
                              position: 'absolute',
                              top: z.top,
                              height: z.height,
                              left: 0,
                              right: 0,
                              background: z.color,
                              borderBottom: '1px dashed rgba(255,255,255,0.05)',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                right: 4,
                                top: 2,
                                fontSize: 9,
                                color: 'rgba(255,255,255,0.2)',
                              }}
                            >
                              {z.label}
                            </span>
                          </div>
                        ))}

                        {isLoading ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Skeleton className="w-32 h-8" />
                          </div>
                        ) : Object.keys(localPos).length === 0 ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/30">
                            <Monitor className="w-8 h-8" />
                            <span className="text-xs">Chưa có data — dùng default</span>
                          </div>
                        ) : (
                          Object.entries(localPos).map(([name, pos]) => (
                            <div
                              key={name}
                              style={{
                                position: 'absolute',
                                left: pos.left,
                                top: pos.top,
                                width: pos.width,
                                height: pos.height,
                                border:
                                  selectedEl === name
                                    ? '2px solid #f85149'
                                    : '1px dashed rgba(227,179,65,0.4)',
                                background:
                                  selectedEl === name
                                    ? 'rgba(248,81,73,0.15)'
                                    : 'rgba(227,179,65,0.04)',
                                cursor: 'move',
                                boxSizing: 'border-box',
                              }}
                              onMouseDown={(e) => handleMouseDown(name, e)}
                            >
                              <span
                                style={{
                                  position: 'absolute',
                                  top: 1,
                                  left: 2,
                                  fontSize: 7,
                                  color: selectedEl === name ? '#f85149' : '#e3b341',
                                  background: 'rgba(0,0,0,0.8)',
                                  padding: '0 2px',
                                  borderRadius: 2,
                                  whiteSpace: 'nowrap',
                                  maxWidth: '90%',
                                  overflow: 'hidden',
                                }}
                              >
                                {name}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Canvas 390×693px (75%) • Click + kéo để di chuyển
                  </p>
                </CardContent>
              </Card>

              {/* Right panel */}
              <div className="space-y-3">
                {/* Element list */}
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm">
                      Elements ({Object.keys(localPos).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-64 overflow-y-auto">
                      {Object.keys(localPos).map((name) => (
                        <div
                          key={name}
                          className={`flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-accent text-xs border-b border-border/50 ${selectedEl === name ? 'bg-accent font-medium' : ''}`}
                          onClick={() => setSelectedEl(name)}
                        >
                          <span className="truncate">{name}</span>
                          {selectedEl === name && (
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                      {Object.keys(localPos).length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Chưa có element — cần load data từ game frontend
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected element coords */}
                {selectedEl && sel ? (
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-sm text-red-400 flex items-center gap-1">
                        <Move className="w-3 h-3" /> {selectedEl}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(['left', 'top', 'width', 'height'] as const).map((field) => (
                        <div key={field} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-12 capitalize">
                            {field}
                          </span>
                          <Input
                            value={parseFloat(sel[field])}
                            type="number"
                            step="0.1"
                            className="h-7 text-xs font-mono"
                            onChange={(e) => handleCoordChange(field, e.target.value)}
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      ))}
                      <div className="pt-1">
                        <p className="text-xs text-muted-foreground mb-1">Nudge ±0.5%</p>
                        <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
                          <div />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => nudge(0, -0.5)}
                          >
                            ↑
                          </Button>
                          <div />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => nudge(-0.5, 0)}
                          >
                            ←
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => nudge(0, 0.5)}
                          >
                            ↓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => nudge(0.5, 0)}
                          >
                            →
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono text-center">
                        L:{sel.left} T:{sel.top}
                        <br />
                        W:{sel.width} H:{sel.height}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground text-sm">
                      Click vào element để chỉnh vị trí
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
