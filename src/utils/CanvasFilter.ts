
export class CanvasFilter
{
    private static _CalculateGamma(midValue: number)
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
        
    // Useful for testing the other effects with a predictable input image.
    static DrawGradient(image: ImageData, topLeftColor: number[], topRightColor: number[], bottomLeftColor: number[], bottomRightColor: number[])
    {
        var pixels = image.data;

        for (var i=0; i< pixels.length; i+=4)
        {
            var xNorm = Math.floor((i/4) % image.width) / image.width;
            var yNorm = Math.floor((i/4) / image.width) / image.height;

            var topLeftScale = (1 - yNorm) * (1 - xNorm);
            var topRightScale = (xNorm) * (1 - yNorm);
            var bottomLeftScale = yNorm * (1-xNorm);
            var bottomRightScale = yNorm * xNorm;

            pixels[i] =
                topLeftColor[0] * topLeftScale +
                topRightColor[0] * topRightScale +
                bottomLeftColor[0] * bottomLeftScale +
                bottomRightColor[0] * bottomRightScale;

            pixels[i+1] =
                topLeftColor[1] * topLeftScale +
                topRightColor[1] * topRightScale +
                bottomLeftColor[1] * bottomLeftScale +
                bottomRightColor[1] * bottomRightScale;

            pixels[i+2] =
                topLeftColor[2] * topLeftScale +
                topRightColor[2] * topRightScale +
                bottomLeftColor[2] * bottomLeftScale +
                bottomRightColor[2] * bottomRightScale;

            pixels[i+3] =
                topLeftColor[3] * topLeftScale +
                topRightColor[3] * topRightScale +
                bottomLeftColor[3] * bottomLeftScale +
                bottomRightColor[3] * bottomRightScale;
        }

        return image;

    }

    static Grayscale(image: ImageData)
    {
        var pixels = image.data;

        for (var i=0; i< pixels.length; i+=4)
        {
            var r = pixels[i];
            var g = pixels[i+1];
            var b = pixels[i+2];
            var luminance = 0.2126*r + 0.7152*g + 0.0722*b;
            pixels[i] = pixels[i+1] = pixels[i+2] = luminance;
        }

        return image;
    }

    static Posterize(image: ImageData, levelsOrColours: number | number[][])
    {
        var colours;
        var levelSize;
        var levels;

        if (typeof(levelsOrColours) === 'number')
        {
            levels = levelsOrColours;
            colours = [];
            levelSize = 255.0 / (levels-1);
            for (var l=0; l<levels; ++l)
            {
                var value = Math.floor(levelSize*l);
                colours[l] = [value,value,value];
            }
        }
        else
        {
            colours = levelsOrColours;
            levels = colours.length;
            levelSize = 255.0 / (levels-1);
        }

        var pixels = image.data;

        for (var i=0; i< pixels.length; i+=4)
        {
            var r = pixels[i];
            var g = pixels[i+1];
            var b = pixels[i+2];

            pixels[i  ] = colours[Math.floor(r / levelSize)][0];
            pixels[i+1] = colours[Math.floor(g / levelSize)][1];
            pixels[i+2] = colours[Math.floor(b / levelSize)][2];
            pixels[i+3] = 255;
        }

        return image;
    }

    static ApplyKernel(image: ImageData, kernel: number[], kernelWidth: number, kernelHeight: number)
    {
        var pixels = image.data;
        var halfKernelWidth = Math.floor(kernelWidth / 2);
        var halfKernelHeight = Math.floor(kernelHeight / 2);
        var outputCanvas = document.createElement('canvas');
        var outputImage = outputCanvas.getContext('2d')!.createImageData(image.width, image.height);
        var outputPixels = outputImage.data;
        const offsetStep = 4 * image.width;

        for (var x=0; x< image.width; ++x)
        {
            var imageOffset = x * 4;
            const minU = Math.max(0, halfKernelWidth - x);
            const maxU = Math.min(kernelWidth, image.width - x + halfKernelWidth);

            for (var y=0; y < image.height; ++y)
            {
                var r = 0;
                var g = 0;
                var b = 0;
                var a = 0;

                const minV = Math.max(0, halfKernelHeight - y);
                const maxV = Math.min(kernelHeight, image.height - y + halfKernelHeight);
                const verticalOffset = ((minV - halfKernelHeight) * image.width)
                var offset = imageOffset + ((verticalOffset + minU - halfKernelWidth) * 4);

                for (var v=minV; v < maxV; ++v)
                {
                    let subOffset = offset + (offsetStep * v);
                    let kernelOffset = v * kernelWidth + minU;
                    for (var u=minU; u < maxU; ++u)
                    {
                        var weight = kernel[kernelOffset];
                        r += pixels[subOffset] * weight;
                        g += pixels[subOffset+1] * weight;
                        b += pixels[subOffset+2] * weight;
                        a += pixels[subOffset+3] * weight;
                        subOffset += 4;
                        kernelOffset += 1;
                    }
                }
                outputPixels[imageOffset] = r;
                outputPixels[imageOffset+1] = g;
                outputPixels[imageOffset+2] = b;
                outputPixels[imageOffset+3] = a;

                imageOffset += offsetStep;
            }
        }

        return outputImage;
    }

    static ApplyGaussianBlur3x3(image: ImageData)
    {
        var kernel = [0.0625, 0.125, 0.0625,
                      0.125,   0.25,  0.125,
                      0.0625,  0.125, 0.0625];

        return CanvasFilter.ApplyKernel(image, kernel, 3, 3);
    }

    // size == size of box
    static ApplyBoxBlur(image: ImageData, size: number)
    {
        var kernel = [];
        var kernelCount = size*size;

        for (var i=0; i<kernelCount; ++i)
        {
            kernel[i] = 1/kernelCount;
        }

        return CanvasFilter.ApplyKernel(image, kernel, size, size);
    }

    static ApplyLevels(image: ImageData, lowValue: number, midValue: number, highValue: number)
    {
        var pixels = image.data;
        var range = highValue - lowValue;

        var gamma = this._CalculateGamma(midValue);

        for (var i=0; i< pixels.length; i+=4)
        {
            var r = pixels[i];
            var g = pixels[i+1];
            var b = pixels[i+2];


            r = 255 * (r - lowValue) / range;
            g = 255 * (g - lowValue) / range;
            b = 255 * (b - lowValue) / range;
            if (midValue !== 128)    // Value of 128 has no effect
            {
                r = 255 * Math.pow(r / 255, gamma);
                g = 255 * Math.pow(g / 255, gamma);
                b = 255 * Math.pow(b / 255, gamma);
            }

            pixels[i  ] = r;
            pixels[i+1] = g;
            pixels[i+2] = b;

        }

        return image;
    }

    private static _ColoursAreEqual(pixels: Uint8ClampedArray, index: number, colour: number[])
    {
        return (
            pixels[index+0] === colour[0] &&
            pixels[index+1] === colour[1] &&
            pixels[index+2] === colour[2] &&
            pixels[index+3] === colour[3]
        );
    }

    // Return a value between 0 and radius indicating the distance from the given point
    // to the first pixel that doesn't match 'originalColour'
    private static _MatchingRadius(pixels: Uint8ClampedArray, index: number, stride: number, originalColour: number[], radius: number)
    {
        // Shortcut different coloured pixels
        let center = index;
        if (!this._ColoursAreEqual(pixels, center, originalColour)) {
            return 0;
        }

        let maxDistanceSqr = radius * radius;
        for (var x=-radius; x<radius; x++)
        {
            for (var y=-radius; y < radius; y++)
            {
                var subIndex = index + stride * y + x * 4;
                if (subIndex >= 0 && !this._ColoursAreEqual(pixels, subIndex, originalColour))
                {
                    let distanceSqr = x*x + y*y;
                    if (distanceSqr < maxDistanceSqr) {
                        maxDistanceSqr = distanceSqr;
                    }
                }
            }
        }

        return Math.sqrt(maxDistanceSqr);
    }

    static ReplaceColour(image: ImageData, originalColour: number[], newColour: number[], radius: number)
    {
        var pixels = image.data;
        var width = image.width;
        var height = image.height;

        var output = document.createElement('canvas');
        output.width = image.width;
        output.height = image.height;
        var outputImage = output.getContext('2d')!.getImageData(0, 0, output.width, output.height);
        var outputPixels = outputImage.data;
        var stride = image.width * 4;
    
        for (var x=0; x<width; x++)
        {
            for (var y=0; y < height; y++)
            {
                var index = (y * image.width + x) * 4;
                let distanceFromEdge = CanvasFilter._MatchingRadius(pixels, index, stride, originalColour, radius);
                let colourScale = (distanceFromEdge < 2) ? 0 : distanceFromEdge / radius;

                outputPixels[index+0] = newColour[0] * colourScale + pixels[index+0] * (1-colourScale);
                outputPixels[index+1] = newColour[1] * colourScale + pixels[index+1] * (1-colourScale);
                outputPixels[index+2] = newColour[2] * colourScale + pixels[index+2] * (1-colourScale);
                outputPixels[index+3] = newColour[3] * colourScale + pixels[index+3] * (1-colourScale);
            }
        }
        return outputImage;
    }

    static _GetFillPatternPixel( x: number, y: number, edge: boolean, pixels: Uint8ClampedArray, index: number) : [number,number,number,number]
    {
        const patternColour = pixels[index];

        if (edge)
        {
            return [patternColour, patternColour, patternColour, 255];
        }

        if (patternColour !== 255)
        {
            const normalizedPatternColour = patternColour / 255.0;

            // Magic numbers
            let patternSize = Math.floor(10 * (1-normalizedPatternColour/2));

            const value = (x % patternSize === 0) || (y % patternSize === 0) ? patternColour : 255;
            return [value,value,value,255];
        }
        else
        {
            return [255,255,255,255];
        }
    }

    private static _ColoursAreEqualByIndex(pixels: Uint8ClampedArray, index1: number, index2: number)
    {
        return (
            pixels[index1+0] === pixels[index2+0] &&
            pixels[index1+1] === pixels[index2+1] &&
            pixels[index1+2] === pixels[index2+2] &&
            pixels[index1+3] === pixels[index2+3]
        );
    }

    private static _IsEdge(pixels: Uint8ClampedArray, index: number, stride: number): boolean
    {
        return (!this._ColoursAreEqualByIndex(pixels, index, index+4) ||
                !this._ColoursAreEqualByIndex(pixels, index, index-4) ||
                !this._ColoursAreEqualByIndex(pixels, index, index-stride*4) ||
                !this._ColoursAreEqualByIndex(pixels, index, index+stride*4));
    }

    static ReplacePattern(image: ImageData)
    {
        var pixels = image.data;
        var width = image.width;
        var height = image.height;

        let output = document.createElement('canvas');
        output.width = image.width;
        output.height = image.height;
        let outputImage = output.getContext('2d')!.getImageData(0, 0, output.width, output.height);
        let outputPixels = outputImage.data;

        for (var x=0; x<width; x++)
        {
            for (var y=0; y < height; y++)
            {
                var index = (y * image.width + x) * 4;

                const edge = CanvasFilter._IsEdge(pixels, index, width);
                let newColour = CanvasFilter._GetFillPatternPixel(x, y, edge, pixels, index)

                outputPixels[index+0] = newColour[0];
                outputPixels[index+1] = newColour[1];
                outputPixels[index+2] = newColour[2];
                outputPixels[index+3] = newColour[3];
            }
        }
        return outputImage;
    }
}
