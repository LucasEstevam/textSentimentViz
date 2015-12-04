from random import random
import re
from metamind.api import ClassificationData, ClassificationModel, set_api_key

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


class MetamindSentimenter:
	def __init__(self):
		set_api_key('')
		print "MetamindSentimenter initialized"
		self.classifier = ClassificationModel(id='155')

	def computeSentimentPart(self, text):
		if not text:
			return 0
		print text
		result = self.classifier.predict(text, input_type='text')
		value = 2*(result[0]['probability'] - 0.5)
		if(result[0]['label'] == 'negative'):
			value = -value
		return value

	def computeSentiment(self, text):
		paragraphs = text.split('\n')
		sentiments = []
		for i in range(0, len(paragraphs)):
			par = paragraphs[i]
			pid = "p" + str(i)
			psent = 0
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