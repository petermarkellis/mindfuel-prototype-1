import React from 'react';
import { getBezierPath } from 'reactflow';

import './CustomEdge.css';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  // Calculate the Bezier curve path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g className="react-flow__edge">
      <defs>
        <linearGradient
          id={`gradient-${id}`}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0%" stopColor="#D79BBC" />
          <stop offset="100%" stopColor="#8DCEF9" />
        </linearGradient>
      </defs>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />
      <path
        id={id}
        d={edgePath}
        style={{
          stroke: `url(#gradient-${id})`,
          strokeWidth: 5,
          strokeDasharray: '10,15',
          strokeLinecap: 'round',
          fill: 'none',
          pointerEvents: 'none',
          ...style,
        }}
        className="react-flow__edge-path animated-dashed-line"
        markerEnd={markerEnd}
      />
    </g>
  );
};

export default CustomEdge;