var
jade = require('jade'),
app = require('express')(),
fs = require('fs'),
url = require('url');

app.get('/', function(req, res){
	var renderFunc = jade.compileFile('./template_index.jade');
	var data = {
		pagetitle: 'Index',
		applicationname: 'Jade Sample Template',
		username: 'Sample User',
		articles: [{
			title: 'lorem ispum',
			subtitle: 'sub',
			content: 'some shit',
			author: 'article author'
		}, {
			title: 'lorem ispum',
			subtitle: 'sub',
			content: 'some shit',
			author: 'article author'
		}],
		owner: 'Tushar Agarwal'
	};
	var html = renderFunc(data);
	res.writeHead("200", {"content-type": "text/html"});
	res.write(html);
	res.end();
});

app.get('/login', function(req, res){
	var renderFunc = jade.compileFile('./index.jade');
	var html = renderFunc({pageTitle: 'login', url:"/logout", isActive: true, isChecked: false});
	// can also be written as 
	// fs.readFile('./index.jade',function(err, sourse){
	// var html = jade.render(source, {pageTitle:'login', and other data});});
	// or
	// fs.readFile('./index.jade',function(err, sourse){
	// var template = jade.compile(souce);
	// var html = template(data);});
	// or
	// jade.renderFile('./index.jade', data, function(err, html){
	// console.log(html);});
	res.writeHead("200", {"content-type": "text/html"});
	res.write(html);
	res.end();
});

app.get('*', function(req, res) {
	var pathname = url.parse(req.url).pathname;
	fs.exists('./'+pathname, function(exists) {
		console.error(exists? itexists() : doesnot());
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

try{
	app.listen(8080);
	console.log(Date() + ": Server started");
	console.log(Date() + ": Listening to 8080");
} catch(err) {
	console.log(Date() + ": ERROR: " + err);
}
