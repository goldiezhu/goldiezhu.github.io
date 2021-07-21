

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
    // TEMPORARY; ENTIRE IMAGE

    // var q = ["Familiarize yourself with the interface above: Press 'Edit and Filter' in order to hide characteristics and add sets and filters. Characteristics can be hidden by clicking on them or by drawing a box around multiple characteristics.<br/><br/>Click on 'Show Changes' to see the changes applied to the visualization.<br/><br/><center></div><img src='https://puu.sh/BdtwN/20da8eb435.gif'></center>"];
    // var c = [[]];

    // var temp = new SurveySection("Before Starting", q, c, sankey_all_characteristics);
    // sections.push(temp);

    //TODO: Would your answer be different for specific commercialization outcomes, like generating a license or creating a startup? (same, different)

    // RESEARCHER CHARACTERISTICS
    var q = ["1. Industry-academic research collaboration projects may involve academic researchers of varying rank and seniority. Select the project most likely to result in <b>commercialization</b>. A project involving:",
             "1a. Select the project most likely to result in a <b>startup</b>. A project involving:",
             "1b. Select the project most likely to result in a <b>license</b>. A project involving:"];
    var c = [[" Mid-Level Professors who have held their PhD for less than 15 Years",
              "Full Professors who have held their PhD for less than 15 Years",
              "Mid-level Professors who have held their PhD for more than 15 Years",
              "Full Professors who have held their PhD for more than 15 Years",
              "No difference in likelihood of commercialization between these categories"],
             ["Mid-Level Professors who have held their PhD for less than 15 Years",
              "Full Professors who have held their PhD for less than 15 Years",
              "Mid-level Professors who have held their PhD for more than 15 Years",
              "Full Professors who have held their PhD for more than 15 Years",
              "No difference in likelihood of commercialization between these categories"],
             ["Mid-Level Professors who have held their PhD for less than 15 Years",
              "Full Professors who have held their PhD for less than 15 Years",
              "Mid-level Professors who have held their PhD for more than 15 Years",
              "Full Professors who have held their PhD for more than 15 Years",
              "No difference in likelihood of commercialization between these categories"]];

    var rc_embed = new SurveySection("Researcher Characteristics: Rank and Seniority", q, c);
    sections.push(rc_embed);

    var q = ["4. Researchers have different levels of experience with industry-academic research collaboration. Select all of the categories of researchers, if any, that you believe are most likely to achieve commercialization from research collaboration with an industry partner:"];
    var c = [["Researchers with no prior OCE-supported industry research collaboration",
              "Researchers with one (1) prior OCE-supported industry research collaboration",
              "Researchers with two (2) or more prior OCE-supported industry research collaboration",
              "No difference in likelihood of commercialization between these researchers"]];

    var rc_collab = new SurveySection("Researcher Characteristics: Prior Industry-Academic Research Collaboration", q, c);
    sections.push(rc_collab);

    var q = ["5. Select all of the types of researchers, if any, that you believe are most likely to achieve commercialization from research collaboration with an industry partner:"];
    var c = [["Mid-Level Professors who have held their PhD for less than 15 Years",
              "Full Professors who have held their PhD for more than 15 Years",
              "Researchers with no prior OCE-supported industry research collaboration",
              "Researchers with two (2) or more prior OCE-supported industry research collaboration",
              "No difference in likelihood of commercialization between these researchers"]];

    var rc_embedcollab = new SurveySection("Researcher Characteristics: Embeddedness and Prior Industry-Academic Research Collaboration", q, c);
    sections.push(rc_embedcollab);

    // FIRM CHARACTERISTICS

    var q = ["6. Select the project scenario(s) that you think would most likely result in commercialization.",
             "7. Select the project scenario(s) that you think would most likely result in a license.",
             "8. Select the project scenario(s) that you think would most likely result in a startup."];

    var c = [["A project that receives funding worth $15,000 from OCE and in-kind funding worth $15,000 from a collaborating firm.",
              "A project that receives funding worth $10,000 from OCE and in-kind funding worth $20,000 from a collaborating firm.",
              "A project that receives funding worth $20,000 from OCE and in-kind funding worth $10,000 from a collaborating firm.",
              "All of the above seem equally likely.",
              "I am not sure which scenario will be most likely to result in commercialization."],
             ["A project that receives funding worth $15,000 from OCE and in-kind funding worth $15,000 from a collaborating firm.",
              "A project that receives funding worth $10,000 from OCE and in-kind funding worth $20,000 from a collaborating firm.",
              "A project that receives funding worth $20,000 from OCE and in-kind funding worth $10,000 from a collaborating firm.",
              "All of the above seem equally likely.",
              "I am not sure which scenario will be most likely to result in a license."],
             ["A project that receives funding worth $15,000 from OCE and in-kind funding worth $15,000 from a collaborating firm.",
              "A project that receives funding worth $10,000 from OCE and in-kind funding worth $20,000 from a collaborating firm.",
              "A project that receives funding worth $20,000 from OCE and in-kind funding worth $10,000 from a collaborating firm.",
              "All of the above seem equally likely.",
              "I am not sure which scenario will be most likely to result in a startup."]];
    
    var f_ratio = new SurveySection("Firm Characteristics: Ratio of In-Kind Contribution to OCE Funding", q, c);
    sections.push(f_ratio);

    var q = ["9. Industry-academic research collaborations can involve companies of different sizes. Select the firm size(s) that you think will most likely be involved in academic research collaborations that achieve commercialization:"];
    var c = [["Micro companies ( less than 10 employees)",
              "Small companies (10 - 99 employees)",
              "Medium companies (100 - 999 employees)",
              "Large companies (over 1000 employees)",
              "No difference in likelihood of commercialization based on company size",
              "I am not sure which firm will be most likely to achieve commercialization."]];

    var f_size = new SurveySection("Firm Characteristics: Firm Size", q, c);
    sections.push(f_size);

    var q = ["10. Companies involved in industry-academic research collaborations can contribute to projects in several ways. Select the type(s) or level(s) of firm contribution to an academic research collaboration that you believe will most likely to lead to commercialization:"];
    var c = [["A smaller in-kind contribution",
              "A larger in-kind contribution",
              "A smaller cash contribution",
              "A larger cash contribution",
              "No difference in likelihood of commercialization based on the company’s contribution",
              "I am not sure which contribution will be most likely to lead to commercialization."]];
    var f_contribs = new SurveySection("Firm Characteristics: In-Kind and Cash Contributions", q, c);
    sections.push(f_contribs);
    
    var q = ["11. Overall, select the type(s) of industry-academic research collaboration that you believe will most likely to lead to commercialization:"];
    var c = [["A project involving a large firm making a small cash contribution",
              "A project involving a small firm making a large cash contribution",
              "A project involving a large firm making a small in-kind contribution",
              "A project involving a small firm making a large in-kind contribution",
              "No difference in likelihood of commercialization between these projects",
              "I am not sure which collaboration will be most likely to lead to commercialization."]];
    var f_sizecontribs = new SurveySection("Firm Characteristics: Firm Size and Contributions", q, c);
    sections.push(f_sizecontribs);

    // UNIVERSITY CHARACTERISTICS
    var q = ["12. Select all of the university scenarios, if any, for a researcher working on a project that you think would most likely result in commercialization.",
             "13. Select all of the university scenarios, if any, for a researcher working on a project that you think would most likely result in a license.",
             "14. Select all of the university scenarios, if any, for a researcher working on a project that you think would most likely result in a startup."];

    var c = [["A university with 5,000 students and an operations budget of $50 million.",
              "A university with 10,000 students and an operations budget of $80 million.",
              "A university with 20,000 students and an operations budget of $120 million.",
              "All of the above seem equally likely."],
             ["A university with 5,000 students and an operations budget of $50 million.",
              "A university with 10,000 students and an operations budget of $80 million.",
              "A university with 20,000 students and an operations budget of $120 million.",
              "All of the above seem equally likely."],
             ["A university with 5,000 students and an operations budget of $50 million.",
              "A university with 10,000 students and an operations budget of $80 million.",
              "A university with 20,000 students and an operations budget of $120 million.",
              "All of the above seem equally likely."]];

    var u_operations = new SurveySection("University Characteristics: Operations Buget and Number of Students", q, c);
    sections.push(u_operations);

    var q = ["15. Select all of the university scenarios, if any, for a researcher working on a project that you think would most likely result in commercialization.",
             "16. Select all of the university scenarios, if any, for a researcher working on a project that you think would most likely result in a license.",
             "17. Select all of the university scenarios, if any, for a researcher working on a project that you think would most likely result in a startup."];

    var c = [["A university with 500 faculty members and a research budget of $100 million.",
              "A university with 1,000 faculty members and a research budget of $150 million.",
              "A university with 2,000 faculty members and a research budget of $200 million.",
              "All of the above seem equally likely."],
             ["A university with 500 faculty members and a research budget of $100 million.",
              "A university with 1,000 faculty members and a research budget of $150 million.",
              "A university with 2,000 faculty members and a research budget of $200 million.",
              "All of the above seem equally likely."],
             ["A university with 500 faculty members and a research budget of $100 million.",
              "A university with 1,000 faculty members and a research budget of $150 million.",
              "A university with 2,000 faculty members and a research budget of $200 million.",
              "All of the above seem equally likely."]];

    var u_faculty = new SurveySection("University Characteristics: Research Budget per Faculty Member", q, c);
    sections.push(u_faculty);

    var q = ["18. Industry-academic research collaborations can involve universities of different sizes. Select all of the universities, if any, that you believe are most likely to achieve commercialization from research collaboration with an industry partner:",
             "19. Select all of the universities, if any, that you believe are least likely to generate a start-up company from research collaboration with an industry partner:"];
    var c = [["A university with a smaller operations budget per student",
              "A university with a smaller research budget per faculty",
              "A university with a larger operations budget per student",
              "A university with a larger research budget per faculty",
              "No difference in likelihood of commercialization based on university size"],
             ["A university with a smaller operations budget per student",
              "A university with a smaller research budget per faculty",
              "A university with a larger operations budget per student",
              "A university with a larger research budget per faculty",
              "No difference in likelihood of commercialization based on university size"]];
    var u_operations_faculty = new SurveySection("University Characteristics: Operations Budget per Student and Research Budget per Faculty Member", q, c);
    sections.push(u_operations_faculty);

    var q = ["20. University technology transfer offices (TTOs) exist to promote the commercialization of research results. Select all of the types of TTO, if any, that you believe are most likely to be associated with commercialization from research collaboration with an industry partner: "];
    var c = [["A TTO with more years of experience",
              "A TTO with fewer years of experience",
              "A TTO with more inventions per staff member",
              "A TTO with fewer inventions per staff member",
              "No difference in likelihood of commercialization based on TTO"]];
    var u_tto =  new SurveySection("University Characteristics: Technology Transfer Offices", q, c);
    sections.push(u_tto);

    var q = ["21. Overall, select all of the universities, if any, that you believe are most likely to achieve commercialization from research collaboration with an industry partner:"];
    var c = [["A university with a larger operations budget per student",
              "A university with a larger research budget per faculty",
              "A TTO with more years of experience",
              "A TTO with more inventions per staff member",
              "No difference in likelihood of commercialization between these universities"]];
    var u_all =  new SurveySection("University Characteristics: Operations Budget per Student, Research Budget per Faculty Member, and TTOs", q, c);
    sections.push(u_all);

    var q = ["22. Industry-academic collaborations can involve research in various fields of study. Select all of the fields of study, if any, that you believe have industry-academic research collaborations that are most likely to achieve commercialization:",
             "23. Industry-academic collaborations can involve research in various fields of study. Select all of the fields of study, if any, that you believe have industry-academic research collaborations that are most likely to produce a license.",
             "24. Industry-academic collaborations can involve research in various fields of study. Select all of the fields of study, if any, that you believe have industry-academic research collaborations that are most likely to achieve produce a startup:"];
    var c = [["Earth and Environmental Technologies",
              "Communications and Information Technologies",
              "Photonics Technologies",
              "Materials and Manufacturing Technologies",
              "No difference in likelihood of commercialization based on field of study"],
             ["Earth and Environmental Technologies",
             "Communications and Information Technologies",
             "Photonics Technologies",
             "Materials and Manufacturing Technologies",
             "No difference in likelihood of commercialization based on field of study"],
             ["Earth and Environmental Technologies",
             "Communications and Information Technologies",
             "Photonics Technologies",
             "Materials and Manufacturing Technologies",
             "No difference in likelihood of commercialization based on field of study"]];

    var p_field = new SurveySection("Project Characteristics: Field of Study", q, c);
    sections.push(p_field);

    var q = ["25. Industry-academic collaborations can involve research at different stages. Select all of the stages of research, if any, that you believe have collaborations that are most likely to achieve commercialization:",
             "26. Select all of the stages of research, if any, that you believe have collaborations that are most likely to generate a start-up company.",
             "27. Select all of the stages of research, if any, that you believe have collaborations that are most likely to generate a license."];
    var c = [["Earlier-stage research",
              "Later-stage research",
              "Latest-stage research",
              "No difference in likelihood of commercialization based on stage of research"],
             ["Earlier-stage research",
              "Later-stage research",
              "Latest-stage research",
              "No difference in likelihood of a startup based on stage of research"],
             ["Earlier-stage research",
              "Later-stage research",
              "Latest-stage research",
              "No difference in likelihood of a startup based on stage of research"]];
    var p_stage = new SurveySection("Project Characteristics: Research Stage", q, c);
    sections.push(p_stage);

    var q = ["28. Select all of the projects, if any, that you feel would most likely result in commercialization.",
             "29. Select all of the projects, if any, that you feel would most likely result in a license.",
             "30. Select all of the projects, if any, that you feel would most likely result in a startup."];
    var c = [["A project between a firm and a researcher where the researcher resides 10km away from the firm.",
              "A project between a firm and a researcher where the researcher resides 100km away from the firm.",
              "A project between a firm and a researcher where the researcher resides 200km away from the firm.",
              "All of the above seem equally likely."],
             ["A project between a firm and a researcher where the researcher resides 10km away from the firm.",
              "A project between a firm and a researcher where the researcher resides 100km away from the firm.",
              "A project between a firm and a researcher where the researcher resides 200km away from the firm.",
              "All of the above seem equally likely."],
             ["A project between a firm and a researcher where the researcher resides 10km away from the firm.",
              "A project between a firm and a researcher where the researcher resides 100km away from the firm.",
              "A project between a firm and a researcher where the researcher resides 200km away from the firm.",
              "All of the above seem equally likely."]];
    var p_distance = new SurveySection("Project Characteristics: Distance from Firm", q, c);
    sections.push(p_distance);

    var q = ["31. Select all of the projects, if any, that you feel would most likely result in commercialization.",
             "32. Select all of the projects, if any, that you feel would most likely result in a license.",
             "33. Select all of the projects, if any, that you feel would most likely result in a startup."];
    var c = [["A project that receives cash funding worth $52,500 and in-kind funding worth $52,500 from collaborating firms, and $75,000 in funding from OCE over the course of 12 months.",
              "A project that receives cash funding worth $70,000 and in-kind funding worth $70,000 from collaborating firms, and $100,000 in funding from OCE over the course of 24 months.",
              "A project that receives cash funding worth $84,000 and in-kind funding worth $84,000 from collaborating firms, and $120,000 in funding from OCE over the course of 36 months.",
              "All of the above seem equally likely."],
             ["A project that receives cash funding worth $52,500 and in-kind funding worth $52,500 from collaborating firms, and $75,000 in funding from OCE over the course of 12 months.",
              "A project that receives cash funding worth $70,000 and in-kind funding worth $70,000 from collaborating firms, and $100,000 in funding from OCE over the course of 24 months.",
              "A project that receives cash funding worth $84,000 and in-kind funding worth $84,000 from collaborating firms, and $120,000 in funding from OCE over the course of 36 months.",
              "All of the above seem equally likely."],
             ["A project that receives cash funding worth $52,500 and in-kind funding worth $52,500 from collaborating firms, and $75,000 in funding from OCE over the course of 12 months.",
              "A project that receives cash funding worth $70,000 and in-kind funding worth $70,000 from collaborating firms, and $100,000 in funding from OCE over the course of 24 months.",
              "A project that receives cash funding worth $84,000 and in-kind funding worth $84,000 from collaborating firms, and $120,000 in funding from OCE over the course of 36 months.",
              "All of the above seem equally likely."]];
    var p_monthly = new SurveySection("Project Characteristics: Funding per Month", q, c);
    sections.push(p_monthly);

    var q = ["34. Industry-academic research collaborations can involve projects of different lengths and different budget sizes. The distance between the collaborators can also vary considerably. Select the types of collaboration projects, if any, that you feel are most likely to achieve commercialization:"];
    var c = [["Longer projects with smaller budgets",
              "Projects with smaller distance between the collaborators",
              "Shorter projects with larger budgets",
              "Projects with greater distance between the collaborators",
              "No difference in likelihood of commercialization based on length, budget or distance"]];
    var p_monthly_distance = new SurveySection("Project Characteristics: Funding per Month and Distance from Firm", q, c);
    sections.push(p_monthly_distance);


    var q = ["<p>Prof. Jane Smith earned her PhD within the last 5 years. She is an Assistant Professor who has already been involved in two prior OCE-funded industry-academic research collaborations. Her university has a large operations budget per student and a technology transfer office that has been in operations for many years, but receives relatively few invention disclosures per staff. </p><p>Prof. Smith would like to submit an application for funding from OCE for a very late-stage research collaboration with a large company in the field of earth and environmental technology that is located in the same city, only a few blocks from the university. The project will be of considerable length with a relatively small budget, but the company is willing to make a sizable cash contribution.</p>"];
    var c = [];
    var scenario = new SurveySection("Scenario 1", q, c);
    sections.push(scenario);


    var q = ["<p>Prof. John Davis earned his PhD 8 years ago and has achieved the academic rank of full Professor. He is new to OCE and has never been involved in a OCE-funded industry-academic research collaboration. He works at a university with a relatively small research budget per faculty member. The university has a new technology transfer office that has been generating a good number of invention disclosures given the size of the office. </p><p>Prof. Davis would like to submit an application for funding from OCE for a mid-stage research collaboration with a small advanced manufacturing company. The collaboration will be short in length with a small budget, and the company has agreed to make a moderate in-kind contribution to the project. The university is downtown while company is on the outskirts of the city, just outside of the metropolitan area. </p>"];
    var c = [];
    var scenario = new SurveySection("Scenario 2", q, c);
    sections.push(scenario);

    var q = ["<p>Prof. Richard Lee is an Assistant Professor who earned his PhD 18 years ago. He has been involved in 5 prior OCE-funded industry-academic research collaborations. His university has a relatively small operational budget per student, and has no technology transfer staff. Therefore the few invention disclosures it receives are managed by staff in the office of research.</p><p>Prof. Lee would like to submit an application for funding from OCE in support of a collaboration with a “micro” start-up company on early-stage photonics research. This will be a relatively short collaboration of that will have a large budget. The company is willing to make a sizable in-kind contribution to the project, but is not contributing cash. The start-up is physically located on the university campus.</p>"];
    var c = [];
    var scenario = new SurveySection("Scenario 3", q, c);
    sections.push(scenario);

    var q = ["<p>Prof. Mary Johnson is a full Professor who earned her PhD 25 years ago. She has been involved in over 10 prior OCE-funded industry-academic research collaborations. She works at a university with a very large research budget per faculty. The university also has a well established technology transfer office that receives a considerable number of invention disclosures per staff. </p><p>Prof. Johnson would like to submit an application for funding from OCE in support of a collaboration with a medium sized company on early-stage research in the field of communications and information technology. This will be a long-term collaboration with a large budget, and the company is making a considerable cash and in-kind contribution to the project. The researcher is in Ottawa while the company is in Waterloo. </p>"];
    var c = [];
    var scenario = new SurveySection("Scenario 4", q, c);
    sections.push(scenario);


    // TODO ADD SECTIONS FOR VISUALIZATION SCENARIO
    current_section = sections[0];
    responses = [];
    for (var i = 0; i < sections.length; i++){
      responses.push([]);
    }
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
    setUpSurvey();
    changeSankey();
    loadQuestion();
  } else {
    $("#tutorial-text-container").html(tutorial_script[tutorial])
  }
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
    $("#tut-back-button").click(prevTut);
    $("#tut-next-button").click(nextTut);
    $("#back-button").click(prevQuestion);
    $("#next-button").click(nextQuestion);
    $("#start-button").click(startSurvey);
    $("#submit-button").click(submit);
    $("#begin-button").click(beginSurvey);
    $("#specific-intro").hide();
    $(".survey-things").hide();
    $("#end").hide();
    $("#submit-button").hide();
    startSurvey();
    beginSurvey();
}

