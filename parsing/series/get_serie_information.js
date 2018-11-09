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

function format_date(date)
{
	let split_date = date.split(' ');
	let list_month = {
		'janvier': '01',
		'février': '02',
		'mars': '03',
		'avril': '04',
		'mai': '05',
		'juin': '06',
		'juillet': '07',
		'août': '08',
		'septembre': '09',
		'octobre': '10',
		'novembre': '11',
		'décembre': '12',
	};
	if (split_date.length >= 3)
		return `${split_date[0]}/${list_month[split_date[1]]}/${split_date[2]}`;
	else
		return null;
}

function extract_first_play(data, search_req, index)
{
	
	if (data.children && data.children[0] && data.children[0].data)
	{
		search_req.result_season[index].first_play = format_date(data.children[0].data);
		search_req.result_season[index].genre = search_req.genre;
		search_req.result_season[index].ratingValue = parseFloat(search_req.ratingValue);
		index++;
	}
	return index;
}

exports.get = function (query, buffer, callback) {
	var dom = cheerio.load(buffer.toString('utf8'));
	callback.search_req.result_season = [];
	callback.search_req.result_episode = [];
	dom('script[type="application/ld+json"]').each(function() {
		try {
			var data_script = JSON.parse(this.children[0].data.replace(/  +/g, ' ').replace(/\n/g, '').replace(', }', ' }'));
			if (data_script['itemListElement'])
				extract_season_from_table(data_script['itemListElement'], callback.search_req);
			else if (data_script['genre'])
			{
				callback.search_req.genre = data_script['genre'];
				if (data_script['aggregateRating'] && data_script['aggregateRating'].ratingValue)
					callback.search_req.ratingValue = data_script['aggregateRating'].ratingValue;
				else
					callback.search_req.ratingValue = null;
			}
		}
		catch (e) {}
	});
	let max_serrie_count = 0;
	dom('div[class="card card-entity card-season cf card-entity-list hred"]').find('div > div > div > span > span').each(function() {
		max_serrie_count = extract_first_play(this, callback.search_req, max_serrie_count);
	});
	for (var key in callback.search_req.result_season)
	{
		if (callback.search_req.result_season[key].number == callback.search_req.season)
		{
			callback.search_req.data_saison = callback.search_req.result_season[key];
			callback.callback(callback.search_req.result_season[key].url, callback.search_req);
			return;
		}
	}
	callback.callback(null, null);
}