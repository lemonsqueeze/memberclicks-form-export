// ==UserScript==
// @name New Script
// ==/UserScript==

/***************************************** extract answers ***************************************/

var answers = {};
var numbers = [];

function add_answer(n, value)
{
    answers[n] = value;
    numbers.push(n);    
}

function handle_answer(n, value)
{
    value = value.replace(/^[ \t\n]*/, '');		// remove leading whitespace
    value = value.replace(/[ \t\n]*$/, '');		// remove trailing whitespace
    //alert(field.innerText + "\n" + value.innerText);
    
    if (!answers.hasOwnProperty(n))	// normal case
	add_answer(n, value);
    else				// handle multiple answers
    {
	var tmp = answers[n];
	delete answers[n];
	numbers.pop();
	
	add_answer(n + 'a', tmp);
	add_answer(n + 'b', value);
    }
}

function extract_answers()
{
    var fields = document.body.querySelectorAll('div.adminSummaryArea b');
    for (var i = 0; i < fields.length; i++)
    {
	var field = fields[i];
	var m = field.innerText.match(/^([0-9]+)-/);
	if (!m)		// not a question
	    continue;
    
	var n = m[1];	// question number
	var value = field.nextElementSibling.innerText;
	handle_answer(n, value);
    }
}

function dump_answers()
{
    numbers.forEach(function(n)
    {
	alert(n + '\n' + answers[n]);
    });
}

/***************************************** output csv ***************************************/

function save_file(s, mime_type)
{
    var url = "data:text/plain;base64,";
    if (mime_type)
	url = "data:" + mime_type + ";base64,";
    location.href = url + window.btoa(s);
}

function column_name(n)
{
    return 'answer' + n;
}

function column_data(n)
{
    var value = answers[n];
    value = value.replace(/,/g, '.');		// turn commas into dots, can't have commas inside the answers ...
    value = value.replace(/\n/g, ' ');		// turn newlines into spaces
    return value;
}

function output_csv()
{
    var s = "";
    // comma separated column names (answer1,answer2,answer3 ...)
    s += numbers.map(column_name).join(',') + '\n';
    // and answers ...
    s += numbers.map(column_data).join(',') + '\n';    
    
    save_file(s, 'text/csv');
}
    

/******************************************** main ******************************************/

function button_onclick()
{
    extract_answers();
    output_csv();
}

function add_button()
{
    var d = document.createElement('div');
    d.innerHTML = '<button style="float:right;">Export as CSV</button>';
    var b = d.firstChild;
    b.onclick = button_onclick;
    document.body.insertBefore(b, document.body.firstChild);
}

add_button();
