import React, { Fragment } from "react";
import Content from "./components/Content";
import { WalletSelectorContextProvider } from "./contexts/WalletSelectorContext";

const App: React.FC = () => {
  return (
    <Fragment>
      <h1>Lets educate the world!</h1>
      <WalletSelectorContextProvider>
        <Content />
      </WalletSelectorContextProvider>
    </Fragment>
  );
};

export default App;
