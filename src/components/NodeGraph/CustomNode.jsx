import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CodeBracketSquareIcon,
  ArrowsRightLeftIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { IconDatabase, IconRecharging, IconBox, IconLayersSelected } from '@tabler/icons-react';
import Chip from '../BaseComponents/Chip';

// Get color classes matching Chip component
const getChipColorClasses = (type) => {
  const textColor = {
    'Opportunity': 'text-orange-700',
    'Product': 'text-purple-700',
    'Data Product': 'text-purple-700',
    'Data Asset': 'text-blue-700',
    'Asset': 'text-blue-700',
    'Data Source': 'text-green-700',
    'Source': 'text-green-700'
  }[type] || 'text-slate-700';
  
  const bgColor = {
    'Opportunity': 'bg-orange-50',
    'Product': 'bg-purple-50',
    'Data Product': 'bg-purple-50',
    'Data Asset': 'bg-blue-50',
    'Asset': 'bg-blue-50',
    'Data Source': 'bg-green-50',
    'Source': 'bg-green-50'
  }[type] || 'bg-slate-50';
  
  return { textColor, bgColor };
};

// Get color values for icons (hex colors)
const getTypeColor = (type) => {
  switch (type) {
    case "Opportunity":
      return "#f59e42";
    case "Product":
    case "Data Product":
      return "#7c3aed";
    case "Asset":
    case "Data Asset":
      return "#2563eb";
    case "Data Source":
    case "Source":
      return "#059669";
    default:
      return "#64748b";
  }
};

const getTypeBgColor = (type) => {
  switch (type) {
    case "Opportunity":
      return "#fef3e2";
    case "Product":
    case "Data Product":
      return "#ede9fe";
    case "Asset":
    case "Data Asset":
      return "#dbeafe";
    case "Data Source":
    case "Source":
      return "#d1fae5";
    default:
      return "#f1f5f9";
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
  

  const { textColor, bgColor } = getChipColorClasses(data.type);
  
  // Get lighter border color based on type
  const getLightBorderColor = (type) => {
    const borderColors = {
      'Opportunity': 'border-orange-200',
      'Product': 'border-purple-200',
      'Data Product': 'border-purple-200',
      'Data Asset': 'border-blue-200',
      'Asset': 'border-blue-200',
      'Data Source': 'border-green-200',
      'Source': 'border-green-200'
    };
    return borderColors[type] || 'border-slate-200';
  };
  
  return (
    <div className="rounded-3xl p-2 bg-white text-slate-500 border-4 border-slate-200 rounded-2xl min-w-[400px] max-w-[800px] group relative" onClick={nodeInteractionHandler}>
      {/* Category label positioned at top-left corner, completely above card */}
      <div className={`absolute -top-[68px] left-0 z-10 inline-flex items-center gap-3 font-medium rounded-md text-[28px] font-bold px-7 py-3.5 border-2 ${getLightBorderColor(data.type)} ${bgColor} ${textColor}`}>
        {/* Icon to the left of label text */}
        {data.type === 'Data Source' && (
          <IconDatabase 
            className="w-14 h-14" 
            style={{
              color: getTypeColor(data.type)
            }}
          />
        )}
        {data.type === 'Opportunity' && (
          <IconRecharging 
            className="w-14 h-14" 
            style={{
              color: getTypeColor(data.type)
            }}
          />
        )}
        {data.type === 'Product' && (
          <IconBox 
            className="w-14 h-14" 
            style={{
              color: getTypeColor(data.type)
            }}
          />
        )}
        {data.type === 'Data Asset' && (
          <IconLayersSelected 
            className="w-14 h-14" 
            style={{
              color: getTypeColor(data.type)
            }}
          />
        )}
        {data.type}
      </div>
      
      <div className="px-8 py-4 mt-4 flex flex-col gap-6 items-start">
        <div className="w-full flex flex-row justify-between items-center gap-2">
          {/* Icon removed - now in label above */}
          <div className="flex-1"></div>
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
