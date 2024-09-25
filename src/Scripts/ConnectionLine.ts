enum Direction {
    Up,
    Right,
    Down,
    Left
}
//A line connection two connection nodes
class ConnectionLine {
    lineSVG: any
    originConnectionNode: ConnectionNode | null = null
    toConnectionNode: ConnectionNode | null = null
    dir: Direction = Direction.Up
    arrowShape: any

    constructor(parent: any, direction: Direction) {

        this.dir = direction;

        const pathData = this.genPathHoriz(0, 0, 0, 0);
        this.lineSVG = parent.path(pathData).addClass("connectionLine").fill('none').stroke({ width: 2, color: 'black' });
        this.lineSVG.click(() => {
            console.log("Line clicked");
            this.destroy();
        })
    }

    public destroy() {
        if (this.lineSVG) {
            this.lineSVG.remove();
        }
        if (this.arrowShape) {
            this.arrowShape.remove();
        }

        this.originConnectionNode?.removeLine(this)
        this.toConnectionNode?.removeLine(this)
    }

    public updatePositions() {

        var bbox = this.originConnectionNode?.circle.bbox();
        var toPosition = this.toConnectionNode?.circle.rbox(this.lineSVG)

        //console.log([[this.toConnectionNode?.circle.cx, this.toConnectionNode?.circle.cy], [toPosition.cx, toPosition.cy]])
        var pos = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, toPosition.cx, toPosition.cy]

        if (this.dir == Direction.Up || this.dir == Direction.Down) {
            if (this.dir == Direction.Down) {
                pos[3] -= 20;
            } else {
                pos[3] += 20;
            }
            this.lineSVG.plot(this.genPathVert(pos[0], pos[1], pos[2], pos[3]));
        } else if (this.dir == Direction.Left) {
            pos[2] += 20;
            this.lineSVG.plot(this.genPathHoriz(pos[2], pos[3], pos[0], pos[1]));

        } else {
            pos[2] -= 20;
            this.lineSVG.plot(this.genPathHoriz(pos[0], pos[1], pos[2], pos[3]));

        }


        //this.lineSVG.plot([[this.lineSVG.x1, this.lineSVG.y1], [toPosition.cx, toPosition.cy]])
        //console.log(this.originConnectionNode)
    }

    public genPathHoriz(startX: number, startY: number, endX: number, endY: number) {
        // M
        var AX = startX;
        var AY = startY;

        // L
        var BX = Math.abs(endX - startX) * 0.05 + startX;
        var BY = startY;

        // C
        var CX = startX + Math.abs(endX - startX) * 0.33;
        var CY = startY;
        var DX = endX - Math.abs(endX - startX) * 0.33;
        var DY = endY;
        var EX = - Math.abs(endX - startX) * 0.05 + endX;
        var EY = endY;

        // L
        var FX = endX;
        var FY = endY;

        // setting up the path string
        var path = 'M' + AX + ',' + AY;
        path += ' L' + BX + ',' + BY;
        path += ' ' + 'C' + CX + ',' + CY;
        path += ' ' + DX + ',' + DY;
        path += ' ' + EX + ',' + EY;
        path += ' L' + FX + ',' + FY;

        return path;


    }
    public genPathVert(startX: number, startY: number, endX: number, endY: number): string {
        // M
        var AX = startX;
        var AY = startY;

        // Determine the horizontal and vertical distances
        var deltaX = endX - startX;
        var deltaY = endY - startY;

        // L
        var BX = startX;
        var BY = startY + deltaY * 0.05;

        // C
        var CX = startX;
        var CY = startY + deltaY * 0.33;
        var DX = endX;
        var DY = endY - deltaY * 0.33;
        var EX = endX;
        var EY = endY - deltaY * 0.05;

        // L
        var FX = endX;
        var FY = endY;

        // Setting up the path string
        var path = `M${AX},${AY}`;
        path += ` L${BX},${BY}`;
        path += ` C${CX},${CY}`;
        path += ` ${DX},${DY}`;
        path += ` ${EX},${EY}`;
        path += ` L${FX},${FY}`;

        return path;
    }
}