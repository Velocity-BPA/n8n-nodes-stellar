/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Stellar } from '../nodes/Stellar/Stellar.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Stellar Node', () => {
  let node: Stellar;

  beforeAll(() => {
    node = new Stellar();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Stellar');
      expect(node.description.name).toBe('stellar');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Account Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://horizon.stellar.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn() 
      },
    };
  });

  describe('getAccount operation', () => {
    it('should successfully get account details', async () => {
      const mockAccountData = {
        id: 'GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7',
        account_id: 'GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7',
        sequence: '1234567890',
        balances: []
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccount')
        .mockReturnValueOnce('GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccountData);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/accounts/GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockAccountData, pairedItem: { item: 0 } }]);
    });

    it('should handle errors when getting account fails', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccount')
        .mockReturnValueOnce('invalid-account-id');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Account not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Account not found' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getAccounts operation', () => {
    it('should successfully get accounts list', async () => {
      const mockAccountsData = {
        _embedded: { records: [] },
        _links: { next: { href: '' } }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccounts')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce('asc');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccountsData);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockAccountsData, pairedItem: { item: 0 } }]);
    });
  });

  describe('getAccountTransactions operation', () => {
    it('should successfully get account transactions', async () => {
      const mockTransactionsData = {
        _embedded: { records: [] },
        _links: { next: { href: '' } }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountTransactions')
        .mockReturnValueOnce('GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce('asc');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactionsData);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockTransactionsData, pairedItem: { item: 0 } }]);
    });
  });

  describe('getAccountOperations operation', () => {
    it('should successfully get account operations', async () => {
      const mockOperationsData = {
        _embedded: { records: [] },
        _links: { next: { href: '' } }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountOperations')
        .mockReturnValueOnce('GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce('asc');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockOperationsData);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockOperationsData, pairedItem: { item: 0 } }]);
    });
  });

  describe('getAccountPayments operation', () => {
    it('should successfully get account payments', async () => {
      const mockPaymentsData = {
        _embedded: { records: [] },
        _links: { next: { href: '' } }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountPayments')
        .mockReturnValueOnce('GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce('asc');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPaymentsData);

      const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockPaymentsData, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://horizon.stellar.org'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      }
    };
  });

  describe('submitTransaction', () => {
    it('should submit a transaction successfully', async () => {
      const mockResponse = { hash: 'tx123', successful: true };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('submitTransaction')
        .mockReturnValueOnce('AAAA...XDR...');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://horizon.stellar.org/transactions',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer test-key'
        },
        form: {
          tx: 'AAAA...XDR...'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle submit transaction error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('submitTransaction')
        .mockReturnValueOnce('invalid-xdr');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid transaction'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{ json: { error: 'Invalid transaction' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getTransaction', () => {
    it('should get a transaction by hash successfully', async () => {
      const mockResponse = { hash: 'tx123', ledger: 12345 };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransaction')
        .mockReturnValueOnce('tx123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/transactions/tx123',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getTransactions', () => {
    it('should get transactions with filters successfully', async () => {
      const mockResponse = { _embedded: { records: [] } };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransactions')
        .mockReturnValueOnce('cursor123')
        .mockReturnValueOnce(20)
        .mockReturnValueOnce('desc');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/transactions?cursor=cursor123&limit=20&order=desc',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getTransactionOperations', () => {
    it('should get transaction operations successfully', async () => {
      const mockResponse = { _embedded: { records: [] } };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransactionOperations')
        .mockReturnValueOnce('tx123')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/transactions/tx123/operations?limit=10',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getTransactionEffects', () => {
    it('should get transaction effects successfully', async () => {
      const mockResponse = { _embedded: { records: [] } };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransactionEffects')
        .mockReturnValueOnce('tx123')
        .mockReturnValueOnce('cursor456')
        .mockReturnValueOnce(15);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/transactions/tx123/effects?cursor=cursor456&limit=15',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        json: true
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Payment Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://horizon.stellar.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  it('should get all payments successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getPayments')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce('asc');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      _embedded: { records: [] },
      _links: {}
    });

    const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://horizon.stellar.org/payments?limit=10&order=asc',
      headers: { 
        'Accept': 'application/json',
        'Authorization': 'Bearer test-key'
      },
      json: true,
    });
    expect(result).toHaveLength(1);
  });

  it('should get specific payment successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getPayment')
      .mockReturnValueOnce('123456789');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: '123456789',
      type: 'payment'
    });

    const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://horizon.stellar.org/payments/123456789',
      headers: { 
        'Accept': 'application/json',
        'Authorization': 'Bearer test-key'
      },
      json: true,
    });
    expect(result).toHaveLength(1);
  });

  it('should get account payments successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAccountPayments')
      .mockReturnValueOnce('GABC123')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce('desc');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      _embedded: { records: [] },
      _links: {}
    });

    const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://horizon.stellar.org/accounts/GABC123/payments?limit=10&order=desc',
      headers: { 
        'Accept': 'application/json',
        'Authorization': 'Bearer test-key'
      },
      json: true,
    });
    expect(result).toHaveLength(1);
  });

  it('should handle errors with continueOnFail', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getPayments');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getPayments');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executePaymentOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
  });
});

describe('Asset Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://horizon.stellar.org',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getAssets operation', () => {
		it('should get assets successfully', async () => {
			const mockResponse = {
				_embedded: {
					records: [
						{
							asset_type: 'credit_alphanum4',
							asset_code: 'USD',
							asset_issuer: 'GCKFBEIYTKP5RDBMHAJLZKBF',
							num_accounts: 100,
							amount: '1000000.0000000',
						},
					],
				},
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAssets')
				.mockReturnValueOnce('USD')
				.mockReturnValueOnce('GCKFBEIYTKP5RDBMHAJLZKBF')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(10)
				.mockReturnValueOnce('asc');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeAssetOperations.call(mockExecuteFunctions, items);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://horizon.stellar.org/assets?asset_code=USD&asset_issuer=GCKFBEIYTKP5RDBMHAJLZKBF&limit=10&order=asc',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer test-key',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle getAssets errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAssets')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(10)
				.mockReturnValueOnce('asc');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const items = [{ json: {} }];
			const result = await executeAssetOperations.call(mockExecuteFunctions, items);

			expect(result).toEqual([
				{
					json: { error: 'API Error' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getAccountBalances operation', () => {
		it('should get account balances successfully', async () => {
			const mockResponse = [
				{
					balance: '10000.0000000',
					asset_type: 'native',
				},
				{
					balance: '500.0000000',
					asset_type: 'credit_alphanum4',
					asset_code: 'USD',
					asset_issuer: 'GCKFBEIYTKP5RDBMHAJLZKBF',
				},
			];

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountBalances')
				.mockReturnValueOnce('GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeAssetOperations.call(mockExecuteFunctions, items);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://horizon.stellar.org/accounts/GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3/balances',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer test-key',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getAsset operation', () => {
		it('should get specific asset successfully', async () => {
			const mockResponse = {
				asset_type: 'credit_alphanum4',
				asset_code: 'USD',
				asset_issuer: 'GCKFBEIYTKP5RDBMHAJLZKBF',
				num_accounts: 100,
				amount: '1000000.0000000',
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAsset')
				.mockReturnValueOnce('USD')
				.mockReturnValueOnce('GCKFBEIYTKP5RDBMHAJLZKBF');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeAssetOperations.call(mockExecuteFunctions, items);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://horizon.stellar.org/assets/USD/GCKFBEIYTKP5RDBMHAJLZKBF',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer test-key',
				},
				json: true,
			});

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle getAsset errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAsset')
				.mockReturnValueOnce('USD')
				.mockReturnValueOnce('GCKFBEIYTKP5RDBMHAJLZKBF');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Asset not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(false);

			const items = [{ json: {} }];

			await expect(executeAssetOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Asset not found');
		});
	});
});

describe('Orderbook Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ baseUrl: 'https://horizon.stellar.org' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  it('should get orderbook successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getOrderbook')
      .mockReturnValueOnce('native')
      .mockReturnValueOnce('credit_alphanum4')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce('USD')
      .mockReturnValueOnce('GCKFBEIYTKP6RCZNVXG2FFADK7NZEH2S4UQSCX6CCGXXWW33IHHVZQH3');

    const mockOrderbook = {
      bids: [{ price: '1.5000000', amount: '100.0000000' }],
      asks: [{ price: '1.5100000', amount: '50.0000000' }]
    };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockOrderbook);

    const result = await executeOrderbookOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockOrderbook, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('/order_book'),
      json: true,
    });
  });

  it('should get trades successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getTrades')
      .mockReturnValueOnce(20)
      .mockReturnValueOnce('')
      .mockReturnValueOnce('desc');

    const mockTrades = {
      _embedded: { records: [{ id: 'trade1' }] }
    };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTrades);

    const result = await executeOrderbookOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockTrades, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('/trades'),
      json: true,
    });
  });

  it('should get account trades successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAccountTrades')
      .mockReturnValueOnce('GCKFBEIYTKP6RCZNVXG2FFADK7NZEH2S4UQSCX6CCGXXWW33IHHVZQH3')
      .mockReturnValueOnce(15)
      .mockReturnValueOnce('cursor123')
      .mockReturnValueOnce('asc');

    const mockAccountTrades = {
      _embedded: { records: [{ id: 'trade1' }] }
    };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccountTrades);

    const result = await executeOrderbookOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockAccountTrades, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: expect.stringContaining('/accounts/GCKFBEIYTKP6RCZNVXG2FFADK7NZEH2S4UQSCX6CCGXXWW33IHHVZQH3/trades'),
      json: true,
    });
  });

  it('should handle errors when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getOrderbook');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeOrderbookOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getOrderbook');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executeOrderbookOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
  });
});

describe('Ledger Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://horizon.stellar.org' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get ledgers successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getLedgers')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce('asc');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      _embedded: { records: [] },
      _links: {}
    });

    const items = [{ json: {} }];
    const result = await executeLedgerOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://horizon.stellar.org/ledgers?limit=10&order=asc',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-key',
      },
      json: true,
    });
  });

  it('should get specific ledger successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getLedger')
      .mockReturnValueOnce('12345');
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: 'ledger-id',
      sequence: 12345
    });

    const items = [{ json: {} }];
    const result = await executeLedgerOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://horizon.stellar.org/ledgers/12345',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-key',
      },
      json: true,
    });
  });

  it('should get ledger transactions successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getLedgerTransactions')
      .mockReturnValueOnce('12345')
      .mockReturnValueOnce('')
      .mockReturnValueOnce(10);
    
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      _embedded: { records: [] }
    });

    const items = [{ json: {} }];
    const result = await executeLedgerOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://horizon.stellar.org/ledgers/12345/transactions?limit=10',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-key',
      },
      json: true,
    });
  });

  it('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getLedger');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const items = [{ json: {} }];
    const result = await executeLedgerOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getLedger');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const items = [{ json: {} }];

    await expect(executeLedgerOperations.call(mockExecuteFunctions, items))
      .rejects.toThrow('API Error');
  });
});

describe('Operation Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://horizon.stellar.org'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      }
    };
  });

  describe('getOperations', () => {
    it('should successfully retrieve all operations', async () => {
      const mockResponse = {
        _embedded: { records: [] },
        _links: { next: { href: 'next-page' } }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getOperations')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce('asc');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOperationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/operations?limit=10&order=asc',
        headers: {
          'Authorization': 'Bearer test-key',
          'Accept': 'application/json'
        },
        json: true
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle errors when retrieving operations', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getOperations');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeOperationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getOperation', () => {
    it('should successfully retrieve specific operation', async () => {
      const mockResponse = {
        id: '12884905985',
        type: 'payment',
        account: 'GACMZD5VJXTRLKVET72CETCYKELPNCOTTBDC6DHFEUPLG5DHEK534LEUVA6'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getOperation')
        .mockReturnValueOnce('12884905985');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOperationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/operations/12884905985',
        headers: {
          'Authorization': 'Bearer test-key',
          'Accept': 'application/json'
        },
        json: true
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });

    it('should handle errors when retrieving specific operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getOperation');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Operation not found'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeOperationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{
        json: { error: 'Operation not found' },
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getAccountOperations', () => {
    it('should successfully retrieve account operations', async () => {
      const mockResponse = {
        _embedded: { records: [] }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAccountOperations')
        .mockReturnValueOnce('GACMZD5VJXTRLKVET72CETCYKELPNCOTTBDC6DHFEUPLG5DHEK534LEUVA6')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce('asc');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOperationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/accounts/GACMZD5VJXTRLKVET72CETCYKELPNCOTTBDC6DHFEUPLG5DHEK534LEUVA6/operations?limit=10&order=asc',
        headers: {
          'Authorization': 'Bearer test-key',
          'Accept': 'application/json'
        },
        json: true
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });

  describe('getTransactionOperations', () => {
    it('should successfully retrieve transaction operations', async () => {
      const mockResponse = {
        _embedded: { records: [] }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransactionOperations')
        .mockReturnValueOnce('abcd1234efgh5678ijkl9012mnop3456qrst7890')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(10);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOperationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/transactions/abcd1234efgh5678ijkl9012mnop3456qrst7890/operations?limit=10',
        headers: {
          'Authorization': 'Bearer test-key',
          'Accept': 'application/json'
        },
        json: true
      });

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 }
      }]);
    });
  });
});
});
