/**
 * Comprehensive Auth Flow Logger
 * Tracks every step of authentication process for debugging
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'network' | 'state';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  component: string;
  message: string;
  data?: unknown;
  stack?: string;
}

class AuthLogger {
  private logs: LogEntry[] = [];
  private enabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__authLogger = this;
    }
  }

  private log(level: LogLevel, component: string, message: string, data?: unknown, error?: Error) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      component,
      message,
      data,
      stack: error?.stack,
    };

    this.logs.push(entry);

    const colors: Record<LogLevel, string> = {
      info: '#0088ff',
      success: '#00ff00',
      warning: '#ff8800',
      error: '#ff0000',
      network: '#8800ff',
      state: '#ff00ff',
    };

    const emoji: Record<LogLevel, string> = {
      info: 'i',
      success: 'OK',
      warning: '!!',
      error: 'X',
      network: 'NET',
      state: 'STATE',
    };

    console.log(
      `%c[${emoji[level]}] [${component}] ${message}`,
      `color: ${colors[level]}; font-weight: bold`,
      data !== undefined ? data : ''
    );

    if (error && level === 'error') {
      console.error('Stack trace:', error.stack);
    }
  }

  info(component: string, message: string, data?: unknown) {
    this.log('info', component, message, data);
  }

  success(component: string, message: string, data?: unknown) {
    this.log('success', component, message, data);
  }

  warning(component: string, message: string, data?: unknown) {
    this.log('warning', component, message, data);
  }

  error(component: string, message: string, data?: unknown, error?: Error) {
    this.log('error', component, message, data, error);
  }

  network(component: string, message: string, data?: unknown) {
    this.log('network', component, message, data);
  }

  state(component: string, message: string, data?: unknown) {
    this.log('state', component, message, data);
  }

  apiCall(endpoint: string, method: string, data?: unknown) {
    this.network('API', `${method} ${endpoint}`, {
      method,
      endpoint,
      body: data,
      timestamp: new Date().toISOString(),
    });
  }

  apiResponse(endpoint: string, status: number, data: unknown, duration?: number) {
    const level = status >= 200 && status < 300 ? 'success' : 'error';
    this.log(level, 'API', `Response ${status} ${endpoint}`, {
      status,
      data,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  export() {
    const json = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.info('Logger', 'Logs exported');
  }

  summary() {
    console.group('Auth Flow Summary');
    console.log('Total logs:', this.logs.length);
    console.log('Errors:', this.logs.filter(l => l.level === 'error').length);
    console.log('Network calls:', this.logs.filter(l => l.level === 'network').length);
    console.log('State changes:', this.logs.filter(l => l.level === 'state').length);

    const errors = this.logs.filter(l => l.level === 'error');
    if (errors.length > 0) {
      console.group('Errors');
      errors.forEach(e => {
        console.error(`[${e.component}] ${e.message}`, e.data);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  clear() {
    this.logs = [];
    console.clear();
    this.info('Logger', 'Logs cleared');
  }

  getLogs() {
    return this.logs;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const authLogger = new AuthLogger();

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).authLogger = authLogger;
}
