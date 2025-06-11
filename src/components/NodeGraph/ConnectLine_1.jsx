import React from 'react';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd }) => {
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`; // Defines a simple straight line
  
  return (
    <g className="react-flow__edge">
      <path
        id={id}
        d={edgePath}
        style={{
          stroke: '#3498db', // Customize color
          strokeWidth: 3,    // Thicker line
          strokeDasharray: '5,5', // Dashed pattern
          ...style,          // Merge any passed styles
        }}
        className="react-flow__edge-path"
        markerEnd={markerEnd}
      />
    </g>
  );
};

export default CustomEdge;