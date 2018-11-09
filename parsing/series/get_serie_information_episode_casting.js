const cheerio = require('cheerio');

function extract_actor_writers(data, episode)
{
	if (data && data.children && data.children[0] && data.children[0].data &&
		data.parent && data.parent.parent && data.parent.parent.children)
	{
		let casting = '';
		data.parent.parent.children.forEach(c => {
			if (c.name === 'div' && c.attribs && c.attribs.class === 'meta-sub light')
				casting = data.children[0].data;
		});
		if (casting !== '')
			episode.casting += `${data.children[0].data}, `;
		else
			episode.writers += `${data.children[0].data}, `;
	}
}

function extract_actor_next(data, episode)
{
	if (data && data.attribs && data.attribs.title)
		episode.casting += `${data.attribs.title}, `;
}

function extract_director(data, episode)
{
	if (data && data.attribs && data.attribs.title)
		episode.director += `${data.attribs.title}, `;
}

exports.get = function (query, buffer, callback) {
	var dom = cheerio.load(buffer.toString('utf8'));
	var result = {
		titles: '',
		synopsis: '',
		date: null,
		first_play: '',
		director: '',
		writers: '',
		casting: '',
		genre: '',
		ratingValue: ''
	};
	let episode = callback.search_req.result_episode[callback.search_req.episode - 1];
	episode.casting = '';
	episode.writers = '';
	episode.director = '';
	dom('section[class="section casting-actor"]').find('div > div > div > div > div > div > a').each(function() {
		extract_actor_writers(this, episode);
	});
	dom('section[class="section casting-actor"]').find('div > a').each(function() {
		extract_actor_next(this, episode);
	});
	dom('section[class="section casting-list"]').find('div > a').each(function() {
		extract_director(this, episode);
	});
	if (episode.casting.length > 2)
		episode.casting = episode.casting.slice(0, -2);
	if (episode.writers.length > 2)
		episode.writers = episode.writers.slice(0, -2);
	if (episode.director.length > 2)
		episode.director = episode.director.slice(0, -2);
	callback.callback({
		name: null,
		titles: episode.title,
		synopsis: episode.synopsis,
		first_play: callback.search_req.data_saison.first_play,
		genre: callback.search_req.data_saison.genre,
		ratingValue: callback.search_req.data_saison.ratingValue,
		director: episode.director,
		writers: episode.writers,
		casting: episode.casting,
		season: callback.search_req.season,
		episode: callback.search_req.episode
	}, callback.search_req);
}