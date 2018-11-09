const cheerio = require('cheerio');

function extract_episode_url(data, search_req, nb_episode, index)
{
	if (data && data.attribs && data.attribs.href && data.attribs.href.match('/ep-'))
	{
		if (nb_episode === index)
			search_req.url_casting = data.attribs.href;
		index++;
	}
	return index;
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
	//Episode casting url
	index = 0;
	dom('div[class="dropdown-custom-holder series-casting-filter"]').find('div > ul > li > a').each(function() {
		index = extract_episode_url(this, callback.search_req, callback.search_req.episode - 1, index);
	});
	callback.callback(callback.search_req.url_casting, callback.search_req);
}