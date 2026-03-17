# 🖥️ Organic Kingdom — Admin Dashboard

![Live](https://img.shields.io/badge/Live-admintest.cdhc.vn-brightgreen)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6)
![Vite](https://img.shields.io/badge/Vite-7-646CFF)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4)
![License](https://img.shields.io/badge/License-MIT-yellow)

> Internal operations dashboard for [Organic Kingdom](https://game.cdhc.vn) — a Web3 farming game on Avalanche.
> Manages users, game economy, NFTs, IoT devices, blockchain ops, and analytics.

**[🖥️ Admin Panel](https://admintest.cdhc.vn)** · **[🎮 Live Game](https://game.cdhc.vn)** · **[🔗 API Health](https://sta.cdhc.vn/health)**

---

## 🎯 What It Does

Full-featured admin dashboard for managing the entire Organic Kingdom ecosystem:

- **User Management** — search, view profiles, ban/unban, grant VIP/OGN
- **Game Economy** — OGN conversion tracking, shop pricing, VIP revenue
- **NFT & Marketplace** — listing oversight, auction management, transaction history
- **World Boss** — event creation, reward config, raid leaderboards
- **IoT & RWA** — sensor monitoring, delivery tracking, device management
- **Blockchain Ops** — wallet audit, wallet monitoring, chain proof verification
- **Content & News** — rich text editor (Tiptap), scheduled publishing
- **Analytics** — player stats, top holders, activity logs

---

## ✨ Admin Modules

23 dashboard modules + authentication:

| #   | Module             | Description                                  |
| --- | ------------------ | -------------------------------------------- |
| 1   | 📊 Dashboard       | Overview stats, key metrics                  |
| 2   | 👤 Users           | User list, search, profile editor, ban/unban |
| 3   | 👨‍💼 Staff           | Staff management, role assignment            |
| 4   | 📋 Activity Logs   | User activity audit trail                    |
| 5   | 🔨 Auction         | Auction session manager, bid monitor         |
| 6   | ⛓️ Chain Proof     | On-chain proof verification                  |
| 7   | 🔄 Conversion      | OGN/seed conversion requests                 |
| 8   | 🚚 Delivery        | RWA delivery order tracking                  |
| 9   | 📧 Email Changes   | Email change request management              |
| 10  | 📁 File Manager    | Server file browser                          |
| 11  | 🔧 Legacy Recovery | Legacy data migration tools                  |
| 12  | 🏪 Marketplace     | NFT listing oversight                        |
| 13  | 📡 Monitoring      | Server metrics, health checks                |
| 14  | 📰 News            | Rich text editor (Tiptap), publish/schedule  |
| 15  | 🔔 Notifications   | Push notification management                 |
| 16  | ⚙️ Settings        | System configuration                         |
| 17  | 🏆 Top Holders     | OGN/NFT top holder rankings                  |
| 18  | 💳 Topup           | Payment order management                     |
| 19  | 🎨 UI Editor       | Dynamic UI configuration editor              |
| 20  | 💎 VIP Config      | VIP tier & pricing configuration             |
| 21  | 🔍 Wallet Audit    | Wallet transaction auditing                  |
| 22  | 👁️ Wallet Monitor  | Real-time wallet balance monitoring          |
| 23  | 👹 World Boss      | Boss event creator, reward manager           |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│         ADMIN DASHBOARD (This Repo)           │
│    React 19 + Vite 7 + TypeScript + Tailwind  │
│   TanStack Query + Zustand + React Router v7  │
│         shadcn/ui + Recharts + Tiptap         │
└────────────────────┬─────────────────────────┘
                     │ REST API (JWT + 2FA)
                     ▼
┌──────────────────────────────────────────────┐
│            BACKEND API (cdhc-be)              │
│        Bun.js + Hono + Drizzle ORM            │
│    PostgreSQL + Redis + Colyseus + viem       │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Technology                                                              | Purpose                 |
| ----------------------------------------------------------------------- | ----------------------- |
| [React 19](https://react.dev)                                           | UI framework            |
| [Vite 7](https://vite.dev)                                              | Build tool + HMR        |
| [TypeScript](https://www.typescriptlang.org)                            | Type safety             |
| [TanStack Query v5](https://tanstack.com/query)                         | Server state + caching  |
| [Zustand v5](https://zustand.docs.pmnd.rs)                              | Client state management |
| [React Router v7](https://reactrouter.com)                              | Routing                 |
| [Tailwind CSS 3](https://tailwindcss.com)                               | Utility-first styling   |
| [shadcn/ui](https://ui.shadcn.com) (Radix)                              | Component library       |
| [Recharts 3](https://recharts.org)                                      | Dashboard charts        |
| [Tiptap](https://tiptap.dev)                                            | Rich text editor (news) |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Form validation         |
| [Lucide React](https://lucide.dev)                                      | Icons                   |
| [Sonner](https://sonner.emilkowal.dev)                                  | Toast notifications     |

### Dev Tools

| Tool                | Purpose              |
| ------------------- | -------------------- |
| ESLint + Prettier   | Linting & formatting |
| Husky + lint-staged | Pre-commit hooks     |
| commitlint          | Conventional commits |
| cspell              | Spell checking       |
| knip                | Dead code detection  |

---

## 📂 Project Structure

```
src/
├── main.tsx                    # Entry point
├── app/
│   ├── router.tsx              # Route definitions
│   ├── providers.tsx           # Query + Auth providers
│   ├── globals.css             # Tailwind + global styles
│   ├── (auth)/                 # Auth routes
│   │   ├── login/              # Google OAuth login
│   │   └── verify-2fa/         # Two-factor verification
│   └── (dashboard)/            # Protected admin routes
│       ├── dashboard/          # Overview stats
│       ├── users/              # User management
│       ├── staff/              # Staff management
│       ├── activity-logs/      # Audit trail
│       ├── auction/            # Auction management
│       ├── chain-proof/        # On-chain verification
│       ├── conversion/         # OGN conversion
│       ├── delivery/           # RWA delivery tracking
│       ├── email-changes/      # Email change requests
│       ├── file-manager/       # Server files
│       ├── legacy-recovery/    # Data migration
│       ├── marketplace/        # NFT marketplace
│       ├── monitoring/         # Server health
│       ├── news/               # Content editor
│       ├── notifications/      # Push notifications
│       ├── settings/           # System config
│       ├── top-holders/        # Rankings
│       ├── topup/              # Payment orders
│       ├── ui-editor/          # UI config editor
│       ├── vip-config/         # VIP management
│       ├── wallet-audit/       # Transaction audit
│       ├── wallet-monitor/     # Balance monitoring
│       └── world-boss/         # Boss events
├── components/
│   ├── ui/                     # shadcn/ui components (23 components)
│   ├── layout/                 # Sidebar, Header
│   ├── stats/                  # Dashboard stat cards
│   ├── news/                   # Tiptap editor components
│   ├── users/                  # User-specific components
│   ├── world-boss/             # Boss management components
│   └── ...                     # Module-specific components
├── hooks/                      # 24 custom hooks (useUsers, useNews, useAuth, ...)
├── stores/                     # Zustand store (authStore)
├── lib/                        # API client, utils, permissions
└── types/                      # TypeScript type definitions
```

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.0 (or Node.js 18+)
- Backend API running ([cdhc-be](https://github.com/cdhc-app/cdhc-be))

### Installation

```bash
git clone <repo-url>
cd cdhc-admin-vite

bun install

cp .env.example .env.local
# Edit .env.local with your values

bun dev            # http://localhost:5173
```

### Scripts

| Command               | Description                               |
| --------------------- | ----------------------------------------- |
| `bun dev`             | Dev server with HMR                       |
| `bun run build`       | Production build (tsc + vite)             |
| `bun run preview`     | Preview production build                  |
| `bun run lint`        | ESLint check                              |
| `bun run lint:fix`    | ESLint auto-fix                           |
| `bun run format`      | Prettier format                           |
| `bun run type-check`  | TypeScript check                          |
| `bun run spell-check` | cspell check                              |
| `bun run dead-code`   | knip dead code detection                  |
| `bun run quality`     | Full quality check (type + lint + format) |

---

## 🌐 Environment Variables

| Variable                | Required | Description                              |
| ----------------------- | -------- | ---------------------------------------- |
| `VITE_API_URL`          | Yes      | Backend API base URL                     |
| `VITE_GOOGLE_CLIENT_ID` | Yes      | Google OAuth client ID                   |
| `VITE_PUBLIC_SITE_URL`  | No       | Public site URL (for news preview links) |

> See [`.env.example`](.env.example) for the full template.

---

## 🔐 Access Control

- Admin login via **Google OAuth** (restricted to authorized accounts)
- **Two-factor authentication** (2FA) required for sensitive operations
- JWT-based session management
- Role-based permissions per module

---

## 📄 License

MIT
