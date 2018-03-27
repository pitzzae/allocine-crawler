const path = require('path');
const get_better_image = require('./get_better_image');

function filter_string_cmp(str)
{
	return str.replace(/[èéêëēėę]/g, 'e')
		.replace(/[òöòóœøōõ]/g, 'o')
		.replace(/[àáâäæãåā]/g, 'a')
		.replace(/[ûüùúū]/g, 'u')
		.replace(/[îïíīįì]/g, 'i')
		.replace(/[,]/g, '')
		.replace(/[\.]/g, ' ').toLowerCase();
}

function select_best_index_result(q, result)
{
	var source = filter_string_cmp(path.basename(q)).split(' ');
	//console.log('source', source);
	var max_result = 0;
	var index_max_result = 0;
	for (var i = 0; i < result.length; i++)
	{
		var dest = filter_string_cmp(result[i].name).split(' ');
		//console.log('dest', dest);
		var result_weigth = 0;
		for (var j = 0; j < dest.length; j++)
		{
			for (var k = 0; k < source.length; k++)
			{
				if (dest[j] == source[k])
					result_weigth++;
			}
		}
		for (var j = 0; j < source.length; j++)
		{
			if (result[i].date == source[j])
				result_weigth += (dest.length * 0.4);
		}
		result[i].result_weigth = result_weigth / (dest.length + (dest.length * 0.4));
		if (result[i].result_weigth > max_result)
		{
			max_result = result[i].result_weigth;
			index_max_result = i;
		}
	}
	return index_max_result;
}

function extract_season_episode(search_req)
{
	var name_file = path.basename(search_req.init_q).replace(/\./g, ' ').toUpperCase();
	var match_data = name_file.match(/(S[0-9]+)([E0-9]+)/g);
	if (match_data && match_data[0])
	{
		var data = match_data[0].replace(/[ES]/g, ' ').split(' ');
		search_req.season = parseInt(data[1]);
		search_req.episode = parseInt(data[2]);
	}
}

exports.get = function (data, q, callback)
{
	var search_req = {
		data_line: data,
		init_q: q,
		season: null,
		episode: null
	}
	if (search_req.data_line.length > 0)
	{
		var index_selected = 0;
		if (search_req.data_line.length != 1)
			index_selected = select_best_index_result(q, search_req.data_line);
		else
			search_req.data_line[index_selected].result_weigth = 0.4;
		extract_season_episode(search_req);
		search_req.data_line[index_selected].season = search_req.season;
		search_req.data_line[index_selected].episode = search_req.episode;
		if (search_req.season)
			search_req.data_line[index_selected].result_weigth += 0.1;
		if (search_req.episode)
			search_req.data_line[index_selected].result_weigth += 0.1;
		result.img = search_req.data_line[index_selected].url_img;
		if (!search_req.season || !search_req.episode)
			callback(null, null, 'No result found');
		else
			get_better_image.update_url(result, search_req, search_req.data_line[index_selected], callback);
	}
	else
		callback(null, null, 'No result found');
}