import React, { FC, memo } from "react";

export interface ISingleElementComponentProps {
    visibleIndex: number;
}

export const SingleElementComponent: FC<ISingleElementComponentProps> = memo((props) => {
    return (
        <div className="ms-Grid-row">
            {React.Children.map(props.children, (child, index) => (
                <div className={index === props.visibleIndex ? "ms-Grid-col ms-sm12" : "hidden"}>
                    {child}
                </div>
            ))}
        </div>
    );
});
