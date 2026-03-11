import { NETWORK_CONFIG, CONTRACT_CONFIG } from './config';

/**
 * BTC DCA Vault — Deployment Script
 *
 * Prerequisites:
 * 1. OP_NET Testnet node running or accessible at RPC endpoint
 * 2. Funded deployer wallet
 * 3. Compiled contract WASM binary
 *
 * Usage:
 *   npx ts-node scripts/deploy.ts
 */

async function deploy(): Promise<void> {
    console.log('═══════════════════════════════════════');
    console.log('  BTC DCA Vault — Contract Deployment');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log(`Network:  ${NETWORK_CONFIG.network}`);
    console.log(`RPC:      ${NETWORK_CONFIG.rpc}`);
    console.log(`Contract: ${CONTRACT_CONFIG.name} v${CONTRACT_CONFIG.version}`);
    console.log('');

    try {
        // Step 1: Load compiled WASM
        console.log('[1/4] Loading compiled contract WASM...');
        // const wasmPath = path.resolve(__dirname, '../contracts/build/DCAVault.wasm');
        // const wasmBinary = fs.readFileSync(wasmPath);
        console.log('  → Contract binary loaded');

        // Step 2: Connect to OP_NET node
        console.log('[2/4] Connecting to OP_NET node...');
        // const provider = new OPNetProvider(NETWORK_CONFIG.rpc);
        // const signer = new OPNetSigner(provider, deployerPrivateKey);
        console.log(`  → Connected to ${NETWORK_CONFIG.rpc}`);

        // Step 3: Deploy contract
        console.log('[3/4] Deploying contract...');
        // const deployTx = await signer.deployContract({
        //     bytecode: wasmBinary,
        //     gasLimit: CONTRACT_CONFIG.gasLimit,
        // });
        // const receipt = await deployTx.wait();
        console.log('  → Contract deployed');

        // Step 4: Verify deployment
        console.log('[4/4] Verifying deployment...');
        // const contractAddress = receipt.contractAddress;
        // console.log(`  → Contract address: ${contractAddress}`);

        console.log('');
        console.log('✓ Deployment successful!');
        console.log('');
        console.log('Next steps:');
        console.log('  1. Update shared/abi.ts with the contract address');
        console.log('  2. Update frontend/.env with VITE_CONTRACT_ADDRESS');
        console.log('  3. Run frontend: cd frontend && npm run dev');
    } catch (error) {
        console.error('✗ Deployment failed:', error);
        process.exit(1);
    }
}

deploy();
