

sections = [];

responses = [];

current_section = -1;
section_index = 0;
question_index = 0;

scenario_index = 17;
tutorial = 0;

tutorial_script = ["Tutorial removed temporarily as it's undergoing revisions. Just press 'Next' to get rid of this."]

// tutorial_script = ["<div class='tut-txt'><p>Below is a visualization tool that makes use of sankey diagrams to provide a summarized view of data on research commercialization collected from the Ontario Centres of Excellence (OCE).</p><p>This box will provide explanations on how to use and explore the visualization and its data. Click 'Next' to continue.</p></div>",
//                    "<div class='tut-txt'><p>Various characteristics are displayed in the visualization. Hovering over one of the characteristics tells you what that characteristic is composed of, and what the characteristic is a part of.</p><p>For example, hovering over 'Project' will list the characteristics of our projects, the number of projects in the data set, and the percentage of those projects that resulted in commercialization.</p></div><img src='https://puu.sh/Bj6fx/a0c90060ca.gif'>",
//                    "<div class='tut-txt'><p>You can modify how this visualization looks by clicking on the 'Edit and Filter' button.</p></div>",
//                    "<div class='tut-txt'><p>Clicking on a characteristic in this view will hide it. You can also click and drag to create a box in order to hide multiple characterstics at once.</p></div><img src='https://puu.sh/Bj6u0/828f1b1220.gif'>",
//                    "<div class='tut-txt'><p>Click on 'Show Changes' to see the visualization again. The nodes you clicked on should be hidden.</p></div>",
//                    "<div class='tut-txt'><p>Go back to 'Edit and Filter' and hide all characterstics except 'Gender', 'Field', and anything that those characterstics contribute to ('Male', 'Female, 'Photonics', 'Project', etc.) and press 'Show Changes' again.</p><p>This should show us how the genders and fields are distributed in our data set.</p></div><img src='https://puu.sh/Bj6Ec/c9c50ab445.png'>",
//                    "<div class='tut-txt'><p>Right now, we see the distribution of the entire data set. Suppose we want to see how the fields are distributed for projects where the primary investigator was Male. To do this, go back to the 'Edit and Filter' view.</p></div>",
//                    "<div class='tut-txt'><p>Click on the button labelled '+ Add Filter' and select 'Gender' and 'Male'.</p></div><img src='https://puu.sh/Bj78C/094d459d5e.gif'>",
//                    "<div class='tut-txt'><p>Click on 'Show Changes'. You should see that the distribution contains only Males. Hovering over the 'Project' characteristic should show you how many projects fit the criteria of the filter you just created.</p></div>",
//                    "<div class='tut-txt'><p>Suppose we want to compare the distribution of projects with Female primary investigators compared to those with Males.</p><p>Go back to 'Edit and Filter'.</p></div>",
//                    "<div class='tut-txt'><p>Select '+ Add Filter Set'. A new set, coloured pink, should appear.</p></div><img src='https://puu.sh/Bj7KI/ea6a216d68.gif'>",
//                    "<div class='tut-txt'><p>In this set, select '+ Add Filter', then 'Gender', and 'Female'. When you're done, press 'Show Changes' again.</p></div><img src='https://puu.sh/Bj7PJ/cd5be86a27.gif'>",
//                    "<div class='tut-txt'><p>The visuals in pink represents our new set of data containing only Female researchers.</p></div>",
//                    "<div class='tut-txt'><p>Hovering over the 'Project' characteristic will tell you how many projects have Female researchers as the primary investigator, the distribution of their fields of research, and the percentage of those that resulted in commercialization (producing either a license or resulting in a start-up company).</p></div>",
//                    "<div class='tut-txt'><p>You may continue exploring the data set until you're comfortable with the visualization. Afterwards, press 'Next' to continue with the study and progress to the survey.</p></div>"
//                    ];

function SurveySection(name, questions, choices, sankey_function = -1){
    this.name = name;
    this.questions = questions;
    this.choices = choices;
    this.sankey_function = -1;
}

SurveySection.prototype.nextQuestion = function(){
    if (question_index < current_section.questions.length - 1){
        storeResults();
        question_index += 1;
        loadQuestion();
    } else {
        if (section_index < sections.length - 1){
            storeResults();
            section_index += 1;
            question_index = 0;
            current_section = sections[section_index];
            loadQuestion();
            // changeSankey();
            if (section_index == sections.length - 1){
              $("#next-button").hide();
              $("#submit-button").show();
            }
        }
    }

}
SurveySection.prototype.prevQuestion = function(){
    if (question_index > 0){
        storeResults();
        question_index -= 1;
        loadQuestion();
    } else {
        if (section_index > 0){
            storeResults();
            section_index -= 1;
            current_section = sections[section_index];
            question_index = current_section.questions.length - 1;
            loadQuestion();
            //changeSankey();

              $("#next-button").show();
              $("#submit-button").hide();
        }
    }
}

function changeSankey(){
    $("#survey-section").html(current_section.name);
    //current_section.sankey_function();
    $("#sankey-container").height($(CANVASES[0]).height());
}


function setUpSurvey(){
    $(".tutorial").hide();
    $(".survey-things").show();
    loadNext();
}


CHOICE_TEMPLATE = "<label><input type='checkbox' value='##VALUE##' ##CHECKED##> ##CHOICE##<br></label>  ";

SCENARIO_TEMPLATE = '<p>Please rate what you think is the likelihood of producing commercialization outcomes.</p><input type="radio" name="likelihood" value="1" id="likelihood-1"><label for="likelihood-1"> 1 - Not at all likely</label><input type="radio" name="likelihood" id="likelihood-2" value="2"><label for="likelihood-2"> 2 - Not likely</label><input id="likelihood-3" type="radio" name="likelihood" value="3"><label for="likelihood-3"> 3 - Possible</label><input type="radio" name="likelihood" id="likelihood-4" value="4"><label for="likelihood-4"> 4 - Likely</label><input type="radio" name="likelihood" id="likelihood-5" value="5"><label for="likelihood-5"> 5 - Very Likely</label><p>Please provide a brief explanation of the factors that affected your decision.</p><textarea></textarea>';
function storeResults(){
    if (section_index < scenario_index){
      var checked_items = $("#choices input:checkbox:checked");
      var resp = [];
      for (var i = 0; i < checked_items.length; i++){
          resp.push(parseInt($(checked_items[i]).val()));
      }

      responses[section_index][question_index] = resp;
    } else {
      var likelihood = $("#choices input:radio:checked").val();
      var response_text = $("#choices textarea").val();
      var resp = [likelihood, response_text];

      responses[section_index][question_index] = resp;
    }
}

function formatChoices(choice_list){

    var all_choices = "";

    if (section_index < scenario_index){
      for (var i = 0; i < choice_list.length; i++){
          var value = i;
          var choice_text = choice_list[i];
          var tempPlate = replaceTemplate(CHOICE_TEMPLATE, "##VALUE##", value);
          tempPlate = replaceTemplate(tempPlate, "##CHOICE##", choice_text);
          if (question_index < responses[section_index].length && responses[section_index][question_index].indexOf(value) > -1){
              tempPlate = replaceTemplate(tempPlate, "##CHECKED##", "checked");
          } else {
              tempPlate = replaceTemplate(tempPlate, "##CHECKED##", "");
          }
          all_choices += tempPlate;
        }
    } else {
      all_choices += SCENARIO_TEMPLATE;
    }

    return all_choices;
}

function loadQuestion(){
    $("#survey-section").html(current_section.name);
    $("#question").html(current_section.questions[question_index]);
    if (section_index >= scenario_index){
      $("#choices").html(formatChoices([]));
      if (responses.length > section_index && responses[section_index].length > question_index && responses[section_index][question_index].length > 1){
        // Update the response stuff here
        var id = responses[section_index][question_index][0];
        $("#likelihood-" + id).prop('checked', true);
        $("#choices textarea").val(responses[section_index][question_index][1]);
      }
    } else {
      $("#choices").html(formatChoices(current_section.choices[question_index]));
    }
}

function nextQuestion(){
    current_section.nextQuestion();
}

function prevQuestion(){
    current_section.prevQuestion();
}

function startSurvey(){
  $("#intro").hide();
  $("#specific-intro").show()
}



function loadTutorial(){
  if (tutorial >= tutorial_script.length){
    // setUpSurvey();
    // changeSankey();
  } else {
    // $("#tutorial-text-container").html(tutorial_script[tutorial])
  }
  t1.onLoad();
}

function prevTut(){
  if (tutorial > 0){
    tutorial -= 1;
    loadTutorial();
  }
}
function nextTut(){
  tutorial += 1;
  loadTutorial();
}

function submit(){
  $("#survey-body").hide();
  $("#end").show();
}

function beginSurvey(){
  $("#specific-intro").hide()
  $("#survey-body").show();
  loadTutorial();
  $('html,body').scrollTop(0);

  resizeWindow();
}

function SetUpQuestions(){
    // $("#tut-back-button").click(prevTut);
    // $("#tut-next-button").click(nextTut);
    $("#back-button").click(loadPrev);
    $("#next-button").click(loadNext);
    $("#start-button").click(startSurvey);
    $("#submit-button").click(submitResponses);
    $("#begin-button").click(beginSurvey);
    $("#specific-intro").hide();
    $(".survey-things").hide();
    $("#end").hide();
    $("#submit-button").hide();
}
