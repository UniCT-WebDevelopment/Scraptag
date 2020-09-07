var express = require('express');
var router = express.Router();
const Scraper = require("../scraper");
const Valutazione = require("../valutazione");
/* GET home page. */

router.get("/:lang/seo-analysis", async function (req, res, next) {
  console.log(req.query.url);
  var lang = req.params.lang;
  const result = new Scraper(req.query.url);
  var pagina = await result.getResults();
  var val = new Valutazione(pagina, lang);
  
  res.send(await val.getValues());
});

module.exports = router;
