import React, { Fragment, useCallback, useEffect, useState } from "react";
import { providers, utils } from "near-api-js";
import { AccountView, CodeResult } from "near-api-js/lib/providers/provider";
import { Account, LearningRequest } from "../interfaces";
import { useWalletSelector } from "../contexts/WalletSelectorContext";
import SignIn from "./SignIn";
import SubmitForm from "./SubmitRequest";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import Content2 from "./Content2";

const SUGGESTED_DONATION = "1";
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;

const Content: React.FC = () => {
  const { selector, accounts, accountId, setAccountId } = useWalletSelector();
  const [account, setAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<Array<LearningRequest>>([]);
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

  const handleSignOut = () => {
    selector.signOut().catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore.
      const { fieldset, title, donation } = e.target.elements;

      fieldset.disabled = true;

      selector
        .signAndSendTransaction({
          signerId: accountId!,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "supportLearningRequest",
                args: {
                  title: title,
                },
                gas: BOATLOAD_OF_GAS,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                deposit: utils.format.parseNearAmount(donation.value || "0")!,
              },
            },
          ],
        })
        .catch((err) => {
          alert("Failed to add message");
          console.log("Failed to add message");

          throw err;
        })
        .then(() => {
          return getMessages()
            .then((nextMessages) => {
              setMessages(nextMessages);
              //message.value = "";
              donation.value = SUGGESTED_DONATION;
              fieldset.disabled = false;
              //message.focus();
            })
            .catch((err) => {
              alert("Failed to refresh messages");
              console.log("Failed to refresh messages");

              throw err;
            });
        })
        .catch((err) => {
          console.error(err);

          fieldset.disabled = false;
        });
    },
    [selector, accountId, getMessages]
  );

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
      <div>
        <button id="logoutbtn" onClick={handleSignOut}>
          Log out
        </button>
        <p>
          Thanks for joining, {account.account_id} , You can support worldwide
          learners below
        </p>
      </div>
      <Router>
        <div>
          <nav>
            <Link to="/letseducate/">&#127968; Home | Requests</Link>
            <Link to="/letseducate/submit">
              &#10145;&#65039; Learner? Add New Request
            </Link>
          </nav>
          <Routes>
            <Route path="/letseducate" element={<Content2 />} />
            <Route
              path="/letseducate/submit"
              element={<SubmitForm account={account} />}
            />
          </Routes>
        </div>
      </Router>

      {/* <Messages messages={messages} account={account} />
      <SubmitForm account={account} /> */}
    </Fragment>
  );
}; //end react component

export default Content;
