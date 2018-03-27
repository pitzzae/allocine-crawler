var request = require('request');
var cheerio = require('cheerio');

function format_img_size(data_img_size)
{
	if (data_img_size[1])
	{
		var split_size = data_img_size[1].split('x');
		return {
			w: split_size[0],
			h: split_size[1]
		};
	}
	else
		return {
			w: 0,
			h: 0
		};
}

function extract_children_img_size(data)
{
	var output_size = '';
	data.forEach((e) => {
		if (e.name == 'p')
		{
			e.children.forEach((f) => {
				if (f.name == 'span')
				{
					f.children.forEach((f) => {
						output_size += f.data + " ";
					});
				}
			});
		}
	});
	return format_img_size(output_size.split(', '));
}

function extract_children_url(data, result_img)
{
	data.forEach((e) => {
		if (e.name == 'a')
		{
			result_img.push({
				size: extract_children_img_size(e.parent.parent.parent.prev.prev.children),
				url: e.attribs.href
			});
		}
	});
}

function select_best_size(result_img)
{
	for (var i = 0; i < result_img.length; i++)
	{
		if ((result_img[i].size.w / result_img[i].size.h) <= 0.8 &&
			(result_img[i].size.w / result_img[i].size.h) >= 0.6 &&
			result_img[i].size.h >= 300)
			return result_img[i].url;
	}
	return null;
}

function update_href_page(href)
{
	var match_page = href.match(/page=[0-9]/g);
	if (match_page && match_page[0])
	{
		var split_page = match_page[0].split('=');
		var int_page = parseInt(split_page[1]) + 1;
		if (int_page > 4)
			return null;
		return href.replace(match_page[0], "page=" + int_page);
	}
	return null;
}

function update_url_result(result, new_image, force)
{
	result.forEach((e, k) => {
		if (result.img == e.url_img || force)
			result[k].url_img = new_image;
	});
}

function parse_page_result(href, data, result, search_req, data_line, callback)
{
	var dom = cheerio.load(data);
	var result_img = [];
	dom('p[class="hidden-xs image-link"]').each(function() {
		if (this.children)
			extract_children_url(this.children, result_img);
	});
	var new_image = select_best_size(result_img);
	if (new_image)
	{
		update_url_result(result, new_image);
		callback(search_req, data_line, null);
	}
	else
	{
		var new_href = update_href_page(href);
		if (new_href)
			load_page_result(new_href, result, search_req, data_line, callback);
		else
			callback(search_req, data_line, null);
	}
}

function load_page_result(href, result, search_req, data_line, callback)
{
	request.post({url: href}, (error, response, body) => {
		if (!error)
			parse_page_result(href, body, result, search_req, data_line, callback);
		else
			callback(search_req, data_line, null);
	});
}

exports.update_url = function(result, search_req, data_line, callback)
{
	if (result.img.match(/emptymedia/g))
	{
		update_url_result(result, 'http://fr.web.img2.acsta.net/c_215_290/commons/v9/common/empty/empty.png', true);
		callback(search_req, data_line, null);
	}
	else
	{
		//load_page_result("https://tineye.com/search/50a911334d9af6dbfb6de012bccabda03cf9d4d8/" + "?page=1&sort=score&order=desc", result, search_req, data_line, callback);
		var post = {
			url:'https://tineye.com/search',
			formData: {
				url: result.img
			}
		};
		request.post(post, (error, response, body) => {
			if (!error && response.caseless && response.caseless.dict && response.caseless.dict.location)
				load_page_result(response.caseless.dict.location + "?page=1&sort=size&order=desc", result, search_req, data_line, callback);
			else
				callback(search_req, data_line, null);
		});
	}
}