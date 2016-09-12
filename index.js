var
	jade = require('jade'),
	app = require('express')(),
	fs = require('fs'),
	url = require('url'),
	clientSessions = require('client-sessions'),
	querystring = require('querystring'),
	path = require('path');

app.use(clientSessions({
	secret: 'thisshouldbesomethingserious'
}));
	
function loadPage(contentObject, message, req, res) {
	var renderFunc = jade.compileFile('./template_index.jade');
	var content = '';
	fs.readFile('./data/data.json', 'utf-8', function(err, data){
		content = JSON.parse(data);
		content = content[contentObject];
		if(content){
			fs.readFile(content.contentPage, function(err, data){
				if(err) { /*load error page */console.log(Date()+": "+err);}
				else{
					content.message = message;
					content.username = req.session_state.username;
					content.content = data;	
					var html = renderFunc(content);
					res.writeHead("200", {"content-type": "text/html"});
					res.write(html);
					res.end();
				}
			});
		} else {
			// in case the page object does not exist
			loadPage("404", "", req, res);
		}
	});
}

function checkUserSession(req, res, pagename, message) {
	if(req.session_state.username) {
		// session exists
		loadPage(pagename, message, req, res);
	}
	else {
		// session not there, redirect to login
		loadPage("login", "<div class='alert alert-warning alert-dismissible' role='alert' style='margin:0; display:: block;'>No Login found</div>", req, res);
	}
}

app.get('/', function(req, res){
	/*
	need tto add distinct redirects based on roles
	*/
	checkUserSession(req, res, "index", "");
});

app.get('/login', function(req, res){
	if(req.session_state.username) {
		loadPage("index", "<div class='alert alert-success alert-dismissible' role='alert' style='margin:0; display:: block;'>Welcome back " + req.session_state.username + "</div>", req, res);
	}
	else {
		loadPage("login", "<div class='alert alert-info alert-dismissible' role='alert' style='margin:0; display:: block;'>Please login to continue</div>", req, res);
	}
});

app.get('/logout', function(req, res) {
	req.session_state.reset();
	loadPage("login", "<div class='alert alert-success alert-dismissible' role='alert' style='margin:0; display:: block;'>User logged out. Login to continue</div>", req, res);
});

app.post('/login', function(req, res) {
	var logindata = "";
	req.on('data', function(chunk) {
		logindata += chunk;
	});
	req.on('end', function() {
		logininfo = querystring.parse(logindata);
		var username = logininfo['username'];
		var password = logininfo['password'];
		fs.readFile('./data/users.json', function(ERR, data) {
			if(ERR) {/*redirect to error page */Date()+": "+console.log(ERR);}
			else {
				var userdb = JSON.parse(data);
				var userinfo = userdb.users[username];
				if(userinfo) {
					if(userinfo.password === password) {
						// start session and redirect
						req.session_state.username = username;
						req.session_state.role = userinfo.role;
						loadPage("index", "<div class='alert alert-success alert-dismissible' role='alert' style='margin:0; display:: block;'>Welcome back " + req.session_state.username + "</div>", req, res);
					} else {
						loadPage("login", "<div class='alert alert-danger alert-dismissible' role='alert' style='margin:0; display:: block;'>Invalid Password</div>", req, res);
					}
				} else {
					loadPage("login", "<div class='alert alert-danger alert-dismissible' role='alert' style='margin:0; display:: block;'>Invalid username!</div>", req, res);
				}
			}
		});
	});
});

app.get(['*.css', '*.js'], function(req, res) {
	var pathname = url.parse(req.url).pathname;
	fs.exists('./'+pathname, function(exists) {
		if(exists) {
			itexists()
		} else {
			doesnot()
		}
	});
	function itexists() {
		rstream = fs.createReadStream('./'+pathname);
		rstream.pipe(res);
	}
	function doesnot() {
		content = "404 not found";
		res.end(content);
	}
});

app.get('*', function(req, res) {
	var pathname = url.parse(req.url).pathname;
	checkUserSession(req, res, pathname, "");
});

try{
	app.listen(8080);
	console.log(Date() + ": Server started");
	console.log(Date() + ": Listening to 8080");
} catch(err) {
	console.log(Date() + ": ERROR: " + err);
}
