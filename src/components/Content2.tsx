import React, { Fragment, useCallback, useEffect, useState } from "react";
import { providers, utils } from "near-api-js";
import { AccountView, CodeResult } from "near-api-js/lib/providers/provider";
import { Account, LearningRequest } from "../interfaces";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import SignIn from "./SignIn";
import Requests from "./Requests";

const SUGGESTED_DONATION = "1";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const Content2: React.FC = () => {
  const { selector, accounts, accountId, setAccountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  const [requests, setMessages] = useState<Array<LearningRequest>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getAccount = useCallback(async (): Promise<Account | null> => {
    if (!accountId) {
      return null;
    }

    const { nodeUrl } = selector.network;
    const provider = new providers.JsonRpcProvider({ url: nodeUrl });

    return provider
      .query<AccountView>({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      })
      .then((data) => ({
        ...data,
        account_id: accountId,
      }));
  }, [accountId, selector.network]);

  const getMessages = useCallback(() => {
    const provider = new providers.JsonRpcProvider({
      url: selector.network.nodeUrl,
    });

    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: selector.getContractId(),
        method_name: "getAvailableLearningRequests",
        args_base64: "",
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));
  }, [selector]);

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    getMessages().then(setMessages);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!accountId) {
      return setAccount(null);
    }

    setLoading(true);

    getAccount().then((nextAccount) => {
      setAccount(nextAccount);
      setLoading(false);
    });
  }, [accountId, getAccount]);

  const handleSignIn = () => {
    selector.show();
  };

  if (loading) {
    return null;
  }

  if (!account) {
    return (
      <Fragment>
        <SignIn />
        <div>
          <button onClick={handleSignIn}>Log in</button>
        </div>
      </Fragment>
    );
  }
  return (
    <Fragment>
      <Requests requests={requests} account={account} />
    </Fragment>
  );
}; //end react component

export default Content2;
