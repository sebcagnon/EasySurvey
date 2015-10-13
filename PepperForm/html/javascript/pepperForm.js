var session;
var gForm;
var newQuestionLink;

QISession.connect( function (s) {
	session = s;
	s.service("GoogleForm").then(function (gf) {
		gForm = gf;
		gf.questionLoaded.connect(onNewQuestion).then(function (link) {
			newQuestionLink = link;
		});
	}, function (error) {
		console.log(error);
	});
}, function (error) {
	console.log(error);
});

var onNewQuestion = function (id, type, question, choices) {
	return;
}