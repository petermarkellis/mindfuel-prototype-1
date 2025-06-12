import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { CodeBracketSquareIcon, 
  ArrowsRightLeftIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { IconDatabase, IconRecharging, IconBox, IconLayersSelected } from '@tabler/icons-react';

// Function to map data type to text color class
const getColorClassForType = (type) => {
  switch (type) {
    case "Opportunity":
      return "text-orange-500";
    case "Product":
    case "Data Product":
      return "text-purple-600";
    case "Asset":
    case "Data Asset":
      return "text-blue-600";
    case "Data Source":
    case "Source":
      return "text-green-600";
    default:
      return "text-slate-600"; // Default color if type is not recognized
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
    <div className="rounded-3xl p-2 bg-white text-slate-500 border-4 border-slate-300 hover:border-slate-400 hover:shadow-lg transition-colors duration-300 rounded-2xl max-w-[800px]" onClick={nodeInteractionHandler}>
      <div className="px-8 py-4  flex flex-col gap-6 items-start">
        <div className={`text-ms font-medium truncate text-3xl capitalize w-full flex flex-row justify-between gap-1 ${getColorClassForType(data.type)}`}>
          <span>{data.type}</span>
          <div>
            {data.type === 'Data Source' && <IconDatabase className="w-10 h-10 bg-green-50 p-1 rounded-lg text-green-500" />}
            {data.type === 'Opportunity' && <IconRecharging className="w-10 h-10 bg-orange-50 p-1 rounded-lg text-orange-500" />}
            {data.type === 'Product' && <IconBox className="w-10 h-10 bg-purple-50 p-1 rounded-lg text-purple-500" />} 
            {data.type === 'Data Asset' && <IconLayersSelected className="w-10 h-10 bg-blue-50 p-1 rounded-lg text-blue-500" />}
          </div>
        </div>
        <div className={`text-ms font-medium truncate text-left text-4xl capitalize w-full`}>
          {data.name}
        </div>
      </div>
      <div className="w-full h-px bg-slate-300"></div>

      <div className="px-8 py-4 flex flex-row w-full items-center justify-between bg-slate-50">
        <div className="flex flex-row gap-2">
          <CodeBracketSquareIcon className="size-8 text-slate-500" strokeWidth={2} />
          <ArrowsRightLeftIcon className="size-8 text-slate-500" strokeWidth={2} />
        </div>
        <div className="cursor-pointer relative">
          <EllipsisHorizontalIcon className="size-8 text-slate-500" strokeWidth={2} />
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '4px solid #fff',
          borderRadius: '50%',
          top: -8,
        }}
      />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" 
        style={{
          width: 20,
          height: 20,
          background: getHandleColorForType(data.type),
          border: '4px solid #fff',
          borderRadius: '50%',
          bottom: -8,
        }}
      />
    </div>
  );
}

const nodeInteractionHandler = (data) => {
  //console.log(data);
};

export default memo(CustomNode);
