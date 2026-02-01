/**
 * OAuth Debug Utility
 * Comprehensive logging for OAuth flow debugging
 */

interface LogEntry {
  timestamp: number;
  type: string;
  message: string;
  data?: unknown;
}

export class OAuthDebugger {
  private static instance: OAuthDebugger;
  private logs: LogEntry[] = [];

  private constructor() {
    this.log('init', 'OAuth Debugger initialized');
    if (typeof window !== 'undefined') {
      this.checkWindowState();
      this.checkHeaders();
    }
  }

  static getInstance(): OAuthDebugger {
    if (!OAuthDebugger.instance) {
      OAuthDebugger.instance = new OAuthDebugger();
    }
    return OAuthDebugger.instance;
  }

  log(type: string, message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      type,
      message,
      data,
    };

    this.logs.push(entry);

    // Console log voi mau sac
    const color = this.getColor(type);
    console.log(
      `%c[OAuth Debug ${type}]%c ${message}`,
      `color: ${color}; font-weight: bold`,
      'color: inherit',
      data || ''
    );
  }

  private getColor(type: string): string {
    const colors: Record<string, string> = {
      init: '#00ff00',
      error: '#ff0000',
      success: '#00aa00',
      warning: '#ff8800',
      info: '#0088ff',
      network: '#8800ff',
      state: '#ff00ff',
    };
    return colors[type] || '#888888';
  }

  checkWindowState() {
    this.log('state', 'Window State Check', {
      origin: window.location.origin,
      href: window.location.href,
      protocol: window.location.protocol,
      isSecure: window.isSecureContext,
      opener: !!window.opener,
      parent: window.parent !== window,
    });
  }

  async checkHeaders() {
    try {
      // Fetch current page de check headers
      const response = await fetch(window.location.href, {
        method: 'HEAD',
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        if (
          key.toLowerCase().includes('origin') ||
          key.toLowerCase().includes('security') ||
          key.toLowerCase().includes('policy')
        ) {
          headers[key] = value;
        }
      });

      this.log('info', 'Response Headers', headers);

      // Check COOP specifically
      const coop = response.headers.get('cross-origin-opener-policy');
      if (coop) {
        this.log('warning', `COOP Header Found: ${coop}`, {
          value: coop,
          problem:
            coop === 'same-origin'
              ? 'THIS BLOCKS OAUTH POPUP!'
              : 'May cause issues',
        });
      } else {
        this.log('success', 'No COOP header - Good!');
      }
    } catch (error) {
      this.log('error', 'Failed to check headers', error);
    }
  }

  logGoogleLoginStart() {
    this.log('info', 'Google Login Started');
    this.log('state', 'Pre-login Window State', {
      closed: false,
      focused: document.hasFocus(),
      visible: document.visibilityState,
    });
  }

  logGoogleLoginSuccess(response: { credential?: string; clientId?: string }) {
    this.log('success', 'Google Login Success', {
      hasCredential: !!response.credential,
      credentialLength: response.credential?.length,
      clientId: response.clientId,
    });
  }

  logGoogleLoginError(error: unknown) {
    this.log('error', 'Google Login Error', {
      error: String(error),
      type: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  logApiCall(endpoint: string, method: string) {
    this.log('network', `API Call: ${method} ${endpoint}`);
  }

  logApiResponse(endpoint: string, status: number, data: unknown) {
    const type = status >= 200 && status < 300 ? 'success' : 'error';
    this.log(type, `API Response: ${status} ${endpoint}`, data);
  }

  logApiError(endpoint: string, error: unknown) {
    this.log('error', `API Error: ${endpoint}`, {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  logCookies() {
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && (key.includes('Token') || key.includes('auth'))) {
          acc[key] = value ? '[REDACTED]' : 'empty';
        }
        return acc;
      },
      {} as Record<string, string>
    );

    this.log('info', 'Cookies Check', cookies);
  }

  exportLogs() {
    const logsJson = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oauth-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.log('info', 'Logs exported');
  }

  printSummary() {
    console.group('OAuth Debug Summary');
    console.log('Total logs:', this.logs.length);
    console.log('Errors:', this.logs.filter((l) => l.type === 'error').length);
    console.log('Warnings:', this.logs.filter((l) => l.type === 'warning').length);
    console.log('Success:', this.logs.filter((l) => l.type === 'success').length);
    console.groupEnd();
  }

  getLogs() {
    return this.logs;
  }
}

// Export singleton instance
export const oauthDebug =
  typeof window !== 'undefined' ? OAuthDebugger.getInstance() : null;

// Make available globally for console access
if (typeof window !== 'undefined') {
  (window as Window & { oauthDebug?: OAuthDebugger }).oauthDebug =
    OAuthDebugger.getInstance();
}
