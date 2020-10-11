import { CanvasFilter } from './CanvasFilter';

export class Utils {
    static ProcessFinalCanvas(canvas: HTMLCanvasElement) {
        // Get the pixels for processing
        var ctx = canvas.getContext('2d');

        if (!ctx) {
            let result = document.createElement('canvas');
            result.width = canvas.width;
            result.height = canvas.height;
            ctx = result.getContext('2d');
            if (ctx) {
                ctx.drawImage(canvas, 0, 0);
            }
        }

        if (ctx) {
            var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Lighten the 3 colours by posterizing them to slightly lighter colours.
            pixels = CanvasFilter.Posterize(pixels, [
                [255, 255, 255],
                [220, 220, 220],
                [200, 200, 200],
                [150, 150, 150],
            ]);

            // Reduce the ink usage by replacing the colours with a pattern
            pixels = CanvasFilter.ReplacePattern(pixels);

            let result = document.createElement('canvas');
            result.width = canvas.width;
            result.height = canvas.height;
            result.getContext('2d')!.putImageData(pixels, 0, 0);

            return result;
        } else {
            let result = document.createElement('canvas');
            result.width = canvas.width;
            result.height = canvas.height;
            return result;
        }
    }

    static DrawRotatedImage(image: HTMLImageElement, rotation: number): HTMLCanvasElement {
        // Draw the image into a square canvas
        const maxDimension = Math.max(image.width, image.height);

        // Create a temporary canvas
        var canvas = document.createElement('canvas');
        canvas.width = maxDimension;
        canvas.height = maxDimension;

        // Rotate and draw the image on the canvas
        var context = canvas.getContext('2d')!;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((rotation * Math.PI) / 180);
        context.drawImage(image, -image.width / 2, -image.height / 2);

        // Pass the rotated canvas to the image processing component
        return canvas;
    }
}
