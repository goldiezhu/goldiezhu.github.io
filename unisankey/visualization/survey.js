sections = [];

responses = [];

current_section = -1;
section_index = 0;
question_index = 0;

function SurveySection(name, questions, choices, sankey_function){
    this.name = name;
    this.questions = questions;
    this.choices = choices;
    this.sankey_function = sankey_function;
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
            changeSankey();
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
            question_index = current_section.choices.length - 1;
            loadQuestion();
            changeSankey();
        }
    }
}

function changeSankey(){
    $("#survey-section").html(current_section.name);
    current_section.sankey_function();
    $("#sankey-container").height($(CANVASES[0]).height());
}


function setUpSurvey(){
    // TEMPORARY; ENTIRE IMAGE

    var q = ["A view with all of the characteristics visible. Grouped by gender. Clicking will hide the characteristic and everything that flows into it -- currently, there's no way to unhide it, because I don't know how I want to handle that yet (e.g. if they select what they want to see elsewhere or something)."];
    var c = [[]];

    var temp = new SurveySection("All Characteristics", q, c, sankey_all_characteristics);
    sections.push(temp);

    // RESEARCHER CHARACTERISTICS
    var q = ["1. Researchers have different levels of academic 'embeddedness' based on their rank and years since graduating from their PhD. Select all of the categories of researchers, if any, that you believe are most likely to achieve commercialization from research collaboration with an industry partner:",
             "2. Select all of the categories of researchers, if any, that you believe are most likely to generate a start-up company from research collaboration with an industry partner:",
             "3. Select all of the categories of researchers, if any, that you believe are most likely to generate a license from research collaboration with an industry partner:"];
    var c = [["Mid-Level Professors who have held their PhD for less than 15 Years",
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

    var rc_embed = new SurveySection("Researcher Characteristics: Embeddedness", q, c, sankey_embeddedness);
    sections.push(rc_embed);

    var q = ["4. Researchers have different levels of experience with industry-academic research collaboration. Select all of the categories of researchers, if any, that you believe are most likely to achieve commercialization from research collaboration with an industry partner:"];
    var c = [["Researchers with no prior OCE-supported industry research collaboration",
              "Researchers with one (1) prior OCE-supported industry research collaboration",
              "Researchers with two (2) or more prior OCE-supported industry research collaboration",
              "No difference in likelihood of commercialization between these researchers"]];

    var rc_collab = new SurveySection("Researcher Characteristics: Prior Industry-Academic Research Collaboration", q, c, sankey_collaboration);
    sections.push(rc_collab);

    var q = ["5. Select all of the types of researchers, if any, that you believe are most likely to achieve commercialization from research collaboration with an industry partner:"];
    var c = [["Mid-Level Professors who have held their PhD for less than 15 Years",
              "Full Professors who have held their PhD for more than 15 Years",
              "Researchers with no prior OCE-supported industry research collaboration",
              "Researchers with two (2) or more prior OCE-supported industry research collaboration",
              "No difference in likelihood of commercialization between these researchers"]];

    var rc_embedcollab = new SurveySection("Researcher Characteristics: Embeddedness and Prior Industry-Academic Research Collaboration", q, c, sankey_embed_collaboration);
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
    
    var f_ratio = new SurveySection("Firm Characteristics: Ratio of In-Kind Contribution to OCE Funding", q, c, sankey_inkind_ratio);
    sections.push(f_ratio);

    var q = ["9. Industry-academic research collaborations can involve companies of different sizes. Select the firm size(s) that you think will most likely be involved in academic research collaborations that achieve commercialization:"];
    var c = [["Micro companies ( less than 10 employees)",
              "Small companies (10 - 99 employees)",
              "Medium companies (100 - 999 employees)",
              "Large companies (over 1000 employees)",
              "No difference in likelihood of commercialization based on company size",
              "I am not sure which firm will be most likely to achieve commercialization."]];

    var f_size = new SurveySection("Firm Characteristics: Firm Size", q, c, sankey_firm_size);
    sections.push(f_size);

    var q = ["10. Companies involved in industry-academic research collaborations can contribute to projects in several ways. Select the type(s) or level(s) of firm contribution to an academic research collaboration that you believe will most likely to lead to commercialization:"];
    var c = [["A smaller in-kind contribution",
              "A larger in-kind contribution",
              "A smaller cash contribution",
              "A larger cash contribution",
              "No difference in likelihood of commercialization based on the company’s contribution",
              "I am not sure which contribution will be most likely to lead to commercialization."]];
    var f_contribs = new SurveySection("Firm Characteristics: In-Kind and Cash Contributions", q, c, sankey_firm_contributions);
    sections.push(f_contribs);
    
    var q = ["11. Overall, select the type(s) of industry-academic research collaboration that you believe will most likely to lead to commercialization:"];
    var c = [["A project involving a large firm making a small cash contribution",
              "A project involving a small firm making a large cash contribution",
              "A project involving a large firm making a small in-kind contribution",
              "A project involving a small firm making a large in-kind contribution",
              "No difference in likelihood of commercialization between these projects",
              "I am not sure which collaboration will be most likely to lead to commercialization."]];
    var f_sizecontribs = new SurveySection("Firm Characteristics: Firm Size and Contributions", q, c, sankey_firm_size_contributions);
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

    var u_operations = new SurveySection("University Characteristics: Operations Buget and Number of Students", q, c, sankey_operations);
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

    var u_faculty = new SurveySection("University Characteristics: Research Budget per Faculty Member", q, c, sankey_faculty);
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
    var u_operations_faculty = new SurveySection("University Characteristics: Operations Budget per Student and Research Budget per Faculty Member", q, c, sankey_operations_faculty);
    sections.push(u_operations_faculty);

    var q = ["20. University technology transfer offices (TTOs) exist to promote the commercialization of research results. Select all of the types of TTO, if any, that you believe are most likely to be associated with commercialization from research collaboration with an industry partner: "];
    var c = [["A TTO with more years of experience",
              "A TTO with fewer years of experience",
              "A TTO with more inventions per staff member",
              "A TTO with fewer inventions per staff member",
              "No difference in likelihood of commercialization based on TTO"]];
    var u_tto =  new SurveySection("University Characteristics: Technology Transfer Offices", q, c, sankey_tto);
    sections.push(u_tto);

    var q = ["21. Overall, select all of the universities, if any, that you believe are most likely to achieve commercialization from research collaboration with an industry partner:"];
    var c = [["A university with a larger operations budget per student",
              "A university with a larger research budget per faculty",
              "A TTO with more years of experience",
              "A TTO with more inventions per staff member",
              "No difference in likelihood of commercialization between these universities"]];
    var u_all =  new SurveySection("University Characteristics: Operations Budget per Student, Research Budget per Faculty Member, and TTOs", q, c, sankey_university);
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

    var p_field = new SurveySection("Project Characteristics: Field of Study", q, c, sankey_field);
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
    var p_stage = new SurveySection("Project Characteristics: Research Stage", q, c, sankey_stage);
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
    var p_distance = new SurveySection("Project Characteristics: Distance from Firm", q, c, sankey_distance);
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
    var p_monthly = new SurveySection("Project Characteristics: Funding per Month", q, c, sankey_monthly_funding);
    sections.push(p_monthly);

    var q = ["34. Industry-academic research collaborations can involve projects of different lengths and different budget sizes. The distance between the collaborators can also vary considerably. Select the types of collaboration projects, if any, that you feel are most likely to achieve commercialization:"];
    var c = [["Longer projects with smaller budgets",
              "Projects with smaller distance between the collaborators",
              "Shorter projects with larger budgets",
              "Projects with greater distance between the collaborators",
              "No difference in likelihood of commercialization based on length, budget or distance"]];
    var p_monthly_distance = new SurveySection("Project Characteristics: Funding per Month and Distance from Firm", q, c, sankey_monthly_distance);
    sections.push(p_monthly_distance);

    // TODO ADD SECTIONS FOR VISUALIZATION SCENARIO
    current_section = sections[0];
    responses = [];
    for (var i = 0; i < sections.length; i++){
      responses.push([]);
    }
}


CHOICE_TEMPLATE = "<label><input type='checkbox' value='##VALUE##' ##CHECKED##> ##CHOICE##<br></label>  ";

function storeResults(){
    var checked_items = $("#choices input:checkbox:checked");
    var resp = [];
    for (var i = 0; i < checked_items.length; i++){
        resp.push(parseInt($(checked_items[i]).val()));
    }

    responses[section_index][question_index] = resp;
}

function formatChoices(choice_list){
    var all_choices = "";

    for (var i = 0; i < choice_list.length; i++){
        var value = i;
        var choice_text = choice_list[i];
        var tempPlate = replaceTemplate(CHOICE_TEMPLATE, "##VALUE##", value);
        tempPlate = replaceTemplate(tempPlate, "##CHOICE##", choice_text);
        if (responses[question_index].indexOf(value) > -1){
            tempPlate = replaceTemplate(tempPlate, "##CHECKED##", "checked");
        } else {
            tempPlate = replaceTemplate(tempPlate, "##CHECKED##", "");
        }
        all_choices += tempPlate;
    }

    return all_choices;
}

function loadQuestion(){
    $("#question").html(current_section.questions[question_index]);
    $("#choices").html(formatChoices(current_section.choices[question_index]));
}

function nextQuestion(){
    current_section.nextQuestion();
}

function prevQuestion(){
    current_section.prevQuestion();
}

function SetUpQuestions(){
    setUpSurvey();
    changeSankey();
    loadQuestion();
    $("#back-button").click(prevQuestion);
    $("#next-button").click(nextQuestion);
}

