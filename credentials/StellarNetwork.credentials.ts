/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class StellarNetwork implements ICredentialType {
	name = 'stellarNetwork';
	displayName = 'Stellar Network';
	documentationUrl = 'https://developers.stellar.org/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			default: 'testnet',
			options: [
				{
					name: 'Public (Mainnet)',
					value: 'public',
					description: 'Stellar public network - Production with real XLM',
				},
				{
					name: 'Testnet',
					value: 'testnet',
					description: 'Stellar test network - Free test XLM from Friendbot',
				},
				{
					name: 'Futurenet',
					value: 'futurenet',
					description: 'Stellar futurenet - Experimental features and Soroban testing',
				},
				{
					name: 'Custom',
					value: 'custom',
					description: 'Custom Horizon server URL',
				},
			],
			description: 'Which Stellar network to connect to',
		},
		{
			displayName: 'Custom Horizon URL',
			name: 'customHorizonUrl',
			type: 'string',
			default: '',
			placeholder: 'https://horizon.example.com',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			description: 'URL of custom Horizon server',
		},
		{
			displayName: 'Custom Network Passphrase',
			name: 'customNetworkPassphrase',
			type: 'string',
			default: '',
			placeholder: 'Custom Network ; January 2024',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			description: 'Network passphrase for custom network',
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'S...',
			description: 'Your Stellar secret key (starts with S). Required for signing transactions.',
		},
		{
			displayName: 'Soroban RPC URL',
			name: 'sorobanRpcUrl',
			type: 'string',
			default: '',
			placeholder: 'https://soroban-testnet.stellar.org',
			description: 'Optional Soroban RPC URL for smart contract operations',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "public" ? "https://horizon.stellar.org" : $credentials.network === "testnet" ? "https://horizon-testnet.stellar.org" : $credentials.network === "futurenet" ? "https://horizon-futurenet.stellar.org" : $credentials.customHorizonUrl}}',
			url: '/',
		},
	};
}
