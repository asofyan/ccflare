import * as cliCommands from "@ccflare/cli-commands";
import { openBrowser } from "@ccflare/cli-commands";
import { Config } from "@ccflare/config";
import type { DatabaseOperations } from "@ccflare/database";
import { DatabaseFactory } from "@ccflare/database";
import { type BeginResult, createOAuthFlow } from "@ccflare/oauth-flow";
import type { AccountListItem } from "@ccflare/types";

export interface OAuthFlowResult extends BeginResult {
	// Extends BeginResult from oauth-flow package
}

interface AddOAuthAccountOptions {
	name: string;
	mode?: "max" | "console";
	tier?: 1 | 5 | 20;
}

interface AddApiKeyAccountOptions {
	name: string;
	baseUrl: string;
	apiKey: string;
	mode: "api-key";
	tier: 1;
}

/**
 * Begin OAuth flow for adding an account (TUI version)
 * Returns the auth URL and PKCE data needed to complete the flow
 */
export async function beginAddAccount(
	options: AddOAuthAccountOptions,
): Promise<OAuthFlowResult> {
	const { name, mode = "max" } = options;
	const config = new Config();
	const dbOps = DatabaseFactory.getInstance();

	// Create OAuth flow instance
	const oauthFlow = await createOAuthFlow(dbOps, config);

	// Begin OAuth flow
	const flowResult = await oauthFlow.begin({ name, mode });

	// Open browser
	console.log(`\nOpening browser to authenticate...`);
	const browserOpened = await openBrowser(flowResult.authUrl);
	if (!browserOpened) {
		console.log(
			`Please open the following URL in your browser:\n${flowResult.authUrl}`,
		);
	}

	return flowResult;
}

/**
 * Complete OAuth flow after receiving authorization code
 */
export async function completeAddAccount(
	options: AddOAuthAccountOptions & { code: string; flowData: OAuthFlowResult },
): Promise<void> {
	const { name, mode = "max", tier = 1, code, flowData } = options;
	const config = new Config();
	const dbOps = DatabaseFactory.getInstance();

	// Create OAuth flow instance
	const oauthFlow = await createOAuthFlow(dbOps, config);

	// Complete OAuth flow
	console.log("\nExchanging code for tokens...");
	const _account = await oauthFlow.complete(
		{ sessionId: flowData.sessionId, code, tier, name },
		flowData,
	);

	console.log(`\nAccount '${name}' added successfully!`);
	console.log(`Type: ${mode === "max" ? "Claude Max" : "Claude Console"}`);
	console.log(`Tier: ${tier}x`);
}

/**
 * Add account using API key (no OAuth flow)
 */
export async function addApiKeyAccount(
	options: AddApiKeyAccountOptions,
): Promise<void> {
	const { name, baseUrl, apiKey } = options;
	const dbOps: DatabaseOperations = DatabaseFactory.getInstance();

	if (!baseUrl || !apiKey) {
		throw new Error("Base URL and API key are required for API key accounts");
	}

	// Create account directly without OAuth
	const accountId = crypto.randomUUID();
	const now = Date.now();

	dbOps.getDatabase().run(
		`INSERT INTO accounts (
			id, name, provider, api_key, base_url, refresh_token, access_token,
			created_at, request_count, total_requests, account_tier
		) VALUES (?, ?, 'anthropic', ?, ?, ?, NULL, ?, 0, 0, 1)`,
		[accountId, name, apiKey, baseUrl, `api-key-${accountId}`, now],
	);

	console.log(`\nAccount '${name}' added successfully!`);
	console.log(`Type: API Key`);
	console.log(`Tier: 1x`);
}

/**
 * Legacy function for non-TUI usage
 */
export async function addAccount(
	options: AddOAuthAccountOptions,
): Promise<void> {
	const dbOps = DatabaseFactory.getInstance();
	const config = new Config();
	await cliCommands.addAccount(dbOps, config, {
		name: options.name,
		mode: options.mode || "max",
		tier: options.tier || 1,
	});
}

export async function getAccounts(): Promise<AccountListItem[]> {
	const dbOps = DatabaseFactory.getInstance();
	return await cliCommands.getAccountsList(dbOps);
}

export async function removeAccount(name: string): Promise<void> {
	const dbOps = DatabaseFactory.getInstance();
	await cliCommands.removeAccount(dbOps, name);
}

export async function pauseAccount(
	name: string,
): Promise<{ success: boolean; message: string }> {
	const dbOps = DatabaseFactory.getInstance();
	return cliCommands.pauseAccount(dbOps, name);
}

export async function resumeAccount(
	name: string,
): Promise<{ success: boolean; message: string }> {
	const dbOps = DatabaseFactory.getInstance();
	return cliCommands.resumeAccount(dbOps, name);
}
