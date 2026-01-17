/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import * as StellarSdk from '@stellar/stellar-sdk';
import axios from 'axios';
import {
	getHorizonUrl,
	getNetworkPassphrase,
	getSorobanRpcUrl,
	FRIENDBOT_URLS,
	NetworkType,
	DEFAULT_SETTINGS,
} from './constants/networks';

// Runtime licensing notice (logged once per node load)
const LICENSING_NOTICE_LOGGED = Symbol.for('stellar.licensing.logged');
function logLicensingNotice(): void {
	const globalAny = global as Record<symbol, boolean>;
	if (!globalAny[LICENSING_NOTICE_LOGGED]) {
		console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
		globalAny[LICENSING_NOTICE_LOGGED] = true;
	}
}

export class Stellar implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Stellar',
		name: 'stellar',
		icon: 'file:stellar.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Stellar blockchain',
		defaults: {
			name: 'Stellar',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'stellarNetwork',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Asset', value: 'asset' },
					{ name: 'DEX', value: 'dex' },
					{ name: 'Ledger', value: 'ledger' },
					{ name: 'Payment', value: 'payment' },
					{ name: 'Soroban', value: 'soroban' },
					{ name: 'Transaction', value: 'transaction' },
				],
				default: 'account',
			},
			// Account Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{ name: 'Create Account', value: 'createAccount' },
					{ name: 'Fund Testnet', value: 'fundTestnet' },
					{ name: 'Generate Keypair', value: 'generateKeypair' },
					{ name: 'Get Info', value: 'getInfo' },
					{ name: 'Merge Account', value: 'mergeAccount' },
					{ name: 'Set Data', value: 'setData' },
					{ name: 'Set Options', value: 'setOptions' },
				],
				default: 'getInfo',
			},
			// Payment Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['payment'] } },
				options: [
					{ name: 'Send Payment', value: 'sendPayment' },
					{ name: 'Path Payment', value: 'pathPayment' },
					{ name: 'Create Claimable Balance', value: 'createClaimableBalance' },
					{ name: 'Claim Balance', value: 'claimBalance' },
				],
				default: 'sendPayment',
			},
			// Asset Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['asset'] } },
				options: [
					{ name: 'Change Trust', value: 'changeTrust' },
					{ name: 'Get Info', value: 'getAssetInfo' },
					{ name: 'Issue Asset', value: 'issueAsset' },
				],
				default: 'changeTrust',
			},
			// DEX Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['dex'] } },
				options: [
					{ name: 'Cancel Offer', value: 'cancelOffer' },
					{ name: 'Create Buy Offer', value: 'createBuyOffer' },
					{ name: 'Create Sell Offer', value: 'createSellOffer' },
					{ name: 'Get Orderbook', value: 'getOrderbook' },
					{ name: 'Get Trades', value: 'getTrades' },
					{ name: 'List Offers', value: 'listOffers' },
				],
				default: 'getOrderbook',
			},
			// Transaction Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['transaction'] } },
				options: [
					{ name: 'Get Transaction', value: 'getTransaction' },
					{ name: 'Sign XDR', value: 'signXdr' },
					{ name: 'Submit XDR', value: 'submitXdr' },
				],
				default: 'getTransaction',
			},
			// Ledger Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['ledger'] } },
				options: [
					{ name: 'Get By Sequence', value: 'getBySequence' },
					{ name: 'Get Fee Stats', value: 'getFeeStats' },
					{ name: 'Get Latest', value: 'getLatest' },
				],
				default: 'getLatest',
			},
			// Soroban Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['soroban'] } },
				options: [
					{ name: 'Get Health', value: 'getHealth' },
					{ name: 'Invoke Contract', value: 'invokeContract' },
					{ name: 'Simulate Transaction', value: 'simulateTransaction' },
				],
				default: 'getHealth',
			},
			// Common Fields
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				placeholder: 'G...',
				description: 'Stellar account public key',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getInfo', 'fundTestnet', 'mergeAccount'],
					},
				},
			},
			{
				displayName: 'Destination Account',
				name: 'destination',
				type: 'string',
				default: '',
				placeholder: 'G...',
				description: 'Destination account public key',
				displayOptions: {
					show: {
						resource: ['account', 'payment'],
						operation: ['createAccount', 'mergeAccount', 'sendPayment', 'pathPayment'],
					},
				},
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'string',
				default: '',
				placeholder: '10',
				description: 'Amount in the asset unit (not stroops)',
				displayOptions: {
					show: {
						resource: ['account', 'payment', 'dex'],
						operation: ['createAccount', 'sendPayment', 'pathPayment', 'createBuyOffer', 'createSellOffer', 'createClaimableBalance'],
					},
				},
			},
			{
				displayName: 'Asset Code',
				name: 'assetCode',
				type: 'string',
				default: 'XLM',
				placeholder: 'USDC',
				description: 'Asset code (use XLM for native)',
				displayOptions: {
					show: {
						resource: ['payment', 'asset', 'dex'],
						operation: ['sendPayment', 'pathPayment', 'changeTrust', 'getAssetInfo', 'issueAsset', 'getOrderbook', 'createBuyOffer', 'createSellOffer', 'getTrades', 'createClaimableBalance'],
					},
				},
			},
			{
				displayName: 'Asset Issuer',
				name: 'assetIssuer',
				type: 'string',
				default: '',
				placeholder: 'G...',
				description: 'Issuer account (leave empty for XLM)',
				displayOptions: {
					show: {
						resource: ['payment', 'asset', 'dex'],
						operation: ['sendPayment', 'pathPayment', 'changeTrust', 'getAssetInfo', 'getOrderbook', 'createBuyOffer', 'createSellOffer', 'getTrades', 'createClaimableBalance'],
					},
				},
			},
			// DEX-specific fields
			{
				displayName: 'Selling Asset Code',
				name: 'sellingAssetCode',
				type: 'string',
				default: 'XLM',
				displayOptions: {
					show: {
						resource: ['dex'],
						operation: ['getOrderbook', 'createSellOffer', 'createBuyOffer'],
					},
				},
			},
			{
				displayName: 'Selling Asset Issuer',
				name: 'sellingAssetIssuer',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['dex'],
						operation: ['getOrderbook', 'createSellOffer', 'createBuyOffer'],
					},
				},
			},
			{
				displayName: 'Buying Asset Code',
				name: 'buyingAssetCode',
				type: 'string',
				default: 'USDC',
				displayOptions: {
					show: {
						resource: ['dex'],
						operation: ['getOrderbook', 'createSellOffer', 'createBuyOffer'],
					},
				},
			},
			{
				displayName: 'Buying Asset Issuer',
				name: 'buyingAssetIssuer',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['dex'],
						operation: ['getOrderbook', 'createSellOffer', 'createBuyOffer'],
					},
				},
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'string',
				default: '',
				placeholder: '0.10',
				description: 'Price per unit of the selling asset',
				displayOptions: {
					show: {
						resource: ['dex'],
						operation: ['createSellOffer', 'createBuyOffer'],
					},
				},
			},
			{
				displayName: 'Offer ID',
				name: 'offerId',
				type: 'string',
				default: '',
				description: 'Offer ID to cancel',
				displayOptions: {
					show: {
						resource: ['dex'],
						operation: ['cancelOffer'],
					},
				},
			},
			// Transaction fields
			{
				displayName: 'Transaction Hash',
				name: 'transactionHash',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['transaction'],
						operation: ['getTransaction'],
					},
				},
			},
			{
				displayName: 'XDR',
				name: 'xdr',
				type: 'string',
				default: '',
				description: 'Transaction XDR envelope',
				displayOptions: {
					show: {
						resource: ['transaction'],
						operation: ['signXdr', 'submitXdr'],
					},
				},
			},
			// Ledger fields
			{
				displayName: 'Ledger Sequence',
				name: 'ledgerSequence',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['ledger'],
						operation: ['getBySequence'],
					},
				},
			},
			// Soroban fields
			{
				displayName: 'Contract ID',
				name: 'contractId',
				type: 'string',
				default: '',
				placeholder: 'C...',
				displayOptions: {
					show: {
						resource: ['soroban'],
						operation: ['invokeContract', 'simulateTransaction'],
					},
				},
			},
			{
				displayName: 'Function Name',
				name: 'functionName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['soroban'],
						operation: ['invokeContract', 'simulateTransaction'],
					},
				},
			},
			{
				displayName: 'Function Arguments (JSON)',
				name: 'functionArgs',
				type: 'string',
				default: '[]',
				description: 'JSON array of function arguments',
				displayOptions: {
					show: {
						resource: ['soroban'],
						operation: ['invokeContract', 'simulateTransaction'],
					},
				},
			},
			// Account Data fields
			{
				displayName: 'Data Name',
				name: 'dataName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['setData'],
					},
				},
			},
			{
				displayName: 'Data Value',
				name: 'dataValue',
				type: 'string',
				default: '',
				description: 'Leave empty to delete the data entry',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['setData'],
					},
				},
			},
			// Trust limit
			{
				displayName: 'Trust Limit',
				name: 'trustLimit',
				type: 'string',
				default: '',
				placeholder: '1000000',
				description: 'Maximum amount to trust (leave empty for default)',
				displayOptions: {
					show: {
						resource: ['asset'],
						operation: ['changeTrust'],
					},
				},
			},
			// Claimable balance
			{
				displayName: 'Balance ID',
				name: 'balanceId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['claimBalance'],
					},
				},
			},
			{
				displayName: 'Claimants (JSON)',
				name: 'claimants',
				type: 'string',
				default: '[]',
				description: 'JSON array of claimant objects with destination and predicate',
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['createClaimableBalance'],
					},
				},
			},
			// Set Options fields
			{
				displayName: 'Home Domain',
				name: 'homeDomain',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['setOptions'],
					},
				},
			},
			{
				displayName: 'Inflation Destination',
				name: 'inflationDest',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['setOptions'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Log licensing notice once per node load
		logLicensingNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('stellarNetwork');
		const network = credentials.network as NetworkType;
		const customHorizonUrl = credentials.customHorizonUrl as string | undefined;
		const customNetworkPassphrase = credentials.customNetworkPassphrase as string | undefined;
		const secretKey = credentials.secretKey as string | undefined;
		const sorobanRpcUrl = credentials.sorobanRpcUrl as string | undefined;

		const horizonUrl = getHorizonUrl(network, customHorizonUrl);
		const networkPassphrase = getNetworkPassphrase(network, customNetworkPassphrase);
		const server = new StellarSdk.Horizon.Server(horizonUrl);

		let keypair: StellarSdk.Keypair | undefined;
		if (secretKey) {
			keypair = StellarSdk.Keypair.fromSecret(secretKey);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let result: unknown;

				// Account operations
				if (resource === 'account') {
					if (operation === 'generateKeypair') {
						const newKeypair = StellarSdk.Keypair.random();
						result = {
							publicKey: newKeypair.publicKey(),
							secretKey: newKeypair.secret(),
						};
					} else if (operation === 'getInfo') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const account = await server.loadAccount(accountId);
						result = {
							id: account.id,
							accountId: account.account_id,
							sequence: account.sequence,
							balances: account.balances,
							subentryCount: account.subentry_count,
							thresholds: account.thresholds,
							signers: account.signers,
							data: account.data,
							flags: account.flags,
						};
					} else if (operation === 'fundTestnet') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const friendbotUrl = FRIENDBOT_URLS[network];
						if (!friendbotUrl) {
							throw new Error('Friendbot only available on testnet and futurenet');
						}
						const response = await axios.get(`${friendbotUrl}?addr=${accountId}`);
						result = response.data as object;
					} else if (operation === 'createAccount') {
						if (!keypair) throw new Error('Secret key required for creating accounts');
						const destination = this.getNodeParameter('destination', i) as string;
						const amount = this.getNodeParameter('amount', i) as string;

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.createAccount({ destination, startingBalance: amount }))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'mergeAccount') {
						if (!keypair) throw new Error('Secret key required for merging accounts');
						const destination = this.getNodeParameter('destination', i) as string;

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.accountMerge({ destination }))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'setData') {
						if (!keypair) throw new Error('Secret key required for setting data');
						const dataName = this.getNodeParameter('dataName', i) as string;
						const dataValue = this.getNodeParameter('dataValue', i) as string;

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.manageData({
								name: dataName,
								value: dataValue || null,
							}))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'setOptions') {
						if (!keypair) throw new Error('Secret key required for setting options');
						const homeDomain = this.getNodeParameter('homeDomain', i, '') as string;
						const inflationDest = this.getNodeParameter('inflationDest', i, '') as string;

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						});

						if (homeDomain) {
							builder.addOperation(StellarSdk.Operation.setOptions({ homeDomain }));
						}
						if (inflationDest) {
							builder.addOperation(StellarSdk.Operation.setOptions({ inflationDest }));
						}
						if (!homeDomain && !inflationDest) {
							builder.addOperation(StellarSdk.Operation.setOptions({}));
						}

						const transaction = builder.setTimeout(DEFAULT_SETTINGS.timeout).build();
						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else {
						throw new Error(`Unknown account operation: ${operation}`);
					}
				}

				// Payment operations
				else if (resource === 'payment') {
					if (operation === 'sendPayment') {
						if (!keypair) throw new Error('Secret key required for payments');
						const destination = this.getNodeParameter('destination', i) as string;
						const amount = this.getNodeParameter('amount', i) as string;
						const assetCode = this.getNodeParameter('assetCode', i) as string;
						const assetIssuer = this.getNodeParameter('assetIssuer', i, '') as string;

						const asset = assetCode === 'XLM' || !assetIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(assetCode, assetIssuer);

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.payment({ destination, asset, amount }))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'pathPayment') {
						if (!keypair) throw new Error('Secret key required for path payments');
						const destination = this.getNodeParameter('destination', i) as string;
						const amount = this.getNodeParameter('amount', i) as string;
						const assetCode = this.getNodeParameter('assetCode', i) as string;
						const assetIssuer = this.getNodeParameter('assetIssuer', i, '') as string;

						const destAsset = assetCode === 'XLM' || !assetIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(assetCode, assetIssuer);

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.pathPaymentStrictReceive({
								sendAsset: StellarSdk.Asset.native(),
								sendMax: amount,
								destination,
								destAsset,
								destAmount: amount,
								path: [],
							}))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'createClaimableBalance') {
						if (!keypair) throw new Error('Secret key required');
						const amount = this.getNodeParameter('amount', i) as string;
						const assetCode = this.getNodeParameter('assetCode', i) as string;
						const assetIssuer = this.getNodeParameter('assetIssuer', i, '') as string;
						const claimantsJson = this.getNodeParameter('claimants', i) as string;

						const asset = assetCode === 'XLM' || !assetIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(assetCode, assetIssuer);

						const claimantsData = JSON.parse(claimantsJson) as Array<{ destination: string }>;
						const claimants = claimantsData.map((c) =>
							new StellarSdk.Claimant(c.destination, StellarSdk.Claimant.predicateUnconditional())
						);

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.createClaimableBalance({ asset, amount, claimants }))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'claimBalance') {
						if (!keypair) throw new Error('Secret key required');
						const balanceId = this.getNodeParameter('balanceId', i) as string;

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.claimClaimableBalance({ balanceId }))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else {
						throw new Error(`Unknown payment operation: ${operation}`);
					}
				}

				// Asset operations
				else if (resource === 'asset') {
					if (operation === 'changeTrust') {
						if (!keypair) throw new Error('Secret key required for trustlines');
						const assetCode = this.getNodeParameter('assetCode', i) as string;
						const assetIssuer = this.getNodeParameter('assetIssuer', i) as string;
						const trustLimit = this.getNodeParameter('trustLimit', i, '') as string;

						if (!assetIssuer) throw new Error('Asset issuer required for non-native assets');
						const asset = new StellarSdk.Asset(assetCode, assetIssuer);

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						});

						if (trustLimit) {
							builder.addOperation(StellarSdk.Operation.changeTrust({ asset, limit: trustLimit }));
						} else {
							builder.addOperation(StellarSdk.Operation.changeTrust({ asset }));
						}

						const transaction = builder.setTimeout(DEFAULT_SETTINGS.timeout).build();
						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'getAssetInfo') {
						const assetCode = this.getNodeParameter('assetCode', i) as string;
						const assetIssuer = this.getNodeParameter('assetIssuer', i, '') as string;

						if (assetCode === 'XLM' || !assetIssuer) {
							result = { type: 'native', code: 'XLM', issuer: null };
						} else {
							const assets = await server.assets().forCode(assetCode).forIssuer(assetIssuer).call();
							result = assets.records.length > 0 ? assets.records[0] : { error: 'Asset not found' };
						}
					} else if (operation === 'issueAsset') {
						if (!keypair) throw new Error('Secret key required');
						const assetCode = this.getNodeParameter('assetCode', i) as string;
						const destination = this.getNodeParameter('destination', i) as string;
						const amount = this.getNodeParameter('amount', i) as string;

						const asset = new StellarSdk.Asset(assetCode, keypair.publicKey());

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.payment({ destination, asset, amount }))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else {
						throw new Error(`Unknown asset operation: ${operation}`);
					}
				}

				// DEX operations
				else if (resource === 'dex') {
					if (operation === 'getOrderbook') {
						const sellingCode = this.getNodeParameter('sellingAssetCode', i) as string;
						const sellingIssuer = this.getNodeParameter('sellingAssetIssuer', i, '') as string;
						const buyingCode = this.getNodeParameter('buyingAssetCode', i) as string;
						const buyingIssuer = this.getNodeParameter('buyingAssetIssuer', i, '') as string;

						const selling = sellingCode === 'XLM' || !sellingIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(sellingCode, sellingIssuer);
						const buying = buyingCode === 'XLM' || !buyingIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(buyingCode, buyingIssuer);

						result = await server.orderbook(selling, buying).call();
					} else if (operation === 'createSellOffer') {
						if (!keypair) throw new Error('Secret key required');
						const sellingCode = this.getNodeParameter('sellingAssetCode', i) as string;
						const sellingIssuer = this.getNodeParameter('sellingAssetIssuer', i, '') as string;
						const buyingCode = this.getNodeParameter('buyingAssetCode', i) as string;
						const buyingIssuer = this.getNodeParameter('buyingAssetIssuer', i, '') as string;
						const amount = this.getNodeParameter('amount', i) as string;
						const price = this.getNodeParameter('price', i) as string;

						const selling = sellingCode === 'XLM' || !sellingIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(sellingCode, sellingIssuer);
						const buying = buyingCode === 'XLM' || !buyingIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(buyingCode, buyingIssuer);

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.manageSellOffer({ selling, buying, amount, price }))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'createBuyOffer') {
						if (!keypair) throw new Error('Secret key required');
						const sellingCode = this.getNodeParameter('sellingAssetCode', i) as string;
						const sellingIssuer = this.getNodeParameter('sellingAssetIssuer', i, '') as string;
						const buyingCode = this.getNodeParameter('buyingAssetCode', i) as string;
						const buyingIssuer = this.getNodeParameter('buyingAssetIssuer', i, '') as string;
						const amount = this.getNodeParameter('amount', i) as string;
						const price = this.getNodeParameter('price', i) as string;

						const selling = sellingCode === 'XLM' || !sellingIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(sellingCode, sellingIssuer);
						const buying = buyingCode === 'XLM' || !buyingIssuer
							? StellarSdk.Asset.native()
							: new StellarSdk.Asset(buyingCode, buyingIssuer);

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.manageBuyOffer({ selling, buying, buyAmount: amount, price }))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'cancelOffer') {
						if (!keypair) throw new Error('Secret key required');
						const offerId = this.getNodeParameter('offerId', i) as string;

						const sourceAccount = await server.loadAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(StellarSdk.Operation.manageSellOffer({
								selling: StellarSdk.Asset.native(),
								buying: StellarSdk.Asset.native(),
								amount: '0',
								price: '1',
								offerId,
							}))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						transaction.sign(keypair);
						result = await server.submitTransaction(transaction);
					} else if (operation === 'listOffers') {
						if (!keypair) throw new Error('Secret key required to list your offers');
						const offers = await server.offers().forAccount(keypair.publicKey()).call();
						result = { offers: offers.records };
					} else if (operation === 'getTrades') {
						const assetCode = this.getNodeParameter('assetCode', i, 'XLM') as string;
						const assetIssuer = this.getNodeParameter('assetIssuer', i, '') as string;

						let tradesCall = server.trades();
						if (assetCode !== 'XLM' && assetIssuer) {
							const asset = new StellarSdk.Asset(assetCode, assetIssuer);
							tradesCall = tradesCall.forAssetPair(StellarSdk.Asset.native(), asset);
						}
						const trades = await tradesCall.limit(50).order('desc').call();
						result = { trades: trades.records };
					} else {
						throw new Error(`Unknown DEX operation: ${operation}`);
					}
				}

				// Transaction operations
				else if (resource === 'transaction') {
					if (operation === 'getTransaction') {
						const txHash = this.getNodeParameter('transactionHash', i) as string;
						result = await server.transactions().transaction(txHash).call();
					} else if (operation === 'signXdr') {
						if (!keypair) throw new Error('Secret key required for signing');
						const xdr = this.getNodeParameter('xdr', i) as string;

						const transaction = StellarSdk.TransactionBuilder.fromXDR(xdr, networkPassphrase);
						transaction.sign(keypair);
						result = {
							signedXdr: transaction.toEnvelope().toXDR('base64'),
							signatures: transaction.signatures.length,
						};
					} else if (operation === 'submitXdr') {
						const xdr = this.getNodeParameter('xdr', i) as string;
						const transaction = StellarSdk.TransactionBuilder.fromXDR(xdr, networkPassphrase);
						result = await server.submitTransaction(transaction);
					} else {
						throw new Error(`Unknown transaction operation: ${operation}`);
					}
				}

				// Ledger operations
				else if (resource === 'ledger') {
					if (operation === 'getLatest') {
						const ledgers = await server.ledgers().order('desc').limit(1).call();
						result = ledgers.records[0];
					} else if (operation === 'getBySequence') {
						const sequence = this.getNodeParameter('ledgerSequence', i) as number;
						result = await server.ledgers().ledger(sequence).call();
					} else if (operation === 'getFeeStats') {
						result = await server.feeStats();
					} else {
						throw new Error(`Unknown ledger operation: ${operation}`);
					}
				}

				// Soroban operations
				else if (resource === 'soroban') {
					const rpcUrl = sorobanRpcUrl || getSorobanRpcUrl(network);
					const sorobanServer = new StellarSdk.SorobanRpc.Server(rpcUrl);

					if (operation === 'getHealth') {
						result = await sorobanServer.getHealth();
					} else if (operation === 'simulateTransaction' || operation === 'invokeContract') {
						if (!keypair) throw new Error('Secret key required for contract operations');
						const contractId = this.getNodeParameter('contractId', i) as string;
						const functionName = this.getNodeParameter('functionName', i) as string;
						const functionArgs = this.getNodeParameter('functionArgs', i) as string;

						const contract = new StellarSdk.Contract(contractId);
						const args = JSON.parse(functionArgs) as unknown[];

						const sourceAccount = await sorobanServer.getAccount(keypair.publicKey());
						const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
							fee: String(DEFAULT_SETTINGS.baseFee),
							networkPassphrase,
						})
							.addOperation(contract.call(functionName, ...args.map((arg) => {
								if (typeof arg === 'string') return StellarSdk.nativeToScVal(arg);
								if (typeof arg === 'number') return StellarSdk.nativeToScVal(arg, { type: 'i128' });
								return StellarSdk.nativeToScVal(arg);
							})))
							.setTimeout(DEFAULT_SETTINGS.timeout)
							.build();

						const simResult = await sorobanServer.simulateTransaction(transaction);

						if (operation === 'simulateTransaction') {
							result = simResult;
						} else {
							if (StellarSdk.SorobanRpc.Api.isSimulationError(simResult)) {
								throw new Error(`Simulation failed: ${simResult.error}`);
							}
							const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(transaction, simResult).build();
							preparedTx.sign(keypair);
							result = await sorobanServer.sendTransaction(preparedTx);
						}
					} else {
						throw new Error(`Unknown soroban operation: ${operation}`);
					}
				} else {
					throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push({ json: result as IDataObject });
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					returnData.push({ json: { error: errorMessage } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
