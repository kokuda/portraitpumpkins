import React from "react";

export const FullWidthInputControls = React.memo(function FullWidthInputControls(props: { children: JSX.Element | JSX.Element[] }): any {
    return (
        <div className="ms-Grid" dir="ltr">
            {React.Children.map(props.children, (child: JSX.Element) => {
                return (
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12">{child}</div>
                    </div>
                );
            })}
        </div>
    );
});
