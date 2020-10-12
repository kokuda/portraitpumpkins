import React from 'react';

export function useSizeObserver(target: HTMLDivElement | null, defaultWidth: number, defaultHeight: number) {
    const [width, setWidth] = React.useState(defaultWidth);
    const [height, setHeight] = React.useState(defaultHeight);

    React.useEffect(() => {
        if (target) {
            const outputsize = () => {
                setWidth(target.clientWidth);
                setHeight(target.clientHeight);
            };

            // @ts-ignore
            const observer = new ResizeObserver(outputsize).observe(target);

            return () => {
                observer.disconnect();
            };
        }
    }, [target]);

    return { width, height };
}
