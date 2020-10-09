import React, { useState } from 'react';
import { CanvasFilter } from '../utils/CanvasFilter';
import { BlurCanvasComponent, BlurShaderCanvasComponent } from './BlurCanvasComponent';
import { LevelsCanvasComponent, LevelsShaderCanvasComponent } from './LevelsCanvasComponent';
import { PosterizeCanvasComponent, PosterizeShaderCanvasComponent } from './PosterizeCanvasComponent';
import { PumpkinRenderComponent } from './PumpkinRenderComponent';
import { SingleElementComponent } from './SingleElementComponent';

export interface IImageProcessingComponentProps {
    levelRange: [number, number, number];
    blurStrength: number;
    scaleValue: number;
    selectedLayer: string;
    onImageChange: (canvas: HTMLCanvasElement) => void;
    image: HTMLCanvasElement | undefined;
    width: number;
    useShaders: boolean;
    enableCameraControls: boolean;
}

const getIndexFromLayer = (layer: string): number => {
    switch (layer) {
        case 'original':
            return 0;
        case 'grayscale':
            return 1;
        case 'blur':
            return 2;
        case 'levels':
            return 3;
        case 'posterize':
            return 4;
        case 'pumpkin':
            return 5;
    }
    return 0;
};

function applyGrayscale(source: HTMLCanvasElement, dest: HTMLCanvasElement) {
    const ctx = source.getContext('2d');
    const destContext = dest.getContext('2d');
    if (ctx && destContext) {
        var pixels = ctx.getImageData(0, 0, source.width, source.height);
        pixels = CanvasFilter.Grayscale(pixels);
        destContext.putImageData(pixels, 0, 0);
    }
}

export const ImageProcessingComponent: React.FC<IImageProcessingComponentProps> = ({
    onImageChange,
    image,
    width,
    useShaders,
    selectedLayer,
    blurStrength,
    levelRange,
    enableCameraControls,
    scaleValue,
}) => {
    const posterizeRef = React.useRef<HTMLCanvasElement>(null);
    const grayscaleRef = React.useRef<HTMLCanvasElement>(null);
    const blurRef = React.useRef<HTMLCanvasElement>(null);
    const levelsRef = React.useRef<HTMLCanvasElement>(null);

    // Use callback and state instead of useRef so that we get notified when it changes
    // and can render the image into it the first time.
    const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);

    // Use state to tell each component canvas to re-render itself.
    const [blurCount, setBlurCount] = useState(0);
    const [levelsCount, setLevelsCount] = useState(0);
    const [posterizeCount, setPosterizeCount] = useState(0);
    const [processedRenderCount, setProcessedRenderCount] = useState(0);

    // On each callback, increment the renderCount of the next layer
    const onBlur = React.useCallback(() => setLevelsCount((l) => l + 1), []);
    const onLevel = React.useCallback(() => setPosterizeCount((p) => p + 1), []);
    const onPosterize = React.useCallback(() => {
        if (posterizeRef.current) {
            onImageChange(posterizeRef.current);
        }
        setProcessedRenderCount((p) => p + 1);
    }, [onImageChange]);

    // If the image or the originalCanvas ref change then render the image into the canvas and greyscale
    React.useEffect(() => {
        if (!originalCanvas || !image) {
            return;
        }

        var context = originalCanvas.getContext('2d');
        if (!context) {
            return;
        }

        context.clearRect(0, 0, originalCanvas.width, originalCanvas.height);

        context.drawImage(image, 0, 0, originalCanvas.width, originalCanvas.height);

        if (grayscaleRef.current && originalCanvas) {
            applyGrayscale(originalCanvas, grayscaleRef.current);
        }

        // Mark the image as needing to be blurred
        setBlurCount((b) => b + 1);
    }, [image, originalCanvas]);

    // Wait for an image before we render anything
    if (image) {
        // Calculate the output size based on a scaled image with the same aspect ratio
        let height = (image.height / image.width) * width;

        let BlurComponent = useShaders ? BlurShaderCanvasComponent : BlurCanvasComponent;
        let LevelsComponent = useShaders ? LevelsShaderCanvasComponent : LevelsCanvasComponent;
        let PosterizeComponent = useShaders ? PosterizeShaderCanvasComponent : PosterizeCanvasComponent;

        const selectedIndex = getIndexFromLayer(selectedLayer);

        return (
            <SingleElementComponent visibleIndex={selectedIndex}>
                <canvas ref={setOriginalCanvas} width={width} height={height} />
                <canvas ref={grayscaleRef} width={width} height={height} />
                <BlurComponent
                    canvasRef={blurRef}
                    width={width}
                    height={height}
                    renderCount={blurCount}
                    blurStrength={blurStrength}
                    input={grayscaleRef.current}
                    onBlur={onBlur}
                />
                <LevelsComponent
                    canvasRef={levelsRef}
                    width={width}
                    height={height}
                    renderCount={levelsCount}
                    levelRange={levelRange}
                    input={blurRef.current}
                    onLevel={onLevel}
                />
                <PosterizeComponent
                    canvasRef={posterizeRef}
                    width={width}
                    height={height}
                    renderCount={posterizeCount}
                    input={levelsRef.current}
                    onPosterize={onPosterize}
                />
                <PumpkinRenderComponent
                    // PumpkinRenderComponent can't change the enableCameraControls prop so it must toggle the key
                    key={enableCameraControls ? 'withcamera' : 'withoutcamera'}
                    width={width}
                    height={height}
                    input={posterizeRef.current}
                    renderCount={processedRenderCount}
                    scaleStrength={scaleValue}
                    enableCameraControls={enableCameraControls}
                />
            </SingleElementComponent>
        );
    } else {
        return <></>;
    }
};
