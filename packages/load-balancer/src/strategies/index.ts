import { isAccountAvailable, TIME_CONSTANTS } from "@ccflare/core";
import { Logger } from "@ccflare/logger";
import type {
	Account,
	LoadBalancingStrategy,
	RequestMeta,
	StrategyStore,
} from "@ccflare/types";

export class SessionStrategy implements LoadBalancingStrategy {
	private sessionDurationMs: number;
	private store: StrategyStore | null = null;
	private log = new Logger("SessionStrategy");

	constructor(
		sessionDurationMs: number = TIME_CONSTANTS.SESSION_DURATION_DEFAULT,
	) {
		this.sessionDurationMs = sessionDurationMs;
	}

	initialize(store: StrategyStore): void {
		this.store = store;
	}

	private resetSessionIfExpired(account: Account): void {
		const now = Date.now();

		if (
			!account.session_start ||
			now - account.session_start >= this.sessionDurationMs
		) {
			// Reset session
			if (this.store) {
				const wasExpired = account.session_start !== null;
				this.log.info(
					wasExpired
						? `Session expired for account ${account.name}, starting new session`
						: `Starting new session for account ${account.name}`,
				);
				this.store.resetAccountSession(account.id, now);

				// Update the account object to reflect changes
				account.session_start = now;
				account.session_request_count = 0;
			}
		}
	}

	select(accounts: Account[], _meta: RequestMeta): Account[] {
		const now = Date.now();

		// Find account with active session (most recent session_start within window)
		let activeAccount: Account | null = null;
		let mostRecentSessionStart = 0;

		for (const account of accounts) {
			if (
				account.session_start &&
				now - account.session_start < this.sessionDurationMs &&
				account.session_start > mostRecentSessionStart
			) {
				activeAccount = account;
				mostRecentSessionStart = account.session_start;
			}
		}

		// If we have an active account and it's available, use it exclusively
		if (activeAccount && isAccountAvailable(activeAccount, now)) {
			// Reset session if expired (shouldn't happen but just in case)
			this.resetSessionIfExpired(activeAccount);
			this.log.info(
				`Continuing session for account ${activeAccount.name} (${activeAccount.session_request_count} requests in session)`,
			);
			// Return active account first, then others as fallback
			const others = accounts.filter(
				(a) => a.id !== activeAccount.id && isAccountAvailable(a, now),
			);
			return [activeAccount, ...others];
		}

		// No active session or active account is rate limited
		// Filter available accounts
		const available = accounts.filter((a) => isAccountAvailable(a, now));

		if (available.length === 0) return [];

		// Pick the first available account and start a new session with it
		const chosenAccount = available[0];
		this.resetSessionIfExpired(chosenAccount);

		// Return chosen account first, then others as fallback
		const others = available.filter((a) => a.id !== chosenAccount.id);
		return [chosenAccount, ...others];
	}
}

export class RoundRobinStrategy implements LoadBalancingStrategy {
	private currentIndex = 0;
	private log = new Logger("RoundRobinStrategy");

	initialize(_store: StrategyStore): void {
		// Round-robin doesn't need store access, but we implement the interface
	}

	select(accounts: Account[], _meta: RequestMeta): Account[] {
		const now = Date.now();

		// Filter available accounts (not rate-limited, not paused)
		const available = accounts.filter((a) => isAccountAvailable(a, now));

		if (available.length === 0) return [];

		// For single account, return it directly
		if (available.length === 1) {
			this.log.debug(`Only one available account: ${available[0].name}`);
			return [available[0]];
		}

		// Get the next account using round-robin
		const selectedAccount = available[this.currentIndex];

		// Move to next index, wrapping around
		this.currentIndex = (this.currentIndex + 1) % available.length;

		this.log.info(
			`Selected account ${selectedAccount.name} (index ${this.currentIndex - 1}/${available.length})`,
		);

		// Return selected account first, then others as fallback in round-robin order
		const selectedId = selectedAccount.id;
		const others = available.filter((a) => a.id !== selectedId);

		return [selectedAccount, ...others];
	}
}
