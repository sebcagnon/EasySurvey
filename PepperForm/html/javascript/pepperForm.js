var session;
var gForm;
var newQuestionLink;
var newFormLink;

try {
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
} catch (err) {
	console.log("Error when initializing QiSession: " + err.message);
}

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
			inp = $("<input />", {"type":"button", "class":"btn twobtn", id:"btn2" + (i+1), value:choices[i]});
			inp.click(userClick).appendTo("#2answers");
			$("#2answers").removeClass("hidden");
		};
	} else {
		$("#4answers").empty();
		for (var i = 0; i < choices.length && i < 4; i++) {
			inp = $("<input />", {"type":"button", "class":"btn fourbtn", id:"btn4" + (i+1), value:choices[i]});
			inp.click(userClick).appendTo("#4answers");
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

var userClick = function (e) {
	console.log(e.target.value);
	forceInput(e.target.value);
}

var raiseEvent = function (eventName, data) {
	session.service("ALMemory").then(function (memory) {
		memory.raiseEvent(eventName, data);
	}, function (error) {
		console.log("Could not raise event: " + error.message);
	});
}

var forceInput = function (input) {
	session.service("ALDialog").then(function (dialog) {
		dialog.forceInput(input);
	}, function (error) {
		console.log("Issue with forceInput: " + error.message);
	});
}