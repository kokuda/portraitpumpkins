import React from "react";
import "@fluentui/react/dist/css/fabric.css";
import "./App.css";
import { ImageProcessingComponent } from "./components/ImageProcessingComponent";
import { LayerSelectionComponent } from "./components/LayerSelectionComponent";
import { PdfGenerator } from "./utils/PdfGenerator";
import { Utils } from "./utils/Utils";
import { InputFormComponent } from "./components/InputFormComponent";
import Slider, { createSliderWithTooltip } from "rc-slider";
import { Range } from "rc-slider";
import { FinalCanvasComponent, FinalShaderCanvasComponent } from "./components/FinalCanvasComponent";

import { Text } from "@fluentui/react/lib/Text";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { Separator } from "@fluentui/react/lib/Separator";
import { Checkbox } from "@fluentui/react/lib/Checkbox";
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons(/* optional base url */);

const SliderWithToolTip = createSliderWithTooltip(Slider);

const MAGIC_PUMPKIN_SCALE_VALUE = 0.375;
const PUMPKIN_SIZE_MAP = {
    2: '2"',
    4: '4"',
    6: '6"',
    8: '8"',
    10: '10"',
    12: '12"',
    14: '14"',
    16: '16"',
    18: '18"',
};

const PUMPKIN_DEGREE_MAP = {
    [-135]: "-135°",
    [-90]: "-90°",
    [-45]: "-45°",
    0: "0°",
    45: "45°",
    90: "90°",
    135: "135°",
};

const PUMPKIN_SCALE_MARKS = {
    20: "20%",
    50: "50%",
    80: "80%",
    100: "100%",
    120: "120%",
    150: "150%",
    180: "180%",
};

const SLIDER_STYLE_WITH_MARKS = { marginBottom: 25 };

const FullWidthInputControls = function (props: { children: JSX.Element | JSX.Element[] }): any {
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
};

const percentFormatter = (value: number) => `${value}%`;
const degreeFormatter = (value: number) => `${value}°`;
const inchFormatter = (value: number) => `${value}"`;

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

    const onChangeScale = React.useCallback((value) => setScaleStrength(value / 100), []);
    const onChangeLevelRange = React.useCallback((value: number[]) => setLevelRange([value[0], value[1], value[2]]), []);

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

    const onInputChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files) {
                if (files.length > 0) {
                    var fileReader = new FileReader();
                    fileReader.onload = function () {
                        if (this.result && typeof this.result == "string") {
                            loadImage(this.result);
                        }
                    };
                    fileReader.readAsDataURL(files[0]);
                }
            }
        },
        [loadImage]
    );

    const onShaderChanged = React.useCallback((event?: React.FormEvent<HTMLElement>, checked?: boolean) => {
        if (checked !== undefined) {
            setSharesEnabled(checked);
        }
    }, []);

    const onCameraControlChanged = React.useCallback((event?: React.FormEvent<HTMLElement>, checked?: boolean) => {
        if (checked !== undefined) {
            setCameraControlEnabled(checked);
        }
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
                <div className="ms-Grid-col ms-sm12 ms-xl3">
                    <input
                        className="form-control"
                        name="image"
                        type="file"
                        onChange={(event) => onInputChange(event as any)}
                    />
                </div>
                <div className="ms-Grid-col ms-sm12 ms-xl3">
                    <Checkbox label="Enable Shaders" checked={shadersEnabled} onChange={onShaderChanged} />
                    <Checkbox
                        label="Enable Camera Controls"
                        checked={cameraControlEnabled}
                        onChange={onCameraControlChanged}
                    />
                </div>
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
                        <LayerSelectionComponent defaultLayer={selectedLayer} onValueChanged={setSelectedLayer} />
                        <InputFormComponent label="Levels" helpText="Adjust the low, mid, and high level values">
                            <Range
                                count={3}
                                min={0}
                                max={255}
                                defaultValue={levelRange}
                                onAfterChange={onChangeLevelRange}
                                pushable
                            />
                        </InputFormComponent>
                        <InputFormComponent label="Blur" helpText="Adjust the amount of blur">
                            <SliderWithToolTip
                                defaultValue={blurStrength}
                                min={0}
                                max={100}
                                onAfterChange={setBlurStrength}
                            />
                        </InputFormComponent>
                        <InputFormComponent label="Scale" helpText="Scale the image on the pumpkin">
                            <div style={SLIDER_STYLE_WITH_MARKS}>
                                <SliderWithToolTip
                                    defaultValue={scaleStrength * 100}
                                    min={10}
                                    max={200}
                                    onAfterChange={onChangeScale}
                                    tipFormatter={percentFormatter}
                                    marks={PUMPKIN_SCALE_MARKS}
                                />
                            </div>
                        </InputFormComponent>
                        <InputFormComponent label="Rotate" helpText="Rotate the image">
                            <div style={SLIDER_STYLE_WITH_MARKS}>
                                <SliderWithToolTip
                                    defaultValue={rotation}
                                    min={-180}
                                    max={180}
                                    onAfterChange={setRotation}
                                    tipFormatter={degreeFormatter}
                                    marks={PUMPKIN_DEGREE_MAP}
                                />
                            </div>
                        </InputFormComponent>
                        <InputFormComponent label="Pumpkin Size" helpText="Height of pumpkin in inches">
                            <div style={SLIDER_STYLE_WITH_MARKS}>
                                <SliderWithToolTip
                                    defaultValue={pumpkinSizeInInches}
                                    min={1}
                                    max={20}
                                    onAfterChange={setPumpkinSizeInInches}
                                    tipFormatter={inchFormatter}
                                    step={0.1}
                                    marks={PUMPKIN_SIZE_MAP}
                                />
                            </div>
                        </InputFormComponent>
                        <PrimaryButton onClick={onSave}>Save</PrimaryButton>
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
