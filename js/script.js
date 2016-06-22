/*
	Create Twitch TV Status App that accomplishes the following:
	1. Ability to determine if Free Code Camp is currently streaming on Twitch.tv.
	2. Ability to click the status output and be sent directly to the user's Twitch.tv channel.
	3. If a Twitch user is currently streaming, additional details are available about what they are streaming.
	3. If a user has closed their Twitch.tv channel, a placeholder will notify the viewer.
*/



//Fetch API data
function fetchUsers(){

	var userArray = ["freecodecamp", "storbeck", "terakilobyte", "habathcx", "RobotCaleb", "thomasballinger", "noobs2ninjas", "beohoff", "syndicate", "riotgames", "esl_csgo", "brunofin", "comster404"];	
	var baseURL = "https://api.twitch.tv/kraken/";

	//Loop through each value in userArray
	$.each(userArray, function(i, val){

		var streamingURL = "streams/";
		var userURL = "users/";
		var logo = "<img src='img/generic-profile.png' alt='generic logo'>";

		//Get streaming JSON information
		$.getJSON(baseURL + streamingURL + val, function(json){			
			var status = json.stream;
			var stream, link;

			//If user is online set status to online and
			//set stream as name of game stream
			//else set status to offline
			if (status){
				status = "Online";
				stream = json.stream.game;
				link = json.stream.channel.url;
			} else if (status === null) {
				status = "Offline";
			} else {
				status = "Closed";
			}

			//Get user JSON information
			$.getJSON(baseURL + userURL + val, function(json){
				
				//Set logo based on whether user has logo set
				if (json.logo){
					logo = "<img src='" + json.logo + "' alt='logo'>";
				}
				
				//Append html to output div
				$("#output").append(buildHTML(userArray[i], status, logo, link, stream));
			});
			
			//If there is an error, populate user data and notify viewer
			//that account is closed 
		}).error(function(){
			var status = "Account Closed";			
			$("#output").append(buildHTML(userArray[i], status, logo));
		});
	});

	function buildHTML(user, status, logo, link, stream){
		var html = "";
		//Build html based on current stream status
		if (status === "Online") {
			$("#output").append(buildOnlineHTML(link, logo, user, stream));			
		} else if (status === "Account Closed"){
			status = "Account Closed";
			$("#output").append(buildClosedHTML(logo, user, status));	
		} else {
			$("#output").append(buildOfflineHTML(logo, user, status));
		}

		//Function to build HTML if user is online
		function buildOnlineHTML(link, logo, user, stream){
			html = "<a href='" + link + "' target='_blank'>";
			html += "<div class='row online'><div class='col-1-3'>" + logo + "</div>";
			html += "<div class='col-1-3'>" + user + "</div>";
			html += "<div class='col-1-3'><p>Currently streaming<br>" + stream + "</div></div></a>";
			return html;
		}

		//Function to build HTML if user has a closed account
		function buildClosedHTML(logo, user, status){
			html = "<div class='row closed'><div class='col-1-3'>" + logo + "</div>";
			html += "<div class='col-1-3'>" + user + "</div>"; 
			html += "<div class='col-1-3'>" + status + "</div></div>";
			return html;
		}

		//Function to build HTML if user is offline
		function buildOfflineHTML(logo, user, status){
			html = "<div class='row'><div class='col-1-3'>" + logo + "</div>";
			html += "<div class='col-1-3'>" + user + "</div>"; 
			html += "<div class='col-1-3'>" + status + "</div></div>";
			return html;
		}
	}
}

//Search Twitch TV games based on search input text
function searchGames(){
	$("#output").html("");
	var $textInput = $.trim($("#search-box").val());
	var limitResults = 10;
	var gamesURL = "https://api.twitch.tv/kraken/streams?game=" + $textInput + "&limit=" + limitResults;
	var logo = "<img src='img/generic-profile.png' alt='generic logo'>";
	var link = "";
	var username = "";
	var game = "";

	//Test user has entered text in search box
	if ($textInput){
		$.getJSON(gamesURL, function(json){
			
			//Test game data exists
			if (json.streams[0] !== undefined){
				//Loop through each result up to maximum
				for (var i = 0; i < limitResults; i++){

					link = json.streams[i].channel.url;
					username = json.streams[i].channel.display_name;
					game = json.streams[i].game;

					if (json.streams[i].channel.logo){
						logo = "<img src='" + json.streams[i].channel.logo + "' alt='logo'>";
					}

					$("#output").append(createSearchHTML(link, logo, username, game));
				}
			} else {
				alert("Cannot find any live streams. Please try another game.");
			}
		}).error(function(){
			alert("There was an error processing your request. Please try again.");
		});
	} else {
		alert("Please enter a search term");
	}
}

function createSearchHTML(link, logo, username, game){
	var html = "";

	html = "<a href='" + link + "' target='_blank'>";
	html += "<div class='row online'><div class='col-1-3'>" + logo + "</div>";
	html += "<div class='col-1-3'>" + username + "</div>";
	html += "<div class='col-1-3'><p>Currently streaming<br>" + game + "</div></div></a>";
	return html;
}

//If user clicks on search icon
//search Twitch TV API for games based on text
$("#search-container span").click(function(){
	searchGames();
});

//If user clicks on sorting button
//display only all, online, or offline users
//If user selects 'Reset' button reset default
$("#status-btn-group button").click(function(){
	//Remove 'hide' class from all rows
	$("#user-container div").removeClass("hide");
	//Remove 'selected' class from all buttons
	$("#status-btn-group button").removeClass("selected");
	
	if ($(this).text() === "Reset"){
		//If user selects "Reset" button clear current data populate with default data
		$("#output").html("");
		//Add 'selected' class to All button if Reset button is pressed
		$("#status-btn-group button:first-child").addClass("selected");
		fetchUsers();		
	} else if ($(this).text() === "Offline"){
		//If user selects "Offline" button
		//Add 'hide' class to all rows with 'online' class	
		$("#user-container .online").addClass("hide");
		//Add 'selected' class to Offline button if pressed
		$(this).addClass('selected');		
	} else if ($(this).text() === "Online") {
		//If user selects "Online" button
		//Add 'hide' class to all rows without 'online' class
		$("#output > div").not("a div.online").addClass("hide");
		//Add 'selected' class to online button if pressed
		$(this).addClass('selected');
	}
});

//Clear search input on focus
$("#search-box").focus(function(){
	$(this).attr("placeholder", "");
});

//Repopulate placeholder text if user clicks outside search input
$("#search-box").blur(function(){
	$(this).attr("placeholder", "Search Games");
});

//Clear value in search box
$("#search-box").val("");

//If user hits enter instead of clicking on search icon
$("#search-box").keypress(function(event){
	if (event.which === 13) {
		event.preventDefault();
		searchGames();
	}
});

fetchUsers();






































