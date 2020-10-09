import React, { memo } from 'react';
import { CanvasFilter } from '../utils/CanvasFilter';
import { CanvasFilterShaders } from '../utils/CanvasFilterShaders';

export interface ILevelsCanvasComponentProps {
    width: number;
    height: number;
    levelRange: [number, number, number];
    renderCount: number;
    input: HTMLCanvasElement | null;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onLevel: () => void;
}

export const LevelsCanvasComponent = memo((props: ILevelsCanvasComponentProps) => {
    React.useEffect(() => {
        let source = props.input;
        if (source && props.canvasRef.current) {
            let dest = props.canvasRef.current;
            var ctx = source.getContext('2d');
            if (ctx) {
                let pixels = ctx.getImageData(0, 0, source.width, source.height);
                pixels = CanvasFilter.ApplyLevels(
                    pixels,
                    props.levelRange[0],
                    props.levelRange[1],
                    props.levelRange[2]
                );
                dest.getContext('2d')!.putImageData(pixels, 0, 0);
            }
            props.onLevel();
        }
    });

    return <canvas ref={props.canvasRef} width={props.width} height={props.height} />;
});

export const LevelsShaderCanvasComponent = memo((props: ILevelsCanvasComponentProps) => {
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
            if (canvasFilterShadersRef.current) {
                canvasFilterShadersRef.current.applyLevels(
                    source,
                    props.levelRange[0],
                    props.levelRange[1],
                    props.levelRange[2]
                );
            }
            props.onLevel();
        }
    });

    return <canvas ref={props.canvasRef} width={props.width} height={props.height} />;
});
