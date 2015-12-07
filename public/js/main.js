var content2 = `<div class="row">
            <div class="col-md-8 col-lg-8 col-sm-8 col-xs-8" id = "textDisplayArea">
             
            </div>
            <div class="col-md-4 col-sm-4 col-lg-4 col-xs-4" id="chartcontainer">
              <svg class="chart" id="chartarea">
              </svg>
            </div>`;

var content1 = `<form>
            <textarea class="form-control", rows = 8, id="textInput", placeholder="Type or paste your text here..."></textarea>
            </br>            
          </form>`;

var barHeight = 17
var savedText = ""
var highlighted = -1;

rectclick = function(d,i)
{
	if(highlighted == i)
	{
		clearHighlights();
		highlighted = -1		
	}else
	{
		clearHighlights();
		for(var j = 0; j < d.sids.length; j++)
		{
			highlightSentence(d.sids[j]);
		}
		highlighted = i;
		oldclass = $(".l-" + i).attr("class")
		$(".l-" + i).attr("class", oldclass + " barstroke")
	}
}

highlightSentence = function(sid)
{
	$("." + sid).addClass("hsentence");
}

clearHighlights = function()
{
	if(highlighted >= 0)
	{
		$(".l-" + highlighted).attr("class",$(".l-" + highlighted).attr("class").replace("barstroke", ""));
	}
	$('span').removeClass("hsentence");
}


dostuff = function(data)
{
	savedText = $('#textInput').val()
	$('#maincontent').html(content2);
	$('#gobtn').unbind('click');
	$('#gobtn').prop( "disabled", false );
	$('#gobtn').val("Back")
	$('#gobtn').click(undostuff);
	displaytext(data)
}

undostuff = function()
{
	highlighted = -1;
	$('#maincontent').html(content1);
	$('#gobtn').unbind('click');
	$('#gobtn').val("Go")
	$('#textInput').val(savedText)
	$('#gobtn').click(function()
	{
		$('#textInput').prop( "disabled", true );
		$('#gobtn').prop( "disabled", true );
		$('#gobtn').val("Loading...")
		var data = {text: $('#textInput').val()}
		$.get('/backend/getsentiment', data, function(data)
		{
			dostuff(data);
		})

	});
}


displaytext = function(data)
{
	paragraphs = data.paragraphs
	textArea = $("#textDisplayArea")
	for(var i = 0; i < paragraphs.length; i++)
	{
		pid = paragraphs[i].id		
		paragraph = $("<p></p>").appendTo(textArea).addClass("textformat").addClass(pid);
		sentences = paragraphs[i].sentences
		for(var j = 0; j < sentences.length; j++)
		{
			if(sentences[j].text.length > 0)
			{
				sid = sentences[j].id
				words = sentences[j].text.split(" ");
				if(j > 0)
				{
					sentence = $("<span></span>").addClass(sid).appendTo(paragraph);
					sentence.append(" ");
				}
				for(var k = 0; k<words.length; k++)
				{
					if(words[k].length > 0)
					{
						word = $("<span></span>").addClass(sid).appendTo(paragraph);
						if(k == words.length - 1){
							word.append(words[k]);	
						}else
						{
							word.append(words[k] + " ");	
						}
						
					}
				}

			}
		}
	}

	lineSentences = {}

	var lineId = -1;
	var lastHeight = -1;
	for(var i = 0; i < paragraphs.length; i++)
	{
		var paragraphObj = paragraphs[i]
		var sentences = paragraphObj.sentences
		for(var j = 0; j < sentences.length; j++)
		{
			var sentence = sentences[j]
			var sid = sentence.id
			var sentenceWords = $("." + sid)
			for(var k = 0; k < sentenceWords.length; k++)
			{
				var word = $(sentenceWords.get(k))
				var wordHeight = word.offset().top
				if(wordHeight > lastHeight+1)
				{
					lastHeight = wordHeight;
					lineId++;
				}
				if(lineSentences[lineId] == null)
				{
					lineSentences[lineId] = {lineHeight: wordHeight, scoreSum: 0, wordCount: 0, sids: []}
				}
				lineSentences[lineId]["scoreSum"] += sentence.score;
				lineSentences[lineId]["wordCount"] += 1;
				if(lineSentences[lineId].sids.indexOf(sid) < 0)
				{
					lineSentences[lineId].sids.push(sid);	
				}
			}
		}

	}


	
	var numLines = Object.keys(lineSentences).length;
	var data = Object.keys(lineSentences).map(function(k){return lineSentences[k]});
	var maxheight = data[data.length-1].lineHeight - data[0].lineHeight + barHeight;


	var width = $("#chartcontainer").width() -5;

	var x = d3.scale.linear()
	    .domain([-1, 1])
	    .range([0, width]);

	var chart = d3.select(".chart")
	    .attr("width", width)
	    .attr("height", maxheight);

	chart.append("line")
		.style("stroke","black")
		.attr("x1", width/2)
		.attr("y1",0)
		.attr("x2", width/2)
		.attr("y2", maxheight -1)

	translateFun = function(d, i)
	{
		if(lineSentences[i].scoreSum > 0)
		{
			return "translate(" + width/2 + "," + (lineSentences[i].lineHeight - lineSentences[0].lineHeight) + ")";
		}else
		{
			return "translate(" +x(d.scoreSum/d.wordCount) +"," + (lineSentences[i].lineHeight - lineSentences[0].lineHeight) + ")";
		}


	}

	var bar = chart.selectAll("g")
	    .data(data)
	  .enter().append("g")
	  	    .attr("transform", translateFun);

	bar.append("rect")
		.attr("class", function(d, i) { return (d.scoreSum < 0 ? "bar negative" : "bar positive") + " l-" + i; })
		.attr("height", barHeight - 1)
		.attr("width",0)
		.on("click", rectclick)
		.transition()
		.delay(function (d,i){ return i * 45;}).duration(400)
	    .attr("width", function(d) { return Math.abs(x(d.scoreSum/d.wordCount) - x(0)); });
	    

	//bar.append("text")


}

$(document).ready(function() { 

	undostuff()

});