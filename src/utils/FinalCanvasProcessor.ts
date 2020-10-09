import { CanvasFilterShaders } from '../utils/CanvasFilterShaders';

const _colours = [
    1.0,
    1.0,
    1.0, // 255
    0.8627,
    0.8627,
    0.8627, // 220
    0.8627,
    0.8627,
    0.8627, // 220
    0.5882,
    0.5882,
    0.5882, // 150
];

export class FinalCanvasProcessor {
    private _posterizeFilter: CanvasFilterShaders;
    private _posterizeDest: HTMLCanvasElement;
    private _patternFilter: CanvasFilterShaders;
    private _patternDest: HTMLCanvasElement;

    constructor() {
        this._posterizeDest = document.createElement('canvas');
        this._posterizeFilter = new CanvasFilterShaders(this._posterizeDest);

        this._patternDest = document.createElement('canvas');
        this._patternFilter = new CanvasFilterShaders(this._patternDest);
    }

    ProcessFinalShaderCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
        this._posterizeDest.width = canvas.width;
        this._posterizeDest.height = canvas.height;
        this._posterizeFilter.applyPosterize(canvas, _colours);

        this._patternDest.width = canvas.width;
        this._patternDest.height = canvas.height;
        this._patternFilter.replacePattern(this._posterizeDest);
        return this._patternDest;
    }

    dispose() {
        this._posterizeFilter.dispose();
        this._patternFilter.dispose();
    }
}
