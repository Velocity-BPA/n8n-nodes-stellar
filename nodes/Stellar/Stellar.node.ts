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
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Payment',
            value: 'payment',
          },
          {
            name: 'Asset',
            value: 'asset',
          },
          {
            name: 'Orderbook',
            value: 'orderbook',
          },
          {
            name: 'Ledger',
            value: 'ledger',
          },
          {
            name: 'Operation',
            value: 'operation',
          },
          {
            name: 'Accounts',
            value: 'accounts',
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
        default: 'account',
      },
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['account'] } },
  options: [
    { name: 'Get Account', value: 'getAccount', description: 'Retrieve account details including balances and signers', action: 'Get account' },
    { name: 'Get Accounts', value: 'getAccounts', description: 'List accounts with optional filters', action: 'Get accounts' },
    { name: 'Get Account Transactions', value: 'getAccountTransactions', description: 'Get transactions for specific account', action: 'Get account transactions' },
    { name: 'Get Account Operations', value: 'getAccountOperations', description: 'Get operations for specific account', action: 'Get account operations' },
    { name: 'Get Account Payments', value: 'getAccountPayments', description: 'Get payment operations for account', action: 'Get account payments' }
  ],
  default: 'getAccount',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['transaction'] } },
  options: [
    {
      name: 'Submit Transaction',
      value: 'submitTransaction',
      description: 'Submit a signed transaction to the network',
      action: 'Submit transaction'
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Retrieve transaction by hash',
      action: 'Get transaction'
    },
    {
      name: 'Get Transactions',
      value: 'getTransactions',
      description: 'List transactions with optional filters',
      action: 'Get transactions'
    },
    {
      name: 'Get Transaction Operations',
      value: 'getTransactionOperations',
      description: 'Get operations within a transaction',
      action: 'Get transaction operations'
    },
    {
      name: 'Get Transaction Effects',
      value: 'getTransactionEffects',
      description: 'Get effects of a transaction',
      action: 'Get transaction effects'
    }
  ],
  default: 'submitTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['payment'] } },
  options: [
    { name: 'Get Payments', value: 'getPayments', description: 'List all payment operations', action: 'Get all payments' },
    { name: 'Get Payment', value: 'getPayment', description: 'Get specific payment operation details', action: 'Get a payment' },
    { name: 'Get Account Payments', value: 'getAccountPayments', description: 'Get payments for specific account', action: 'Get account payments' },
    { name: 'Get Ledger Payments', value: 'getLedgerPayments', description: 'Get payments in specific ledger', action: 'Get ledger payments' },
  ],
  default: 'getPayments',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['asset'],
		},
	},
	options: [
		{
			name: 'Get Assets',
			value: 'getAssets',
			description: 'List all assets with optional filters',
			action: 'Get assets',
		},
		{
			name: 'Get Account Balances',
			value: 'getAccountBalances',
			description: 'Get asset balances for account',
			action: 'Get account balances',
		},
		{
			name: 'Get Asset',
			value: 'getAsset',
			description: 'Get specific asset information',
			action: 'Get asset',
		},
	],
	default: 'getAssets',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['orderbook'] } },
  options: [
    { name: 'Get Orderbook', value: 'getOrderbook', description: 'Get orderbook for asset pair', action: 'Get orderbook for asset pair' },
    { name: 'Get Trades', value: 'getTrades', description: 'List recent trades', action: 'List recent trades' },
    { name: 'Get Account Trades', value: 'getAccountTrades', description: 'Get trades for specific account', action: 'Get trades for specific account' },
    { name: 'Get Orderbook Trades', value: 'getOrderbookTrades', description: 'Get trades for specific asset pair', action: 'Get trades for specific asset pair' }
  ],
  default: 'getOrderbook',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['ledger'] } },
  options: [
    { name: 'Get Ledgers', value: 'getLedgers', description: 'List ledgers with optional filters', action: 'Get ledgers' },
    { name: 'Get Ledger', value: 'getLedger', description: 'Get specific ledger by sequence number', action: 'Get ledger' },
    { name: 'Get Ledger Transactions', value: 'getLedgerTransactions', description: 'Get transactions in specific ledger', action: 'Get ledger transactions' },
    { name: 'Get Ledger Operations', value: 'getLedgerOperations', description: 'Get operations in specific ledger', action: 'Get ledger operations' },
    { name: 'Get Ledger Effects', value: 'getLedgerEffects', description: 'Get effects in specific ledger', action: 'Get ledger effects' },
  ],
  default: 'getLedgers',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['operation'] } },
  options: [
    { name: 'Get Operations', value: 'getOperations', description: 'List all operations', action: 'Get operations' },
    { name: 'Get Operation', value: 'getOperation', description: 'Get specific operation details', action: 'Get operation' },
    { name: 'Get Account Operations', value: 'getAccountOperations', description: 'Get operations for specific account', action: 'Get account operations' },
    { name: 'Get Transaction Operations', value: 'getTransactionOperations', description: 'Get operations within transaction', action: 'Get transaction operations' }
  ],
  default: 'getOperations',
},
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
{
  displayName: 'Account ID',
  name: 'account_id',
  type: 'string',
  required: true,
  displayOptions: { 
    show: { 
      resource: ['account'],
      operation: ['getAccount', 'getAccountTransactions', 'getAccountOperations', 'getAccountPayments']
    }
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
      resource: ['account'],
      operation: ['getAccounts', 'getAccountTransactions', 'getAccountOperations', 'getAccountPayments']
    }
  },
  default: '',
  description: 'A paging token, specifying where to start returning records from',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: { 
    show: { 
      resource: ['account'],
      operation: ['getAccounts', 'getAccountTransactions', 'getAccountOperations', 'getAccountPayments']
    }
  },
  default: 10,
  typeOptions: {
    minValue: 1,
    maxValue: 200,
  },
  description: 'The number of records to return (max 200)',
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  required: false,
  displayOptions: { 
    show: { 
      resource: ['account'],
      operation: ['getAccounts', 'getAccountTransactions', 'getAccountOperations', 'getAccountPayments']
    }
  },
  options: [
    { name: 'Ascending', value: 'asc' },
    { name: 'Descending', value: 'desc' }
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
  displayName: 'Transaction XDR',
  name: 'tx',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['submitTransaction']
    }
  },
  default: '',
  description: 'The signed transaction in XDR format'
},
{
  displayName: 'Transaction Hash',
  name: 'hash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransaction', 'getTransactionOperations', 'getTransactionEffects']
    }
  },
  default: '',
  description: 'The hash of the transaction'
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactions', 'getTransactionOperations', 'getTransactionEffects']
    }
  },
  default: '',
  description: 'A paging token, specifying where to start returning records from'
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactions', 'getTransactionOperations', 'getTransactionEffects']
    }
  },
  default: 10,
  description: 'The maximum number of records to return',
  typeOptions: {
    minValue: 1,
    maxValue: 200
  }
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransactions']
    }
  },
  options: [
    {
      name: 'Ascending',
      value: 'asc'
    },
    {
      name: 'Descending',
      value: 'desc'
    }
  ],
  default: 'asc',
  description: 'The order in which to return records'
},
{
  displayName: 'Payment ID',
  name: 'paymentId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['payment'], operation: ['getPayment'] } },
  default: '',
  description: 'The ID of the payment operation to retrieve',
},
{
  displayName: 'Account ID',
  name: 'accountId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['payment'], operation: ['getAccountPayments'] } },
  default: '',
  description: 'The account ID to get payments for',
},
{
  displayName: 'Ledger Sequence',
  name: 'sequence',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['payment'], operation: ['getLedgerPayments'] } },
  default: '',
  description: 'The sequence number of the ledger',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: { show: { resource: ['payment'], operation: ['getPayments', 'getAccountPayments', 'getLedgerPayments'] } },
  default: '',
  description: 'A paging token specifying where to start returning records from',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['payment'], operation: ['getPayments', 'getAccountPayments', 'getLedgerPayments'] } },
  default: 10,
  description: 'The maximum number of records to return',
  typeOptions: { minValue: 1, maxValue: 200 },
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  displayOptions: { show: { resource: ['payment'], operation: ['getPayments', 'getAccountPayments', 'getLedgerPayments'] } },
  options: [
    { name: 'Ascending', value: 'asc' },
    { name: 'Descending', value: 'desc' },
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
	displayName: 'Asset Code',
	name: 'assetCode',
	type: 'string',
	default: '',
	description: 'The asset code to filter by',
	displayOptions: {
		show: {
			resource: ['asset'],
			operation: ['getAssets'],
		},
	},
},
{
	displayName: 'Asset Issuer',
	name: 'assetIssuer',
	type: 'string',
	default: '',
	description: 'The asset issuer account ID to filter by',
	displayOptions: {
		show: {
			resource: ['asset'],
			operation: ['getAssets'],
		},
	},
},
{
	displayName: 'Cursor',
	name: 'cursor',
	type: 'string',
	default: '',
	description: 'A cursor to start pagination from',
	displayOptions: {
		show: {
			resource: ['asset'],
			operation: ['getAssets'],
		},
	},
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	default: 10,
	description: 'Maximum number of assets to return',
	typeOptions: {
		minValue: 1,
		maxValue: 200,
	},
	displayOptions: {
		show: {
			resource: ['asset'],
			operation: ['getAssets'],
		},
	},
},
{
	displayName: 'Order',
	name: 'order',
	type: 'options',
	default: 'asc',
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
	description: 'The order to sort results',
	displayOptions: {
		show: {
			resource: ['asset'],
			operation: ['getAssets'],
		},
	},
},
{
	displayName: 'Account ID',
	name: 'accountId',
	type: 'string',
	required: true,
	default: '',
	description: 'The account ID to get balances for',
	displayOptions: {
		show: {
			resource: ['asset'],
			operation: ['getAccountBalances'],
		},
	},
},
{
	displayName: 'Asset Code',
	name: 'assetCode',
	type: 'string',
	required: true,
	default: '',
	description: 'The asset code to get information for',
	displayOptions: {
		show: {
			resource: ['asset'],
			operation: ['getAsset'],
		},
	},
},
{
	displayName: 'Asset Issuer',
	name: 'assetIssuer',
	type: 'string',
	required: true,
	default: '',
	description: 'The asset issuer account ID',
	displayOptions: {
		show: {
			resource: ['asset'],
			operation: ['getAsset'],
		},
	},
},
{
  displayName: 'Selling Asset Type',
  name: 'selling_asset_type',
  type: 'options',
  required: true,
  displayOptions: { show: { resource: ['orderbook'], operation: ['getOrderbook', 'getOrderbookTrades'] } },
  options: [
    { name: 'Native', value: 'native' },
    { name: 'Credit Alphanum4', value: 'credit_alphanum4' },
    { name: 'Credit Alphanum12', value: 'credit_alphanum12' }
  ],
  default: 'native',
  description: 'The type of the selling asset',
},
{
  displayName: 'Selling Asset Code',
  name: 'selling_asset_code',
  type: 'string',
  displayOptions: { show: { resource: ['orderbook'], operation: ['getOrderbook', 'getOrderbookTrades'], selling_asset_type: ['credit_alphanum4', 'credit_alphanum12'] } },
  default: '',
  description: 'The code of the selling asset',
},
{
  displayName: 'Selling Asset Issuer',
  name: 'selling_asset_issuer',
  type: 'string',
  displayOptions: { show: { resource: ['orderbook'], operation: ['getOrderbook', 'getOrderbookTrades'], selling_asset_type: ['credit_alphanum4', 'credit_alphanum12'] } },
  default: '',
  description: 'The issuer of the selling asset',
},
{
  displayName: 'Buying Asset Type',
  name: 'buying_asset_type',
  type: 'options',
  required: true,
  displayOptions: { show: { resource: ['orderbook'], operation: ['getOrderbook', 'getOrderbookTrades'] } },
  options: [
    { name: 'Native', value: 'native' },
    { name: 'Credit Alphanum4', value: 'credit_alphanum4' },
    { name: 'Credit Alphanum12', value: 'credit_alphanum12' }
  ],
  default: 'native',
  description: 'The type of the buying asset',
},
{
  displayName: 'Buying Asset Code',
  name: 'buying_asset_code',
  type: 'string',
  displayOptions: { show: { resource: ['orderbook'], operation: ['getOrderbook', 'getOrderbookTrades'], buying_asset_type: ['credit_alphanum4', 'credit_alphanum12'] } },
  default: '',
  description: 'The code of the buying asset',
},
{
  displayName: 'Buying Asset Issuer',
  name: 'buying_asset_issuer',
  type: 'string',
  displayOptions: { show: { resource: ['orderbook'], operation: ['getOrderbook', 'getOrderbookTrades'], buying_asset_type: ['credit_alphanum4', 'credit_alphanum12'] } },
  default: '',
  description: 'The issuer of the buying asset',
},
{
  displayName: 'Account ID',
  name: 'account_id',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['orderbook'], operation: ['getAccountTrades'] } },
  default: '',
  description: 'The account ID to get trades for',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: { show: { resource: ['orderbook'], operation: ['getTrades', 'getAccountTrades', 'getOrderbookTrades'] } },
  default: '',
  description: 'A paging token, specifying where to start returning records from',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['orderbook'], operation: ['getOrderbook', 'getTrades', 'getAccountTrades', 'getOrderbookTrades'] } },
  typeOptions: { minValue: 1, maxValue: 200 },
  default: 20,
  description: 'The number of records to return',
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  displayOptions: { show: { resource: ['orderbook'], operation: ['getTrades', 'getAccountTrades'] } },
  options: [
    { name: 'Ascending', value: 'asc' },
    { name: 'Descending', value: 'desc' }
  ],
  default: 'desc',
  description: 'The order of the returned records',
},
{
  displayName: 'Sequence Number',
  name: 'sequence',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedger', 'getLedgerTransactions', 'getLedgerOperations', 'getLedgerEffects'],
    },
  },
  default: '',
  description: 'The sequence number of the ledger',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedgers', 'getLedgerTransactions', 'getLedgerOperations', 'getLedgerEffects'],
    },
  },
  default: '',
  description: 'A paging token specifying where to start returning records from',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedgers', 'getLedgerTransactions', 'getLedgerOperations', 'getLedgerEffects'],
    },
  },
  default: 10,
  description: 'The maximum number of records to return',
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedgers'],
    },
  },
  options: [
    { name: 'Ascending', value: 'asc' },
    { name: 'Descending', value: 'desc' },
  ],
  default: 'asc',
  description: 'The order in which to return rows',
},
{
  displayName: 'Cursor',
  name: 'cursor',
  type: 'string',
  default: '',
  description: 'A paging token, specifying where to start returning records from',
  displayOptions: {
    show: {
      resource: ['operation'],
      operation: ['getOperations', 'getAccountOperations', 'getTransactionOperations']
    }
  }
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  default: 10,
  description: 'The maximum number of records returned',
  typeOptions: {
    minValue: 1,
    maxValue: 200
  },
  displayOptions: {
    show: {
      resource: ['operation'],
      operation: ['getOperations', 'getAccountOperations', 'getTransactionOperations']
    }
  }
},
{
  displayName: 'Order',
  name: 'order',
  type: 'options',
  options: [
    { name: 'Ascending', value: 'asc' },
    { name: 'Descending', value: 'desc' }
  ],
  default: 'asc',
  description: 'The order in which to return rows',
  displayOptions: {
    show: {
      resource: ['operation'],
      operation: ['getOperations', 'getAccountOperations', 'getTransactionOperations']
    }
  }
},
{
  displayName: 'Operation ID',
  name: 'id',
  type: 'string',
  required: true,
  default: '',
  description: 'The unique identifier for the operation',
  displayOptions: {
    show: {
      resource: ['operation'],
      operation: ['getOperation']
    }
  }
},
{
  displayName: 'Account ID',
  name: 'account_id',
  type: 'string',
  required: true,
  default: '',
  description: 'The account ID to retrieve operations for',
  displayOptions: {
    show: {
      resource: ['operation'],
      operation: ['getAccountOperations']
    }
  }
},
{
  displayName: 'Transaction Hash',
  name: 'hash',
  type: 'string',
  required: true,
  default: '',
  description: 'The transaction hash to retrieve operations for',
  displayOptions: {
    show: {
      resource: ['operation'],
      operation: ['getTransactionOperations']
    }
  }
},
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
      case 'account':
        return [await executeAccountOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'payment':
        return [await executePaymentOperations.call(this, items)];
      case 'asset':
        return [await executeAssetOperations.call(this, items)];
      case 'orderbook':
        return [await executeOrderbookOperations.call(this, items)];
      case 'ledger':
        return [await executeLedgerOperations.call(this, items)];
      case 'operation':
        return [await executeOperationOperations.call(this, items)];
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
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

async function executeAccountOperations(
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
          const accountId = this.getNodeParameter('account_id', i) as string;
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/accounts/${accountId}`,
            headers: {
              'Content-Type': 'application/json',
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
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          const queryParams = new URLSearchParams();
          if (cursor) queryParams.append('cursor', cursor);
          if (limit) queryParams.append('limit', limit.toString());
          if (order) queryParams.append('order', order);

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/accounts?${queryParams.toString()}`,
            headers: {
              'Content-Type': 'application/json',
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
          const accountId = this.getNodeParameter('account_id', i) as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          const queryParams = new URLSearchParams();
          if (cursor) queryParams.append('cursor', cursor);
          if (limit) queryParams.append('limit', limit.toString());
          if (order) queryParams.append('order', order);

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/accounts/${accountId}/transactions?${queryParams.toString()}`,
            headers: {
              'Content-Type': 'application/json',
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
          const accountId = this.getNodeParameter('account_id', i) as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          const queryParams = new URLSearchParams();
          if (cursor) queryParams.append('cursor', cursor);
          if (limit) queryParams.append('limit', limit.toString());
          if (order) queryParams.append('order', order);

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/accounts/${accountId}/operations?${queryParams.toString()}`,
            headers: {
              'Content-Type': 'application/json',
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
          const accountId = this.getNodeParameter('account_id', i) as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          const queryParams = new URLSearchParams();
          if (cursor) queryParams.append('cursor', cursor);
          if (limit) queryParams.append('limit', limit.toString());
          if (order) queryParams.append('order', order);

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/accounts/${accountId}/payments?${queryParams.toString()}`,
            headers: {
              'Content-Type': 'application/json',
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
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}

async function executeTransactionOperations(
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
        case 'submitTransaction': {
          const tx = this.getNodeParameter('tx', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/transactions`,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
              tx: tx
            },
            json: true
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransaction': {
          const hash = this.getNodeParameter('hash', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${hash}`,
            headers: {
              'Accept': 'application/json'
            },
            json: true
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactions': {
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const order = this.getNodeParameter('order', i, 'asc') as string;

          const queryParams: string[] = [];
          if (cursor) queryParams.push(`cursor=${encodeURIComponent(cursor)}`);
          if (limit) queryParams.push(`limit=${limit}`);
          if (order) queryParams.push(`order=${order}`);

          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions${queryString}`,
            headers: {
              'Accept': 'application/json'
            },
            json: true
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactionOperations': {
          const hash = this.getNodeParameter('hash', i) as string;
          const cursor = this.getNodeParameter('cursor', i, '') as string;
          const limit = this.getNodeParameter('limit', i, 10) as number;

          const queryParams: string[] = [];
          if (cursor) queryParams.push(`cursor=${encodeURIComponent(cursor)}`);
          if (limit) queryParams.push(`limit=${limit}`);

          const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${hash}/operations${queryString}`,
            headers: {
              'Accept': 'application/json'
            },
            json: true
          };

          if (credentials.apiKey) {
            options.headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransactionEffects': {
          const hash = this.getNodeParameter('hash', i) as string;
          const cursor = this.getNodeParameter