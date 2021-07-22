
function TutorialCue(text, image = null){
    this.script = text;
    this.image = image;
    this.next = null;
    this.prev = null;
}

TutorialCue.prototype.setNext = function(next){
    this.next = next;
    next.prev = this;
}

TutorialCue.prototype.onLoad = function(){
    // load the text
    var html = "<div class='tut-txt'>" + this.script + "</div>";
    if (this.image != null){
        html += "<img src='" + this.image + "'>";
    }

    $("#tutorial-text-container").html(html);

    if (this.prev == null){
        $("#tut-back-button").hide();
    } else {
        $("#tut-back-button").show();
    }

    // permanently hide back -- maybe it won't be used ?
    $("#tut-back-button").hide();

    $("#tut-next-button").hide();
    this.setUp();
}

TutorialCue.prototype.setUp = function(){
    var current = this;
    $("#tut-next-button").show();

    $("body").click(function (e){
        var target_id = $(e.target).attr('id');
        if (target_id == "tut-next-button"){
            current.loadNext();
        }

        if (target_id == "tut-back-button"){
            current.loadPrev();
        }
    });

}

TutorialCue.prototype.destroy = function(){
    $("body").off("click");
}

TutorialCue.prototype.loadNext = function(){
    this.destroy();

    if (this.next != null){
        this.next.onLoad();
    } else {
        $(".tutorial").hide();
        $(".survey-things").show();
        //loadNext();

        setUpSurvey();
        changeSankey();
    }
}

TutorialCue.prototype.loadPrev = function(){
    this.destroy();

    if (this.prev != null){
        this.prev.onLoad();
    }
}


function setUpHighlightDiv(div_name, current){
    $("#shadow").show();
    $("#" + div_name).addClass("highlight");

    $("body").click(function (e){
        var target_id = $(e.target).attr('id');
        if (target_id == div_name){
            current.loadNext();
        }

        if (target_id == "tut-back-button"){
            current.loadPrev();
        }
    });
}

function destroyHighlightDiv(div_name){
    $("#" + div_name).removeClass("highlight");
    $("body").off("click");
    $("#shadow").hide();
    // remove highlight
}

function selectedCharacteristics(characteristics, current){
    $("body").click(function (e){
        var target_id = $(e.target).attr('id');

        if (target_id == "tut-back-button"){
            current.loadPrev();
        }

        var all_nodes = sankey.nodes;
        var count = 0;
        for (var i = 0; i < all_nodes.length; i++){
            for (var j = 0; j < all_nodes[i].length; j++){
                var cur_node = all_nodes[i][j];
                var key = cur_node.key;

                if (characteristics.includes(key) && cur_node.is_hidden == 0){
                    count += 1
                }
            }
        }

        if (count == characteristics.length){
            current.loadNext();
        }

    });
}

function setUpHighlightInputs(current){
    $("#shadow").show();

    var values = ['creator', 'university', 'male', 'female'];

    var checkboxes = $("input:checkbox");

    for (var i = 0; i < checkboxes.length; i++){
        var box = $(checkboxes[i]);
        var key = box.val();
        if (values.includes(key) && box.prop('checked') == false){
            box.addClass("highlight");
        } else {
            box.removeClass("highlight")
        }
    }

    $("body").click(function (e){
        var target_id = $(e.target).attr('id');

        if (target_id == "tut-back-button"){
            current.loadPrev();
        }

        var checked_amount = 0;

        for (var i = 0; i < checkboxes.length; i++){
            var box = $(checkboxes[i]);
            var key = box.val();
            if (values.includes(key) && box.prop('checked') == false){
                box.addClass("highlight");
            } else if (values.includes(key) && box.prop('checked') == true){
                checked_amount += 1;
                box.removeClass("highlight");
            } else {
                box.removeClass("highlight");
            }
        }
        if (checked_amount == values.length){
            current.loadNext();
        }
    });

}

function destroyHighlightInputs(){
    $("input:checkbox").removeClass("highlight");
    $("body").off("click");
    $("#shadow").hide();
}


var t1 = new TutorialCue("<p>Below is a visualization tool that makes use of sankey diagrams to provide a summarized view of data on research commercialization collected from the Ontario Centres of Excellence (OCE).</p><p>This box will provide explanations on how to use and explore the visualization and its data. Click 'Next' to continue.</p>");
var t2 = new TutorialCue("<p>Let's look at a few of the characteristics instead of all of them.</p><p>To do this: Scroll down and click 'Edit and Filter'</p>");
t2.setUp = function() {setUpHighlightDiv("toggle-button", t2)};
t2.destroy = function() {destroyHighlightDiv("toggle-button")};

var t3 = new TutorialCue("<p>Click 'Exclude All Characteristics'. This will hide all of the characteristics from view.</p>");
t3.setUp = function() {setUpHighlightDiv("deselect-all", t3)};
t3.destroy = function() {destroyHighlightDiv("deselect-all")};

var t4 = new TutorialCue("<p>Suppose we only want to see the IP Ownership and Gender:</p><p>Click on University, Creator, Male, and Female.</p><p><img src='select.gif'></p>");
t4.setUp = function(){selectedCharacteristics(["university", "creator", "male", "female"], t4)};

var t6 = new TutorialCue("<p>Click Show Changes.</p>");
t6.setUp = function() {setUpHighlightDiv("toggle-button", t6)};
t6.destroy = function() {destroyHighlightDiv("toggle-button")};

var t7 = new TutorialCue("<p>This shows the distribution of all of the projects: How many projects in our data set had the IP Ownership belonging to the university, how many belonged to the creator, how many projects had a male PI, and how many projects had a female PI.</p>");
var t8 = new TutorialCue("<p>If you hover over any of the characteristics, such as 'Creator', you can see what portion of the projects had that characteristic.</p>");
var t9 = new TutorialCue("<p>Suppose we want to see a breakdown by gender and IP ownership.</p>");
var t10 = new TutorialCue("<p>Click on 'Edit and Filter' again.</p>");
t10.setUp = function() {setUpHighlightDiv("toggle-button", t10)};
t10.destroy = function() {destroyHighlightDiv("toggle-button")};

var t11 = new TutorialCue("<p>Scroll down to the bottom and check off all of the characteristics: University, Creator, Male, and Female. These are the criteria we'll want to separate projects by.</p>");
t11.setUp = function() {setUpHighlightInputs(t11)};
t11.destroy = function() {destroyHighlightInputs()};

var t12 = new TutorialCue("<p>Click on 'Generate Filters'.</p>");
t12.setUp = function() {setUpHighlightDiv("generate-filters-button", t12)};
t12.destroy = function() {destroyHighlightDiv("generate-filters-button")};

var t13 = new TutorialCue("<p>We now have 4 splits of data: University + Male, Creator + Male, University + Female, Creator + Female.</p>");
var t14 = new TutorialCue("<p>Click on 'Show Changes'.</p>");
t14.setUp = function() {setUpHighlightDiv("toggle-button", t14)};
t14.destroy = function() {destroyHighlightDiv("toggle-button")};

var t15 = new TutorialCue("<p>If you hover over the Project characteristic, you can see how many projects exhibited the selected pair (e.g. there were 95 projects with Male PIs that had IP Ownership belonging to the University).</p>");
var t16 = new TutorialCue("<p>Hovering over Commercialization will show you what percentage of those projects resulted in commercialization. For example, 10.53% of the 95 projects with Male PIs and IP Ownership belonging to the University resulted in commercialization.</p>");
var t17 = new TutorialCue("<p>You can also see this breakdown for the different types of commercialization considered: Licenses and Startups.</p>");
var t18 = new TutorialCue("<p>Feel free to explore the visualization and use it to help you answer the upcoming questions.</p>");

var tutorial_list = [t1, t2, t3, t4, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18];
for (var i = 0; i < tutorial_list.length - 1; i ++){
    tutorial_list[i].setNext(tutorial_list[i + 1]);
}
