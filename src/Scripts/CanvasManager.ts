declare var SVG: any;
var canvasManager: CanvasManager
document.addEventListener("DOMContentLoaded", function () {
    canvasManager = new CanvasManager();
});

class CanvasManager {
    //I will need to change how this works in the future
    static startNode: RectNode
    static instance: CanvasManager
    draw: any
    grid: any
    rectNodes: RectNode[] = []

    clickAwayListener: any = null
    clickAwayListenerRecieved: boolean = false

    constructor() {
        console.log("Test");
        this.draw = SVG().addTo('body').size('100%', '100%').id('mainCanvas');
        this.CanvasElemInit();
        this.CanvasMovementInit();

        window.addEventListener('resize', this.ResizeRect);
        this.ResizeRect();
    }
    CanvasMovementInit() {
        CanvasManager.instance = this
        let isPanning = false;
        let spaceDown = false;
        let startPoint = { x: 0, y: 0 };
        let startViewBox = this.draw.viewbox({
            x: 0,
            y: 0,
            width: 1000,
            height: 1000
        });

        this.draw.on('mousedown', (e: any) => {
            isPanning = spaceDown;
            if (!isPanning) return;
            startPoint = { x: e.clientX, y: e.clientY };
            startViewBox = this.draw.viewbox();
        });

        this.draw.on('mousemove', (e: any) => {
            if (!isPanning) return;
            const dx = startPoint.x - e.clientX;
            const dy = startPoint.y - e.clientY;
            const zoomScaling = startViewBox.width / 1000.0;
            const newViewBox = {
                x: startViewBox.x + dx * zoomScaling,
                y: startViewBox.y + dy * zoomScaling,
                width: startViewBox.width,
                height: startViewBox.height
            };


            this.draw.viewbox(newViewBox);
            this.grid.size("100%", "100%").move(newViewBox.x, newViewBox.y);
        });

        this.draw.on('mouseup', () => {
            isPanning = false;

            //For clicking away from text input
            if (this.clickAwayListener != null) {
                if (!this.clickAwayListenerRecieved) {
                    this.clickAwayListener.unfocus()
                    this.clickAwayListener = null
                }
            }
            this.clickAwayListenerRecieved = false
        });

        this.draw.on('mouseleave', () => {
            isPanning = false;
            this.draw.style('cursor', 'grab');
        });


        document.addEventListener('keydown', (e) => {
            if (e.code === "Space") {
                spaceDown = true;
            }
        })
        document.addEventListener('keyup', (e) => {
            if (e.code === "Space") {
                spaceDown = false;
            }
        })

        var zoom: number = 1000
        var zoomSpeed: number = 1.05
        document.addEventListener('wheel', (event: WheelEvent) => {

            const deltaY = event.deltaY;
            const directionY = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';

            // Get the current mouse position
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            // Convert mouse position to SVG coordinates
            const point = this.draw.point(mouseX, mouseY);

            var zoomChange = zoomSpeed;
            // Calculate the new zoom level
            if (deltaY < 0) {
                zoomChange = 1 / zoomSpeed;
            }

            // Ensure zoom doesn't go below a minimum value
            //zoom = Math.max(0, zoom);

            console.log((zoom / (zoom - zoomSpeed)))
            // Calculate the new viewbox position
            const viewbox = this.draw.viewbox();
            const newWidth = viewbox.width * zoomChange;
            const newHeight = viewbox.height * zoomChange;

            const dx = (viewbox.x - point.x) * (newWidth - viewbox.width) / viewbox.width;
            const dy = (viewbox.y - point.y) * (newHeight - viewbox.height) / viewbox.height;

            // Set the new viewbox with the mouse as the anchor point
            this.draw.viewbox({
                x: viewbox.x + dx,
                y: viewbox.y + dy,
                width: newWidth,
                height: newHeight
            });

            this.ResizeRect()
        });

    }
    CanvasElemInit() {
        //Setting up the aspect ratio for the canvas
        const svgElement = document.getElementById('mainCanvas');
        if (svgElement == null) {
            console.error("Element with mainCanvas id not found");
            return;
        }
        svgElement.setAttribute('preserveAspectRatio', 'xMaxYMin slice');


        const pattern = this.draw.pattern(50, 50, function (add: any) {
            add.rect(50, 50).fill('none').stroke({ color: 'gray', width: 0.5 });
        });
        this.grid = this.draw.rect("100%", "100%").fill(pattern).move(0, 0);

    }
    //Adds a node to the canvas
    public AddNode(mousePos: Position, id: string) {
        var pos = this.draw.point(mousePos.x, mousePos.y)

        switch (id) {
            case "normRect":
                this.rectNodes.push(new RectNode(pos.x - 50, pos.y - 50, { fill: '#fff', type: NodeType.Dialogue }, this.draw));
                break;
            case "redRect":
                this.rectNodes.push(new RectNode(pos.x - 50, pos.y - 50, { fill: '#ed1a36', type: NodeType.Event }, this.draw));
                break;
            case "blueRect":
                var createdNode = new RectNode(pos.x - 50, pos.y - 50, { fill: '#561aed', type: NodeType.Start }, this.draw)
                CanvasManager.startNode = createdNode
                this.rectNodes.push(createdNode);
                break;
        }
    }
    public SpawnNode(pos: Position, type: NodeType) {

        switch (type) {
            case NodeType.Dialogue:
                this.rectNodes.push(new RectNode(pos.x - 50, pos.y - 50, { fill: '#fff', type: NodeType.Dialogue }, this.draw));
                break;
            case NodeType.Event:
                this.rectNodes.push(new RectNode(pos.x - 50, pos.y - 50, { fill: '#ed1a36', type: NodeType.Event }, this.draw));
                break;
            case NodeType.Start:
                var createdNode = new RectNode(pos.x - 50, pos.y - 50, { fill: '#561aed', type: NodeType.Start }, this.draw)
                CanvasManager.startNode = createdNode
                this.rectNodes.push(createdNode);
                break;
        }
    }
    ResizeRect() {
        //const viewBox = this.draw.viewbox();
        //const bbox = svgElement.getBoundingClientRect();
        //const width = bbox.width;
        //const height = bbox.height;

        var vb = this.draw.viewbox();


        this.draw.viewbox(vb);
        this.grid.size("100%", "100%").move(vb.x, vb.y);
    }

    public reset() {
        RectNode.idInc = 0;
        this.rectNodes.forEach(node => {
            if (node) {
                node.deleteNode();
            }
        });
        this.rectNodes = []
    }
}