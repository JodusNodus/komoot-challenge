import { MouseEventHandler } from "react";
import styled from "styled-components";

const ITEM_HEIGHT = 50;

type TProps = {
  name: string;
  onDelete: () => void;
  onDragStart: MouseEventHandler;
  onDragOver: MouseEventHandler;
  onDrop: MouseEventHandler;
};

export function PanelWaypointItem({ name, onDelete, ...props }: TProps) {
  return (
    <Container draggable="true" {...props}>
      <Left>
        <SvgIcon
          draggable="false"
          src={process.env.PUBLIC_URL + "assets/drag_icon.svg"}
          alt="drag"
        />
        <Label>Waypoint {name}</Label>
      </Left>
      <DeleteButton onClick={onDelete}>
        <SvgIcon
          draggable="false"
          src={process.env.PUBLIC_URL + "assets/delete_icon.svg"}
          alt="delete"
        />
      </DeleteButton>
    </Container>
  );
}

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Content = styled.div`
  padding: 0 20px;
`;

const SvgIcon = styled.img`
  height: 18px;
  width: 18px;
`;

const DeleteButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
`;

const Container = styled(Content)`
  padding: 0 20px;
  height: ${ITEM_HEIGHT}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transform-origin: 0 0;
  background-color: #383838;
  cursor: grab;
  position: relative;
`;

const Label = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: white;
  margin-left: 14px;
`;
