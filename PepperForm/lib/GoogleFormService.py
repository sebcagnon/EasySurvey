#!python
# -*- coding: utf-8 -*-

import qi
import PyGoogleForm


class GFService(object):
	"""Naoqi service to use Google Form for survey on Pepper"""

	# concept names
	MKEY_QUESTION = "GoogleForm/Question"
	CONCEPT_CHOICES  = "choices"

	@qi.nobind
	def __init__(self, session):
		self.session = session
		self.url = ""
		self.languageDict = None
		self.formLoaded = qi.Signal("(ss)")
		self.questionLoaded = qi.Signal("(sss[s])")
		self.answerGiven = qi.Signal("(sss)")

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def loadForm(self, url):
		"""Initialize a new GFParser object with url"""
		self.url = url
		self.form = PyGoogleForm.GFParser(url)
		self.questions = self.form.getQuestionIDs()
		self.questionIndex = -1
		formInfo = self.getFormInfos()
		self.formLoaded(*formInfo)

	@qi.bind(qi.Void)
	def submit(self):
		"""Submit and unloads the form"""
		self.form.submit()
		self.url = ""

	@qi.bind(qi.String)
	def getFormURL(self):
		"""Return the url of the current form, or empty string is no form is loaded"""
		return self.url

	@qi.bind(qi.List(qi.String))
	def getFormInfos(self):
		"""Returns info [FormTitle, FormDescription]"""
		# converting to normal string as qi doesn't like list of unicodes
		return [str(s) for s in self.form.getFormInfos()]

	@qi.bind(qi.String)
	def nextQuestion(self):
		"""Loads next question and sets up dynamic concepts. Returns question type or 'finished'"""
		self.questionIndex += 1
		if self.questionIndex >= len(self.questions):
			# fire signal!
			self.questionLoaded("", "finished", "", [])
			return "finished"
		self.questionInfo = self.form.getQuestionInfo(self.questions[self.questionIndex])
		if self.questionInfo[1] == "ss-checkbox":
			self.checked =[]
		# Dialog settings
		self["ALMemory"].raiseEvent(self.MKEY_QUESTION, self.questionInfo[2])
		if isinstance(self.questionInfo[3], list):
			self["ALDialog"].setConcept(self.CONCEPT_CHOICES, self.getLanguageNU(), self.questionInfo[3], _async=True)
		# fire signal (for tablet)
		signalInfo = self.questionInfo[:]
		if self.questionInfo[1] in ["ss-text", "ss-paragraph-text"]:
			signalInfo[3] = [signalInfo[3]]
		self.questionLoaded(*signalInfo)
		# return question type
		return self.questionInfo[1]

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def answer(self, answer):
		"""answers the question"""
		self.form.answerQuestion(self.questionInfo[0], answer)
		self.answerGiven(self.questionInfo[0], self.questionInfo[1], answer)

	@qi.bind(qi.Void, paramsType=(qi.String,))
	def addCheckbox(self, answer):
		"""Adds answer to the list of checked questions"""
		self.checked.append(answer)
		self.answerGiven(self.questionInfo[0], self.questionInfo[1], answer)

	@qi.bind(qi.Void)
	def answerCheckbox(self):
		"""Answers the checkbox question with list of checks"""
		self.form.answerQuestion(self.questionInfo[0], self.checked)

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

	gfService = GFService(app.session)
	id = app.session.registerService("GoogleForm", gfService)

	app.run()
	sys.exit()

if __name__ == '__main__':
	main()