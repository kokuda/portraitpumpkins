import React, { memo } from 'react';
import { CanvasFilterShaders } from '../utils/CanvasFilterShaders';
import { CanvasFilter } from '../utils/CanvasFilter';

export interface IBlurCanvasComponentProps {
    width: number;
    height: number;
    blurStrength: number;
    renderCount: number;
    input: HTMLCanvasElement | null;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onBlur: () => void;
}

export const BlurCanvasComponent = memo((props: IBlurCanvasComponentProps) => {
    React.useEffect(() => {
        let source = props.input;
        let dest = props.canvasRef.current;
        if (source && dest) {
            // Linear scale to 2-10
            var boxBlurSize = Math.floor((props.blurStrength / 100) * 8 + 2);
            var sourceCtx = source.getContext('2d');
            let destCtx = dest.getContext('2d');
            if (sourceCtx && destCtx) {
                var pixels = sourceCtx.getImageData(0, 0, source.width, source.height);
                pixels = CanvasFilter.ApplyBoxBlur(pixels, boxBlurSize);
                destCtx.putImageData(pixels, 0, 0);
            }
            props.onBlur();
        }
    });

    return <canvas ref={props.canvasRef} width={props.width} height={props.height} />;
});

export const BlurShaderCanvasComponent = memo((props: IBlurCanvasComponentProps) => {
    let canvasFilterShadersRef = React.useRef<CanvasFilterShaders>();

    React.useEffect(() => {
        if (props.canvasRef.current) {
            const canvasFilterShaders = (canvasFilterShadersRef.current = new CanvasFilterShaders(
                props.canvasRef.current
            ));
            return () => {
                canvasFilterShaders.dispose();
            };
        }
    }, [props.canvasRef]);

    React.useEffect(() => {
        let source = props.input;
        let dest = props.canvasRef.current;
        if (source && dest) {
            // Linear scale to 2-10
            var boxBlurSize = Math.floor((props.blurStrength / 100) * 8 + 2);
            if (canvasFilterShadersRef.current) {
                canvasFilterShadersRef.current.applyBoxBlur(source, boxBlurSize);
            }
            props.onBlur();
        }
    });

    return <canvas ref={props.canvasRef} width={props.width} height={props.height} />;
});
