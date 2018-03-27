const http = require('http');
const path = require('path');
const phantom = require('phantom');
const sharp = require('sharp');
const torrentNameParser = require("torrent-name-parser");
const API_HOST = 'www.allocine.fr';
const parsing = require('./parsing');
const uri_action = {
	search_series: {
		method: 'GET',
		path: '/recherche/6/?q=',
		parsing: parsing.series.series_list.get,
		query_params: true
	},
	serie_information: {
		method: 'GET',
		path: '/series/ficheserie-',
		parsing: parsing.series.serie_information.get,
		query_params: true
	},
	serie_information_saison: {
		method: 'GET',
		path: '',
		parsing: parsing.series.serie_information_saison.get,
		query_params: true
	},
	serie_information_episode: {
		method: 'GET',
		path: '',
		parsing: parsing.series.serie_information_episode.get,
		query_params: true
	},
	search_movies: {
		method: 'GET',
		path: '/recherche/1/?q=',
		parsing: parsing.movies.movies_list.get,
		query_params: true
	},
	movies_information: {
		method: 'GET',
		path: '',
		parsing: parsing.movies.movies_information.get,
		query_params: true
	}
};

function filter_titles(title)
{
	var title_filter = '';
	var cut_char = '[]{}();';
	for (var i = 0; i < title.length; i++)
	{
		for (var j = 0; j < cut_char.length; j++)
		{
			if (title[i] == cut_char[j])
				return title_filter.trim();
		}
		title_filter += title[i];
	};
	return title_filter.trim();
}

function remove_wrong_word(title)
{
	var wrong_word = [
		'Unrated',
		'FRENCH'
	];
	wrong_word.forEach((e) => {
		title = title.replace(e, '');
	});
	return title.trim();
}

function parse_query_post(query, type)
{
	query_obj = torrentNameParser(path.basename(query));
	query_obj.title = remove_wrong_word(filter_titles(query_obj.title).replace(/\./g, ' '));
	if (type === 'serie' && query_obj.season && query_obj.episode)
		return query_obj.title + " S" + ("0" + parseInt(query_obj.season)).slice(-2) + "E" + ("0" + parseInt(query_obj.episode)).slice(-2);
	else if (type === 'movie' && query_obj.year)
		return query_obj.title + " " + query_obj.year;
	else
		return query_obj.title;
}

function Client() {
}

Client.prototype.get = function(action, query, callback)
{
	if(uri_action[action])
		fetch_url(action, query, uri_action[action].parsing, null, callback);
	else
	{
		console.log(`Wrong action, action: ${action}, query: ${query}`);
		if (callback)
			callback(null);
		else
			console.log('No callback');
	}
};

Client.prototype.get_series_list = function(callback, query)
{
	query = encodeURIComponent(parse_query_post(query));
	this.get('search_series', query, callback);
};

Client.prototype.get_series_sheets_by_id = function(callback, id)
{
	this.get('serie_information', id + '/saisons/', callback);
};

Client.prototype.get_series_sheets_by_name = function(callback, query)
{
	var query_filter = encodeURIComponent(parse_query_post(query));
	query = parse_query_post(query, 'serie');
	this.get('search_series', query_filter, (result) => {
		parsing.series.select_result.get(result, query, (req, result, error) => {
			var result_tmp = result;
			if (error)
				callback(error);
			else
			{
				this.get('serie_information', result.id + '/saisons/', {
					callback: ((result, req) => {
						if (!result)
							callback('No result found');
						else
							this.get('serie_information_saison', result, {
								callback: ((result, req) => {
									if (!result)
										callback('No result found');
									else
										this.get('serie_information_episode', 'http://' + API_HOST + result, {
											callback: ((result, req) => {
												result.name = result_tmp.name.replace(/\n/g, '');
												result.with = result_tmp.with.replace(/\n/g, '');
												result.date = result_tmp.date;
												result.img = result_tmp.url_img;
												result.result_weigth = result_tmp.result_weigth;
												get_base64img_form_url(result, callback);
											}),
											search_req: req
										});
								}),
								search_req: req
							});
					}),
					search_req: req
				});
			}
		});
	});
};

Client.prototype.get_movies_list = function(callback, query)
{
	query = encodeURIComponent(parse_query_post(query));
	this.get('search_movies', query, callback);
};

Client.prototype.select_movie_result = function(callback, query)
{
	query = encodeURIComponent(parse_query_post(query));
	this.get('search_movies', query, callback);
};


Client.prototype.get_movies_sheets_by_name = function(callback, query)
{
	var query_filter = encodeURIComponent(parse_query_post(query));
	query = parse_query_post(query, 'movie');
	this.get('search_movies', query_filter, (result_movie) => {
		parsing.movies.select_result.get(result_movie, query, (req, result_movie, error) => {
			var result_tmp = result_movie;
			if (error)
				callback(error);
			else
			{
				this.get('movies_information', result_movie.url, {
					callback: ((result_movie, req) => {
						result_movie.titles = result_tmp.name.replace(/\n/g, '');
						result_movie.date = result_tmp.date;
						result_movie.from = result_tmp.from;
						result_movie.with = result_tmp.with;
						result_movie.result_weigth = result_tmp.result_weigth;
						get_base64img_form_url(result_movie, callback);
					}),
					search_req: req
				});
			}
		});
	});
};

function limit_output_img_size(img_base64, data_res, callback)
{
	sharp(new Buffer(img_base64, 'base64'))
		.resize(240, 320)
		.toBuffer()
		.then( data => {
			data_res.img = data.toString('base64');
			callback(data_res);
		})
		.catch( err => {
			data_res.img = img_base64;
			callback(data_res);
		});
}

function get_base64img_form_url(data, callback)
{
	var splited_url = data.img.split('/');
	var path = '/';
	for (var i = 3; i < splited_url.length; i++)
	{
		path += splited_url[i] + "/";
	}
	path = path.substr(0, path.length - 1);
	var host_name_url = data.img.replace('http://', '').replace('https://', '').replace(path, '');
	var headers = {
		'Host': host_name_url,
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': 0
	};
	var options_url = {
		hostname: host_name_url,
		port: 80,
		path: path,
		method: 'GET',
		headers: headers
	};
	var data_res = '';
	var req = http.request(options_url, (res) => {
		res.setEncoding('base64');
		res.on('data', (chunk) => {
			data_res += chunk;
		});
		res.on('end', (d) => {
			data.img = limit_output_img_size(data_res, data, callback);
		});
	});
	req.on('error', (e) => {
		console.error(e);
	});
	req.end();
}

function fetch_url_phantom(action, query, parsing, auth, callback)
{
	(async function(action, query, parsing, auth, callback) {
		const instance = await phantom.create();
		const page = await instance.createPage();
		const status = await page.open(query);
		const content = await page.property('content');
		parsing(query, Buffer.from(content, 'utf-8'), callback);
		await instance.exit();
	})(action, query, parsing, auth, callback);
}

function phantom_url_is_need(query)
{
	var match = query.match(/ficheserie-|saison-|ep-/g);
	if (match)
	{
		var match_string = '';
		match.forEach((e) =>
		{
			match_string += e;
		});
		if (match_string === 'ficheserie-saison-')
			return true;
	}
	return false;
}

function fetch_url(action, query, parsing, auth, callback)
{
	if (phantom_url_is_need(query))
		fetch_url_phantom(action, query, parsing, auth, callback);
	else
	{
		var headers = {
			hostname: API_HOST,
			port: 80,
			path: uri_action[action].path + (uri_action[action].query_params ? query : ''),
			method: uri_action[action].method,
			headers: {
				'Host': API_HOST,
				'Content-Length': Buffer.byteLength(uri_action[action].query_params ? '' : query, 'utf8'),
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		};
		var data_res = [];
		var req = http.request(headers, (res) => {
			res.on('data', (d) => {
				data_res.push(d);
			});
			res.on('end', (d) => {
				var buffer = Buffer.concat(data_res);
				parsing(query, buffer, callback);
			});
		});
		req.on('error', (e) => {
			console.error(e);
		});
		req.write(uri_action[action].query_params ? '' : query);
		req.end();
	}
	
}

module.exports = Client;