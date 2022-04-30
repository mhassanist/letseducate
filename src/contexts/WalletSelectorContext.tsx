import React, { useContext, useEffect, useState } from "react";
import NearWalletSelector, { AccountInfo } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupSender } from "@near-wallet-selector/sender";

interface WalletSelectorContextValue {
  selector: NearWalletSelector;
  accounts: Array<AccountInfo>;
  accountId: string | null;
  setAccountId: (accountId: string) => void;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC = ({ children }) => {
  const [selector, setSelector] = useState<NearWalletSelector | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountInfo>>([]);

  const syncAccountState = (
    currentAccountId: string | null,
    newAccounts: Array<AccountInfo>
  ) => {
    if (!newAccounts.length) {
      localStorage.removeItem("accountId");
      setAccountId(null);
      setAccounts([]);

      return;
    }

    const validAccountId =
      currentAccountId &&
      newAccounts.some((x) => x.accountId === currentAccountId);
    const newAccountId = validAccountId
      ? currentAccountId
      : newAccounts[0].accountId;

    localStorage.setItem("accountId", newAccountId);
    setAccountId(newAccountId);
    setAccounts(newAccounts);
  };

  useEffect(() => {
    NearWalletSelector.init({
      network: "testnet",
      contractId: "letseducate.msaudi.testnet",
      wallets: [
        setupNearWallet({
          iconUrl:
            "https://freecoins24.io/wp-content/uploads/2021/06/NEAR-Logo.jpg",
        }),
        setupSender({
          iconUrl:
            "https://pbs.twimg.com/profile_images/1457986163059396610/chOS75o7_400x400.jpg",
        }),
      ],
    })
      .then((instance) => {
        return instance.getAccounts().then(async (newAccounts) => {
          syncAccountState(localStorage.getItem("accountId"), newAccounts);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore-next-line
          window.selector = instance;
          setSelector(instance);
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to initialise wallet selector");
      });
  }, []);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.on("accountsChanged", (e) => {
      syncAccountState(accountId, e.accounts);
    });

    return () => subscription.remove();
  }, [selector, accountId]);

  if (!selector) {
    return null;
  }

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        accounts,
        accountId,
        setAccountId,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
