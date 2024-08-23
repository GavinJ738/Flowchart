"use strict";
class Saving {
    constructor() { }
    static load(canvas) {
        window.electronAPI.loadJson();
        window.electronAPI.onLoadJsonReply((data) => {
            data["nodeData"].forEach((node) => {
                //First create all nodes
                const position = {
                    x: node["position"]["x"] + 50,
                    y: node["position"]["y"] + 50,
                };
                canvas.SpawnNode(position, node["type"]);
                canvas.rectNodes[canvas.rectNodes.length - 1].setText(node["topText"], node["bottomText"]);
            });
            //Then connect them
            for (var i = 0; i < canvas.rectNodes.length; i++) {
                const node = canvas.rectNodes[i];
                console.log(node);
                const nodeData = data["nodeData"][i];
                nodeData["outgoingConnections"].forEach((connection) => {
                    node.connectionNodes[connection["originConnectionNode"]].spawnConnectionLine();
                    if (ConnectionNode.activeConnectionNode.connectionLine) {
                        const destinationConnectionNode = canvas.rectNodes[connection["destinationNodeID"]].connectionNodes[connection["destinationConnectionNode"]];
                        ConnectionNode.activeConnectionNode.connectionLine.toConnectionNode = canvas.rectNodes[connection["destinationNodeID"]].connectionNodes[connection["destinationConnectionNode"]];
                        destinationConnectionNode.towardConnectionLines.push(ConnectionNode.activeConnectionNode.connectionLine);
                        ConnectionNode.activeConnectionNode.originConnectionLines.push(ConnectionNode.activeConnectionNode.connectionLine);
                        destinationConnectionNode.createArrow();
                        console.log(destinationConnectionNode);
                    }
                });
            }
            canvas.rectNodes.forEach(node => {
                node.connectionNodes.forEach(n => {
                    n.updatePositions();
                });
            });
        });
    }
    static save(startNode) {
        this.getNodeTree(startNode);
    }
    static getNodeTree(startNode) {
        var visitedNodeIDs = [];
        var queue = [startNode];
        var allJsonNodeData = [];
        while (queue.length != 0) {
            var currNode = queue.shift();
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
            var type = currNode.type;
            var topText = currNode.shape.find(".topText")[0].node.value;
            var bottomText = currNode.shape.find(".bottomText")[0].node.value;
            var outgoingConnections = [];
            console.log(topText);
            //Add to json
            console.log(`ID: ${currNode.id}`);
            currNode.connectionNodes.forEach(connectionNode => {
                //console.log(connectionNode)
                connectionNode.originConnectionLines.forEach(connectionLine => {
                    var _a, _b;
                    //console.log(connectionLine)
                    if (((_a = connectionLine.toConnectionNode) === null || _a === void 0 ? void 0 : _a.parent) != undefined) {
                        queue.push((_b = connectionLine.toConnectionNode) === null || _b === void 0 ? void 0 : _b.parent);
                        outgoingConnections.push({
                            originConnectionNode: connectionNode.side,
                            destinationConnectionNode: connectionLine.toConnectionNode.side,
                            destinationNodeID: connectionLine.toConnectionNode.parent.id,
                        });
                        //console.log(`Added: ${connectionLine.toConnectionNode?.parent.id}`);
                    }
                    else {
                        //console.log("Undefined");
                    }
                });
            });
            var json = {
                "id": currNode.id,
                "position": pos,
                "type": type,
                "topText": topText,
                "bottomText": bottomText,
                "outgoingConnections": outgoingConnections
            };
            allJsonNodeData.push(json);
        }
        //All done looping though all nodes
        var jsonData = {
            "nodeData": allJsonNodeData
        };
        console.log(JSON.stringify(jsonData, null, 2));
        window.electronAPI.saveJson(jsonData);
        window.electronAPI.onSaveJsonReply((status) => {
            if (status === 'success') {
                console.log('JSON file saved successfully!');
            }
            else {
                console.error('Failed to save JSON file.');
            }
        });
    }
}
