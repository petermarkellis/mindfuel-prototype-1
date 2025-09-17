import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CodeBracketSquareIcon, 
  ArrowsRightLeftIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { IconDatabase, IconRecharging, IconBox, IconLayersSelected } from '@tabler/icons-react';

// Function to get direct color values (temporary fix)
const getTypeColor = (type) => {
  switch (type) {
    case "Opportunity":
      return "#f59e42"; // opportunity-500
    case "Product":
    case "Data Product":
      return "#7c3aed"; // product-600
    case "Asset":
    case "Data Asset":
      return "#2563eb"; // data-asset-600
    case "Data Source":
    case "Source":
      return "#059669"; // data-source-600
    default:
      return "#64748b"; // slate-500
  }
};

const getTypeBgColor = (type) => {
  switch (type) {
    case "Opportunity":
      return "#fef3e2"; // opportunity-50
    case "Product":
    case "Data Product":
      return "#ede9fe"; // product-50
    case "Asset":
    case "Data Asset":
      return "#dbeafe"; // data-asset-50
    case "Data Source":
    case "Source":
      return "#d1fae5"; // data-source-50
    default:
      return "#f1f5f9"; // slate-100
  }
};

const getHandleColorForType = (type) => {
  switch (type) {
    case 'Opportunity':
      return '#f59e42'; // opportunity-500
    case 'Product':
    case 'Data Product':
      return '#7c3aed'; // product-600
    case 'Asset':
    case 'Data Asset':
      return '#2563eb'; // data-asset-600
    case 'Data Source':
    case 'Source':
      return '#059669'; // data-source-600
    default:
      return '#64748b'; // slate-500
  }
};

const CustomNode = ({ data, nodes = [] }) => {
  

  return (
    <div className="rounded-3xl p-2 bg-white text-slate-500 border-4 border-slate-200 rounded-2xl max-w-[800px] group" onClick={nodeInteractionHandler}>
      <div className="px-8 py-4  flex flex-col gap-6 items-start">
        <div className="text-ms font-medium truncate text-3xl capitalize w-full flex flex-row justify-between gap-1" style={{ color: getTypeColor(data.type) }}>
          <span>{data.type}</span>
          <div>
            {data.type === 'Data Source' && (
              <IconDatabase 
                className="w-10 h-10 p-1 rounded-lg" 
                style={{ 
                  backgroundColor: getTypeBgColor(data.type),
                  color: getTypeColor(data.type)
                }} 
              />
            )}
            {data.type === 'Opportunity' && (
              <IconRecharging 
                className="w-10 h-10 p-1 rounded-lg" 
                style={{ 
                  backgroundColor: getTypeBgColor(data.type),
                  color: getTypeColor(data.type)
                }} 
              />
            )}
            {data.type === 'Product' && (
              <IconBox 
                className="w-10 h-10 p-1 rounded-lg" 
                style={{ 
                  backgroundColor: getTypeBgColor(data.type),
                  color: getTypeColor(data.type)
                }} 
              />
            )}
            {data.type === 'Data Asset' && (
              <IconLayersSelected 
                className="w-10 h-10 p-1 rounded-lg" 
                style={{ 
                  backgroundColor: getTypeBgColor(data.type),
                  color: getTypeColor(data.type)
                }} 
              />
            )}
          </div>
        </div>
        <div className={`text-md font-medium truncate text-left text-4xl capitalize w-full hover:text-slate-900 transition-colors duration-300`}>
          {data.name}
        </div>
      </div>
      <div className="w-full h-px bg-slate-200"></div>

      <div className="px-8 py-4 flex flex-row w-full items-center justify-between bg-slate-50">
        <div className="flex flex-row gap-2">
          <CodeBracketSquareIcon className="size-8 text-slate-500" strokeWidth={2} />
          <ArrowsRightLeftIcon className="size-8 text-slate-500" strokeWidth={2} />
        </div>
        <div className="cursor-pointer relative">
          <EllipsisHorizontalIcon className="size-8 text-slate-500" strokeWidth={2} />
        </div>
      </div>

      <Handle type="target" position={Position.Top} id="t" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '2px solid #fff',
          borderRadius: '50%',
          top: -8,
        }}
      />
      <Handle type="source" position={Position.Bottom} id="b" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '2px solid #fff',
          borderRadius: '50%',
          bottom: -8,
        }}
      />
      <Handle type="target" position={Position.Left} id="l" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '2px solid #fff',
          borderRadius: '50%',
          left: -8,
        }}
      />
      <Handle type="source" position={Position.Right} id="r" className="custom-handle w-2 h-2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '2px solid #fff',
          borderRadius: '50%',
          right: -8,
        }}
      />
    </div>
  );
}

const nodeInteractionHandler = (data) => {
  // Handle node interaction
};

export default memo(CustomNode);
