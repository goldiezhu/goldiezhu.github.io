var CANVASES = [];
var BASE_COLOURS = ["#fff1ad", "#ffd5da", "#d0f5f9", "#e1beff"]
currentFilterSet = undefined;

// TODO: Add in No Commercialization
// Make sizing proportional to the amount of data that we have
// (i.e. if we have more data for full professor than mid-level, make the size proportional to that/to show that -- same with project)
// Decision:
//    - Full visualization; zoom in on certain nodes; eliminate/select multiple nodes that they want to keep/discard
//    - Make a giant visualization just for experiment sake -- is it really too scary? I'm worried!! But Kelly and Maleknaz are okay


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

IP  uni            stage       latest
    creator                     early
                                mid
                field            ...
    awards                  
    faculty                  length
    operations   uni        distance
    reputation              
    inventions
    research
    tto exp      interaction
    tto staff
                            researcher      project     commercialization   license
    position    full                                                        startup
                mid
                ..
                ..

                phd age

    gender      female
                male

                  oce
 #   firm cash   firm total
     firm in-kind
     firm_size     small
                   ...





*/

function sankey_all_characteristics(){
    createProjectCommercializationNodes();
    currentFilterSet = noFilter;
    sankey = new UniSankey();

    // Nodes connected to University
    ip = new UniSankeyNode("ip", "IP Owner");
    // ip.force_y = 50;
    ip.skipNode();
    ip_uni = new UniSankeyNode("university", "University");
    ip_creator = new UniSankeyNode("creator", "Creator");

    faculty_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["university_faculty"]);
    capacity_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["research_capacity"]);
    budget_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["university_operations"]);
    ranking_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["reputation_ranking", "research_ranking"]);

    awards = new UniSankeyNode("faculty_awards", "Awards", "plain");
    faculty = new UniSankeyNode("university_faculty", "Faculty", "plain", faculty_scale);
    capacity = new UniSankeyNode("research_capacity", "Research Capacity", "monetary", capacity_scale)
    operations = new UniSankeyNode("university_operations", "Budget per Student", "monetary", budget_scale);
    reputation = new UniSankeyNode("reputation_ranking", "Reputation Ranking", "plain", ranking_scale);
    research_ranking = new UniSankeyNode("research_ranking", "Research Ranking", "plain", ranking_scale);
    inventions = new UniSankeyNode("invention_disclosures", "Invention Disclosures", "plain", ranking_scale);
    tto_exp = new UniSankeyNode("tto_experience", "TTO Experience", "plain");
    tto_staff = new UniSankeyNode("tto_staff", "TTO Staff", "plain");

    uni = new UniSankeyNode("uni", "University");

    ip.createLink(ip_uni);
    ip.createLink(ip_creator);
    ip_uni.createLink(uni);
    ip_creator.createLink(uni);
    awards.createLink(uni);
    faculty.createLink(uni);
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
    sankey.addNode(operations, 1);
    sankey.addNode(reputation, 1);
    sankey.addNode(inventions, 1);
    sankey.addNode(tto_exp, 1);
    sankey.addNode(tto_staff, 1);

    // Nodes to connect to project (not researcher)
    stage = new UniSankeyNode("stage", "Research Stage");
    // stage.force_y = 280;
    field = new UniSankeyNode("field", "Field");
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

    interaction = new UniSankeyNode("researcher_interaction", "Prior Collaborations", "numbered");
    sankey.addNode(interaction, 2);


    // Nodes connected to researcher
    // position
    position = new UniSankeyNode("position", "Position");
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
    
    age_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["phd_age"]);
    phd_age = new UniSankeyNode("phd_age", "PhD Age", age_scale);

    // gender
    gender = new UniSankeyNode("gender", "Gender");
    male = new UniSankeyNode("male", "Male");
    female = new UniSankeyNode("female", "Female");

    gender.createLink(male);
    gender.createLink(female);

    sankey.addNode(gender, 1);
    sankey.addNode(male, 2);
    sankey.addNode(female, 2);
    
    // firm
    num_firm = new UniSankeyNode("number_of_firms", "Number of Firms", "numbered");

    funding_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["firm_cash", "firm_in-kind", "funding"]) / 10;
    firm_ik = new UniSankeyNode("firm_in-kind", "Firm (In-Kind)", "monetary", funding_scale);
    firm_cash = new UniSankeyNode("firm_cash", "Firm (Cash)", "monetary", funding_scale);
    firm_total = new UniSankeyNode("firm_total", "Firm (Total)", "monetary", funding_scale);

    firm_size = new UniSankeyNode("firm_size", "Firm Size");
    micro = new UniSankeyNode("micro", "Micro");
    small = new UniSankeyNode("small", "Small");
    medium = new UniSankeyNode("medium", "Medium");
    large = new UniSankeyNode("large", "Large");

    // oce
    oce = new UniSankeyNode("funding", "OCE Funding", "monetary", funding_scale);

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
    interaction.createLink(researcher);
    uni.createLink(researcher);
    staff.createLink(researcher);
    midlevel.createLink(researcher);
    full_professor.createLink(researcher);
    distinguished.createLink(researcher);
    male.createLink(researcher);
    female.createLink(researcher);
    oce.createLink(project);
    firm_total.createLink(project);
    micro.createLink(project);
    small.createLink(project);
    medium.createLink(project);
    large.createLink(project);
    
    researcher.createLink(project);

    sankey.addNode(researcher, 3);
    sankey.addNode(num_firm, 1);
    sankey.addNode(firm_ik, 2);
    sankey.addNode(firm_cash, 2);
    sankey.addNode(firm_size, 2);
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
    normalizedCSV = normalizeColumns(CSV_DATA, KEY_TO_COLUMNS, ["firm_in-kind", "funding", "firm_in-kind", "firm_total", "firm_cash"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["distance"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["faculty_awards"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["invention_disclosures"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["length"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["reputation_ranking"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["researcher"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["tto_experience"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["tto_staff"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["university_faculty"]);
    normalizedCSV = normalizeColumns(normalizedCSV, KEY_TO_COLUMNS, ["university_operations"]);
    data_0 = filterData(normalizedCSV, KEY_TO_COLUMNS, 'male', FILTER_EQUALITY, [1]);
    data_1 = filterData(normalizedCSV, KEY_TO_COLUMNS, 'female', FILTER_EQUALITY, [1]);

    set_1 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);

    scaleKeys(set_1, ['researcher_interaction', "ip", "university", "creator", "position", "staff", "mid-level", "full_professor", "distinguished", "gender", "male", "female", "firm_size", "micro", "small", "medium", "large", "number_of_firms", "stage", "earliest", "mid-stage", "latest", "field", "cit", "mm", "eet", "photonics", "uni", "researcher"], 0.1);
    scaleKeys(set_2, ['researcher_interaction', "ip", "university", "creator", "position", "staff", "mid-level", "full_professor", "distinguished", "gender", "male", "female", "firm_size", "micro", "small", "medium", "large", "number_of_firms", "stage", "earliest", "mid-stage", "latest", "field", "cit", "mm", "eet", "photonics", "uni", 'researcher'], 0.1);
    
    set_1['researcher'][1][0] = set_1['researcher'][0];
    set_2['researcher'][1][0] = set_2['researcher'][0];
    setProjectHeight(set_1, data_0);
    setProjectHeight(set_2, data_1);
    
    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "Male Researchers"),
                     new UniSankeySet(set_2, "sankey-canvas2", BASE_COLOURS[1], sankey, "Female Researchers")];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

/**
 * Create the nodes and links for Project, Commercialization, License, and Startup
 */
function createProjectCommercializationNodes(){
    // Add the project and commercialization nodes
    project = new UniSankeyNode("project", "Project", 'numbered', 5 * TOTAL_SIZE);
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

function sankey_embeddedness(){
    createProjectCommercializationNodes();
    currentFilterSet = noFilter;

    sankey = new UniSankey();
    position = new UniSankeyNode("position", "Position");
    position.skipNode();
    phd_age = new UniSankeyNode("phd_age", "PhD Age");
    phd_age.skipNode();

    midlevel = new UniSankeyNode("mid-level", "Mid-Level");
    full = new UniSankeyNode("full_professor", "Full Professor");

    lt15 = new UniSankeyNode("lt15", "PhD Age < 15");
    gte15 = new UniSankeyNode("gte15", "PhD Age >= 15");

    position.createLink(midlevel);
    position.createLink(full);

    phd_age.createLink(lt15);
    phd_age.createLink(gte15);

    midlevel.createLink(project);
    full.createLink(project);

    lt15.createLink(project);
    gte15.createLink(project);

    sankey.addNode(position, 0);
    sankey.addNode(phd_age, 0);

    sankey.addNode(midlevel, 1);
    sankey.addNode(full, 1);
    sankey.addNode(lt15, 1);
    sankey.addNode(gte15, 1);

    sankey.addNode(project, 2);

    sankey.addNode(commercialization, 3);

    sankey.addNode(license, 4);
    sankey.addNode(startup, 4);


    set_template = sankeyToSetTemplate(sankey);
    ns_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'new_school', FILTER_EQUALITY, [1]);
    ns_data = filterData(ns_data, KEY_TO_COLUMNS, 'phd_age', FILTER_BETWEEN, [0, 99], 1);

    os_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'old_school', FILTER_EQUALITY, [1]);
    os_data = filterData(os_data, KEY_TO_COLUMNS, 'phd_age', FILTER_BETWEEN, [0, 99], 1);

    rs_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'rising_star', FILTER_EQUALITY, [1]);
    rs_data = filterData(rs_data, KEY_TO_COLUMNS, 'phd_age', FILTER_BETWEEN, [0, 99], 1);

    lg_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'laggard', FILTER_EQUALITY, [1]);
    lg_data = filterData(lg_data, KEY_TO_COLUMNS, 'phd_age', FILTER_BETWEEN, [0, 99], 1);

    set_1 = dataToSet(ns_data, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(lg_data, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(rs_data, KEY_TO_COLUMNS, set_template);
    set_4 = dataToSet(os_data, KEY_TO_COLUMNS, set_template);

    scaleKeys(set_1, ['position', 'lt15', 'gte15', 'phd_age', 'mid-level', 'full_professor'], 0.1);
    scaleKeys(set_2, ['position', 'lt15', 'gte15', 'phd_age', 'mid-level', 'full_professor'], 0.1);
    scaleKeys(set_3, ['position', 'lt15', 'gte15', 'phd_age', 'mid-level', 'full_professor'], 0.1);
    scaleKeys(set_4, ['position', 'lt15', 'gte15', 'phd_age', 'mid-level', 'full_professor'], 0.1);
    
    setProjectHeight(set_1, ns_data);
    setProjectHeight(set_2, lg_data);
    setProjectHeight(set_3, rs_data);
    setProjectHeight(set_4, os_data);
    
    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "New School"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "Laggard"),
                     new UniSankeySet(set_3, 'sankey-canvas3', BASE_COLOURS[2], sankey, "Rising Star"),
                     new UniSankeySet(set_4, 'sankey-canvas4', BASE_COLOURS[3], sankey, "Old School")];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

function sankey_collaboration(){
    createProjectCommercializationNodes();

    sankey = new UniSankey();
    currentFilterSet = noFilter;

    // Make nodes
    interaction = new UniSankeyNode("researcher_interaction", "Prior Collaboration", "plain", 10)

    // Make links
    interaction.createLink(project);

    // Add nodes to sankey
    sankey.addNode(interaction, 0);
    sankey.addNode(project, 1);
    sankey.addNode(commercialization, 2);
    sankey.addNode(license, 3);
    sankey.addNode(startup, 3);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    data_0 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'researcher_interaction', FILTER_EQUALITY, [0]);
    data_1 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'researcher_interaction', FILTER_EQUALITY, [1]);
    data_2 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'researcher_interaction', FILTER_BETWEEN, [2,99]);

    set_1 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(data_2, KEY_TO_COLUMNS, set_template);

    scaleKeys(set_1, ['researcher_interaction'], 0.1);
    scaleKeys(set_2, ['researcher_interaction'], 0.1);
    scaleKeys(set_3, ['researcher_interaction'], 0.1);
    
    setProjectHeight(set_1, data_0);
    setProjectHeight(set_2, data_1);
    setProjectHeight(set_3, data_2);

    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "0 Prior Research Collaborations"),
                     new UniSankeySet(set_2, "sankey-canvas2", BASE_COLOURS[1], sankey, "1 Prior Research Collaborations"),
                     new UniSankeySet(set_3, "sankey-canvas3", BASE_COLOURS[2], sankey, "2+ Prior Research Collaborations")];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

function sankey_embed_collaboration(){
    createProjectCommercializationNodes();
    currentFilterSet = noFilter;

    sankey = new UniSankey();
    position = new UniSankeyNode("position", "Position");
    position.skipNode();
    phd_age = new UniSankeyNode("phd_age", "PhD Age");
    phd_age.skipNode();

    midlevel = new UniSankeyNode("mid-level", "Mid-Level");
    full = new UniSankeyNode("full_professor", "Full Professor");

    lt15 = new UniSankeyNode("lt15", "PhD Age < 15");
    gte15 = new UniSankeyNode("gte15", "PhD Age >= 15");


    position.createLink(midlevel);
    position.createLink(full);

    phd_age.createLink(lt15);
    phd_age.createLink(gte15);

    midlevel.createLink(project);
    full.createLink(project);

    lt15.createLink(project);
    gte15.createLink(project);

    interaction = new UniSankeyNode("researcher_interaction", "Prior Collaboration", "plain", 10)

    // Make links
    interaction.createLink(project);

    sankey.addNode(position, 0);
    sankey.addNode(phd_age, 0);

    sankey.addNode(midlevel, 1);
    sankey.addNode(full, 1);
    sankey.addNode(lt15, 1);
    sankey.addNode(gte15, 1);
    sankey.addNode(interaction, 1);

    sankey.addNode(project, 2);

    sankey.addNode(commercialization, 3);
    
    sankey.addNode(license, 4);
    sankey.addNode(startup, 4);


    // Create the following sets:
    // NS + 0
    // NS + >2
    // OS + 0
    // OS + >2
    set_template = sankeyToSetTemplate(sankey);
    ns_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'new_school', FILTER_EQUALITY, [1]);
    ns_data = filterData(ns_data, KEY_TO_COLUMNS, 'phd_age', FILTER_BETWEEN, [0, 99], 1);

    os_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'old_school', FILTER_EQUALITY, [1]);
    os_data = filterData(os_data, KEY_TO_COLUMNS, 'phd_age', FILTER_BETWEEN, [0, 99], 1);

    data_0 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'researcher_interaction', FILTER_EQUALITY, [0]);
    data_0 = filterData(data_0, KEY_TO_COLUMNS, 'phd_age', FILTER_BETWEEN, [0, 99], 1);
    data_1 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'researcher_interaction', FILTER_BETWEEN, [2,99]);
    data_1 = filterData(data_1, KEY_TO_COLUMNS, 'phd_age', FILTER_BETWEEN, [0, 99], 1);

    set_1 = dataToSet(ns_data, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(os_data, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_4 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);

    scaleKeys(set_1, ['researcher_interaction'], 0.1);
    scaleKeys(set_2, ['researcher_interaction'], 0.1);
    scaleKeys(set_3, ['researcher_interaction'], 0.1);
    scaleKeys(set_4, ['researcher_interaction'], 0.1);

    scaleKeys(set_1, ['position', 'lt15', 'gte15', 'phd_age', 'mid-level', 'full_professor'], 0.1);
    scaleKeys(set_2, ['position', 'lt15', 'gte15', 'phd_age', 'mid-level', 'full_professor'], 0.1);
    scaleKeys(set_3, ['position', 'lt15', 'gte15', 'phd_age', 'mid-level', 'full_professor'], 0.1);
    scaleKeys(set_4, ['position', 'lt15', 'gte15', 'phd_age', 'mid-level', 'full_professor'], 0.1);

    setProjectHeight(set_1, ns_data);
    setProjectHeight(set_2, os_data);
    setProjectHeight(set_3, data_0);
    setProjectHeight(set_4, data_1);

    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "New School Researchers"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "Old School Researchers"),
                     new UniSankeySet(set_3, 'sankey-canvas3', BASE_COLOURS[2], sankey, "Researchers with 0 Prior Collaborations"),
                     new UniSankeySet(set_4, 'sankey-canvas4', BASE_COLOURS[3], sankey, "Researchers with 2+ Prior Collaborations")];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

function sankey_inkind_ratio(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    currentFilterSet = ratioFilter;

    funding_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["firm_in-kind", "funding"]);

    sankey = new UniSankey();
    firmkind = new UniSankeyNode("firm_in-kind", "Firm (In-Kind)", "monetary", funding_scale)
    
    ocefund = new UniSankeyNode("funding", "OCE Funding", "monetary", funding_scale);

    inkind_ratio = new UniSankeyNode("in-kind_ratio", "In-Kind Ratio", "plain", 5);

    firmkind.createLink(project);

    ocefund.createLink(project);

    sankey.addNode(firmkind, 0);

    sankey.addNode(ocefund, 0);

    sankey.addNode(project, 1);

    sankey.addNode(commercialization, 2);

    sankey.addNode(license, 3);
    sankey.addNode(startup, 3);

    set_template = sankeyToSetTemplate(sankey);

    var normalizedCSV = normalizeColumns(CSV_DATA, KEY_TO_COLUMNS, ["firm_in-kind", "funding"]);
    data_0 = filterData(normalizedCSV, KEY_TO_COLUMNS, 'in-kind_ratio', FILTER_BETWEEN, [0, 0.8]);
    data_1 = filterData(normalizedCSV, KEY_TO_COLUMNS, 'in-kind_ratio', FILTER_BETWEEN, [0.8, 1.2]);
    data_2 = filterData(normalizedCSV, KEY_TO_COLUMNS, 'in-kind_ratio', FILTER_BETWEEN, [1.2, 3]);
    data_3 = filterData(normalizedCSV, KEY_TO_COLUMNS, 'in-kind_ratio', FILTER_BETWEEN, [3, 99]);

    set_1 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(data_2, KEY_TO_COLUMNS, set_template);
    set_4 = dataToSet(data_3, KEY_TO_COLUMNS, set_template);

    setProjectHeight(set_1, data_0);
    setProjectHeight(set_2, data_1);
    setProjectHeight(set_3, data_2);
    setProjectHeight(set_4, data_3);
    
    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "Firm (In-Kind) < OCE Funding"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "Firm (In-Kind) = OCE Funding"),
                     new UniSankeySet(set_3, 'sankey-canvas3', BASE_COLOURS[2], sankey, "Firm (In-Kind) > OCE Funding"),
                     new UniSankeySet(set_4, 'sankey-canvas4', BASE_COLOURS[3], sankey, "Firm (In-Kind) >> OCE Funding")];


    unisankeysets[0].data_filters = ["In-Kind:OCE Funding Ratio"];
    unisankeysets[1].data_filters = ["In-Kind:OCE Funding Ratio"];
    unisankeysets[2].data_filters = ["In-Kind:OCE Funding Ratio"];
    unisankeysets[3].data_filters = ["In-Kind:OCE Funding Ratio"];

    unisankeysets[0].data_min = [0];
    unisankeysets[0].data_max = [0.8];
    unisankeysets[1].data_min = [0.8];
    unisankeysets[1].data_max = [1.2];
    unisankeysets[2].data_min = [1.2];
    unisankeysets[2].data_max = [3];
    unisankeysets[3].data_min = [3];
    unisankeysets[3].data_max = [99];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}


function sankey_firm_size(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    // Make nodes
    firm_size = new UniSankeyNode("firm_size", "Firm Size");
    firm_size.skipNode();

    micro = new UniSankeyNode("micro", "Micro");
    small = new UniSankeyNode("small", "Small");
    medium = new UniSankeyNode("medium", "Medium");
    large = new UniSankeyNode("large", "Large");
    
    // Make links
    firm_size.createLink(micro);
    firm_size.createLink(small);
    firm_size.createLink(medium);
    firm_size.createLink(large);

    micro.createLink(project);
    small.createLink(project);
    medium.createLink(project);
    large.createLink(project);

    // Add nodes to sankey
    sankey.addNode(firm_size, 0);
    sankey.addNode(micro, 1);
    sankey.addNode(small, 1);
    sankey.addNode(medium, 1);
    sankey.addNode(large, 1);
    sankey.addNode(project, 2);
    sankey.addNode(commercialization, 3);
    sankey.addNode(license, 4);
    sankey.addNode(startup, 4);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    micro_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'micro', FILTER_EQUALITY, [1]);
    small_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'small', FILTER_EQUALITY, [1]);
    medium_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'medium', FILTER_EQUALITY, [1]);
    large_data = filterData(CSV_DATA, KEY_TO_COLUMNS, 'large', FILTER_EQUALITY, [1]);

    set_1 = dataToSet(micro_data, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(small_data, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(medium_data, KEY_TO_COLUMNS, set_template);
    set_4 = dataToSet(large_data, KEY_TO_COLUMNS, set_template);

    scaleKeys(set_1, ['micro', 'small', 'medium', 'large', 'firm_size'], 0.1);
    scaleKeys(set_2, ['micro', 'small', 'medium', 'large', 'firm_size'], 0.1);
    scaleKeys(set_3, ['micro', 'small', 'medium', 'large', 'firm_size'], 0.1);
    scaleKeys(set_4, ['micro', 'small', 'medium', 'large', 'firm_size'], 0.1);

    setProjectHeight(set_1, micro_data);
    setProjectHeight(set_2, small_data);
    setProjectHeight(set_3, medium_data);
    setProjectHeight(set_4, large_data);

    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "Micro (< 10 Employees)"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "Small (10 - 99 Employees)"),
                     new UniSankeySet(set_3, 'sankey-canvas3',  BASE_COLOURS[2], sankey, "Medium (100 - 999 Employees)"),
                     new UniSankeySet(set_4, 'sankey-canvas4',  BASE_COLOURS[3], sankey, "Large (>1000 Employees)")];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}


function sankey_firm_contributions(){
    createProjectCommercializationNodes();
    currentFilterSet = firmFilterSet;

    funding_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["firm_cash", "firm_in-kind"]) / 10;

    sankey = new UniSankey();
    firmcash = new UniSankeyNode("firm_cash", "Firm (Cash)", "monetary", funding_scale)
    firmkind = new UniSankeyNode("firm_in-kind", "Firm (In-Kind)", "monetary", funding_scale)
    
    firmtotal = new UniSankeyNode("firm_total", "Firm (Total)", "monetary", funding_scale);
    
    firmcash.createLink(firmtotal);
    firmkind.createLink(firmtotal);

    firmtotal.createLink(project);

    sankey.addNode(firmcash, 0);
    sankey.addNode(firmkind, 0);

    sankey.addNode(firmtotal, 1);

    sankey.addNode(project, 2);

    sankey.addNode(commercialization, 3);

    sankey.addNode(license, 4);
    sankey.addNode(startup, 4);

    set_template = sankeyToSetTemplate(sankey);

    data_0 = firm_filter(0, 30000, 0, 30000, funding_scale);
    data_1 = firm_filter(0, 30000, 30000, 60000, funding_scale);
    data_2 = firm_filter(30000, 60000, 0, 30000, funding_scale);
    data_3 = firm_filter(30000, 60000, 30000, 60000, funding_scale);

    set_1 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(data_2, KEY_TO_COLUMNS, set_template);
    set_4 = dataToSet(data_3, KEY_TO_COLUMNS, set_template);

    setProjectHeight(set_1, data_0);
    setProjectHeight(set_2, data_1);
    setProjectHeight(set_3, data_2);
    setProjectHeight(set_4, data_3);

    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "Low Cash + Low In-Kind"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "Low Cash + High In-Kind"),
                     new UniSankeySet(set_3, 'sankey-canvas3', BASE_COLOURS[2], sankey, "High Cash + Low In-Kind"),
                     new UniSankeySet(set_4, 'sankey-canvas4', BASE_COLOURS[3], sankey, "High Cash + High In-Kind")];


    unisankeysets[0].data_filters = ["Firm (Cash)", "Firm (In-Kind)"];
    unisankeysets[1].data_filters = ["Firm (Cash)", "Firm (In-Kind)"];
    unisankeysets[2].data_filters = ["Firm (Cash)", "Firm (In-Kind)"];
    unisankeysets[3].data_filters = ["Firm (Cash)", "Firm (In-Kind)"];


    unisankeysets[0].data_min = [0, 0];
    unisankeysets[0].data_max = [30000, 30000];
    unisankeysets[1].data_min = [0, 30000];
    unisankeysets[1].data_max = [30000, 60000];
    unisankeysets[2].data_min = [30000, 0];
    unisankeysets[2].data_max = [60000, 30000];
    unisankeysets[3].data_min = [30000, 30000];
    unisankeysets[3].data_max = [60000, 60000];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

function sankey_firm_size_contributions(){
    createProjectCommercializationNodes();
    currentFilterSet = firmFilterSet;

    funding_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["firm_cash", "firm_in-kind"]) / 10;

    sankey = new UniSankey();
    firmcash = new UniSankeyNode("firm_cash", "Firm (Cash)", "monetary", funding_scale)
    firmkind = new UniSankeyNode("firm_in-kind", "Firm (In-Kind)", "monetary", funding_scale)
    
    firmtotal = new UniSankeyNode("firm_total", "Firm (Total)", "monetary", funding_scale);
    
    firmcash.createLink(firmtotal);
    firmkind.createLink(firmtotal);

    firmtotal.createLink(project);


    // Make nodes
    firm_size = new UniSankeyNode("firm_size", "Firm Size");
    firm_size.skipNode();

    // Make links
    small = new UniSankeyNode("small", "Small");
    large = new UniSankeyNode("large", "Large");
    
    firm_size.createLink(small);
    firm_size.createLink(large);

    small.createLink(project);
    large.createLink(project);


    sankey.addNode(firmcash, 0);
    sankey.addNode(firmkind, 0);
    sankey.addNode(firm_size, 0);

    sankey.addNode(firmtotal, 1);
    sankey.addNode(small, 1);
    sankey.addNode(large, 1);

    sankey.addNode(project, 2);

    sankey.addNode(commercialization, 3);

    sankey.addNode(startup, 4);
    sankey.addNode(license, 4);

    set_template = sankeyToSetTemplate(sankey);

    data_0 = firm_size_filter(0, 40000, 40000, 80000, funding_scale, 'small');
    data_1 = firm_size_filter(40000, 80000, 0, 40000, funding_scale, 'small');
    data_2 = firm_size_filter(0, 40000, 40000, 80000, funding_scale, 'large');
    data_3 = firm_size_filter(40000, 80000, 0, 40000, funding_scale, 'large');

    set_1 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(data_2, KEY_TO_COLUMNS, set_template);
    set_4 = dataToSet(data_3, KEY_TO_COLUMNS, set_template);

    scaleKeys(set_1, ['small', 'large', 'firm_size'], 0.1);
    scaleKeys(set_2, ['small', 'large', 'firm_size'], 0.1);
    scaleKeys(set_3, ['small', 'large', 'firm_size'], 0.1);
    scaleKeys(set_4, ['small', 'large', 'firm_size'], 0.1);

    setProjectHeight(set_1, data_0);
    setProjectHeight(set_2, data_1);
    setProjectHeight(set_3, data_2);
    setProjectHeight(set_4, data_3);

    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "Small Firm + Low Cash + High In-Kind"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "Small Firm + High Cash + Low In-Kind"),
                     new UniSankeySet(set_3, 'sankey-canvas3', BASE_COLOURS[2], sankey, "Large Firm + Low Cash + High In-Kind"),
                     new UniSankeySet(set_4, 'sankey-canvas4', BASE_COLOURS[3], sankey, "Large Firm + High Cash + Low In-Kind")];


    unisankeysets[0].data_filters = ["Firm (Cash)", "Firm (In-Kind)"];
    unisankeysets[1].data_filters = ["Firm (Cash)", "Firm (In-Kind)"];
    unisankeysets[2].data_filters = ["Firm (Cash)", "Firm (In-Kind)"];
    unisankeysets[3].data_filters = ["Firm (Cash)", "Firm (In-Kind)"];


    unisankeysets[0].data_min = [0, 40000];
    unisankeysets[0].data_max = [40000, 80000];
    unisankeysets[1].data_min = [40000, 0];
    unisankeysets[1].data_max = [80000, 40000];
    unisankeysets[2].data_min = [0, 40000];
    unisankeysets[2].data_max = [40000, 80000];
    unisankeysets[3].data_min = [40000, 0];
    unisankeysets[3].data_max = [80000, 40000];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

function sankey_operations(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    faculty_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["university_faculty"]);
    capacity_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["research_capacity"]);
    budget_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["university_operations"]);

    // Make nodes

    faculty = new UniSankeyNode("university_faculty", "Faculty", "plain", faculty_scale);
    capacity = new UniSankeyNode("research_capacity", "Research Capacity", "monetary", capacity_scale)
    operations = new UniSankeyNode("university_operations", "Budget per Student", "monetary", budget_scale);
    uni = new UniSankeyNode("uni", "University");

    faculty.createLink(uni);
    capacity.createLink(uni);
    operations.createLink(uni);
    uni.createLink(project);
    // Make links

    // Add nodes to sankey
    sankey.addNode(faculty, 0);
    sankey.addNode(capacity, 0);
    sankey.addNode(operations, 0);
    sankey.addNode(uni, 1);
    sankey.addNode(project, 2);
    sankey.addNode(commercialization, 3);
    sankey.addNode(license, 4);
    sankey.addNode(startup, 4);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    data_0 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'university_operations', FILTER_BETWEEN, [7500, 10000]);
    data_1 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'university_operations', FILTER_BETWEEN, [10000, 12500]);
    data_2 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'university_operations', FILTER_BETWEEN, [12500, 15000]);

    data_0 = normalizeColumns(data_0, KEY_TO_COLUMNS, ["university_operations"], 0, budget_scale);
    data_0 = normalizeColumns(data_0, KEY_TO_COLUMNS, ["research_capacity"], 0, capacity_scale);
    data_0 = normalizeColumns(data_0, KEY_TO_COLUMNS, ["university_faculty"], 0, faculty_scale);
    data_1 = normalizeColumns(data_1, KEY_TO_COLUMNS, ["university_operations"], 0, budget_scale);
    data_1 = normalizeColumns(data_1, KEY_TO_COLUMNS, ["research_capacity"], 0, capacity_scale);
    data_1 = normalizeColumns(data_1, KEY_TO_COLUMNS, ["university_faculty"], 0, faculty_scale);
    data_2 = normalizeColumns(data_2, KEY_TO_COLUMNS, ["university_operations"], 0, budget_scale);
    data_2 = normalizeColumns(data_2, KEY_TO_COLUMNS, ["research_capacity"], 0, capacity_scale);
    data_2 = normalizeColumns(data_2, KEY_TO_COLUMNS, ["university_faculty"], 0, faculty_scale);

    set_1 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(data_2, KEY_TO_COLUMNS, set_template);

    setProjectHeight(set_1, data_0);
    setProjectHeight(set_2, data_1);
    setProjectHeight(set_3, data_2);

    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "$7.5K - $10K per Student"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "$10K - $12.5K per Student"),
                     new UniSankeySet(set_3, 'sankey-canvas3', BASE_COLOURS[2], sankey, "$12.5K - $15K per Student")];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}


function sankey_faculty(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    faculty_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["university_faculty"]);
    capacity_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["research_capacity"]);
    budget_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["university_operations"]);

    // Make nodes

    faculty = new UniSankeyNode("university_faculty", "Faculty", "plain", faculty_scale);
    capacity = new UniSankeyNode("research_capacity", "Research Funding", "monetary", capacity_scale)
    operations = new UniSankeyNode("university_operations", "Budget per Student", "monetary", budget_scale);
    uni = new UniSankeyNode("uni", "University");

    faculty.createLink(uni);
    capacity.createLink(uni);
    operations.createLink(uni);
    uni.createLink(project);
    // Make links

    // Add nodes to sankey
    sankey.addNode(faculty, 0);
    sankey.addNode(capacity, 0);
    sankey.addNode(operations, 0);
    sankey.addNode(uni, 1);
    sankey.addNode(project, 2);
    sankey.addNode(commercialization, 3);
    sankey.addNode(license, 4);
    sankey.addNode(startup, 4);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    data_0 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'university_faculty', FILTER_BETWEEN, [1000, 2000]);
    data_1 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'university_faculty', FILTER_BETWEEN, [0, 1000]);
    data_2 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'university_faculty', FILTER_BETWEEN, [1000, 2000]);
    data_3 = filterData(CSV_DATA, KEY_TO_COLUMNS, 'university_faculty', FILTER_BETWEEN, [0, 1000]);

    data_0 = filterData(data_0, KEY_TO_COLUMNS, 'research_capacity', FILTER_BETWEEN, [200000000, 300000000]);
    data_1 = filterData(data_1, KEY_TO_COLUMNS, 'research_capacity', FILTER_BETWEEN, [200000000, 300000000]);
    data_2 = filterData(data_2, KEY_TO_COLUMNS, 'research_capacity', FILTER_BETWEEN, [0, 200000000]);
    data_3 = filterData(data_3, KEY_TO_COLUMNS, 'research_capacity', FILTER_BETWEEN, [0, 200000000]);

    data_0 = normalizeColumns(data_0, KEY_TO_COLUMNS, ["university_operations"], 0, budget_scale);
    data_0 = normalizeColumns(data_0, KEY_TO_COLUMNS, ["research_capacity"], 0, capacity_scale);
    data_0 = normalizeColumns(data_0, KEY_TO_COLUMNS, ["university_faculty"], 0, faculty_scale);
    data_1 = normalizeColumns(data_1, KEY_TO_COLUMNS, ["university_operations"], 0, budget_scale);
    data_1 = normalizeColumns(data_1, KEY_TO_COLUMNS, ["research_capacity"], 0, capacity_scale);
    data_1 = normalizeColumns(data_1, KEY_TO_COLUMNS, ["university_faculty"], 0, faculty_scale);
    data_2 = normalizeColumns(data_2, KEY_TO_COLUMNS, ["university_operations"], 0, budget_scale);
    data_2 = normalizeColumns(data_2, KEY_TO_COLUMNS, ["research_capacity"], 0, capacity_scale);
    data_2 = normalizeColumns(data_2, KEY_TO_COLUMNS, ["university_faculty"], 0, faculty_scale);
    data_3 = normalizeColumns(data_3, KEY_TO_COLUMNS, ["university_operations"], 0, budget_scale);
    data_3 = normalizeColumns(data_3, KEY_TO_COLUMNS, ["research_capacity"], 0, capacity_scale);
    data_3 = normalizeColumns(data_3, KEY_TO_COLUMNS, ["university_faculty"], 0, faculty_scale);

    set_1 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(data_2, KEY_TO_COLUMNS, set_template);
    set_4 = dataToSet(data_3, KEY_TO_COLUMNS, set_template);

    setProjectHeight(set_1, data_0);
    setProjectHeight(set_2, data_1);
    setProjectHeight(set_3, data_2);
    setProjectHeight(set_4, data_3);

    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "High # of Faculty, High Funding"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "Low # of Faculty, High Funding"),
                     new UniSankeySet(set_3, 'sankey-canvas3', BASE_COLOURS[2], sankey, "High # of Faculty, Low Funding"),
                     new UniSankeySet(set_4, 'sankey-canvas4', BASE_COLOURS[3], sankey, "Low # of Faculty, Low Funding")];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}


function sankey_operations_faculty(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    // Make nodes

    // Make links

    // Add nodes to sankey
    sankey.addNode(project, 1);
    sankey.addNode(license, 2);
    sankey.addNode(startup, 2);
    sankey.addNode(commercialization, 3);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}


function sankey_tto(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    // Make nodes

    // Make links

    // Add nodes to sankey
    sankey.addNode(project, 1);
    sankey.addNode(license, 2);
    sankey.addNode(startup, 2);
    sankey.addNode(commercialization, 3);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

function sankey_university(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    // Make nodes

    // Make links

    // Add nodes to sankey
    sankey.addNode(project, 1);
    sankey.addNode(license, 2);
    sankey.addNode(startup, 2);
    sankey.addNode(commercialization, 3);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}


function sankey_field(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    // Make nodes

    // Make links

    // Add nodes to sankey
    sankey.addNode(project, 1);
    sankey.addNode(license, 2);
    sankey.addNode(startup, 2);
    sankey.addNode(commercialization, 3);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}


function sankey_stage(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    // Make nodes

    // Make links

    // Add nodes to sankey
    sankey.addNode(project, 1);
    sankey.addNode(license, 2);
    sankey.addNode(startup, 2);
    sankey.addNode(commercialization, 3);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}


function sankey_distance(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    // Make nodes

    // Make links

    // Add nodes to sankey
    sankey.addNode(project, 1);
    sankey.addNode(license, 2);
    sankey.addNode(startup, 2);
    sankey.addNode(commercialization, 3);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

function sankey_monthly_funding(){
    createProjectCommercializationNodes();
    currentFilterSet = monthlyFilterSet;

    funding_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["firm_cash", "firm_in-kind", "funding", "firm_total", "proj_funding"]);
    length_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["length"]);
    monthly_scale = findMax(CSV_DATA, KEY_TO_COLUMNS, ["monthly"]);

    sankey = new UniSankey();
    firmcash = new UniSankeyNode("firm_cash", "Firm (Cash)", "monetary", funding_scale)
    firmkind = new UniSankeyNode("firm_in-kind", "Firm (In-Kind)", "monetary", funding_scale)
    
    firmtotal = new UniSankeyNode("firm_total", "Firm (Total)", "monetary", funding_scale);
    ocefund = new UniSankeyNode("funding", "OCE Funding", "monetary", funding_scale);
    
    proj_funding = new UniSankeyNode("proj_funding", "Total Funding", "monetary", funding_scale);
    projlength = new UniSankeyNode("length", "Project Length", "plain", length_scale);

    projmonth = new UniSankeyNode("monthly", "Funding per Month", "monetary", monthly_scale);

    firmcash.createLink(firmtotal);
    firmkind.createLink(firmtotal);

    firmtotal.createLink(proj_funding);
    ocefund.createLink(proj_funding);

    proj_funding.createLink(projmonth);
    projlength.createLink(projmonth);

    projmonth.createLink(project);

    sankey.addNode(firmcash, 0);
    sankey.addNode(firmkind, 0);

    sankey.addNode(firmtotal, 1);
    sankey.addNode(ocefund, 1);

    sankey.addNode(proj_funding, 2);
    sankey.addNode(projlength, 2);

    sankey.addNode(projmonth, 3);

    sankey.addNode(project, 4);

    sankey.addNode(commercialization, 5);

    sankey.addNode(license, 6);
    sankey.addNode(startup, 6);


    set_template = sankeyToSetTemplate(sankey);
    
    data_0 = monthly_filter(0, 10000, monthly_scale);
    data_1 = monthly_filter(10000, 20000, monthly_scale);
    data_2 = monthly_filter(20000, 30000, monthly_scale);
    data_3 = monthly_filter(30000, 40000, monthly_scale);

    set_1 = dataToSet(data_0, KEY_TO_COLUMNS, set_template);
    set_2 = dataToSet(data_1, KEY_TO_COLUMNS, set_template);
    set_3 = dataToSet(data_2, KEY_TO_COLUMNS, set_template);
    set_4 = dataToSet(data_3, KEY_TO_COLUMNS, set_template);

    setProjectHeight(set_1, data_0);
    setProjectHeight(set_2, data_1);
    setProjectHeight(set_3, data_2);
    setProjectHeight(set_4, data_3);

    unisankeysets = [new UniSankeySet(set_1, "sankey-canvas", BASE_COLOURS[0], sankey, "0 - 10K Funding per Month"),
                     new UniSankeySet(set_2, 'sankey-canvas2', BASE_COLOURS[1], sankey, "10K - 20K Funding per Month"),
                     new UniSankeySet(set_3, 'sankey-canvas3', BASE_COLOURS[2], sankey, "20K - 30K Funding per Month"),
                     new UniSankeySet(set_4, 'sankey-canvas4', BASE_COLOURS[3], sankey, "30K - 40K Funding per Month")];


    unisankeysets[0].data_filters = ["Funding per Month"];
    unisankeysets[1].data_filters = ["Funding per Month"];
    unisankeysets[2].data_filters = ["Funding per Month"];
    unisankeysets[3].data_filters = ["Funding per Month"];


    unisankeysets[0].data_min = [0];
    unisankeysets[0].data_max = [10000];
    unisankeysets[1].data_min = [10000];
    unisankeysets[1].data_max = [20000];
    unisankeysets[2].data_min = [20000];
    unisankeysets[2].data_max = [30000];
    unisankeysets[3].data_min = [30000];
    unisankeysets[3].data_max = [40000];

    sankey.sets = unisankeysets;
    sankey.drawAll();
}

function sankey_monthly_distance(){
    createProjectCommercializationNodes();
    sankey = new UniSankey();

    // Make nodes

    // Make links

    // Add nodes to sankey
    sankey.addNode(project, 1);
    sankey.addNode(license, 2);
    sankey.addNode(startup, 2);
    sankey.addNode(commercialization, 3);

    // Make sets
    set_template = sankeyToSetTemplate(sankey);
    unisankeysets = [];

    sankey.sets = unisankeysets;
    sankey.drawAll();
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
}