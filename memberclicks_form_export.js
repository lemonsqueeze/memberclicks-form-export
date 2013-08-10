// ==UserScript==
// @name	 MemberclicksFormExport
// @author	 lemonsqueeze
// @version	 1.0
// @namespace
// @scriptsource
// @published    2013-08-10 14:40
// @description  Adds a button to export memberclicks forms (receipts) as CSV file
// @include      https://*.memberclicks.net/*/formMgmt.do?*
// ==/UserScript==


/***************************************** extract answers ***************************************/

// numbered questions
var answers = {};		// by number, like answers['3']
var numbers = [];		// question numbers

// non question fields (name, first name ...)
var values = {};		// name/value pairs
var names = [];			

function add_answer(n, value)
{
    answers[n] = value;
    numbers.push(n);    
}

function add_data(name, value)
{
    values[name] = value;
    names.push(name);
}

function handle_answer(n, value)
{
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

function handle_data(name, value)
{
    name = cleanup_value(name);
    name = name.toLowerCase();
    name = name.replace(/:$/, '');		// remove trailing semicolon
    name = name.replace(/ /g, '_');		// replace spaces by underscores
    add_data(name, value);
}

function cleanup_value(v)
{
    v = v.replace(/^[ \t\n]*/, '');		// remove leading whitespace
    v = v.replace(/[ \t\n]*$/, '');		// remove trailing whitespace
    return v;
}

function extract_data()
{
    var fields = document.body.querySelectorAll('div.adminSummaryArea b');
    for (var i = 0; i < fields.length; i++)
    {
	var field = fields[i];
	var value = cleanup_value(field.nextElementSibling.innerText);
	var m = field.innerText.match(/^([0-9]+)-/);
	if (!m)		// not a question
	    handle_data(field.innerText, value);
	else
	{
	    var n = m[1];	// question number
	    handle_answer(n, value);
	}
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

function csv_escape(s)
{
    s = s.replace(/,/g, '.');		// turn commas into dots, can't have commas inside the answers ...
    s = s.replace(/\n/g, ' ');		// turn newlines into spaces
    return s;
}

// answers
function column_answer(n)
{
    return 'answer' + n;
}

function data_answer(n)
{
    return answers[n];
}

// extra stuff
function column_name(n)
{
    return n;
}

function data_name(n)
{
    return values[n];
}

function output_csv()
{
    var s = "";

    var columns =              names.map(column_name);
    columns = columns.concat(numbers.map(column_answer));
    var data =           names.map(data_name);
    data = data.concat(numbers.map(data_answer));

    columns = columns.map(csv_escape);
    data = data.map(csv_escape);
    
    // comma separated column names (extra_stuff,answer1,answer2,answer3 ...)
    s += columns.join(',') + '\n';
    s += data.join(',') + '\n';		    // and answers ...
    
    save_file(s, 'text/csv');
}
    

/******************************************** main ******************************************/

function button_onclick()
{
    extract_data();
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
