
var fulltext = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut volutpat mi non mi maximus aliquet. In sed egestas ligula. Sed id dui eu ligula dignissim placerat eu rhoncus urna. Curabitur congue dictum lorem sed porta.
Donec sit amet enim non ligula faucibus imperdiet. Sed quis pretium ligula. Etiam ex nibh, pellentesque ac auctor id, vulputate eget mauris. Nam egestas urna tincidunt dui fringilla volutpat. Ut id vehicula metus, sit amet viverra lorem. Donec id turpis massa. Proin at condimentum felis. Praesent consequat justo vulputate feugiat feugiat. Suspendisse non aliquet elit.
Duis dignissim erat arcu, ultricies viverra orci vestibulum ac. Nullam vel molestie nibh, vel feugiat libero. Donec a porttitor felis. Sed bibendum nibh faucibus volutpat aliquet. Sed tincidunt eu libero rhoncus facilisis.
Aenean faucibus id nisi in congue. Proin non sem non justo iaculis ornare sit amet et risus. Sed non leo elit. Curabitur vestibulum magna lobortis consectetur aliquam. Fusce vel libero id sapien commodo interdum eu id dolor. Phasellus ac consectetur erat, sit amet facilisis enim. Ut tristique justo sapien. Suspendisse ullamcorper vehicula enim, quis posuere nulla porta eu.`;


var allSentencesIds = []
$(document).ready(function() { 


	paragraphs = fulltext.split("\n");
	textArea = $("#textDisplayArea")
	jsonObj = []
	for(var i = 0; i < paragraphs.length; i++)
	{
		pid = "p" + i;
		paragraph = $("<p></p>").appendTo(textArea).addClass("textformat").addClass(pid);
		sentences = paragraphs[i].split(".");
		paragraphScore = Math.random();
		var pgObj = {score: paragraphScore, sentences: [], id:pid};
		for(var j = 0; j < sentences.length; j++)
		{
			if(sentences[j].length > 0)
			{
				sid = pid + "-" + j;
				allSentencesIds.push(sid);
				words = sentences[j].split(" ");
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
				sentence = $("<span></span>").addClass(sid).appendTo(paragraph);
				sentence.append(".");
				sentenceScore = Math.random();
				var sObj = {text: sentences[j] + ".", score: sentenceScore, id:sid};
				pgObj["sentences"].push(sObj)
			}
		}
		jsonObj.push(pgObj)

	}


	//create object with lines displayed on screen
	lineSentences = {}

	var lineId = -1;
	var lastHeight = -1;
	for(var i = 0; i < jsonObj.length; i++)
	{
		var paragraphObj = jsonObj[i]
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
					lineSentences[lineId] = {lineHeight: wordHeight, scoreSum: 0, wordCount: 0}
				}
				lineSentences[lineId]["scoreSum"] += sentence.score;
				lineSentences[lineId]["wordCount"] += 1;
			}
		}

	}

	var numLines = Object.keys(lineSentences).length;
	var data = Object.keys(lineSentences).map(function(k){return lineSentences[k]});

	var width = $("#chartcontainer").width() -5,
	    barHeight = 17;

	var x = d3.scale.linear()
	    .domain([0, 1])
	    .range([0, width]);

	var chart = d3.select(".chart")
	    .attr("width", width)
	    .attr("height", barHeight * numLines + 50);

	chart.append("line")
		.style("stroke","black")
		.attr("x1", width/2)
		.attr("y1",0)
		.attr("x2", width/2)
		.attr("y2", barHeight * numLines + 30)

	translateFun = function(d, i)
	{
		return "translate(" + width/2 + "," + (lineSentences[i].lineHeight - lineSentences[0].lineHeight) + ")";
	}

	var bar = chart.selectAll("g")
	    .data(data)
	  .enter().append("g")
	  	    .attr("transform", translateFun);

	bar.append("rect")
		.attr("height", barHeight - 1)
		.attr("width",0)
		.transition()
		.delay(function (d,i){ return i * 100;}).duration(300)
	    .attr("width", function(d) { return x(d.scoreSum/d.wordCount); });

	//bar.append("text")
	  //  .attr("x", function(d) { return x(d.scoreSum/d.wordCount) - 3; })
	    //.attr("y", barHeight / 2)
	   // .attr("dy", ".35em")
	   // .text(function(d) { return d.scoreSum/d.wordCount; });

});