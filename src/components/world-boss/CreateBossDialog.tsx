import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ELEMENT_CONFIG,
  DIFFICULTY_CONFIG,
  PRESET_OPTIONS,
  type AdminCreatePreset,
  type AdminCreateAI,
  type AdminCreateCustom,
} from '@/types/world-boss';
import { useAdminCreateBoss } from '@/hooks/useWorldBoss';

// ===== Zod Schemas =====

const presetSchema = z.object({
  mode: z.literal('preset'),
  preset: z.string().min(1, 'Chọn loài boss'),
  difficulty: z.string().optional(),
  durationMinutes: z.coerce.number().min(1).max(480).optional(),
  overrideHp: z.union([z.coerce.number().min(100), z.literal('')]).optional(),
});

const aiSchema = z.object({
  mode: z.literal('ai'),
  severity: z.string().min(1, 'Chọn severity'),
  temperature: z.coerce.number().min(-10).max(50).optional(),
  humidity: z.coerce.number().min(0).max(100).optional(),
  soilMoisture: z.coerce.number().min(0).max(100).optional(),
  soilPh: z.coerce.number().min(0).max(14).optional(),
  lightLevel: z.coerce.number().min(0).max(200000).optional(),
  durationMinutes: z.coerce.number().min(1).max(480).optional(),
});

const customSchema = z.object({
  mode: z.literal('custom'),
  bossName: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100),
  bossTitle: z.string().max(200).optional(),
  element: z.string().min(1, 'Chọn element'),
  weakness: z.string().min(1, 'Chọn weakness'),
  baseSprite: z.string().min(1, 'Chọn sprite'),
  difficulty: z.string().min(1, 'Chọn difficulty'),
  durationMinutes: z.coerce.number().min(1).max(480),
  hp: z.coerce.number().min(100, 'HP tối thiểu 100'),
  atk: z.coerce.number().min(10),
  def: z.coerce.number().min(1),
  critRate: z.coerce.number().min(0).max(100),
  storyPreview: z.string().max(300).optional(),
});

type PresetForm = z.infer<typeof presetSchema>;
type AiForm = z.infer<typeof aiSchema>;
type CustomForm = z.infer<typeof customSchema>;

// ===== Props =====

interface CreateBossDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DIFFICULTIES = ['normal', 'hard', 'extreme', 'catastrophic'] as const;

// ===== Component =====

export function CreateBossDialog({ open, onOpenChange }: CreateBossDialogProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'ai' | 'custom'>('preset');
  const createBoss = useAdminCreateBoss();

  const presetForm = useForm<PresetForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(presetSchema) as any,
    defaultValues: {
      mode: 'preset',
      preset: 'ray_nau',
      difficulty: 'hard',
      durationMinutes: 30,
      overrideHp: '',
    },
  });

  const aiForm = useForm<AiForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(aiSchema) as any,
    defaultValues: {
      mode: 'ai',
      severity: 'extreme',
      temperature: 33,
      humidity: 85,
      soilMoisture: 60,
      soilPh: 6.5,
      lightLevel: 10000,
      durationMinutes: 60,
    },
  });

  const customForm = useForm<CustomForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(customSchema) as any,
    defaultValues: {
      mode: 'custom',
      bossName: '',
      bossTitle: '',
      element: 'fire',
      weakness: 'water',
      baseSprite: 'ray_nau',
      difficulty: 'hard',
      durationMinutes: 60,
      hp: 5000000,
      atk: 500,
      def: 50,
      critRate: 15,
      storyPreview: '',
    },
  });

  function onSubmit() {
    if (activeTab === 'preset') {
      presetForm.handleSubmit((data) => {
        const payload: AdminCreatePreset = {
          mode: 'preset',
          preset: data.preset,
          difficulty: data.difficulty || undefined,
          overrides: {
            durationMinutes: data.durationMinutes || undefined,
            stats: data.overrideHp ? { hp: Number(data.overrideHp) } : undefined,
          },
        };
        createBoss.mutate(payload, { onSuccess: () => onOpenChange(false) });
      })();
      return;
    }

    if (activeTab === 'ai') {
      aiForm.handleSubmit((data) => {
        const payload: AdminCreateAI = {
          mode: 'ai',
          severity: data.severity,
          mockSensor: {
            temperature: data.temperature,
            humidity: data.humidity,
            soilMoisture: data.soilMoisture,
            soilPh: data.soilPh,
            lightLevel: data.lightLevel,
          },
          overrides: data.durationMinutes ? { durationMinutes: data.durationMinutes } : undefined,
        };
        createBoss.mutate(payload, { onSuccess: () => onOpenChange(false) });
      })();
      return;
    }

    if (activeTab === 'custom') {
      customForm.handleSubmit((data) => {
        const payload: AdminCreateCustom = {
          mode: 'custom',
          bossName: data.bossName,
          bossTitle: data.bossTitle || undefined,
          element: data.element,
          weakness: data.weakness,
          baseSprite: data.baseSprite,
          difficulty: data.difficulty,
          durationMinutes: data.durationMinutes,
          stats: { hp: data.hp, atk: data.atk, def: data.def, critRate: data.critRate },
          storyPreview: data.storyPreview || undefined,
        };
        createBoss.mutate(payload, { onSuccess: () => onOpenChange(false) });
      })();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-gray-900 border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-100">🎮 Tạo Boss Mới</DialogTitle>
          <DialogDescription className="text-gray-400">
            Chọn cách tạo boss để test.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="preset" className="data-[state=active]:bg-gray-700">
              ⚡ Preset
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-gray-700">
              🤖 AI
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-gray-700">
              🔧 Custom
            </TabsTrigger>
          </TabsList>

          {/* ===== Tab Preset ===== */}
          <TabsContent value="preset" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Loài boss</Label>
              <Controller
                control={presetForm.control}
                name="preset"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {PRESET_OPTIONS.map((p) => (
                        <SelectItem
                          key={p.value}
                          value={p.value}
                          className="text-gray-100 focus:bg-gray-700"
                        >
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Difficulty</Label>
              <Controller
                control={presetForm.control}
                name="difficulty"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d} className="text-gray-100 focus:bg-gray-700">
                          {DIFFICULTY_CONFIG[d]?.label ?? d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300">Thời gian (phút)</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...presetForm.register('durationMinutes')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Override HP</Label>
                <Input
                  type="number"
                  placeholder="mặc định"
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500"
                  {...presetForm.register('overrideHp')}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              ⚡ Spawn ngay, có sẵn story + skills. Nhanh nhất.
            </p>
          </TabsContent>

          {/* ===== Tab AI ===== */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Severity</Label>
              <Controller
                control={aiForm.control}
                name="severity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d} className="text-gray-100 focus:bg-gray-700">
                          {DIFFICULTY_CONFIG[d]?.label ?? d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {aiForm.formState.errors.severity && (
                <p className="text-xs text-red-500">{aiForm.formState.errors.severity.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300">Nhiệt độ (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...aiForm.register('temperature')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Độ ẩm (%)</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...aiForm.register('humidity')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Độ ẩm đất (%)</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...aiForm.register('soilMoisture')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">pH đất</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...aiForm.register('soilPh')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Ánh sáng (lux)</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...aiForm.register('lightLevel')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Thời gian (phút)</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...aiForm.register('durationMinutes')}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              🤖 AI tạo boss unique từ dữ liệu sensor giả. Mất 6-11 giây.
            </p>
          </TabsContent>

          {/* ===== Tab Custom ===== */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Tên boss *</Label>
                <Input
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500"
                  placeholder="Rầy Bạo Chúa Đầm Lầy"
                  {...customForm.register('bossName')}
                />
                {customForm.formState.errors.bossName && (
                  <p className="text-xs text-red-500">
                    {customForm.formState.errors.bossName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Danh hiệu</Label>
                <Input
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500"
                  placeholder="Chúa Tể Đồng Ruộng"
                  {...customForm.register('bossTitle')}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Element *</Label>
                <Controller
                  control={customForm.control}
                  name="element"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {Object.entries(ELEMENT_CONFIG).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-gray-100 focus:bg-gray-700">
                            {v.icon} {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Weakness *</Label>
                <Controller
                  control={customForm.control}
                  name="weakness"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {Object.entries(ELEMENT_CONFIG).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-gray-100 focus:bg-gray-700">
                            {v.icon} {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Sprite</Label>
                <Controller
                  control={customForm.control}
                  name="baseSprite"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {PRESET_OPTIONS.map((p) => (
                          <SelectItem
                            key={p.value}
                            value={p.value}
                            className="text-gray-100 focus:bg-gray-700"
                          >
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Difficulty *</Label>
                <Controller
                  control={customForm.control}
                  name="difficulty"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {DIFFICULTIES.map((d) => (
                          <SelectItem key={d} value={d} className="text-gray-100 focus:bg-gray-700">
                            {DIFFICULTY_CONFIG[d]?.label ?? d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Thời gian (phút) *</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...customForm.register('durationMinutes')}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">HP *</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...customForm.register('hp')}
                />
                {customForm.formState.errors.hp && (
                  <p className="text-xs text-red-500">{customForm.formState.errors.hp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">ATK</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...customForm.register('atk')}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">DEF</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...customForm.register('def')}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Crit Rate (%)</Label>
                <Input
                  type="number"
                  className="bg-gray-800 border-gray-600 text-gray-100"
                  {...customForm.register('critRate')}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Story tóm tắt</Label>
                <Textarea
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 resize-none"
                  placeholder="Mô tả ngắn về boss..."
                  rows={2}
                  {...customForm.register('storyPreview')}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              🔧 Tạo boss hoàn toàn tuỳ chỉnh. Story tự viết (nếu có).
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            onClick={() => onOpenChange(false)}
            disabled={createBoss.isPending}
          >
            Huỷ
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onSubmit}
            disabled={createBoss.isPending}
          >
            {createBoss.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {activeTab === 'ai' ? 'AI đang tạo... (~10s)' : 'Đang tạo...'}
              </>
            ) : (
              '🚀 Tạo Boss'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
