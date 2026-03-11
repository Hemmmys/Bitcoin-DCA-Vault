import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { JSONRpcProvider } from 'opnet';
import type { OPNetSigner } from '../services/wallet';
import type { OpnetConfig } from '../lib/opnet';

interface WalletContextType {
    address: string | null;
    publicKey: string | null;
    balance: number;
    provider: JSONRpcProvider | null;
    signer: OPNetSigner | null;
    network: any;
    isConnected: boolean;
    isConnecting: boolean;
    formattedAddress: string;
    opnetConfig: OpnetConfig;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
    address: null,
    publicKey: null,
    balance: 0,
    provider: null,
    signer: null,
    network: null,
    isConnected: false,
    isConnecting: false,
    formattedAddress: '',
    opnetConfig: { provider: null, network: null },
    connect: async () => {},
    disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [balance, setBalance] = useState(0);
    const [provider, setProvider] = useState<JSONRpcProvider | null>(null);
    const [signer, setSigner] = useState<OPNetSigner | null>(null);
    const [network, setNetwork] = useState<any>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const getWallet = useCallback(async () => await import('../services/wallet'), []);

    // Auto-reconnect on mount
    useEffect(() => {
        const check = async () => {
            try {
                const w = await getWallet();
                if (!w.isWalletAvailable()) return;
                const accounts = await w.getWalletProvider()?.getAccounts();
                if (accounts && accounts.length > 0) {
                    setAddress(accounts[0]);
                    setPublicKey(await w.getPublicKey());
                    setProvider(w.createProvider());
                    setNetwork(w.getBitcoinNetwork());
                    setBalance(await w.getBalance());
                    try { setSigner(await w.createSigner()); } catch {}
                }
            } catch {}
        };
        check();
    }, [getWallet]);

    // Listen for account changes
    useEffect(() => {
        const w = typeof window !== 'undefined'
            ? (window as any).opnet || (window as any).unisat
            : null;
        if (!w) return;
        const handleAccountsChanged = async (accounts: string[]) => {
            if (accounts.length > 0) {
                const wallet = await getWallet();
                setAddress(accounts[0]);
                setPublicKey(await wallet.getPublicKey());
                setBalance(await wallet.getBalance());
                try { setSigner(await wallet.createSigner()); } catch {}
            } else {
                setAddress(null);
                setPublicKey(null);
                setBalance(0);
                setSigner(null);
            }
        };
        w.on('accountsChanged', handleAccountsChanged);
        return () => {
            w?.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, [getWallet]);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        try {
            const w = await getWallet();
            const { address: addr, publicKey: pk } = await w.connectWallet();
            setAddress(addr);
            setPublicKey(pk);
            setProvider(w.createProvider());
            setNetwork(w.getBitcoinNetwork());
            setBalance(await w.getBalance());
            try { setSigner(await w.createSigner()); } catch {}
        } catch (e: any) {
            console.error('Wallet connection failed:', e);
            alert(e?.message || 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    }, [getWallet]);

    const disconnect = useCallback(() => {
        setAddress(null);
        setPublicKey(null);
        setBalance(0);
        setSigner(null);
        setProvider(null);
        setNetwork(null);
    }, []);

    const formatAddr = (a: string) => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : '';

    const opnetConfig: OpnetConfig = {
        provider,
        network,
        publicKey: publicKey || undefined,
        signer: signer || undefined,
        walletAddress: address || undefined,
    };

    return (
        <WalletContext.Provider
            value={{
                address,
                publicKey,
                balance,
                provider,
                signer,
                network,
                isConnected: !!address,
                isConnecting,
                formattedAddress: address ? formatAddr(address) : '',
                opnetConfig,
                connect,
                disconnect,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
