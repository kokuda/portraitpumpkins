import React from "react";
import * as BABYLON from "babylonjs";

export interface IPumpkinRenderComponentProps {
    width: number;
    height: number;
    input: HTMLCanvasElement | null;
    renderCount: number;
    scaleStrength: number;
    enableCameraControls: boolean;
    textureWidth?: number;
    textureHeight?: number;
}

const _fleshColor = new BABYLON.Color4(254 / 255, 219 / 255, 53 / 255);

function createRenderTargetTexture(scene: BABYLON.Scene) {
    BABYLON.Effect.ShadersStore["pumpkinFacePixelShader"] = `
        #ifdef GL_ES
        precision highp float;
        #endif

        varying vec2 vUV;

        uniform vec4 fleshColor;
        uniform vec2 scale;
        uniform sampler2D skinSampler;
        uniform sampler2D faceSampler;

        void main(void) {
            vec4 faceColor = texture2D(faceSampler, vec2((vUV.x-0.5)*2.0/scale.x+0.5, (vUV.y-0.5)/scale.y + 0.5));
            vec4 skinColor = texture2D(skinSampler, vUV);
            if (faceColor.r < 0.15) {
              gl_FragColor = skinColor;
            } else if (faceColor.r > 0.8) {
              gl_FragColor = vec4(skinColor.rgb, 0.0);
            } else {
              gl_FragColor = fleshColor;
            }
        }
    `;

    let texture = new BABYLON.CustomProceduralTexture("PumpkinSkin", "pumpkinFace", 1024, scene);

    return texture;
}

export const PumpkinRenderComponent: React.FC<IPumpkinRenderComponentProps> = React.memo((props) => {
    const textureWidth = props.textureWidth ? props.textureWidth : 512;
    const textureHeight = props.textureHeight ? props.textureHeight : 512;
    const { width, height, enableCameraControls, input, scaleStrength, renderCount } = props;

    const [pumpkinImg, setPumpkinImg] = React.useState<HTMLImageElement>();

    // Load the pumkin texture only once (no depedendencies)
    React.useEffect(() => {
        var img = new Image();
        img.src = "/textures/pumpkin.jpg";
        img.onload = () => {
            setPumpkinImg(img);
        };
    }, []);

    const scene = React.useRef<BABYLON.Scene | null>(null);
    const engine = React.useRef<BABYLON.Engine | null>(null);
    const _customTexture = React.useRef<BABYLON.CustomProceduralTexture | null>(null);
    const _dynamicTextureSkin = React.useRef<BABYLON.DynamicTexture | null>(null);
    const _dynamicTextureFace = React.useRef<BABYLON.DynamicTexture | null>(null);

    const setTexture = React.useCallback(
        (
            sourceCanvas: HTMLCanvasElement,
            img: HTMLImageElement,
            width: number,
            height: number,
            scale: number,
            enableCameraControls: boolean
        ) => {
            if (_customTexture.current && _dynamicTextureFace.current && _dynamicTextureSkin.current) {
                // Draw the img into the skin texture
                let outputCtx = _dynamicTextureSkin.current.getContext();
                outputCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
                _dynamicTextureSkin.current.update();

                // Draw the source into a dynamic texture
                let faceCtx = _dynamicTextureFace.current.getContext();
                faceCtx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, width, height);
                _dynamicTextureFace.current.update();

                // Set the shader values to render the face and pumpkin skin onto the pumpkin model
                _customTexture.current.setColor4("fleshColor", _fleshColor);
                const scaleVector = new BABYLON.Vector2(scale, (scale * sourceCanvas.height) / sourceCanvas.width);
                _customTexture.current.setVector2("scale", scaleVector);
                _customTexture.current.setTexture("skinSampler", _dynamicTextureSkin.current);
                _customTexture.current.setTexture("faceSampler", _dynamicTextureFace.current);

                if (enableCameraControls) {
                    engine.current?.runRenderLoop(() => {
                        scene.current?.render();
                    });
                } else {
                    scene.current?.whenReadyAsync().then(() => {
                        scene.current?.render();
                    });
                }
            }
        },
        []
    );

    const onSceneMount = React.useCallback(
        (
            scene: BABYLON.Scene,
            canvas: HTMLCanvasElement,
            width: number,
            height: number,
            enableCameraControls: boolean
        ) => {

            // This creates and positions a free camera (non-mesh)
            var camera = new BABYLON.ArcRotateCamera("camera1", 0, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);

            // This targets the camera to scene origin
            camera.setTarget(BABYLON.Vector3.Zero());

            if (enableCameraControls) {
                camera.attachControl(canvas, true);
                camera.lowerRadiusLimit = camera.upperRadiusLimit = camera.radius; // Disable zooming
            }

            // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
            new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(1, 1, 0), scene).intensity = 1;

            // Pumpkin texture
            _customTexture.current = createRenderTargetTexture(scene);
            _dynamicTextureSkin.current = new BABYLON.DynamicTexture(
                "PumpkinSkin",
                { width: width, height: height },
                scene,
                false
            );
            _dynamicTextureFace.current = new BABYLON.DynamicTexture(
                "PumpkinFace",
                { width: width, height: height },
                scene,
                false
            );

            // Pumpkin material
            var material = new BABYLON.StandardMaterial("material", scene);
            material.diffuseTexture = _customTexture.current;
            material.opacityTexture = _customTexture.current;
            material.bumpTexture = new BABYLON.Texture("textures/pumpkin_normalmap.jpg", scene);
            material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

            // Outside of pumpkin
            var sphere = BABYLON.MeshBuilder.CreateSphere("pumpkin", { diameter: 3 }, scene);
            sphere.addRotation(0, 0, Math.PI);
            sphere.material = material;

            // Inside of pumpkin
            var inside = BABYLON.MeshBuilder.CreateSphere(
                "inside",
                { diameter: 2.99, sideOrientation: BABYLON.Mesh.BACKSIDE },
                scene
            );
            inside.material = new BABYLON.StandardMaterial("light", scene);

            // Internal light
            var bulb = new BABYLON.PointLight("bulb", new BABYLON.Vector3(0, 0, 0), scene);
            bulb.diffuse = new BABYLON.Color3(255 / 255, 255 / 244, 255 / 229);
        },
        []
    );

    // Ref callback when the canvas is created
    const setCanvas = React.useCallback(
        (canvas: HTMLCanvasElement) => {
            if (!canvas) {
                return;
            }

            engine.current = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
            scene.current = new BABYLON.Scene(engine.current);

            onSceneMount(scene.current, canvas, textureWidth, textureHeight, enableCameraControls);

            // Don't know why, but for some reason, after creating the Engine above,
            // the canvas width and height are set to 0, so this is to reset them.
            canvas.width = width;
            canvas.height = height;
        },
        [onSceneMount, width, height, textureWidth, textureHeight, enableCameraControls]
    );

    // Return a function to cleanup the scene and engine
    React.useEffect(
        () => () => {
            scene.current?.dispose();
            engine.current?.dispose();
        },
        []
    );

    // Render the textures when the props change.
    // renderCount is incremented by the containing component to force a re-render.
    React.useEffect(() => {
        if (input && pumpkinImg) {
            setTexture(
                input,
                pumpkinImg,
                textureWidth,
                textureHeight,
                scaleStrength,
                enableCameraControls
            );
        }
    }, [
        renderCount,
        input,
        setTexture,
        pumpkinImg,
        textureWidth,
        textureHeight,
        scaleStrength,
        enableCameraControls,
    ]);

    const canvasStyle = enableCameraControls ? { touchAction: "none" } : {};

    return <canvas width={width} height={height} ref={setCanvas} style={canvasStyle} />;
});
