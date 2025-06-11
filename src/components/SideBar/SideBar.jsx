import React from "react"
import "./SideBar.css"
import { CodeBracketSquareIcon, 
        MapIcon,
        ChartBarIcon,
        Square3Stack3DIcon,
        TableCellsIcon,
        LightBulbIcon
      } from '@heroicons/react/24/outline'

export default function SideNav() {
    return (
      <div>
        <nav className="side-nav w-16 h-full border-r border-slate-300">
          <div className="flex flex-col items-center w-full py-2">
          <img src="/mindfuel_logo_light.svg" alt="Mindfuel Logo" className="w-6"/>
          </div>
        
          <ul className="w-16 h-full flex flex-col items-center  mt-8 gap-6">
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
        
      </div>
    )
  }
  