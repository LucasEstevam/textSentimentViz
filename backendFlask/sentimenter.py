from random import random
import re
import sys
sys.path.insert(0, '../../sentimentTheano')
from conv_net_sentimenter import Sentimenter

class CNNSentimenter:
	def __init__(self):
		print "CNNSentimenter initialized"
		self.sentimenter = Sentimenter()

	def computeSentimentPart(self, text):
		result = self.sentimenter.getSentiment(text)
		return -1 + 2*result[0][1]		

	def computeSentiment(self, text):
		paragraphs = text.split('\n')
		sentiments = []
		for i in range(0, len(paragraphs)):
			par = paragraphs[i]
			pid = "p" + str(i)
			psent = self.computeSentimentPart(par)
			sentences = re.split('([.|!|?]) ',par)
			pardict = {}
			sentenceslist = []
			j = 0
			while j < len(sentences):
				sentence = sentences[j]
				
				if(len(sentences) > j+1):
					sentence = sentence + sentences[j+1]
				sid = pid +"-" + str(j)
				ssent = self.computeSentimentPart(sentence)
				sdict = {'id': sid, 'score':ssent, 'text': sentence}
				sentenceslist.append(sdict)

				j = j + 2
			pardict['id'] = pid
			pardict['score'] = psent
			pardict['sentences'] = sentenceslist
			sentiments.append(pardict)

		return {'paragraphs': sentiments}


class RandomSentimenter:

	def __init__(self):
		print "RandomSentimenter initialized"

	def computeSentimentPart(self, text):
		return -1 + 2*random()

	def computeSentiment(self, text):
		paragraphs = text.split('\n')
		sentiments = []
		for i in range(0, len(paragraphs)):
			par = paragraphs[i]
			pid = "p" + str(i)
			psent = self.computeSentimentPart(par)
			sentences = re.split('([.|!|?]) ',par)
			pardict = {}
			sentenceslist = []
			j = 0
			while j < len(sentences):
				sentence = sentences[j]
				
				if(len(sentences) > j+1):
					sentence = sentence + sentences[j+1]
				sid = pid +"-" + str(j)
				ssent = self.computeSentimentPart(sentence)
				sdict = {'id': sid, 'score':ssent, 'text': sentence}
				sentenceslist.append(sdict)

				j = j + 2
			pardict['id'] = pid
			pardict['score'] = psent
			pardict['sentences'] = sentenceslist
			sentiments.append(pardict)

		return {'paragraphs': sentiments}