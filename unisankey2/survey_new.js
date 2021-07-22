
function Question(number, topic, question, choices, is_split, is_long){
    this.number = number;
    this.topic = topic;
    this.question = question;
    this.choices = choices;
    this.response = [];  // should contain a list for each part
    this.timing = [];
    this.subquestions = [];
    this.is_split = is_split;
    this.is_long = is_long;
    this.parent = null;
    this.next = null;
    this.prev = null;


    if (this.is_split){
        this.generateSubquestions();
    }
}

/**
 * Generate the subquestions.
 */
Question.prototype.generateSubquestions = function(){
    var split_1 = new Question(this.number + "a", this.topic, "Select the project most likely to result in a <b>startup</b>. A project involving:",
                               this.choices.slice(),
                               false,
                               false);

    var split_2 = new Question(this.number + "b", this.topic, "Select the project most likely to result in a <b>license</b>. A project involving:",
                               this.choices.slice(),
                               false,
                               false);

    split_1.setNextQuestion(split_2)
    split_1.prev = this;
    split_2.setParentQuestion(this);

    this.subquestions = [split_1, split_2];
}

Question.prototype.setNextQuestion = function(question){
    this.next = question;
    question.prev = this;
}

Question.prototype.setParentQuestion = function(question){
    this.parent = question;
}


Question.prototype.getPrevQuestion = function(){
    return this.prev;
}

/*
 * Return the next question.
 * PRECONDITION: this.isLastQuestion() == false
 */
Question.prototype.getNextQuestion = function(){
    if (this.is_split){
        // Check if the choice is True or not.
        if (this.response.length > 1){
            if (this.response[1][1] == 1){
                return this.subquestions[0];
            }
        }
    }

    if (this.next == null && this.parent != null){
        return this.parent.next;
    }

    return this.next;
}

Question.prototype.isLastQuestion = function(){
    if (this.next == null && this.parent == null){
        if (this.subquestions.length > 0 && this.response.length > 0 && this.response[1][1] == 1){
            return false;
        }
        return true;
    }

    if (this.next == null && this.parent != null && this.parent.next == null){
        return true;
    }

    return false;
}

/**
 * Update this.response to match what's currently displayed.
 */
Question.prototype.updateResponse = function(){
    var all_responses = $(".question-response");
    var response_values = [];

    for (var i = 0; i < all_responses.length; i++){
        var input = $(all_responses[i]);

        if (input.is("textarea")){
            response_values.push(input.val());
        } else {
            if (input.prop('checked') == true){
                response_values.push(1);
            } else {
                response_values.push(0);
            }
        }
        
    }

    // Divide as needed
    // First section is for things matching choices
    // 2nd list is for other
    var first_list = [];
    for (var i = 0; i < this.choices.length; i++){
        first_list.push(response_values[i]);
    }


    var second_list = [];
    for (var i = this.choices.length; i < response_values.length; i++){
        second_list.push(response_values[i]);
    }

    this.response = [first_list, second_list];
}

/**
 * Return the HTML content of the question.
 */
Question.prototype.getContent = function(){
    var question = "<div id='question'>" + this.number + ". " + this.question;

    if (this.is_long){
        question += "<br/><br/>Please rate what you think is the likelihood of producing commercialization outcomes.";
    }

    question += "</div>";

    var choices = "<div id='choices'>" + this.formatChoices() + "</div>";

    var extra = "";

    if (this.is_split){
        var split_question = "<div id='split-question'>Would your answer be different for specific commercialization outcomes, like generating a license or creating a startup?</div>";

        var same_value = 0;
        var diff_value = 0;

        if (this.response.length > 1){
            var same_value = this.response[1][0];
            var diff_value = this.response[1][1]
        }

        var same_checked = '';
        var diff_checked = '';

        if (same_value == 1){
            same_checked = 'checked';
        }

        if (diff_value == 1){
            diff_checked = 'checked';
        }

        if (same_value == 0 && diff_value == 0){
            same_checked = 'checked';
        }

        var split_choices = "<div id='split-choices'><label><input type='radio' value='0' class='question-response' name='same-diff' " + same_checked + "> My answer would be the same</label><br/><label><input type='radio' value='1' class='question-response' name='same-diff' " + diff_checked + "> My answer would be different</label></div>";

        extra = split_question + split_choices;
    }

    if (this.is_long){
        var response = '';
        if (this.response.length > 1){
            response = this.response[1][0];
        }

        extra += "<div id='explanation-container'>Please provide a brief explanation of the factors that affected your decision.<br/><textarea class='question-response'>" + response + "</textarea>";
    }

    return question + choices + extra;
}


Question.prototype.formatChoices = function(){
    //  class='question-response'
    var num_choices = this.choices.length;
    var all_choices = [];

    if (this.response.length == 0){
        for (var x = 0; x < num_choices; x++){
            all_choices.push(0);
        }
    } else {
        all_choices = this.response[0];
    }

    var choice_html = '';

    if (this.is_long){
        // use radio buttons spaced near each other
        for (var x = 0; x < num_choices; x++){
            var id = 'choice-' + x;
            var label = this.choices[x];
            var value = all_choices[x];

            var checked = '';

            if (value == 1){
                checked = 'checked';
            }

            var html = '';
            if (x > 0){
                html += "<br\>";
            }

            html += '<input type="radio" class="question-response" name="likelihood" id="' + id + '" ' + checked +'><label for="' + id +'"> ' + label + '</label>';

            choice_html += html;
        }
    } else {
        // use checkboxes for each; new lines between
        for (var x = 0; x < num_choices; x++){
            var id = 'choice-' + x;
            var label = this.choices[x];
            var value = all_choices[x];
            var checked = '';

            if (value == 1){
                checked = 'checked';
            }

            var html = '';
            if (x > 0){
                html += "<br\>";
            }

            html += '<label><input type="checkbox" class="question-response"  ' + checked +'> ' + label + '</label>';

            choice_html += html;

        }
    }

    return choice_html;
}
Question.prototype.updateTiming = function(){
  var dt = new Date();
  this.timing.push(dt.getTime());
}

Question.prototype.loadQuestion = function(){
    var topic_div = $("#survey-section");
    topic_div.html(this.topic);

    var question_div = $("#question-container");
    question_div.html("");
    question_div.append(this.getContent());

    $(".question-response").change(changeResponse);

    // add handlers for when responses change
    // tag with 'question-choice' class

    // change next to submit if needed
    this.updateButtons();
    this.updateTiming();
}

Question.prototype.updateButtons = function(){
    $("#back-button").show();
    $("#next-button").show();
    $("#submit-button").show();

    if (this.prev == null){
        $("#back-button").hide();
    }

    if (this.isLastQuestion()){
        $("#next-button").hide();
    } else {
        $("#submit-button").hide();
    }
}

Question.prototype.gatherAllResponses = function(){
    var all_responses = [];
    all_responses.push([this.number, this.response, this.timing]);

    if (this.subquestions.length > 0){
        for (var i = 0; i < this.subquestions.length; i++){
            all_responses.push([this.subquestions[i].number, this.subquestions[i].response, this.subquestions[i].timing]);
        }
    }

    var next_responses = [];
    if (this.next){
        next_responses = this.next.gatherAllResponses();
    }
    return all_responses.concat(next_responses);
}

/**
 * Set up all of the questions below
 */

var q1 = new Question(1, "Researcher Characteristics: Rank and Seniority",
                      "Industry-academic research collaboration projects may involve academic researchers of varying rank and seniority. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ["Mid-Level Professors who have held their PhD for less than 15 Years",
                       "Full Professors who have held their PhD for less than 15 Years",
                       "Mid-level Professors who have held their PhD for more than 15 Years",
                       "Full Professors who have held their PhD for more than 15 Years",
                       "No difference in likelihood of commercialization between these categories",
                       "I am not sure"],
                       true, false);

var q2 = new Question(2, "Researcher Characteristics: Prior Industry-Academic Research Collaboration",
                      "Academic researchers may have varying levels of experience with industry-academic research collaboration. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ["Professors with no prior OCE-supported industry research collaboration",
                       "Professors with one (1) prior OCE-supported industry research collaboration",
                       "Professors with two (2) or more prior OCE-supported industry research collaboration",
                       "No difference in likelihood of commercialization between these researchers",
                       "I am not sure"],
                       true, false);

var q3 = new Question(3, "Firm Characteristics: Firm Size",
                      "Industry-academic research collaborations can involve firms of different sizes. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ["Micro companies (less than 10 employees)",
                       "Small companies (10 - 99 employees)",
                       "Medium companies (100 - 999 employees)",
                       "Large companies (over 1000 employees)",
                       "No difference in likelihood of commercialization based on company size",
                       "I am not sure"],
                       true, false);

var q4 = new Question(4, "Firm Characteristics: Firm Contributions",
                      "Firms involved in industry-academic research collaborations can contribute to projects in several ways. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ["A smaller in-kind contribution by the firm(s) ",
                       "A larger in-kind contribution by the firm(s) ",
                       "A smaller cash contribution by the firm(s) ",
                       "A larger cash contribution by the firm(s) ",
                       "No difference in likelihood of commercialization based on firm contribution",
                       "I am not sure"],
                       true, false);

var q5 = new Question(5, "Firm Characteristics: In-Kind Contributions",
                      "Firms may provide varying levels of in-kind contributions to industry-academic research collaborations. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ["A firm in-kind contribution value at half of OCE's financial contribution.", "A firm in-kind contribution equal to OCE's financial contribution.", "A firm in-kind contribution valued at twice that of OCE's financial contribution.", 'All of the above seem equally likely.', 'I am not sure.'],
                       true, false);

var q6 = new Question(6, "University Characteristics: University Size",
                      "Industry-academic research collaborations can involve universities of different sizes. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ['A university with a smaller operations budget per student', 'A university with a larger operations budget per student', 'A university with a smaller research budget per faculty member', 'A university with a larger research budget per faculty member', 'No difference in likelihood of commercialization based on university size', 'I am not sure'],
                       true, false);

var q7 = new Question(7, "University Characteristics: Technology Transfer Offices",
                      "University technology transfer offices (TTOs) exist to promote the commercialization of research results. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving a university with:",
                      ['A TTO with more years of experience', 'A TTO with fewer years of experience', 'A TTO with more inventions per staff member', 'A TTO with fewer inventions per staff member', 'No difference in likelihood of commercialization based on TTO', 'I am not sure'],
                       true, false);

var q8 = new Question(8, "Project Characteristics: Field of Study",
                      "Industry-academic collaborations can involve research in various fields of study. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) in the field of:",
                      ['Earth and Environmental Technologies', 'Communications and Information Technologies', 'Photonics Technologies', 'Materials and Manufacturing Technologies', 'No difference in likelihood of commercialization based on field of study', 'I am not sure'],
                       true, false);

var q9 = new Question(9, "Project Characteristics: Research Stage",
                      "Industry-academic collaborations can involve research at different stages. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ['Earlier-stage research', 'Later-stage research', 'Latest-stage research', 'No difference in likelihood of commercialization based on stage of research', 'I am not sure'],
                       true, false);

var q10 = new Question(10, "Project Characteristics: Distance",
                      "The physical distance between industry-academic collaborators may vary among projects. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ['A distance of up to 10km between the collaborators', 'A distance of up to 200km between the collaborators', 'A distance of up to 500km between the collaborators', 'All of the above seem equally likely.', 'I am not sure'],
                       true, false);

var q11 = new Question(11, "Project Characteristics: Funding",
                      "Industry-academic collaborations may involve varying levels of financial support from OCE and/or the collaborating firm. Select the project(s) most likely to result in <b>commercialization</b>. Project(s) involving:",
                      ['A low level of combined OCE and firm funding', 'A moderate level of combined OCE and firm funding', 'A high level of OCE and firm funding', 'All of the above seem equally likely.', 'I am not sure'],
                       true, false);


var scen1 = new Question(1, "Scenario 1", "Prof. Jane Smith earned her PhD within the last 5 years. She is an Assistant Professor who has already been involved in two prior OCE-funded industry-academic research collaborations. Her university has a large operations budget per student and a technology transfer office that has been in operations for many years, but receives relatively few invention disclosures per staff.<br/><br/>Prof. Smith would like to submit an application for funding from OCE for a very late-stage research collaboration with a large company in the field of earth and environmental technology that is located in the same city, only a few blocks from the university. The project will be of considerable length with a relatively small budget, but the company is willing to make a sizable cash contribution.", ["1 - Not at all likely", "2 - Not likely", "3 - Possible", "4 - Likely", "5 - Very Likely"], false, true)

var scen2 = new Question(2, "Scenario 2", "Prof. John Davis earned his PhD 8 years ago and has achieved the academic rank of full Professor. He is new to OCE and has never been involved in a OCE-funded industry-academic research collaboration. He works at a university with a relatively small research budget per faculty member. The university has a new technology transfer office that has been generating a good number of invention disclosures given the size of the office.<br/><br/>Prof. Davis would like to submit an application for funding from OCE for a mid-stage research collaboration with a small advanced manufacturing company. The collaboration will be short in length with a small budget, and the company has agreed to make a moderate in-kind contribution to the project. The university is downtown while company is in a rural community approx. 200 km away.", ["1 - Not at all likely", "2 - Not likely", "3 - Possible", "4 - Likely", "5 - Very Likely"], false, true)

var scen3 = new Question(3, "Scenario 3", "Prof. Richard Lee is an Assistant Professor who earned his PhD 18 years ago. He has been involved in 5 prior OCE-funded industry-academic research collaborations. His university has a relatively small operational budget per student, and has no technology transfer staff. Therefore the few invention disclosures it receives are managed by staff in the office of research.<br/><br/>Prof. Lee would like to submit an application for funding from OCE in support of a collaboration with a “micro” start-up company on early-stage photonics research. This will be a relatively short collaboration of that will have a large budget. The company is willing to make a sizable in-kind contribution to the project, but is not contributing cash. The start-up is physically located on the university campus.", ["1 - Not at all likely", "2 - Not likely", "3 - Possible", "4 - Likely", "5 - Very Likely"], false, true)

var scen4 = new Question(4, "Scenario 4", "Prof. Mary Johnson is a full Professor who earned her PhD 25 years ago. She has been involved in over 10 prior OCE-funded industry-academic research collaborations. She works at a university with a very large research budget per faculty. The university also has a well established technology transfer office that receives a considerable number of invention disclosures per staff.<br/><br/>Prof. Johnson would like to submit an application for funding from OCE in support of a collaboration with a medium sized company on early-stage research in the field of communications and information technology. This will be a long-term collaboration with a large budget, and the company is making a considerable cash and in-kind contribution to the project. The researcher is in Ottawa while the company is in Waterloo.", ["1 - Not at all likely", "2 - Not likely", "3 - Possible", "4 - Likely", "5 - Very Likely"], false, true)

q1.setNextQuestion(q2);
q2.setNextQuestion(q3);
q3.setNextQuestion(q4);
q4.setNextQuestion(q5);
q5.setNextQuestion(q6);
q6.setNextQuestion(q7);
q7.setNextQuestion(q8);
q8.setNextQuestion(q9);
q9.setNextQuestion(q10);
q10.setNextQuestion(q11);
q11.setNextQuestion(scen1);
scen1.setNextQuestion(scen2);
scen2.setNextQuestion(scen3);
scen3.setNextQuestion(scen4);

/**
 * Set up the question handlers
 */
var current_question = null;

function changeResponse(){
    current_question.updateResponse();
    current_question.updateButtons();
}

function loadPrev(){
    current_question.updateResponse();
    current_question.updateTiming();

    current_question = current_question.prev;
    current_question.loadQuestion();
    current_question.updateButtons();
}

function loadNext(){
    if (current_question == null){
        current_question = q1;
    } else {
        current_question.updateResponse();
        current_question.updateTiming();

        current_question = current_question.getNextQuestion();
    }
    current_question.loadQuestion();
    current_question.updateButtons();
}

function submitResponses(){
    current_question.updateResponse();
    var all_responses = q1.gatherAllResponses();
    var id = getUrlParameter('id');
    sendPOST('https://unisankey.herokuapp.com/', ['id', 'data'], [id, all_responses]);
    
    $("#survey-body").hide();
    $("#end").show();
}
