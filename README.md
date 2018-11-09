# allocine-crawler

[![NPM](https://nodei.co/npm/allocine-crawler.png)](https://nodei.co/npm/allocine-crawler/)

A crawler client for the Allocine website that works in node

Node requirement
-------
```
Dependencie phantom@4.0.12: wanted: {"node":">=8"}
```

Install
-------

```bash
$ npm install allocine-crawler
```

Usage
-------

```javascript
const allocine = require('allocine-crawler');

var client = new allocine();

// Return series list on search
client.get_series_list('arrow S01E01').then(res => {
	console.log(res);
}).catch(err => {
	console.log(err);
});

// Return information of serie search
client.get_series_sheets_by_name('arrow S01E01').then(res => {
	console.log(res);
}).catch(err => {
	console.log(err);
});

// Return movies list on search
client.get_movies_list('interstellar').then(res => {
	console.log(res);
}).catch(err => {
	console.log(err);
});

// Return information of movie search
client.get_movies_sheets_by_name('interstellar').then(res => {
	console.log(res);
}).catch(err => {
	console.log(err);
});
```

get\_series\_list
-------

```javascript
client.get_series_list('arrow S01E01').then(res => {
	console.log(res);
}).catch(err => {
	console.log(err);
});
```
```json
[
  {
    "id": "10839",
    "url_img": "http://fr.web.img3.acsta.net/r_75_106/medias/nmedia/18/90/71/79/20214705.jpg",
    "url": "/series/ficheserie_gen_cserie=10839.html",
    "name": "Arrow",
    "date": "2012",
    "with": "Stephen Amell, David Ramsey"
  },
  {
    "id": "19136",
    "url_img": "http://fr.web.img1.acsta.net/r_75_106/pictures/16/01/28/09/49/549610.jpg",
    "url": "/series/ficheserie_gen_cserie=19136.html",
    "name": "DC's Legends of Tomorrow",
    "date": "2016",
    "with": "Brandon Routh, Caity Lotz"
  },
  {
    "id": "23548",
    "url_img": "http://fr.web.img4.acsta.net/r_75_106/commons/emptymedia/Affichette_Recherche.gif",
    "url": "/series/ficheserie_gen_cserie=23548.html",
    "name": "Five Arrows",
    "date": "2018",
    "with": ""
  },
  {
    "id": "12168",
    "url_img": "http://fr.web.img3.acsta.net/r_75_106/pictures/210/017/21001783_20130426165143363.jpg",
    "url": "/series/ficheserie_gen_cserie=12168.html",
    "name": "A Moody Christmas",
    "date": "2012",
    "with": "Ian Meadows, Patrick Brammall"
  },
  {
    "id": "5228",
    "url_img": "http://fr.web.img5.acsta.net/r_75_106/medias/nmedia/18/69/18/31/18865066.jpg",
    "url": "/series/ficheserie_gen_cserie=5228.html",
    "name": "Grand prix",
    "date": "1977",
    "with": ""
  },
  {
    "id": "8629",
    "url_img": "http://fr.web.img4.acsta.net/r_75_106/commons/emptymedia/Affichette_Recherche.gif",
    "url": "/series/ficheserie_gen_cserie=8629.html",
    "name": "La flèche brisée",
    "date": "1956",
    "with": "John Lupton, Michael Ansara"
  }
]
```

get\_series\_sheets\_by\_name
-------

```javascript
client.get_series_sheets_by_name('arrow S01E01').then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});

```

```json
{
  "name": "Arrow",
  "titles": "Le retour du naufragé",
  "synopsis": "Le milliardaire Oliver Queen, présumé mort depuis un violent naufrage survenu cinq ans plus tôt, est retrouvé bien en vie dans une île perdue du Pacifique. De retour à Starling City, il est chaleureusement accueilli par Moira, sa mère dévouée, Thea, sa sœur bien-aimée, et Tommy, son meilleur ami. Même si Oliver s'efforce de cacher l'homme qu'il est devenu, son entourage sent que celui-ci a a été durement éprouvé par cet exil forcé. Repenti de ses erreurs passées, le jeune homme cherche la rédemption. Il tente notamment de se réconcilier avec son ex-petite amie, Laurel Lance. Tout en remettant de l'ordre dans sa vie, Oliver se crée une identité secrète, un Archer qui tente de réparer les torts causés par sa famille, combattre les maux de la société et restaurer l'ordre dans la ville. En journée, Oliver joue le riche héritier insouciant et négligent, amateur de jolies femmes, constamment suivi par son chauffeur-garde du corps, John Diggle, prenant soin de dissimuler sa double vie. Il lui faut prendre garde au père de Laurel, le détective Quentin Lance, qui est déterminé à arrêter le justicier qui agit dans l'ombre dans sa ville.",
  "first_play": "10/10/2012",
  "genre": "Drame",
  "ratingValue": 4.1,
  "director": "David Nutter",
  "writers": "Andrew Kreisberg, Marc Guggenheim",
  "casting": "Stephen Amell, Katie Cassidy, Colin Donnell, David Ramsey, Willa Holland, Paul Blackthorne, Susanna Thompson, Emily Bett Rickards, Kathleen Gati, Jacqueline MacInnes Wood, Colin Salmon, Jamey Sheridan, Roger R. Cross, Darren Shahlavi, Steve Bacic, Brian Markinson, Annie Ilonzeh, Laci J Mailey, Hiro Kanagawa, Nneka Croal",
  "season": 1,
  "episode": 1,
  "img": "/9j/2wBDAAYEBQYFBAYGBQYHBwYI ... 6lHqTnrmg//9k=",
  "result_weigth": 0.9142857142857143
}
```

get\_movies\_list
-------

```javascript
client.get_movies_list(console.log, 'interstellar');
```
```json
[
  {
    "url": "/film/fichefilm_gen_cfilm=114782.html",
    "name": "Interstellar",
    "date": "2014",
    "from": "Christopher Nolan",
    "with": "Matthew McConaughey, Anne Hathaway",
    "url_img": "http://fr.web.img5.acsta.net/r_75_106/pictures/14/09/24/12/08/158828.jpg"
  },
  {
    "url": "/film/fichefilm_gen_cfilm=28426.html",
    "name": "Interstellar Pig",
    "date": "",
    "from": "Damon Santostefano",
    "with": "",
    "url_img": "http://fr.web.img4.acsta.net/r_75_106/commons/emptymedia/Affichette_Recherche.gif"
  }
]
```

get\_movies\_sheets\_by\_name
-------

```javascript
client.get_movies_sheets_by_name(console.log, 'interstellar');
```

```json
{
  "titles": "Interstellar",
  "date": "5/11/2014",
  "from": "Christopher Nolan",
  "with": "Matthew McConaughey, Anne Hathaway, Michael Caine",
  "genre": "Science fiction, Drame",
  "ratingValue": 4.5,
  "country": "américain, britannique",
  "synopsis": "Le film raconte les aventures d’un groupe d’explorateurs qui utilisent une faille récemment découverte dans l’espace-temps afin de repousser les limites humaines et partir à la conquête des distances astronomiques dans un voyage interstellaire.",
  "age_requirenent": null,
  "img": "/9j/2wBDAAYEBQYFBAYGBQYHBwYIC ... YA/Lff+cODX//Z",
  "result_weigth": 0.6666666666666666
}
```

Dependencies
-------

Package | Version
--- |:---:
[http](https://www.npmjs.com/package/http) | 0.0.0
[path](https://www.npmjs.com/package/path) | 0.12.7
[cheerio](https://www.npmjs.com/package/cheerio) | 1.0.0-rc.2
[phantom](https://www.npmjs.com/package/phantom) | 4.0.12
[sharp](https://www.npmjs.com/package/sharp) | 0.20.1
[torrent-name-parser](https://www.npmjs.com/package/torrent-name-parser) | 0.6.5

Author
-------

 - **Guillaume TORRESANI** : <gtorresa@student.42.fr>, [http://github.com/pitzzae](http://github.com/pitzzae)

License
-------

 - **MIT** : [LICENSE](https://github.com/pitzzae/allocine-crawler/blob/master/LICENSE)