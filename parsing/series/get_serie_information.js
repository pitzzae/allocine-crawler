const cheerio = require('cheerio');

function extract_season_from_table(data, search_req)
{
	for (var i = 0; i < data.length; i++)
	{
		if (data[i].children && data[i].children.length > 0 && data[i].children[0].data &&
			data[i].parent && data[i].parent.attribs && data[i].parent.attribs.href)
		{
			var row_result = {
				url: data[i].parent.attribs.href
			}
			var split_data = data[i].children[0].data.split(' ');
			if (split_data[1])
				row_result.number = parseInt(split_data[1]);
			search_req.result_season.push(row_result);
		}
	}
}

exports.get = function (query, buffer, callback) {
	var dom = cheerio.load(buffer.toString('utf8'));
	callback.search_req.result_season = [];
	callback.search_req.result_episode = [];
	dom('div[class="img_side_content"]').find('a').each(function() {
		extract_season_from_table(this.children, callback.search_req);
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