const cheerio = require("cheerio");
const axios = require("axios");
const Pagina = require("./pagina");


class Scraper {
  constructor(url) {
    this.siteUrl = url;
    this.page = new Pagina();
  }
  fetchData = async () => {
    const result = await axios.get(this.siteUrl);
    return cheerio.load(result.data);
  }

  getResults = async () => {
    const $ = await this.fetchData();
    this.page.url = this.siteUrl;

    $("head title").each((index, element) => {
      this.page.title = $(element).text();
    });

    $("head meta[name=description]").each((index, element) => {
      this.page.metaDescription.push($(element).attr('content'));
    });

    $("head meta[name=robots]").each((index, element) => {
      this.page.metaRobots.push($(element).attr('content'));
    });

    $("body a").each((index,element) => {
      this.page.at.push($(element).attr('title'));
    })

    $("body a").each((index,element) => {
      this.page.a.push($(element));
    })

    $("body h1").each((index, element) => {
      this.page.h1.push($(element).text());
    });

    $("body>h1").each((index,element) => {
      this.page.posH1.push($(element).text());
    })

    $("body h2").each((index,element) => {
      this.page.h2.push($(element).text());
    })

    $("body img").each((index, element) => {
      this.page.img.push($(element));
    });

    $("body img").each((index, element) => {
      this.page.imgAlt.push($(element).attr('alt'));
    });

    $("body img").each((index, element) =>{
      this.page.imgSrc.push($(element).attr('data-src'));
    });

    $("body link[type='text/css']").each((index, element) => {
      this.page.cssBody.push($(element).attr('href'));
    });

    $("head link[type='text/css']").each((index, element) => {
      this.page.cssInt.push($(element).attr('href'));
    });

    $("head style").each((index, element) => {
      this.page.cssTag.push($(element).html());
    })

    $("body style").each((index, element) => {
      this.page.cssTag.push($(element).html());
    })

    $("body div").each((index, element) => {
      this.page.cssAttr.push($(element).attr('style'));
    })

    $("body div h1,h2,div,a,span,form,img,footer,ul,p").each((index, element) => {
      this.page.cssAttr.push($(element).attr('style'));
    })

    $("head script").each((index,element) => {
      this.page.scriptInt.push($(element).html());
    })

    $("head script").each((index,element) => {
      this.page.scriptIntsrc.push($(element).attr('src'));
    })

    $("body script").each((index,element) => {
      this.page.scriptBody.push($(element).html());
    })

    $("body script").each((index,element) => {
      this.page.scriptBodysrc.push($(element).attr('src'));
    })

  
    for(var i=0; i<this.page.imgSrc.length; i++){
      if(this.page.imgSrc[i]!=undefined&&this.page.imgSrc[i].substr(0,4)=='http'){
        this.page.pictures.push(this.page.imgSrc[i]);
      }
    }
    
    return this.page;
  }
}

module.exports = Scraper;