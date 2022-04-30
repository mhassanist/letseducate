import React, { FormEventHandler, useCallback, useState } from "react";
import Big from "big.js";
import { providers, utils } from "near-api-js";

import { Account, LearningRequest } from "../interfaces";
import { useWalletSelector } from "~/contexts/WalletSelectorContext";
import { CodeResult } from "near-api-js/lib/providers/provider";
import { useNavigate } from "react-router-dom";

interface FormProps {
  account: Account;
}
const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;
const SUGGESTED_DONATION = "1";

const SubmitForm: React.FC<FormProps> = ({ account }) => {
  const { selector, accounts, accountId, setAccountId } = useWalletSelector();
  const [messages, setMessages] = useState<Array<LearningRequest>>([]);
  const [loadig, setLoading] = useState(false);
  let history = useNavigate();

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
      const { fieldset, title, description, course_url, requested_amount } =
        e.target.elements;

      fieldset.disabled = true;
      console.log(title.value);
      console.log(description.value);
      console.log(course_url.value);
      console.log(requested_amount.value);

      setLoading(true);

      selector
        .signAndSendTransaction({
          signerId: accountId!,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "createLearningRequest",
                args: {
                  title: title.value,
                  description: description.value,
                  requestedAmount: requested_amount.value,
                  courseURL: course_url.value,
                },
                gas: BOATLOAD_OF_GAS,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                deposit: utils.format.parseNearAmount("0")!,
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
          setLoading(false);

          history("/letseducate");
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
          <label htmlFor="requested_amount">Title of your request:</label>
          <input type="text" id="title" required />
        </p>
        <p>
          <label htmlFor="requested_amount">Description:</label>
          <input type="description" id="description" required />
        </p>

        <p>
          <label htmlFor="course_url">
            Course URL (the one you need to buy):
          </label>
          <input type="course_url" id="course_url" required />
        </p>
        <p>
          <label htmlFor="requested_amount">Requested Amount:</label>

          <input
            autoComplete="off"
            defaultValue={"1"}
            id="requested_amount"
            min="1"
            step="1"
            type="number"
            required
          />
          <span title="NEAR Tokens">Ⓝ</span>
        </p>
        <button type="submit">{loadig ? "loading" : "Submit"}</button>
      </fieldset>
    </form>
  );
};

export default SubmitForm;
