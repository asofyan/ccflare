## 1. Type Definitions
- [x] 1.1 Add `RoundRobin = "round-robin"` to `StrategyName` enum in `packages/types/src/strategy.ts`

## 2. Core Strategy Implementation
- [x] 2.1 Create `RoundRobinStrategy` class in `packages/load-balancer/src/strategies/index.ts`
  - Implement `initialize(store: StrategyStore)` method
  - Implement `select(accounts: Account[], meta: RequestMeta): Account[]` method
  - Maintain a counter/index for round-robin selection
  - Filter for available accounts (not rate-limited, not paused)
  - Cycle through accounts sequentially, wrapping around

## 3. Strategy Registration
- [x] 3.1 Update `STRATEGIES` array in `packages/core/src/strategy.ts` to include `RoundRobin`
  - Note: STRATEGIES uses `Object.values(StrategyName)` so it auto-includes the new enum value

## 4. Dashboard UI Update
- [x] 4.1 Add round-robin description to `packages/dashboard-web/src/components/StrategyCard.tsx`
  - Display description showing round-robin distributes requests evenly across accounts
  - Made descriptions dynamic based on selected strategy

## 5. Validation
- [x] 5.1 Run `bun run lint` and fix any issues
- [x] 5.2 Run `bun run typecheck` and fix any type errors
- [x] 5.3 Run `bun run format` to ensure consistent formatting
- [ ] 5.4 Test manually:
  - Add 2+ accounts via dashboard
  - Select round-robin strategy
  - Send multiple requests and verify they distribute across accounts
