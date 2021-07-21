CSV_DATA = [];
FILTER_EQUALITY = 'equality';
FILTER_BETWEEN = 'between';


KEY_TO_COLUMNS = {  'license' : 0,
                    'startup' : 1,
                    'phd_age' : 2,
                    'researcher_interaction' : 3,
                    'firm_cash' : 4,
                    'firm_in-kind' : 5,
                    'firm_interaction' : 6,
                    'number_of_firms' : 7,
                    'research_capacity' : 8,
                    'university_faculty' : 9,
                    'university_operations' : 10,
                    'reputation_ranking' : 11,
                    'faculty_awards' : 12,
                    'research_ranking' : 13,
                    'invention_disclosures' : 14,
                    'tto_experience' : 15,
                    'tto_staff' : 16,
                    'funding' : 17,
                    'length' : 18,
                    'distance' : 19,
                    'commercialization' : 20,
                    'staff' : 21,
                    'mid-level' : 22,
                    'full_professor' : 23,
                    'distinguished' : 24,
                    'male' : 25,
                    'female' : 26,
                    'micro' : 27,
                    'small' : 28,
                    'medium' : 29,
                    'large' : 30,
                    'university' : 31,
                    'creator' : 32,
                    'cit' : 33,
                    'mm' : 34,
                    'eet' : 35,
                    'photonics' : 36,
                    'earliest' : 37,
                    'mid-stage' : 38,
                    'latest' : 39,
                    'new_school' : 40,
                    'rising_star': 41,
                    'laggard': 42,
                    'old_school': 43,
                    'firm_total': 44,
                    'proj_funding': 45,
                    'monthly': 46,
                    'lt15': 47,
                    'gte15': 48,
                    'inventions_staff': 49,
                    'research_faculty': 50,
                    'in-kind_ratio': 51
                }

KEY_TO_DESC    = {  'license' : 'The percentage of projects that resulted in a license.',
                    'startup' : 'The percentage of projects that resulted in the formation of a startup company.',
                    'phd_age' : 'The number of years between when a doctoral degree was earned by the researcher and the start date of their project.',
                    'researcher_interaction' : 'The number of prior industry-academic research collaborations that the researcher took part in.',
                    'firm_cash' : 'The amount of cash contributed by collaborating firms.',
                    'firm_in-kind' : 'The amount of in-kind contribution provided by collaborating firms.',
                    'firm_interaction' : 'The number of prior industry-academic research collaborations that the collaborating firm took part in.',
                    'number_of_firms' : 'The number of firms collaborating on a project.',
                    'research_capacity' : "The university's total expenditures on research and development.",
                    'university_faculty' : 'The number of full-time faculty members in the university.',
                    'university_operations' : "The university's operational expenditures per student.",
                    'reputation_ranking' : "The university's ranking among Ontario universities based on its reputation.",
                    'faculty_awards' : "The number of awards received per 1000 faculty.",
                    'research_ranking' : "The university's ranking among Ontario universities based on the dollar value of research grants received.",
                    'invention_disclosures' : "The number of inventions disclosed to the univesity.",
                    'tto_experience' : "The number of years since the university's technology transfer program started.",
                    'tto_staff' : "The number of full-time employees involved in technology transfer.",
                    'funding' : "The amount of government funding received.",
                    'length' : "The total length of the project (in months).",
                    'distance' : "The physical distance between the researcher and the lead collaborating firm (in kilometres).",
                    'commercialization' : "The amount of projects that resulted in commercialization.",
                    'staff' : "The amount of projects lead by a post-doctoral fellow or adjunct.",
                    'mid-level' : "The amount of projects lead by a mid-level (assistant or associate) professor.",
                    'full_professor' :  "The amount of projects lead by a full professor.",
                    'distinguished' :  "The amount of projects lead by a distinguished professor.",
                    'male' : "The amount of projects lead by a male researcher.",
                    'female' : "The amount of projects lead by a female researcher.",
                    'micro' : "The amount of projects where the lead firm has < 10 employees.",
                    'small' : "The amount of projects where the lead firm has 10 - 99 employees.",
                    'medium' : "The amount of projects where the lead firm has 100 - 999 employees.",
                    'large' : "The amount of projects where the lead firm has > 1000 employees.",
                    'university' : "The amount of projects where the university's IP policy granted ownership rights to the university.",
                    'creator' : "The amount of projects where the university's IP policy granted ownership rights to the creator.",
                    'cit' : "The amount of projects which belonged to the field of Communications and Information Technology.",
                    'mm' : "The amount of projects which belonged to the field of Materials and Manufacturing.",
                    'eet' : "The amount of projects which belonged to the field of Earth and Environmental Technology.",
                    'photonics' : "The amount of projects which belonged to the field of Photonics.",
                    'earliest' : "The amount of projects which were provided a grant in the earliest stage of research.",
                    'mid-stage' : "The amount of projects which were provided a grant in the middle stages of research.",
                    'latest' : "The amount of projects which were provided a grant in the latest stages of research.",
                    'ip': "The IP ownership policy of the university that the lead researcher of the project belongs to.",
                    'position': "The position that the project's lead researcher holds.",
                    'gender': "The gender of the project's lead researcher.",
                    'uni': "The university and properties that belong to the lead researcher.",
                    'stage': "The research stage that the project was in when provided a grant.",
                    'field': "The field of research that the project belongs to.",
                    'firm_size': "The size of the lead collaborating firm.",
                    'firm_total': "The total contribution from the collaborating firms.",
                    'researcher': "The lead researcher and properties of the lead researcher.",
                    'project': "The number of projects that match the filtered criteria."
                }

KEY_TO_DESC_OCE = { 'license' : 'The percentage of projects that resulted in a license.',
                    'startup' : 'The percentage of projects that resulted in the formation of a startup company.',
                    'phd_age' : 'The number of years between when a doctoral degree was earned by the researcher and the start date of their project.',
                    'researcher_interaction' : 'The number of prior OCE-supported industry research collaborations that the researcher took part in.',
                    'firm_cash' : 'The amount of cash contributed by collaborating firms.',
                    'firm_in-kind' : 'The amount of in-kind contribution provided by collaborating firms.',
                    'firm_interaction' : 'The number of prior OCE-supported industry research collaborations that the collaborating firm took part in.',
                    'number_of_firms' : 'The number of firms collaborating on a project.',
                    'research_capacity' : "The university's total expenditures on research and development.",
                    'university_faculty' : 'The number of full-time faculty members in the university.',
                    'university_operations' : "The university's operational expenditures per student.",
                    'reputation_ranking' : "The university's ranking among Ontario universities based on its reputation.",
                    'faculty_awards' : "The number of awards received per 1000 faculty.",
                    'research_ranking' : "The university's ranking among Ontario universities based on the dollar value of research grants received.",
                    'invention_disclosures' : "The number of inventions disclosed to the univesity.",
                    'tto_experience' : "The number of years since the university's technology transfer program started.",
                    'tto_staff' : "The number of full-time employees involved in technology transfer.",
                    'funding' : "The amount of funding received from OCE.",
                    'length' : "The total length of the project (in months).",
                    'distance' : "The physical distance between the researcher and the lead collaborating firm (in kilometres).",
                    'commercialization' : "The amount of projects that resulted in commercialization.",
                    'staff' : "The amount of projects lead by a post-doctoral fellow or adjunct.",
                    'mid-level' : "The amount of projects lead by a mid-level (assistant or associate) professor.",
                    'full_professor' :  "The amount of projects lead by a full professor.",
                    'distinguished' :  "The amount of projects lead by a distinguished professor.",
                    'male' : "The amount of projects lead by a male researcher.",
                    'female' : "The amount of projects lead by a female researcher.",
                    'micro' : "The amount of projects where the lead firm has < 10 employees.",
                    'small' : "The amount of projects where the lead firm has 10 - 99 employees.",
                    'medium' : "The amount of projects where the lead firm has 100 - 999 employees.",
                    'large' : "The amount of projects where the lead firm has > 1000 employees.",
                    'university' : "The amount of projects where the university's IP policy granted ownership rights to the university.",
                    'creator' : "The amount of projects where the university's IP policy granted ownership rights to the creator.",
                    'cit' : "The amount of projects which belonged to the field of Communications and Information Technology.",
                    'mm' : "The amount of projects which belonged to the field of Materials and Manufacturing.",
                    'eet' : "The amount of projects which belonged to the field of Earth and Environmental Technology.",
                    'photonics' : "The amount of projects which belonged to the field of Photonics.",
                    'earliest' : "The amount of projects which were provided a grant in the earliest stage of research.",
                    'mid-stage' : "The amount of projects which were provided a grant in the middle stages of research.",
                    'latest' : "The amount of projects which were provided a grant in the latest stages of research.",
                    'ip': "The IP ownership policy of the university that the lead researcher of the project belongs to.",
                    'position': "The position that the project's lead researcher holds.",
                    'gender': "The gender of the project's lead researcher.",
                    'uni': "The university and properties that belong to the lead researcher.",
                    'stage': "The research stage that the project was in when provided a grant.",
                    'field': "The field of research that the project belongs to.",
                    'firm_size': "The size of the lead collaborating firm.",
                    'firm_total': "The total contribution from the collaborating firms.",
                    'researcher': "The lead researcher and properties of the lead researcher.",
                    'project': "The number of projects that match the filtered criteria."
                }


NORMALIZATION_MAPPING = {'firm_cash': 'proj_funding',
                         'firm_in-kind': 'proj_funding',
                         'firm_total': 'proj_funding',
                         'funding': 'proj_funding',
                        };

RESCALE_MAX = {'proj_funding': 0.05};

/**
 * Read in the text.
 */
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://wisdi.me/sankey/dataset.csv",
        dataType: "text",
        success: function(data) {
            processData(data);
            SetUpSankey();
            init();
            t1.onLoad()
        }
     });
});

TOTAL_SIZE = 682;
function setProjectHeight(new_set, csv_array, scale = 0.2){
    var height = csv_array.length / TOTAL_SIZE;
    new_set['project'][0] = height * scale;
}

/**
 * Parse the CSV and store it in the global variable CSV_DATA
 */
function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
    }
    CSV_DATA = lines;
}

/**
 * Multiply all of the keys and links mapped by keys_to_scale in set by
 * scale_factor.
 */
function scaleKeys(set, keys_to_scale, scale_factor){
    for (var i = 0; i < keys_to_scale.length; i++){
        var cur_key = keys_to_scale[i];
        set[cur_key][0] = set[cur_key][0] * scale_factor;
        for (var j = 0; j < set[cur_key][1].length; j++){
            set[cur_key][1][j] = set[cur_key][1][j] * scale_factor;
        }
    }
}

/**
 * filterData(csv_array, key_mappings, column_key, filter_type, params)
 * Return the rows in csv_array that fulfill the filter conditions:
 *    filter_type = 'equality' or 'between'
 *    'equality': The value in the column corresponding to column_key
 *                is in params
 *    'between':  The value in the column corresponding to column_key
 *                is between params[0] and params[1]
 * If to_boolean > 0, the column is mapped to 1 instead of its original
 * value if the row is kept.
 */
function filterData(csv_array, key_mappings, column_key, filter_type, params, to_boolean = 0){
    var column_index = key_mappings[column_key];
    var new_array = [];

    // Adjust params so that all of its elements are strings
    if (filter_type == FILTER_EQUALITY){
        for (var i = 0; i < params.length; i++){
            params[i] = params[i].toString();
        }
    }

    // Go through each row
    for (var i = 0; i < csv_array.length; i++){
        var row = csv_array[i];
        var cell = row[column_index];
        var row_condition = false;

        if (filter_type == FILTER_EQUALITY){
            row_condition = params.indexOf(cell) >= 0;
        } else if (filter_type == FILTER_BETWEEN){
            row_condition = (params[0] <= parseInt(cell) && 
                             parseInt(cell)<= params[1]);
        }

        if (row_condition){
            if (to_boolean > 0){
                row = row.slice();
                row[column_index] = "1";
            }
            
            new_array.push(row);
        }
    }
    return new_array;
}

/**
 * sankeyToSetTemplate(sankey)
 * Return a set dictionary template for a sankey diagram.
 * Links have their values represented as key:key.
 */
function sankeyToSetTemplate(sankey){
    var node_set = sankey.nodes;
    var set_template = {};

    for (var col = 0; col < node_set.length; col ++){
        for (var row = 0; row < node_set[col].length; row ++){
            var node = node_set[col][row];
            var key = node.key;
            var links = node.links;

            // Build up all of the links for this node
            var entry_links = [];
            for (var lnk = 0; lnk < links.length; lnk ++){
                var cur_link = links[lnk];
                var link_key = key + ":" + cur_link.endNode.key;
                entry_links.push(link_key);
            }

            // Add this entry to our template
            var entry = [-1, entry_links];

            set_template[key] = entry;
        }
    }
    return set_template;
}

/**
 * copySet(set)
 * Return a copy of set.
 */
function copySet(set){
    var new_set = {};
    var all_keys = Object.keys(set);

    for (var i = 0; i < all_keys.length; i++){
        var key = all_keys[i];
        var values = [];
        values.push(set[key][0])
        var new_list = [];
        for (var j = 0; j < set[key][1].length; j++){
            new_list.push(set[key][1][j]);
        }
        values.push(new_list);

        new_set[key] = values;
    }

    return new_set;
}

/**
 * Return the average of all of the values in column column_index of csv_array.
 */
function getAverage(csv_array, column_index){
    var total = 0;
    var total_length = 0;
    for (var i = 0; i < csv_array.length; i++){
        if (!isNaN(parseFloat(csv_array[i][column_index]))){
            total += parseFloat(csv_array[i][column_index]);
            total_length += 1;
        }
    }
    
    var average = total / total_length

    return average;
}

/**
 * Return a copy of key_mappings where key_to_change is new_key.
 */
function changeMapping(key_mappings, key_to_change, new_key){
    var all_keys = Object.keys(key_mappings);
    var new_mapping = {};

    for (var i = 0; i < all_keys.length; i++){
        var key = all_keys[i];
        if (key == key_to_change){
            key = new_key;
        }

        new_mapping[key] = key_mappings[all_keys[i]];
    }

    return new_mapping;
}


/**
 * Distribute value among keys.
 */
function distributeValue(value, keys, mappings){
    var changes = {};
    var to_distribute = value;
    var count = 0;

    for (var k = 0; k < keys.length; k++){
        var key = keys[k];
        var v = mappings[key];
        if (v >= 0){
            to_distribute -= v;
        } else {
            count += 1;
        }
    }

    var distributed_value = to_distribute / count;

    if (count == 0){
        distributed_value = 0;
    }


    for (var k = 0; k < keys.length; k++){
        var key = keys[k];
        var mapped_value = mappings[key];
        if (mapped_value < 0){
            mapped_value = distributed_value;
        }
        changes[key] = mapped_value;
    }

    return changes;

}

/**
 * dataToSet(csv_array, key_mappings, set_template)
 * Create a new set dictionary from csv_array, based on the data
 * from set_template and using the columns mapped to in key_mappings.
 */
function dataToSet(csv_array, key_mappings, set_template){
    var new_set = copySet(set_template);


    // Collect all of the keys in our set that have columns mapped to them
    var set_columns = [];
    var all_keys = Object.keys(new_set);
    var mapped_keys = Object.keys(key_mappings);

    // Construct a dictionary that lists all of the keys and links
    var all_mappings = {};

    for (var i = 0; i < all_keys.length; i ++){
        var key = all_keys[i];

        // Add in the mapped keys
        if (mapped_keys.indexOf(key) >= 0){
            set_columns.push(key);
        }

        // Add the keys to our mapping
        all_mappings[key] = -1;

        // Add all of the links in
        for (var j = 0; j < new_set[key][1].length; j ++){
            all_mappings[new_set[key][1][j]] = -1;
        }
    }

    // For nodes with mappings in the csv, set their height to the average
    // of the mapped value
    for (var i = 0; i < set_columns.length; i++){
        var cur_key = set_columns[i];
        var column_index = key_mappings[cur_key];
        var avg = getAverage(csv_array, column_index);
        
        new_set[cur_key][0] = avg;
        all_mappings[cur_key] = avg;

        // And set their links to a uniform distribution
        var links = [];
        var num_links = new_set[cur_key][1].length;
        if (num_links == 1){
            for (var j = 0; j < num_links; j++){
                links.push(avg / num_links);
                all_mappings[new_set[cur_key][1][j]] = avg / num_links;
            }

            new_set[cur_key][1] = links;
        }
    }

    var all_mappings_keys = Object.keys(all_mappings);

    var num_unknown = 1;
    var num_iterations = 15;

    if (csv_array.length == 0){
        // Set everything to 0
        for (var i = 0; i < all_mappings_keys.length; i++){
            all_mappings[all_mappings_keys[i]] = 0;
        }
        num_unknown = 0;
    } else {
        // For nodes with known mappings, set the height of the links flowing
        // into them = the average of the height of the node
        for (var i = 0; i < set_columns.length; i++){
            var key = set_columns[i];

            if (all_mappings[key] >= 0){
                var height = all_mappings[key];
                var incoming = [];

                for (var j = 0; j < all_mappings_keys.length; j++){
                    var cur_key = all_mappings_keys[j];
                    // Make sure it's a link
                    if (cur_key.indexOf(":") >= 0){
                        // Get the incoming and outgoing nodes
                        var split_key = cur_key.split(":");
                        var in_key = split_key[0];
                        var out_key = split_key[1];
                        if (out_key == key){
                            incoming.push(in_key);
                        }
                    }
                }

                var num_incoming = incoming.length;
                if (num_incoming > 0){
                    var link_height = height / num_incoming;
                    for (var j = 0; j < incoming.length; j++){
                        var cur_key = incoming[j];
                        var link_key = cur_key + ":" + key;
                        all_mappings[link_key] = link_height;
                    }
                }

            }
        }

    }

    while (num_unknown > 0 && num_iterations > 0){
        var values_to_change = {};
        // Get all of the known values

        for (var i = 0; i < all_mappings_keys.length; i++){
            var key = all_mappings_keys[i];

            if (key.indexOf(":") < 0){
                // For nodes:
                //     - The links flowing into them and out of them
                //       should sum to the node's value.
                //     - The value given should be divided uniformly.
                //     - If there are multiple possible values, assign it
                //       the max of them all.
                if (all_mappings[key] >= 0){
                    var current_value = all_mappings[key];
                    var incoming_nodes = [];
                    var outgoing_nodes = [];

                    // Collect values of the links
                    for (var j = 0; j < all_mappings_keys.length; j++){
                        var link_key = all_mappings_keys[j];
                        if (link_key.indexOf(":") >= 0){
                            var split_key = link_key.split(":");
                            var in_key = split_key[0];
                            var out_key = split_key[1];
                            if (in_key == key){
                                incoming_nodes.push(link_key);
                            } else if (out_key == key){
                                outgoing_nodes.push(link_key);
                            }
                        }
                    }

                    var in_changes = {};
                    if (incoming_nodes.length > 0){
                        var in_changes = distributeValue(current_value, incoming_nodes, all_mappings);
                    }

                    var out_changes = {};
                    if (outgoing_nodes.length > 0){
                        out_changes = distributeValue(current_value, outgoing_nodes, all_mappings);
                    }

                    for (var k = 0; k < incoming_nodes.length; k++){
                        var change_key = incoming_nodes[k];
                        values_to_change[change_key] = in_changes[change_key];
                    }

                    for (var k = 0; k < outgoing_nodes.length; k++){
                        var change_key = outgoing_nodes[k];
                        values_to_change[change_key] = out_changes[change_key];
                    }

                }
            } else {         
                // For links:
                //     - The nodes connected to that link should have the sum
                //       of all of the connected/incoming links

                var split_key = key.split(":");
                var in_key = split_key[0];
                var out_key = split_key[1];
                var current_value = all_mappings[key];

                if (current_value >= 0){
                    // Find all of the links connected to the connected nodes
                    var incoming_links = [];
                    var unknown_in_links = -1;
                    var in_sum = 0;
                    var outgoing_links = [];
                    var unknown_out_links = -1;
                    var out_sum = 0;

                    for (var j = 0; j < all_mappings_keys.length; j++){
                        var node_key = all_mappings_keys[j];

                        // Find all of the links flowing out of in_key
                        if (node_key.indexOf(":") >= 0){
                            var split2 = node_key.split(":");
                            var in2 = split2[0];
                            var out2 = split2[1];

                            if (in2 == in_key){
                                if ((!all_mappings[node_key] && all_mappings[node_key] != 0) || all_mappings[node_key] < 0){
                                    unknown_in_links = 1;
                                } else {
                                    in_sum += all_mappings[node_key];
                                }
                            }

                            if (out2 == out_key){
                                if (all_mappings[node_key] < 0){
                                    unknown_out_links = 1;
                                } else {
                                    out_sum += all_mappings[node_key];
                                }
                            }
                        }
                    }

                    if (unknown_in_links < 0){
                        values_to_change[in_key] = in_sum;
                    }

                    if (unknown_out_links < 0){
                        values_to_change[out_key] = out_sum;
                    }
                }
            }
        }

        // Make the changes
        var change_keys = Object.keys(values_to_change);

        for (var k = 0; k < change_keys.length; k++){
            var key_to_change = change_keys[k];
            if (values_to_change[key_to_change]){
                all_mappings[key_to_change] = values_to_change[key_to_change];
            }
        }

        // Adjust the counts
        num_unknown = 0;
        for (var k = 0; k < all_mappings_keys.length; k++){
            if (all_mappings[all_mappings_keys[k]] < 0){
                num_unknown += 1;
            }
        }

        num_iterations -= 1;
    }

    // TODO: fix this; we set to the originating size when it's unknown
    for (var k = 0; k < all_mappings_keys.length; k++){
        if (all_mappings[all_mappings_keys[k]] < 0){
            all_mappings[all_mappings_keys[k]] = 1;
        }
    }

    // Do the mapping from all_mappings to new_set
    for (var i = 0; i < all_keys.length; i++){
        var key = all_keys[i];
        if (new_set[key][0] < 0){
            new_set[key][0] = all_mappings[key];
        }
        for (var j = 0; j < new_set[key][1].length; j++){
            var possible_key_link = new_set[key][1][j];
            if (Object.keys(all_mappings).indexOf(possible_key_link) >= 0){
                new_set[key][1][j] = all_mappings[possible_key_link];
            }
        }
    }

    // Set the Project to be the number of projects
    var num_projects = csv_array.length;
    new_set['project'][0] = num_projects / TOTAL_SIZE;

    return new_set;
}

/**
 * Return value normalized between min_value, max_value
 * (i.e. normalized * (max_value - min_value) + min_value == value)
 */
function normalizeValue(value, min_value, max_value){
    var value = parseFloat(value);
    return ((value - min_value) / (max_value - min_value)).toString();
}

function findMax(csv_array, key_mappings, columns_to_search){
    var max_value = 0;

    var column_indexes = [];
    for (var i = 0; i < columns_to_search.length; i++){
        column_indexes.push(key_mappings[columns_to_search[i]]);
    }

    for (var row = 0; row < csv_array.length; row++){
        for (var cell = 0; cell < column_indexes.length; cell++){
            var col = column_indexes[cell];
            var current_value = parseFloat(csv_array[row][col]);
            if (current_value > max_value){
                max_value = current_value;
            }
        }
    }

    return max_value;
}


function getMax(data, column){
    var max_value = 0;

    for (var i = 0; i < data.length; i++){
        var current = parseFloat(data[i][column]);
        if (current > max_value){
            max_value = current;
        }
    }
    return max_value;
}


/**
 * normalizeData(original_data, new_data, mappings)
 * Normalizes new_data based on the original_data's max;
 * if a key is in NORMALIZATION_MAPPING, we use that column to normalize by
 * instead.
 */
function normalizeData(original_data, new_data, mappings){
    var normalized_data = [];
    var all_maxes = [];
    for (var i = 0; i < original_data[0].length; i++){
        var column_name = Object.keys(mappings)[i];
        if (column_name in NORMALIZATION_MAPPING){
            column_name = NORMALIZATION_MAPPING[column_name];
        }
        var k = mappings[column_name];
        var max = getMax(original_data, k);

        if (column_name in RESCALE_MAX){
            max = RESCALE_MAX[column_name] * max;
        }
        all_maxes.push(max);
    }

    for (var i = 0; i < new_data.length; i++){
        var row = [];
        for (var j = 0; j < new_data[i].length; j++){
            var min = 0;
            var max = all_maxes[j];
            var cell = new_data[i][j];
            row.push(normalizeValue(cell, min, max));
        }
        normalized_data.push(row);
    }
    return normalized_data;
}








/**
 * normalizeColumns(csv_array, key_mappings, columns_to_normalize, 
 *                  min_value = 0, max_value = -1)
 * Normalize all of the columns in columns_to_normalize (indexes provided by
 * key_mappings) in the array csv_array.
 * If max is not provided, find the highest value among all those columns.
 */
function normalizeColumns(csv_array, key_mappings, columns_to_normalize, 
                          min_value = 0, max_value = -1){
    var column_indexes = [];
    for (var i = 0; i < columns_to_normalize.length; i++){
        column_indexes.push(key_mappings[columns_to_normalize[i]]);
    }

    // Get the maximum if needed
    if (max_value < 0){
        max_value = findMax(csv_array, key_mappings, columns_to_normalize)
    }

    // Normalize the columns in the array
    var new_array = [];
    for (var i = 0; i < csv_array.length; i++){
        var current_row = [];
        for (var j = 0; j < csv_array[i].length; j++){
            if (column_indexes.indexOf(j) >= 0){
               current_row.push(normalizeValue(csv_array[i][j], min_value, max_value));
            } else {
                current_row.push(csv_array[i][j]);
            }
        }
        new_array.push(current_row);
    }

    return new_array;
}