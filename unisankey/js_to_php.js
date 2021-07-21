/* formatPOSTData
 * Format parameter_names and their corresponding parameter_values
 * such that it's in POST data format.
 *
 * Pre-condition: parameter_names.length == parameter_values.length
 *
 * Example:
 * > formatPOSTData(['a', 'b'], [1, 2])
 * a=1&b=2
 */
function formatPOSTData(parameter_names, parameter_values){
    var post_variables = "";
    for (var i = 0; i < parameter_names.length; i++){
        var encoded = window.encodeURIComponent(parameter_values[i]).replace(/'/g, "%27");
        post_variables += parameter_names[i] + "=" + encoded;

        if (i + 1 < parameter_names.length){
            post_variables += "&";
        }
    }
    return post_variables;
}

/* sendPOST
 * Send a POST request to url with the given parameter_names and their
 * associated parameter_values.
 * 
 * Pre-condition: parameter_names.length == parameter_values.length
 *
 * Example:
 * sendPOST('ex.php', ['a', 'b'], [1, 2])
 * Will send a POST request to ex.php with a=1&b=2
 */
function sendPOST(url, parameter_names, parameter_values){
    var post_variables = formatPOSTData(parameter_names, parameter_values);

    var http_request = new XMLHttpRequest();
    http_request.open("POST", url, true);
    http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http_request.onreadystatechange = function() {
        if(http_request.readyState == 4 && http_request.status == 200) {
            // If the request was OK, then do the following:
            var return_data = http_request.responseText;
            console.log(return_data);
        }
    }
    http_request.send(post_variables);
}

/* getUrlParameter
 * Retrieve the GET parameter with name sParam from the current page's URL.
 * 
 * Example for a website with "&id=123":
 * > getUrlParameter('id')
 * 123
 */
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

