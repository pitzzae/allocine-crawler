const cheerio = require('cheerio');

function extract_episode_info_from_table(data, result)
{
	for (var i = 0; i < data.length; i++)
	{
		if (data[i].type == 'tag' && data[i].name && data[i].attribs && data[i].attribs.class)
		{
			if (data[i].attribs.class == "tt_16 bold" && data[i].children[0] && data[i].children[0].data)
			{
				result.titles = data[i].children[0] && data[i].children[0].data;
				//console.log('titles', data[i].children[0] && data[i].children[0].data);
			}
			if (data[i].attribs.class == "margin_10v" && data[i].children[0] && data[i].children[0].next &&
				data[i].children[0].next.type == 'tag' && data[i].children[0].next.name == 'span' && data[i].children[0].next.children &&
				data[i].children[0].next.children[0] && data[i].children[0].next.children[0].data)
			{
				result.synopsis = data[i].children[0].next.children[0].data;
				//console.log('synopsis', data[i].children[0].next.children[0]);
			}
			else if (data[i].attribs.class == "margin_10v" && data[i].children[0] && data[i].children[0].data)
			{
				result.synopsis = data[i].children[0].data;
				//console.log('synopsis', data[i].children[0]);
			}
		}
	}
}

function extract_episode_extra_info_from_table(data, result)
{
	for (var i = 0; i < data.length; i++)
	{
		if (data[i].name == 'th' && data[i].children && data[i].children[0] && data[i].children[0].children && data[i].children[0].children[0] && data[i].children[0].children[0].data &&
			data[i].next && data[i].next.next.children)
		{
			//console.log(data[i].next.next.name, data[i].next.next.children);
			//console.log(data[i].name, data[i].children[0].children[0].data);
			var data_result = '';
			for (var j = 0; j < data[i].next.next.children.length; j++)
			{
				if (data[i].next.next.children[j].type == 'tag' && data[i].next.next.children[j].name == 'a' && data[i].next.next.children[j].attribs && data[i].next.next.children[j].attribs.title)
					data_result += data[i].next.next.children[j].attribs.title + " ";
				if (data[i].next.next.children[j].next && data[i].next.next.children[j].next.type == 'text' && data[i].next.next.children[j].next.data)
					data_result += data[i].next.next.children[j].next.data;
				//console.log(data[i].next.next.children[j]);
			}
			//console.log(data[i].children[0].children[0].data);
			if (data[i].children[0].children[0].data == '1ère diffusion' && data[i].next.next.name && data[i].next.next.children[0] && data[i].next.next.children[0].data)
			{
				//console.log('1ère diffusion', data[i].next.next.children[0].data);
				result.first_play = data[i].next.next.children[0].data.replace('(', '');;
			}
			else if (data[i].children[0].children[0].data == '\nRéalisateur\n' || data[i].children[0].children[0].data == '\nRéalisateurs\n')
			{
				//console.log('Réalisateur', data[i].next.next.name, data[i].next.next);
				result.director = data_result;
			}
			else if (data[i].children[0].children[0].data == '\nScénaristes\n' || data[i].children[0].children[0].data == '\nScénariste\n')
			{
				//console.log('Scénariste', data[i].next.next.name, data[i].next.next);
				result.writers = data_result;
			}
			else if (data[i].children[0].children[0].data == 'Casting')
			{
				//console.log('Casting', data[i].next.next.name, data[i].next.next);
				result.casting = data_result;
			}
		}
	}
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
	};
	dom('table[class="table table-bordered line-bordered"]').find('tbody > tr > td > div').each(function() {
		extract_episode_info_from_table(this.children, result);
	});
	dom('table[class="data_box_table margin_10b"]').find('tbody > tr').each(function() {
		extract_episode_extra_info_from_table(this.children, result);
	});
	callback.callback({
		name: null,
		titles: result.titles.replace(/\n/g, ''),
		synopsis: result.synopsis.replace(/\n/g, ''),
		first_play: result.first_play.replace(/.\n/g, '').trim() + " ",
		director: result.director.replace(/\n/g, '').trim(),
		with: null,
		writers: result.writers.replace(/\n/g, '').trim(),
		casting: result.casting.replace(/\n/g, ''),
		season: callback.search_req.season,
		episode: callback.search_req.episode
	}, callback.search_req);
}