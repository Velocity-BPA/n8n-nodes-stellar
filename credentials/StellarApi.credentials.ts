import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class StellarApi implements ICredentialType {
	name = 'stellarApi';
	displayName = 'Stellar API';
	description = 'Stellar Horizon API credentials';
	documentationUrl = 'https://developers.stellar.org/api';
	icon = 'file:stellar.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for rate limit increases (optional for public endpoints)',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://horizon.stellar.org',
			description: 'Base URL for the Stellar Horizon API',
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Public (Mainnet)',
					value: 'public',
				},
				{
					name: 'Test (Testnet)',
					value: 'test',
				},
			],
			default: 'public',
			description: 'Stellar network to connect to',
		},
	];
}