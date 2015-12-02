from random import random
import re

def computeSentimentPart(text):
	return -1 + 2*random()

def computeSentiment(text):
	paragraphs = text.split('\n')
	sentiments = []
	for i in range(0, len(paragraphs)):
		par = paragraphs[i]
		pid = "p" + str(i)
		psent = computeSentimentPart(par)
		sentences = re.split('([.|!|?]) ',par)
		pardict = {}
		sentenceslist = []
		j = 0
		while j < len(sentences):
			sentence = sentences[j]
			
			if(len(sentences) > j+1):
				sentence = sentence + sentences[j+1]
			sid = pid +"-" + str(j)
			ssent = computeSentimentPart(sentence)
			sdict = {'id': sid, 'score':ssent, 'text': sentence}
			sentenceslist.append(sdict)

			j = j + 2
		pardict['id'] = pid
		pardict['score'] = psent
		pardict['sentences'] = sentenceslist
		sentiments.append(pardict)

	return {'paragraphs': sentiments}