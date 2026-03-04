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

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
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
describe('Accounts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getAccount', () => {
    it('should get account details successfully', async () => {
      const mockAccountData = {
        account_id: 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A',
        sequence: '12884901888',
        balances: [
          {
            balance: '10000.0000000',
            asset_type: 'native',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccount';
        if (paramName === 'accountId') return 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccountData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockAccountData);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/accounts/GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A',
        headers: {
          'X-Client-Name': 'n8n-stellar-node',
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });

    it('should handle account not found error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccount';
        if (paramName === 'accountId') return 'INVALID_ACCOUNT';
        return undefined;
      });

      const error = new Error('Account not found');
      (error as any).httpCode = 404;
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(
        executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });
  });

  describe('getAccounts', () => {
    it('should get accounts list successfully', async () => {
      const mockAccountsData = {
        _embedded: {
          records: [
            {
              account_id: 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A',
              sequence: '12884901888',
            },
          ],
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccounts';
        if (paramName === 'cursor') return '';
        if (paramName === 'limit') return 10;
        if (paramName === 'order') return 'asc';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockAccountsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockAccountsData);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/accounts?limit=10&order=asc',
        headers: {
          'X-Client-Name': 'n8n-stellar-node',
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getAccountTransactions', () => {
    it('should get account transactions successfully', async () => {
      const mockTransactionsData = {
        _embedded: {
          records: [
            {
              id: 'transaction-id',
              hash: 'transaction-hash',
              source_account: 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A',
            },
          ],
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccountTransactions';
        if (paramName === 'accountId') return 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
        if (paramName === 'cursor') return '';
        if (paramName === 'limit') return 10;
        if (paramName === 'order') return 'asc';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockTransactionsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockTransactionsData);
    });
  });

  describe('getAccountOperations', () => {
    it('should get account operations successfully', async () => {
      const mockOperationsData = {
        _embedded: {
          records: [
            {
              id: 'operation-id',
              type: 'payment',
              source_account: 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A',
            },
          ],
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccountOperations';
        if (paramName === 'accountId') return 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
        if (paramName === 'cursor') return '';
        if (paramName === 'limit') return 10;
        if (paramName === 'order') return 'asc';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockOperationsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockOperationsData);
    });
  });

  describe('getAccountPayments', () => {
    it('should get account payments successfully', async () => {
      const mockPaymentsData = {
        _embedded: {
          records: [
            {
              id: 'payment-id',
              type: 'payment',
              amount: '100.0000000',
              asset_type: 'native',
            },
          ],
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccountPayments';
        if (paramName === 'accountId') return 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
        if (paramName === 'cursor') return '';
        if (paramName === 'limit') return 10;
        if (paramName === 'order') return 'asc';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPaymentsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockPaymentsData);
    });
  });

  describe('getAccountEffects', () => {
    it('should get account effects successfully', async () => {
      const mockEffectsData = {
        _embedded: {
          records: [
            {
              id: 'effect-id',
              type: 'account_credited',
              amount: '100.0000000',
              asset_type: 'native',
            },
          ],
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccountEffects';
        if (paramName === 'accountId') return 'GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A';
        if (paramName === 'cursor') return '';
        if (paramName === 'limit') return 10;
        if (paramName === 'order') return 'asc';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockEffectsData);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockEffectsData);
    });
  });

  describe('error handling', () => {
    it('should continue on fail when continueOnFail is true', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getAccount';
        if (paramName === 'accountId') return 'INVALID_ACCOUNT';
        return undefined;
      });

      const error = new Error('Network error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('Network error');
    });

    it('should throw error for unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'unknownOperation';
        return undefined;
      });

      await expect(
        executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Unknown operation: unknownOperation');
    });
  });
});

describe('Assets Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getAssets', () => {
    it('should get assets successfully', async () => {
      const mockResponse = {
        _embedded: {
          records: [
            {
              asset_type: 'credit_alphanum4',
              asset_code: 'USD',
              asset_issuer: 'GCKFBEIYTKP5RHALAV2R6AIZDJWDOGN6N24PWNZSM4WCPGAOVQOVZKMZ',
            },
          ],
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, i: number, defaultValue?: any) => {
        const params: any = {
          operation: 'getAssets',
          asset_code: 'USD',
          limit: 10,
          order: 'asc',
        };
        return params[param] || defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://horizon.stellar.org/assets',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        qs: {
          asset_code: 'USD',
          limit: 10,
          order: 'asc',
        },
        json: true,
      });
    });
  });

  describe('getAsset', () => {
    it('should get specific asset successfully', async () => {
      const mockResponse = {
        asset_type: 'credit_alphanum4',
        asset_code: 'USD',
        asset_issuer: 'GCKFBEIYTKP5RHALAV2R6AIZDJWDOGN6N24PWNZSM4WCPGAOVQOVZKMZ',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        const params: any = {
          operation: 'getAsset',
          asset_code: 'USD',
          asset_issuer: 'GCKFBEIYTKP5RHALAV2R6AIZDJWDOGN6N24PWNZSM4WCPGAOVQOVZKMZ',
        };
        return params[param];
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('createAsset', () => {
    it('should create asset successfully', async () => {
      const mockResponse = {
        hash: 'test-transaction-hash',
        result: 'success',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, i: number, defaultValue?: any) => {
        const params: any = {
          operation: 'createAsset',
          asset_code: 'MYTOKEN',
          limit: '1000000',
          authorize_flags: ['AUTHORIZATION_REQUIRED'],
        };
        return params[param] || defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://horizon.stellar.org/transactions',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          operations: [
            {
              type: 'create_asset',
              asset_code: 'MYTOKEN',
              limit: '1000000',
              authorize_flags: ['AUTHORIZATION_REQUIRED'],
            },
          ],
        },
        json: true,
      });
    });
  });

  describe('changeAssetTrust', () => {
    it('should change asset trust successfully', async () => {
      const mockResponse = {
        hash: 'test-transaction-hash',
        result: 'success',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, i: number, defaultValue?: any) => {
        const params: any = {
          operation: 'changeAssetTrust',
          asset: 'USD:GCKFBEIYTKP5RHALAV2R6AIZDJWDOGN6N24PWNZSM4WCPGAOVQOVZKMZ',
          limit: '10000',
        };
        return params[param] || defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('setAssetOptions', () => {
    it('should set asset options successfully', async () => {
      const mockResponse = {
        hash: 'test-transaction-hash',
        result: 'success',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, i: number, defaultValue?: any) => {
        const params: any = {
          operation: 'setAssetOptions',
          set_flags: ['AUTHORIZATION_REQUIRED'],
          master_weight: 2,
        };
        return params[param] || defaultValue;
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        const params: any = {
          operation: 'getAssets',
        };
        return params[param];
      });

      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        const params: any = {
          operation: 'getAssets',
        };
        return params[param];
      });

      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      const result = await executeAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });
});

describe('SorobanContracts Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  it('should invoke contract successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      const params: any = {
        operation: 'invokeContract',
        contract_address: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM',
        function_name: 'hello',
        parameters: '["world"]',
        source_account: 'GDJVFDG5OCW5PYWHB64MGTHGFF57DRRJEDUEFDEL2SLNIOONHYJWHA3Z',
      };
      return params[param];
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        transactionData: 'success',
        minResourceFee: '100',
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSorobanContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://horizon.stellar.org/soroban/rpc',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-api-key',
      },
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'simulateTransaction',
        params: {
          transaction: {
            sourceAccount: 'GDJVFDG5OCW5PYWHB64MGTHGFF57DRRJEDUEFDEL2SLNIOONHYJWHA3Z',
            operations: [{
              type: 'invokeHostFunction',
              hostFunction: {
                type: 'invokeContract',
                contractAddress: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM',
                functionName: 'hello',
                args: ['world'],
              },
            }],
          },
        },
      },
      json: true,
    });
  });

  it('should simulate transaction successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      const params: any = {
        operation: 'simulateTransaction',
        transaction: '{"sourceAccount":"GDJVFDG5OCW5PYWHB64MGTHGFF57DRRJEDUEFDEL2SLNIOONHYJWHA3Z","operations":[]}',
      };
      return params[param];
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        transactionData: 'simulated',
        cost: {
          cpuInsns: '1000',
          memBytes: '2000',
        },
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSorobanContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get contract successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      const params: any = {
        operation: 'getContract',
        contract_id: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM',
      };
      return params[param];
    });

    const mockResponse = {
      id: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM',
      source_account: 'GDJVFDG5OCW5PYWHB64MGTHGFF57DRRJEDUEFDEL2SLNIOONHYJWHA3Z',
      asset_code: 'XLM',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSorobanContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should deploy contract successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      const params: any = {
        operation: 'deployContract',
        contract_wasm: '0061736d01000000',
        constructor_args: '["arg1","arg2"]',
      };
      return params[param];
    });

    const mockResponse = {
      hash: 'abcd1234',
      ledger: 12345,
      envelope_xdr: 'encoded_envelope',
      result_xdr: 'encoded_result',
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSorobanContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get contract data successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      const params: any = {
        operation: 'getContractData',
        contract_address: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM',
        key: 'balance',
        durability: 'persistent',
      };
      return params[param];
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        entries: [{
          key: 'balance',
          val: '1000',
          liveUntilLedgerSeq: 123456,
        }],
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSorobanContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should get ledger entries successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      const params: any = {
        operation: 'getLedgerEntries',
        keys: '["key1","key2"]',
      };
      return params[param];
    });

    const mockResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: {
        entries: [
          { key: 'key1', xdr: 'encoded_data1' },
          { key: 'key2', xdr: 'encoded_data2' },
        ],
      },
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeSorobanContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      const params: any = {
        operation: 'getContract',
        contract_id: 'invalid-contract',
      };
      return params[param];
    });

    const mockError = new Error('Contract not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    await expect(
      executeSorobanContractsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('Contract not found');
  });

  it('should continue on fail when enabled', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      const params: any = {
        operation: 'getContract',
        contract_id: 'invalid-contract',
      };
      return params[param];
    });

    const mockError = new Error('Contract not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    const result = await executeSorobanContractsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'Contract not found' });
  });
});
});
