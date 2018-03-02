const cheerio = require('cheerio');

function extract_episode_from_table(data, search_req) {
	for (var i = 0; i < data.length; i++)
	{
		var id_url = null;
		var number = null;
		if (data[i].attribs && data[i].attribs.class && data[i].attribs.class == ' j_entities' &&
			data[i].attribs['data-entities'])
		{
			var id_episode = JSON.parse(data[i].attribs['data-entities']);
			id_url = id_episode.entityId;
			for (var j = 0; j < data[i].children.length; j++)
			{
				if (data[i].children[j].type == 'tag' && data[i].children[j].name == 'h2' && data[i].children[j].children)
				{
					for (var k = 0; k < data[i].children[j].children.length; k++)
					{
						if (data[i].children[j].children[k].type == 'tag' && data[i].children[j].children[k].name == 'span' && data[i].children[j].children[k].children)
						{
							for (var l = 0; l < data[i].children[j].children[k].children.length; l++)
							{
								if (data[i].children[j].children[k].children[l].type == 'tag' && data[i].children[j].children[k].children[l].name == 'strong' &&
									data[i].children[j].children[k].children[l].attribs && data[i].children[j].children[k].children[l].attribs.content)
								{
									number = parseInt(data[i].children[j].children[k].children[l].attribs.content);
								}
							}
							//console.log('data['+i+'].children['+j+'].children['+k+']',data[i].children[j].children[k]);
						}
					}
					//console.log('data['+i+'].children['+j+']',data[i].children[j]);
				}
			}
		}
		if (id_url && number)
			search_req.result_episode.push({id_url: id_url, number: number});
	}
}

exports.get = function (query, buffer, callback)
{
	var dom = cheerio.load(buffer.toString('utf8'));
	callback.search_req.result_season = [];
	dom('table[class="table table-bordered line-bordered"]').find('tbody > tr').each(function() {
		extract_episode_from_table(this.children, callback.search_req);
	});
	for (var key in callback.search_req.result_episode)
	{
		if (callback.search_req.result_episode[key].number == callback.search_req.episode)
		{
			callback.callback(callback.search_req.result_episode[key].id_url, callback.search_req);
			return;
		}
	}
	callback.callback(null, null);
}