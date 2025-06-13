import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CodeBracketSquareIcon, 
  ArrowsRightLeftIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { IconDatabase, IconRecharging, IconBox, IconLayersSelected } from '@tabler/icons-react';

// Function to map data type to Tailwind theme token class
const getTypeColorClass = (type) => {
  switch (type) {
    case "Opportunity":
      return "text-[var(--color-opportunity-base)]";
    case "Product":
    case "Data Product":
      return "text-[var(--color-product-base)]";
    case "Asset":
    case "Data Asset":
      return "text-[var(--color-data-asset-base)]";
    case "Data Source":
    case "Source":
      return "text-[var(--color-data-source-base)]";
    default:
      return "text-slate-600";
  }
};

const getHandleColorForType = (type) => {
  switch (type) {
    case 'Opportunity':
      return '#f59e42'; // orange-500
    case 'Product':
    case 'Data Product':
      return '#7c3aed'; // purple-600
    case 'Asset':
    case 'Data Asset':
      return '#2563eb'; // blue-600
    case 'Data Source':
    case 'Source':
      return '#059669'; // green-600
    default:
      return '#64748b'; // slate-500
  }
};

const CustomNode = ({ data, nodes = [] }) => {
  

  return (
    <div className="rounded-3xl p-2 bg-[var(--color-node-bg)] text-slate-500 border-4 border-[var(--color-node-border)] rounded-2xl max-w-[800px] group" onClick={nodeInteractionHandler}>
      <div className="px-8 py-4  flex flex-col gap-6 items-start">
        <div className={`text-ms font-medium truncate text-3xl capitalize w-full flex flex-row justify-between gap-1 ${getTypeColorClass(data.type)}`}>
          <span>{data.type}</span>
          <div>
            {data.type === 'Data Source' && <IconDatabase className="w-10 h-10 bg-[var(--color-data-source-subtle)] p-1 rounded-lg text-[var(--color-data-source-base)]" />}
            {data.type === 'Opportunity' && <IconRecharging className="w-10 h-10 bg-[var(--color-opportunity-subtle)] p-1 rounded-lg text-[var(--color-opportunity-base)]" />}
            {data.type === 'Product' && <IconBox className="w-10 h-10 bg-[var(--color-product-subtle)] p-1 rounded-lg text-[var(--color-product-base)]" />} 
            {data.type === 'Data Asset' && <IconLayersSelected className="w-10 h-10 bg-[var(--color-data-asset-subtle)] p-1 rounded-lg text-[var(--color-data-asset-base)]" />}
          </div>
        </div>
        <div className={`text-md font-medium truncate text-left text-4xl capitalize w-full hover:text-slate-900 transition-colors duration-300`}>
          {data.name}
        </div>
      </div>
      <div className="w-full h-px bg-[var(--color-node-border)]"></div>

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
  //console.log(data);
};

export default memo(CustomNode);
