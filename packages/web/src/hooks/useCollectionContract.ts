import { useState, useEffect } from "react";
import { getContract, Hex } from "@nilfoundation/niljs";
import { useNilWallet } from "../contexts/NilWalletContext";
import { artifacts } from "../lib/artifacts";
import { useNil } from "@/contexts/NilContext";
import { encodeFunctionData } from "viem";

const useCollectionContract = (contractAddress: Hex) => {
  const { walletAddress } = useNilWallet();
  const { client } = useNil();
  const [contract, setContract] = useState<ReturnType<
    typeof getContract
  > | null>(null);

  useEffect(() => {
    if (contractAddress && walletAddress) {
      if (!client) {
        console.error("Nil Wallet not found.");
        return;
      }

      const collectionContract = getContract({
        client,
        abi: artifacts.collection.abi,
        address: contractAddress,
      });

      setContract(collectionContract);
    }
  }, [client, contractAddress, walletAddress]);

  const getName = async () => {
    if (!contract) return null;
    return contract.read.name([]);
  };

  const getSymbol = async () => {
    if (!contract) return null;
    return contract.read.symbol([]);
  };

  const getNFTAddress = async (tokenId: number) => {
    if (!contract) return null;
    return contract.read.getNFTAddress([tokenId]);
  };

  const getBalanceOf = async (owner: string) => {
    if (!contract) return null;
    return contract.read.balanceOf([owner]);
  };

  const getOwnerOf = async (tokenId: number) => {
    if (!contract) return null;
    return contract.read.ownerOf([tokenId]);
  };

  const mintNFT = async (to: string, tokenId: number, tokenURI: string) => {
    if (!contract || !walletAddress) return;
    try {
      const tx = {
        to: contractAddress,
        data: encodeFunctionData({
          functionName: "mint",
          args: [to, tokenId, tokenURI],
          abi: artifacts.collection.abi,
        }),
      };
      const txHash = await window.nil!.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
      console.log("✅ Mint transaction sent:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ Minting failed:", error);
      return null;
    }
  };

  return {
    getName,
    getSymbol,
    getNFTAddress,
    getBalanceOf,
    getOwnerOf,
    mintNFT,
  };
};

export default useCollectionContract;
