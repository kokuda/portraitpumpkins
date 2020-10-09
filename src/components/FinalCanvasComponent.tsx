import React from 'react';
import { Utils } from '../utils/Utils';
import { FinalCanvasProcessor } from '../utils/FinalCanvasProcessor';

export interface IFinalCanvasComponentProps {
    width: number;
    height: number;
    renderCount: number;
    input: HTMLCanvasElement | null;
    onImageChange: (canvas: HTMLCanvasElement) => void;
}

export const FinalCanvasComponent = React.memo((props: IFinalCanvasComponentProps) => {
    let canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        let source = props.input;
        let dest = canvasRef.current;
        if (source && dest) {
            dest.width = source.width;
            dest.height = source.height;
            var context = dest.getContext('2d');
            if (context) {
                source = Utils.ProcessFinalCanvas(source);
                context.drawImage(source, 0, 0, source.width, source.height);
                props.onImageChange(dest);
            }
        }
    });

    return <canvas ref={canvasRef} width={props.width} height={props.height} />;
});

export const FinalShaderCanvasComponent: React.FC<IFinalCanvasComponentProps> = React.memo((props) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const canvasProcessor = React.useMemo(() => {
        return new FinalCanvasProcessor();
    }, []);

    // dispose of the old canvasProcessor when it changes or on unmount.
    React.useEffect(() => {
        return () => {
            canvasProcessor.dispose();
        };
    }, [canvasProcessor]);

    React.useEffect(() => {
        let source = props.input;
        let dest = canvasRef.current;
        if (source && dest) {
            dest.width = source.width;
            dest.height = source.height;
            var context = dest.getContext('2d');
            if (context) {
                source = canvasProcessor.ProcessFinalShaderCanvas(source);
                context.drawImage(source, 0, 0, source.width, source.height);
                props.onImageChange(dest);
            }
        }
    });

    return <canvas ref={canvasRef} width={props.width} height={props.height} />;
});
