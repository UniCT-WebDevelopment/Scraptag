var c = require("./costanti.json");
var sw = require('stopword');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const {readFile} = require('fs').promises;
//const getExif = require('exif');

class Valutazione {
    constructor(page, lang) {
        this.page = page;
        this.messages = require("./langs/" + lang + "/msg.json");
        this.obj = {
            "title": {
                "length": 0,
                "maxLength": c.maxT,
                "minLength": c.minT,
                "result": {
                    "value": 0,
                    "scale": 100
                },
                "message": ""
            },
            "description": {
                "length": 0,
                "maxLength": c.maxD,
                "minLength": c.minD,
                "result": {
                    "value": [],
                    "scale": 100
                },
                "message": ""
            },
            "robots": {
                "result": {
                    "value": 0,
                    "scale": 100
                },
                "message": ""
            },
            "url": {
                //"name": this.page.url,
                "length": 0,
                "maxLength": c.maxU,
                "result": {
                    "value": 0,
                    "scale": 100
                },
                "message": ""
            },
            "protocol": {
                "name": "",
                "result": {
                    "value": 0,
                    "scale": 100
                },
                "message": ""
            },
            "mainKeyword": {
                "name": "",
                "inDescription": false,
                "message": "",
                "result": {
                    "value": 0,
                    "scale": 100
                }
            },
            "keywords": [],
            "h1": {
                "length": 0,
                "maxLength": c.maxH1,
                "minLength": c.minH1,
                "message": "",
                "result": {
                    "value": 0,
                    "scale": 100
                },
                "unique": false
            },
            "h2": {
                "n": 0,
                "unique": false,
                "message": "",
                "result": {
                    "value": 0,
                    "scale": 100
                }
            },
            "img": {
                "n": 0,
                "withAlt": 0,
                "result": {
                    "value": 0,
                    "scale": 100
                }
            },
            "a": {
                "n": 0,
                "withTitle": 0,
                "result": {
                    "value": 0,
                    "scale": 100
                }
            },
            "css": {
                "link": {
                    "value": 0,
                    "message": "",
                    "position": ""
                },
                "tag": {
                    "value": 0,
                    "message": "",
                    "minify": false
                },
                "attribute": {
                    "value": 0,
                    "message": ""
                },
                "result": {
                    "value": 0,
                    "scale": 100
                }
            },
            "javascript": {
                "src": {
                    "value": 0,
                    "message": "",
                    "position": ""
                },
                "code": {
                    "value": 0,
                    "message": "",
                    "position": ""
                },
                "result": {
                    "value": 0,
                    "scale": 100
                }
            },
            "averageMetrics": {
                "value": 0,
                "scale": 100
            }
        };

    }

    average(arr) {
        var m = 0;
        for (var i = 0; i < arr.length; i++) {
            m += arr[i];
        }
        m = m / arr.length - 1;
        return m;
    }

    average2(a, b) {
        return Math.round((a + b) / 2);
    }

    percErr(stimato, esatto) {
        var n = Math.round(Math.abs(stimato - esatto) / esatto * 100);
        if (n >= 100) n = 100;
        if (stimato == 0) n = 0;
        return n;
    }

    minify(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].indexOf("/n") && arr[i].indexOf(" ")) return false;
            else return true;
        }
    }

    /*getURL(url){
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.addEventListener("load", function(){
            if(req.status<400){
                getExif(req.responseText);
            }
            else{
                console.log("Request failed: "+req.statusText);
            }
        });
        req.addEventListener("error", function(){
            console.log("Network error");
        });
        req.send(null);
    }*/

    getValues = async () => {

        //this.getURL("https://www.repstatic.it/content/nazionale/img/2020/03/03/220538395-e1020e02-7810-4358-8b28-71d763711d90.jpg");

        var metrics = new Array();

        //valutazione description
        var arrDesc = new Array();
        var b = this.average2(this.obj.description.maxLength, this.obj.description.minLength);
        for (var i = 0; i < this.page.metaDescription.length; i++) {
            if (this.page.metaDescription[i].length > 3) {
                arrDesc[i] = 100 - (this.percErr(this.page.metaDescription[i].length, b));
                this.obj.description.result.value = 100 - (this.percErr(this.page.metaDescription[i].length, b));
                if (this.page.metaDescription[i].length >= this.obj.description.minLength && this.page.metaDescription[i].length <= this.obj.description.maxLength) {
                    this.obj.description.message = this.messages.msg1;
                    this.obj.description.length = this.page.metaDescription[i].length;
                }

                var aux1 = this.page.metaDescription[i];
                var aux2 = aux1.split(' ');
                var aux3 = sw.removeStopwords(aux2, sw.it);
                this.obj.keywords = (aux3);
            }
        }
        metrics.push(this.average(arrDesc));

        //valutazione url
        this.obj.url.length = this.page.url.length;
        if (this.page.url.length > this.obj.url.maxLength) {
            this.obj.url.message = this.messages.msg3;
        }
        else {
            for (var j = 0; j < this.obj.keywords.length; j++) {
                var count = 0;
                if (this.obj.keywords[j].indexOf(this.page.url)) {
                    count++;
                }
            }
            if (count != 0) {
                this.obj.url.message = this.messages.msg4;
            }
            else {
                this.obj.url.message = this.message.msg5;
            }
        }

        var u = 100 - (this.percErr(this.page.url.length, (this.obj.url.maxLength / 2)));
        metrics.push(u);
        this.obj.url.result.value = u;

        //valutazione protocollo e parola-chiave principale
        if (this.page.protocol == "HTTPS") {
            this.obj.mainKeyword.name = this.page.url.substring(13, this.url.length - 3);
        }
        else {
            this.obj.mainKeyword.name = this.page.url.substring(12, this.page.url.length - 3);
        }

        this.obj.mainKeyword.name = this.obj.mainKeyword.name.replace(/\./gi, '');

        if (this.obj.keywords.indexOf(this.obj.mainKeyword.name) != -1) {
            this.obj.mainKeyword.inDescription = true;
            this.obj.mainKeyword.message = this.messages.msg7;
            this.obj.mainKeyword.result.value = 100;
        }
        else {
            this.obj.mainKeyword.message = this.messages.msg8;
        }

        if (this.page.url.substring(0, 5) == "https") {
            this.obj.protocol.name = "HTTPS";
            metrics.push(100);
        }
        else {
            this.obj.protocol.name = "HTTP";
            metrics.push(0);
        }

        for (var i = 0; i < this.obj.keywords.length; i++) {
            if (this.obj.keywords[i].indexOf("") != -1) {
                var x = this.obj.keywords.indexOf("");
                this.obj.keywords.splice(x, 1);
            }
        }

        //valutazione title
        if (this.page.title.length >= this.obj.title.minLength && this.page.title.length <= this.obj.title.maxLength) {
            this.obj.title.message = this.messages.msg9;
        }
        else {
            this.obj.title.message = this.messages.msg10;
        }
        var z = 100 - (this.percErr(this.page.title.length, (this.average2(this.obj.title.minLength, this.obj.title.maxLength))));
        this.obj.title.result.value = Math.round(z);
        this.obj.title.length = this.page.title.length;
        metrics.push(z);

        var aux1 = this.page.title.split(' ');
        var aux2 = sw.removeStopwords(aux1, sw.it);

        //valutazione h1
        if (this.page.h1.length == 0) {
            this.obj.h1.message = this.messages.msg11;
            this.obj.h1.result.value = 0;
            this.obj.h1.length = 0;
            metrics.push(0);
        }
        else {
            var arrH1 = new Array();
            var pt = new Array();
            var pk = new Array();
            var valori = new Array();
            for (var i = 0; i < this.page.h1.length; i++) {
                arrH1[i] = this.page.h1[i].length;
                //controllo elementi comuni tra title e h1
                var countT = 0;
                /*for (var k = 0; k < arrTitle.length; k++) {
                    if (arrTitle[k].indexOf(this.page.h1[i]) && arrTitle[k] != '' && arrTitle[k] != '/n') {
                        countT++;
                    }
                }
                if (countT > 1) {
                    pt.push(100);
                }
                else {
                    pt.push(0);
                }*/

                //controllo elementi comuni tra description e h1
                var countD = 0;
                for (var j = 0; j < this.obj.keywords.length; j++) {
                    if (this.obj.keywords[j].indexOf(this.page.h1[i])) {
                        countD++;
                    }
                }
                if (countD >= 1) {
                    pk.push(100);
                }
                else {
                    pk.push(0);
                }
                //controllo elementi comuni tra url e h1
                if (this.page.h1[i] == this.obj.mainKeyword) {
                    valori.push(100);
                }
                else {
                    valori.push(0);
                }
            }

            var media = this.average(arrH1);
            this.obj.h1.length = Math.round(media);
            media = 100 - (this.percErr(media, this.average2(this.obj.h1.minLength, this.obj.h1.maxLength)));
            this.obj.h1.result.value = Math.round(media);
            var mediapt = this.average(pt);
            var mediapk = this.average(pk);

            //mediapt = this.percErr(arrTitle.length, mediapt);
            mediapk = this.percErr(this.obj.keywords.length, mediapk);
            valori.push(mediapt);
            //valori.push(mediapk);

            //valutare se almeno 1 dei tag h1 è collocato in cima al body
            if (this.page.posH1.length >= 1) {
                valori.push(100);
            }
            else {
                valori.push(0);
            }

            if (media >= this.obj.h1.minLength && media <= this.obj.h1.maxLength) {
                this.obj.h1.message = this.messages.msg12;
            }
            else {
                this.obj.h1.message = this.messages.msg13;
            }

            valori.push(Math.round(media));

            if (this.page.h1.length == 1) {
                this.obj.h1.only = true;
                valori.push(100);
            }
            else {
                valori.push(0);
            }

            var h1 = 100 - (Math.round(this.average(valori)));
            this.obj.h1.result.value = h1;
            metrics.push(h1);
        }

        //valutazione h2
        this.obj.h2.n = this.page.h2.length;
        var arrH2 = new Array();

        if (this.page.h2.length == 1) {
            this.obj.h2.unique = true;
            this.obj.h2.message = this.messages.msg14;
            arrH2.push(100);
        }
        else {
            this.obj.h2.message = this.messages.msg15;
            arrH2.push(0);
        }

        for (var i = 0; i < this.page.h2.length; i++) {
            var count = 0;
            for (var j = 0; j < this.obj.keywords.length; j++) {
                if (this.obj.keywords[j].indexOf(this.page.h2[i])) {
                    countD++;
                }
            }
            if (countD >= 1) {
                arrH2.push(100);
            }
            else {
                arrH2.push(0);
            }
        }

        var r = Math.round(this.average(arrH2));
        this.obj.h2.result.value = r;
        metrics.push(r);

        //valutazione robot
        if (this.page.metaRobots.length == 0) {
            this.obj.robots.message = this.messages.msg16;
            this.obj.robots.result.value = 0;
            metrics.push(0);
        }
        else {
            this.obj.robots.message = this.messages.msg17;
            this.obj.robots.result.value = 100;
            metrics.push(100);
        }

        //valutazione presenza title in a
        var totA = this.page.a.length;
        this.obj.a.n = totA;
        var aTitle = this.page.at.length;
        this.obj.a.withTitle = aTitle;
        var valA = 100 - (this.percErr(totA, aTitle));
        this.obj.a.result.value = valA;
        metrics.push(valA);

        //valutazione css
        var arrCss = new Array();
        this.obj.css.link.value = this.page.cssBody.length + this.page.cssInt.length;
        var esatto = this.obj.css.link.value;
        if (this.obj.css.link.value == 0) {
            this.obj.css.link.message = this.messages.msg18;
            this.obj.css.link.position = this.messages.msg19;
            arrCss.push(0);
        }
        else if (this.page.cssBody.length == 1) {
            this.obj.css.link.message = this.messages.msg20;
            this.obj.css.link.position = this.message.msg21;
            arrCss.push(0);
        }
        else if (this.page.cssInt.length == 1) {
            this.obj.css.link.message = this.messages.msg20;
            this.obj.css.link.position = this.messages.msg23;
            arrCss.push(100);
        }
        else {
            this.obj.css.link.message = this.messages.msg24;
            if (this.page.cssInt.length > 0 && this.page.cssBody.length > 0) {
                this.obj.css.link.position = this.messages.msg25;
                arrCss.push(50);
            }
            else if (this.page.cssInt.length == 0 && this.page.cssBody.length > 0) {
                this.obj.css.link.position = this.messages.msg26;
                arrCss.push(0);
            }
            else {
                this.obj.css.link.position = this.messages.msg26;
                arrCss.push(0);
            }
        }

        this.obj.css.tag.value = this.page.cssTag.length;
        var stimato = this.obj.css.tag.value;
        if (this.obj.css.tag.value > 0) {
            this.obj.css.tag.message = this.messages.msg27;
            arrCss.push(0);
        }
        else {
            this.obj.css.tag.message = this.messages.msg28;
            arrCss.push(100);
        }

        this.obj.css.attribute.value = this.page.cssAttr.length;
        stimato = stimato + this.obj.css.attribute.value + esatto;
        if (this.obj.css.attribute.value > 1) {
            this.obj.css.attribute.message = this.messages.msg29;
        }
        else if (this.obj.css.attribute.value == 0) {
            this.obj.css.attribute.message = this.messages.msg30;
        }
        else {
            this.obj.css.attribute.message = this.messages.msg31;
        }

        if (this.minify(this.page.cssTag)) {
            this.obj.css.tag.minify = true;
            arrCss.push(100);
        }
        else {
            arrCss.push(0);
        }

        var c = 100 - (this.percErr(stimato, esatto));
        metrics.push(c);
        this.obj.css.result.value = c;

        //valutazione link javascript
        if (this.page.scriptIntsrc.length == 0 && this.page.scriptBodysrc.length > 0) {
            this.obj.javascript.src.value = this.page.scriptBodysrc.length;
            this.obj.javascript.src.position = this.messages.msg26;
            if (this.obj.javascript.src.value == 1) {
                this.obj.javascript.sressage = this.messages.msg32;
            }
        }
        else if (this.page.scriptIntsrc.length > 0 && this.page.scriptBodysrc.length == 0) {
            this.obj.javascript.src.position = this.messages.msg23;
            this.obj.javascript.src.value = this.page.scriptIntsrc.length;
            if (this.obj.javascript.src.value == 1) {
                this.obj.javascript.sressage = this.messages.msg32;
            }
        }
        else {
            this.obj.javascript.src.value = this.page.scriptIntsrc.length + this.page.scriptBodysrc.length;
            this.obj.javascript.src.position = this.messages.msg25;
            if (this.obj.javascript.src.value == 0) {
                this.obj.javascript.sressage = this.messages.msg33;
                this.obj.javascript.src.position = this.messages.msg19;
            }
        }

        //valutazione codice javascript
        if (this.page.scriptInt.length == 0 && this.page.scriptBody.length > 0) {
            this.obj.javascript.code.value = this.page.scriptBody.length;
            if (this.obj.javascript.code.value == 1) {
                this.obj.javascript.code.position = this.messages.msg21;
                this.obj.javascript.code.message = this.messages.msg32;
            }
            else {
                this.obj.javascript.code.position = this.messages.msg21;
                this.obj.javascript.code.message = this.messages.msg34;

            }

        }
        else if (this.page.scriptInt.length > 0 && this.page.scriptBody.length == 0) {
            this.obj.javascript.code.value = this.page.scriptInt.length;
            if (this.obj.javascript.code.value == 1) {
                this.obj.javascript.code.position = this.messages.msg23;
                this.obj.javascript.code.message = this.messages.msg32;
            }
            else {
                this.obj.javascript.code.position = this.messages.msg23;
                this.obj.javascript.code.message = this.messages.msg34;
            }
        }
        else {
            this.obj.javascript.code.value = this.page.scriptInt.length + this.page.scriptBody.length;
            if (this.obj.javascript.code.value == 0) {
                this.obj.javascript.code.position = this.messages.msg19;
                this.obj.javascript.code.message = this.messages.msg35;
            }
            else {
                this.obj.javascript.code.position = this.messages.msg25;
                this.obj.javascript.code.message = this.messages.msg36;
            }
        }

        var srcScript = this.page.scriptIntsrc.length + this.page.scriptBodysrc.length;
        var totScript = srcScript + this.page.scriptIntsrc.length + this.page.scriptBodysrc.length;
        var t = 100 - (this.percErr(srcScript, totScript))
        metrics.push(t);
        this.obj.javascript.result.value = t;

        //valutazione img
        this.obj.img.n = this.page.img.length;
        this.obj.img.withAlt = this.page.imgAlt.length;
        var i = 100 - (this.percErr(this.page.img.length, this.page.imgAlt.length));
        this.obj.img.result.value = i;
        if (i == 100) {
            this.obj.img.message = this.messages.msg37;
        }
        metrics.push(i);

        //valutazione generale della pagina
        this.obj.averageMetrics.value = Math.round(this.average(metrics));

        return this.obj;
    }
}


module.exports = Valutazione;