/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class StellarAnchor implements ICredentialType {
	name = 'stellarAnchor';
	displayName = 'Stellar Anchor';
	documentationUrl = 'https://developers.stellar.org/docs/anchors';
	properties: INodeProperties[] = [
		{
			displayName: 'Anchor Domain',
			name: 'anchorDomain',
			type: 'string',
			default: '',
			placeholder: 'anchor.example.com',
			description: 'The domain of the Stellar anchor',
		},
		{
			displayName: 'Auth Token',
			name: 'authToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'SEP-10 authentication token',
		},
	];
}
