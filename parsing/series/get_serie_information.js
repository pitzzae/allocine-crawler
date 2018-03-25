const cheerio = require('cheerio');

function extract_season_from_table(data, search_req)
{
	for (var i = 0; i < data.length; i++)
	{
		var row_result = {
			url: data[i].url
		}
		var split_data = data[i].name.split(' ');
		if (split_data[split_data.length - 1])
			row_result.number = parseInt(split_data[split_data.length - 1].replace(/S/g, ''));
		search_req.result_season.push(row_result);
	}
}

exports.get = function (query, buffer, callback) {
	var dom = cheerio.load(buffer.toString('utf8'));
	callback.search_req.result_season = [];
	callback.search_req.result_episode = [];
	dom('script[type="application/ld+json"]').each(function() {
		var data_script = JSON.parse(this.children[0].data.replace(/  +/g, ' ').replace(/\n/g, ''));
		if (data_script['itemListElement'])
			extract_season_from_table(data_script['itemListElement'], callback.search_req);
	});
	for (var key in callback.search_req.result_season)
	{
		if (callback.search_req.result_season[key].number == callback.search_req.season)
		{
			callback.callback(callback.search_req.result_season[key].url, callback.search_req);
			return;
		}
	}
	callback.callback(null, null);
}