import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'https://sta.cdhc.vn';

export type UIPosition = {
  left: string;
  top: string;
  width: string;
  height: string;
};

export type UIPositionsMap = Record<string, UIPosition>;

export type ScreenInfo = {
  screen: string;
  updatedAt: string;
  updatedBy: string;
};

// GET /api/ui-config/screens — list tất cả screens
export function useUIScreens() {
  return useQuery<ScreenInfo[]>({
    queryKey: ['ui-config', 'screens'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/ui-config/screens`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });
}

// GET /api/ui-config?screen=X — positions của 1 screen
export function useUIPositions(screen: string) {
  return useQuery<UIPositionsMap | null>({
    queryKey: ['ui-config', 'positions', screen],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/ui-config?screen=${screen}`, {
        credentials: 'include',
      });
      const json = await res.json();
      return json.data;
    },
    enabled: !!screen,
  });
}

// POST /api/ui-config/admin — save positions
export function useUISave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ screen, data }: { screen: string; data: UIPositionsMap }) => {
      const res = await fetch(`${API_BASE}/api/ui-config/admin`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screen, data }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (_, { screen }) => {
      toast.success('Đã lưu layout thành công!');
      queryClient.invalidateQueries({ queryKey: ['ui-config', 'positions', screen] });
      queryClient.invalidateQueries({ queryKey: ['ui-config', 'screens'] });
    },
    onError: (err: Error) => {
      toast.error(`Lưu thất bại: ${err.message}`);
    },
  });
}

// DELETE /api/ui-config/admin?screen=X — reset về default
export function useUIReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (screen: string) => {
      const res = await fetch(`${API_BASE}/api/ui-config/admin?screen=${screen}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (_, screen) => {
      toast.success('Đã reset về mặc định!');
      queryClient.invalidateQueries({ queryKey: ['ui-config', 'positions', screen] });
      queryClient.invalidateQueries({ queryKey: ['ui-config', 'screens'] });
    },
    onError: (err: Error) => {
      toast.error(`Reset thất bại: ${err.message}`);
    },
  });
}
