import React from "react";
import "rc-slider/assets/index.css";
import { Text } from "@fluentui/react/lib/Text";

export interface IInputFormComponentProps {
    label: string;
    helpText: string;
}

export const InputFormComponent: React.FC<IInputFormComponentProps> = React.memo((props) => (
    <div>
        <Text variant={"medium"} className="ms-fontWeight-bold">
            {props.label}
        </Text>
        {props.children}
        <Text variant={"small"}>{props.helpText}</Text>
    </div>
));
