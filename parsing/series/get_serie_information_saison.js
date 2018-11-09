const cheerio = require('cheerio');

function extract_episode_from_table(data, search_req)
{
	var match_se = data.children[0].data.match(/(S[0-9]+E[0-9]+)/g);
	if (match_se && match_se[0])
	{
		var match_e = match_se[0].match(/(E[0-9]+)/g);
		if (match_e && match_e[0])
		{
			search_req.result_episode.push({
				number: parseInt(match_e[0].replace('E', '')),
				title: data.children[0].data.replace(`${match_se[0]} - `, '')
			});
		}
	}
}

function extract_url_from_table(data, result, index)
{
	if (data.attribs && data.attribs.class === "content-txt synopsis" && data.children[0] && data.children[0].data)
	{
		result[index].synopsis = data.children[0].data.replace(/…/g, '.').replace(/\.\.\./g, '.').replace(/\n/, '').trim();
		index++;
	}
	return index;
}

exports.get = function (query, buffer, callback)
{
	var dom = cheerio.load(buffer.toString('utf8'));
	callback.search_req.result_season = [];
	dom('div[class="card-entity card-episode row row-col-padded-10 hred"]').find('div > div > div > span').each(function() {
		extract_episode_from_table(this, callback.search_req);
	});
	let index = 0;
	dom('div[class="card-entity card-episode row row-col-padded-10 hred"]').find('div > div > div > div').each(function() {
		index = extract_url_from_table(this, callback.search_req.result_episode, index);
	});
	
	for (var key in callback.search_req.result_episode)
	{
		if (callback.search_req.result_episode[key].number == callback.search_req.episode)
		{
			callback.callback(query.replace('http://www.allocine.fr', '').replace('saison', 'casting/saison'), callback.search_req);
			return;
		}
	}
	callback.callback(null, null);
}