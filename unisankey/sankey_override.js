function showSpecificCharacteristics(characteristics){
    var all_nodes = editor_sankey.nodes;
    for (var i = 0; i < all_nodes.length; i++){
        for (var j = 0; j < all_nodes[i].length; j++){
            var cur_node = all_nodes[i][j];

            if (characteristics.indexOf(cur_node.key) < 0 && cur_node.key != "project" && cur_node.key != "license" && cur_node.key != "startup"
                && cur_node.key != "commercialization"){
                cur_node.is_hidden = 1;
            } else {
              cur_node.is_hidden = 0;
            }
        }
    }
}

function drawSpecificSankey(filter_sets, visible_nodes){
    showSpecificCharacteristics(visible_nodes);
    sankey = updateSankey();
    displaySpecificFilterSets(filter_sets);
}

function sankey_gender(){
  var temp = [new FilterSet([new FilterItem("male", "EQ", [1]), new FilterItem("female", "EQ", [0])]), new FilterSet([new FilterItem("male", "EQ", [0]), new FilterItem("female", "EQ", [1])])]
  temp[0].name = 'Male';
  temp[1].name = 'Female';

  var visible_nodes = ['gender', 'male', 'female', 'researcher'];
  drawSpecificSankey(temp, visible_nodes);
}

function sankey_oceinkind(){
    var temp = [new FilterSet([new FilterItem("firm_in-kind", "RATIO", ['funding', 1, 1])]), new FilterSet([new FilterItem("firm_in-kind", "RATIO", ['funding', 1, 2])]), new FilterSet([new FilterItem("firm_in-kind", "RATIO", ['funding', 2, 1])])]
    temp[0].name = '1 Firm (In-Kind) Funding : 1 Government Funding'
    temp[1].name = '1 Firm (In-Kind) Funding : 2 Government Funding'
    temp[2].name = '2 Firm (In-Kind) Funding : 1 Government Funding'

    var visible_nodes = ['firm_in-kind', 'firm_cash', 'firm_total', 'funding'];
    drawSpecificSankey(temp, visible_nodes);
}

function sankey_tto(){
    var temp = [new FilterSet([new FilterItem("invention_disclosures", "RATIO", ['tto_staff', 6, 1])]), new FilterSet([new FilterItem("invention_disclosures", "RATIO", ['tto_staff', 8, 1])]), new FilterSet([new FilterItem("invention_disclosures", "RATIO", ['tto_staff', 10, 1])])]
    temp[0].name = '6 Invention Disclosures per TTO Staff'
    temp[1].name = '8 Invention Disclosures per TTO Staff'
    temp[2].name = '10 Invention Disclosures per TTO Staff'

    var visible_nodes = ['tto_staff', 'invention_disclosures', 'uni', 'researcher'];
    drawSpecificSankey(temp, visible_nodes);
}

function sankey_faculty(){
    var temp = [new FilterSet([new FilterItem("university_faculty", "RATIO", ['research_capacity', 1, 125000])]), new FilterSet([new FilterItem("university_faculty", "RATIO", ['research_capacity', 1, 250000])]), new FilterSet([new FilterItem("university_faculty", "RATIO", ['research_capacity', 1, 375000])])]
    temp[0].name = 'Approx. $125,000 Research Budget per Faculty Member'
    temp[1].name = 'Approx. $250,000 Research Budget per Faculty Member'
    temp[2].name = 'Approx. $375,000 Research Budget per Faculty Member'

    var visible_nodes = ['university_faculty', 'research_capacity', 'uni', 'researcher'];
    drawSpecificSankey(temp, visible_nodes);
}

function sankey_operations(){
    var temp = [new FilterSet([new FilterItem("university_operations", "LT", [10750])]), new FilterSet([new FilterItem("university_operations", "BETWEEN", [10750, 11500])]), new FilterSet([new FilterItem("university_operations", "GT", [11500])])];
    temp[0].name = 'Budget per Student < $10,750';
    temp[1].name = 'Budget per Student between $10,750 - $11,500';
    temp[2].name = 'Budget per Student > $11,500';

    var visible_nodes = ['university_operations', 'uni', 'researcher'];
    drawSpecificSankey(temp, visible_nodes);
}

function sankey_embeddedness(){
  var temp = [new FilterSet([new FilterItem("staff", "EQ", [0]), new FilterItem("mid-level", "EQ", [1]), new FilterItem("full_professor", "EQ", [0]), new FilterItem("distinguished", "EQ", [0]), new FilterItem("phd_age", "LT", [15])]), new FilterSet([new FilterItem("staff", "EQ", [0]), new FilterItem("mid-level", "EQ", [0]), new FilterItem("full_professor", "EQ", [1]), new FilterItem("distinguished", "EQ", [0]), new FilterItem("phd_age", "LT", [15])]), new FilterSet([new FilterItem("staff", "EQ", [0]), new FilterItem("mid-level", "EQ", [1]), new FilterItem("full_professor", "EQ", [0]), new FilterItem("distinguished", "EQ", [0]), new FilterItem("phd_age", "GT", [15])]), new FilterSet([new FilterItem("staff", "EQ", [0]), new FilterItem("mid-level", "EQ", [0]), new FilterItem("full_professor", "EQ", [1]), new FilterItem("distinguished", "EQ", [0]), new FilterItem("phd_age", "GT", [15])])]
  temp[0].name = 'Mid-Level + PhD Age < 15'
  temp[1].name = 'Full Professor + PhD Age < 15'
  temp[2].name = 'Mid-Level + PhD Age > 15'
  temp[3].name = 'Full Professor + PhD Age > 15'

  var visible_nodes = ['position', 'mid-level', 'full_professor', 'phd_age', 'researcher'];
  drawSpecificSankey(temp, visible_nodes);
}

function sankey_firm(){
  var temp = [new FilterSet([new FilterItem("firm_cash", "RATIO", ['firm_in-kind', 1, 1])]), new FilterSet([new FilterItem("firm_cash", "RATIO", ['firm_in-kind', 1, 2])]), new FilterSet([new FilterItem("firm_cash", "RATIO", ['firm_in-kind', 2, 1])])]
  temp[0].name = 'Ratio of 1 Firm (Cash) : 1 Firm (In-Kind)'
  temp[1].name = 'Ratio of 1 Firm (Cash) : 2 Firm (In-Kind)'
  temp[2].name = 'Ratio of 2 Firm (Cash) : 1 Firm (In-Kind)'

  var visible_nodes = ['firm_in-kind', 'firm_cash', 'firm_total'];
  drawSpecificSankey(temp, visible_nodes);
}

function sankey_ocetotal(){
  var temp = [new FilterSet([new FilterItem("funding", "RATIO", ['firm_total', 1, 1])]), new FilterSet([new FilterItem("funding", "RATIO", ['firm_total', 1, 2])]), new FilterSet([new FilterItem("funding", "RATIO", ['firm_total', 2, 1])])]
  temp[0].name = 'Ratio of 1 OCE Funding : 1 Firm (Total)'
  temp[1].name = 'Ratio of 1 OCE Funding : 2 Firm (Total)'
  temp[2].name = 'Ratio of 2 OCE Funding : 1 Firm (Total)'

  var visible_nodes = ['firm_in-kind', 'firm_cash', 'firm_total', 'funding'];
  drawSpecificSankey(temp, visible_nodes);
}

function sankey_totalfirm(){
  var temp = [new FilterSet([new FilterItem("firm_total", "LT", [25000])]), new FilterSet([new FilterItem("firm_total", "BETWEEN", [25000, 50000])]), new FilterSet([new FilterItem("firm_total", "BETWEEN", [50000, 75000])]), new FilterSet([new FilterItem("firm_total", "GT", [75000])])]
  temp[0].name = 'Firm (Total) < $25,000'
  temp[1].name = 'Firm (Total) between $25,000 - $50,000'
  temp[2].name = 'Firm (Total) between $50,000 - $75,000'
  temp[3].name = 'Firm (Total) > $75,000'

  var visible_nodes = ['firm_in-kind', 'firm_cash', 'firm_total', 'funding'];
  drawSpecificSankey(temp, visible_nodes);
}

function sankey_length(){
  var temp = [new FilterSet([new FilterItem("length", "LT", [12])]), new FilterSet([new FilterItem("length", "BETWEEN", [12, 24])]), new FilterSet([new FilterItem("length", "GT", [24])])]
  temp[0].name = 'Project Length < 12 months'
  temp[1].name = 'Project Length between 12 - 24 months'
  temp[2].name = 'Project Length > 24 months'

  var visible_nodes = ['length', 'firm_in-kind', 'firm_cash', 'firm_total', 'funding'];
  drawSpecificSankey(temp, visible_nodes);
}

function sankey_stage(){
  var temp = [new FilterSet([new FilterItem("earliest", "EQ", [1]), new FilterItem("mid-stage", "EQ", [0]), new FilterItem("latest", "EQ", [0])]), new FilterSet([new FilterItem("earliest", "EQ", [0]), new FilterItem("mid-stage", "EQ", [1]), new FilterItem("latest", "EQ", [0])]), new FilterSet([new FilterItem("earliest", "EQ", [0]), new FilterItem("mid-stage", "EQ", [0]), new FilterItem("latest", "EQ", [1])])]
  temp[0].name = 'Earliest'
  temp[1].name = 'Mid-Stage'
  temp[2].name = 'Latest'

  var visible_nodes = ['earliest', 'mid-stage', 'latest', 'stage'];
  drawSpecificSankey(temp, visible_nodes);
}

function sankey_field(){
  var temp = [new FilterSet([new FilterItem("cit", "EQ", [1]), new FilterItem("mm", "EQ", [0]), new FilterItem("eet", "EQ", [0]), new FilterItem("photonics", "EQ", [0])]), new FilterSet([new FilterItem("cit", "EQ", [0]), new FilterItem("mm", "EQ", [1]), new FilterItem("eet", "EQ", [0]), new FilterItem("photonics", "EQ", [0])]), new FilterSet([new FilterItem("cit", "EQ", [0]), new FilterItem("mm", "EQ", [0]), new FilterItem("eet", "EQ", [1]), new FilterItem("photonics", "EQ", [0])]), new FilterSet([new FilterItem("cit", "EQ", [0]), new FilterItem("mm", "EQ", [0]), new FilterItem("eet", "EQ", [0]), new FilterItem("photonics", "EQ", [1])])]
  temp[0].name = 'CIT'
  temp[1].name = 'MM'
  temp[2].name = 'EET'
  temp[3].name = 'Photonics'


  var visible_nodes = ['field', 'cit', 'mm', 'eet', 'photonics'];
  drawSpecificSankey(temp, visible_nodes);
}

function sankey_distance(){
  var temp = [new FilterSet([new FilterItem("distance", "LT", [300])]), new FilterSet([new FilterItem("distance", "BETWEEN", [300, 600])]), new FilterSet([new FilterItem("distance", "BETWEEN", [600, 900])]), new FilterSet([new FilterItem("distance", "GT", [900])])]
  temp[0].name = 'Distance < 300 km'
  temp[1].name = 'Distance between 300 - 600 km'
  temp[2].name = 'Distance between 600 - 900 km'
  temp[3].name = 'Distance > 900 km'
  var visible_nodes = ['distance'];
  drawSpecificSankey(temp, visible_nodes);

}

function sankey_prior(){
  var temp = [new FilterSet([new FilterItem("researcher_interaction", "EQ", [0])]), new FilterSet([new FilterItem("researcher_interaction", "EQ", [1])]), new FilterSet([new FilterItem("researcher_interaction", "EQ", [2])]), new FilterSet([new FilterItem("researcher_interaction", "GT", [2])])]
  temp[0].name = '0 Prior Collaborations'
  temp[1].name = '1 Prior Collaboration'
  temp[2].name = '2 Prior Collaborations'
  temp[3].name = '> 2 Prior Collaborations'

  var visible_nodes = ['researcher_interaction', 'researcher'];
  drawSpecificSankey(temp, visible_nodes);

}