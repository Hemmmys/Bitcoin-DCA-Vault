# BTC DCA Vault

Decentralized Dollar Cost Averaging vault on Bitcoin L1 powered by OP_NET.

Users deposit BTC into shared vaults and the contract periodically executes purchases according to a DCA schedule (daily or weekly).

## Tech Stack

- **Smart Contracts:** OP_NET (AssemblyScript → WASM)
- **Frontend:** React + Vite + TypeScript + Tailwind CSS + Recharts
- **Wallet:** OP_Wallet browser extension
- **Network:** OP_NET Testnet

## Project Structure

```
├── contracts/          # Smart contracts (AssemblyScript)
├── scripts/            # Deployment scripts
├── shared/             # Shared ABI definitions
├── frontend/           # React frontend (Vite)
└── README.md
```

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Deploy Contract

```bash
npx ts-node scripts/deploy.ts
```

## Features

- Create DCA vaults with daily/weekly schedules
- Deposit BTC into shared vaults
- Automatic DCA execution by block schedule
- Proportional share distribution
- BTC accumulation chart (Recharts)
- OP_Wallet integration

## Network

- RPC: `https://regtest.opnet.org`
- Network: OP_NET Testnet
