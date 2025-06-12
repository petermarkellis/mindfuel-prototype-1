import React, { useState } from "react";
import Checkbox from "../BaseComponents/Checkbox";


export default function GraphControlPanelFilterAction(props) {
    
    const [checked, setChecked] = useState(true);

    const handleCheckboxChange = event => {
        setChecked(event.target.checked);
        if (props.onChange) {
            props.onChange(props.label, event.target.checked);
        }
      };
    
    return (

        <label className="w-full flex flex-row justify-between items-center gap-2">
            <span className="whitespace-nowrap flex-1 min-w-0 select-none">{props.label}</span>
            <div className="flex-1 min-w-0 flex justify-end">
                <Checkbox
                    checked={checked}
                    onChange={handleCheckboxChange}
                />
            </div>
        </label>

   
        )
  }