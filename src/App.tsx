import React from "react";
import "@fluentui/react/dist/css/fabric.css";
import "./App.css";
import { ImageProcessingComponent } from "./components/ImageProcessingComponent";
import { PdfGenerator } from "./utils/PdfGenerator";
import { Utils } from "./utils/Utils";
import { FinalCanvasComponent, FinalShaderCanvasComponent } from "./components/FinalCanvasComponent";
import { HeaderOptions } from "./components/HeaderOptions";

import { Text } from "@fluentui/react/lib/Text";
import { Separator } from "@fluentui/react/lib/Separator";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import { ImageProcessingOptions } from "./components/ImageProcessingOptions";
import { LayerSelectionComponent } from "./components/LayerSelectionComponent";
import { FullWidthInputControls } from "./components/FullWidthInputControls";
initializeIcons(/* optional base url */);

const MAGIC_PUMPKIN_SCALE_VALUE = 0.375;

const App: React.FC = () => {
    const _finalCanvas = React.useRef(document.createElement("canvas"));

    const [levelRange, setLevelRange] = React.useState<[number, number, number]>([120, 134, 179]);
    const [blurStrength, setBlurStrength] = React.useState(10);
    const [scaleStrength, setScaleStrength] = React.useState(1.2);
    const [selectedLayer, setSelectedLayer] = React.useState("pumpkin");
    const [processedCanvas, setProcessedCanvas] = React.useState(document.createElement("canvas"));
    const [processedRenderCount, setProcessedRenderCount] = React.useState(0);
    const [rotation, setRotation] = React.useState(0);
    const [pumpkinSizeInInches, setPumpkinSizeInInches] = React.useState(14);
    const [shadersEnabled, setSharesEnabled] = React.useState(true);
    const [cameraControlEnabled, setCameraControlEnabled] = React.useState(false);
    const [image, setImage] = React.useState<HTMLImageElement | undefined>(undefined);

    const loadImage = React.useCallback((src: string) => {
        var image = new Image();
        image.src = src;
        image.onload = function () {
            setImage(image);
        };
    }, []);

    // This should run only once since it depends on loadImage, which depends on nothing.
    React.useEffect(() => {
        loadImage("./images/matthew.jpg");
    }, [loadImage]);

    const onSave = React.useCallback(() => {
        let pdfg = new PdfGenerator();

        // Calculate the height.
        let pumpkinSizeInches = pumpkinSizeInInches; // inches
        let textureWrapWidthInches = (pumpkinSizeInches * Math.PI) / 2; // Assume we are wrapping 180, not 360
        let outputWidthInches = textureWrapWidthInches * scaleStrength * MAGIC_PUMPKIN_SCALE_VALUE;
        pdfg.Save(_finalCanvas.current, outputWidthInches);
    }, [pumpkinSizeInInches, scaleStrength]);

    const onImageChange = React.useCallback((canvas: HTMLCanvasElement) => {
        setProcessedCanvas(canvas);
        setProcessedRenderCount((p) => p + 1);
    }, []);

    const onFinalImageChange = React.useCallback((canvas: HTMLCanvasElement) => {
        _finalCanvas.current = canvas;
    }, []);

    const useImageProcessingComponent = selectedLayer !== "final";

    // rotate the image onto a new Canvas.
    const imageCanvas = React.useMemo(() => {
        return image ? Utils.DrawRotatedImage(image, rotation) : undefined;
    }, [image, rotation]);

    return (
        <div className="ms-Grid" dir="ltr">
            <div className="ms-Grid-row">
                <Text variant={"xxLarge"}>Portait Pumpkin</Text>
                <Separator />
            </div>
            <div className="ms-Grid-row">
                <HeaderOptions
                    loadImage={loadImage}
                    shadersEnabled={shadersEnabled}
                    setSharesEnabled={setSharesEnabled}
                    cameraControlEnabled={cameraControlEnabled}
                    setCameraControlEnabled={setCameraControlEnabled}
                />
            </div>
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-xl6">
                    <div className={!useImageProcessingComponent ? "hidden" : ""}>
                        <ImageProcessingComponent
                            key={shadersEnabled ? "ipc_shader" : "ipc"}
                            levelRange={levelRange}
                            blurStrength={blurStrength}
                            scaleValue={scaleStrength * MAGIC_PUMPKIN_SCALE_VALUE}
                            selectedLayer={selectedLayer}
                            onImageChange={onImageChange}
                            image={imageCanvas}
                            width={400}
                            useShaders={shadersEnabled}
                            enableCameraControls={cameraControlEnabled}
                        />
                    </div>
                    <div className={selectedLayer !== "final" ? "hidden" : ""}>
                        {shadersEnabled ? (
                            <FinalShaderCanvasComponent
                                input={processedCanvas}
                                width={processedCanvas.width}
                                height={processedCanvas.height}
                                renderCount={processedRenderCount}
                                onImageChange={onFinalImageChange}
                            />
                        ) : (
                            <FinalCanvasComponent
                                input={processedCanvas}
                                width={processedCanvas.width}
                                height={processedCanvas.height}
                                renderCount={processedRenderCount}
                                onImageChange={onFinalImageChange}
                            />
                        )}
                    </div>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-xl6">
                    <FullWidthInputControls>
                        <LayerSelectionComponent layer={selectedLayer} onValueChanged={setSelectedLayer} />
                        <ImageProcessingOptions
                            levelRange={levelRange}
                            setLevelRange={setLevelRange}
                            blurStrength={blurStrength}
                            setBlurStrength={setBlurStrength}
                            scaleStrength={scaleStrength}
                            setScaleStrength={setScaleStrength}
                            rotation={rotation}
                            setRotation={setRotation}
                            pumpkinSizeInInches={pumpkinSizeInInches}
                            setPumpkinSizeInInches={setPumpkinSizeInInches}
                            onSave={onSave}
                        />
                    </FullWidthInputControls>
                </div>
            </div>
            <div className="ms-Grid-row">
                <div className="notice ms-depth-16 ms-Grid-col ms-sm12">
                    For more details and instructions in how to apply this to the pumpkin, see{" "}
                    <a href="http://notions.okuda.ca/2019/10/26/portrait-pumpkin-carving-app/">
                        <strong>the original Notions blog post HERE</strong>
                    </a>
                    .
                </div>
            </div>
        </div>
    );
};

export default App;
