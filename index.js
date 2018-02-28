const http = require('http');
const path = require('path');
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
		path: '/series/episode-',
		parsing: parsing.series.serie_information_episode.get,
		query_params: true
	},
	search_movies: {
		method: 'GET',
		path: '/recherche/1/?q=',
		parsing: parsing.movies.movies_list.get,
		query_params: true
	}
};

function filter_string_replace(str)
{
	return str.replace(/[èéêëēėę]/g, 'e')
		.replace(/[òöòóœøōõ]/g, 'o')
		.replace(/[àáâäæãåā]/g, 'a')
		.replace(/[ûüùúū]/g, 'u')
		.replace(/[îïíīįì]/g, 'i')
		.replace(/[\._,]/g, ' ').toLowerCase();
}

var clean_word = [
	'Unrated',
	'divx',
	'SUBFRENCH',
	'S',
	'E',
	'THEATRICAL',
	'LiMiTED',
	'FANSUB',
	'VOSTFR',
	'BRRiP', 
	'XviD',
	'TeamSuW',
	'BDrip',
	'EXTENDED',
	'HDrip',
	'Vol',
	'Turbine',
	'UNCENSORED',
	'TRUEFRENCH',
	'VFQ',
	'FRENCHDVDrip',
	'Blouson',
	'FR',
	'DVDRip',
	'Baloo',
	'bonus',
	'Multi',
	'BR',
	'VF',
	'PopHD',
	'WEB',
	'H',
	'ACc',
	'Ss',
	'EN',
	'mHDgz',
	'FRENCH',
	'Light',
	'ACOOL',
	'MULTI',
	'bit',
	'NSP',
	'VFF',
	'ENG',
	'AC',
	'BluRay',
	'p',
	'x',
	'GHT',
	'mkv',
	'avi',
	'mp4'
];

function clean_req_cli_query(str)
{
	var split_str = path.basename(str).replace(/[^a-zA-Z èéòàùì']/g, ' ').replace(/  +/g, ' ').split(' ');
	var result = '';
	var insert;
	insert = true;
	for (var i = 0; i < split_str.length; i++)
	{
		for (var j = 0; j < clean_word.length; j++)
		{
			if (split_str[i].toLowerCase() == clean_word[j].toLowerCase())
				insert = false;
			else if (parseInt(split_str[i]) == split_str[i])
				insert = false;
		}
		if (insert)
			result += split_str[i] + " ";
	}
	result = result.substr(0, result.length - 1);
	return result;
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
	query = filter_string_replace(clean_req_cli_query(query));
	this.get('search_series', query, callback);
};

Client.prototype.get_series_sheets_by_id = function(callback, id)
{
	this.get('serie_information', id + '/saisons/', callback);
};

Client.prototype.get_series_sheets_by_name = function(callback, query)
{
	var query_filter = filter_string_replace(clean_req_cli_query(query));
	this.get('search_series', query_filter, (result) => {
		parsing.series.select_result.get(result, query, (req, result, error) => {
			if (error)
				console.log(error);
			else
			{
				this.get('serie_information', result.id + '/saisons/', {
					callback: ((result, req) => {
						this.get('serie_information_saison', result, {
							callback: ((result, req) => {
								this.get('serie_information_episode', result + '/details/ajax/', {
									callback: ((result, req) => {
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

function get_base64img_form_url(data, callback)
{
	var splited_url = data.img.split('/');
	var path = '/';
	for (var i = 3; i < splited_url.length; i++)
	{
		path += splited_url[i] + "/";
	}
	path = path.substr(0, path.length - 1);
	var headers = {
		'Host': API_HOST,
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': 0
	};
	var options_url = {
		hostname: API_HOST,
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
			data.img = data_res
			callback(data);
		});
	});
	req.on('error', (e) => {
		console.error(e);
	});
	req.end();
}

function fetch_url(action, query, parsing, auth, callback)
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

module.exports = Client;