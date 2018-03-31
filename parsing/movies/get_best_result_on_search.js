const path = require('path');

function filter_string_cmp(str)
{
	return str.toLowerCase().replace(/[èéêëēėę]/g, 'e')
		.replace(/[òöòóœøōõ]/g, 'o')
		.replace(/[àáâäæãåā]/g, 'a')
		.replace(/[ûüùúū]/g, 'u')
		.replace(/[îïíīįì]/g, 'i')
		.replace(/[\.-]/g, ' ')
		.replace(/  +/g, '');
}

function filter_number_format(str)
{
	var match_comma_str = str.match(new RegExp(/[^0-9][,][^0-9]/g));
	if (match_comma_str)
	{
		match_comma_str.forEach((e) => {
			str = str.replace(e, e.replace(',', ' '));
		});
	}
	var match_space_number = str.match(new RegExp(/[0-9][ ][0-9]/g));
	if (match_space_number)
	{
		match_space_number.forEach((e) => {
			str = str.replace(e, e.replace(' ', ''));
		});
	}
	return str;
}

function select_best_index_result(q, result)
{
	var source = filter_string_cmp(path.basename(q)).split(' ');
	//console.log('source', source);
	var max_result = 0;
	var index_max_result = 0;
	for (var i = 0; i < result.length; i++)
	{
		var dest = filter_number_format(filter_string_cmp(result[i].name)).split(' ');
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
				result_weigth += (dest.length * 0.5);
		}
		result[i].result_weigth = result_weigth / (dest.length + (dest.length * 0.5));
		if (result[i].result_weigth > max_result)
		{
			max_result = result[i].result_weigth;
			index_max_result = i;
		}
	}
	return index_max_result;
}

exports.get = function (data, q, callback)
{
	var search_req = {
		data_line: data,
		init_q: q,
	}
	var result_movie = {};
	if (search_req.data_line.length > 0)
	{
		
		var index_selected = 0;
		if (search_req.data_line.length != 1)
			index_selected = select_best_index_result(search_req.init_q, search_req.data_line);
		else
			search_req.data_line[index_selected].result_weigth = 0.4;

		search_req.index_selected = index_selected;
		result_movie.name = search_req.data_line[index_selected].name;
		result_movie.date = search_req.data_line[index_selected].date;
		result_movie.from = search_req.data_line[index_selected].from;
		result_movie.with = search_req.data_line[index_selected].with;
		//console.log(result_movie);
		//console.log(search_req);
		callback(search_req, search_req.data_line[index_selected], null);
	}
	else
		callback(null, null, 'No result found');
}