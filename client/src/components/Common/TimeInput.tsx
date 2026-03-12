import { Input } from "antd";
import { useState } from "react";

export interface TimeInputProps extends React.ComponentProps<typeof Input> {

}

export function TimeInput(props: TimeInputProps) {
    const [textValue, setTextValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, "");
        
        let formatted = input;
        if (input.length > 2) {
            formatted = input.slice(0, -2) + ":" + input.slice(-2);
        }
        if (input.length > 4) {
            formatted = input.slice(0, -4) + ":" + input.slice(-4, -2) + ":" + input.slice(-2);
        }
        
        setTextValue(formatted);
    }

    return <Input {...props} 
        onChange={handleChange}
        value={textValue}
    />;
}