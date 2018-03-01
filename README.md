# node-allocine-crawler

[![NPM](https://nodei.co/npm/allocine-crawler.png)](https://nodei.co/npm/allocine-crawler/)


A crawler client for the Allocine website that works in node

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
client.get_series_list(console.log, 'arrow S01E01');

// Return information of serie search
client.get_series_sheets_by_name(console.log, 'arrow S01E01');

// Return movies list on search
client.get_movies_list(console.log, 'interstellar');

// Return information of movie search
client.get_movies_sheets_by_name(console.log, 'interstellar');
```

get\_series\_list
-------

```javascript
client.get_series_list(console.log, 'arrow S01E01');
```
```json
[
  {
    "id": "10839",
    "url_img": "http://fr.web.img3.acsta.net/r_75_106/medias/nmedia/18/90/71/79/20214705.jpg",
    "url": "/series/ficheserie_gen_cserie=10839.html",
    "name": "Arrow",
    "date": "2012",
    "from": "",
    "with": "Stephen Amell, David Ramsey\n"
  },
  {
    "id": "19136",
    "url_img": "http://fr.web.img1.acsta.net/r_75_106/pictures/16/01/28/09/49/549610.jpg",
    "url": "/series/ficheserie_gen_cserie=19136.html",
    "name": "DC's Legends of Tomorrow",
    "date": "2016",
    "from": "",
    "with": "Brandon Routh, Caity Lotz\n"
  },
  {
    "id": "12168",
    "url_img": "http://fr.web.img3.acsta.net/r_75_106/pictures/210/017/21001783_20130426165143363.jpg",
    "url": "/series/ficheserie_gen_cserie=12168.html",
    "name": "A Moody Christmas",
    "date": "2012",
    "from": "",
    "with": "Ian Meadows, Patrick Brammall\n"
  },
  {
    "id": "5228",
    "url_img": "http://fr.web.img5.acsta.net/r_75_106/medias/nmedia/18/69/18/31/18865066.jpg",
    "url": "/series/ficheserie_gen_cserie=5228.html",
    "name": "Grand prix",
    "date": "1977",
    "from": "",
    "with": ""
  },
  {
    "id": "8629",
    "url_img": "http://fr.web.img4.acsta.net/r_75_106/commons/emptymedia/Affichette_Recherche.gif",
    "url": "/series/ficheserie_gen_cserie=8629.html",
    "name": "La flèche brisée",
    "date": "1956",
    "from": "",
    "with": "John Lupton, Michael Ansara\n"
  }
]
```

get\_series\_sheets\_by\_name
-------

```javascript
client.get_series_sheets_by_name(console.log, 'arrow S01E01');
```

```json
{
  "name": "Arrow",
  "titles": "Episode 1 : Le retour du naufragé",
  "synopsis": "Le milliardaire Oliver Queen, présumé mort depuis un violent naufrage survenu cinq ans plus tôt, est retrouvé bien en vie dans une île perdue du Pacifique. De retour à Starling City, il est chaleureusement accueilli par Moira, sa mère dévouée, Thea, sa sœur bien-aimée, et Tommy, son meilleur ami. Même si Oliver s'efforce de cacher l'homme qu'il est devenu, son entourage sent que celui-ci a a été durement éprouvé par cet exil forcé. Repenti de ses erreurs passées, le jeune homme cherche la rédemption. Il tente notamment de se réconcilier avec son ex-petite amie, Laurel Lance. Tout en remettant de l'ordre dans sa vie, Oliver se crée une identité secrète, un Archer qui tente de réparer les torts causés par sa famille, combattre les maux de la société et restaurer l'ordre dans la ville. En journée, Oliver joue le riche héritier insouciant et négligent, amateur de jolies femmes, constamment suivi par son chauffeur-garde du corps, John Diggle, prenant soin de dissimuler sa double vie. Il lui faut prendre garde au père de Laurel, le détective Quentin Lance, qui est déterminé à arrêter le justicier qui agit dans l'ombre dans sa ville...",
  "first_play": "mercredi 10 oct 2012",
  "director": "David Nutter",
  "with": "Stephen Amell, David Ramsey",
  "writers": "Andrew Kreisberg , Marc Guggenheim",
  "casting": "Annie Ilonzeh  (Joanna De La Vega), Brian Markinson  (Adam Hunt), Colin Salmon  (Walter Steele)",
  "season": 1,
  "episode": 1,
  "date": "2012",
  "img": "DQoNCjwhRE9DVFlQRSBodG ... 2R5Pg0KPC9odG1sPg==",
  "result_weigth": 0.7142857142857143
}
```

get\_movies\_list
-------

```javascript
client.get _movies_list(console.log, 'interstellar');
```
```json
[
  {
    "url": "/film/fichefilm_gen_cfilm=114782.html",
    "name": "Interstellar",
    "date": "2014",
    "from": "Christopher Nolan",
    "with": "Matthew McConaughey, Anne Hathaway"
  },
  {
    "url": "/film/fichefilm_gen_cfilm=28426.html",
    "name": "Interstellar Pig",
    "date": "",
    "from": "Damon Santostefano",
    "with": ""
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
  "date": "2014",
  "from": "Christopher Nolan",
  "with": "Matthew McConaughey, Anne Hathaway",
  "genre": "Drame",
  "country": "américain",
  "synopsis": "Le film raconte les aventures d’un groupe d’explorateurs qui utilisent une faille récemment découverte dans l’espace-temps afin de repousser les limites humaines et partir à la conquête des distances astronomiques dans un voyage interstellaire.",
  "img": "DQoNCjwhRE9DVFlQRSBod ... b2R5Pg0KPC9odG1sPg==",
  "result_weigth": 0.7142857142857143
}
```

Dependencies
-------

Package | Version
--- |:---:
[http](https://www.npmjs.com/package/http) | 0.0.0
[path](https://www.npmjs.com/package/path) | 0.12.7
[cheerio](https://www.npmjs.com/package/cheerio) | 1.0.0-rc.2

Author
-------

 - **Guillaume TORRESANI** : <gtorresa@student.42.fr>, [http://github.com/pitzzae](http://github.com/pitzzae)

License
-------

 - **MIT** : [LICENSE](https://github.com/pitzzae/allocine-crawler/blob/master/LICENSE)