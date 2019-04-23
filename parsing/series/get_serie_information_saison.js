const cheerio = require('cheerio');

function extract_episode_from_table(data, episode_list)
{
	let name = data.children[0].data;
	let synopsis = '';
	data.parent.parent.parent.children.forEach(e => {
		if (e.name === 'div' && e.attribs && e.attribs.class === 'content-txt synopsis' && e.children && e.children[0])
			synopsis = (e.children[0].data).trim();
	});
	episode_list.push({
		name: name,
		synopsis: synopsis,
		number: extract_episode_number(name)
	});
}

function extract_episode_number(data)
{
	let match_se = data.match(/(S[0-9]+E[0-9]+)/gi);
	if (match_se && match_se[0])
	{
		let match_e = match_se[0].match(/(E[0-9]+)/gi);
		if (match_e && match_e[0])
			return parseInt(match_e[0].replace(/e/i, ''))
	}
	return null;
}

exports.get = function (query, buffer, callback)
{
	var dom = cheerio.load(buffer.toString('utf8'));
	callback.search_req.result_season = [];
	callback.search_req.episode_list = [];
	dom('div[class="entity-card episode-card entity-card-list cf hred"]').find('div > div > span').each(function() {
		extract_episode_from_table(this, callback.search_req.episode_list)
	});
	dom('div[class="entity-card episode-card entity-card-list cf hred"]').find('div > div > a').each(function() {
		extract_episode_from_table(this, callback.search_req.episode_list)
	});
	for (var key in callback.search_req.episode_list)
	{
		if (callback.search_req.episode_list[key].number == callback.search_req.episode)
		{
			callback.callback({
				name: null,
				titles: callback.search_req.episode_list[key].name,
				synopsis: callback.search_req.episode_list[key].synopsis,
				//first_play: callback.search_req.data_saison.first_play,
				genre: callback.search_req.genre,
				ratingValue: callback.search_req.ratingValue,
				//director: episode.director,
				//writers: episode.writers,
				//casting: episode.casting,
				season: callback.search_req.season,
				episode: callback.search_req.episode
			}, callback.search_req);
			return;
		}
	}
	callback.callback(null, null);
}