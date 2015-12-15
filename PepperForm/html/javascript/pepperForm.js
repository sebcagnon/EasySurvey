var session;
var gForm;
var newQuestionLink;
var newFormLink;
var answerGivenLink;

var localize = {
	"thankYou": {
		"English":"Thank You!",
		"Japanese":"ありがとう！"
	}
}

/*
Connecting to qiMessaging, subscribing to GoogleForm signals
*/
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
				raiseEvent("PepperForm/TabletReady");
			});
			gf.answerGiven.connect(onAnswered).then(function (link) {
				answerGivenLink = link;
			});
			$("#openFrame").addClass("hidden");
		}, function (error) {
			console.log("Disconnected: " + error);
		});
	}, function (error) {
		console.log(error);
	});
} catch (err) {
	console.log("Error when initializing QiSession: " + err.message);
}

$(function () {
	$("#next").click(userClick);
	$("#submitText").click(function (e) {
		forceInput($("textarea").val());
	});
	$("textarea").keyup(textAreaCallback);
});

var onNewQuestion = function (id, type, question, choices) {
	console.log("New question: " + type);
	$(".mainFrame").addClass("hidden");
	$(".answerFrame").addClass("hidden");
	$(".arrow").addClass("hidden");
	if (type=="finished") {
		showThankYouFrame();
		return;
	} else if (type == "ss-checkbox") {
		$("#next").removeClass("hidden");
	}
	$("#question").text(question);
	if (type == "ss-text" || type == "ss-paragraph-text") {
		$("#submitText").removeClass("hidden");
		$("#text").removeClass("hidden");
		$("textarea").val("").attr("placeholder", "Please tell me your answer");
	} else if (choices.length < 3) {
		$("#2answers").empty();
		for (var i = 0; i < choices.length; i++) {
			inp = $("<input />", {"type":"button", "class":"btn blue twobtn", id:"btn2" + (i+1), value:choices[i]});
			inp.click(userClick).appendTo("#2answers");
			$("#2answers").removeClass("hidden");
		};
	} else {
		$("#4answers").empty();
		for (var i = 0; i < choices.length && i < 4; i++) {
			inp = $("<input />", {"type":"button", "class":"btn blue fourbtn", id:"btn4" + (i+1), value:choices[i]});
			inp.click(userClick).appendTo("#4answers");
			$("#4answers").removeClass("hidden");
		};
	}
	$("#questionFrame").removeClass("hidden");
}

var onNewForm = function (title, desc) {
	console.log("New form loaded: " + title);
	$(".mainFrame").addClass("hidden");
	$("#pepperSurveyStart").text("Pepper Form");
	$("#formTitle").text(title);
	$("#formDesc").text(desc);
	$("#openFrame").removeClass("hidden");
	// Show webview once page is properly displaying
	session.service("ALTabletService").then( function (tablet) {
		tablet.showWebview();
	}, function (error) {
		console.log("Could not find ALTabletService: " + error);
	});
}

var onAnswered = function (id, type, answer) {
	if (type=="ss-text" || type=="ss-paragraph-text") {
		$("textarea").text(answer);
	}
	$("input[value=\"" + answer + "\"]").removeClass("blue").addClass("yellow");
}

var showThankYouFrame = function () {
	session.service("ALDialog").then( function (dialog) {
		dialog.getLanguage().then( function (lang) {
			$("#thankYou").text(localize["thankYou"][lang]);
			$("#thankYouFrame").removeClass("hidden");
		});
	}, function (error) {
		console.log("Could not find ALDialog service: " + error);
	});
}


var userClick = function (e) {
	console.log("User click: " + e.target.value);
	forceInput(e.target.value);
}

var textAreaCallback = function (e) {
	$("textarea").attr("placeholder", "");
	if ((e.keyCode || e.which) == 13) {
		forceInput($("textarea").val());
	}
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
		console.log("Could not force input: " + error.message);
	});
}