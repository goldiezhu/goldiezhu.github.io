/**
 * Code for finding which node is hovered over.
 */
HIDDEN_SANKEY = "sankey-hover";
SANKEY_HOVER_COLOR = "#AABBCC"

/**
 * inLegend(unisankey, set, x, y)
 * Return 1 if position (x, y) is within this set's legend.
 *
 * unisankey:   The UniSankey containing nodes and their positions.
 * set:         The set of keys and their heights.
 * x:           The x-coordinate that's being hovered over.
 * y:           The y-coordinate that's being hovered over.
 */
function inLegend(unisankey, set, x, y){
    var canvas = document.getElementById(HIDDEN_SANKEY);
    var context = canvas.getContext('2d');
    context.fillStyle = SANKEY_HOVER_COLOR;

    var name = set.name;
    var legend_y = set.legend_y;

    context.font = FONT_TYPE;
    context.textBaseline = "middle";
    context.textAlign = "center";

    context.clearRect(0, 0, canvas.width, canvas.height);
    unisankey.drawLegend(HIDDEN_SANKEY, SANKEY_HOVER_COLOR, name, legend_y);
    
    if (isHoveredOver(canvas, x, y)){
        return 1;
    }

    return 0;
}


/**
 * getActiveNode(unisankey, set, x, y)
 * Return the UniSankeyNode that contains the coordinates (x, y)
 *
 * unisankey:   The UniSankey containing nodes and their positions.
 * set:         The set of keys and their heights.
 * x:           The x-coordinate that's being hovered over.
 * y:           The y-coordinate that's being hovered over.
 */
function getActiveNode(unisankey, set, x, y){
    var canvas = document.getElementById(HIDDEN_SANKEY);
    var context = canvas.getContext('2d');
    context.fillStyle = SANKEY_HOVER_COLOR;

    // Go through each node
    for (var i = 0; i < unisankey.nodes.length; i ++){
        for (var j = 0; j < unisankey.nodes[i].length; j++){
            context.clearRect(0, 0, canvas.width, canvas.height);
            var current_node = unisankey.nodes[i][j];
            if (EDITING == true || current_node.is_hidden == 0){
                var height = set.set[current_node.key][0];
                if (current_node.type == 'percent' && EDITING == false){
                    height = height * PERCENT_NODE_SCALING;
                }
                var node_x = current_node.x;
                var node_y = current_node.y;
                drawNode(height, node_x, node_y, context);

                // If the node is hovered over, return it.
                // Assumption: Only one node/key is hovered over at a time.
                if (isHoveredOver(canvas, x, y)){
                    return current_node;
                }
            }
        }
    }

    return 0;
}

/**
 * Draw a node at a given height.
 * Used in getActiveNode() to test whether a node is active/hovered over
 * or not.
 */
function drawNode(height, x, y, context){
    if (height == 0){
        return;
    }
    var top_corner = y - height * MAX_HEIGHT / 2;

    // Draw the node (rectangle)
    context.beginPath();
    context.rect(x, top_corner, WIDTH, MAX_HEIGHT * height);
    context.stroke();
    context.fill();
}