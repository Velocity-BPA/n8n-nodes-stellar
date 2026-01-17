/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as StellarSdk from '@stellar/stellar-sdk';

export type NetworkType = 'public' | 'testnet' | 'futurenet' | 'custom';

export const NETWORK_PASSPHRASES: Record<Exclude<NetworkType, 'custom'>, string> = {
	public: StellarSdk.Networks.PUBLIC,
	testnet: StellarSdk.Networks.TESTNET,
	futurenet: StellarSdk.Networks.FUTURENET,
};

export const HORIZON_URLS: Record<Exclude<NetworkType, 'custom'>, string> = {
	public: 'https://horizon.stellar.org',
	testnet: 'https://horizon-testnet.stellar.org',
	futurenet: 'https://horizon-futurenet.stellar.org',
};

export const SOROBAN_RPC_URLS: Record<Exclude<NetworkType, 'custom'>, string> = {
	public: 'https://soroban.stellar.org',
	testnet: 'https://soroban-testnet.stellar.org',
	futurenet: 'https://rpc-futurenet.stellar.org',
};

export const FRIENDBOT_URLS: Record<string, string> = {
	testnet: 'https://friendbot.stellar.org',
	futurenet: 'https://friendbot-futurenet.stellar.org',
};

export function getHorizonUrl(network: NetworkType, customUrl?: string): string {
	if (network === 'custom') {
		if (!customUrl) throw new Error('Custom Horizon URL required for custom network');
		return customUrl;
	}
	return HORIZON_URLS[network];
}

export function getNetworkPassphrase(network: NetworkType, customPassphrase?: string): string {
	if (network === 'custom') {
		if (!customPassphrase) throw new Error('Custom network passphrase required for custom network');
		return customPassphrase;
	}
	return NETWORK_PASSPHRASES[network];
}

export function getSorobanRpcUrl(network: NetworkType, customUrl?: string): string {
	if (network === 'custom') {
		if (!customUrl) throw new Error('Custom Soroban RPC URL required for custom network');
		return customUrl;
	}
	return SOROBAN_RPC_URLS[network];
}

export const DEFAULT_SETTINGS = {
	baseFee: 100,
	timeout: 30,
};
