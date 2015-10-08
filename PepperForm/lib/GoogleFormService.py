#!python
# -*- coding: utf-8 -*-

import qi
import PyGoogleForm


class GFService(object):
	"""Naoqi service to use Google Form for survey on Pepper"""

	# concept names
	CONCEPT_QUESTION = "question"
	CONCEPT_CHOICES  = "choices"

	@qi.nobind
	def __init__(self, session):
		self.session = session
		self.url = ""
		self.languageDict = None

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def loadForm(self, url):
		"""Initialize a new GFParser object with url"""
		self.url = url
		self.form = PyGoogleForm.GFParser(url)
		self.questions = self.form.getQuestionIDs()
		self.questionIndex = -1

	@qi.bind(qi.Void, paramsType=(qi.Void,))
	def submit(self):
		"""Submit and unloads the form"""
		self.form.submit()
		self.url = ""

	@qi.bind(qi.String, paramsType=(qi.Void,))
	def getFormURL(self):
		"""Return the url of the current form, or empty string is no form is loaded"""
		return self.url

	@qi.bind(qi.String, paramsType=(qi.Void,))
	def nextQuestion(self):
		"""Loads next question and sets up dynamic concepts. Returns question type or 'finished'"""
		self.questionIndex += 1
		if self.questionIndex >= len(self.questions):
			return "finished"
		self.questionInfo = self.form.getQuestionInfo(self.questions[self.questionIndex])
		if self.questionInfo[1] == "ss-checkbox":
			self.checked =[]
		# Dialog settings
		self["ALDialog"].setConcept(self.CONCEPT_QUESTION, self.getLanguageNU(), self.questionInfo[2])
		if isinstance(self.questionInfo[3], list):
			self["ALDialog"].setConcept(self.CONCEPT_CHOICES, self.getLanguageNU(), self.questionInfo[3])
		# return question type
		return self.questionInfo[1]

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def answer(self, answer):
		"""answers the question"""
		self.form.answerQuestion(self.questionInfo[0], answer)

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def addCheckbox(self, answer):
		"""Adds answer to the list of checked questions"""
		self.checked.append(answer)

	@qi.bind(qi.Void, paramsType=(qi.Void,))
	def answerCheckbox(self):
		"""Answers the checkbox question with list of checks"""
		self.form.answerQuestion(self.questionInfo[0], self.answer)

	@qi.nobind
	def __getitem__(self, serviceName):
		"""shortcut to self.session.service"""
		return self.session.service(serviceName)

	@qi.nobind
	def getLanguageNU(self):
		"""Returns Dialog language as NU style"""
		if self.languageDict is None:
			self.languageDict = self["ALDialog"].getLanguageListLongToNU()
		languageLong = self["ALDialog"].getLanguage()
		return self.languageDict[languageLong]


def main():
	import sys
	app = qi.Application(sys.argv)
	app.start()

	amService = AdvancedMediaService(app.session)
	id = app.session.registerService("AdvancedMedia", amService)

	app.run()
	sys.exit()