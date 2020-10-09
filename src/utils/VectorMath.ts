class Point2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class VectorMath {
    static RotatePoint(x: number, y: number, angle: number) {
        var newX = x * Math.cos(angle) - y * Math.sin(angle);
        var newY = x * Math.sin(angle) + y * Math.cos(angle);
        return new Point2D(newX, newY);
    }

    static GetBoundingBoxOfPoints(points: Point2D[]) {
        var min = new Point2D(0, 0);
        var max = new Point2D(0, 0);
        for (let point of points) {
            if (point.x < min.x) {
                min.x = point.x;
            }
            if (point.x > max.x) {
                max.x = point.x;
            }
            if (point.y < min.y) {
                min.y = point.y;
            }
            if (point.y > max.y) {
                max.y = point.y;
            }
        }

        return { x: min.x, y: min.y, width: max.x - min.x, height: max.y - min.y };
    }

    static GetRotatedBoundingBox(width: number, height: number, rotation: number) {
        var corners = [
            VectorMath.RotatePoint(width / 2, height / 2, rotation),
            VectorMath.RotatePoint(-width / 2, height / 2, rotation),
            VectorMath.RotatePoint(width / 2, -height / 2, rotation),
            VectorMath.RotatePoint(-width / 2, -height / 2, rotation),
        ];

        return VectorMath.GetBoundingBoxOfPoints(corners);
    }
}
