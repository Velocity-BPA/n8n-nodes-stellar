import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class StellarApi implements ICredentialType {
	name = 'stellarApi';
	displayName = 'Stellar API';
	documentationUrl = 'https://developers.stellar.org/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://horizon.stellar.org',
			required: true,
			description: 'The base URL of the Stellar Horizon API server',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'API key for authenticated requests (optional for read operations)',
		},
		{
			displayName: 'Network Passphrase',
			name: 'networkPassphrase',
			type: 'options',
			options: [
				{
					name: 'Public Network',
					value: 'Public Global Stellar Network ; September 2015',
				},
				{
					name: 'Test Network',
					value: 'Test SDF Network ; September 2015',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'Public Global Stellar Network ; September 2015',
			required: true,
			description: 'The network passphrase for the Stellar network',
		},
		{
			displayName: 'Custom Network Passphrase',
			name: 'customNetworkPassphrase',
			type: 'string',
			default: '',
			required: false,
			displayOptions: {
				show: {
					networkPassphrase: ['custom'],
				},
			},
			description: 'Custom network passphrase when using a private network',
		},
	];
}