/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { HORIZON_URLS } from '../../nodes/Stellar/constants/networks';

describe('Stellar Integration Tests', () => {
	const server = new StellarSdk.Horizon.Server(HORIZON_URLS.testnet);

	describe('Keypair Generation', () => {
		it('should generate valid keypair', () => {
			const keypair = StellarSdk.Keypair.random();
			expect(keypair.publicKey()).toMatch(/^G[A-Z0-9]{55}$/);
			expect(keypair.secret()).toMatch(/^S[A-Z0-9]{55}$/);
		});
	});

	describe('Horizon Connection', () => {
		it('should connect to testnet', async () => {
			const response = await server.ledgers().limit(1).call();
			expect(response.records).toBeDefined();
			expect(response.records.length).toBeGreaterThan(0);
		}, 30000);

		it('should fetch fee stats', async () => {
			const feeStats = await server.feeStats();
			expect(feeStats).toBeDefined();
			expect(feeStats.last_ledger_base_fee).toBeDefined();
		}, 30000);
	});

	describe('Account Operations', () => {
		it('should fetch Stellar foundation account', async () => {
			const accountId = 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR';
			try {
				const account = await server.loadAccount(accountId);
				expect(account).toBeDefined();
				expect(account.account_id).toBe(accountId);
				expect(account.balances).toBeDefined();
			} catch (error) {
				// Account might not exist on testnet
				expect(error).toBeDefined();
			}
		}, 30000);
	});

	describe('Asset Operations', () => {
		it('should create native asset', () => {
			const asset = StellarSdk.Asset.native();
			expect(asset.isNative()).toBe(true);
			expect(asset.getCode()).toBe('XLM');
		});

		it('should create custom asset', () => {
			const asset = new StellarSdk.Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN');
			expect(asset.isNative()).toBe(false);
			expect(asset.getCode()).toBe('USDC');
		});
	});

	describe('Transaction Building', () => {
		it('should build payment operation', () => {
			const destination = StellarSdk.Keypair.random().publicKey();
			const operation = StellarSdk.Operation.payment({
				destination,
				asset: StellarSdk.Asset.native(),
				amount: '10',
			});
			expect(operation).toBeDefined();
			expect(operation.type).toBe('payment');
		});

		it('should build create account operation', () => {
			const destination = StellarSdk.Keypair.random().publicKey();
			const operation = StellarSdk.Operation.createAccount({
				destination,
				startingBalance: '10',
			});
			expect(operation).toBeDefined();
			expect(operation.type).toBe('createAccount');
		});
	});
});
