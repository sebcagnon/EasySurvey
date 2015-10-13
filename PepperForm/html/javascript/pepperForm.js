var session;
var gForm;
var newQuestionLink;
var newFormLink;

QiSession( function (s) {
	console.log("connected");
	session = s;
	s.service("GoogleForm").then(function (gf) {
		gForm = gf;
		gf.questionLoaded.connect(onNewQuestion).then(function (link) {
			newQuestionLink = link;
		});
		gf.formLoaded.connect(onNewForm).then(function (link) {
			newFormLink = link;
		});
		$("#openFrame").addClass("hidden");
	}, function (error) {
		console.log(error);
	});
}, function (error) {
	console.log(error);
});

var onNewQuestion = function (id, type, question, choices) {
	console.log(type);
	$(".mainFrame").addClass("hidden");
	$(".answerFrame").addClass("hidden");
	if (type=="finished") {
		$("#thankYouFrame").removeClass("hidden");
		return;
	}
	$("#question").text(question);
	if (type == "ss-text" || type == "ss-paragraph-text") {
		$("#text").attr("placeholder", choices[0]);
		$("#text").removeClass("hidden");
	} else if (choices.length < 3) {
		$("#2answers").empty();
		for (var i = 0; i < choices.length; i++) {
			inp = $("<input />", {"class":"btn twobtn", id:"btn2" + (i+1), value:choices[i]});
			inp.appendTo("#2answers");
			$("#2answers").removeClass("hidden");
		};
	} else {
		$("#4answers").empty();
		for (var i = 0; i < choices.length && i < 4; i++) {
			inp = $("<input />", {"class":"btn fourbtn", id:"btn4" + (i+1), value:choices[i]});
			inp.appendTo("#4answers");
			$("#4answers").removeClass("hidden");
		};
	}
	$("#questionFrame").removeClass("hidden");
}

var onNewForm = function (title, desc) {
	console.log(title);
	$(".mainFrame").addClass("hidden");
	$("#pepperSurveyStart").text("Pepper Form");
	$("#formTitle").text(title);
	$("#formDesc").text(desc);
	$("#openFrame").removeClass("hidden");
}