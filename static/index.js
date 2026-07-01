/*
*   pixel像素代码
*
*/
var code,platform,domStr="head";
function setDynamicCode(c){
    code = c;
}
function setDynamicPlatform(p){
    platform = p;
}
function injectScript(id,platform,targetDom=domStr){
    targetDom = targetDom ? document[domStr]:document.body;

    if(!document.querySelector(`script[id=${platform}${id}]`)){
        var pixelCode = Pixel()[platform](id);
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.id=platform+id;
        script.textContent = pixelCode;
        targetDom.appendChild(script);
        // var script1 = document.createElement('script');
        // script1.type = "text/javascript";
        // script1.textContent = `kwaiq.load(${json.kwai})`;
        // targetDom.appendChild(script1);
    }
}
var Pixel = function(obj,pixelId,type){
    return {
        fb:(pixelId)=>{
             return `!function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', \'${pixelId}\');
                fbq('track', 'PageView');

                var noscript = document.createElement('noscript');
                var img = document.createElement('img');
                img.setAttribute('height',1);
                img.setAttribute('width',1);
                img.style.display='none';
                img.src='https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1';
                noscript.appendChild(img);
                document.body.appendChild(noscript);`;
        },
        kwai:(pixelId)=>{
            return `!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.install=t():e.install=t()}("undefined"!=typeof window?window:self,(function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=72)}({72:function(e,t,n){"use strict";var o=this&&this.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var o,r=0,i=t.length;r<i;r++)!o&&r in t||(o||(o=Array.prototype.slice.call(t,0,r)),o[r]=t[r]);return e.concat(o||Array.prototype.slice.call(t))};Object.defineProperty(t,"__esModule",{value:!0});var r=function(e,t,n){var o,i=e.createElement("script");i.type="text/javascript",i.async=!0,i.src=t,n&&(i.onerror=function(){r(e,n)});var a=e.getElementsByTagName("script")[0];null===(o=a.parentNode)||void 0===o||o.insertBefore(i,a)};!function(e,t,n){e.KwaiAnalyticsObject=n;var i=e[n]=e[n]||[];i.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];var a=function(e,t){e[t]=function(){for(var n=[],r=0;r<arguments.length;r++)n[r]=arguments[r];var i=o([t],n,!0);e.push(i)}};i.methods.forEach((function(e){a(i,e)})),i.instance=function(e){var t,n=(null===(t=i._i)||void 0===t?void 0:t[e])||[];return i.methods.forEach((function(e){a(n,e)})),n},i.load=function(e,o){var a="https://s21-def.ap4r.com/kos/s101/nlav112572/pixel/events.js";i._i=i._i||{},i._i[e]=[],i._i[e]._u=a,i._t=i._t||{},i._t[e]=+new Date,i._o=i._o||{},i._o[e]=o||{};var c="?sdkid=".concat(e,"&lib=").concat(n);r(t,a+c,"https://s21-def.ks-la.net/kos/s101/nlav112572/pixel/events.js"+c)}}(window,document,"kwaiq")}})}));`
        },
        tikTok:(pixelId)=>{
            return `!function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                    ttq.load(\"${pixelId}\");
                    ttq.page();
                }(window, document, 'ttq');`;
        },
        twq:(pixelId)=>{
            return `!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            twq('config',\'${pixelId}\');`;
        },
        event:{
            fb:{
                AddPaymentInfo:function(params){
                    obj && obj('track','AddPaymentInfo',params);
                },
                AddToCart:function(params){
                    obj && obj('track','AddToCart',params);
                },
                AddToWishlist:function(){
                    obj && obj('track','AddToWishlist',params);
                },
                CompleteRegistration:function(){
                    obj && obj('track','CompleteRegistration',params);
                },
                Contact:function(params){
                    obj && obj('track','Contact',params);
                },
                CustomizeProduct:function(params){
                    obj && obj('track','CustomizeProduct',params);
                },
                Donate:function(params){
                    obj && obj('track','Donate',params);
                },
                FindLocation:function(params){
                    obj && obj('track','FindLocation',params);
                },
                InitiateCheckout:function(params){
                    obj && obj('track','InitiateCheckout',params);
                },
                Lead:function(params){
                    obj && obj('track','Lead',params);
                },
                Purchase:function(params){
                    obj && obj('track','Purchase',params);
                },
                Schedule:function(params){
                    obj && obj('track','Schedule',params);
                },
                Search:function(params){
                    obj && obj('track','Search',params);
                },
                StartTrial:function(params){
                    obj && obj('track','StartTrial',params);
                },
                SubmitApplication:function(params){
                    obj && obj('track','SubmitApplication',params);
                },
                Subscribe:function(params){
                    obj && obj('track','Subscribe',params);
                },
                ViewContent:function(params){
                    obj && obj('track','ViewContent',params);
                },
                trackCustom:function(eventName,params){
                    obj && obj('trackCustom',eventName,params || {})
                }
            },
            kwai:{
                EVENT_ADD_PAYMENT_INFO:function(params){
                    obj && obj.instance(pixelId).track('addPaymentInfo',params);
                },
                EVENT_ADD_TO_CART:function(params){
                    obj && obj.instance(pixelId).track('addToCart',params);
                },
                EVENT_BUTTON_CLICK:function(params){
                    obj && obj.instance(pixelId).track('buttonClick',params);
                },
                EVENT_PURCHASE:function(params){
                    obj && obj.instance(pixelId).track('purchase',params);
                },
                EVENT_CONTENT_VIEW:function(params){
                    obj && obj.instance(pixelId).track('contentView',params);
                },
                EVENT_DOWNLOAD:function(params){
                    obj && obj.instance(pixelId).track('download',params);
                },
                EVENT_FORM_SUBMIT:function(params){
                    obj && obj.instance(pixelId).track('formSubmit',params);
                },
                EVENT_INITIATED_CHECKOUT:function(params){
                    obj && obj.instance(pixelId).track('initiatedCheckout',params);
                },
                EVENT_CONTACT:function(params){
                    obj && obj.instance(pixelId).track('contact',params);
                },
                EVENT_PLACE_ORDER:function(params){
                    obj && obj.instance(pixelId).track('placeOrder',params);
                },
                EVENT_SEARCH:function(params){
                    obj && obj.instance(pixelId).track('search',params);
                },
                EVENT_COMPLETE_REGISTRATION:function(params){
                    obj && obj.instance(pixelId).track('completeRegistration',params);
                },
                EVENT_ADD_TO_WISHLIST:function(params){
                    obj && obj.instance(pixelId).track('addToWishlist',params);
                },
                EVENT_SUBSCRIBE:function(params){
                    obj && obj.instance(pixelId).track('subscribe',params);
                },
                EVENT_FIRST_DEPOSIT:function(params){
                    obj && obj.instance(pixelId).track('firstDeposit',params);
                },
                EVENT_CREDIT_APPROVAL:function(params){
                    obj && obj.instance(pixelId).track('creditApproval',params);
                },                
                EVENT_LOAN_APPLICATION:function(params){
                    obj && obj.instance(pixelId).track('loanApplication',params);
                },
                EVENT_LOAN_CREDIT:function(params){
                    obj && obj.instance(pixelId).track('loanCredit',params);
                },
                EVENT_LOAN_DISBURSAL:function(params){
                    obj && obj.instance(pixelId).track('loanDisbursal',params);
                },
                EVENT_CREDIT_CARD_APPLICATION:function(params){
                    obj && obj.instance(pixelId).track('creditCardApplication',params);
                },
                EVENT_VALUE_PRODUCE:function(params){
                    obj && obj.instance(pixelId).track('valueProduce',params);
                },
                EVENT_KEY_INAPP_EVENT:function(params){
                    obj && obj.instance(pixelId).track('keyInappEvent',params);
                },
                EVENT_KEY_INAPP_EVENT_1:function(params){
                    obj && obj.instance(pixelId).track('keyInappEvent1',params);
                },
                EVENT_KEY_INAPP_EVENT_2:function(params){
                    obj && obj.instance(pixelId).track('keyInappEvent2',params);
                },
                EVENT_KEY_INAPP_EVENT_3:function(params){
                    obj && obj.instance(pixelId).track('keyInappEvent3',params);
                },
                EVENT_AD_VIEW:function(params){
                    obj && obj.instance(pixelId).track('adView',params);
                },
                EVENT_AD_CLICK:function(params){
                    obj && obj.instance(pixelId).track('adClick',params);
                },
                EVENT_PURCHASE_1_DAY:function(params){
                    obj && obj.instance(pixelId).track('purchase1Day',params);
                },
                EVENT_PURCHASE_2_DAY:function(params){
                    obj && obj.instance(pixelId).track('purchase2Day',params);
                },
                EVENT_PURCHASE_3_DAY:function(params){
                    obj && obj.instance(pixelId).track('purchase3Day',params);
                },
                EVENT_PURCHASE_7_DAY:function(params){
                    obj && obj.instance(pixelId).track('purchase7Day',params);
                },
                EVENT_COMPLETE_TRANSACTION:function(params){
                    obj && obj.instance(pixelId).track('completeTransaction',params);
                }           
            },
            tikTok:{
                ViewContent:function(params){
                    obj && obj.track('ViewContent',params);
                },
                Search:function(params){
                    obj && obj.track('Search',params);
                },
                AddToWishlist:function(params){
                    obj && obj.track('AddToWishlist',params);
                },
                AddToCart:function(params){
                    obj && obj.track('AddToCart',params);
                },
                InitiateCheckout:function(params){
                    obj && obj.track('InitiateCheckout',params);
                },
                AddPaymentInfo:function(params){
                    obj && obj.track('AddPaymentInfo',params);
                },
                Purchase:function(params){
                    obj && obj.track('Purchase',params);
                },
                Contact:function(params){
                    obj && obj.track('Contact',params);
                },
                Download:function(params){
                    obj && obj.track('Download',params);
                },
                Lead:function(params){
                    obj && obj.track('Lead',params);
                },
                CompleteRegistration:function(params){
                    obj && obj.track('CompleteRegistration',params);
                },
                Subscribe:function(params){
                    obj && obj.track('Subscribe',params);
                },
                CustomizeProduct:function(params){
                    obj && obj.track('CustomizeProduct',params);
                },
                FindLocation:function(params){
                    obj && obj.track('FindLocation',params);
                },
                Schedule:function(params){
                    obj && obj.track('Schedule',params);
                },
                ApplicationApproval:function(params){
                    obj && obj.track('ApplicationApproval',params);
                },
                StartTrial:function(params){
                    obj && obj.track('StartTrial',params);
                },
                SubmitApplication:function(params){
                    obj && obj.track('SubmitApplication',params);
                }           
            },
            twq:{
                fireById:(eventId, params)=>{
                    obj && obj('event',eventId,params)
                }
            },
            onPageView:()=>{
                switch(type){
                    case "fb":
                        obj && obj('track','ViewContent',params);
                        break;
                    case "kwai":
                        obj && obj.instance(pixelId).track('contentView',params);
                        break;
                    case "tikTok":
                        obj && obj.track('ViewContent',params);
                        break;
                }
            }
        }
    }
}
const targetDom = domStr ? document[domStr]:document.body;
const searchParams = new URLSearchParams(location.search);
function popStateEnv(){
            var json = {};
            if(searchParams.get("type")){
                var pixelId = searchParams.get("type");
                try{
                     json = JSON.parse(pixelId);
                }catch(e){
                    var standardJsonFormat = pixelId.replace(/(\{|,)(\w+)(:)/g,'$1"$2"$3');
                    try{
                         json = JSON.parse(standardJsonFormat);
                    }catch(_e){
                        standardJsonFormat = standardJsonFormat.replace(/(:)(\w+)/,'$1\"$2\"');
                        try {
                            json = JSON.parse(standardJsonFormat);
                        }catch(_e){
                            console.log("无法解析json参数")
                        }
                    }
                }
                
                if(json.fb){    //fb像素代码
                    setDynamicCode(json.fb);
                    setDynamicPlatform("fb");
                    injectScript(json.fb,"fb",targetDom);
                }
                if(json.kwai){
                    setDynamicCode(json.kwai);
                    setDynamicPlatform("kwai");
                    injectScript(json.kwai,"kwai",targetDom);
                    if (window.kwaiq && typeof window.kwaiq.instance === 'function') {
                        window.kwaiq.load(json.kwai);
                        window.kwaiq.page();
                        //window.kwaiq.instance(json.kwai).track('contentView');
                        //window.kwaiq.instance(json.kwai).track('download');
                    }

                }
                if(json.tikTok){
                    setDynamicCode(json.tikTok);
                    setDynamicPlatform("tikTok");
                    injectScript(json.tikTok,"tikTok",targetDom);

                }
                if(json.twq){
                    setDynamicCode(json.twq);
                    setDynamicPlatform("twq");
                    injectScript(json.twq,"twq",targetDom);
                }
            }
            return json;
        }
// popStateEnv();
// window.addEventListener("popstate",popStateEnv);

function downloadResource(url){
    var a = document.createElement('a');
    a.href=url;
    //a.href = URL.createObjectURL(url);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function downloadBlob(blob, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); // 这里才能用 createObjectURL
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href); // 释放内存
}