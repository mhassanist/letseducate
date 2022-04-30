import React, { FormEvent, FormEventHandler } from "react";
import { Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { Account, LearningRequest } from "~/interfaces";
import PaySupportForm from "./PaySupportForm";
import Form from "./PaySupportForm";
export default function LearningRequestForm(props: {
  request: {
    title: String;
    description: String;
    requestedAmount: string;
    collectedAmount: string;
  };
  account: Account;
}) {
  return (
    <Col size={3}>
      <Card>
        <Card.Body>
          <Card.Title> By: {props.account.account_id} </Card.Title>
          <Card.Text>
            {" "}
            <p className="highlight">
              <label htmlFor="title" id="title">
                {props.request.title}
              </label>
            </p>
          </Card.Text>
          <Card.Body>
            {props.request.description} <br />
            <br />
            <strong>Amount needed:</strong> {props.request.requestedAmount}
            <br></br>
            <strong>Collected so far:</strong> {props.request.collectedAmount}
            <br></br>
          </Card.Body>

          <Card.Footer>
            {
              <PaySupportForm
                account={props.account}
                title={props.request.title}
              />
            }
          </Card.Footer>
        </Card.Body>
      </Card>
    </Col>
  );
}
