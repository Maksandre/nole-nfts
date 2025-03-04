// Because there are no wallet extensions we store secrets in the local storage
// All this code should be eliminated in the future

import { Hex, isHexString } from "@nilfoundation/niljs";
import React, { createContext, useContext, useState, useEffect } from "react";

interface SecretsContextType {
  privateKey: Hex | undefined;
  walletAddress: Hex | undefined;
  setSecrets: (privateKey: string, walletAddress: string) => void;
  clearSecrets: () => void;
}

const SecretsContext = createContext<SecretsContextType | undefined>(undefined);

export const SecretsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [privateKey, setPrivateKey] = useState<Hex | undefined>(undefined);
  const [walletAddress, setWalletAddress] = useState<Hex | undefined>(
    undefined
  );

  useEffect(() => {
    const storedPrivateKey = localStorage.getItem("wallet_private_key");
    const storedWalletAddress = localStorage.getItem("wallet_address");
    if (isHexString(storedPrivateKey)) {
      setPrivateKey(storedPrivateKey);
    }
    if (isHexString(storedWalletAddress)) {
      setWalletAddress(storedWalletAddress);
    }
  }, []);

  const setSecrets = (newPrivateKey: string, newWalletAddress: string) => {
    setPrivateKey(isHexString(newPrivateKey) ? newPrivateKey : undefined);
    setWalletAddress(
      isHexString(newWalletAddress) ? newWalletAddress : undefined
    );
    localStorage.setItem("wallet_private_key", newPrivateKey);
    localStorage.setItem("wallet_address", newWalletAddress);
  };

  const clearSecrets = () => {
    setPrivateKey(undefined);
    setWalletAddress(undefined);
    localStorage.removeItem("wallet_private_key");
    localStorage.removeItem("wallet_address");
  };

  return (
    <SecretsContext.Provider
      value={{ privateKey, walletAddress, setSecrets, clearSecrets }}
    >
      {children}
    </SecretsContext.Provider>
  );
};

export const useSecrets = (): SecretsContextType => {
  const context = useContext(SecretsContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
