const cheerio = require('cheerio');

function extract_url_img(data, result)
{
	if (data && data.type == 'tag' && data.attribs && data.attribs.src)
		result.url_img = data.attribs.src;
}

function extract_meta_body(data, meta_body)
{
	if (data && data.children && data.children[0] && data.children[0].data && data.children[0].data !== '')
	{
		let data_filte = data.children[0].data.replace(/\n/g, '').trim()
		if (data_filte !== 'plus' && data_filte !== '')
			meta_body.push(data_filte);
	}
}

function extract_synopsis_txt_p(data, result)
{
	if (data && data.children && data.children[0] && data.children[0].data)
		result.synopsis = data.children[0].data;
}

function extract_synopsis_txt_div(data, result)
{
	if (data && data.attribs && data.attribs.class.match("content-txt"))
	{
		if (data && data.children)
		{
			data.children.forEach(e => {
				if (e.type === 'text')
					result.synopsis += e.data;
			});
		}
	}
}

function extract_age_requirenent(data, result)
{
	if (data && data.attribs && data.attribs.class === "certificate-text" &&
		data.children && data.children[0] && data.children[0].data)
	{
		let age = data.children[0].data.match(/([0-9])\w+/);
		if (age)
			result.age_requirenent = parseInt(age[0]);
	}
}

function apply_filter(meta_body, result_movie)
{
	let type = '';
	let type_name = {
		'Date de sortie': 'date',
		'De': 'from',
		'Avec': 'with',
		'Genres': 'genre',
		'Genre': 'genre',
		'Nationalités': 'country',
		'Nationalité': 'country'
	};
	let type_list = {
		'Date de sortie': 'date',
		'De': 'from',
		'Avec': 'with',
		'Genres': 'genre',
		'Nationalités': 'country',
	};
	meta_body.forEach(e => {
		let is_type = false
		for (let key in type_name)
		{
			if (key === e)
				is_type = true;
		}
		if (is_type)
			type = e;
		else if (type !== '' && type_name[type])
		{
			result_movie[type_name[type]] += `${e}, `;
		}
	});
	for (let key in type_list)
	{
		result_movie[type_name[key]] = result_movie[type_name[key]].slice(0, -2)
	}
}

function extract_ratingValue(data, result_movie)
{
	if (data && data.attribs && data.attribs.itemprop === 'ratingValue' && data.attribs.content)
		result_movie.ratingValue = parseFloat(data.attribs.content.replace(',', '.'));
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

exports.get = function (query, buffer, callback)
{
	var dom = cheerio.load(buffer.toString('utf8'));
	var result_movie = {
		url_img: null,
		date: '',
		from: '',
		with: '',
		genre: '',
		country: '',
		synopsis: '',
		ratingValue: '',
		age_requirenent: null
	};
	dom('div[class="card card-entity card-movie-overview row row-col-padded-10 cf"]').find('figure > span > img').each(function() {
		extract_url_img(this, result_movie);
	});
	let meta_body = [];
	dom('div[class="meta-body-item"]').find('span').each(function() {
		extract_meta_body(this, meta_body);
	});
	dom('section[id="synopsis-details"]').find('div > p').each(function() {
		extract_synopsis_txt_p(this, result_movie);
	});
	dom('section[id="synopsis-details"]').find('div > span').each(function() {
		extract_age_requirenent(this, result_movie);
	});
	if (result_movie.synopsis === '')
	{
		dom('section[id="synopsis-details"]').find('div').each(function() {
			extract_synopsis_txt_div(this, result_movie);
		});
	}
	dom('div[itemprop="aggregateRating"]').find('div > span').each(function() {
		extract_ratingValue(this, result_movie);
	});
	apply_filter(meta_body, result_movie);
	if (!result_movie.url_img)
	{
		if (callback.search_req && callback.search_req.data_line &&
			callback.search_req.data_line[callback.search_req.index_selected] && callback.search_req.data_line[callback.search_req.index_selected].url_img)
			result_movie.url_img = callback.search_req.data_line[callback.search_req.index_selected].url_img;
		else
			result_movie.url_img = 'http://fr.web.img2.acsta.net/c_215_290/commons/v9/common/empty/empty.png';
	}
	var change_empty_img = result_movie.url_img.match(/emptymedia/g);
	if (change_empty_img && change_empty_img.length > 0)
		result_movie.url_img = 'http://fr.web.img2.acsta.net/c_215_290/commons/v9/common/empty/empty.png';
	callback.callback({
		titles: null,
		date: format_date(result_movie.date),
		from: result_movie.from,
		with: result_movie.with,
		genre: result_movie.genre,
		ratingValue: result_movie.ratingValue,
		country: result_movie.country.trim(),
		synopsis: result_movie.synopsis.replace(/<\/br> /g, '').replace(/…/g, '').replace(/\.\.\./g, '.').trim(),
		age_requirenent: result_movie.age_requirenent,
		img: result_movie.url_img
	}, callback.search_req);
}