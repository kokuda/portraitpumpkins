import React, {memo} from 'react';
import { CanvasFilter } from '../utils/CanvasFilter';
import { CanvasFilterShaders } from '../utils/CanvasFilterShaders';

export interface IPosterizeCanvasComponentProps {
    width: number,
    height: number,
    renderCount: number,
    input: HTMLCanvasElement | null,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    onPosterize: () => void
}

export const PosterizeCanvasComponent = memo((props: IPosterizeCanvasComponentProps) => {

    React.useEffect(() => {
        let source = props.input;
        if (source && props.canvasRef.current) {

            let ctx = source.getContext('2d');
            let destCtx = props.canvasRef.current.getContext('2d');
            if (ctx && destCtx) {

                let pixels = ctx.getImageData(0, 0, props.width, props.height);
    
                const colours = [
                    [0,0,0],
                    [127,127,127],
                    [255,255,255]
                ];
                pixels = CanvasFilter.Posterize(pixels, colours);
                destCtx.putImageData(pixels, 0, 0);
    
                props.onPosterize();
            }
        }
    });

    return <canvas ref={props.canvasRef} width={props.width} height={props.height}/>
});

export const PosterizeShaderCanvasComponent = memo((props: IPosterizeCanvasComponentProps) => {

    let canvasFilterShadersRef = React.useRef<CanvasFilterShaders>();

    React.useEffect(() => {
        if (props.canvasRef.current) {
            const canvasFilterShaders = canvasFilterShadersRef.current = new CanvasFilterShaders(props.canvasRef.current);
            return () => {
                canvasFilterShaders.dispose();
            };
        }    
    }, [props.canvasRef]);

    React.useEffect(() => {
        let source = props.input;
        let dest = props.canvasRef.current;
        if (source && dest) {
            if (canvasFilterShadersRef.current) {
                const colours = [
                    0,0,0,
                    0.5,0.5,0.5,
                    1.0,1.0,1.0
                ];

                canvasFilterShadersRef.current.applyPosterize(source, colours);
            }
            props.onPosterize();
        }
    });

    return <canvas ref={props.canvasRef} width={props.width} height={props.height}/>
});
