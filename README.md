# n8n-nodes-stellar

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Stellar blockchain providing 7 resources and 25+ operations for payments, DEX trading, Soroban smart contracts, and real-time event triggers.

![n8n](https://img.shields.io/badge/n8n-community--node-blue)
![Stellar](https://img.shields.io/badge/Stellar-blockchain-black)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

## Features

- **Account Management**: Generate keypairs, create/merge accounts, fund testnet, set data/options
- **Payments**: Send XLM and custom assets, path payments, claimable balances
- **Asset Operations**: Create trustlines, issue assets, query asset info
- **DEX Trading**: Orderbook queries, create/cancel offers, view trades
- **Transaction Handling**: Sign and submit XDR transactions
- **Ledger Queries**: Get latest ledger, fee statistics, historical data
- **Soroban Smart Contracts**: Invoke contracts, simulate transactions, health checks
- **Real-time Triggers**: Stream payments, transactions, operations, effects, ledgers, trades

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-stellar`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
git clone https://github.com/Velocity-BPA/n8n-nodes-stellar.git
cd n8n-nodes-stellar
pnpm install && pnpm build
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-stellar.zip
cd n8n-nodes-stellar

# 2. Install dependencies
pnpm install

# 3. Build the project
pnpm build

# 4. Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-stellar

# 5. Restart n8n
n8n start
```

## Credentials Setup

### Stellar Network Credentials

| Field | Description |
|-------|-------------|
| **Network** | Select: Public (Mainnet), Testnet, Futurenet, or Custom |
| **Custom Horizon URL** | URL for custom Horizon server (custom network only) |
| **Custom Network Passphrase** | Passphrase for custom network |
| **Secret Key** | Your Stellar secret key (S...) for signing transactions |
| **Soroban RPC URL** | Optional URL for Soroban smart contract operations |

### Stellar Anchor Credentials

| Field | Description |
|-------|-------------|
| **Anchor Domain** | Domain of the Stellar anchor service |
| **Auth Token** | SEP-10 authentication token |

## Resources & Operations

### Account Resource

| Operation | Description | Requires Secret Key |
|-----------|-------------|---------------------|
| Generate Keypair | Create a new Stellar keypair | No |
| Get Info | Retrieve account details and balances | No |
| Create Account | Create and fund a new account | Yes |
| Merge Account | Merge account into destination | Yes |
| Fund Testnet | Get free testnet XLM from Friendbot | No |
| Set Data | Add/update account data entries | Yes |
| Set Options | Configure account options | Yes |

### Payment Resource

| Operation | Description | Requires Secret Key |
|-----------|-------------|---------------------|
| Send Payment | Send XLM or custom assets | Yes |
| Path Payment | Send with automatic path finding | Yes |
| Create Claimable Balance | Create balance with conditions | Yes |
| Claim Balance | Claim a claimable balance | Yes |

### Asset Resource

| Operation | Description | Requires Secret Key |
|-----------|-------------|---------------------|
| Change Trust | Add or remove asset trustline | Yes |
| Get Info | Query asset information | No |
| Issue Asset | Issue custom assets to accounts | Yes |

### DEX Resource

| Operation | Description | Requires Secret Key |
|-----------|-------------|---------------------|
| Get Orderbook | View buy/sell orders for asset pair | No |
| Create Sell Offer | Create offer to sell assets | Yes |
| Create Buy Offer | Create offer to buy assets | Yes |
| Cancel Offer | Cancel an existing offer | Yes |
| List Offers | View your active offers | Yes |
| Get Trades | View recent trades | No |

### Transaction Resource

| Operation | Description | Requires Secret Key |
|-----------|-------------|---------------------|
| Get Transaction | Retrieve transaction by hash | No |
| Sign XDR | Sign a transaction XDR | Yes |
| Submit XDR | Submit signed XDR to network | No |

### Ledger Resource

| Operation | Description | Requires Secret Key |
|-----------|-------------|---------------------|
| Get Latest | Get the most recent ledger | No |
| Get By Sequence | Get ledger by sequence number | No |
| Get Fee Stats | Get current network fee statistics | No |

### Soroban Resource

| Operation | Description | Requires Secret Key |
|-----------|-------------|---------------------|
| Get Health | Check Soroban RPC health | No |
| Invoke Contract | Execute smart contract function | Yes |
| Simulate Transaction | Simulate without submitting | Yes |

## Trigger Node

The Stellar Trigger node provides real-time event streaming:

| Event | Description |
|-------|-------------|
| New Transaction | Stream new transactions |
| New Payment | Stream payment operations |
| New Operation | Stream all operations |
| New Effect | Stream account effects |
| New Ledger | Stream new ledgers |
| New Trade | Stream DEX trades |

## Usage Examples

### Generate New Keypair

```
Resource: Account
Operation: Generate Keypair
```

### Send XLM Payment

```
Resource: Payment
Operation: Send Payment
Destination: GDEST...
Amount: 10
Asset Code: XLM
```

### Create DEX Sell Offer

```
Resource: DEX
Operation: Create Sell Offer
Selling Asset Code: XLM
Buying Asset Code: USDC
Buying Asset Issuer: GA5ZSE...
Amount: 100
Price: 0.10
```

### Stream Payments to Account

```
Trigger: Stellar Trigger
Event: New Payment
Account ID: GABC...
Cursor: now
```

## Stellar Concepts

### Networks

| Network | Description | Use Case |
|---------|-------------|----------|
| **Public (Mainnet)** | Production network with real XLM | Live applications |
| **Testnet** | Test network with free test XLM | Development & testing |
| **Futurenet** | Experimental features network | Soroban testing |

### Assets

- **Native (XLM)**: Stellar's built-in currency
- **Custom Assets**: Tokens issued by any account (requires trustline)

### Stroops

Stellar uses "stroops" as the smallest unit: 1 XLM = 10,000,000 stroops

## Error Handling

The node provides detailed error messages for common scenarios:

| Error | Cause | Solution |
|-------|-------|----------|
| `Secret key required` | Operation needs signing authority | Configure secret key in credentials |
| `Account not found` | Account doesn't exist on network | Create or fund the account first |
| `Insufficient balance` | Not enough XLM for transaction | Add funds (min 1 XLM + fees) |
| `Trustline required` | Missing trustline for custom asset | Add trustline first |

## Security Best Practices

1. **Never share your secret key** - It provides full control over your account
2. **Use testnet for development** - Free test XLM, no real funds at risk
3. **Store credentials securely** - Use n8n's credential encryption
4. **Validate destinations** - Always verify recipient addresses
5. **Monitor transactions** - Use triggers to track account activity

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix

# Watch mode for development
pnpm dev
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass
3. New features include appropriate tests
4. Documentation is updated

## Support

- **Documentation**: [Stellar Developers](https://developers.stellar.org/)
- **n8n Community**: [community.n8n.io](https://community.n8n.io/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-stellar/issues)
- **Licensing**: licensing@velobpa.com

## Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) for the Stellar network
- [n8n.io](https://n8n.io/) for the workflow automation platform
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk) for the JavaScript SDK
