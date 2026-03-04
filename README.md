# n8n-nodes-stellar

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the Stellar blockchain network, offering 5 core resources including Accounts, Assets, and SorobanContracts. Build powerful blockchain automation workflows with operations for account management, asset transfers, smart contract interactions, and real-time ledger monitoring.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Stellar](https://img.shields.io/badge/Stellar-Blockchain-orange)
![Horizon API](https://img.shields.io/badge/Horizon-API-purple)
![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-green)

## Features

- **Account Management** - Create, query, and monitor Stellar accounts with full transaction history
- **Asset Operations** - Issue, transfer, and manage custom assets on the Stellar network
- **Smart Contract Integration** - Deploy and interact with Soroban smart contracts seamlessly
- **Transaction Processing** - Submit payments, trades, and complex multi-operation transactions
- **Real-time Monitoring** - Stream ledger updates and account changes in real-time
- **Multi-network Support** - Connect to Mainnet, Testnet, or custom Stellar networks
- **Secure Authentication** - API key-based authentication with encrypted credential storage
- **Error Recovery** - Robust error handling with automatic retry mechanisms

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-stellar`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-stellar
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-stellar.git
cd n8n-nodes-stellar
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-stellar
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Stellar service API key for authenticated requests | Yes |
| Network | Stellar network (mainnet, testnet, custom) | Yes |
| Horizon URL | Custom Horizon server URL (if using custom network) | No |
| Secret Key | Account secret key for transaction signing | No |

## Resources & Operations

### 1. Accounts

| Operation | Description |
|-----------|-------------|
| Get Account | Retrieve account details including balances and sequence number |
| Create Account | Generate new Stellar keypair and fund account |
| Get Transactions | Fetch transaction history for an account |
| Get Operations | Retrieve operations performed by an account |
| Get Payments | Get payment history for an account |
| Stream Transactions | Monitor real-time transaction updates |

### 2. Assets

| Operation | Description |
|-----------|-------------|
| Get Asset | Retrieve asset information and statistics |
| List Assets | Get paginated list of all assets on network |
| Create Asset | Issue a new custom asset on Stellar network |
| Set Trustline | Establish trust relationship for asset |
| Get Asset Holders | List accounts holding specific asset |
| Get Asset Trades | Retrieve trading history for asset pair |

### 3. Payments

| Operation | Description |
|-----------|-------------|
| Send Payment | Transfer XLM or assets between accounts |
| Create Path Payment | Execute payment through order book path |
| Get Payment Details | Retrieve specific payment information |
| List Payments | Get filtered list of network payments |
| Stream Payments | Monitor real-time payment activity |

### 4. Transactions

| Operation | Description |
|-----------|-------------|
| Submit Transaction | Submit signed transaction to network |
| Get Transaction | Retrieve transaction details by hash |
| List Transactions | Get paginated transaction list |
| Build Transaction | Construct transaction with operations |
| Sign Transaction | Sign transaction with account keys |
| Stream Transactions | Monitor transaction submissions |

### 5. SorobanContracts

| Operation | Description |
|-----------|-------------|
| Deploy Contract | Deploy smart contract to Stellar network |
| Invoke Contract | Execute contract function with parameters |
| Get Contract Data | Retrieve contract state and storage |
| List Contracts | Get deployed contracts for account |
| Simulate Invoke | Test contract invocation without submitting |
| Get Contract Events | Fetch events emitted by contract |

## Usage Examples

```javascript
// Get account balance and details
const accountData = await stellarNode.execute({
  resource: 'Accounts',
  operation: 'Get Account',
  accountId: 'GABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOP'
});
```

```javascript
// Send XLM payment between accounts
const payment = await stellarNode.execute({
  resource: 'Payments',
  operation: 'Send Payment',
  sourceAccount: 'GABC123...',
  destinationAccount: 'GDEF456...',
  amount: '100',
  assetCode: 'XLM'
});
```

```javascript
// Create and issue custom asset
const asset = await stellarNode.execute({
  resource: 'Assets',
  operation: 'Create Asset',
  assetCode: 'MYTOKEN',
  issuerAccount: 'GABC123...',
  initialSupply: '1000000',
  description: 'My Custom Token'
});
```

```javascript
// Deploy and invoke Soroban smart contract
const contract = await stellarNode.execute({
  resource: 'SorobanContracts',
  operation: 'Deploy Contract',
  wasmHash: '0x1234567890abcdef...',
  constructorArgs: ['param1', 'param2'],
  sourceAccount: 'GABC123...'
});
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid Account ID | Malformed Stellar account identifier | Verify account ID format (56 characters, starting with G) |
| Insufficient Balance | Account lacks funds for transaction | Check account balance and add funds if needed |
| Bad Sequence Number | Transaction sequence number incorrect | Fetch current account sequence and increment by 1 |
| Invalid Signature | Transaction signature verification failed | Ensure correct secret key is used for signing |
| Asset Not Found | Referenced asset does not exist | Verify asset code and issuer account |
| Network Timeout | Connection to Horizon server failed | Check network connectivity and Horizon URL |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-stellar/issues)
- **Stellar Documentation**: [Stellar Developer Portal](https://developers.stellar.org/)
- **Horizon API Reference**: [Horizon API Docs](https://developers.stellar.org/api)