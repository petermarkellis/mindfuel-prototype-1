import React from "react"


export default function GraphControlPanel_Action(props) {
    return (
        <button onClick={props.onClick} 
        className="truncate px-1 py-1 rounded-lg hover:bg-slate-200 transition-colors text-left ease-in-out duration-200 select-none w-full">{props.title}</button>
    )
}