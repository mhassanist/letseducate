import React, { FormEventHandler } from "react";
import { Account, LearningRequest } from "../interfaces";
import Form from "./PaySupportForm";
import Message from "./LearningRequestForm";
import LearningRequestForm from "./LearningRequestForm";

interface RequestProps {
  requests: Array<LearningRequest>;
  account: Account;
}

const Requests: React.FC<RequestProps> = ({ requests, account }) => {
  return (
    <>
      <h2>Learners Requests</h2>
      <div className="grid-module--grid--O1Jv1">
        {requests.reverse().map((message, i) => (
          <LearningRequestForm
            key={i}
            request={{
              title: message.title,
              description: message.description,
              requestedAmount: message.requestedAmount,
              collectedAmount: message.collectedAmount,
            }}
            account={account}
          />
        ))}
      </div>
    </>
  );
};

export default Requests;
