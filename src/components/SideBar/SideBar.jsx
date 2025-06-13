import React from "react"
import "./SideBar.css"
import { CodeBracketSquareIcon, 
        MapIcon,
        Square3Stack3DIcon,
      } from '@heroicons/react/24/outline'
import { 
        IconInbox,
        IconSquareRoundedPlus,
        IconRouteScan,
        IconBrandDatabricks
      } from '@tabler/icons-react';

export default function SideNav({ onOpenNewItemModal, onNavigateToInbox, onNavigateToMain, isMainView = true, currentView = 'main' }) {
    return (
        <nav className="side-nav fixed top-0 left-0 z-50 w-16 h-screen border-r border-slate-300 flex flex-col">
          {/* Logo at top */}
          <div className="flex flex-col items-center w-full py-2">
            <button
              onClick={onNavigateToMain}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              aria-label="Go to main graph view"
            >
              <img src="/mindfuel_logo_light.svg" alt="Mindfuel Logo" className="w-6"/>
            </button>
          </div>
          
          {/* Main navigation items - flex-1 to take up remaining space */}
          <div className="flex-1 flex flex-col">
            <ul className="w-16 flex flex-col items-center mt-4 gap-6">
              
              <li className="relative">
                <button
                  onClick={onNavigateToInbox}
                  className={`rounded-xl p-1 border transition-colors duration-300 cursor-pointer ${
                    currentView === 'inbox' 
                      ? 'bg-blue-50 border-blue-300 shadow-sm' 
                      : 'bg-none border-slate-100 hover:border-slate-300 hover:bg-slate-200'
                  }`}
                  aria-label="Open inbox"
                >
                  <IconInbox 
                    className={`size-6 ${
                      currentView === 'inbox' ? 'text-blue-600' : 'text-slate-500'
                    }`} 
                    strokeWidth={2} 
                  />
                  <span className="text-sm font-medium w-2 h-2 bg-blue-500 rounded-full absolute bottom-1 right-1"></span>
                </button>
              </li>
              
              <li>
                <button
                  onClick={onNavigateToMain}
                  className={`rounded-xl p-1 border transition-colors duration-300 cursor-pointer ${
                    currentView === 'main' 
                      ? 'bg-green-50 border-green-300 shadow-sm' 
                      : 'bg-none border-slate-100 hover:border-slate-300 hover:bg-slate-200'
                  }`}
                  aria-label="Go to main graph view"
                >
                  <IconRouteScan 
                    className={`size-6 ${
                      currentView === 'main' ? 'text-green-600' : 'text-slate-500'
                    }`} 
                    strokeWidth={2} 
                  />
                </button>
              </li>

              <li>
                <button
                  className="rounded-xl bg-none p-1 border border-slate-100 hover:border hover:border-slate-300 hover:bg-slate-200 transition-colors duration-300 cursor-pointer"
                  aria-label="Go to main graph view"
                >
                  <CodeBracketSquareIcon className="size-6 text-slate-500" strokeWidth={2} />
                </button>
              </li>

              <li>
                <button
                  className="rounded-xl bg-none p-1 border border-slate-100 hover:border hover:border-slate-300 hover:bg-slate-200 transition-colors duration-300 cursor-pointer"
                  aria-label="Go to main graph view"
                >
                  <MapIcon className="size-6 text-slate-500" strokeWidth={2} />
                </button>
              </li>

              <li>
                <button
                  className="rounded-xl bg-none p-1 border border-slate-100 hover:border hover:border-slate-300 hover:bg-slate-200 transition-colors duration-300 cursor-pointer"
                  aria-label="Go to main graph view"
                >
                  <Square3Stack3DIcon className="size-6 text-slate-500" strokeWidth={2} />
                </button>
              </li>

              <li>
                <button
                  className="rounded-xl bg-none p-1 border border-slate-100 hover:border hover:border-slate-300 hover:bg-slate-200 transition-colors duration-300 cursor-pointer"
                  aria-label="Go to main graph view"
                >
                  <IconBrandDatabricks className="size-6 text-slate-500" strokeWidth={2} />
                </button>
              </li>
            </ul>
          </div>

          {/* Create button at bottom */}
          {isMainView && (
            <div className="w-16 flex flex-col items-center pb-4">
              <button 
                onClick={onOpenNewItemModal}
                className="rounded-xl bg-white p-1 border border-slate-300 hover:bg-slate-200 transition-colors duration-300 cursor-pointer"
                aria-label="Create new item"
              >
                <IconSquareRoundedPlus className="size-6 text-slate-500" strokeWidth={2} />
              </button>
            </div>
          )}
        </nav>
    )
}
  