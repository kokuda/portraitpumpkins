import React from 'react';
import 'rc-slider/assets/index.css';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

export interface ILayerSelectionComponentProps {
    layer: string;
    onValueChanged: (val: string) => void;
}

export const LayerSelectionComponent: React.FC<ILayerSelectionComponentProps> = React.memo(
    function LayerSelectionComponent({ onValueChanged, layer }) {
        const onChangeLayer = React.useCallback(
            (item: PivotItem | undefined) => {
                if (item!.props.itemKey) {
                    onValueChanged(item!.props.itemKey);
                }
            },
            [onValueChanged]
        );

        return (
            <Pivot onLinkClick={onChangeLayer} selectedKey={layer}>
                <PivotItem headerText="Original" itemKey="original" />
                <PivotItem headerText="Grayscale" itemKey="grayscale" />
                <PivotItem headerText="Blur" itemKey="blur" />
                <PivotItem headerText="Levels" itemKey="levels" />
                <PivotItem headerText="Posterize" itemKey="posterize" />
                <PivotItem headerText="Pumpkin" itemKey="pumpkin" />
                <PivotItem headerText="Final" itemKey="final" />
            </Pivot>
        );
    }
);
