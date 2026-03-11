/// <reference types="vite/client" />

interface Window {
    opnet?: {
        requestAccounts: () => Promise<string[]>;
        getAccounts: () => Promise<string[]>;
        signMessage: (message: string) => Promise<string>;
        getNetwork: () => Promise<string>;
        getBalance: () => Promise<{ confirmed: number; unconfirmed: number; total: number }>;
        on: (event: string, callback: (...args: any[]) => void) => void;
        removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
}
