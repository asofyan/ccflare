# Project Context

## Purpose

ccflare is a load balancer proxy for the Claude API that distributes requests across multiple OAuth accounts to avoid rate limiting. It provides:

- **Zero Rate Limit Errors** - Intelligent request distribution across multiple accounts
- **Request-Level Analytics** - Track latency, token usage, and costs in real-time
- **Deep Debugging** - Full request/response logging and error traces
- **Multiple Interfaces** - Terminal UI (TUI), web dashboard, and REST API
- **Production Ready** - Automatic failover, token refresh handling, and SQLite persistence

## Tech Stack

### Runtime & Build
- **Bun** >= 1.2.8 - Runtime, package manager, and test runner
- **TypeScript** 5.0+ with strict mode enabled

### Frontend
- **React** 19 - UI framework for web dashboard
- **Ink** - React for CLI (TUI)
- **Radix UI** - Headless component library
- **Tailwind CSS** v4 - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching and caching
- **React Router** v7 - Client-side routing

### Backend
- **Bun HTTP Server** - Native Bun server
- **SQLite** - Built-in database via Better SQLite3
- **OAuth 2.0** - Claude account authentication

### Tooling
- **Biome** 2.1+ - Linting, formatting, and import organization
- **TypeScript** - Type checking via `tsc --noEmit`

### Monorepo Structure
- **Bun Workspaces** - Package management
- Path alias: `@ccflare/*` -> `packages/*/src`

## Project Conventions

### Code Style

Per `biome.json`:
- **Indentation**: Tabs (`indentStyle: "tab"`)
- **Quotes**: Double quotes (`quoteStyle: "double"`)
- **Import organization**: Auto-organize on save
- **Linter**: Biome recommended rules enabled

### After Code Changes

Always run in order:
1. `bun run lint` - Fix linting issues (Biome with --unsafe flag)
2. `bun run typecheck` - Check for type errors (TypeScript)
3. `bun run format` - Format code (Biome formatter)

### Architecture Patterns

**Monorepo Organization**:
```
apps/          - Deployment targets (server, tui, lander)
packages/      - Shared domain packages
  core/        - Core business logic
  core-di/     - Dependency injection container
  database/    - SQLite persistence layer
  providers/   - Claude API provider implementations
  proxy/       - HTTP proxy functionality
  load-balancer/ - Load balancing strategies
  http-api/    - REST API endpoints
  http-common/ - Shared HTTP utilities
  oauth-flow/  - OAuth authentication flow
  tui-core/    - Terminal UI business logic
  dashboard-web/ - Web dashboard UI
  cli-commands/ - CLI command implementations
  agents/      - AI agent integrations
  logger/      - Logging utilities
  config/      - Configuration management
  errors/      - Error types and handling
  types/       - Shared TypeScript types
  ui-common/   - Shared UI components
  ui-constants/ - UI constants and tokens
```

**Dependency Injection**: Use `@ccflare/core-di` for managing dependencies between packages.

**Path Aliases**: Import from packages using `@ccflare/package-name`.

### Testing Strategy

Currently **no automated tests** are present in the codebase. Testing is manual via:
1. TUI (`bun run ccflare`)
2. Web dashboard (`http://localhost:8080/dashboard`)
3. API endpoints

### Git Workflow

- **Main branch**: `main`
- **Commit style**: Conventional commits (see recent commits: "feat:", "fix:", "chore:")
- Use PRs for changes requiring review

## Domain Context

### OAuth Session Management
- Claude sessions last **5 hours**
- Session keys are stored and reused for session affinity
- Automatic token refresh on expiry

### Load Balancing Strategies
- `least-requests` (default) - Route to account with fewest active requests
- `round-robin` - Sequential distribution
- `session` - Stick requests to same account within a session
- `weighted` - Distribute based on configured weights
- `weighted-round-robin` - Weighted sequential distribution

### Request Flow
1. Client request hits ccflare proxy (port 8080)
2. Load balancer selects optimal account
3. Request proxied to Claude API with account credentials
4. Response logged to SQLite database
5. Response returned to client

### Analytics Tracked
- Token usage (input/output)
- Response latency
- Rate limit status
- Cost estimation
- Request history

## Important Constraints

1. **Bun >= 1.2.8 required** - Uses modern Bun APIs
2. **Claude API accounts only** - Designed specifically for Anthropic's Claude
3. **OAuth-based authentication** - Requires valid Claude session keys
4. **Single-machine deployment** - SQLite is file-based (not distributed)
5. **Port 8080 default** - Configurable via PORT env var

## External Dependencies

### External Services
- **Anthropic Claude API** (`https://api.anthropic.com`) - Target API for proxied requests
- **Claude OAuth** - For account authentication

### Deployment Options
- **Docker** - Containerized deployment (see `DOCKER.md`)
- **Docker Compose** - Multi-container setup
- **Kubernetes** - K8s manifests available
- **Bare metal** - Direct Bun execution

### Environment Variables
- `PORT` - Server port (default: 8080)
- `LB_STRATEGY` - Load balancing strategy
- `LOG_LEVEL` - DEBUG, INFO, WARN, ERROR
- `LOG_FORMAT` - pretty, json
- Database and credentials stored in `./data` directory
