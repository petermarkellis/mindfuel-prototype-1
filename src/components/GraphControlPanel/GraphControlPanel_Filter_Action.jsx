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

        <label className="w-full flex flex-row justify-between">
    
            
            <span className="whitespace-nowrap w-fit select-none">{props.label}</span>

            <div className="w-fit">
                <Checkbox
                    checked={checked}
                    onChange={handleCheckboxChange}
                />
            </div>

      </label>

   
        )
  }