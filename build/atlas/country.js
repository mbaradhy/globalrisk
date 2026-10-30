
/* ===== 14-day reserve for other countries: local chains, local currency, that country's official guidance ===== */
var KC_LIST={
 FR:{n:{fr:"France",en:"France"},cur:"EUR",loc:"fr-FR",row:1},
 BE:{n:{fr:"Belgique",en:"Belgium"},cur:"EUR",loc:"fr-BE",row:3,sh:[["Delhaize","delhaize.be"],["Decathlon","decathlon.be"],["Amazon","amazon.com.be"],["Brico","brico.be"],["MediaMarkt","mediamarkt.be"],["Fnac","fnac.be"]]},
 NL:{n:{fr:"Pays-Bas",en:"Netherlands"},cur:"EUR",loc:"nl-NL",row:2,sh:[["Albert Heijn","ah.nl"],["Decathlon","decathlon.nl"],["bol","bol.com"],["Gamma","gamma.nl"],["Coolblue","coolblue.nl"],["bol","bol.com"]]},
 DE:{n:{fr:"Allemagne",en:"Germany"},cur:"EUR",loc:"de-DE",row:6,sh:[["REWE","rewe.de"],["Decathlon","decathlon.de"],["Amazon","amazon.de"],["OBI","obi.de"],["MediaMarkt","mediamarkt.de"],["Otto","otto.de"]]},
 ES:{n:{fr:"Espagne",en:"Spain"},cur:"EUR",loc:"es-ES",row:0,sh:[["Carrefour","carrefour.es"],["Decathlon","decathlon.es"],["Amazon","amazon.es"],["Leroy Merlin","leroymerlin.es"],["MediaMarkt","mediamarkt.es"],["Fnac","fnac.es"]]},
 IT:{n:{fr:"Italie",en:"Italy"},cur:"EUR",loc:"it-IT",row:0,sh:[["Carrefour","carrefour.it"],["Decathlon","decathlon.it"],["Amazon","amazon.it"],["Leroy Merlin","leroymerlin.it"],["MediaWorld","mediaworld.it"],["IBS","ibs.it"]]},
 PT:{n:{fr:"Portugal",en:"Portugal"},cur:"EUR",loc:"pt-PT",row:0,sh:[["Continente","continente.pt"],["Decathlon","decathlon.pt"],["Amazon","amazon.es"],["Leroy Merlin","leroymerlin.pt"],["Worten","worten.pt"],["Fnac","fnac.pt"]]},
 FI:{n:{fr:"Finlande",en:"Finland"},cur:"EUR",loc:"fi-FI",row:0,sh:[["K-Ruoka","k-ruoka.fi"],["XXL","xxl.fi"],["Amazon","amazon.de"],["K-Rauta","k-rauta.fi"],["Verkkokauppa","verkkokauppa.com"],["Gigantti","gigantti.fi"]]},
 UK:{n:{fr:"Royaume-Uni",en:"United Kingdom"},cur:"GBP",sym:"£",loc:"en-GB",row:4,sh:[["Tesco","tesco.com"],["Decathlon","decathlon.co.uk"],["Amazon","amazon.co.uk"],["B&Q","diy.com"],["Currys","currys.co.uk"],["Argos","argos.co.uk"]]},
 US:{n:{fr:"États-Unis",en:"United States"},cur:"USD",sym:"$",loc:"en-US",row:5,sh:[["Walmart","walmart.com"],["REI","rei.com"],["Amazon","amazon.com"],["Home Depot","homedepot.com"],["Best Buy","bestbuy.com"],["Target","target.com"]]},
 CH:{n:{fr:"Suisse",en:"Switzerland"},cur:"CHF",sym:"CHF",loc:"de-CH",row:7,sh:[["Migros","migros.ch"],["Decathlon","decathlon.ch"],["Galaxus","galaxus.ch"],["Jumbo","jumbo.ch"],["Digitec","digitec.ch"],["Interdiscount","interdiscount.ch"]]},
 JP:{n:{fr:"Japon",en:"Japan"},cur:"JPY",sym:"¥",loc:"ja-JP",row:8,sh:[["AEON","aeon.com"],["mont-bell","montbell.jp"],["Amazon","amazon.co.jp"],["Cainz","cainz.com"],["Yodobashi","yodobashi.com"],["Bic Camera","biccamera.com"]]},
 SE:{n:{fr:"Suède",en:"Sweden"},cur:"SEK",sym:"kr",loc:"sv-SE",row:9,sh:[["ICA","ica.se"],["XXL","xxl.se"],["Amazon","amazon.se"],["Bauhaus","bauhaus.se"],["Elgiganten","elgiganten.se"],["Clas Ohlson","clasohlson.com"]]},
 NO:{n:{fr:"Norvège",en:"Norway"},cur:"NOK",sym:"kr",loc:"nb-NO",row:10,sh:[["Rema 1000","rema.no"],["XXL","xxl.no"],["Komplett","komplett.no"],["Obs Bygg","obsbygg.no"],["Elkjøp","elkjop.no"],["Clas Ohlson","clasohlson.com"]]},
 DK:{n:{fr:"Danemark",en:"Denmark"},cur:"DKK",sym:"kr",loc:"da-DK",row:0,sh:[["Nemlig","nemlig.com"],["Sportmaster","sportmaster.dk"],["Amazon","amazon.de"],["Bauhaus","bauhaus.dk"],["Elgiganten","elgiganten.dk"],["Proshop","proshop.dk"]]},
 PL:{n:{fr:"Pologne",en:"Poland"},cur:"PLN",sym:"zł",loc:"pl-PL",row:0,sh:[["Carrefour","carrefour.pl"],["Decathlon","decathlon.pl"],["Amazon","amazon.pl"],["Leroy Merlin","leroymerlin.pl"],["Media Expert","mediaexpert.pl"],["Empik","empik.com"]]}};
var KC_FX0={GBP:0.86,USD:1.1,CHF:0.94,JPY:165,SEK:11.3,NOK:11.6,DKK:7.46,PLN:4.25},kcFx=null;
function kcGuess(){var a=(typeof AREA!=="undefined"&&AREA&&(AREA.cc||AREA.country_code))||"";a=String(a).toUpperCase();if(a==="GB")a="UK";if(KC_LIST[a])return a;
  var m=/-([A-Z]{2})$/i.exec(navigator.language||"");var c=m?m[1].toUpperCase():"";if(c==="GB")c="UK";return KC_LIST[c]?c:"FR";}
function kcGet(){try{var c=localStorage.getItem("gra-kitc");if(c&&KC_LIST[c])return c;}catch(e){}return kcGuess();}
var KC=kcGet();
window.KITC={
 cur:function(){var c=KC_LIST[KC];if(c.cur==="EUR")return {code:"EUR",loc:c.loc};var r=(kcFx&&kcFx[c.cur])||KC_FX0[c.cur];return {code:c.cur,rate:r,sym:c.sym,loc:c.loc};},
 shops:function(){var c=KC_LIST[KC];if(!c.sh)return null;var k=["CAR","DEC","AMZ","LM","BOU","FNAC"],o={};k.forEach(function(x,i){o[x]={name:c.sh[i][0],url:"g",site:c.sh[i][1]};});
   o.PHA={name:{fr:"Pharmacie (sur place)",en:"Pharmacy (in person)"},url:null};return o;}};
function kcFxLoad(){if(kcFx||typeof relay!=="function")return;relay("fx",15000).then(function(j){if(j&&j.rates){kcFx=j.rates;window.dispatchEvent(new Event("kitc"));kcDraw();}},function(){});}
function kcRows(){var t=[].filter.call(document.querySelectorAll("#v-kit .tbl table"),function(x){return x.querySelectorAll("thead th").length===4;})[0];return t?t.querySelectorAll("tbody tr"):[];}
function kcDraw(){var v=document.getElementById("v-kit");if(!v)return;var hd=v.querySelector("header.top");if(!hd)return;var box=document.getElementById("kc-box");
  if(!box){box=document.createElement("section");box.id="kc-box";box.className="kc";hd.parentNode.insertBefore(box,hd.nextSibling);}
  var c=KC_LIST[KC],rows=kcRows(),row=rows[c.row],cu=window.KITC.cur();
  var cells=row?[].map.call(row.children,function(td){return td.innerHTML;}):[];
  var opts=Object.keys(KC_LIST).sort(function(a,b){return tx(KC_LIST[a].n).localeCompare(tx(KC_LIST[b].n));}).map(function(k){return '<option value="'+k+'"'+(k===KC?" selected":"")+'>'+esc(tx(KC_LIST[k].n))+'</option>';}).join("");
  box.innerHTML='<div class="kc-h"><label for="kc-s">'+esc(T2("Votre pays","Your country"))+'</label><select id="kc-s">'+opts+'</select>'+
   (cu.code!=="EUR"?'<span class="note">'+esc(T2("Prix français convertis : ","French prices converted: "))+'1 € ≈ '+(Math.round(cu.rate*100)/100).toLocaleString(cu.loc)+' '+esc(cu.sym)+(kcFx&&kcFx[cu.code]?' · '+T2("taux BCE","ECB rate"):' · '+T2("taux approximatif","approximate rate"))+'</span>':'')+'</div>'+
   (row?'<div class="kc-g"><div><small>'+esc(T2("Consigne officielle","Official guidance"))+(c.row===0?' · '+esc(T2("niveau UE, pas de consigne nationale dans notre tableau","EU level, no national guidance in our table")):'')+'</small><b>'+cells[1]+'</b></div><div><small>'+esc(T2("Eau","Water"))+'</small><b>'+cells[2]+'</b></div><div class="kc-n"><small>'+esc(T2("Points notables","Notable points"))+'</small><span>'+cells[3]+'</span></div></div>':'')+
   (c.sh?'<p class="note">'+esc(T2("Les liens « Acheter » cherchent chez : ","“Buy” links search at: "))+c.sh.filter(function(x,i,a){return a.map(function(y){return y[0];}).indexOf(x[0])===i;}).map(function(x){return esc(x[0]);}).join(" · ")+esc(T2(". Le plan reste de 14 jours, au-dessus de chaque minimum national.",". The plan stays at 14 days, above every national minimum."))+'</p>':'');
  var st=[].filter.call(v.querySelectorAll(".tbl"),function(x){var th=x.querySelectorAll("thead th");return th.length===3;})[0];if(st){var sec=st.closest("section")||st;sec.style.display=c.sh?"none":"";}
  document.getElementById("kc-s").onchange=function(){KC=this.value;try{localStorage.setItem("gra-kitc",KC);}catch(e){}window.dispatchEvent(new Event("kitc"));kcDraw();if(typeof kitLabels==="function")kitLabels();};}
document.addEventListener("click",function(e){if(e.target.closest('button[data-t="kit"]'))setTimeout(function(){kcDraw();kcFxLoad();},60);});
(function(){var o=setLang;setLang=function(l){o(l);setTimeout(kcDraw,60);};})();
setTimeout(function(){kcDraw();window.dispatchEvent(new Event("kitc"));},1300);
