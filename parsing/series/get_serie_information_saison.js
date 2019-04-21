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
	callback.search_req.episode_list = [];
	dom('div[class="entity-card episode-card entity-card-list cf hred"]').find('div > div > span').each(function() {
		let name = this.children[0].data;
		let synopsis = '';
		this.parent.parent.parent.children.forEach(e => {
			if (e.name === 'div' && e.attribs && e.attribs.class === 'content-txt synopsis' && e.children && e.children[0])
				synopsis = (e.children[0].data).trim();
		});
		callback.search_req.episode_list.push({
			name: name,
			synopsis: synopsis,
			number: extract_episode_number(name)
		});
	});
	/*
	let index = 0;
	dom('div[class="entity-card episode-card entity-card-list cf hred"]').find('div').each(function() {
		if (this.children && this.children[0])
		{
			console.Log(this)
			//console.log(this.children[0].data)
		}
		//index = extract_url_from_table(this, callback.search_req.result_episode, index);
	});
	*/
	for (var key in callback.search_req.episode_list)
	{
		if (callback.search_req.episode_list[key].number == callback.search_req.episode)
		{
			//console.log(callback.search_req);
			//callback.callback(query.replace('http://www.allocine.fr', '').replace('saison', 'casting/saison'), callback.search_req);
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