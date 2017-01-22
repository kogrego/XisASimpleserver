'use strict';
var express		= require('express'),
	fs			= require('fs'),
	request 	= require('request');

var clientRootPath 		= __dirname + '/../build/',
	apiPath 			= 'https://xisaapi.herokuapp.com',		
	DEBUG				= true;

var error = (next, msg, status) => {
	var err = new Error();
	err.status = status;
	err.message = msg;
	next(err);
};

var route = (req, res, next, page) => {
	fs.readFile(clientRootPath + page, (err, html) => {
		if (err) {
			error(next, err.message, 500);
    	}
    	res.write(html);
    	res.end();  
	});
};

var localApi = (req, res, next, path) => {
	fs.readFile(path, (err, json) => {
		if (err) {
        	error(next, err.message, 500);
    	}
    	res.json(JSON.parse(json)); 
	});
};

var api = (req, res, next, path) => {
	request(apiPath + path, (err, response, body) => {
		if(err){
			error(next, err.message, 500);
		}
		else if (body.error != null){
			error(next, "API error", 500);
		} 
		else if (!err && response.statusCode == 200) {
			return res.status(200).json(JSON.parse(body));
		}
	});
};

exports.inedxPage = (req, res, next) => {
	route(req, res, next, 'index.html');
};

exports.howPage = (req, res, next) => {
	route(req, res, next, 'how.html');
};

exports.whatPage = (req, res, next) => {
	route(req, res, next, 'what.html');
};

exports.whomPage = (req, res, next) => {
	route(req, res, next, 'whom.html');
};

exports.getCelebs = (req,res,next) => {
	if(DEBUG){
		localApi(req, res, next, './celebs.json'); 
	}
	else{
		api(req, res, next, apiPath + '/getCelebs');
	}
};

exports.getCategoryCelebs = (req,res,next) => {
	if(DEBUG){
		localApi(req, res, next, './celebs.json'); 
	}
	else{
		api(req, res, next, apiPath + '/getCelebs' + req.params.category);
	}
};

exports.getCeleb = (req,res,next) => {
	if(DEBUG){
		localApi(req, res, next, './celeb.json'); 
	}
	else{
		api(req, res, next, apiPath + '/celeb/' + req.params.name);
	}
};

exports.getCategoryCeleb = (req,res,next) => {
	if(DEBUG){
		localApi(req, res, next, './celeb.json'); 
	}
	else{
		api(req, res, next, apiPath + '/celeb/' + req.params.name + '/' + req.params.category);
	}
};

exports.getUser = (req,res,next) => {
	if(DEBUG){
		localApi(req, res, next, './user.json'); 
	}
	else{
		api(req, res, next, apiPath + '/user/' + name);
	}	
};

exports.getUsers = (req,res,next) => {
	if(DEBUG){
		localApi(req, res, next, './users.json'); 
	}
	else{
		api(req, res, next, apiPath + '/getUsers');
	}
};

