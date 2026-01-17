/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	getHorizonUrl,
	getNetworkPassphrase,
	getSorobanRpcUrl,
	HORIZON_URLS,
	NETWORK_PASSPHRASES,
	SOROBAN_RPC_URLS,
	FRIENDBOT_URLS,
} from '../../nodes/Stellar/constants/networks';

describe('Network Constants', () => {
	describe('getHorizonUrl', () => {
		it('should return public Horizon URL', () => {
			expect(getHorizonUrl('public')).toBe(HORIZON_URLS.public);
		});

		it('should return testnet Horizon URL', () => {
			expect(getHorizonUrl('testnet')).toBe(HORIZON_URLS.testnet);
		});

		it('should return futurenet Horizon URL', () => {
			expect(getHorizonUrl('futurenet')).toBe(HORIZON_URLS.futurenet);
		});

		it('should return custom URL when provided', () => {
			const customUrl = 'https://custom-horizon.example.com';
			expect(getHorizonUrl('custom', customUrl)).toBe(customUrl);
		});

		it('should throw error for custom network without URL', () => {
			expect(() => getHorizonUrl('custom')).toThrow('Custom Horizon URL required');
		});
	});

	describe('getNetworkPassphrase', () => {
		it('should return public network passphrase', () => {
			expect(getNetworkPassphrase('public')).toBe(NETWORK_PASSPHRASES.public);
		});

		it('should return testnet network passphrase', () => {
			expect(getNetworkPassphrase('testnet')).toBe(NETWORK_PASSPHRASES.testnet);
		});

		it('should return futurenet network passphrase', () => {
			expect(getNetworkPassphrase('futurenet')).toBe(NETWORK_PASSPHRASES.futurenet);
		});

		it('should return custom passphrase when provided', () => {
			const customPassphrase = 'Custom Network ; Test';
			expect(getNetworkPassphrase('custom', customPassphrase)).toBe(customPassphrase);
		});

		it('should throw error for custom network without passphrase', () => {
			expect(() => getNetworkPassphrase('custom')).toThrow('Custom network passphrase required');
		});
	});

	describe('getSorobanRpcUrl', () => {
		it('should return public Soroban RPC URL', () => {
			expect(getSorobanRpcUrl('public')).toBe(SOROBAN_RPC_URLS.public);
		});

		it('should return testnet Soroban RPC URL', () => {
			expect(getSorobanRpcUrl('testnet')).toBe(SOROBAN_RPC_URLS.testnet);
		});

		it('should return custom URL when provided', () => {
			const customUrl = 'https://custom-soroban.example.com';
			expect(getSorobanRpcUrl('custom', customUrl)).toBe(customUrl);
		});

		it('should throw error for custom network without URL', () => {
			expect(() => getSorobanRpcUrl('custom')).toThrow('Custom Soroban RPC URL required');
		});
	});

	describe('FRIENDBOT_URLS', () => {
		it('should have testnet friendbot URL', () => {
			expect(FRIENDBOT_URLS.testnet).toBeDefined();
			expect(FRIENDBOT_URLS.testnet).toContain('friendbot');
		});

		it('should have futurenet friendbot URL', () => {
			expect(FRIENDBOT_URLS.futurenet).toBeDefined();
			expect(FRIENDBOT_URLS.futurenet).toContain('friendbot');
		});

		it('should not have public friendbot URL', () => {
			expect(FRIENDBOT_URLS.public).toBeUndefined();
		});
	});
});

describe('Stellar Node', () => {
	it('should export Stellar class', () => {
		const { Stellar } = require('../../nodes/Stellar/Stellar.node');
		expect(Stellar).toBeDefined();
	});

	it('should have correct node description', () => {
		const { Stellar } = require('../../nodes/Stellar/Stellar.node');
		const node = new Stellar();
		expect(node.description.name).toBe('stellar');
		expect(node.description.displayName).toBe('Stellar');
		expect(node.description.group).toContain('transform');
	});

	it('should have all required resources', () => {
		const { Stellar } = require('../../nodes/Stellar/Stellar.node');
		const node = new Stellar();
		const resourceProperty = node.description.properties.find(
			(p: { name: string }) => p.name === 'resource'
		);
		expect(resourceProperty).toBeDefined();
		const resourceValues = resourceProperty.options.map((o: { value: string }) => o.value);
		expect(resourceValues).toContain('account');
		expect(resourceValues).toContain('payment');
		expect(resourceValues).toContain('asset');
		expect(resourceValues).toContain('dex');
		expect(resourceValues).toContain('transaction');
		expect(resourceValues).toContain('ledger');
		expect(resourceValues).toContain('soroban');
	});
});

describe('Stellar Trigger Node', () => {
	it('should export StellarTrigger class', () => {
		const { StellarTrigger } = require('../../nodes/Stellar/StellarTrigger.node');
		expect(StellarTrigger).toBeDefined();
	});

	it('should have correct node description', () => {
		const { StellarTrigger } = require('../../nodes/Stellar/StellarTrigger.node');
		const node = new StellarTrigger();
		expect(node.description.name).toBe('stellarTrigger');
		expect(node.description.displayName).toBe('Stellar Trigger');
		expect(node.description.group).toContain('trigger');
	});

	it('should have all required event types', () => {
		const { StellarTrigger } = require('../../nodes/Stellar/StellarTrigger.node');
		const node = new StellarTrigger();
		const eventProperty = node.description.properties.find(
			(p: { name: string }) => p.name === 'event'
		);
		expect(eventProperty).toBeDefined();
		const eventValues = eventProperty.options.map((o: { value: string }) => o.value);
		expect(eventValues).toContain('transactions');
		expect(eventValues).toContain('payments');
		expect(eventValues).toContain('operations');
		expect(eventValues).toContain('effects');
		expect(eventValues).toContain('ledgers');
		expect(eventValues).toContain('trades');
	});
});
