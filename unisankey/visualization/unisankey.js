/**
 * Code for creating a sankey diagram via function calls (and not through UI).
 * Assumptions:
 *     - Each column is created in order from top to bottom.
 *     - Each flow from a node is created in order from top to bottom.
 *     - The height is a percentage scaled from 0 - 1.0, with the drawn height
 *       being between 0 - MAX_HEIGHT
 */

var MAX_HEIGHT = 300;
var WIDTH = 300;
var RADIUS = 30;
var LINK_WIDTH = 50;
var NODE_HORIZONTAL_SPACING = WIDTH + 100;
var NODE_VERTICAL_SPACING = 80;
var FONT_TYPE = "24px sans-serif";
var FONT_COLOR = "white";

var HOVER_DIV_WIDTH = 200;

var LEGEND_WIDTH = 300;
var LEGEND_BOX_WIDTH = 50;
var LEGEND_HEIGHT = 30;
var LEGEND_PADDING = 10;

/**
 * UniSankeyNode
 * A node in a UniSankey diagram.
 * label:           The label for the node.
 * type:            The type of this node.
 *                  'boolean': When printed, it doesn't use its value.
 *                  'monetary': When printed, it's prefixed with a $.
 *                  'plain': When printed, there's no prefixing done.
 *                  'percent': When printed, there's a % appended.
 *                  'numbered': When printed, it's prefixed with its value.
 * scale:           The scaling of this node when printed.
 *                  i.e. the value to multiply by.
 * base:            The base to scale this node to when printed.
 *                  i.e. the min. value to add to this node.
 * x:               The x-coordinate of the top-left corner of this node.
 * y:               The y-coordinate of the middle baseline of this node.
 * links:           A list of UniSankeyLinks that come out of this UniSankeyNode.
 * offset:          The current y-coordinate offset for incoming UniSankeyLinks.
 * incoming_links:  The nodes that go into this UniSankeyNode.
 */
function UniSankeyNode(key, label = "", type = "boolean", scale = 1, base = 0, x = 0, y = 0, skip = -1){
    this.key = key;
    this.label = label;
    this.type = type;
    this.scale = scale;
    this.base = base;
    this.x = x;
    this.y = y;
    this.links = [];
    this.offset = 0;
    this.incoming_nodes = [];
    this.skip = skip;
    this.is_product = 0;
    this.force_y = -1;
    this.is_hidden = 0;
}

/**
 * UniSankeyNode.draw(context)
 * Draws the UniSankeyNode on the canvas using context.
 * context:     The context to draw using.
 * set:         A dictionary mapping keys to node details in the form
 *              {key: [height, [link heights]]}
 */
UniSankeyNode.prototype.draw = function(context, set){

    var height = set[this.key][0];
    if (height == 0){
        return;
    }

    var top_corner = this.y - height * MAX_HEIGHT / 2;

    // Draw the label on this node
    var temp = context.fillStyle;

    if (this.is_hidden > 0){
        return;
        context.fillStyle = getDarker(context.fillStyle, 0.3); // FONT_COLOR;
    } else {
        // Draw the node (rectangle)
        context.beginPath();
        context.rect(this.x, top_corner, WIDTH, MAX_HEIGHT * height);
        context.stroke();
        context.fill();

        context.fillStyle = getDarker(context.fillStyle, -0.3); // FONT_COLOR;
    }

    context.fillText(this.label, this.x + WIDTH / 2, this.y);
    context.fillStyle = temp;

    if (this.is_hidden > 0){
        return;
    }


    // Get the total height of all of the links
    var link_height_max = 0;
    for (var i = 0; i < this.links.length; i++){
        var cur_height = set[this.key][1][i];
        link_height_max += cur_height * MAX_HEIGHT;
    }

    current_y = this.y - link_height_max/2;

    // Draw the links that come out of this node
    for (var i = 0; i < this.links.length; i++) {
        var link_height = set[this.key][1][i];
        var current_link = this.links[i];

        var end_x = current_link.endNode.x;
        var end_y = current_link.endNode.y - 
                    (set[current_link.endNode.key][0] / 2) * MAX_HEIGHT;

        var end_bottom = end_y + set[current_link.endNode.key][0] * MAX_HEIGHT;

        current_link.draw(context, this.x + WIDTH, current_y, link_height, end_x,
            end_y, end_bottom);

        current_y += link_height * MAX_HEIGHT;
    }
}

/**
 * UniSankeyNode.addLink(link)
 * Add the UniSankeyLink link to this UniSankeyNode's links (bottom-most).
 */
UniSankeyNode.prototype.addLink = function(link){
    this.links.push(link);
}

/**
 * UniSankeyNode.addLink(link)
 * Add the UniSankeyLink link to this UniSankeyNode's links (bottom-most).
 */
UniSankeyNode.prototype.createLink = function(endNode, label = ""){
    var link = new UniSankeyLink(endNode, label);
    endNode.incoming_nodes.push(this);
    this.links.push(link);
}

/**
 * UniSankeyNode.skipNode()
 * Set this.skip to 1
 */
UniSankeyNode.prototype.skipNode = function(){
    this.skip = 1;
}

/**
 * UniSankeyNode.getContributions()
 * Return the contributors to and contributions of the current node.
 */
UniSankeyNode.prototype.getContributions = function(){
    // Get the nodes that contribute to this node
    var contributors = [];
    var incoming = this.incoming_nodes.slice();

    // Get all the nodes that we want to list along with their height.
    // TODO: Need some way to map their height to their contribution
    while (incoming.length > 0){
        var current = incoming.shift();
        if (current.skip < 0){
            var link_index = getLinkIndex(current, this);
            contributors.push([current, link_index]);
        } else {
            for (var n = 0; n < current.incoming_nodes.length; n++){
                incoming.push(current.incoming_nodes[n]);
            }
        }
    }

    // Get the nodes that this node contributes to
    var contributions = [];
    var outgoing = this.links.slice();

    // Get all the nodes that we want to list along with their height.
    // TODO: Need some way to map their height to their contribution
    while (outgoing.length > 0){
        var current = outgoing.shift().endNode;
        if (current.skip < 0){
            var link_index = getLinkIndex(this, current);
            contributions.push([current, link_index]);
        } else {
            for (var n = 0; n < current.links.length; n++){
                outgoing.push(current.links[n]);
            }
        }
    }

    return [contributors, contributions];
}

/**
 * getLinkIndex(starting_node, end_node)
 * Return the index of the link that leads from starting_node to end_node.
 *
 * Precondition: There is only one path from starting_node to end_node.
 */
function getLinkIndex(starting_node, end_node){
    // Find the link that goes from starting_node to end_node.
    // This may be a path that is p-nodes long.
    var node_path = [];
    var link_number = -1;

    // p is the link index (i.e. index in the set)
    for (var p = 0; p < starting_node.links.length; p++){
        node_path.push([p, [starting_node.links[p].endNode]]);
    }

    // Exit when we have a link_number found/
    while (link_number < 0){
        // Go through each of the paths
        for (var p = 0; p < node_path.length; p++){
            var cur_end_nodes = node_path[p][1];
            var initial_end = cur_end_nodes.length;

            for (var q = 0; q < initial_end; q++){
                var cur_end = cur_end_nodes.shift();

                // Check for a match between the current node and end_node.
                if (cur_end == end_node){
                    link_number = p;
                    return link_number;
                } else {
                    // Add all of the links that come from this node
                    for (var r = 0; r < cur_end.links.length; r++){
                        cur_end_nodes.push(cur_end.links[r].endNode);
                    }
                }
            }
        }
    }
    return link_number;
}

/**
 * UniSankeyLink
 * endNode:     The UniSankeyNode that this link leads to/ends at.
 * label:       The label for this link.
 */
function UniSankeyLink(endNode, label = ""){
    this.endNode = endNode;
    this.label = label;
}

/**
 * UniSankeyLink.draw(context, x, y)
 * Draw this link using context, with (x, y) being the top-left corner.
 * context:     The context to draw using.
 * x:           The x-coordinate of the top-left corner of this UniSankeyLink.
 * y:           The y-coordinate of the top-left corner of this UniSankeyLink.
 * height:      The height of this link from 0-1.
 * end_x:       The x-coordinate to draw to (top-left of the endnode)
 * end_y:       The y-coordinate to draw to (top-left of the endnode)
 */
UniSankeyLink.prototype.draw = function(context, x, y, height, end_x, end_y, end_node_y = -1){
    if (height == 0){
        return;
    }
    var link_height = height * MAX_HEIGHT;

    // Get the top-right corner that we want to end up at
    var orig_end_y = end_y;
    end_y = end_y + this.endNode.offset;

    if (end_y + link_height > end_node_y){;
        end_y = Math.max(end_node_y - link_height, orig_end_y);
    }

    slope = (end_y - y) / (end_x - x);
    
    // The top left point
    var arc_start_x = x;
    var arc_start_y = y;
    var arc_end_x = x + RADIUS;
    var arc_end_y = slope * (arc_end_x - arc_start_x) + arc_start_y;

    // The top right point
    var arc3_start_x = end_x - RADIUS;
    var arc3_start_y = slope * (arc3_start_x - arc_start_x) + arc_start_y;
    var arc3_end_x = end_x;
    var arc3_end_y = end_y;

    // The bottom right point
    var arc4_start_x = arc3_start_x;
    var arc4_start_y = arc3_start_y + link_height;
    var arc4_end_x = end_x;
    var arc4_end_y = end_y + link_height;

    if (arc4_end_y > end_node_y){
        arc4_start_y = (end_node_y + arc_start_y + link_height) / 2;
        arc4_end_y = end_node_y;
    }

    // The bottom left point
    var arc2_start_x = arc_start_x;
    var arc2_start_y = arc_start_y + link_height;
    var arc2_end_x = arc_end_x;
    var arc2_end_y = arc_end_y + link_height;

    // Draw the top-left arc
    context.beginPath();
    context.moveTo(arc_start_x, arc_start_y);
    context.quadraticCurveTo(arc_start_x + RADIUS/2, arc_start_y,
                             (arc_end_x+arc3_start_x)/2,
                             (arc_end_y+arc3_start_y)/2);
    

    // Draw the top-right arc
    context.quadraticCurveTo(arc3_end_x - RADIUS / 2, arc3_end_y,
                             arc3_end_x, arc3_end_y);

    // Connect the top-right arc and the bottom-right arc
    context.lineTo(arc4_end_x, arc4_end_y);

    // Draw the bottom-right arc
    context.quadraticCurveTo(arc4_end_x - RADIUS / 2, arc4_end_y,
                             (arc4_start_x + arc2_end_x) / 2, 
                             (arc4_start_y + arc2_end_y) / 2);

    // Draw the bottom-left arc
    context.quadraticCurveTo(arc2_start_x + RADIUS/2, arc2_start_y,
                             arc2_start_x, arc2_start_y);

    // Connect the top-left arc and the bottom-left arc
    context.lineTo(arc_start_x, arc_start_y);

    context.closePath();
    context.stroke();

    context.fill();

    var node_corner_y = end_node_y;
    var node_corner_x = end_x;
    var link_corner_y = arc4_end_y;
    var mid_y = (node_corner_y + link_corner_y) / 2;
    var extended_x = node_corner_x + RADIUS;

    this.endNode.offset += link_height;
}

/**
 * UniSankeySet
 * A wrapper for a UniSankey set.
 *
 * set:         The set of node heights and links for this UniSankeySet
 * canvas_id:   The id of the canvas to draw this sankey on.
 * colour:      The colour of this sankey diagram.
 * name:        The name/label of this UniSankeySet.
 * legend_y:    The height of the top-left of the legend (-ve; offset from bottom)
 */
function UniSankeySet(set, canvas_id, colour, sankey, name = ""){
    this.set = set;
    this.canvas_id = canvas_id;
    this.colour = colour;
    this.sankey = sankey;
    this.name = name;
    this.legend_y = 0;
    this.isActive = 1;
    this.data_min = [];
    this.data_max = [];
    this.data_filters = [];
}

/**
 * UniSankeySet.draw()
 * Draw this UniSankeySet.
 */
UniSankeySet.prototype.draw = function(){
    if (this.isActive > 0){
        this.sankey.draw(this.canvas_id, this.colour, this.set);
    } else {
        this.sankey.resetCanvas(this.canvas_id, this.colour);
    }

    this.sankey.drawLegend(this.canvas_id, this.colour, this.name, this.legend_y);
}

UniSankeySet.prototype.toggleActive = function(){
    this.isActive = 1 - this.isActive;
}

/**
 * UniSankey
 * A wrapper for a UniSankey diagram.
 * nodes:   A list of list of nodes in the UniSankey diagram. Each list is
 *          a column of nodes (in order from left-to-right, with each row 
 *          being the nodes from top-to-bottom).
 * sets:    The set of sankey diagrams in this UniSankey.
 */
function UniSankey(){
    this.nodes = [[]];
    this.sets = [];
}

/**
 * UniSankey.addNode(node, column)
 * node:    The node to add to the UniSankey Diagram
 * column:  The column to add the node to.
 */
UniSankey.prototype.addNode = function(node, column){
    if (column == this.nodes.length){
        this.nodes.push([]);
    }
    this.nodes[column].push(node);
}

/**
 * UniSankey.drawLegend(canvas_id, colour, name, legend_y)
 *
 * Draw in the legend on canvas_id at height + legend_y with the colour
 * colour and the label name.
 *
 */
UniSankey.prototype.drawLegend = function(canvas_id, colour, name, legend_y){
    var canvas = document.getElementById(canvas_id);
    var context = canvas.getContext('2d');
    var x_coord = canvas.width - LEGEND_WIDTH - HOVER_DIV_WIDTH;
    var y_coord = canvas.height + legend_y;

    // Draw the box from (x_coord, y_coord) to 
    // (x_coord + LEGEND_BOX_WIDTH, y_coord + LEGEND_HEIGHT)
    context.beginPath();
    context.rect(x_coord, y_coord, LEGEND_BOX_WIDTH, LEGEND_HEIGHT);
    context.stroke();
    context.fill();

    // Draw the text
    //     mid-line is at y_coord + LEGEND_HEIGHT / 2
    //     left-align is at x_coord + LEGEND_BOX_WIDTH + LEGEND_PADDING
    var temp = context.fillStyle;
    context.textAlign = 'left';
    context.fillStyle = getDarker(colour, -0.5);
    context.fillText(name, x_coord + LEGEND_BOX_WIDTH + LEGEND_PADDING, 
                     y_coord + LEGEND_HEIGHT / 2);
    context.fillStyle = temp;

    context.textAlign = 'center';
}

UniSankey.prototype.resetCanvas = function(canvas_id, colour){
    // Prepare to draw
    var canvas = document.getElementById(canvas_id);
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = colour;
    context.strokeStyle = colour;
    context.lineWidth = 1;

    context.font = FONT_TYPE;
    context.textBaseline = "middle";
    context.textAlign = "center";
}

/**
 * UniSankey.draw(canvas_id, colour)
 * Draw a UniSankey diagram on canvas_id, filled with colour.
 * canvas_id:   The id of the canvas to draw on (e.g. "sankey-canvas").
 * colour:      The colour to use (e.g. a hexadecimal string).
 * set:         A dictionary mapping keys to node details in the form
 *              {key: [height, [link heights]]}
 */
UniSankey.prototype.draw = function(canvas_id, colour, set){
    // Reset all offsets to 0
    for (var column = 0; column < this.nodes.length; column++){
        for (var j = 0; j < this.nodes[column].length; j++){
            this.nodes[column][j].offset = 0;
        }
    }

    // Prepare to draw
    var canvas = document.getElementById(canvas_id);
    var context = canvas.getContext('2d');
    this.resetCanvas(canvas_id, colour);

    // Draw all of the nodes (the nodes draw their outgoing links)
    for (var column = 0; column < this.nodes.length; column++){
        for (var j = 0; j < this.nodes[column].length; j++){
            this.nodes[column][j].draw(context, set);
        }
    }
}

/**
 * UniSankey.drawAll
 * Draw all of the UniSankeySets in this UniSankey. Also calls
 * UniSankey.setPositions().
 */
UniSankey.prototype.drawAll = function(){
    // Update the widths of all canvases
    var width_needed = (WIDTH * (this.nodes.length)) + 
                        ((NODE_HORIZONTAL_SPACING - WIDTH) * 
                         (this.nodes.length - 1));

    // + 200 to account for the hover div
    $("canvas").attr({'width' : width_needed});

    this.setPositions();
    this.forcedYChanges();

    for (var k = 0; k < this.sets.length; k ++){
        this.sets[k].draw();
    }

    resizeWindow();
}

UniSankey.prototype.forcedYChanges = function(){
    for (var column = 0; column < this.nodes.length; column++){
        var first_unused = 0;
        var start_index = 0;
        while (start_index < this.nodes[column].length && this.nodes[column][start_index].is_hidden > 0){
            start_index += 1;
        }

        if (start_index < this.nodes[column].length){
            var first_used = this.nodes[column][start_index].y;
        }

        for (var row = 0; row < this.nodes[column].length; row++){
            var average_link_y = 0;
            var node = this.nodes[column][row];
            var links = node.links;
            var new_y = 0;

            for (var i = 0; i < links.length; i++){
                average_link_y += links[i].endNode.y;
            }

            if (links.length > 0){
                new_y = average_link_y / links.length;
            }

            if (links.length > 0 && new_y > first_unused && new_y < first_used){
                if (row < this.nodes[column].length - 1){
                    var next_index = row + 1;
                    while (next_index < this.nodes[column].length && this.nodes[column][next_index].is_hidden > 0){
                        next_index += 1;
                    }

                    if (next_index < this.nodes[column].length){
                        first_used = this.nodes[column][next_index].y;
                    }
                }
                node.y = new_y;
                first_unused = new_y;
            }
        }

        // Do a second pass for aligning downwards
        var last_index = this.nodes[column].length - 1;
        var last_used = this.nodes[column][last_index].y;
        var last_unused = $("canvas").attr('height');

        for (var row = this.nodes[column].length - 1; row >= 0; row--){
            var average_link_y = 0;
            var node = this.nodes[column][row];
            var links = node.links;
            var new_y = 0;
            for (var i = 0; i < links.length; i++){
                average_link_y += links[i].endNode.y;
            }
            if (links.length > 0){
                new_y = average_link_y / links.length;
            }

            if (links.length > 0 && new_y > last_used && new_y < last_unused){
                // Make sure this doesn't go into an area that's already covered

                var prev_index = row - 1;

                while (prev_index >= 0 && this.nodes[column][prev_index].is_hidden > 0){
                    prev_index -= 1;
                }

                if (prev_index >= 0){
                    last_used = this.nodes[column][prev_index].y;
                }
                node.y = new_y;
                last_unused = new_y;
            }
        }
    }
}

/**
 * UniSankey.setPositions()
 * Set the positions of all of the nodes in this UniSankey diagram.
 */
UniSankey.prototype.setPositions = function(){
    // Add the legend y coordinates
    var legend_y = -LEGEND_HEIGHT - 20;
    for (var k = this.sets.length - 1; k >= 0; k --){
        this.sets[k].legend_y = legend_y;
        legend_y = legend_y - LEGEND_PADDING - LEGEND_HEIGHT;
    }    

    // Get the sets
    var sets = [];
    for (var k = 0; k < this.sets.length; k ++){
        sets.push(this.sets[k].set);
    }

    var max_height_needed = 0;

    // Get the most number of nodes in one column (most spacing needed)
    for (var column = 0; column < this.nodes.length; column++){
        var current_count = 0;
        var current_max = 0;
        for (var j = 0; j < this.nodes[column].length; j++){
            if (this.nodes[column][j].is_hidden == 0){
                current_count += 1;

                // get the largest node in this position
                var largest_node = 0;
                var key = this.nodes[column][j].key;
                for (var i = 0; i < sets.length; i ++){
                    if (sets[i][key][0] > largest_node){
                        largest_node = sets[i][key][0];
                    }
                }
                current_max += largest_node * MAX_HEIGHT;
            }
        }
        current_max += (current_count - 1) * NODE_VERTICAL_SPACING;
        if (current_max > max_height_needed){
            max_height_needed = current_max;
        }
    }

    $("canvas").attr({'height' : max_height_needed + MAX_HEIGHT / 2});

    var current_x = 0;
    for (var column = 0; column < this.nodes.length; column++){
        // Find the offset from the top that's needed (max height of this col)
        var max_col_height = 0;
        for (var j = 0; j < this.nodes[column].length; j++){
            if (this.nodes[column][j].is_hidden == 0){
                var key = this.nodes[column][j].key;
                var max_height = 0;
                for (var i = 0; i < sets.length; i ++){
                    var height = sets[i][key][0];
                    if (height > max_height){
                        max_height = height;
                    }
                }
                max_col_height += max_height;
            }
        }

        max_col_height = max_col_height * MAX_HEIGHT + 
                         (this.nodes[column].length - 1) * NODE_VERTICAL_SPACING;

        var current_y = Math.max((max_height_needed - max_col_height) / 2, 0);

        // Find the height of the largest node in this spot
        for (var j = 0; j < this.nodes[column].length; j++){

            if (this.nodes[column][j].is_hidden == 0){
                var key = this.nodes[column][j].key;
                var max_height = 0;

                for (var i = 0; i < sets.length; i ++){
                    var height = sets[i][key][0];
                    if (height > max_height){
                        max_height = height;
                    }
                }

                // Baseline for this spot is middle of height
                var baseline_y = max_height * MAX_HEIGHT / 2;

                this.nodes[column][j].x = current_x;
                this.nodes[column][j].y = current_y + baseline_y;
                current_y += baseline_y * 2 + NODE_VERTICAL_SPACING;
            }
        }

        current_x += NODE_HORIZONTAL_SPACING;
    }
}
