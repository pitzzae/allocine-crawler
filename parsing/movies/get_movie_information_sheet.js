const cheerio = require('cheerio');

function extract_url_img(data, result)
{
	if (data && data.type == 'tag' && data.attribs && data.attribs.src)
		result.url_img = data.attribs.src;
}

function extract_meta_body(data, result)
{
	if (data && data.length > 0 && data[0].data == 'Nationalité' && data[0].parent && data[0].parent.next && data[0].parent.next.next &&
		data[0].parent.next.next.children && data[0].parent.next.next.children[0] && data[0].parent.next.next.children[0].data)
	{
		//console.log('extract_meta_body_country', data[0].parent.next.next.children[0].data);
		result.country = data[0].parent.next.next.children[0].data;
	}
	if (data && data.length > 0 && data[0].name == 'span' && data[0].attribs && data[0].attribs.itemprop && data[0].attribs.itemprop == 'genre' &&
		data[0].children && data[0].children[0] && data[0].children[0].data)
	{
		//console.log('extract_meta_body_genre', data[0].children[0].data);
		result.genre = data[0].children[0].data;
	}
}

function extract_synopsis_txt(data, result)
{
	if (data && data.length > 0 && data[0].type == 'text' && data[0].next && data[0].next.type == 'tag' && data[0].next.name == 'p' && data[0].next.children)
	{
		result.synopsis = '';
		for (var i = 0; i < data[0].next.children.length; i++)
		{
			if (data[0].next.children[i].type == 'text' && data[0].next.children[i].data)
				result.synopsis += data[0].next.children[i].data;
			else if (data[0].next.children[i].type == 'tag' && data[0].next.children[i].name == 'br')
				result.synopsis += "</br>";
		}
		//console.log(data[0].next.children);
	}
	else if (data && data.length > 0 && data[0].type == 'text' && data[0].data)
		result.synopsis = data[0].data;
}

exports.get = function (query, buffer, callback)
{
	var dom = cheerio.load(buffer.toString('utf8'));
	var result_movie = {
		url_img: null,
		genre: '',
		country: '',
		synopsis: ''
	};
	//$('div[class="card card-entity card-movie-overview row row-col-padded-10 cf"]').find('figure > a').each(function() {
	//	extract_url_img(this, result);
	//});
	dom('div[class="card card-entity card-movie-overview row row-col-padded-10 cf"]').find('figure > span > img').each(function() {
		extract_url_img(this, result_movie);
	});
	dom('div[class="meta-body"]').find('div > span').each(function() {
		extract_meta_body(this.children, result_movie);
	});
	dom('div[class="synopsis-txt"]').each(function() {
		extract_synopsis_txt(this.children, result_movie);
	});
	if (!result_movie.url_img)
		result_movie.url_img = 'http://fr.web.img2.acsta.net/c_215_290/commons/v9/common/empty/empty.png';
	callback.callback({
		titles: null,
		date: null,
		from: null,
		with: null,
		genre: result_movie.genre,
		country: result_movie.country.trim(),
		synopsis: result_movie.synopsis.trim(),
		img: result_movie.url_img
	}, callback.search_req);
}