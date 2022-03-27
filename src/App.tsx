import React from "react";
import styled from "styled-components";
import { Map } from "./Map/Map";

function App() {
  return (
    <AppWrap>
      {/* <Panel /> */}
      <Map />
    </AppWrap>
  );
}

const Panel = styled.div`
  position: absolute;
  z-index: 1;
  height: 100%;
  width: 300px;
  background-color: gray;
`;

const AppWrap = styled.div`
  display: flex;
  height: 100vh;
`;

export default App;
