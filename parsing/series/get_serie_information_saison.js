const cheerio = require('cheerio');
const phantom = require('phantom');

function extract_episode_from_table(data, search_req)
{
	var match_se = data.children[0].data.match(/(S[0-9]+E[0-9]+)/g);
	if (match_se && match_se[0])
	{
		var match_e = match_se[0].match(/(E[0-9]+)/g);
		if (match_e && match_e[0])
		{
			search_req.result_episode.push({
				id_url: data.attribs.href,
				number: parseInt(match_e[0].replace('E', ''))
			});
		}
	}
}

exports.get = function (query, buffer, callback)
{
	var dom = cheerio.load(buffer.toString('utf8'));
	callback.search_req.result_season = [];
	dom('div[class="card-entity card-episode row row-col-padded-10 hred"]').find('div > div > div > a').each(function() {
		extract_episode_from_table(this, callback.search_req);
	});
	for (var key in callback.search_req.result_episode)
	{
		if (callback.search_req.result_episode[key].number == callback.search_req.episode)
		{
			callback.callback(callback.search_req.result_episode[key].id_url, callback.search_req);
			return;
		}
	}
	callback.callback(null, null);
}