var CANVASES = [];
var BASE_COLOURS = ["#ffef9d", "#ffd5da", "#d0f5f9", "#e1beff", "#dcffbe", "#bed7ff"];

var EDITOR_COLOUR = "#a5f3e4";
var EDITOR_HEIGHT = 0.8;
var KEY_ORDER = [];
var SANKEY_CANVAS = ['sankey-canvas', 'sankey-canvas2', 'sankey-canvas3', 'sankey-canvas4', 'sankey-canvas5', 'sankey-canvas6'];

var TYPE_GT = "GT";
var TYPE_LT = "LT";
var TYPE_EQ = "EQ";
var TYPE_BETWEEN = "BETWEEN";
var TYPE_SPLIT_BY = "SPLIT";
var TYPE_AROUND = "AROUND";
var TYPE_RATIO = "RATIO";
var ID_NUMBER = 0;

var KEYS_TO_LABELS = {};

var KEY_GROUPINGS = {   'ip': ['university', 'creator'],
                        'stage': ['earliest', 'mid-stage', 'latest'],
                        'field': ['cit', 'mm', 'eet', 'photonics'],
                        'position': ['staff', 'mid-level', 'full_professor', 'distinguished'],
                        'gender': ['male', 'female'],
                        'firm_size': ['micro', 'small', 'medium', 'large'],
                        'commercialization': ['license', 'startup']
                    };

var FILTER_EXCLUSIONS = [];

var UNFILTERABLE = ['researcher', 'project', 'uni'];

var AUTO_TYPES_TO_LABELS = {"SPLIT": "greater than/less than",
                            "RATIO": "in ratio to"};
                            // "AROUND": "Around"
                            // "RATIO": "Ratio"

var TYPES_TO_LABELS = {"GT": "Greater than",
                       "LT": "Less than",
                       "EQ": "Equals",
                       "BETWEEN": "Between",
                       "RATIO": "Ratio to"};
                       // "AROUND": "Around"
                       // "RATIO": "Ratio"

var TYPES_TO_NUMBER = {"GT": 1,
                       "LT": 1,
                       "EQ": 1,
                       "BETWEEN": 2,
                       "AROUND": 1,
                       "RATIO": 3}; // TODO: Add case for ratio (characteristic; ratio of 1st, ratio of 2nd)

function FilterItem(key, type, values){
    this.key = key;
    this.type = type;
    this.values = values;
}

FilterItem.prototype.getName = function(){
    if (this.type == TYPE_GT || this.type == TYPE_LT || (this.type == TYPE_EQ && this.values[0] > 1)){
        var new_label = '';
        if (this.type == TYPE_GT){
            new_label = ">";
        }

        if (this.type == TYPE_LT){
            new_label = "<";
        }

        if (this.type == TYPE_EQ){
            new_label = "=";
        }
        return KEYS_TO_LABELS[this.key] + " " + new_label + " " + this.values[0];
    }

    if (this.type == TYPE_EQ){
        if (this.values[0] == 0){
            return '';
        }
        return KEYS_TO_LABELS[this.key];
    }

    if (this.type == TYPE_BETWEEN){
        return KEYS_TO_LABELS[this.key] + " between " + this.values[0] + " - " + this.values[1];
    }


    if (this.type == TYPE_RATIO){
        var key1 = KEYS_TO_LABELS[this.key];
        var key2 = KEYS_TO_LABELS[this.values[0]];
        var ratio1 = this.values[1];
        var ratio2 = this.values[2];

        return "" + ratio1 + " " + key1 + " : " + ratio2 + " " + key2;
    }

}

/**
 * Return True if value1 and value2 has *near* a ratio1:ratio2 ratio.
 */
function withinRatio(value1, value2, ratio1, ratio2){
    var threshhold = 0.2;

    var simplified_value1 = value1 / ratio1;
    var simplified_value2 = value2 / ratio2;

    var threshhold_amount = simplified_value1 * threshhold;

    return (simplified_value1 - threshhold_amount <= simplified_value2 &&
            simplified_value1 + threshhold_amount >= simplified_value2)

}

/**
 * Apply this FilterItem to data, using the column mapping mappings.
 * Return a new data set (does not modify the original).
 */
FilterItem.prototype.apply = function(data, mappings){
    var new_data = [];
    for (var i = 0; i < data.length; i++){
        var row = data[i];
        var column = mappings[this.key];
        var cell = parseFloat(row[column]);

        var add_row = true;
        if (this.type == TYPE_GT){
            add_row = cell > this.values[0];
        } else if (this.type == TYPE_LT){
            add_row = cell < this.values[0];
        } else if (this.type == TYPE_EQ){
            add_row = cell == this.values[0];
        } else if (this.type == TYPE_BETWEEN){
            add_row = this.values[0] <= cell && cell <= this.values[1];
        } else if (this.type == TYPE_RATIO){
            var other_characteristic = this.values[0];
            var ratio_1 = this.values[1];
            var ratio_2 = this.values[2];
            var other_column = mappings[other_characteristic];
            var other_cell = parseFloat(row[other_column]);
            add_row = withinRatio(cell, other_cell, ratio_1, ratio_2);
        }

        if (add_row == true){
            new_data.push(row);
        }
    }
    return new_data;
}

function FilterSet(filter_items){
    this.filters = filter_items;
    this.name = '';
}

FilterSet.prototype.getName = function(){
    var name = '';

    for (var i = 0; i < this.filters.length; i++){
        if (name != '' && this.filters[i].getName() != ''){
            name += " + ";
        }
        name += this.filters[i].getName();
    }

    if (name == ''){
        name = "All Projects";
    }
    return name;
}

/**
 * Return data after applying all of the filters to data using the column
 * mapping mappings.
 * (Does not modify the original).
 */
FilterSet.prototype.apply = function(data, mappings){
    var current_data = data;
    for (var i = 0; i < this.filters.length; i++){
        current_data = this.filters[i].apply(current_data, mappings);
    }
    return current_data;
}


var TEMP_TEST = [new FilterItem('mid-level', TYPE_EQ, [1]), new FilterItem('full_professor', TYPE_EQ, [1]), new FilterItem('phd_age', "SPLIT", [15])];


function initKeysToGroups(){
    // Group by KEY_GROUPINGS first
    var grouping_keys = Object.keys(KEY_GROUPINGS);
    KEYS_TO_GROUPS = {};

    // Set up a dict of groups: filter items
    for (var i = 0; i < grouping_keys.length; i++){
        var current_group = grouping_keys[i];
        var group = KEY_GROUPINGS[current_group];
        for (var j = 0; j < group.length; j++){
            KEYS_TO_GROUPS[group[j]] = current_group;
        }
    }
}

function getAllRatios(data, column1, column2){
    var ratios = [];
    for (var i = 0; i < data.length; i++){
        ratios.push(data[i][column1] / data[i][column2]);
    }
    return ratios;
}

function countNearRatio(ratios, ratio){
    var count = 0;
    for (var i = 0; i < ratios.length; i ++){
        var current = ratios[i];
        if (current <= ratio / 0.8 && current >= ratio / 1.2){
            count += 1;
        }
    }
    return count;
}

function simplifyRatios(ratios){
    var new_ratios = [];

    for (var i = 0; i < ratios.length; i++){
        var new_value = Math.round(ratios[i] * 100) / 100;
        if (new_ratios.length == 0 || new_value != new_ratios[new_ratios.length - 1]){
            new_ratios.push(new_value);
        }
    }
    return new_ratios;
}

function selectBestRatioGroups(ratios, simplified_ratios){
    // Get the counts near each simplified ratio
    var counts = [];
    for (var i = 0; i < simplified_ratios.length; i++){
        counts.push(countNearRatio(ratios, simplified_ratios[i]));
    }

    // Divide the simplified ratios into 3 sections
    var bound1 = Math.round(simplified_ratios.length / 3);
    var bound2 = simplified_ratios.length;

    var section1 = simplified_ratios.slice(0, bound1);
    var counts1 = counts.slice(0, bound1);
    var section2 = simplified_ratios.slice(bound1, bound1 * 2);
    var counts2 = counts.slice(bound1, bound1 * 2);
    var section3 = simplified_ratios.slice(bound1 * 2, bound2);
    var counts3 = counts.slice(bound1 * 2, bound2);

    var ratio1_index = 0;
    for (var i = 0; i < section1.length; i++){
        if (counts1[i] > counts1[ratio1_index]){
            ratio1_index = i;
        }
    }

    var ratio1 = section1[ratio1_index];
    var section2_lowerbound = ratio1 / 0.8;
    var ratio2_start = 0;
    for (var i = 0; i < section2.length; i++){
        if (section2[i] >= section2_lowerbound){
            ratio2_start = i;
            break;
        }
    }

    var ratio2_index = ratio2_start;
    for (var i = ratio2_start; i < section2.length; i++){
        if (counts2[i] > counts2[ratio2_index]){
            ratio2_index = i;
        }
    }

    var ratio2 = section2[ratio2_index];
    var section3_lowerbound = ratio2 / 0.8;
    var ratio3_start = 0;
    for (var i = 0; i < section3.length; i++){
        if (section3[i] >= section3_lowerbound){
            ratio3_start = i;
            break;
        }
    }

    var ratio3_index = ratio3_start;
    for (var i = ratio3_start; i < section3.length; i++){
        if (counts3[i] > counts3[ratio3_index]){
            ratio3_index = i;
        }
    }
    var ratio3 = section3[ratio3_index];

    return [ratio1, ratio2, ratio3];

}

function getRatioGroups(key1, key2){
    var data = CSV_DATA;
    var column1 = KEY_TO_COLUMNS[key1];
    var column2 = KEY_TO_COLUMNS[key2];
    var ratio_pairs = [[1, 1], [1, 2], [2, 1]];
    var simplified_ratios = [1, 0.5, 2];
    var ratios = getAllRatios(data, column1, column2);
    // Check to make sure there's a decent number of groupings for these ratios
    if (countNearRatio(ratios, simplified_ratios[0]) >= 20 &&
        countNearRatio(ratios, simplified_ratios[1]) >= 20 &&
        countNearRatio(ratios, simplified_ratios[2]) >= 20){
        return ratio_pairs;
    }

    // Otherwise get the ratios of all the data, sort them, and find good ratio values
    ratios.sort();
    var simplified_ratios = simplifyRatios(ratios);
    var chosen_values = selectBestRatioGroups(ratios, simplified_ratios);

    // turn the ratio values into pairs
    var ratio_pairs = [[chosen_values[0], 1],
                       [chosen_values[1], 1],
                       [chosen_values[2], 1]];
    return ratio_pairs;
}

// TODO: remove TEMP_TEST
/**
 * Turn filter items into lists of the characteristics
 */
function groupFilterItems(filter_items){
    var groups = [];
    var non_grouped_items = [];

    // Group by KEY_GROUPINGS first
    var grouping_keys = Object.keys(KEY_GROUPINGS);
    var grouping_dict = {};
    var groupable_keys = [];

    // Set up a dict of groups: filter items
    for (var i = 0; i < grouping_keys.length; i++){
        var current_group = grouping_keys[i];
        var group = KEY_GROUPINGS[current_group];
        for (var j = 0; j < group.length; j++){
            KEYS_TO_GROUPS[group[j]] = current_group;
            groupable_keys.push(group[j]);
        }
        grouping_dict[current_group] = [];
    }

    // populate the group: filter items dict
    for (var i = 0; i < filter_items.length; i++){
        var cur_filter_item = filter_items[i];
        var item_key = cur_filter_item.key;
        if (groupable_keys.indexOf(item_key) >= 0){
            grouping_dict[KEYS_TO_GROUPS[item_key]].push(cur_filter_item);
        } else {
            // If the item can't be grouped, add it to non_grouped_items
            non_grouped_items.push(cur_filter_item);
        }
    }

    // add the groups of filter items that are non-empty
    for (var i = 0; i < grouping_keys.length; i++){
        if (grouping_dict[grouping_keys[i]].length > 0){
            groups.push(grouping_dict[grouping_keys[i]]);
        }
    }

    // Create groups for the rest of the filter items (which should be split, around, or ratio)
    // around should be grouped by the same key
    for (var i = 0; i < non_grouped_items.length; i++){
        var cur_filter_item = non_grouped_items[i];
        var new_group = [];
        if (cur_filter_item.type == TYPE_SPLIT_BY){
            // create 2 new filter items - < value and > value
            var lt_item = new FilterItem(cur_filter_item.key, TYPE_LT, cur_filter_item.values);
            var gt_item = new FilterItem(cur_filter_item.key, TYPE_GT, cur_filter_item.values);
            new_group = [lt_item, gt_item];
        } else if (cur_filter_item.type == TYPE_AROUND){
            // TODO: Adjust min and max so that it has a better range to it
            // (i.e. based on a % of that column's average)
            var filter_min = cur_filter_item.values[0] - cur_filter_item.values[0] * 0.1;
            var filter_max = cur_filter_item.values[0] + cur_filter_item.values[0] * 0.1;
            new_group = [new FilterItem(cur_filter_item.key, TYPE_BETWEEN, [filter_min, filter_max])];
        } else if (cur_filter_item.type == TYPE_RATIO){
            // TODO: implement ratio
            var other = cur_filter_item.values[0];
            var ratio_pairs = getRatioGroups(cur_filter_item.key, other);

            // default should be 1:1 1:2 2:1 if possible
            var one_one = new FilterItem(cur_filter_item.key, TYPE_RATIO, [other, ratio_pairs[0][0], ratio_pairs[0][1]]);
            var one_two = new FilterItem(cur_filter_item.key, TYPE_RATIO, [other, ratio_pairs[1][0], ratio_pairs[1][1]]);
            var two_one = new FilterItem(cur_filter_item.key, TYPE_RATIO, [other, ratio_pairs[2][0], ratio_pairs[2][1]]);

            new_group = [one_one, one_two, two_one]
        }
        groups.push(new_group);

    }

    return groups;
}

function raiseFilterSetError(count){
    $("#filter-error-count").html(count);
    $("#filter-error").show();
}

/**
 * Takes a list of filter item groupings and returns filter sets based on those.
 */
function createFilterSetsFromGroups(filter_groups){
    var original_set = new FilterSet([]);

    original_set.name = '';

    var current = [original_set];

    for (var i = 0; i < filter_groups.length; i++){
        var current_group = filter_groups[i];
        var new_set = [];

        for (var j = 0; j < current_group.length; j++){
            var current_item = current_group[j];

            for (var k = 0; k < current.length; k++){
                var current_set_item = current[k];
                var new_filter_set = new FilterSet(current_set_item.filters.slice());
                new_filter_set.name = current_set_item.name;
                // Make a new filterset which is that set +
                // current_item
                new_filter_set.filters.push(current_item);

                new_filter_set.name = new_filter_set.getName();
                new_set.push(new_filter_set);

                if (new_set.length > 6){
                    new_set = new_set.slice(0, 6);
                    var total_combinations = 1;
                    for (var n = 0; n < filter_groups.length; n++){
                        total_combinations *= filter_groups[n].length
                    }

                    raiseFilterSetError(total_combinations);

                    break;
                }
            }

        }

        current = new_set;
    }

    return current;
}


/**
 * Reload the filter sets to match the sets passed in and
 * update FILTER_SETS
 */
function updateFilterSetDisplay(sets){
    // remove all filters
    $(".filter-set").remove();

    // add in new sets
    for (var i = 0; i < sets.length; i++){
        addFilterSet();
        var current_filter_set = $(".filter-set")[i];

        var current_set = sets[i];
        for (var j = 0; j < current_set.filters.length; j ++){
            $(current_filter_set).find('.add-filter-item-button').click();
            var current_item = $(current_filter_set).find('.filter-section')[j];
            var current_item_key = current_set.filters[j].key;

            if (Object.keys(KEYS_TO_GROUPS).indexOf(current_item_key) > -1){
                var group = KEYS_TO_GROUPS[current_item_key];
                $(current_item).find('.filter-name-select').val(group).change();

                var checkboxes = $(current_item).find('.filter-checkbox');
                for (var k = 0; k < checkboxes.length; k++){
                    var current_checkbox = $(checkboxes[k]);
                    if (current_checkbox.val() == current_item_key){
                        current_checkbox.prop('checked', true);
                    }
                }

            } else {
                // change the LT/GT/Between/sort of things
                $(current_item).find('.filter-name-select').val(current_item_key).change();
                var current_type = current_set.filters[j].type;
                var current_values = current_set.filters[j].values;

                $(current_item).find('.filter-type-select').val(current_type).change();

                if (current_type == TYPE_EQ || current_type == TYPE_GT || current_type == TYPE_LT){
                    $(current_item).find('.filter-range-input').val(current_values[0]);
                } else if (current_type == TYPE_RATIO){
                    var inputs = $(current_item).find('.filter-range-input');
                    for (var k = 0; k < inputs.length; k++){
                        $(inputs[k]).val(current_values[k]).change();
                    }
                }
            }
        }
    }

    FILTER_SETS = sets;
}

/**
 * Takes a list of FilterItems and returns sets from it.
 * Calls on groupFilterItems and createFilterSetsFromGroups.
 */
function generateFilters(filter_items){
    $("#filter-error").hide();
    var groups = groupFilterItems(filter_items);
    var sets = createFilterSetsFromGroups(groups);

    // Update the UI to show those FILTER_SETS
    updateFilterSetDisplay(sets);
}


var FILTER_SETS = [];

var CURRENT_COLOURS = BASE_COLOURS.slice();
var CURRENT_NAMES = ["Set 1", "Set 2", "Set 3", "Set 4", "Set 5", "Set 6"];

currentFilterSet = undefined;

// TODO: Add in No Commercialization
// Make sizing proportional to the amount of data that we have
// (i.e. if we have more data for full professor than mid-level, make the size proportional to that/to show that -- same with project)
// Decision:
//    - Full visualization; zoom in on certain nodes; eliminate/select multiple nodes that they want to keep/discard

editor_sankey = null;

/**
 * Set up a single visualization; all nodes have a size of 1; all links are also 1.
 * #sankey-editor is the one with the full canvas drawn on it
 * When a node is clicked, toggle that node's is_hidden property
 * When we're back in Explore/View mode, we just re-draw all of the nodes again but skip the ones that have isActive off via
 * the function drawSankeys. The filters used are those specified.
 */
function setUpEditor(){
    if (editor_sankey == null){
        initializeEditorSankey();
        initializeKeyOrder(editor_sankey.nodes);
        initializeKeysToLabels(editor_sankey.nodes);
        initializeFilterExclusions();
        addFilterSet();
        generateFilterOptions();
    } else {
        sankey = editor_sankey;
        sankey.drawAll();
    }
}

ADVANCED = 0;

function toggleAdvanced(){
    if (ADVANCED == 0){
        $("#advanced-label").html("Hide Advanced Options");
        $("#advanced").show();
    } else {
        $("#advanced-label").html("Show Advanced Options");
        $("#advanced").hide();
    }

    ADVANCED = 1 - ADVANCED;
}

function toggleEditting(){
    EDITING = !EDITING;

    if (EDITING == false){
        sankey = updateSankey();
        applyFilters();
        drawSankeys();
        $("#toggle-button").html("Edit and Filter");
        $(".filter-details").hide();
        $("#shortcut-panel").hide();
        $("#autogenerate-explanation").hide();
    } else {
        setUpEditor();
        $("#toggle-button").html("Show Changes");
        $(".filter-details").show();
        $("#shortcut-panel").show();
        $("#autogenerate-explanation").show();
    }
}

/**
 * Read the data from the front-end to create the filters in FILTER_SETS
 */
function createFilterSets(){
    FILTER_SETS = [];

    // Update the colours of CURRENT_COLOURS

    return
}

function changeSplitOption(e){
    var target = e.target;
    var type = $(target).val();
    var html = generateSplitOptionValue(type);
    $(target).next().remove();
    $(target).after(html);
}

function generateFilterOptions(){
    updateGenerateFiltersButton();
    $("#autogenerate-characteristics").show();
    // $("#autogenerate-button").removeClass("ungenerated");
    // $("#autogenerate-button").addClass("generated");

    // empty generated characteristics
    $("#generated-characteristics").html('');

    // get the characteristics that are visible
    // (skip over grouping names)

    var visible_characteristics = [];

    var all_nodes = sankey.nodes;
    for (var i = 0; i < all_nodes.length; i++){
        for (var j = 0; j < all_nodes[i].length; j++){
            var cur_node = all_nodes[i][j];
            if (cur_node.key != "project" && cur_node.key != "license" && cur_node.key != "startup"
                && cur_node.key != "commercialization" && cur_node.is_hidden == 0){
                if (Object.keys(KEY_GROUPINGS).indexOf(cur_node.key) == -1 &&  UNFILTERABLE.indexOf(cur_node.key) == -1){
                    visible_characteristics.push(cur_node.key);
                }
            }
        }
    }
    
    var grouped_items = [];

    // Go through each of the groupings
    // If at least one attribute in visible_characteristics is in that grouping
    // Add that to the checklist
    var grouping_keys = Object.keys(KEY_GROUPINGS);
    for (var i = 0; i < grouping_keys.length; i++){
        var group_key = grouping_keys[i];
        var group_options = KEY_GROUPINGS[group_key];
        var options_in_current_group = [];
        for (var j = 0; j < group_options.length; j ++){
            for (var k = 0; k < visible_characteristics.length; k++){
                if (visible_characteristics[k] == group_options[j]){
                    options_in_current_group.push(visible_characteristics[k]);
                    grouped_items.push(visible_characteristics[k])
                }
            }
        }

        if (options_in_current_group.length > 0){
            $("#generated-characteristics").append(generateCharacteristicGroup())
            // add new characteristic group
            var char_groups = $("#generated-characteristics").find('.characteristic-group');
            var newest_group = $(char_groups[char_groups.length - 1]);

            // add all items in options_in_current_group to newest_group
            for (var j = 0; j < options_in_current_group.length; j++){
                var current_characteristic = options_in_current_group[j];
                newest_group.append(makeCheckedOption(current_characteristic));
            }
        }
        
    }

    // Afterwards, add all the other characteristics
    for (var i = 0; i < visible_characteristics.length; i++){
        var current_characteristic = visible_characteristics[i];
        if (grouped_items.indexOf(current_characteristic) == -1){
            $("#generated-characteristics").append(generateCharacteristicGroup())
            var char_groups = $("#generated-characteristics").find('.characteristic-group');
            var newest_group = $(char_groups[char_groups.length - 1]);
            newest_group.append(makeSplitOption(current_characteristic));
            $(".split-type").change(changeSplitOption)
        }
    }

    $("#generated-characteristics input").change(updateGenerateFiltersButton);
    $(".split-type").change(updateGenerateFiltersButton);
    $(".filter-split-value").change(updateGenerateFiltersButton); 
}

function generateCharacteristicGroup(){
    var group_html = "<div class='characteristic-group'></div>";
    return group_html;
}

function makeCheckedOption(characteristic_key){
    var current_id = ID_NUMBER.toString();
    ID_NUMBER = ID_NUMBER + 1;

    var check_id = 'gen-label-' + characteristic_key + current_id;

    var option_html = "<input type='checkbox' id='" + check_id + "' class='filter-checkbox' value='" + characteristic_key + "' ><label for='" + check_id + "'>" + KEYS_TO_LABELS[characteristic_key] + "</label>";
    return option_html;
}

function generateSplitOptionValue(type, id = ''){
    if (id != ''){
        id = " id = '" + id + "'"
    }
    if (type == TYPE_SPLIT_BY){
        return "<input type='text' " + id + " class='filter-split-value' value='0'>";
    }

    if (type == TYPE_RATIO){
        var html =  "<select class='filter-split-value' " + id + " value='0'>";
        html += createRatioOptions();
        html += "</select>";
        return html;
    }
}

function makeSplitOption(characteristic_key){

    var current_id = ID_NUMBER.toString();
    ID_NUMBER = ID_NUMBER + 1;

    var check_id = 'gen-label-' + characteristic_key + current_id;
    var text_id = 'gen-val-label-' + characteristic_key + current_id;
    
    var option_html = "<input type='checkbox' id='" + check_id + "' class='filter-checkbox split-checkbox' value='" + characteristic_key + "'>";
    
    option_html += "<label for='" + check_id + "'>" + KEYS_TO_LABELS[characteristic_key] 

    var select_id = 'gen-select-id-' + characteristic_key + current_id;

    // create the selection choices using AUTO_TYPES_TO_LABELS
    var auto_choices = "<select id='" + select_id + "' class='split-type'>";
    var choices = Object.keys(AUTO_TYPES_TO_LABELS);
    for (var i = 0; i < choices.length; i++){
        var val = choices[i];
        var label = AUTO_TYPES_TO_LABELS[val];
        auto_choices += "<option value='" + val + "'>" + label + "</option>";
    }
    auto_choices += "</select>";

    option_html += auto_choices;

    option_html += generateSplitOptionValue(choices[0], text_id) + "</label>";
    return option_html;
}

function updateGenerateFilterOptionsButton(){
    // $("#autogenerate-button").removeClass("generated");
    // $("#autogenerate-button").addClass("ungenerated");
}

function listifyFilterSets(){
    var list = '';

    for (var i = 0; i < FILTER_SETS.length; i++){
        list += "<li>" + FILTER_SETS[i].getName() + "</li>"
    }

    return "<ul>" + list + "</ul>";
}

function selectGenerateFilters(){
    $("#generate-filters-button").removeClass("ungenerated");
    $("#generate-filters-button").addClass("generated");
    $("#generate-filter-text").show()

    // create filteritems
    var all_filter_items = [];

    var all_checked = $("#generated-characteristics input:checkbox:checked");

    for (var i = 0; i < all_checked.length; i++){
        var current_item = $(all_checked[i]);
        var item_key = $(all_checked[i]).val();
        if (current_item.hasClass("split-checkbox")){
            // get the value to split by
            var type = current_item.next().find(".split-type").val();
            var split_value = current_item.next().find(".filter-split-value").val();

            if (type == TYPE_SPLIT_BY){
                split_value = parseFloat(split_value);
            }

            all_filter_items.push(new FilterItem(item_key, type, [split_value]));
        } else {
            // add it as a boolean
            all_filter_items.push(new FilterItem(item_key, TYPE_EQ, [1]));

        }
    }

    generateFilters(all_filter_items);

    $("#generate-filter-number").html(FILTER_SETS.length);
    $("#generate-filter-list").html(listifyFilterSets());
}


function updateGenerateFiltersButton(){
    $("#generate-filters-button").removeClass("generated");
    $("#generate-filters-button").addClass("ungenerated");
}

function init(){
    initKeysToGroups()
    $("#toggle-button").click(toggleEditting);
    $('#advanced-label').click(toggleAdvanced);
    $("#generate-filters-button").click(selectGenerateFilters);
    $("#advanced").hide();
    $("#autogenerate-characteristics").hide();
    toggleEditting();
    toggleEditting();
}

/**
 * Update KEY_ORDER to contain the order we would prefer keys to be in (top to bottom)
 */
function initializeKeyOrder(nodes){
    KEY_ORDER = [];
    var starting_nodes = nodes[nodes.length - 1];

    for (var i = 0; i < starting_nodes.length; i++){
        var ko = getConnectedKeys(starting_nodes[i]);
        for (var j = 0; j < ko.length; j++){
            var cur_key = ko[j];
            if (!KEY_ORDER.includes(cur_key)){
                KEY_ORDER.push(cur_key);
            }
        }
    }
}

function initializeFilterExclusions(){
    FILTER_EXCLUSIONS = [];

    var keys = Object.keys(KEY_GROUPINGS);
    for (var i = 0; i < keys.length; i++){
        var current = keys[i];
        for (var j = 0; j < KEY_GROUPINGS[current].length; j++){
            FILTER_EXCLUSIONS.push(KEY_GROUPINGS[current][j]);
        }
    }
}

function initializeKeysToLabels(nodes){
    for (var i = 0; i < nodes.length; i++){
        for (var j = 0; j < nodes[i].length; j ++){
            var node = nodes[i][j];
            var k = node.key;
            var label = node.label;
            KEYS_TO_LABELS[k] = label;
        }
    }
}

function createFilterDropdown(){
    var html = "<select class='filter-name-select'>";
    html += "<option value='' selected disabled hidden>Select a characteristic</option>";
    var keys = Object.keys(KEYS_TO_LABELS);
    for (var i = 0; i < keys.length; i++){
        var value = keys[i];
        if (FILTER_EXCLUSIONS.indexOf(value) == -1 && UNFILTERABLE.indexOf(value) == -1){
            var label = KEYS_TO_LABELS[value];
            html += "<option value='" + value + "'>" + label + "</option>";
        }
    }
    return html + "</select>"
}

function createFilterType(){
    var html = "<select class='filter-type-select'>";
    var keys = Object.keys(TYPES_TO_LABELS);
    for (var i = 0; i < keys.length; i++){
        var value = keys[i];
        var label = TYPES_TO_LABELS[value];
        html += "<option value='" + value + "'>" + label +"</option>";
    }
    return html + "</select>"
}


function createRatioOptions(){
    var boolean_values = [];
    var key_grouping_keys = Object.keys(KEY_GROUPINGS);
    for (var i = 0; i < key_grouping_keys.length; i++){
        var cur_key = key_grouping_keys[i];
        boolean_values.push(cur_key);
        for (var j = 0; j < KEY_GROUPINGS[cur_key].length; j++){
            boolean_values.push(KEY_GROUPINGS[cur_key][j]);
        }
    }

    html = "<option value='' selected disabled hidden>Select a characteristic</option>";

    var keys = Object.keys(KEYS_TO_LABELS);
    for (var i = 0; i < keys.length; i++){
        var value = keys[i];
        if (FILTER_EXCLUSIONS.indexOf(value) == -1 && UNFILTERABLE.indexOf(value) == -1
            && boolean_values.indexOf(value) == -1){
            var label = KEYS_TO_LABELS[value];
            html += "<option value='" + value + "'>" + label + "</option>";
        }
    }
    return html;

}
function createFilterRange(type){
    if (type == ''){
        return '';
    }

    if (type == TYPE_RATIO){
        // create a ratio choice instead
        var html = '';
        html += "<select class='filter-range-input'>";
        html += createRatioOptions();
        html += "</select>"

        html += "<input class='filter-range-input' type='text'> : <input class='filter-range-input' type='text'>";

        return html;
    }

    var input = "<input class='filter-range-input' type='text'>";
    var additional_inputs = TYPES_TO_NUMBER[type] - 1;

    var html = input;
    while (additional_inputs > 0){
        html += " - " + input;
        additional_inputs -= 1;
    }

    return html;
}

function changeFilterType(e){
    // Whenever a filter type changes, run this to make
    // createFilterRange match
    var filter_type = e.target;
    var filter_range = $(filter_type).next();
    var type = $(filter_type).val();
    filter_range.html(createFilterRange(type));
}

function createFilterItem(container_id){
    var id = "filter-id" + ID_NUMBER.toString();
    ID_NUMBER = ID_NUMBER + 1;

    var all_html = "<div id = '" + id + 
                   "' class='filter-section'>" + 
                   createRemoveFilterButton() +
                   createFilterDropdown() +
                   "</div>";

    $("#" + container_id).append(all_html);
    $("#" + id + " .filter-name-select").change(changeFilterItemType);
    
    $("#" + id + " .remove-filter-item-button").click(removeFilterItem);
}

function createFilterData(name){
    var filter_html = "";

    var grouped_keys = Object.keys(KEY_GROUPINGS);
    if (grouped_keys.indexOf(name) == -1){
        var range_html = "<div class='filter-range'>" + createFilterRange(TYPE_GT) + "</div>";
        filter_html = createFilterType() + range_html;
    } else {
        var selection_keys = KEY_GROUPINGS[name];
        for (var i = 0; i < selection_keys.length; i++){
            var current_key = selection_keys[i];
            var current_id = ID_NUMBER.toString();
            ID_NUMBER = ID_NUMBER + 1;

            var check_id = 'filter-label-' + current_key + current_id;
            var checkbox  = "<input type='checkbox' id='" + check_id + "' class='filter-checkbox' value='" + current_key + "'><label for='" + check_id + "'>" + KEYS_TO_LABELS[current_key] + "</label>";
            filter_html += checkbox;
        }
    }

    return filter_html;
}

function changeFilterItemType(e){
    var filter_name = $(e.target);
    var name = $(filter_name).val();
    var id = $($(e.target).parent()).attr('id');

    // Remove current filter stuff

    var filter_html = "<div class='filter-data'>" +
                      createFilterData(name);
                      "</div>";

    var current_data = $($(e.target).parent()).find(".filter-data")
    if (current_data.length > 0){
        $(current_data[0]).remove();
    }
    $($(e.target).parent()).append(filter_html);

    $("#" + id + " .filter-type-select").change(changeFilterType);
}

function createAddFilterItemButton(){
    var html = "<div class = 'add-filter-item-button'>+ Add Filter</div>"
    return html;
}

function createRemoveSetButton(){
    var html = "<div class = 'remove-filter-set-button'>&#215; Remove Filter Set</div>"
    return html;
}

function createRemoveFilterButton(){
    var html = "<div class = 'remove-filter-item-button'>&#215;</div>"
    return html;
}

function createFilterItemArea(){
    var id = "filter-item-area-id" + ID_NUMBER.toString();
    ID_NUMBER = ID_NUMBER + 1;

    var all_html = "<div class='filter-item-area' id='" + id + "'></div>";

    return all_html;
}


function addFilterSet(){
    var id = "filter-set-id" + ID_NUMBER.toString();
    ID_NUMBER = ID_NUMBER + 1;

    var num_sets = $(".filter-set").length;
    var colour = BASE_COLOURS[num_sets];
    var font_colour = getDarker(colour, -0.5)

    var style = "background: " + colour +"; color: " + font_colour;


    var all_html = "<div class='filter-set' style='" + style +"' id='" + id + "'>" + 
                   createFilterItemArea() + 
                   createAddFilterItemButton() +
                   createRemoveSetButton() + "</div>";

    $("#all-filters").append(all_html);

    $("#" + id + " .add-filter-item-button").click(addFilterItem);
    $("#" + id + " .remove-filter-set-button").click(removeFilterSet);
}

function adjustColours(){
    var all_sets = $(".filter-set");
    for (var i = 0; i < all_sets.length; i++){
        $(all_sets[i]).css('background', BASE_COLOURS[i]);
        $(all_sets[i]).css('color', getDarker(BASE_COLOURS[i], -0.5));
    }
}

function addFilterItem(e){
    // find filter-item-area in e.target.parent
    var filter_area = $(e.target).parent();
    var filter_item_area = $(filter_area).find(".filter-item-area");
    createFilterItem(filter_item_area.attr('id'));
}

function removeFilterSet(e){
    $($(e.target).parent()).remove();
    adjustColours();
}

function removeFilterItem(e){
    $($(e.target).parent()).remove();
}

/**
 * Get the order of all keys connected to node
 */
function getConnectedKeys(node){
    var ret_list = [node.key];
    var incoming = node.incoming_nodes;

    for (var m = 0; m < incoming.length; m++){
        var prev_node = incoming[m];
        var new_order = getConnectedKeys(prev_node);
        for (var n = 0; n < new_order.length; n++){
            var next_key = new_order[n];
            if (!ret_list.includes(next_key)){
                ret_list.push(next_key);
            }
        }
    }

    return ret_list;
}

/*
 * Create the Sankey setup based off editor_sankey
 */ 
function updateSankey(data, mappings){
    var all_nodes = {};
    var original_nodes = {};

    // Set up the nodes and links

    // Make a dictionary of all of the nodes
    for (var i = 0; i < editor_sankey.nodes.length; i++){
        for (var j = 0; j < editor_sankey.nodes[i].length; j++){
            var cur_node = editor_sankey.nodes[i][j];
            var node_copy = new UniSankeyNode(cur_node.key, cur_node.label, cur_node.type, 
                cur_node.scale, cur_node.base, cur_node.x, cur_node.y, cur_node.skip);
            node_copy.print_scale = cur_node.print_scale;
            node_copy.is_product = cur_node.is_product;
            node_copy.is_hidden = cur_node.is_hidden;
            node_copy.force_y = cur_node.force_y;
            node_copy.omit_definition = cur_node.omit_definition;
            if (cur_node.is_hidden == 0){
                all_nodes[cur_node.key] = node_copy;
            }
            original_nodes[cur_node.key] = cur_node;
        }
    }

    // Get all of the links to make
    var all_links = {};
    var node_keys = Object.keys(all_nodes);

    for (var i = 0; i < node_keys.length; i++){
        var k = node_keys[i];
        var current_node = original_nodes[k];
        var links = current_node.links;

        var all_paths = [];

        for (var j = 0; j < links.length; j++){
            var link_k = links[j].endNode.key;
            var paths = _getNonHiddenNodes(all_nodes, original_nodes, link_k);
            for (var z = 0; z < paths.length; z++){
                if (!all_paths.includes(paths[z])){
                    all_paths.push(paths[z]);
                }
                
            }
        }
        all_links[k] = all_paths;
    }

    var ordered_keys = KEY_ORDER;

    // Make all of the links
    for (var i = 0; i < node_keys.length; i++){
        var k = node_keys[i];
        var cur_node = all_nodes[k];

        for (var j = 0; j < ordered_keys.length; j++){
            var new_key = ordered_keys[j];
            if (all_links[k].includes(new_key)){
                cur_node.createLink(all_nodes[new_key])
            }
        }
    }

    // Build up the levels (from the end to the start; fill backwards; avoid duplicates)
    var new_sankey = new UniSankey();

    // Find out the levels each node should be added on
    var level_dict = {};
    var max_levels = getLevels(all_nodes, level_dict);

    var by_level = {};
    for (var i = 0; i <= max_levels; i++){
        by_level[i] = [];
    }

    // Add them in order from top to bottom (based on the priority in KEY_ORDER)
    for (var i = 0; i < KEY_ORDER.length; i++){
        var k = KEY_ORDER[i];
        if (node_keys.includes(k)){
            var k_level = level_dict[k];
            by_level[k_level].push(k);
        }
    }

    // Remove links between things with a depth difference > 1
    // Reset all links
    for (var i = 0; i < node_keys.length; i++){
        var k = node_keys[i];
        var cur_node = all_nodes[k];
        cur_node.links = [];
        cur_node.incoming_nodes = [];
    }

    // Re-add all links
    for (var i = 0; i < node_keys.length; i++){
        var k = node_keys[i];
        var cur_node = all_nodes[k];

        for (var j = 0; j < ordered_keys.length; j++){
            var new_key = ordered_keys[j];
            if (all_links[k].includes(new_key)){
                // Add the link only if the difference in depth is 1
                var this_depth = level_dict[k];
                var other_depth = level_dict[new_key];
                if (other_depth - this_depth == 1){
                    cur_node.createLink(all_nodes[new_key])
                }
            }
        }
    }


    for (var i = 0; i <= max_levels; i++){
        var cur_level = by_level[i];
        for (var j = 0; j < cur_level.length; j++){
            var cur_key = cur_level[j];
            var cur_node = all_nodes[cur_key];
            new_sankey.addNode(cur_node, i);
        }
    }

    return new_sankey;
}

/**
 * Update d to contain all of the levels and return the highest value.
 */
function getLevels(nodes, d){
    var node_keys = Object.keys(nodes);
    for (var i = 0; i < node_keys.length; i++){
        var cur_node = nodes[node_keys[i]];
        updateLongestPath(cur_node, d, 0);
    }

    // Find the min so we can adjust the indexes to start at 0
    var d_keys = Object.keys(d);
    var cur_min = d[d_keys[0]];
    for (var i = 0; i < d_keys.length; i++){
        var cur_key = d_keys[i];
        if (d[cur_key] < cur_min){
            cur_min = d[cur_key];
        }
    }

    var add_this = cur_min * -1;
    var max = 0;
    for (var i = 0; i < d_keys.length; i++){
        var cur_key = d_keys[i];
        d[cur_key] = d[cur_key] + add_this;
        if (d[cur_key] > max){
            max = d[cur_key];
        }
    }

    return max;
}

function updateLongestPath(node, d, depth){
    var ks = Object.keys(d);

    var incoming = node.incoming_nodes;

    var length = depth;

    for (var i = 0; i < incoming.length; i++){
        updateLongestPath(incoming[i], d, depth - 1);
    }

    if (ks.includes(node.key)){
        if (d[node.key] < length){
            length = d[node.key];
        }
    }

    d[node.key] = length;
}

/**
 * Return a list of the first non-hidden nodes linked to by key
 */
function _getNonHiddenNodes(copies, original, key){
    var current_node = original[key];
    if (current_node.is_hidden == 0){
        return [current_node.key];
    }

    if (current_node.links.length == 0){
        return [];
    }

    var links = [];
    for (var i = 0; i < current_node.links.length; i++){
        var cur_link = current_node.links[i];
        var connected_nodes = _getNonHiddenNodes(copies, original, cur_link.endNode.key);
        for (var j = 0; j < connected_nodes.length; j++){
            links.push(connected_nodes[j]);
        }
    }    

    return links;
}

function scaleSet(set, scale){
    var all_keys = Object.keys(set);

    for (var i = 0; i < all_keys.length; i++){
        var k = all_keys[i];
        set[k][0] = set[k][0] * scale;
        for (var j = 0; j < set[k][1].length; j++){
            set[k][1][j] = set[k][1][j] * scale;
        }
    }
}

function setFilterSets(){
    FILTER_SETS = [];

    var filter_set_divs = $(".filter-set");
    var num_sets = filter_set_divs.length;

    for (var i = 0; i < num_sets; i++){
        var current_filter_set = $(filter_set_divs[i]);
        var filter_items = [];

        var filter_set_items = current_filter_set.find(".filter-section");
        var num_filter_items = filter_set_items.length;
        for (var j = 0; j < num_filter_items; j++){
            var current_filter_item = $(filter_set_items[j]);
            var name = $(current_filter_item).find(".filter-name-select").val();

            if (Object.keys(KEY_GROUPINGS).indexOf(name) == -1){
                var type = $(current_filter_item).find(".filter-type-select").val();
                var type_amount = TYPES_TO_NUMBER[type];

                var filter_range = $(current_filter_item).find(".filter-range");
                var filter_range_inputs = $(filter_range).find(".filter-range-input");

                var range_values = [];
                for (var k = 0; k < type_amount; k++){
                    var current_input = $(filter_range_inputs[k]);
                    var current_input_value = current_input.val();
                    var range_value = parseFloat(current_input_value);

                    if (!isNaN(range_value)){
                        range_values.push(range_value);
                    } else if (type == TYPE_RATIO && k == 0){
                        range_values.push(current_input_value);
                    }
                }

                if (range_values.length == type_amount){
                    var new_filter_item = new FilterItem(name, type, range_values);
                    filter_items.push(new_filter_item);
                }
            } else {
                // Go through each select
                // Filter = 0 if selected, otherwise 1
                var all_checkboxes = $(current_filter_item).find(".filter-checkbox");
                for (var k = 0; k < all_checkboxes.length; k++){
                    var current_checkbox = all_checkboxes[k];
                    var select_name = $(current_checkbox).val();
                    var type = TYPE_EQ;
                    var range_values = [0];
                    if (current_checkbox.checked == true){
                        range_values[0] = 1;
                    }
                    var new_filter_item = new FilterItem(select_name, type, range_values);
                    filter_items.push(new_filter_item);
                }
            }

        }

        var new_filter_set = new FilterSet(filter_items);
        new_filter_set.name = new_filter_set.getName();
        FILTER_SETS.push(new_filter_set);
    }
}


/**
 * Given a set of FilterSets, display them.
 *
 */
function displaySpecificFilterSets(filter_sets){
    FILTER_SETS = filter_sets;
    var set_template = sankeyToSetTemplate(sankey);

    unisankeysets = [];
    for (var i = 0; i < FILTER_SETS.length; i++){
        var new_data = FILTER_SETS[i].apply(CSV_DATA, KEY_TO_COLUMNS);
        var normalized_data = normalizeData(CSV_DATA, new_data, KEY_TO_COLUMNS);
        var new_set = dataToSet(normalized_data, KEY_TO_COLUMNS, set_template);
        scaleSet(new_set, 1);
        unisankeysets.push(new UniSankeySet(new_set, SANKEY_CANVAS[i], CURRENT_COLOURS[i], sankey, FILTER_SETS[i].name));
    }

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

/*
 * Apply the filters specified in [whatever] to sankey
 * (creates and updates new sets)
 */
function applyFilters(){
    setFilterSets();
    var set_template = sankeyToSetTemplate(sankey);

    unisankeysets = [];
    for (var i = 0; i < FILTER_SETS.length; i++){
        var new_data = FILTER_SETS[i].apply(CSV_DATA, KEY_TO_COLUMNS);
        var normalized_data = normalizeData(CSV_DATA, new_data, KEY_TO_COLUMNS);
        var new_set = dataToSet(normalized_data, KEY_TO_COLUMNS, set_template);
        scaleSet(new_set, 1);
        unisankeysets.push(new UniSankeySet(new_set, SANKEY_CANVAS[i], CURRENT_COLOURS[i], sankey, FILTER_SETS[i].name));
    }

    sankey.sets = unisankeysets;
}

/*
 *
 */

/**
 * Apply the filters in filters to all of the sankey nodes in sankey (in order of their canvases):
 * sankey-canvas, sankey-canvas2, sankey-canvas3, sankey-canvas4
 * (i.e. hide the layers with no filters on them.)
 * Filters are in the form [key, type (FILTER_BETWEEN or FILTER_EQUALITY), min, max]
 * Maybe we should create functions that take in a data set and filter the key; map various keys to functions based on how they
 * should be scaled.
 */
function drawSankeys(filters){
    // Filter CSV_DATA using KEY_TO_COLUMNS
    applyFilters(CSV_DATA, KEY_TO_COLUMNS);
    sankey.drawAll();
}




function initializeEditorSankey(){
    createProjectCommercializationNodes();
    currentFilterSet = noFilter;
    sankey = new UniSankey();

    // Nodes connected to University
    ip = new UniSankeyNode("ip", "IP Owner");
    // ip.force_y = 50;
    ip.skipNode();
    ip_uni = new UniSankeyNode("university", "University");
    ip_creator = new UniSankeyNode("creator", "Creator");
    ip.omit_definition = 1;

    award_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["faculty_awards"]);
    faculty_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["university_faculty"]);
    capacity_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["research_capacity"]);
    budget_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["university_operations"]);
    ranking_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["reputation_ranking", "research_ranking"]);
    exp_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["tto_experience"]);
    staff_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["tto_staff"]);

    awards = new UniSankeyNode("faculty_awards", "Awards", "plain", award_scale);
    faculty = new UniSankeyNode("university_faculty", "Faculty", "plain", faculty_scale);
    capacity = new UniSankeyNode("research_capacity", "Research Budget", "monetary", capacity_scale)
    operations = new UniSankeyNode("university_operations", "Budget per Student", "monetary", budget_scale);
    reputation = new UniSankeyNode("reputation_ranking", "Reputation Ranking", "plain", ranking_scale);
    research_ranking = new UniSankeyNode("research_ranking", "Research Ranking", "plain", ranking_scale);
    inventions = new UniSankeyNode("invention_disclosures", "Invention Disclosures", "plain", ranking_scale);
    tto_exp = new UniSankeyNode("tto_experience", "TTO Experience", "plain", exp_scale);
    tto_staff = new UniSankeyNode("tto_staff", "TTO Staff", "plain", staff_scale);

    uni = new UniSankeyNode("uni", "Researcher's University");
    uni.omit_definition = 1;

    ip.createLink(ip_uni);
    ip.createLink(ip_creator);
    ip_uni.createLink(uni);
    ip_creator.createLink(uni);
    awards.createLink(uni);
    faculty.createLink(uni);
    capacity.createLink(uni);
    operations.createLink(uni);
    reputation.createLink(uni);
    inventions.createLink(uni);
    tto_exp.createLink(uni);
    tto_staff.createLink(uni);
    
    sankey.addNode(ip, 0);

    sankey.addNode(ip_uni, 1);
    sankey.addNode(ip_creator, 1);
    sankey.addNode(awards, 1);
    sankey.addNode(faculty, 1);
    sankey.addNode(capacity, 1);
    sankey.addNode(operations, 1);
    sankey.addNode(reputation, 1);
    sankey.addNode(inventions, 1);
    sankey.addNode(tto_exp, 1);
    sankey.addNode(tto_staff, 1);

    // Nodes to connect to project (not researcher)
    stage = new UniSankeyNode("stage", "Research Stage");
    stage.omit_definition = 1;
    // stage.force_y = 280;
    field = new UniSankeyNode("field", "Field");
    field.omit_definition = 1;
    sankey.addNode(stage, 2);
    sankey.addNode(field, 2);

    earliest = new UniSankeyNode("earliest", "Earliest");
    midstage = new UniSankeyNode("mid-stage", "Mid-Stage");
    latest = new UniSankeyNode("latest", "Latest");
    stage.createLink(earliest);
    stage.createLink(midstage);
    stage.createLink(latest);
    earliest.createLink(project);
    midstage.createLink(project);
    latest.createLink(project);
    sankey.addNode(earliest, 3);
    sankey.addNode(midstage, 3);
    sankey.addNode(latest, 3);

    cit = new UniSankeyNode("cit", "CIT");
    mm = new UniSankeyNode("mm", "MM");
    eet = new UniSankeyNode("eet", "EET");
    photonics = new UniSankeyNode("photonics", "Photonics");
    field.createLink(cit);
    field.createLink(mm);
    field.createLink(eet);
    field.createLink(photonics);
    cit.createLink(project);
    mm.createLink(project);
    eet.createLink(project);
    photonics.createLink(project);
    sankey.addNode(cit, 3);
    sankey.addNode(mm, 3);
    sankey.addNode(eet, 3);
    sankey.addNode(photonics, 3);

    sankey.addNode(uni, 2);

    collab_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["researcher_interaction"]);
    interaction = new UniSankeyNode("researcher_interaction", "Prior Collaborations", "numbered", collab_scale);
    sankey.addNode(interaction, 2);


    // Nodes connected to researcher
    // position
    position = new UniSankeyNode("position", "Position");
    position.omit_definition = 1;
    staff = new UniSankeyNode("staff", "Staff");
    midlevel = new UniSankeyNode("mid-level", "Mid-Level");
    full_professor = new UniSankeyNode("full_professor", "Full Professor");
    distinguished = new UniSankeyNode("distinguished", "Distinguished");

    position.createLink(staff);
    position.createLink(midlevel);
    position.createLink(full_professor);
    position.createLink(distinguished);

    sankey.addNode(position, 1);
    sankey.addNode(staff, 2);
    sankey.addNode(midlevel, 2);
    sankey.addNode(full_professor, 2);
    sankey.addNode(distinguished, 2);
    

    // gender
    gender = new UniSankeyNode("gender", "Gender");
    gender.omit_definition = 1;
    male = new UniSankeyNode("male", "Male");
    female = new UniSankeyNode("female", "Female");

    gender.createLink(male);
    gender.createLink(female);

    sankey.addNode(gender, 1);
    sankey.addNode(male, 2);
    sankey.addNode(female, 2);

    age_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["phd_age"]);
    phd_age = new UniSankeyNode("phd_age", "PhD Age", "numbered", age_scale);
    sankey.addNode(phd_age, 2);    
    
    // firm
    num_firm = new UniSankeyNode("number_of_firms", "Number of Firms", "numbered");

    funding_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["proj_funding"]) * RESCALE_MAX['proj_funding'];

    firm_ik = new UniSankeyNode("firm_in-kind", "Firm (In-Kind)", "monetary", funding_scale);
    firm_cash = new UniSankeyNode("firm_cash", "Firm (Cash)", "monetary", funding_scale);
    firm_total = new UniSankeyNode("firm_total", "Firm (Total)", "monetary", funding_scale);

    firm_ik.print_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["proj_funding"]) * RESCALE_MAX['proj_funding'];
    firm_cash.print_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["proj_funding"]) * RESCALE_MAX['proj_funding'];
    firm_total.print_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["proj_funding"]) * RESCALE_MAX['proj_funding'];

    firm_size = new UniSankeyNode("firm_size", "Firm Size");
    firm_size.omit_definition = 1;
    micro = new UniSankeyNode("micro", "Micro");
    small = new UniSankeyNode("small", "Small");
    medium = new UniSankeyNode("medium", "Medium");
    large = new UniSankeyNode("large", "Large");

    // oce
    var label = "OCE Funding";

    oce = new UniSankeyNode("funding", label, "monetary", funding_scale);
    oce.print_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["proj_funding"]) * RESCALE_MAX['proj_funding'];

    // funding total

    num_firm.createLink(firm_ik);
    num_firm.createLink(firm_cash);

    firm_ik.createLink(firm_total);
    firm_cash.createLink(firm_total);

    num_firm.createLink(firm_size);
    firm_size.createLink(micro);
    firm_size.createLink(small);
    firm_size.createLink(medium);
    firm_size.createLink(large);


    // things that go to project
    length_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["length"]);
    distance_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["distance"]);
    length = new UniSankeyNode("length", "Project Length", "plain", length_scale);
    distance = new UniSankeyNode("distance", "Distance", "plain", distance_scale);

    length.createLink(project);
    distance.createLink(project);

    sankey.addNode(length, 3);
    sankey.addNode(distance, 3);

    researcher = new UniSankeyNode("researcher", "Researcher")
    researcher.omit_definition = 1;
    interaction.createLink(researcher);
    uni.createLink(researcher);
    staff.createLink(researcher);
    midlevel.createLink(researcher);
    full_professor.createLink(researcher);
    distinguished.createLink(researcher);
    male.createLink(researcher);
    female.createLink(researcher);
    phd_age.createLink(researcher);
    researcher.createLink(project);
    oce.createLink(project);
    firm_total.createLink(project);
    micro.createLink(project);
    small.createLink(project);
    medium.createLink(project);
    large.createLink(project);

    sankey.addNode(num_firm, 1);
    sankey.addNode(firm_ik, 2);
    sankey.addNode(firm_cash, 2);
    sankey.addNode(firm_size, 2);
    sankey.addNode(researcher, 3);
    sankey.addNode(oce, 3);
    sankey.addNode(firm_total, 3);
    sankey.addNode(micro, 3);
    sankey.addNode(small, 3);
    sankey.addNode(medium, 3);
    sankey.addNode(large, 3);

    // Add nodes to sankey
    sankey.addNode(project, 4);
    sankey.addNode(commercialization, 5);
    sankey.addNode(license, 6);
    sankey.addNode(startup, 6);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);

    // set up all the nodes -> value = 1
    editor_set = dataToSet(CSV_DATA, KEY_TO_COLUMNS, set_template);

    var all_keys = Object.keys(editor_set);
    for (var i = 0; i < all_keys.length; i++){
        var k = all_keys[i];
        editor_set[k][0] = EDITOR_HEIGHT;
        for (var j = 0; j < editor_set[k][1].length; j++){
            editor_set[k][1][j] = EDITOR_HEIGHT;
        }
    }

    unisankeysets = [new UniSankeySet(editor_set, "sankey-editor", EDITOR_COLOUR, sankey, "")];

    sankey.sets = unisankeysets;
    sankey.drawAll();

    editor_sankey = sankey;
}






/**
 * Redraw the filtered sankey_set (filtered by funding/month in range (new_min, new_max)).
 */
function monthlyFilterSet(sankey_set, new_mins, new_maxs){
    var monthly_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["monthly"]);
    var set_template = sankeyToSetTemplate(sankey);
    var new_data = monthly_filter(new_mins[0], new_maxs[0], monthly_scale);
    var new_set = dataToSet(new_data, KEY_TO_COLUMNS, set_template);
    filterSetEnd(sankey_set, new_set, new_mins, new_maxs, new_data);
}

function ratioFilter(sankey_set, new_mins, new_maxs){
    var normalizedCSV = normalizeColumns(CSV_DATA, KEY_TO_COLUMNS, ["firm_in-kind", "funding"]);
    var new_data = filterData(normalizedCSV, KEY_TO_COLUMNS, 'in-kind_ratio', FILTER_BETWEEN, [new_mins[0], new_maxs[0]]);
    var new_set = dataToSet(new_data, KEY_TO_COLUMNS, set_template);
    filterSetEnd(sankey_set, new_set, new_mins, new_maxs, new_data);
}

/**
 * Filter function to be called when input changes
 * -- For: When there are no filters (i.e. just draw)
 */
function noFilter(sankey_set, new_mins, new_maxs){
    sankey_set.draw();
}

/**
 * Filter function to be called when input changes
 * -- For: Firm cash; in-kind
 */
function firmFilterSet(sankey_set, new_mins, new_maxs){
    var funding_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["firm_cash", "firm_in-kind"]) / 10;
    var set_template = sankeyToSetTemplate(sankey);
    var new_data = firm_filter(new_mins[0], new_maxs[0], new_mins[1], new_maxs[1], funding_scale);
    var new_set = dataToSet(new_data, KEY_TO_COLUMNS, set_template);
    filterSetEnd(sankey_set, new_set, new_mins, new_maxs, new_data);
}

/**
 * Filter function to be called when input changes
 * -- Used at the end of every filter function; updates the set as needed
 */
function filterSetEnd(sankey_set, new_set, new_mins, new_maxs, csv){
    setProjectHeight(new_set, csv);
    sankey_set.set = new_set;
    sankey_set.data_min = new_mins;
    sankey_set.data_max = new_maxs;
    sankey_set.draw();
}

/**
 * Filter for firm cash and in-kind; returns a CSV
 */
function firm_filter(cash_min, cash_max, ik_min, ik_max, funding_scale){
    var firm_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'firm_cash', FILTER_BETWEEN, [cash_min, cash_max]);
    firm_data = filterData(firm_data, KEY_TO_COLUMNS, 'firm_in-kind', FILTER_BETWEEN, [ik_min, ik_max]);
    var normalizedCSV = normalizeColumns(firm_data, KEY_TO_COLUMNS, ["firm_cash", "firm_in-kind", "firm_total"], 0, funding_scale);
    return normalizedCSV;
}

/**
 * Called when filtering firm size x cash/in-kind contribution
 * TODO: add firm size as a filter (add boolean filters instead of just min/max)
 */
function firm_size_filter(cash_min, cash_max, ik_min, ik_max, funding_scale, size){
    var firm_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'firm_cash', FILTER_BETWEEN, [cash_min, cash_max]);
    firm_data = filterData(firm_data, KEY_TO_COLUMNS, 'firm_in-kind', FILTER_BETWEEN, [ik_min, ik_max]);
    firm_data = filterData(firm_data, KEY_TO_COLUMNS, size, FILTER_EQUALITY, [1]);
    var normalizedCSV = normalizeColumns(firm_data, KEY_TO_COLUMNS, ["firm_cash", "firm_in-kind", "firm_total"], 0, funding_scale);
    return normalizedCSV;
}

/**
 * Return a CSV that contains funding/month between min_value and max_value (normalized/ready for use)
 */
function monthly_filter(min_value, max_value, scale){
    var normalizedCSV = normalizeColumns(CSV_DATA, KEY_TO_COLUMNS, ["length"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["firm_cash", "firm_in-kind", "funding", "firm_total"]);
    var monthly_data = filterData(normalizedCSV, KEY_TO_COLUMNS, 'monthly', FILTER_BETWEEN, [min_value, max_value]);

    monthly_data = normalizeColumns(monthly_data, KEY_TO_COLUMNS, ["monthly"], 0, scale);
    return monthly_data;
}


/**
 * Create the nodes and links for Project, Commercialization, License, and Startup
 */
function createProjectCommercializationNodes(){
    // Add the project and commercialization nodes
    project = new UniSankeyNode("project", "Project", 'numbered', TOTAL_SIZE);
    project.skipNode();

    license = new UniSankeyNode("license", "License", 'percent', 100);
    license.is_product = 1;
    startup = new UniSankeyNode("startup", "Startup", 'percent', 100);
    startup.is_product = 1;

    commercialization = new UniSankeyNode("commercialization", "Commercialization", 'percent', 100);

    project.createLink(commercialization);

    commercialization.createLink(license);
    commercialization.createLink(startup);
}


function resizeWindow(){
    $("#sankey-container").height($(CANVASES[0]).height());
}

function SetUpSankey() {
    CANVASES = $('.sankey');

    $('.sankey').mousemove(function(e) {
        canvas_hover(e, sankey);
    });
    $('.sankey').click(function(e) {
        canvas_click(e, sankey);
    });

    $("#sankey-container").height($(CANVASES[0]).height());
        
    $(window).resize(function(){
        resizeWindow();
    });

    $("#click_hide").click(function(){
        toggleActiveSet();
    });


    // $("#autogenerate-button").click(generateFilterOptions);

    $(".add-filter-set-button").click(addFilterSet);

    $("#deselect-all").click(deselectAllCharacteristics);
    $("#select-all").click(selectAllCharacteristics);

}