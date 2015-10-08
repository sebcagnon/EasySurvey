#!python
# -*- coding: utf-8 -*-

import qi
import PyGoogleForm


class GFService(object):
	"""Naoqi service to use Google Form for survey on Pepper"""

	@qi.nobind
	def __init__(self, session):
		self.session = session

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def loadForm(self, url):
		"""Initialize a new GFParser object with url"""
		pass

	@qi.bind(qi.Void, paramsType=(qi.Void,))
	def submit(self):
		"""Submit and unloads the form"""
		pass

	@qi.bind(qi.String, paramsType=(qi.Void,))
	def getFormURL(self):
		pass

	@qi.bind(qi.String, paramsType=(qi.Void,))
	def nextQuestion(self):
		"""Loads next question and sets up dynamic concepts. Returns question type or 'finished'"""
		# get question info
		# load dynamic concepts
		# return question type
		return "finished"

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def answer(self, answer):
		"""answers the question"""
		pass

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def addCheckbox(self, answer):
		"""Adds answer to the list of checked questions"""
		pass

	@qi.bind(qi.Void, paramsType=(qi.Void,))
	def answerCheckbox(self):
		"""Answers the checkbox question with list of checks"""
		pass

	@qi.nobind
	def __getitem__(self, serviceName):
		"""shortcut to self.session.service"""
		return self.session.service(serviceName)


def main():
	import sys
	app = qi.Application(sys.argv)
	app.start()

	amService = AdvancedMediaService(app.session)
	id = app.session.registerService("AdvancedMedia", amService)

	app.run()
	sys.exit()