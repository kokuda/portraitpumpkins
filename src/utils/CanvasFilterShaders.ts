import * as BABYLON from 'babylonjs';

export class CanvasFilterShaders
{
    private _material: BABYLON.ShaderMaterial | undefined;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _dynamicSource: BABYLON.DynamicTexture;
    private _ground: BABYLON.Mesh;

    constructor(dest: HTMLCanvasElement) {

        const width = dest.width;
        const height = dest.height;

        // Create an engine to render the blur
        this._engine = new BABYLON.Engine(dest, true, undefined);
        dest.width = width;
        dest.height = height;
        let scene = new BABYLON.Scene(this._engine);
        scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, 0), scene);
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        camera.orthoTop = 5;
        camera.orthoBottom = -5;
        camera.orthoLeft = -5;
        camera.orthoRight = 5;
        camera.setTarget(BABYLON.Vector3.Zero());

        this._scene = scene;
        this._dynamicSource = new BABYLON.DynamicTexture("BlurSource", {width:width, height:height}, scene, false);
        this._ground = BABYLON.Mesh.CreatePlane("ground1", 10, scene);
        this._ground.addRotation(Math.PI/2, Math.PI, 0);
    }

    dispose() {
        this._scene.dispose();
        this._engine.dispose();
    }

    private _getBlurMaterial(scene: BABYLON.Scene): BABYLON.ShaderMaterial {
    
        BABYLON.Effect.ShadersStore["blurVertexShader"] = `

            #ifdef GL_ES
            precision highp float;
            #endif

            // Attributes
            attribute vec3 position;
            attribute vec2 uv;

            // Uniforms
            uniform mat4 worldViewProjection;

            // Normal
            varying vec2 vUV;

            void main(void) {
                gl_Position = worldViewProjection * vec4(position, 1.0);
                vUV = uv;
            }
        `;

        BABYLON.Effect.ShadersStore["blurFragmentShader"] = `
            #ifdef GL_ES
            precision highp float;
            #endif

            varying vec2 vUV;

            uniform sampler2D textureSampler;
            uniform float pixelWidth;
            uniform float pixelHeight;
            uniform float weights[100];
            uniform float weightTotal;

            void main(void) {
                vec2 onePixel = vec2(pixelWidth, pixelHeight);
                vec4 colour;
                for (int i=0; i<100; ++i) {
                    int x = (i % 10) - 5;
                    int y = (i / 10) - 5;
                    colour += texture2D(textureSampler, vUV + onePixel * vec2(x, y)) * weights[i];
                }
                gl_FragColor = vec4(colour.rgb / weightTotal, 1.0);
            }
        `   

        let material = new BABYLON.ShaderMaterial("blur", scene, {
            vertexElement: "blur",
            fragmentElement: "blur"
        },
        {
            needAlphaBlending: false,
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection"],
            samplers: ["textureSampler"]
        });

        return material;
    }

    private _getLevelsMaterial(scene: BABYLON.Scene): BABYLON.ShaderMaterial {
    
        BABYLON.Effect.ShadersStore["levelsVertexShader"] = `

            #ifdef GL_ES
            precision highp float;
            #endif

            // Attributes
            attribute vec3 position;
            attribute vec2 uv;

            // Uniforms
            uniform mat4 worldViewProjection;

            // Normal
            varying vec2 vUV;

            void main(void) {
                gl_Position = worldViewProjection * vec4(position, 1.0);
                vUV = uv;
            }
        `;

        BABYLON.Effect.ShadersStore["levelsFragmentShader"] = `
            #ifdef GL_ES
            precision highp float;
            #endif

            varying vec2 vUV;

            uniform sampler2D textureSampler;
            uniform float lowValue;
            uniform float midValue;
            uniform float range;
            uniform float gamma;

            void main(void) {
                vec3 colour = texture2D(textureSampler, vUV).rgb;
                colour = clamp(colour - lowValue, 0.0, 1.0) / range;
                colour = pow(colour, vec3(gamma)); 
                gl_FragColor = vec4(colour, 1.0);
            }
        `   

        let material = new BABYLON.ShaderMaterial("levels", scene, {
            vertexElement: "levels",
            fragmentElement: "levels"
        },
        {
            needAlphaBlending: false,
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection"],
            samplers: ["textureSampler"]
        });

        return material;
    }

    private _getPosterizeMaterial(scene: BABYLON.Scene): BABYLON.ShaderMaterial {
    
        BABYLON.Effect.ShadersStore["posterizeVertexShader"] = `

            #ifdef GL_ES
            precision highp float;
            #endif

            // Attributes
            attribute vec3 position;
            attribute vec2 uv;

            // Uniforms
            uniform mat4 worldViewProjection;

            // Normal
            varying vec2 vUV;

            void main(void) {
                gl_Position = worldViewProjection * vec4(position, 1.0);
                vUV = uv;
            }
        `;

        BABYLON.Effect.ShadersStore["posterizeFragmentShader"] = `
            #ifdef GL_ES
            precision highp float;
            #endif

            varying vec2 vUV;

            uniform sampler2D textureSampler;
            uniform float levelCount;
            uniform vec3 colours[10]; // Maximum of 10 levels

            void main(void) {
                vec3 colour = texture2D(textureSampler, vUV).rgb;
                float colourAverage = dot(colour, vec3(1.0)) / 3.0;
                int index = int(floor(colourAverage / levelCount));
                gl_FragColor = vec4(colours[index], 1.0);
            }
        `   

        let material = new BABYLON.ShaderMaterial("posterize", scene, {
            vertexElement: "posterize",
            fragmentElement: "posterize"
        },
        {
            needAlphaBlending: false,
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection"],
            samplers: ["textureSampler"]
        });

        return material;
    }

    // Draw the image into a dynamic texture
    private _storeCanvas(canvas: HTMLCanvasElement)
    {
        let width = canvas.width;
        let height = canvas.height;
        let dynamicSource = this._dynamicSource;

        // Resize the dynamic texture if the canvas size has changed.
        const oldSize = dynamicSource.getSize();
        if (oldSize.width !== width || oldSize.height !== height) {
            dynamicSource.scaleTo(width, height);
        }

        let inputCtx = dynamicSource.getContext();
        inputCtx.clearRect(0, 0, width, height);
        inputCtx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);
        dynamicSource.update();
    }

    applyBoxBlur(canvas: HTMLCanvasElement, size: number)
    {
        var kernel = [];
        var kernelCount = 100;
        var kernelTotal = 0;
        let halfSize = size / 2.0;

        for (var i=0; i<kernelCount; ++i)
        {
            let x = i % 10 - 5;
            let y = i / 10 - 5;
            if (Math.abs(x) < halfSize && Math.abs(y) < halfSize) {
                kernel[i] = 1.0;
                kernelTotal += 1.0;
            } else {
                kernel[i] = 0;
            }
        }

        this._storeCanvas(canvas);

        if (!this._material) {
            this._material = this._getBlurMaterial(this._scene);
            this._ground.material = this._material;
        }

        let dynamicSource = this._dynamicSource;
        let material = this._material;
        material.setTexture("textureSampler", dynamicSource);
        material.setFloat("pixelWidth", 1.0 / dynamicSource.getSize().width);
        material.setFloat("pixelHeight", 1.0 / dynamicSource.getSize().height);
        material.setFloat("weightTotal", kernelTotal);
        material.setFloats("weights", kernel);
        material.markAsDirty(BABYLON.Material.AttributesDirtyFlag);

        this._scene.render();

    }

    applyLevels(canvas: HTMLCanvasElement, lowValue: number, midValue: number, highValue: number)
    {
        let scene = this._scene;

        this._storeCanvas(canvas);

        if (!this._material) {
            this._material = this._getLevelsMaterial(this._scene);
            this._ground.material = this._material;
        }

        let dynamicSource = this._dynamicSource;
        let material = this._material;
        if (material) {
            let gamma = this._CalculateGamma(midValue);
            let normalizedLow = lowValue / 255.0;
            let normalizedMid = midValue / 255.0;
            let normalizedHigh = highValue / 255.0;

            material.setTexture("textureSampler", dynamicSource);
            material.setFloat("lowValue", normalizedLow);
            material.setFloat("midValue", normalizedMid);
            material.setFloat("range", normalizedHigh - normalizedLow);
            material.setFloat("gamma", gamma);
            material.markAsDirty(BABYLON.Material.AttributesDirtyFlag);    
        }

        scene.render();
    }

    // colours is one array numbers where each 3 are treated as one colour (r,g,b)
    applyPosterize(canvas: HTMLCanvasElement, colours: number[])
    {
        if (colours.length % 3 !== 0) {
            throw new Error("applyPosterize - colours must be a multiple of three");
        }

        let scene = this._scene;

        this._storeCanvas(canvas);

        if (!this._material) {
            this._material = this._getPosterizeMaterial(this._scene);
            this._ground.material = this._material;
        }

        let dynamicSource = this._dynamicSource;
        let material = this._material;
        if (material) {

            material.setTexture("textureSampler", dynamicSource);
            material.setFloat("levelCount", 1.0 / ((colours.length/3)-1));
            material.setArray3("colours", colours);
            material.markAsDirty(BABYLON.Material.AttributesDirtyFlag);    
        }

        scene.render();
    }

    private _CalculateGamma(midValue: number)
    {
        var gamma = 1;
        var midValueNormalized = midValue / 255;
        if (midValue < 128)
        {
            midValueNormalized = midValueNormalized * 2;
            gamma = 1 + (9 * (1-midValueNormalized))
            gamma = Math.min(gamma, 9.99);
        }
        else if (midValue > 128)
        {
            midValueNormalized = midValueNormalized * 2 - 1;
            gamma = 1 - midValueNormalized;
            gamma = Math.max(gamma, 0.01);
        }
        return 1 / gamma;
    }

    private _getPatternMaterial(scene: BABYLON.Scene): BABYLON.ShaderMaterial {
    
        BABYLON.Effect.ShadersStore["patternVertexShader"] = `

            #ifdef GL_ES
            precision highp float;
            #endif

            // Attributes
            attribute vec3 position;
            attribute vec2 uv;

            // Uniforms
            uniform mat4 worldViewProjection;

            // Normal
            varying vec2 vUV;

            void main(void) {
                gl_Position = worldViewProjection * vec4(position, 1.0);
                vUV = uv;
            }
        `;

        BABYLON.Effect.ShadersStore["patternFragmentShader"] = `
            #ifdef GL_ES
            precision highp float;
            #endif

            varying vec2 vUV;

            uniform sampler2D textureSampler;
            uniform float pixelWidth;
            uniform float pixelHeight;

            void main(void) {
                vec4 center = texture2D(textureSampler, vUV);
                vec4 up = texture2D(textureSampler, vUV + vec2(0,-pixelHeight));
                vec4 down = texture2D(textureSampler, vUV+vec2(0,pixelHeight));
                vec4 left = texture2D(textureSampler, vUV+vec2(-pixelWidth,0));
                vec4 right = texture2D(textureSampler, vUV+vec2(pixelWidth,0));
                bool isEdge = center != up || center != down || center != left || center != right;

                if (isEdge) {
                    gl_FragColor = center;
                } else {
                    float normalizedPatternColour = dot(center.rgb, vec3(1.0,1.0,1.0)) / 3.0;
                    float value = (mod(vUV.x/pixelWidth, 5.0) < 1.0) || (mod(vUV.y/pixelHeight,  5.0) < 1.0) ? normalizedPatternColour : 1.0;

                    vec4 colour = vec4(value, value, value, 1.0);
                    gl_FragColor = colour;
                }
            }
        `   

        let material = new BABYLON.ShaderMaterial("pattern", scene, {
            vertexElement: "pattern",
            fragmentElement: "pattern"
        },
        {
            needAlphaBlending: false,
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection"],
            samplers: ["textureSampler"]
        });

        return material;
    }

    replacePattern(canvas: HTMLCanvasElement)
    {
        let scene = this._scene;

        this._storeCanvas(canvas);

        if (!this._material) {
            this._material = this._getPatternMaterial(this._scene);
            this._ground.material = this._material;
        }

        let dynamicSource = this._dynamicSource;
        let material = this._material;
        if (material) {
            material.setTexture("textureSampler", dynamicSource);
            material.setFloat("pixelWidth", 1.0 / dynamicSource.getSize().width);
            material.setFloat("pixelHeight", 1.0 / dynamicSource.getSize().height);
            material.markAsDirty(BABYLON.Material.AttributesDirtyFlag);    
        }

        scene.render();
    }
}