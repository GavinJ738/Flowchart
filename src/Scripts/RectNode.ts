declare var SVG: any;
interface Position {
    x: number;
    y: number;
};
enum NodeType {
    Dialogue,
    Event,
    Start
}
interface RectParams {
    fill: string;
    type: NodeType;
}
interface ConnectionLineSaveData {
    originConnectionNode: Direction;
    destinationConnectionNode: Direction;
    destinationNodeID: number;
}
class RectNode {
    static idInc: number = 0
    id: number = 0
    x: number;
    y: number;
    isDragging: boolean;
    offsetX: number = 0;
    offsetY: number = 0;
    width: number;
    height: number;
    shape: any
    lastClick: Position;
    box: typeof SVG.Box;
    type: NodeType = NodeType.Dialogue;

    writingEnabled: boolean = false
    connectionNodes: ConnectionNode[] = []

    constructor(x: number, y: number, rectParams: RectParams, draw: any) {
        this.id = RectNode.idInc++;
        this.box = new SVG.Box();

        this.x = x;
        this.y = y;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetX = 0;

        this.width = 100;
        this.height = 100;
        this.lastClick = {
            x: 0,
            y: 0
        }

        this.shape = draw.nested();
        this.shape.size(100, 100);
        var rect = this.shape.rect(this.width, this.height);
        rect.attr({
            x: '0',
            y: '0',
            fill: rectParams.fill,
            stroke: '#000',
            rx: `${this.width / 10}`
        })
        this.connectionNodes.push(new ConnectionNode(this, "50%", "0%", Direction.Up));
        this.connectionNodes.push(new ConnectionNode(this, "100%", "50%", Direction.Right));
        this.connectionNodes.push(new ConnectionNode(this, "50%", "100%", Direction.Down));
        this.connectionNodes.push(new ConnectionNode(this, "0%", "50%", Direction.Left));
        this.shape.move(x, y);
        this.setUpDrag(rect, this.connectionNodes, draw);
        this.type = rectParams.type;
        if (rectParams.type == NodeType.Start) {
            rect.click(() => {
                console.log("Clicked");
                this.getNodeTree();
            });
        }

        this.addBoxOverlay()




    }
    getNodeTree() {
        var visitedNodeIDs: number[] = []
        var queue: RectNode[] = [this]

        var allJsonNodeData = []
        while (queue.length != 0) {
            var currNode = queue.shift()
            if (currNode == null) {
                //console.log("null")
                continue;
            }
            if (visitedNodeIDs.includes(currNode.id)) {
                //console.log("loop back");
                continue;
            }
            visitedNodeIDs.push(currNode.id);

            //Data saving
            var pos = { x: currNode.shape.x(), y: currNode.shape.y() };
            var type: NodeType = currNode.type;
            var topText: String = currNode.shape.find(".topText")[0].node.value;
            var bottomText: String = currNode.shape.find(".bottomText")[0].node.value;
            var outgoingConnections: ConnectionLineSaveData[] = [];



            console.log(topText);
            //Add to json
            console.log(`ID: ${currNode.id}`);

            currNode.connectionNodes.forEach(connectionNode => {
                //console.log(connectionNode)
                connectionNode.originConnectionLines.forEach(connectionLine => {

                    //console.log(connectionLine)
                    if (connectionLine.toConnectionNode?.parent != undefined) {
                        queue.push(connectionLine.toConnectionNode?.parent);
                        outgoingConnections.push({
                            originConnectionNode: connectionNode.side,
                            destinationConnectionNode: connectionLine.toConnectionNode.side,
                            destinationNodeID: connectionLine.toConnectionNode.parent.id,
                        })
                        //console.log(`Added: ${connectionLine.toConnectionNode?.parent.id}`);
                    } else {
                        //console.log("Undefined");
                    }
                });
            });


            var json = {
                "position": pos,
                "type": type,
                "topText": topText,
                "bottomText": bottomText,
                "outgoingConnections": outgoingConnections
            }
            allJsonNodeData.push(json);
        }

        //All done looping though all nodes
        var jsonData = {
            "nodeData": allJsonNodeData
        }
        console.log(JSON.stringify(jsonData, null, 2));
        window.electronAPI.saveJson(jsonData);
        window.electronAPI.onSaveJsonReply((status) => {
            if (status === 'success') {
                console.log('JSON file saved successfully!');
            } else {
                console.error('Failed to save JSON file.');
            }
        });

    }

    setUpDrag(rect: any, connectionNodes: ConnectionNode[], draw: any) {
        rect.draggable();

        rect.on('dragstart.namespace', (event: any) => {
            this.box = new SVG.Box(this.shape.x(), this.shape.y(), this.width, this.height);
            this.lastClick = {
                x: event.detail.event.pageX,
                y: event.detail.event.pageY
            }
            // event.detail.event hold the given data explained below
            // this == rect
            //var box = draw.viewbox();
            //console.log(event);
            //this.offsetX = event.detail.handler.lastClick.x + box.x;
            //this.offsetY = event.detail.handler.lastClick.y + box.y;
        })

        rect.on('dragmove.namespace', (e: any) => {
            e.preventDefault()

            const currentClick = {
                x: e.detail.event.pageX,
                y: e.detail.event.pageY
            }
            const viewBox = draw.viewbox();
            const scale = viewBox.width / window.innerWidth;
            const dx = (currentClick.x - this.lastClick.x) * scale;
            const dy = (currentClick.y - this.lastClick.y) * scale;


            const x = this.box.x + dx
            const y = this.box.y + dy
            this.lastClick = currentClick

            this.box = new SVG.Box(x, y, this.box.w, this.box.h);
            this.shape.move(x, y)

            connectionNodes.forEach(connectionNode => {
                connectionNode.updatePositions();
            });
        })
    }
    //Adds the text areas, dividers, and buttons
    addBoxOverlay() {



        this.shape.svg(
            `<foreignObject style="
            height: 20%;
            width: 100%;
            transform: translate(0px, 5px);
        "
        class="toggableObject"
        ><textarea class="topText" style="
            height: 100%;
            width: 100%;
            overflow: hidden;
        " type="text"></textarea>
        </foreignObject>`)

        this.shape.line(10, 25, 90, 25).stroke({ width: 2, color: "black" })
        this.shape.svg(
            `<foreignObject style="
            height: 55%;
            transform: translate(0px, 35px);
            width: 100%;
        "
        class="toggableObject"
        ><textarea class="bottomText" style="
            height: 100%;
            width: 100%;
            overflow: hidden;
        " type="text"></textarea>
        </foreignObject>`)

        this.shape.svg(`
            <svg width="10" height="10" class="editButton">
            <path xmlns="http://www.w3.org/2000/svg" d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" transform="scale(0.019) translate(4000, 1100)"
            />
            <rect width="16" height="16" transform="translate(76, 4)"
            style="fill: transparent;"></rect>
            </svg>
            `)
        var editButtonSVG = this.shape.find('.editButton')[0]
        console.log(editButtonSVG);
        editButtonSVG.node.addEventListener("pointerdown", () => {
            console.log("Clicked");
            if (!this.writingEnabled) {
                this.enablePointerEvents()
            } else {
                this.disablePointerEvents()
            }

            this.writingEnabled = !this.writingEnabled
            console.log(editButtonSVG.children()[0])
            editButtonSVG.children()[0].toggleClass("red")
        }, { passive: true });


        this.disablePointerEvents();
    }

    public getScaleFactor(svg: any) {
        const viewBox = svg.viewbox();
        const svgWidth = svg.node.clientWidth;
        const svgHeight = svg.node.clientHeight;
        const scaleX = svgWidth / viewBox.width;
        const scaleY = svgHeight / viewBox.height;

        return { x: scaleX, y: scaleY };
    };

    disablePointerEvents() {
        const collection = document.getElementsByClassName("toggableObject");
        for (var i = 0; i < collection.length; i++) {
            collection[i].classList.add("disablePointerEvents")
        }
    }

    enablePointerEvents() {
        const collection = document.getElementsByClassName("toggableObject");
        for (var i = 0; i < collection.length; i++) {
            collection[i].classList.remove("disablePointerEvents")
        }
    }

}