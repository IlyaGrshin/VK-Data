import * as React from 'react';

export function Cell(props) {
  return (
    <div className="cell" onClick={props.onClick}>
      <div className={props.icon} />
      <div className="cell_main">{props.name}</div>
    </div>
  );
}
