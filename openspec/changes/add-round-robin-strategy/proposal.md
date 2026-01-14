# Change: Add Round-Robin Load Balancing Strategy

## Why

Currently, ccflare only supports a session-based load balancing strategy that routes all requests to a single account for 5 hours. For users with multiple accounts who want to distribute load evenly across accounts, a round-robin strategy is needed. This is especially useful when users have 2+ accounts and want to maximize request throughput by balancing requests across all available accounts.

## What Changes

- Add `RoundRobin` to the `StrategyName` enum in `packages/types/src/strategy.ts`
- Implement `RoundRobinStrategy` class in `packages/load-balancer/src/strategies/`
- Export the new strategy from `packages/load-balancer/src/index.ts`
- Update `STRATEGIES` array in `packages/core/src/strategy.ts`
- Update dashboard `StrategyCard.tsx` to show round-robin description when selected
- Add API endpoint validation for the new strategy

## Impact

- Affected specs: New capability `load-balancing` (round-robin strategy)
- Affected code:
  - `packages/types/src/strategy.ts` - Add RoundRobin enum value
  - `packages/load-balancer/src/strategies/index.ts` - Add RoundRobinStrategy class
  - `packages/core/src/strategy.ts` - Update STRATEGIES array
  - `packages/dashboard-web/src/components/StrategyCard.tsx` - Add description
  - No database changes required
  - No breaking changes - additive only
