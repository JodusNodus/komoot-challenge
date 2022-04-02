import React from "react";
import { MouseEvent } from "react";
import styled from "styled-components";
import { useRouteData } from "../Map/RouteDataContext";
import { pointIndexToLabel } from "../Map/utils";
import { PanelWaypointItem } from "./PanelWaypointItem";

const LIST_ITEM_HEIGHT = 50;

export function Panel() {
  const { points, setPoints } = useRouteData();

  const handleDelete = (i: number) => {
    setPoints((points) => {
      const newPoints = points.slice();
      newPoints.splice(i, 1);
      return newPoints;
    });
  };

  const listRef = React.useRef<HTMLDivElement>(null);
  const initialIndex = React.useRef(-1);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const handleDragStart = (event: MouseEvent, i: number) => {
    initialIndex.current = i;
  };
  const handleDragOver = (event: MouseEvent, i: number) => {
    if (event.preventDefault) {
      event.preventDefault();
    }
    setCurrentIndex(i);
    return false;
  };
  const handleDrop = (event: MouseEvent, i: number) => {
    event.stopPropagation();
    setPoints((points) => {
      const newPoints = points.slice();
      newPoints.splice(initialIndex.current, 1);
      newPoints.splice(i, 0, points[initialIndex.current]);

      initialIndex.current = -1;
      setCurrentIndex(-1);

      return newPoints;
    });
    return false;
  };

  const getIndex = (i: number): number => {
    if (initialIndex.current === -1) return i;
    if (currentIndex === i) return initialIndex.current;
    if (i < currentIndex) return i + 1;
    return i;
  };

  return (
    <PanelContainer>
      <Content>
        <HeaderTitle>Route Builder</HeaderTitle>
        <Line />
      </Content>
      <WayPointList ref={listRef}>
        {points.map((p, i) => (
          <PanelWaypointItem
            key={`${p[0]}/${p[1]}`}
            name={pointIndexToLabel(getIndex(i), points.length)}
            onDelete={() => handleDelete(i)}
            onDragStart={(evt) => handleDragStart(evt, i)}
            onDragOver={(evt) => handleDragOver(evt, i)}
            onDrop={(evt) => handleDrop(evt, i)}
          />
        ))}
      </WayPointList>
      <Content>
        <ImportButton>Import your route</ImportButton>
        <ExportButton>Download your route</ExportButton>
      </Content>
    </PanelContainer>
  );
}

const PanelContainer = styled.div`
  position: absolute;
  box-sizing: border-box;
  z-index: 1;
  height: 100%;
  width: 300px;
  background-color: #383838;
  display: flex;
  flex-direction: column;
`;

const Line = styled.div`
  height: 4px;
  width: 100%;
  background-color: #747474;
`;

const ExportButton = styled.button`
  width: 100%;
  height: ${LIST_ITEM_HEIGHT}px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  background-color: #c3e451;
  border-radius: 10px;
  border: none;
  font-size: 1.1rem;
  color: #383838;
  cursor: pointer;
  margin-bottom: 14px;
`;

const ImportButton = styled(ExportButton)`
  background-color: #838282;
  color: white;
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
`;

const WayPointList = styled.div`
  width: 100%;
  flex: 1;
  padding-top: 50px;
  margin-top: 20px;
  margin-bottom: 20px;
  overflow: scroll;
  user-select: none;
  position: relative;
`;

const Content = styled.div`
  padding: 0 20px;
`;
