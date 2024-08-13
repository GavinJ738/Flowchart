"use strict";
var addNode = (mousePos, id) => { };
document.addEventListener("DOMContentLoaded", function () {
    var draw = SVG().addTo('body').size('100%', '100%').id('mainCanvas');
    document.getElementsByTagName('svg')[0];
    addNode = (mousePos, id) => {
        var pos = draw.point(mousePos.x, mousePos.y);
        switch (id) {
            case "normRect":
                new RectNode(pos.x - 50, pos.y - 50, { fill: '#fff', type: NodeType.Dialogue }, draw);
                break;
            case "redRect":
                new RectNode(pos.x - 50, pos.y - 50, { fill: '#ed1a36', type: NodeType.Event }, draw);
                break;
            case "blueRect":
                new RectNode(pos.x - 50, pos.y - 50, { fill: '#561aed', type: NodeType.Start }, draw);
                break;
        }
    };
    const svgElement = document.getElementById('mainCanvas');
    if (svgElement == null) {
        console.error("Element with mainCanvas id not found");
        return;
    }
    svgElement.setAttribute('preserveAspectRatio', 'xMaxYMin slice');
    let isPanning = false;
    let spaceDown = false;
    let startPoint = { x: 0, y: 0 };
    let startViewBox = draw.viewbox({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000
    });
    const pattern = draw.pattern(50, 50, function (add) {
        add.rect(50, 50).fill('none').stroke({ color: 'gray', width: 0.5 });
    });
    const grid = draw.rect("100%", "100%").fill(pattern).move(0, 0);
    draw.on('mousedown', (e) => {
        isPanning = spaceDown;
        if (!isPanning)
            return;
        startPoint = { x: e.clientX, y: e.clientY };
        startViewBox = draw.viewbox();
    });
    draw.on('mousemove', (e) => {
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
        const bbox = svgElement.getBoundingClientRect();
        const width = bbox.width;
        const height = bbox.height;
        draw.viewbox(newViewBox);
        grid.size("100%", "100%").move(newViewBox.x, newViewBox.y);
    });
    draw.on('mouseup', () => {
        isPanning = false;
    });
    draw.on('mouseleave', () => {
        isPanning = false;
        draw.style('cursor', 'grab');
    });
    // Adjust rectangle size on initial load
    const resizeRect = () => {
        const viewBox = draw.viewbox();
        const bbox = svgElement.getBoundingClientRect();
        const width = bbox.width;
        const height = bbox.height;
        grid.size("100%", "100%").move(0, 0);
    };
    window.addEventListener('resize', resizeRect);
    resizeRect();
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
        draw.viewbox({
            x: draw.viewbox().x,
            y: draw.viewbox().y,
            width: zoom,
            height: zoom
        });
    });
    for (var i = 0; i < 1; i++) {
        for (var j = 0; j < 5; j++) {
            //var rect = new RectNode(i * 200, j * 50, draw);
        }
    }
});
