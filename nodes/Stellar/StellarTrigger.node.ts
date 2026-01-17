/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
} from 'n8n-workflow';
import * as StellarSdk from '@stellar/stellar-sdk';
import {
	getHorizonUrl,
	NetworkType,
} from './constants/networks';

// Runtime licensing notice (logged once per node load)
const LICENSING_NOTICE_LOGGED = Symbol.for('stellarTrigger.licensing.logged');
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

export class StellarTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Stellar Trigger',
		name: 'stellarTrigger',
		icon: 'file:stellar.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Listen to Stellar blockchain events in real-time',
		defaults: {
			name: 'Stellar Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'stellarNetwork',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{ name: 'New Effect', value: 'effects' },
					{ name: 'New Ledger', value: 'ledgers' },
					{ name: 'New Operation', value: 'operations' },
					{ name: 'New Payment', value: 'payments' },
					{ name: 'New Trade', value: 'trades' },
					{ name: 'New Transaction', value: 'transactions' },
				],
				default: 'payments',
				description: 'The event to listen for',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				placeholder: 'G...',
				description: 'Filter events for a specific account (optional)',
				displayOptions: {
					show: {
						event: ['transactions', 'operations', 'payments', 'effects'],
					},
				},
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: 'now',
				description: 'Starting cursor (use "now" for real-time)',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		// Log licensing notice once per node load
		logLicensingNotice();

		const credentials = await this.getCredentials('stellarNetwork');
		const network = credentials.network as NetworkType;
		const customHorizonUrl = credentials.customHorizonUrl as string | undefined;

		const horizonUrl = getHorizonUrl(network, customHorizonUrl);
		const server = new StellarSdk.Horizon.Server(horizonUrl);

		const event = this.getNodeParameter('event') as string;
		const accountId = this.getNodeParameter('accountId', '') as string;
		const cursor = this.getNodeParameter('cursor') as string;

		let closeFunction: (() => void) | undefined;

		const startStreaming = (): void => {
			type StreamBuilder = {
				cursor: (c: string) => StreamBuilder;
				stream: (opts: { onmessage: (record: IDataObject) => void; onerror: (error: Error) => void }) => () => void;
			};

			let streamBuilder: StreamBuilder;

			switch (event) {
				case 'transactions':
					streamBuilder = accountId
						? server.transactions().forAccount(accountId) as unknown as StreamBuilder
						: server.transactions() as unknown as StreamBuilder;
					break;
				case 'operations':
					streamBuilder = accountId
						? server.operations().forAccount(accountId) as unknown as StreamBuilder
						: server.operations() as unknown as StreamBuilder;
					break;
				case 'payments':
					streamBuilder = accountId
						? server.payments().forAccount(accountId) as unknown as StreamBuilder
						: server.payments() as unknown as StreamBuilder;
					break;
				case 'effects':
					streamBuilder = accountId
						? server.effects().forAccount(accountId) as unknown as StreamBuilder
						: server.effects() as unknown as StreamBuilder;
					break;
				case 'ledgers':
					streamBuilder = server.ledgers() as unknown as StreamBuilder;
					break;
				case 'trades':
					streamBuilder = server.trades() as unknown as StreamBuilder;
					break;
				default:
					throw new Error(`Unknown event type: ${event}`);
			}

			closeFunction = streamBuilder.cursor(cursor).stream({
				onmessage: (record: IDataObject) => {
					this.emit([this.helpers.returnJsonArray([record])]);
				},
				onerror: (error: Error) => {
					console.error('Stellar stream error:', error);
				},
			});
		};

		startStreaming();

		const closeCallback = async (): Promise<void> => {
			if (closeFunction) {
				closeFunction();
			}
		};

		return {
			closeFunction: closeCallback,
		};
	}
}
