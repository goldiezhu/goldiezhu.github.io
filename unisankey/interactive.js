/**
 * Code to be run for interactive aspects of UniSankey (e.g. hovering)
 */


DIV_HEADER = "<div style='background-color: ##COLOUR##; color: ##FONT##'>";
DIV_FOOTER = "</div>";

FORMAT_HEADER = "<div class='contribution-div' style='background-color: ##COLOUR##'>";
FORMAT_FOOTER = "</div>";

CONTRIBUTORS_HEADER = "<div class='contribution-wrapper'>";
CONTRIBUTORS_FOOTER = "</div>";

MIDTEXT_HEADER = "<div class='mid-text'>";
MIDTEXT_FOOTER = "</div>";

NODE_HEADER = "<div class='contribution-div node-text'>";
NODE_FOOTER = "</div>";

CONTRIBUTIONS_HEADER = "<div class='contribution-wrapper'>"
CONTRIBUTIONS_FOOTER = "</div>"

// ACTIVE_SET = 0;

// CLICK_LABEL = "<div class = 'click_section'><input id='click_label' style='background-color: ##COLOUR##; color: ##FONT##' type='text' value='##LABEL##'></div>";

// CLICK_COLOUR = "<div class = 'click_section'><input id='click_colour' style='background-color: ##COLOUR##; color: ##FONT##' type='color' value='##LABEL##'></div>";
CLICK_FILTER_LABEL = "<div class = 'click_filter_label'>##LABEL##</div>"
CLICK_FILTER_OPTION = "<div class = 'click_filter_option'>##LABEL## <input class = '##TYPE##' value='##VALUE##' type='text'></div>";

// CLICK_HIDE = "<div class = 'click_section' id = 'click_hide' style='background-color: ##COLOUR##; color: ##FONT##'>##LABEL##</div>";


MOUSEDOWN = [0, 0];
MOUSEUP = [0, 0];

function findNodesBetween(xs, ys){
    var all_nodes = editor_sankey.nodes;
    var between_nodes = [];
    for (var i = 0; i < all_nodes.length; i++){
        for (var j = 0; j < all_nodes[i].length; j++){
            var cur_node = all_nodes[i][j];
            var left_x = cur_node.x;
            var right_x = cur_node.x + WIDTH;
            var top_y = cur_node.y - MAX_HEIGHT * EDITOR_HEIGHT/ 2;
            var bottom_y = top_y + MAX_HEIGHT * EDITOR_HEIGHT;

            // Check the xs
            if ((xs[0] <= left_x && left_x <= xs[1]) || 
                (left_x <= xs[0] && xs[0] <= right_x)){
                if ((ys[0] <= top_y && top_y <= ys[1]) || 
                    (top_y <= ys[0] && ys[0] <= bottom_y)){
                    between_nodes.push(cur_node);
                }
            }
        }
    }
    return between_nodes;
}

var BOXING = false;

$(document).mousedown(function(e){
    if (EDITING == true){
        MOUSEDOWN[0] = e.pageX;
        MOUSEDOWN[1] = e.pageY;
        BOXING = true;
    }
});

$(document).mousemove(function(e){
    if (EDITING == true && BOXING == true){
        $('#drag-container').show()
        var origin = MOUSEDOWN;
        var new_coords = [e.pageX, e.pageY];

        var xs = [origin[0], new_coords[0]];
        var ys = [origin[1], new_coords[1]];

        xs.sort(function(a, b){return a - b});
        ys.sort(function(a, b){return a - b});

        var left = xs[0];
        var width = xs[1] - xs[0];
        var top = ys[0];
        var height = ys[1] - ys[0];

        $('#drag-container').css('left', left + "px")
        $('#drag-container').css('top', top + "px")
        $('#drag-container').css('width', width + "px")
        $('#drag-container').css('height', height + "px")
    }

});

$(document).mouseup(function(e){
    if (EDITING == true){
        BOXING = false;
        $('#drag-container').hide()

        MOUSEUP[0] = e.pageX;
        MOUSEUP[1] = e.pageY;

        var scaleFactor_x = CANVASES[0].width / $("#" + CANVASES[0].id).width();
        var scaleFactor_y = CANVASES[0].height / $("#" + CANVASES[0].id).height();
        

        var pos = findPos(CANVASES[0]);
        var xs = [(MOUSEDOWN[0] - pos.x) * scaleFactor_x, (MOUSEUP[0] - pos.x) * scaleFactor_x];
        var ys = [(MOUSEDOWN[1] - pos.y) * scaleFactor_y, (MOUSEUP[1] - pos.y) * scaleFactor_y];

        xs.sort(function(a, b){return a - b});
        ys.sort(function(a, b){return a - b});

        // Weird selection bug for option choices and their positions.
        if (ys[0] > 0 && xs[0] > 0){
            // Find all nodes between (xs[0], ys[0]) and (xs[1], ys[1])
            var nodes = findNodesBetween(xs, ys);
            for (var i = 0; i < nodes.length; i++){
                var cur_node = nodes[i];
                if (cur_node.key != "project"){
                    cur_node.is_hidden = 1 - cur_node.is_hidden;
                }
            }

            if (nodes.length > 0){
                generateFilterOptions();
            }
            sankey.drawAll();
        }
    }
});



function selectAllCharacteristics() {
    var all_nodes = sankey.nodes;
    for (var i = 0; i < all_nodes.length; i++){
        for (var j = 0; j < all_nodes[i].length; j++){
            var cur_node = all_nodes[i][j];

            if (cur_node.key != "project" && cur_node.key != "license" && cur_node.key != "startup"
                && cur_node.key != "commercialization"){
                cur_node.is_hidden = 0;
            }
        }
    }
    generateFilterOptions();
    sankey.drawAll();
}

function deselectAllCharacteristics() {
    var all_nodes = sankey.nodes;
    for (var i = 0; i < all_nodes.length; i++){
        for (var j = 0; j < all_nodes[i].length; j++){
            var cur_node = all_nodes[i][j];
            if (cur_node.key != "project" && cur_node.key != "license" && cur_node.key != "startup"
                && cur_node.key != "commercialization"){
                cur_node.is_hidden = 1;
            }
        }
    }
    generateFilterOptions();
    sankey.drawAll();
}

/**
 * Finds the current position that's being hovered over.
 */
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

/**
 * Convert an rgb value into HEX.
 */
function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

/**
 * Checks if the current position of canvas is hovered over.
 */
function isHoveredOver(canvas, x, y){
    var c = canvas.getContext('2d');
    var scaleFactor_x = canvas.width / $("#" + canvas.id).width();
    var scaleFactor_y = canvas.height / $("#" + canvas.id).height();
    var p = c.getImageData(x * scaleFactor_x, y * scaleFactor_y, 1, 1).data; 
    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    return hex != "#000000";
}

/**
 * getContributorValue(contributors, set)
 * Get the values of the contribution from contributors using the
 * values in set.
 *
 * Return format is a list in [name, value, type, scale, base] sets.
 * (i.e. "name contribute value to ...")
 */
function getContributorValues(contributors, set){
    var return_set = [];
    for (var s = 0; s < contributors.length; s++){
        var current_set = contributors[s];
        var current_node = current_set[0];
        var current_name = current_node.label;
        var current_key = current_node.key;
        var current_index = current_set[1];
        var link_height = set[current_key][1][current_index];
        var list_to_push = [current_name, link_height, current_node.type, 
                            current_node.scale, current_node.base, 
                            current_node.is_product];

        if (link_height > 0){
            return_set.push(list_to_push);
        }
    }
    return return_set;
}

/**
 * getContributionValue(start_node, contributions, set)
 * Get the values of the contributions from start_node to contributions, 
 * using the values in set.
 *
 * Return format is a list in [name, value, type, scale, base] sets.
 * (i.e. "start_node contributed value to name")
 */
function getContributionValues(start_node, contributions, set){
    var return_set = [];

    for (var s = 0; s < contributions.length; s++){
        var current_set = contributions[s];
        var current_node = current_set[0];
        var current_name = current_node.label;
        var current_key = start_node.key;
        var current_index = current_set[1];
        var link_height = set[current_node.key][0];
        var list_to_push = [current_name, link_height, current_node.type, 
                            current_node.scale, current_node.base,
                            current_node.is_product];

        if (link_height > 0 && set[current_node.key][0] > 0){
            return_set.push(list_to_push);
        }
    }
    return return_set;
}

/**
 * Return a formatted version of value using the format corresponding to
 * type; adjusted to scale and base.
 *
 * Types:
 *      'boolean':  When printed, it doesn't use its value.
 *      'monetary': When printed, it's prefixed with a $.
 *      'plain':    When printed, there's no prefixing done.
 *      'percent':  When printed, there's a % appended to value.
 */
function getFormatted(value, type, scale, base){
    if (EDITING == true){
        return "";
    }

    if (type == 'boolean'){
        value = value * 100;
    }

    var formatted = "";

    var adjusted_value = value * scale + base;
    adjusted_value = Math.round(adjusted_value * 100) / 100;
    
    if (type == 'numbered'){
        return adjusted_value.toString() + " ";
    }

    if (type == 'monetary'){
        formatted = "$";
        adjusted_value = adjusted_value.toLocaleString();
    }

    if (type == 'percent' || type == 'boolean'){
        adjusted_value = adjusted_value.toString() + "%";
    }

    return formatted + adjusted_value;
}

/**
 * Return a new colour that's many shades darker than colour.
 */
function getDarker(color, percent){
    var f = parseInt(color.slice(1),16),
        t = percent<0?0:255,
        p = percent<0?percent*-1:percent,
        R = f>>16,
        G = f>>8&0x00FF,
        B = f&0x0000FF;
    return "#"+(0x1000000 + 
                (Math.round((t - R) * p) + R) * 0x10000 +
                (Math.round((t - G) * p) + G) * 0x100 +
                (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

/**
 * Format a header with the appropriate background-colour and font colour.
 */ 
function makeHeader(header, colour, font_color = ""){
    var replace_1 = header.replace("##COLOUR##", colour);

    if (font_color == ""){
        font_color = getDarker(colour, -0.5);
    }
    var replace_2 = replace_1.replace("##FONT##", font_color);
    return replace_2;
}

/**
 * Replaces label in template with replace_with.
 */
function replaceTemplate(template, label, replace_with){
    return template.replace(label, replace_with);
}

/**
 * formatDefinition(current_node, current_set)
 * Return the formatted code that displays the definition
 * of the current_node for the current_set.
 */
function formatDefinition(current_node, current_set){
    if (current_node.omit_definition == 1){
        return '';
    }

    var set_colour = current_set.colour;
    var formatted_div = makeHeader(DIV_HEADER, set_colour);


    var to_scale = current_set.set[current_node.key][0];
    
    if (current_node.scale != current_node.print_scale){
        to_scale = (to_scale * current_node.print_scale) / current_node.scale;
    }

    var formatted_value = getFormatted(to_scale, 
                                       current_node.type, 
                                       current_node.scale, 
                                       current_node.base);
    var active_label = '';
    active_label = current_set.name;



    // if (current_node.type == 'numbered'){
    //      active_label = formatted_value + current_node.label;
    //      if (formatted_value != '1 '){
    //         active_label += 's';
    //      }
    // } else {
    //     active_label = current_node.label + formatted_value;
    // }
    
    var node_body = NODE_HEADER + active_label + NODE_FOOTER;

    // Put in the description
    // Format:
    // probability: ...% of ... Projects
    // numbered: Avg. $... from ... Project
    var project_node = current_set.sankey.getNodeWithKey('project');
    var projects_number = getFormatted(current_set.set['project'][0], 
                                       project_node.type, 
                                       project_node.scale, 
                                       project_node.base);
    
    var start_text = '';

    if (!formatted_value.includes("%")){
        start_text = "Avg. ";
    }

    start_text += formatted_value;

    if (formatted_value.includes("%")){
        start_text += ' of ';
    } else {
        start_text += ' from ';
    }

    if (current_node.key == 'project'){
        start_text = ''
    }


    var node_text = start_text + projects_number + " Projects";

    node_text = CONTRIBUTIONS_HEADER + node_text + CONTRIBUTIONS_FOOTER;

    formatted_div += node_body + node_text + DIV_FOOTER;
    return formatted_div;
}

/**
 * formatContributions(incoming, outgoing, current_node, current_set)
 * Return the formatted code that displays the incoming contributions and
 * outgoing contributions of the current_node for the current_set.
 */
function formatContributions(incoming, outgoing, current_node, current_set){
    var set_colour = current_set.colour;
    var formatted_div = makeHeader(DIV_HEADER, set_colour);

    // Build up the incoming text
    var incoming_text = '';

    if (incoming.length > 0){
        incoming_text += CONTRIBUTORS_HEADER;

        var toggle = 0;
        for (var q = 0; q < incoming.length; q++){
            var name = incoming[q][0];
            var value = incoming[q][1];
            var type = incoming[q][2];
            var scale = incoming[q][3];
            var base = incoming[q][4];
            var formatted_value = getFormatted(value, type, scale, base);
            
            // <name> contributes <value>
            incoming_text += makeHeader(FORMAT_HEADER, getDarker(set_colour, 0.1 + toggle * 0.1));
            toggle = 1 - toggle;
            if (type == 'numbered'){
                incoming_text += formatted_value + name;
            } else {
                incoming_text += name + formatted_value;
            }
            incoming_text += FORMAT_FOOTER;

        }

        incoming_text += CONTRIBUTORS_FOOTER;

        var contributes_results = "contributes to";
        if (current_node.is_product > 0){
            contributes_results = "results in";
        }

        incoming_text += MIDTEXT_HEADER + contributes_results + MIDTEXT_FOOTER;
    }

    var formatted_value = getFormatted(current_set.set[current_node.key][0], 
                                       current_node.type, 
                                       current_node.scale, 
                                       current_node.base);
    var active_label = '';
    if (current_node.type == 'numbered'){
         active_label = formatted_value + current_node.label;
         if (formatted_value != '1 '){
            active_label += 's';
         }
    } else {
        active_label = current_node.label + formatted_value;
    }
    
    var node_body = NODE_HEADER + active_label + NODE_FOOTER;


    // Build up the outgoing text
    var outgoing_text = '';

    if (outgoing.length > 0){
        var contributes_results = "contributes to";
        for (var q = 0; q < outgoing.length; q++){
            var is_product = outgoing[q][5];
            if (is_product > 0){
                contributes_results = "results in";
            }
        }

        outgoing_text += MIDTEXT_HEADER + contributes_results + MIDTEXT_FOOTER;

        outgoing_text += CONTRIBUTIONS_HEADER;

        toggle = 0;

        for (var q = 0; q < outgoing.length; q++){
            var name = outgoing[q][0];
            var value = outgoing[q][1];
            var type = outgoing[q][2];
            var scale = outgoing[q][3];
            var base = outgoing[q][4];
            var formatted_value = getFormatted(value, type, scale, base);
            
            // <value> to <name>
            outgoing_text += makeHeader(FORMAT_HEADER, getDarker(set_colour, 0.2 + toggle * 0.4));
            toggle = 1 - toggle;
            
            outgoing_text += name + formatted_value + "\n";

            outgoing_text += FORMAT_FOOTER;
        }

        outgoing_text += CONTRIBUTIONS_FOOTER;
    }


    formatted_div += incoming_text + node_body + outgoing_text + DIV_FOOTER;
    return formatted_div;
}

/**
 * Events for when a canvas is hovered over
 */
function canvas_hover(e, sankey){
    if (EDITING == true){
        $("body").css("cursor", "default")
        $("#hover-div").fadeTo(0, 0);

        $("#sankey-editor").fadeTo(0, 1);  
        return;
    }

    var pos = findPos(CANVASES[0]);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;

    var hovered_canvases = [];
    // Get the canvases that are hovered over
    for (var i = 0; i < CANVASES.length; i++){
        if (isHoveredOver(CANVASES[i], x, y)){
            hovered_canvases.push(CANVASES[i]);
        }
    }

    // If at least one canvas is hovered over:
    // Make the non-hovered canvases translucent
    if (hovered_canvases.length > 0){
        $("body").css("cursor", "pointer")
        for (var i = 0; i < CANVASES.length; i++){
            $(CANVASES[i]).fadeTo(0, 0.2);
        }

        for (var i = 0; i < hovered_canvases.length; i++){
            $(hovered_canvases[i]).fadeTo(0, 1);
        }
    } else {
        $("body").css("cursor", "default")
        $('.sankey').fadeTo(0, 1);
    }

    $("#hover-div").fadeTo(0, 0);

    // Get the keys of nodes that are hovered over
    if (hovered_canvases.length > 0){
        var hovered_nodes = [];
        var active_sets = [];
        for (var m = 0; m < sankey.sets.length; m++){
            if (sankey.sets[m].isActive){
                var active_node = getActiveNode(sankey, sankey.sets[m], x, y);
                if (active_node){
                    if (hovered_nodes.indexOf(active_node) == -1){
                        hovered_nodes.push(active_node);   
                    }
                    active_sets.push(sankey.sets[m]);
                }
            }
        }

        // Get the contributions of the active nodes
        var contribution_content = "";


        if (hovered_nodes.length > 0){
            var current_node = hovered_nodes[0];
            var active_label = current_node.label;

            // Add the definition
            var definition_text = '';
            var definition = KEY_TO_DESC[current_node.key];

            contribution_content += "<div class='definition-box'><span class='definition-label'>" + active_label + "</span><br/>" + definition + "</div>";
        }
        



        for (var m = 0; m < hovered_nodes.length; m++){
            // var temp = hovered_nodes[m].getContributions();
            // var temp_contributors = temp[0];
            // var temp_contributions = temp[1];

            // Get the height for each active set
            for (var n = 0; n < active_sets.length; n++){
                // var in_values = getContributorValues(temp_contributors,
                //                                      active_sets[n].set);

                // var out_values = getContributionValues(hovered_nodes[m],
                //                                        temp_contributions,
                //                                        active_sets[n].set);

                // contribution_content += formatContributions(in_values, 
                //                                             out_values, 
                //                                             hovered_nodes[m], 
                //                                             active_sets[n]);
                contribution_content += formatDefinition(hovered_nodes[m], 
                                                         active_sets[n]);
            }
        }

        $("#hover-div").fadeTo(0, 1);
        $("#hover-div").html(contribution_content);

        var left_x = e.pageX;
        var end_right = left_x + HOVER_DIV_WIDTH;
        if (end_right > $("body").width()){
            left_x -= HOVER_DIV_WIDTH;
        }
        $("#hover-div").css({'top': e.pageY, 'left': left_x});

    }
}

/**
 * Return the HTML content for the clicked div.
 */
function formatClickDiv(sankey_set){

    var set_colour = sankey_set.colour;
    var label_colour = getDarker(set_colour, -0.1);
    var font_colour = getDarker(set_colour, -0.8);

    var div_content = '';

    $("#click_label").css({'background-color' : label_colour,
                           'color' : font_colour});

    $("#click_label").val(sankey_set.name);

    $("#click_colour").css({'background-color' : set_colour,
                           'color' : font_colour});
    $("#click_colour").val(set_colour)

    
    $("#click_filter").css({'background-color' : label_colour,
                            'color' : font_colour});

    var filter = '';
    for (var i = 0; i < sankey_set.data_min.length; i++){
        var filter_label = replaceTemplate(CLICK_FILTER_LABEL, "##LABEL##", sankey_set.data_filters[i]);
    
        var filter_body = replaceTemplate(CLICK_FILTER_OPTION, "##LABEL##", 'Min');
        filter_body = replaceTemplate(filter_body, "##TYPE##", 'min-filter');
        filter_body = replaceTemplate(filter_body, "##VALUE##", sankey_set.data_min[i]);
        
        filter_body += replaceTemplate(CLICK_FILTER_OPTION, "##LABEL##", 'Max');
        filter_body = replaceTemplate(filter_body, "##TYPE##", 'max-filter');
        filter_body = replaceTemplate(filter_body, "##VALUE##", sankey_set.data_max[i]);

        filter += filter_label;
        filter += filter_body;
    }

    $("#click_filter").html(filter)

    var hide_label = "Hide";
    if (sankey_set.isActive == 0){
        hide_label = "Unhide";
    }

    $("#click_hide").css({'background-color' : label_colour,
                           'color' : font_colour});
    $("#click_hide").html(hide_label);
}

/**
 * Set the click-div content
 */
function setClickDivContent(){
    formatClickDiv(ACTIVE_SET);

    $('input').each(function() {
        $(this).change(function(){
            input_changed();
        });
    });

    $("#click_label").focus();
}

/**
 * Called whenever #click_hide is clicked on
 */
function toggleActiveSet(){
    var sankey_set = ACTIVE_SET;
    sankey_set.toggleActive();
    sankey_set.draw();
    setClickDivContent();
}

/**
 * Called whenever input is changed
 */
function input_changed(){
    var sankey_set = ACTIVE_SET;
    var new_colour = $('#click_colour').val();
    var new_min = $('.min-filter');
    var new_max = $('.max-filter');
    var new_mins = [];
    var new_maxs = []
    for (var i = 0; i < new_min.length; i ++){
        var temp_min = $(new_min[i]).val();
        var temp_max = $(new_max[i]).val();

        if (isNaN(temp_min)){
            temp_min = sankey_set.data_min[i];
        }
        if (isNaN(temp_max)){
            temp_max = sankey_set.data_max[i];
        }
        temp_min = parseFloat(temp_min);
        temp_max = parseFloat(temp_max);

        new_mins.push(temp_min);
        new_maxs.push(temp_max);
    }

    var new_name = $('#click_label').val();


    sankey_set.label = new_name;
    sankey_set.name = new_name;
    sankey_set.colour = new_colour;
    currentFilterSet(sankey_set, new_mins, new_maxs);
    setClickDivContent();
}


/**
 * Finds all of the nodes that have a path that flows into node
 * and sets their is_hidden value to match.
 */
function percolateHidden(node, hidden_value){
    var node_column = -1;
    for (var column = 0; column < sankey.nodes.length; column ++){
        for (var row = 0; row < sankey.nodes[column].length; row ++){
            if (sankey.nodes[column][row] == node){
                node_column = column;
                break;
            }
        }
        if (node_column > -1){
            break;
        }
    }

    var connected_nodes = [node];
    for (var column = node_column; column >= 0; column --){
        for (var row = 0; row < sankey.nodes[column].length; row ++){
            var node_links = sankey.nodes[column][row].links;
            for (var i = 0; i < node_links.length; i++){
                if (connected_nodes.indexOf(node_links[i].endNode) > -1){
                    connected_nodes.push(sankey.nodes[column][row]);
                }
            }
        }
    }

    for (var i = 0; i < connected_nodes.length; i++){
        connected_nodes[i].is_hidden = hidden_value;
    }

}

/**
 * Events for when a canvas is clicked
 */
function canvas_click(e, sankey){
    var pos = findPos(CANVASES[0]);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;

    var clicked_canvases = [];
    // Get the canvases that are hovered over
    for (var i = 0; i < CANVASES.length; i++){
        if (isHoveredOver(CANVASES[i], x, y)){
            clicked_canvases.push(CANVASES[i]);
        }
    }


    // // Get the keys of nodes that are hovered over
    // if (EDITING == true){
    //     if (clicked_canvases.length > 0){
    //         var clicked_node = false;
    //         for (var m = 0; m < sankey.sets.length; m++){
    //             var active_node = getActiveNode(sankey, sankey.sets[m], x, y);
    //             if (active_node){
    //                 clicked_node = active_node;
    //             }
    //         }

    //         clicked_node.is_hidden = 1 - clicked_node.is_hidden;
    //         // Set the is_hidden value of all nodes that flow into clicked_node
    //         // to its is_hidden value
    //         // TODO: switch -> percolateHidden(clicked_node, clicked_node.is_hidden);
    //         // with something that fixes the links
    //         sankey.drawAll();
    //     }
    // }


    // Check if the legend was clicked
    // Only one canvas should be clicked on
    if (clicked_canvases.length != 1){
        $("#click-div").css("display", "none");
        return;
    }

    // The clicked area should be within the legend
    ACTIVE_SET = 0;

    for (var i = 0; i < sankey.sets.length; i++){
        var in_legend = inLegend(sankey, sankey.sets[i], x, y);
        if (in_legend > 0){
            ACTIVE_SET = sankey.sets[i];
        }
    }

    if (!ACTIVE_SET){
        return;
    }
    
    $("#click-div").css("display", "block");
    $("#click-div").css({'top': e.pageY, 'left': e.pageX});
    setClickDivContent();
}