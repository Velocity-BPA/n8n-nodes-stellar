/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-stellar/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Stellar implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Stellar',
    name: 'stellar',
    icon: 'file:stellar.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Stellar API',
    defaults: {
      name: 'Stellar',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'stellarApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'unknown',
            value: 'unknown',
          },
          {
            name: 'unknown',
            value: 'unknown',
          },
          {
            name: 'unknown',
            value: 'unknown',
          },
          {
            name: 'Assets',
            value: 'assets',
          },
          {
            name: 'SorobanContracts',
            value: 'sorobanContracts',
          }
        ],
        default: 'accounts',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Account',
      value: 'getAccount',
      description: 'Get account details and balances',
      action: 'Get account details',
    },
    {
      name: 'Get Accounts',
      value: 'getAccounts',
      description: 'Get list of accounts',
      action: 'Get list of accounts',
    },
    {
      name: 'Get Account Transactions',
      value: 'getAccountTransactions',
      description: 'Get transactions for account',
      action: 'Get account transactions',
    },
    {
      name: 'Get Account Operations',
      value: 'getAccountOperations',
      description: 'Get operations for account',
      action: 'Get account operations',
    },
    {
      name: 'Get Account Payments',
      value: 'getAccountPayments',
      description: 'Get payments for account',
      action: 'Get account payments',
    },
    {
      name: 'Get Account Effects',
      value: 'getAccountEffects',
      description: 'Get effects for account',
      action: 'Get account effects',
    },
  ],
  default: 'getAccount',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['assets'],
    },
  },
  options: [
    {
      name: 'Get Assets',
      value: 'getAssets',
      description: 'Get list of assets',
      action: 'Get assets',
    },
    {
      name: 'Get Asset',
      value: 'getAsset',
      description: 'Get specific asset details',
      action: 'Get asset',
    },
    {
      name: 'Create Asset',
      value: 'createAsset',
      description: 'Submit create asset transaction',
      action: 'Create asset',
    },
    {
      name: 'Change Asset Trust',
      value: 'changeAssetTrust',
      description: 'Submit change trust transaction',
      action: 'Change asset trust',
    },
    {
      name: 'Set Asset Options',
      value: 'setAssetOptions',
      description: 'Submit set options for asset',
      action: 'Set asset options',
    },
  ],
  default: 'getAssets',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
    },
  },
  options: [
    {
      name: 'Invoke Contract',
      value: 'invokeContract',
      description: 'Invoke smart contract function',
      action: 'Invoke contract',
    },
    {
      name: 'Simulate Transaction',
      value: 'simulateTransaction',
      description: 'Simulate contract transaction',
      action: 'Simulate transaction',
    },
    {
      name: 'Get Contract',
      value: 'getContract',
      description: 'Get contract information',
      action: 'Get contract',
    },
    {
      name: 'Deploy Contract',
      value: 'deployContract',
      description: 'Deploy new smart contract',
      action: 'Deploy contract',
    },
    {
      name: 'Get Contract Data',
      value: 'getContractData',
      description: 'Get contract data entries',
      action: 'Get contract data',
    },
    {
      name: 'Get Ledger Entries',
      value: 'getLedgerEntries',
      description: 'Get ledger entries for contracts',
      action: 'Get ledger entries',
    },
  ],
  default: 'invokeContract',
},
      // Parameter definitions
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount'],
    },
  },
  default: '',
  description: 'The Stellar account ID (public key)',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  default: '',
  description: 'A number that points to a specific location in a collection of responses and is pulled from the paging_token value of a record',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  default: 10,
  description: 'The maximum number of records returned (1-200)',
  typeOptions: {
    minValue: 1,
    maxValue: 200,
  },
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'The Stellar account ID (public key)',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'A number that points to a specific location in a collection of responses',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 10,
  description: 'The maximum number of records returned (1-200)',
  typeOptions: {
    minValue: 1,
    maxValue: 200,
  },
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactions'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountOperations'],
    },
  },
  default: '',
  description: 'The Stellar account ID (public key)',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountOperations'],
    },
  },
  default: '',
  description: 'A number that points to a specific location in a collection of responses',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountOperations'],
    },
  },
  default: 10,
  description: 'The maximum number of records returned (1-200)',
  typeOptions: {
    minValue: 1,
    maxValue: 200,
  },
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountOperations'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountPayments'],
    },
  },
  default: '',
  description: 'The Stellar account ID (public key)',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountPayments'],
    },
  },
  default: '',
  description: 'A number that points to a specific location in a collection of responses',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountPayments'],
    },
  },
  default: 10,
  description: 'The maximum number of records returned (1-200)',
  typeOptions: {
    minValue: 1,
    maxValue: 200,
  },
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountPayments'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountEffects'],
    },
  },
  default: '',
  description: 'The Stellar account ID (public key)',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountEffects'],
    },
  },
  default: '',
  description: 'A number that points to a specific location in a collection of responses',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountEffects'],
    },
  },
  default: 10,
  description: 'The maximum number of records returned (1-200)',
  typeOptions: {
    minValue: 1,
    maxValue: 200,
  },
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountEffects'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
  displayName: 'Asset Code',
  name: 'asset_code',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'getAsset', 'createAsset'],
    },
  },
  default: '',
  description: 'The asset code to filter by',
},
{
  displayName: 'Asset Issuer',
  name: 'asset_issuer',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'getAsset'],
    },
  },
  default: '',
  description: 'The asset issuer to filter by',
},
{
  displayName: 'Asset Issuer',
  name: 'asset_issuer',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAsset'],
    },
  },
  default: '',
  description: 'The asset issuer (required for specific asset)',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'A paging token, specifying where to start returning records from',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets', 'createAsset', 'changeAssetTrust'],
    },
  },
  default: 10,
  description: 'The number of records to return',
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['getAssets'],
    },
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc',
    },
    {
      name: 'Descending',
      value: 'desc',
    },
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
  displayName: 'Authorize Flags',
  name: 'authorize_flags',
  type: 'multiOptions',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['createAsset'],
    },
  },
  options: [
    {
      name: 'Authorization Required',
      value: 'AUTHORIZATION_REQUIRED',
    },
    {
      name: 'Authorization Revocable',
      value: 'AUTHORIZATION_REVOCABLE',
    },
    {
      name: 'Authorization Immutable',
      value: 'AUTHORIZATION_IMMUTABLE',
    },
  ],
  default: [],
  description: 'Authorization flags for the asset',
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['changeAssetTrust'],
    },
  },
  default: '',
  description: 'The asset code and issuer (format: CODE:ISSUER or native for XLM)',
},
{
  displayName: 'Inflation Destination',
  name: 'inflation_dest',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['setAssetOptions'],
    },
  },
  default: '',
  description: 'Account ID to set as the inflation destination',
},
{
  displayName: 'Clear Flags',
  name: 'clear_flags',
  type: 'multiOptions',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['setAssetOptions'],
    },
  },
  options: [
    {
      name: 'Authorization Required',
      value: 'AUTHORIZATION_REQUIRED',
    },
    {
      name: 'Authorization Revocable',
      value: 'AUTHORIZATION_REVOCABLE',
    },
    {
      name: 'Authorization Immutable',
      value: 'AUTHORIZATION_IMMUTABLE',
    },
  ],
  default: [],
  description: 'Flags to clear on the account',
},
{
  displayName: 'Set Flags',
  name: 'set_flags',
  type: 'multiOptions',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['setAssetOptions'],
    },
  },
  options: [
    {
      name: 'Authorization Required',
      value: 'AUTHORIZATION_REQUIRED',
    },
    {
      name: 'Authorization Revocable',
      value: 'AUTHORIZATION_REVOCABLE',
    },
    {
      name: 'Authorization Immutable',
      value: 'AUTHORIZATION_IMMUTABLE',
    },
  ],
  default: [],
  description: 'Flags to set on the account',
},
{
  displayName: 'Master Weight',
  name: 'master_weight',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['assets'],
      operation: ['setAssetOptions'],
    },
  },
  default: 1,
  description: 'The master key weight',
},
{
  displayName: 'Contract Address',
  name: 'contract_address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['invokeContract'],
    },
  },
  default: '',
  description: 'The contract address to invoke',
},
{
  displayName: 'Function Name',
  name: 'function_name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['invokeContract'],
    },
  },
  default: '',
  description: 'The contract function name to invoke',
},
{
  displayName: 'Parameters',
  name: 'parameters',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['invokeContract'],
    },
  },
  default: '[]',
  description: 'Function parameters as JSON array',
},
{
  displayName: 'Source Account',
  name: 'source_account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['invokeContract'],
    },
  },
  default: '',
  description: 'Source account for the transaction',
},
{
  displayName: 'Transaction',
  name: 'transaction',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['simulateTransaction'],
    },
  },
  default: '{}',
  description: 'Transaction to simulate as JSON',
},
{
  displayName: 'Contract ID',
  name: 'contract_id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['getContract'],
    },
  },
  default: '',
  description: 'The contract ID to retrieve',
},
{
  displayName: 'Contract WASM',
  name: 'contract_wasm',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['deployContract'],
    },
  },
  default: '',
  description: 'Contract WebAssembly code (hex encoded)',
},
{
  displayName: 'Constructor Arguments',
  name: 'constructor_args',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['deployContract'],
    },
  },
  default: '[]',
  description: 'Constructor arguments as JSON array',
},
{
  displayName: 'Contract Address',
  name: 'contract_address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['getContractData'],
    },
  },
  default: '',
  description: 'The contract address',
},
{
  displayName: 'Key',
  name: 'key',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['getContractData'],
    },
  },
  default: '',
  description: 'The contract data key',
},
{
  displayName: 'Durability',
  name: 'durability',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['getContractData'],
    },
  },
  options: [
    {
      name: 'Temporary',
      value: 'temporary',
    },
    {
      name: 'Persistent',
      value: 'persistent',
    },
  ],
  default: 'persistent',
  description: 'The durability of the contract data',
},
{
  displayName: 'Keys',
  name: 'keys',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['sorobanContracts'],
      operation: ['getLedgerEntries'],
    },
  },
  default: '[]',
  description: 'Array of ledger entry keys',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'unknown':
        return [await executeunknownOperations.call(this, items)];
      case 'unknown':
        return [await executeunknownOperations.call(this, items)];
      case 'unknown':
        return [await executeunknownOperations.call(this, items)];
      case 'assets':
        return [await executeAssetsOperations.call(this, items)];
      case 'sorobanContracts':
        return [await executeSorobanContractsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('stellarApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = credentials.baseUrl || 'https://horizon.stellar.org';

      switch (operation) {
        case 'getAccount': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/accounts/${accountId}`,
            headers: {
              'X-Client-Name': 'n8n-stellar-node',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccounts': {
          const queryParams: any = {};
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          if (cursor) queryParams.cursor = cursor;
          if (limit) queryParams.limit = limit;
          if (order) queryParams.order = order;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = queryString ? `${baseUrl}/accounts?${queryString}` : `${baseUrl}/accounts`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-Client-Name': 'n8n-stellar-node',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountTransactions': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const queryParams: any = {};
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          if (cursor) queryParams.cursor = cursor;
          if (limit) queryParams.limit = limit;
          if (order) queryParams.order = order;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = queryString 
            ? `${baseUrl}/accounts/${accountId}/transactions?${queryString}` 
            : `${baseUrl}/accounts/${accountId}/transactions`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-Client-Name': 'n8n-stellar-node',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountOperations': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const queryParams: any = {};
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          if (cursor) queryParams.cursor = cursor;
          if (limit) queryParams.limit = limit;
          if (order) queryParams.order = order;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = queryString 
            ? `${baseUrl}/accounts/${accountId}/operations?${queryString}` 
            : `${baseUrl}/accounts/${accountId}/operations`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-Client-Name': 'n8n-stellar-node',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountPayments': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const queryParams: any = {};
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          if (cursor) queryParams.cursor = cursor;
          if (limit) queryParams.limit = limit;
          if (order) queryParams.order = order;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = queryString 
            ? `${baseUrl}/accounts/${accountId}/payments?${queryString}` 
            : `${baseUrl}/accounts/${accountId}/payments`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-Client-Name': 'n8n-stellar-node',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountEffects': {
          const accountId = this.getNodeParameter('accountId', i) as string;
          const queryParams: any = {};
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          if (cursor) queryParams.cursor = cursor;
          if (limit) queryParams.limit = limit;
          if (order) queryParams.order = order;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = queryString 
            ? `${baseUrl}/accounts/${accountId}/effects?${queryString}` 
            : `${baseUrl}/accounts/${accountId}/effects`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-Client-Name': 'n8n-stellar-node',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

// PARSE ERROR for unknown — manual fix needed
// Raw: // No additional imports

{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['payments'],
    },
  },
  options: [
    {
      name: 'Submit Payment',
      value: 'submitPayment',
      description: 'Submi

// PARSE ERROR for unknown — manual fix needed
// Raw: // No additional imports

{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['tradingOffers'],
    },
  },
  options: [
    {
      name: 'Get Offers',
      value: 'getOffers',
      description: 'Get list

// PARSE ERROR for unknown — manual fix needed
// Raw: // No additional imports

{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['orderbook'],
    },
  },
  options: [
    {
      name: 'Get Orderbook',
      value: 'getOrderbook',
      description: 'Get or

async function executeAssetsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('stellarApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAssets': {
          const queryParams: any = {};
          
          const assetCode = this.getNodeParameter('asset_code', i, '') as string;
          const assetIssuer = this.getNodeParameter('asset_issuer', i, '') as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          if (assetCode) queryParams.asset_code = assetCode;
          if (assetIssuer) queryParams.asset_issuer = assetIssuer;
          if (cursor) queryParams.cursor = cursor;
          if (limit) queryParams.limit = limit;
          if (order) queryParams.order = order;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: queryParams,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAsset': {
          const assetCode = this.getNodeParameter('asset_code', i) as string;
          const assetIssuer = this.getNodeParameter('asset_issuer', i) as string;

          if (!assetCode || !assetIssuer) {
            throw new NodeOperationError(this.getNode(), 'Asset code and issuer are required for getting specific asset');
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/assets/${encodeURIComponent(assetCode)}/${encodeURIComponent(assetIssuer)}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createAsset': {
          const assetCode = this.getNodeParameter('asset_code', i) as string;
          const limit = this.getNodeParameter('limit', i, '') as string;
          const authorizeFlags = this.getNodeParameter('authorize_flags', i, []) as string[];

          if (!assetCode) {
            throw new NodeOperationError(this.getNode(), 'Asset code is required for creating asset');
          }

          const transactionData: any = {
            operations: [
              {
                type: 'create_asset',
                asset_code: assetCode,
                limit: limit,
                authorize_flags: authorizeFlags,
              },
            ],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: transactionData,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'changeAssetTrust': {
          const asset = this.getNodeParameter('asset', i) as string;
          const limit = this.getNodeParameter('limit', i, '') as string;

          if (!asset) {
            throw new NodeOperationError(this.getNode(), 'Asset is required for changing trust');
          }

          const transactionData: any = {
            operations: [
              {
                type: 'change_trust',
                asset: asset,
                limit: limit,
              },
            ],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: transactionData,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'setAssetOptions': {
          const inflationDest = this.getNodeParameter('inflation_dest', i, '') as string;
          const clearFlags = this.getNodeParameter('clear_flags', i, []) as string[];
          const setFlags = this.getNodeParameter('set_flags', i, []) as string[];
          const masterWeight = this.getNodeParameter('master_weight', i, 1) as number;

          const transactionData: any = {
            operations: [
              {
                type: 'set_options',
                inflation_dest: inflationDest || undefined,
                clear_flags: clearFlags.length > 0 ? clearFlags : undefined,
                set_flags: setFlags.length > 0 ? setFlags : undefined,
                master_weight: masterWeight,
              },
            ],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: transactionData,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeSorobanContractsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('stellarApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'invokeContract': {
          const contractAddress = this.getNodeParameter('contract_address', i) as string;
          const functionName = this.getNodeParameter('function_name', i) as string;
          const parameters = this.getNodeParameter('parameters', i) as string;
          const sourceAccount = this.getNodeParameter('source_account', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'simulateTransaction',
            params: {
              transaction: {
                sourceAccount,
                operations: [{
                  type: 'invokeHostFunction',
                  hostFunction: {
                    type: 'invokeContract',
                    contractAddress,
                    functionName,
                    args: JSON.parse(parameters),
                  },
                }],
              },
            },
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/soroban/rpc`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'simulateTransaction': {
          const transaction = this.getNodeParameter('transaction', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'simulateTransaction',
            params: {
              transaction: JSON.parse(transaction),
            },
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/soroban/rpc`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getContract': {
          const contractId = this.getNodeParameter('contract_id', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/contracts/${contractId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deployContract': {
          const contractWasm = this.getNodeParameter('contract_wasm', i) as string;
          const constructorArgs = this.getNodeParameter('constructor_args', i) as string;

          const requestBody = {
            operations: [{
              type: 'createContract',
              contractDataXDR: contractWasm,
              constructorArgs: JSON.parse(constructorArgs),
            }],
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getContractData': {
          const contractAddress = this.getNodeParameter('contract_address', i) as string;
          const key = this.getNodeParameter('key', i) as string;
          const durability = this.getNodeParameter('durability', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'getContractData',
            params: {
              contractId: contractAddress,
              key,
              durability,
            },
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/soroban/rpc`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLedgerEntries': {
          const keys = this.getNodeParameter('keys', i) as string;

          const requestBody = {
            jsonrpc: '2.0',
            id: 1,
            method: 'getLedgerEntries',
            params: {
              keys: JSON.parse(keys),
            },
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/soroban/rpc`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            body: requestBody,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}
