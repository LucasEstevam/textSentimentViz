var content2 = `
	<div class="row">
    	<div class="col-md-8 col-lg-8 col-sm-8 col-xs-8" id = "textDisplayArea">
             
        </div>
        <div class="col-md-4 col-sm-4 col-lg-4 col-xs-4" id="chartcontainer">
              <svg class="chart" id="chartarea">
              </svg>
        </div>
    </div>
        <div class="row">

            <div class="col-md-offset-8 col-lg-offset-8 col-sm-offset-8 col-xs-offset-8 col-md-4 col-sm-4 col-lg-4 col-xs-4">
         		<div class="btn-group" data-toggle="buttons">
                	<label class="btn btn-default btn-xs active">
                    	<input type="radio" id="modebtn1" name="mode" value="1" checked/> By Sentence
                	</label> 
               		<label class="btn btn-default btn-xs">
                    	<input type="radio" id="modebtn2" name="mode" value="2" /> By Line
                	</label>
             	</div>
            </div>
        </div>`;

var content1 = `<form>
            <textarea class="form-control", rows = 8, id="textInput", placeholder="Type or paste your text here..."></textarea>
            </br>            
          </form>`;

var barHeight = 17
var savedText = ""
var highlighted = -1;
var byLine = false;

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
		oldclass = $(".b-" + i).attr("class")
		$(".b-" + i).attr("class", oldclass + " barstroke")
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
		$(".b-" + highlighted).attr("class",$(".b-" + highlighted).attr("class").replace("barstroke", ""));
	}
	$('span').removeClass("hsentence");
}

modechange = function()
{
	clearHighlights();
	highlighted = -1;
	if($('input:radio[name="mode"]')[1].checked)
	{
		byLine = true;
	}else
	{
		byLine = false;
	}
	displayChart(byLine);
}


dostuff = function(data)
{
	savedText = $('#textInput').val()
	$('#maincontent').html(content2);
	$('#gobtn').unbind('click');
	$('#gobtn').prop( "disabled", false );
	$('#gobtn').val("Back")
	$('#gobtn').click(undostuff);
	$('input:radio[name="mode"]').change(
	    modechange);
	currentData = data;
	displaytext(currentData);
	displayChart(byLine);
}

undostuff = function()
{
	highlighted = -1;
	byLine = false;
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
		$.get('backend/getsentiment', data, function(data)
		{
			dostuff(data);
		})

	});
}


displaytext = function(data)
{
	//writes text onto page
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

	sentencesLines = []


	lineSentences = []

	var lineId = -1;
	var lastHeight = -1;
	for(var i = 0; i < paragraphs.length; i++)
	{
		var paragraphObj = paragraphs[i]
		var sentences = paragraphObj.sentences
		var paragraphEmpty = true;
		for(var j = 0; j < sentences.length; j++)
		{
			var sentence = sentences[j]
			if(sentence.text)
			{
				paragraphEmpty = false;
				var sid = sentence.id
				var sentenceWords = $("." + sid)
				var sentenceObj = {sids: [sid]}
				sentenceObj.score = sentence.score
				for(var k = 0; k < sentenceWords.length; k++)
				{
					var word = $(sentenceWords.get(k))
					var wordHeight = word.offset().top		
					if(wordHeight > lastHeight+1)
					{
						lastHeight = wordHeight;
						lineId++;
					}

					if(sentenceObj.startLine == null)
					{
						sentenceObj.startLine = Math.max(lineId,0);
					}
					if(sentenceObj.startX == null)
					{
						sentenceObj.startX = word.offset().left
					}				
					
					sentenceObj.finalLine = lineId;
					sentenceObj.finalX = word.offset().left + word.width()
					if(lineSentences[lineId] == null)
					{
						lineSentences[lineId] = {lineHeight: wordHeight, scoreSum: 0, wordCount: 0, sids: [], startX: word.offset().left}
					}
					lineSentences[lineId]["finalX"] = word.offset().left + word.width()
					lineSentences[lineId]["scoreSum"] += sentence.score;
					lineSentences[lineId]["wordCount"] += 1;
					if(lineSentences[lineId].sids.indexOf(sid) < 0)
					{
						lineSentences[lineId].sids.push(sid);	
					}
				}
				sentencesLines.push(sentenceObj)
			}
		}
	}

}

displayChart = function(byLine)
{	
	d3.select(".chart").selectAll("*").remove();
	var width = $("#chartcontainer").width() -5;

	var x = d3.scale.linear()
	    .domain([-1, 1])
	    .range([0, width]);


	//calculate bars for each line
	for(var i = 0; i < lineSentences.length; i++)
	{
		var line = lineSentences[i];
		line.score = line.scoreSum/line.wordCount;
		line.bar = {};
		line.bar.width = Math.abs(x(line.score) - x(0));
		line.bar.height = barHeight - 1;
		if(line.score > 0)
		{
			line.bar.offsetX = width/2;
			line.bar.offsetY = line.lineHeight - lineSentences[0].lineHeight;
			line.bar.class = "bar positive" + " b-" + i;
		}else
		{
			line.bar.offsetX = x(line.score);
			line.bar.offsetY = line.lineHeight - lineSentences[0].lineHeight;
			line.bar.class = "bar negative" + " b-" + i;
		}
	}

	//calculate bars for each sentence
	for(var i = 0; i < sentencesLines.length; i++)
	{
		var sentence = sentencesLines[i];
		sentence.bar = {};
		startLine = lineSentences[sentence.startLine];
		finalLine = lineSentences[sentence.finalLine];
		startPct = Math.max((sentence.startX - startLine.startX)/(startLine.finalX - startLine.startX), 0);
		endPct = Math.min((sentence.finalX - finalLine.startX)/(finalLine.finalX - finalLine.startX),1);

		barStartH = startLine.lineHeight + barHeight*startPct;
		barEndH = finalLine.lineHeight + barHeight*endPct-1;
		sentence.bar.height = barEndH-barStartH;
		sentence.bar.width = Math.abs(x(sentence.score) - x(0));
		if(sentence.score > 0)
		{
			sentence.bar.offsetX = width/2;
			sentence.bar.offsetY = barStartH - lineSentences[0].lineHeight;
			sentence.bar.class = "bar positive" + " b-" + i;
		}else
		{
			sentence.bar.offsetX = x(sentence.score);
			sentence.bar.offsetY = barStartH - lineSentences[0].lineHeight;
			sentence.bar.class = "bar negative" + " b-" + i;
		}


	}




	
	var numLines = Object.keys(lineSentences).length;
	var data = sentencesLines;
	if(byLine)
	{
		data = lineSentences;
	}
	//var data = Object.keys(lineSentences).map(function(k){return lineSentences[k]});
	var maxheight = lineSentences[lineSentences.length-1].lineHeight - lineSentences[0].lineHeight + barHeight;


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
			return "translate(" + d.bar.offsetX + "," + d.bar.offsetY + ")";

	}

	heightFun = function(d, i)
	{
		return d.bar.height;
	}

	var bar = chart.selectAll("g")
	    .data(data)
	  .enter().append("g")
	  	    .attr("transform", translateFun);

	bar.append("rect")
		.attr("class", function(d, i) { return d.bar.class; })	
		.attr("height",  function(d, i) { return d.bar.height; })
		.attr("width",0)
		.on("click", rectclick)
		.transition()
		.delay(function (d,i){ return i * 45;}).duration(400)
		.attr("width", function(d) { return d.bar.width; });
	    //.attr("width", function(d) { return Math.abs(x(d.scoreSum/d.wordCount) - x(0)); });
	    //.attr("height", barHeight - 1)

	//bar.append("text")


}

$(document).ready(function() { 

	undostuff();


});