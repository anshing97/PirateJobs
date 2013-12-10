/* our priate function */

var pirate_talk = function () {

  var PHRASES = [["are","be"],
                 ["and", "n'"],
                 ["around", "aroun'"],
                 ["ever","e'er"],
                 ["everyone","all hands"],
                 ["for", "fer"],
                 ["hello", "ahoy"], 
                 ["is", "be"], 
                 ["know", "be knowin'"],
                 ["my", "me"], 
                 ["no", "nay"],
                 ["of","o'"],
                 ["people","scallywags"],
                 ["the", "th'"],
                 ["that's", "that be"],
                 ["we", "our jolly crew"],
                 ["where", "whar"], 
                 ["wasn't", "weren't"],
                 ["you", "ye"],
                 ["your", "yer"],
                 ["yes", "ya"],
                 ["you're", "you be"],
                 ["Are","Be"],
                 ["And", "N'"],
                 ["Around", "Aroun'"],
                 ["Ever","E'er"],
                 ["Everyone","All hands"],
                 ["For", "Fer"],
                 ["Hello", "Ahoy"], 
                 ["Is", "Be"], 
                 ["Know", "Be knowin'"],
                 ["My", "Me"], 
                 ["No", "Vay"],
                 ["Never", "Vary"],
                 ["Of","O'"],
                 ["People","Scallywags"],
                 ["The", "Th'"],
                 ["That's", "That be"],
                 ["We", "Our jolly crew"],
                 ["Where", "Whar"], 
                 ["Wasn't", "wWren't"],
                 ["You", "Ye"],
                 ["Your", "Yer"],
                 ["Yes", "Ya"],
                 ["You're", "You be"]
  ];

  var REGEXES = [];

  var init = function () {
    for ( var ii = 0; ii < PHRASES.length; ii++ ) {
      REGEXES.push(new RegExp("\\b"+PHRASES[ii][0]+"\\b", "g"));
    }    
  }();

  var translate = function (text) {
    for (var ii = 0; ii < REGEXES.length; ii++) {
      text = text.replace(REGEXES[ii],PHRASES[ii][1]);
    }

    // deal with some endings
    text = text.replace(/ing\b/ig, "in'").replace(/ings\b/ig,"in's");

    return text;
  }

  return {
    translate: translate,
  }

}(); 


/* dealing with view */ 
var view = function () {

  var $title = $('#title');
  var $description = $('#description');
  var $count = $('#count');
  var $search_input = $('header input');
  var $job_link = $('#links a');
  var $landing = $('#landing');
  var $posting = $('#posting');
  var $has_results = $('.has-results');

  var render_job = function ( data ) {

    $title.html('<p>Would ye be joinin\' <span>' + data.company + '</span> as a <span>' + data.title + '</span> in <span>' + data.location + '?</span></p>');

    $description.empty()
                .html(data.text);

    $job_link.attr('href',data.url);

    $count.html('Showing ' + data.index + ' of ' + data.total);

    $posting.show(); 
    $has_results.show(); 
    $landing.hide();
  }

  var no_results = function () {

    var search_term = $search_input.val();

    $title.html("<p>Sorry matey, but nothin' be found fer <span>" + search_term + "</span>. Give a go with <span>Javascript</span> or <span>Engineer?</span></p>");
    $count.html("No results");

    $posting.show(); 
    $has_results.hide();     
    $landing.hide();
  }

  var update_search = function (term) {
    $search_input.val(term);
  }



  return {
    render_job: render_job, 
    no_results: no_results, 
    update_search: update_search,
  }

}(); 

var github_data = function () {

  var job_data; 
  var index = 0; 

  var get_job_data = function () {

    var text = pirate_talk.translate(job_data[index].description);
    var location = job_data[index].location; 
    var title = job_data[index].title;
    var company = job_data[index].company; 
    var url = job_data[index].url;

    return {
      text: text, 
      location: location, 
      title: title, 
      company: company, 
      url: url, 
      index: index + 1, 
      total: job_data.length
    }
  }

  var success = function (data) {

    if ( data.length > 0 ) {
      // save this and reset index
      job_data = data;
      index = 0; 
      view.render_job(get_job_data());
    } else {
      view.no_results();
    }
  }


  var next = function () {

    index++; 

    if ( index >= job_data.length ) {
      index = 0; 
    }

    view.render_job(get_job_data());
  }

  var previous = function () {

    index--; 

    if ( index < 0 ) {
      index = job_data.length - 1; 
    }

    view.render_job(get_job_data());
  }

  var query = function (search_term) {

    var url = "http://jobs.github.com/positions.json";

    $.ajax({
      dataType: "jsonp",
      url: url,
      data: {search: search_term},
      success: success
    });

    view.update_search(search_term);

  }

  return {
    next: next, 
    previous: previous, 
    query: query,     
  }

}(); 




$(function(){

  $('form').submit(function(e){
    var val = $('input',$(this)).val();
    github_data.query(val);
    e.preventDefault();    
  });

  $('#next').click(function(e){
    github_data.next();
    return false; 
  });

  $('#previous').click(function(e){
    github_data.previous(); 
    return false; 
  })


});