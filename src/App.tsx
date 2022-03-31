import React from "react";
import styled from "styled-components";
import { Map } from "./Map/Map";
import { Panel } from "./Panel";

function App() {
  return (
    <AppWrap>
      <Panel />
      <Map />
    </AppWrap>
  );
}

const AppWrap = styled.div`
  display: flex;
  height: 100vh;
`;

export default App;
