import { Checkbox } from '@fluentui/react/lib/Checkbox';
import React from 'react';

interface IHeaderOptionsProps {
    loadImage: (src: string) => void;
    shadersEnabled: boolean;
    setSharesEnabled: (value: boolean) => void;
    cameraControlEnabled: boolean;
    setCameraControlEnabled: (value: boolean) => void;
}

export const HeaderOptions: React.FC<IHeaderOptionsProps> = React.memo(function HeaderOptions({
    loadImage,
    shadersEnabled,
    setSharesEnabled,
    cameraControlEnabled,
    setCameraControlEnabled,
}) {
    const onShaderChanged = React.useCallback(
        (event?: React.FormEvent<HTMLElement>, checked?: boolean) => {
            if (checked !== undefined) {
                setSharesEnabled(checked);
            }
        },
        [setSharesEnabled]
    );

    const onCameraControlChanged = React.useCallback(
        (event?: React.FormEvent<HTMLElement>, checked?: boolean) => {
            if (checked !== undefined) {
                setCameraControlEnabled(checked);
            }
        },
        [setCameraControlEnabled]
    );

    const onInputChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files) {
                if (files.length > 0) {
                    var fileReader = new FileReader();
                    fileReader.onload = function () {
                        if (this.result && typeof this.result == 'string') {
                            loadImage(this.result);
                        }
                    };
                    fileReader.readAsDataURL(files[0]);
                }
            }
        },
        [loadImage]
    );

    return (
        <>
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
        </>
    );
});
