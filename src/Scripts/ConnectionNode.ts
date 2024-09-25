class ConnectionNode {
    isDragging: boolean = false
    parent: RectNode
    connectionLine: ConnectionLine | null = null
    //Toward connection line is a connection line not originating from this node so it is pointing towards this node
    towardConnectionLines: Array<ConnectionLine> = []
    static activeConnectionNode: ConnectionNode
    static connectionNodeConnected: boolean = false
    circle: any
    //Connection lines originating from this node
    originConnectionLines: Array<ConnectionLine> = []
    side: Direction;

    xpos: string = ""
    ypos: string = ""
    constructor(parent: RectNode, xpos: string, ypos: string, side: Direction) {
        this.parent = parent;
        this.side = side
        this.circle = parent.shape.circle(20).addClass("connectionNode").attr({ cx: xpos, cy: ypos });

        this.xpos = xpos;
        this.ypos = ypos;

        this.circle.on('mousedown', (e: any) => {
            this.createConnectionLine();
        }, true)

        document.addEventListener('mouseup', () => {
            if (this.connectionLine && this.isDragging) {
                if (!ConnectionNode.connectionNodeConnected) {
                    this.connectionLine.destroy()
                    this.connectionLine = null
                } else {
                    ConnectionNode.connectionNodeConnected = false
                }
            }
            this.isDragging = false;
        })
        this.circle.on('mouseup', (e: any) => {

            if (ConnectionNode.activeConnectionNode && ConnectionNode.activeConnectionNode != this) {
                ConnectionNode.connectionNodeConnected = true;
                if (ConnectionNode.activeConnectionNode.connectionLine) {
                    ConnectionNode.activeConnectionNode.connectionLine.toConnectionNode = this
                    this.towardConnectionLines.push(ConnectionNode.activeConnectionNode.connectionLine);
                    ConnectionNode.activeConnectionNode.originConnectionLines.push(ConnectionNode.activeConnectionNode.connectionLine)
                    ConnectionNode.activeConnectionNode.connectionLine.arrowShape = this.createArrow();
                    console.log(ConnectionNode.activeConnectionNode.connectionLine.arrowShape);
                    ConnectionNode.activeConnectionNode.connectionLine.updatePositions();
                }
                //this.towardConnectionLine = ConnectionNode.activeConnectionNode.connectionLine
            }
        })
    }
    createConnectionLine() {
        this.isDragging = true;
        this.connectionLine = new ConnectionLine(this.parent.shape, this.side)
        this.connectionLine.originConnectionNode = this;
        //this.connectionLine.lineSVG = this.parent.shape.line(0, 0, 0, 0).stroke({ color: '#f06', width: 10, linecap: 'round' });
        //this.connectionLine?.lineSVG.attr({ x1: "100%", y1: "50%", x2: "100%", y2: "50%" })
        ConnectionNode.activeConnectionNode = this;
        const mainCanvas = document.getElementById("mainCanvas");
        if (mainCanvas == null) {
            return;
        }
        mainCanvas.onmousemove = (event) => {
            if (this.connectionLine && this.isDragging) {
                var bbox = this.circle.bbox();

                const clickPoint = this.parent.shape.point(event.clientX, event.clientY)
                this.connectionLine.lineSVG.plot(this.connectionLine.genPathHoriz(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, clickPoint.x, clickPoint.y));
                //this.connectionLine.lineSVG.attr({ x2: clickPoint.x, y2: clickPoint.y })
            }
        }
    }

    spawnConnectionLine() {
        this.connectionLine = new ConnectionLine(this.parent.shape, this.side)
        this.connectionLine.originConnectionNode = this;
        ConnectionNode.activeConnectionNode = this;
    }

    //Called when the connection node gets moved so it can update the position of its connected lines
    public updatePositions() {
        this.towardConnectionLines.forEach(line => {
            line.updatePositions();
        });
        this.originConnectionLines.forEach(line => {
            line.updatePositions();
        });

        if (this.connectionLine) {
            //this.connectionLine.updatePositions();
            //this.connectionLine.lineSVG.plot([this.connectionLine.lineSVG.array()[0], [0, 0]]);
        }
    }

    createArrow() {
        var rotation: string = "0"
        switch (this.side) {
            case Direction.Up:
                rotation = "180"
                break;
            case Direction.Left:
                rotation = "90"
                break;
            case Direction.Down:
                rotation = "0";
                break;
            case Direction.Right:
                rotation = "270";
                break;
        }

        this.parent.shape.svg(`<svg class="arrow arrowSVG" x="${this.xpos}" y="${this.ypos}" viewBox="0 0 500 500" >
            	<polygon class="arrow" points="-50,50 50,50 0,-50" fill="black" stroke="black" stroke-width="2" style="
    transform: rotate(${rotation}deg) translate(0px, 50px);
"></polygon>
        </svg>`);
        var elems = this.parent.shape.node.getElementsByClassName("arrowSVG");
        return elems[elems.length - 1];

    }

    public delete() {
        this.towardConnectionLines.forEach(line => {

            line.destroy();
        });
        this.originConnectionLines.forEach(line => {
            line.destroy();
        });
    }

    public removeLine(line: ConnectionLine) {
        this.towardConnectionLines.splice(this.towardConnectionLines.indexOf(line), 1)
        this.originConnectionLines.splice(this.originConnectionLines.indexOf(line), 1)
    }
}