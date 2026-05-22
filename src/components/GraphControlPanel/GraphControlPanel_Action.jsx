import React from "react"


export default function GraphControlPanel_Action(props) {
    return (
        <button onClick={props.onClick} 
        className="truncate px-2 py-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] transition-colors text-left ease-in-out duration-150 select-none w-full">{props.title}</button>
    )
}