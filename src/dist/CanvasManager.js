"use strict";
var canvasManager;
document.addEventListener("DOMContentLoaded", function () {
    canvasManager = new CanvasManager();
});
class CanvasManager {
    constructor() {
        console.log("Test");
        this.draw = SVG().addTo('body').size('100%', '100%').id('mainCanvas');
        this.CanvasElemInit();
        this.CanvasMovementInit();
        window.addEventListener('resize', this.ResizeRect);
        this.ResizeRect();
    }
    CanvasMovementInit() {
        let isPanning = false;
        let spaceDown = false;
        let startPoint = { x: 0, y: 0 };
        let startViewBox = this.draw.viewbox({
            x: 0,
            y: 0,
            width: 1000,
            height: 1000
        });
        this.draw.on('mousedown', (e) => {
            isPanning = spaceDown;
            if (!isPanning)
                return;
            startPoint = { x: e.clientX, y: e.clientY };
            startViewBox = this.draw.viewbox();
        });
        this.draw.on('mousemove', (e) => {
            if (!isPanning)
                return;
            const dx = startPoint.x - e.clientX;
            const dy = startPoint.y - e.clientY;
            const newViewBox = {
                x: startViewBox.x + dx,
                y: startViewBox.y + dy,
                width: startViewBox.width,
                height: startViewBox.height
            };
            this.draw.viewbox(newViewBox);
            this.grid.size("100%", "100%").move(newViewBox.x, newViewBox.y);
        });
        this.draw.on('mouseup', () => {
            isPanning = false;
        });
        this.draw.on('mouseleave', () => {
            isPanning = false;
            this.draw.style('cursor', 'grab');
        });
        document.addEventListener('keydown', (e) => {
            if (e.code === "Space") {
                spaceDown = true;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === "Space") {
                spaceDown = false;
            }
        });
        var zoom = 1000;
        var zoomSpeed = 50;
        document.addEventListener('wheel', (event) => {
            const deltaY = event.deltaY;
            const directionY = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';
            if (deltaY > 0) {
                zoom += zoomSpeed;
            }
            else if (deltaY < 0) {
                zoom -= zoomSpeed;
            }
            this.draw.viewbox({
                x: this.draw.viewbox().x,
                y: this.draw.viewbox().y,
                width: zoom,
                height: zoom
            });
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
        const pattern = this.draw.pattern(50, 50, function (add) {
            add.rect(50, 50).fill('none').stroke({ color: 'gray', width: 0.5 });
        });
        this.grid = this.draw.rect("100%", "100%").fill(pattern).move(0, 0);
    }
    //Adds a node to the canvas
    AddNode(mousePos, id) {
        var pos = this.draw.point(mousePos.x, mousePos.y);
        switch (id) {
            case "normRect":
                new RectNode(pos.x - 50, pos.y - 50, { fill: '#fff', type: NodeType.Dialogue }, this.draw);
                break;
            case "redRect":
                new RectNode(pos.x - 50, pos.y - 50, { fill: '#ed1a36', type: NodeType.Event }, this.draw);
                break;
            case "blueRect":
                new RectNode(pos.x - 50, pos.y - 50, { fill: '#561aed', type: NodeType.Start }, this.draw);
                break;
        }
    }
    ResizeRect() {
        //const viewBox = this.draw.viewbox();
        //const bbox = svgElement.getBoundingClientRect();
        //const width = bbox.width;
        //const height = bbox.height;
        this.grid.size("100%", "100%").move(0, 0);
    }
}
