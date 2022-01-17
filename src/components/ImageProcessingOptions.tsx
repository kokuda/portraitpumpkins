import React from 'react';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import { Range } from 'rc-slider';
import { InputFormComponent } from './InputFormComponent';

const PUMPKIN_SCALE_MARKS = {
    20: '20%',
    50: '50%',
    80: '80%',
    100: '100%',
    120: '120%',
    150: '150%',
    180: '180%',
};

const PUMPKIN_DEGREE_MAP = {
    [-135]: '-135°',
    [-90]: '-90°',
    [-45]: '-45°',
    0: '0°',
    45: '45°',
    90: '90°',
    135: '135°',
};

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

const SLIDER_STYLE_WITH_MARKS = { marginBottom: 25 };

const percentFormatter = (value: number) => `${value}%`;
const degreeFormatter = (value: number) => `${value}°`;
const inchFormatter = (value: number) => `${value}"`;

const SliderWithToolTip = createSliderWithTooltip(Slider);
const MemoRange = React.memo(Range);

const WithMarks: React.FC = function WithMarks(props) {
    return <div style={SLIDER_STYLE_WITH_MARKS}>{props.children}</div>;
};

export interface IImageProcessingOptionsProps {
    levelRange: [number, number, number];
    setLevelRange: (range: [number, number, number]) => void;
    blurStrength: number;
    setBlurStrength: (strength: number) => void;
    scaleStrength: number;
    setScaleStrength: (strength: number) => void;
    rotation: number;
    setRotation: (rotation: number) => void;
    pumpkinSizeInInches: number;
    setPumpkinSizeInInches: (inches: number) => void;
    onSave: () => void;
}

export const ImageProcessingOptions: React.FC<IImageProcessingOptionsProps> = React.memo(
    function ImageProcessingOptions({
        levelRange,
        setLevelRange,
        blurStrength,
        setBlurStrength,
        scaleStrength,
        setScaleStrength,
        rotation,
        setRotation,
        pumpkinSizeInInches,
        setPumpkinSizeInInches,
        onSave,
    }) {
        const onChangeScale = React.useCallback((value) => setScaleStrength(value / 100), [setScaleStrength]);
        const onChangeLevelRange = React.useCallback(
            (value: number[]) => setLevelRange([value[0], value[1], value[2]]),
            [setLevelRange]
        );

        return (
            <>
                <InputFormComponent label="Levels" helpText="Adjust the low, mid, and high level values">
                    <MemoRange
                        count={3}
                        min={0}
                        max={255}
                        defaultValue={levelRange}
                        onAfterChange={onChangeLevelRange}
                        pushable
                    />
                </InputFormComponent>
                <InputFormComponent label="Blur" helpText="Adjust the amount of blur">
                    <SliderWithToolTip defaultValue={blurStrength} min={0} max={100} onAfterChange={setBlurStrength} />
                </InputFormComponent>
                <InputFormComponent label="Scale" helpText="Scale the image on the pumpkin">
                    <WithMarks>
                        <SliderWithToolTip
                            defaultValue={scaleStrength * 100}
                            min={10}
                            max={200}
                            onAfterChange={onChangeScale}
                            tipFormatter={percentFormatter}
                            marks={PUMPKIN_SCALE_MARKS}
                        />
                    </WithMarks>
                </InputFormComponent>
                <InputFormComponent label="Rotate" helpText="Rotate the image">
                    <WithMarks>
                        <SliderWithToolTip
                            defaultValue={rotation}
                            min={-180}
                            max={180}
                            onAfterChange={setRotation}
                            tipFormatter={degreeFormatter}
                            marks={PUMPKIN_DEGREE_MAP}
                        />
                    </WithMarks>
                </InputFormComponent>
                <InputFormComponent label="Pumpkin Size" helpText="Height of pumpkin in inches">
                    <WithMarks>
                        <SliderWithToolTip
                            defaultValue={pumpkinSizeInInches}
                            min={1}
                            max={20}
                            onAfterChange={setPumpkinSizeInInches}
                            tipFormatter={inchFormatter}
                            step={0.1}
                            marks={PUMPKIN_SIZE_MAP}
                        />
                    </WithMarks>
                </InputFormComponent>
                <PrimaryButton onClick={onSave}>Save</PrimaryButton>
            </>
        );
    }
);
