import React, { FormEventHandler, useCallback, useState } from "react";
import Big from "big.js";
import { providers, utils } from "near-api-js";

import { Account, LearningRequest } from "../interfaces";
import { useWalletSelector } from "~/contexts/WalletSelectorContext";
import { CodeResult } from "near-api-js/lib/providers/provider";

interface FormProps {
  account: Account;
  title: String;
}
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;
const SUGGESTED_DONATION = "1";

const PaySupportForm: React.FC<FormProps> = ({ account, title }) => {
  const { selector, accounts, accountId, setAccountId } = useWalletSelector();
  const [messages, setMessages] = useState<Array<LearningRequest>>([]);

  console.log(title);
  const getMessages = useCallback(() => {
    const provider = new providers.JsonRpcProvider({
      url: selector.network.nodeUrl,
    });

    return provider
      .query<CodeResult>({
        request_type: "call_function",
        account_id: selector.getContractId(),
        method_name: "getAllLearningRequests",
        args_base64: "",
        finality: "optimistic",
      })
      .then((res) => JSON.parse(Buffer.from(res.result).toString()));
  }, [selector]);

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore.
      const { fieldset, donation } = e.target.elements;

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

  return (
    <form onSubmit={(e) => handleSubmit(e as unknown as SubmitEvent)}>
      <fieldset id="fieldset">
        <p>
          <label htmlFor="donation">Donation:</label>

          <input
            autoComplete="off"
            defaultValue={"1"}
            id="donation"
            max={Big(account.amount)
              .div(10 ** 24)
              .toString()}
            min="1"
            step="1"
            type="number"
          />
          <span title="NEAR Tokens">Ⓝ</span>
        </p>
        <button type="submit">&#9829;&#65039; Support</button>
      </fieldset>
    </form>
  );
};

export default PaySupportForm;
