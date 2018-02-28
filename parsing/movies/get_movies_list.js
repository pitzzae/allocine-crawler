const cheerio = require('cheerio');

function extract_data_from_row(data_extract, result)
{
	if (data_extract.name == 'a' && data_extract.attribs && data_extract.attribs.href && data_extract.children)
	{
		result.url = data_extract.attribs.href;
		result.name = '';
		for (var i = 0; i < data_extract.children.length; i++)
		{
			if (data_extract.children[i].type == 'text')
				result.name += data_extract.children[i].data;
			else if (data_extract.children[i].type == 'tag' && data_extract.children[i].name == 'b')
				result.name += data_extract.children[i].children[0].data;
		}
		if (result.name.length > 0)
			result.name = result.name.substr(1, result.name.length - 1);

	}
	else if (data_extract.name == 'span')
	{
		for (var i = 0; i < data_extract.children.length; i++)
		{
			if (data_extract.children[i].type == 'text')
			{
				var text_result = data_extract.children[i].data.substr(1, data_extract.children[i].data.length - 1);
				var text_result_split = text_result.split(' ');
				if (text_result_split[0] == 'de')
				{
					result.from = text_result.substr(3, text_result.length - 3);
					//console.log("get from", result.from);
				}
				else if (text_result_split[0] == 'avec')
				{
					result.with = text_result.substr(5, text_result.length - 5);
					//console.log("get with", result.with);
				}
				else if (text_result != '')
				{
					result.date = text_result;
					//console.log("get date", result.date);
				}
			}
		}
	}
	//console.log(result);
}

function extract_data_from_table(data, data_line)
{
	//console.log("data", data);
	//console.log("data[0].next.children", data[0].next.children);
	//console.log("data[0].next.children[0].children", data[0].next.children[0].children);
	if (data && data[0] && data[0].next && data[0].next.children && data[0].next.children[0] && data[0].next.children[0].children && data[0].next.children[0].children[0] && data[0].next.children[0].children[0].children)
	{
		var data_result = data[0].next.children[0].children[0].children;
		var result = {
			url: '',
			name: '',
			date: '',
			from: '',
			with: ''
		}
		for (var i = 0; i < data_result.length; i++)
		{
			if (data_result[i].name && data_result[i].children && (data_result[i].name == 'a' || data_result[i].name == 'span'))
			{
				var data_extract = {
					name: data_result[i].name,
					children: data_result[i].children,
					attribs: data_result[i].attribs
				}
				extract_data_from_row(data_extract, result);
				//console.log("data_result["+i+"]", data_result[i]);
				//console.log("data_result["+i+"]", data_extract);
			}
		}
		data_line.push(result);
	}
}

exports.get = function (q, buffer, callback)
{
	var dom = cheerio.load(buffer.toString('utf8'));
	var result_movie = [];
	dom('table[class="totalwidth noborder purehtml"]').find('tbody > tr').each(function() {
		extract_data_from_table(this.children, result_movie);
	});
	callback(result_movie);
}