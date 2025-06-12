import React from "react"
import "./SideBar.css"
import { CodeBracketSquareIcon, 
        MapIcon,
        ChartBarIcon,
        Square3Stack3DIcon,
        TableCellsIcon,
        LightBulbIcon
      } from '@heroicons/react/24/outline'
import { 
        IconLayoutSidebarLeftExpand, 
        IconLayoutSidebarRightExpand, 
        IconLayoutSidebarLeftCollapse,
        IconInbox,
        IconSquare,
        IconSquareRoundedPlus
      } from '@tabler/icons-react';

export default function SideNav({ isPanelCollapsed, onTogglePanel }) {
    return (
        <nav className="side-nav fixed top-0 left-0 z-50 w-16 h-screen border-r border-slate-300">
          <div className="flex flex-col items-center w-full py-2">
            <img src="/mindfuel_logo_light.svg" alt="Mindfuel Logo" className="w-6"/>
          </div>
          <ul className="w-16 flex flex-col items-center mt-4 gap-6">
            <li className="border-b border-slate-300 pb-2 w-full flex items-center justify-center">
              <button
                className="p-2 transition"
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={onTogglePanel}
                aria-label={isPanelCollapsed ? 'Expand Graph Control Panel' : 'Collapse Graph Control Panel'}
              >
                {isPanelCollapsed ? (
                  <IconLayoutSidebarLeftExpand className="w-8 h-6 text-slate-500 rounded-md hover:bg-slate-300  hover:text-slate-800 transition-colors duration-300" />
                ) : (
                  <IconLayoutSidebarRightExpand className="w-6 h-6 text-slate-500  rounded-md hover:bg-slate-300  hover:text-slate-800 transition-colors duration-300" />
                )}
              </button>
          
            </li>
            <li>
              <div className="rounded-xl bg-white p-1 border border-slate-300 hover:bg-slate-200 transition-colors duration-300">
                <IconSquareRoundedPlus className="size-6 text-slate-500" strokeWidth={2} />
              </div>
            </li>
            <li className="relative">
              <IconInbox className="size-6 text-slate-500" strokeWidth={2} />
              <span className="text-sm font-medium w-2 h-2 bg-blue-500 rounded-full absolute bottom-0 right-0"></span>
            </li>
            <li>
              <CodeBracketSquareIcon className="size-6 text-slate-500" strokeWidth={2} />
            </li>
            <li>
              <MapIcon className="size-6 text-slate-500" strokeWidth={2} />
            </li>
            <li>
              <Square3Stack3DIcon className="size-6 text-slate-500" strokeWidth={2} />
            </li>
            <li>
              <ChartBarIcon className="size-6 text-slate-500" strokeWidth={2} />
            </li>
            <li>
              <TableCellsIcon className="size-6 text-slate-500" strokeWidth={2} />
            </li>
            <li>
              <LightBulbIcon className="size-6 text-slate-500" strokeWidth={2} />
            </li>
          </ul>
        </nav>
    )
}
  