from flask import Flask
from flask import request
from flask import jsonify
from sentimenter import CNNSentimenter
application = Flask(__name__)
application.config['PROPAGATE_EXCEPTIONS'] = True
sent = CNNSentimenter()

@application.route('/getsentiment', methods=['GET'])
def getsentiment():	
	inputtext = request.args.get('text', '')	
	return jsonify(sent.computeSentiment(inputtext))

if __name__ == '__main__':
	application.run(host='0.0.0.0', port=8000)