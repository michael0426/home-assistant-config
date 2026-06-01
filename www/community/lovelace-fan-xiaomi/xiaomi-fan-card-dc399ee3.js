/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var t=function(e,i){return t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])},t(e,i)};function e(e,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function s(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}var i=function(){return i=Object.assign||function(t){for(var e,i=1,s=arguments.length;i<s;i++)for(var n in e=arguments[i])Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t},i.apply(this,arguments)};function s(t,e,i,s){var n,o=arguments.length,r=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(r=(o<3?n(r):o>3?n(e,i,r):n(e,i))||r);return o>3&&r&&Object.defineProperty(e,i,r),r}function n(t){var e="function"==typeof Symbol&&Symbol.iterator,i=e&&t[e],s=0;if(i)return i.call(t);if(t&&"number"==typeof t.length)return{next:function(){return t&&s>=t.length&&(t=void 0),{value:t&&t[s++],done:!t}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),a=new Map;class l{constructor(t,e){if(this._$cssResult$=!0,e!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){let t=a.get(this.cssText);return o&&void 0===t&&(a.set(this.cssText,t=new CSSStyleSheet),t.replaceSync(this.cssText)),t}toString(){return this.cssText}}const c=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return new l(i,r)},h=(t,e)=>{o?t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((e=>{const i=document.createElement("style"),s=window.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=e.cssText,t.appendChild(i)}))},d=o?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new l("string"==typeof t?t:t+"",r))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var p;const u=window.trustedTypes,f=u?u.emptyScript:"",v=window.reactiveElementPolyfillSupport,g={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},m=(t,e)=>e!==t&&(e==e||t==t),_={attribute:!0,type:String,converter:g,reflect:!1,hasChanged:m};class b extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(t){var e;null!==(e=this.l)&&void 0!==e||(this.l=[]),this.l.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Eh(i,e);void 0!==s&&(this._$Eu.set(s,i),t.push(s))})),t}static createProperty(t,e=_){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const n=this[t];this[e]=s,this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||_}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(d(t))}else void 0!==t&&e.push(d(t));return e}static _$Eh(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}o(){var t;this._$Ep=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Em(),this.requestUpdate(),null===(t=this.constructor.l)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$Eg)&&void 0!==e?e:this._$Eg=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$Eg)||void 0===e||e.splice(this._$Eg.indexOf(t)>>>0,1)}_$Em(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Et.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const e=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return h(e,this.constructor.elementStyles),e}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ES(t,e,i=_){var s,n;const o=this.constructor._$Eh(t,i);if(void 0!==o&&!0===i.reflect){const r=(null!==(n=null===(s=i.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==n?n:g.toAttribute)(e,i.type);this._$Ei=t,null==r?this.removeAttribute(o):this.setAttribute(o,r),this._$Ei=null}}_$AK(t,e){var i,s,n;const o=this.constructor,r=o._$Eu.get(t);if(void 0!==r&&this._$Ei!==r){const t=o.getPropertyOptions(r),a=t.converter,l=null!==(n=null!==(s=null===(i=a)||void 0===i?void 0:i.fromAttribute)&&void 0!==s?s:"function"==typeof a?a:null)&&void 0!==n?n:g.fromAttribute;this._$Ei=r,this[r]=l(e,t.type),this._$Ei=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||m)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$Ei!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$Ep=this._$E_())}async _$E_(){this.isUpdatePending=!0;try{await this._$Ep}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach(((t,e)=>this[e]=t)),this._$Et=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$Eg)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$ES(e,this[e],t))),this._$EC=void 0),this._$EU()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var y;b.finalized=!0,b.elementProperties=new Map,b.elementStyles=[],b.shadowRootOptions={mode:"open"},null==v||v({ReactiveElement:b}),(null!==(p=globalThis.reactiveElementVersions)&&void 0!==p?p:globalThis.reactiveElementVersions=[]).push("1.3.1");const $=globalThis.trustedTypes,A=$?$.createPolicy("lit-html",{createHTML:t=>t}):void 0,w=`lit$${(Math.random()+"").slice(9)}$`,E="?"+w,S=`<${E}>`,x=document,k=(t="")=>x.createComment(t),C=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,P=/>/g,N=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,M=/'/g,U=/"/g,H=/^(?:script|style|textarea|title)$/i,R=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),j=Symbol.for("lit-noChange"),D=Symbol.for("lit-nothing"),z=new WeakMap,B=x.createTreeWalker(x,129,null,!1),I=(t,e)=>{const i=t.length-1,s=[];let n,o=2===e?"<svg>":"",r=L;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(r.lastIndex=h,l=r.exec(i),null!==l);)h=r.lastIndex,r===L?"!--"===l[1]?r=O:void 0!==l[1]?r=P:void 0!==l[2]?(H.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=N):void 0!==l[3]&&(r=N):r===N?">"===l[0]?(r=null!=n?n:L,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?N:'"'===l[3]?U:M):r===U||r===M?r=N:r===O||r===P?r=L:(r=N,n=void 0);const d=r===N&&t[e+1].startsWith("/>")?" ":"";o+=r===L?i+S:c>=0?(s.push(a),i.slice(0,c)+"$lit$"+i.slice(c)+w+d):i+w+(-2===c?(s.push(void 0),e):d)}const a=o+(t[i]||"<?>")+(2===e?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return[void 0!==A?A.createHTML(a):a,s]};class F{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const r=t.length-1,a=this.parts,[l,c]=I(t,e);if(this.el=F.createElement(l,i),B.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=B.nextNode())&&a.length<r;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith("$lit$")||e.startsWith(w)){const i=c[o++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+"$lit$").split(w),e=/([.?@])?(.*)/.exec(i);a.push({type:1,index:n,name:e[2],strings:t,ctor:"."===e[1]?X:"?"===e[1]?J:"@"===e[1]?Z:q})}else a.push({type:6,index:n})}for(const e of t)s.removeAttribute(e)}if(H.test(s.tagName)){const t=s.textContent.split(w),e=t.length-1;if(e>0){s.textContent=$?$.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],k()),B.nextNode(),a.push({type:2,index:++n});s.append(t[e],k())}}}else if(8===s.nodeType)if(s.data===E)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(w,t+1));)a.push({type:7,index:n}),t+=w.length-1}n++}}static createElement(t,e){const i=x.createElement("template");return i.innerHTML=t,i}}function V(t,e,i=t,s){var n,o,r,a;if(e===j)return e;let l=void 0!==s?null===(n=i._$Cl)||void 0===n?void 0:n[s]:i._$Cu;const c=C(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==c&&(null===(o=null==l?void 0:l._$AO)||void 0===o||o.call(l,!1),void 0===c?l=void 0:(l=new c(t),l._$AT(t,i,s)),void 0!==s?(null!==(r=(a=i)._$Cl)&&void 0!==r?r:a._$Cl=[])[s]=l:i._$Cu=l),void 0!==l&&(e=V(t,l._$AS(t,e.values),l,s)),e}class Y{constructor(t,e){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var e;const{el:{content:i},parts:s}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:x).importNode(i,!0);B.currentNode=n;let o=B.nextNode(),r=0,a=0,l=s[0];for(;void 0!==l;){if(r===l.index){let e;2===l.type?e=new W(o,o.nextSibling,this,t):1===l.type?e=new l.ctor(o,l.name,l.strings,this,t):6===l.type&&(e=new G(o,this,t)),this.v.push(e),l=s[++a]}r!==(null==l?void 0:l.index)&&(o=B.nextNode(),r++)}return n}m(t){let e=0;for(const i of this.v)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class W{constructor(t,e,i,s){var n;this.type=2,this._$AH=D,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cg=null===(n=null==s?void 0:s.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cg}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=V(this,t,e),C(t)?t===D||null==t||""===t?(this._$AH!==D&&this._$AR(),this._$AH=D):t!==this._$AH&&t!==j&&this.$(t):void 0!==t._$litType$?this.T(t):void 0!==t.nodeType?this.k(t):(t=>{var e;return T(t)||"function"==typeof(null===(e=t)||void 0===e?void 0:e[Symbol.iterator])})(t)?this.S(t):this.$(t)}A(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}k(t){this._$AH!==t&&(this._$AR(),this._$AH=this.A(t))}$(t){this._$AH!==D&&C(this._$AH)?this._$AA.nextSibling.data=t:this.k(x.createTextNode(t)),this._$AH=t}T(t){var e;const{values:i,_$litType$:s}=t,n="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=F.createElement(s.h,this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.m(i);else{const t=new Y(n,this),e=t.p(this.options);t.m(i),this.k(e),this._$AH=t}}_$AC(t){let e=z.get(t.strings);return void 0===e&&z.set(t.strings,e=new F(t)),e}S(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new W(this.A(k()),this.A(k()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cg=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class q{constructor(t,e,i,s,n){this.type=1,this._$AH=D,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=D}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(void 0===n)t=V(this,t,e,0),o=!C(t)||t!==this._$AH&&t!==j,o&&(this._$AH=t);else{const s=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=V(this,s[i+r],e,r),a===j&&(a=this._$AH[r]),o||(o=!C(a)||a!==this._$AH[r]),a===D?t=D:t!==D&&(t+=(null!=a?a:"")+n[r+1]),this._$AH[r]=a}o&&!s&&this.C(t)}C(t){t===D?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class X extends q{constructor(){super(...arguments),this.type=3}C(t){this.element[this.name]=t===D?void 0:t}}const K=$?$.emptyScript:"";class J extends q{constructor(){super(...arguments),this.type=4}C(t){t&&t!==D?this.element.setAttribute(this.name,K):this.element.removeAttribute(this.name)}}class Z extends q{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=V(this,t,e,0))&&void 0!==i?i:D)===j)return;const s=this._$AH,n=t===D&&s!==D||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==D&&(s===D||n);n&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class G{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){V(this,t)}}const Q=window.litHtmlPolyfillSupport;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var tt,et;null==Q||Q(F,W),(null!==(y=globalThis.litHtmlVersions)&&void 0!==y?y:globalThis.litHtmlVersions=[]).push("2.2.1");class it extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=((t,e,i)=>{var s,n;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let r=o._$litPart$;if(void 0===r){const t=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:null;o._$litPart$=r=new W(e.insertBefore(k(),t),t,void 0,null!=i?i:{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!1)}render(){return j}}it.finalized=!0,it._$litElement$=!0,null===(tt=globalThis.litElementHydrateSupport)||void 0===tt||tt.call(globalThis,{LitElement:it});const st=globalThis.litElementPolyfillSupport;null==st||st({LitElement:it}),(null!==(et=globalThis.litElementVersions)&&void 0!==et?et:globalThis.litElementVersions=[]).push("3.2.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const nt=t=>e=>"function"==typeof e?((t,e)=>(window.customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:s}=e;return{kind:i,elements:s,finisher(e){window.customElements.define(t,e)}}})(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,ot=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function rt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):ot(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function at(t){return rt({...t,state:!0})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const lt=({finisher:t,descriptor:e})=>(i,s)=>{var n;if(void 0===s){const s=null!==(n=i.originalKey)&&void 0!==n?n:i.key,o=null!=e?{kind:"method",placement:"prototype",key:s,descriptor:e(i.key)}:{...i,key:s};return null!=t&&(o.finisher=function(e){t(e,s)}),o}{const n=i.constructor;void 0!==e&&Object.defineProperty(i,s,e(s)),null==t||t(n,s)}}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var ct;const ht=null!=(null===(ct=window.HTMLSlotElement)||void 0===ct?void 0:ct.prototype.assignedElements)?(t,e)=>t.assignedElements(e):(t,e)=>t.assignedNodes(e).filter((t=>t.nodeType===Node.ELEMENT_NODE));function dt(t){const{slot:e,selector:i}=null!=t?t:{};return lt({descriptor:s=>({get(){var s;const n="slot"+(e?`[name=${e}]`:":not([name])"),o=null===(s=this.renderRoot)||void 0===s?void 0:s.querySelector(n),r=null!=o?ht(o,t):[];return i?r.filter((t=>t.matches(i))):r},enumerable:!0,configurable:!0})})}var pt,ut;!function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(pt||(pt={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(ut||(ut={}));var ft=["closed","locked","off"],vt=function(t,e,i,s){s=s||{},i=null==i?{}:i;var n=new Event(e,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return n.detail=i,t.dispatchEvent(n),n},gt=function(t){vt(window,"haptic",t)},mt=function(t,e,i,s){if(s||(s={action:"more-info"}),!s.confirmation||s.confirmation.exemptions&&s.confirmation.exemptions.some((function(t){return t.user===e.user.id}))||(gt("warning"),confirm(s.confirmation.text||"Are you sure you want to "+s.action+"?")))switch(s.action){case"more-info":(i.entity||i.camera_image)&&vt(t,"hass-more-info",{entityId:i.entity?i.entity:i.camera_image});break;case"navigate":s.navigation_path&&function(t,e,i){void 0===i&&(i=!1),i?history.replaceState(null,"",e):history.pushState(null,"",e),vt(window,"location-changed",{replace:i})}(0,s.navigation_path);break;case"url":s.url_path&&window.open(s.url_path);break;case"toggle":i.entity&&(function(t,e){(function(t,e,i){void 0===i&&(i=!0);var s,n=function(t){return t.substr(0,t.indexOf("."))}(e),o="group"===n?"homeassistant":n;switch(n){case"lock":s=i?"unlock":"lock";break;case"cover":s=i?"open_cover":"close_cover";break;default:s=i?"turn_on":"turn_off"}t.callService(o,s,{entity_id:e})})(t,e,ft.includes(t.states[e].state))}(e,i.entity),gt("success"));break;case"call-service":if(!s.service)return void gt("failure");var n=s.service.split(".",2);e.callService(n[0],n[1],s.service_data,s.target),gt("success");break;case"fire-dom-event":vt(t,"ll-custom",s)}};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _t={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},bt=t=>(...e)=>({_$litDirective$:t,values:e});class yt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const $t="ontouchstart"in window||navigator.maxTouchPoints>0||navigator.maxTouchPoints>0;class At extends HTMLElement{constructor(){super(),this.holdTime=500,this.held=!1,this.ripple=document.createElement("mwc-ripple")}connectedCallback(){Object.assign(this.style,{position:"absolute",width:$t?"100px":"50px",height:$t?"100px":"50px",transform:"translate(-50%, -50%)",pointerEvents:"none",zIndex:"999"}),this.appendChild(this.ripple),this.ripple.primary=!0,["touchcancel","mouseout","mouseup","touchmove","mousewheel","wheel","scroll"].forEach((t=>{document.addEventListener(t,(()=>{clearTimeout(this.timer),this.stopAnimation(),this.timer=void 0}),{passive:!0})}))}bind(t,e){if(t.actionHandler)return;t.actionHandler=!0,t.addEventListener("contextmenu",(t=>{const e=t||window.event;return e.preventDefault&&e.preventDefault(),e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0,e.returnValue=!1,!1}));const i=t=>{let e,i;this.held=!1,t.touches?(e=t.touches[0].pageX,i=t.touches[0].pageY):(e=t.pageX,i=t.pageY),this.timer=window.setTimeout((()=>{this.startAnimation(e,i),this.held=!0}),this.holdTime)},s=i=>{i.preventDefault(),["touchend","touchcancel"].includes(i.type)&&void 0===this.timer||(clearTimeout(this.timer),this.stopAnimation(),this.timer=void 0,this.held?vt(t,"action",{action:"hold"}):e.hasDoubleClick?"click"===i.type&&i.detail<2||!this.dblClickTimeout?this.dblClickTimeout=window.setTimeout((()=>{this.dblClickTimeout=void 0,vt(t,"action",{action:"tap"})}),250):(clearTimeout(this.dblClickTimeout),this.dblClickTimeout=void 0,vt(t,"action",{action:"double_tap"})):vt(t,"action",{action:"tap"}))};t.addEventListener("touchstart",i,{passive:!0}),t.addEventListener("touchend",s),t.addEventListener("touchcancel",s),t.addEventListener("mousedown",i,{passive:!0}),t.addEventListener("click",s),t.addEventListener("keyup",(t=>{13===t.keyCode&&s(t)}))}startAnimation(t,e){Object.assign(this.style,{left:`${t}px`,top:`${e}px`,display:null}),this.ripple.disabled=!1,this.ripple.active=!0,this.ripple.unbounded=!0}stopAnimation(){this.ripple.active=!1,this.ripple.disabled=!0,this.style.display="none"}}customElements.define("action-handler-boilerplate",At);const wt=(t,e)=>{const i=(()=>{const t=document.body;if(t.querySelector("action-handler-boilerplate"))return t.querySelector("action-handler-boilerplate");const e=document.createElement("action-handler-boilerplate");return t.appendChild(e),e})();i&&i.bind(t,e)},Et=bt(class extends yt{update(t,[e]){return wt(t.element,e),j}render(t){}}),St=["default","xiaomi_miio_fan"],xt={name:"",platform:St[0],entity:"",disable_animation:!1,force_sleep_mode_support:!1,hide_led_button:!1};window.customCards=window.customCards||[],window.customCards.push({type:"fan-xiaomi",name:"Xiaomi Fan Lovelace Card",preview:!0,description:"Xiaomi Smartmi Fan Lovelace card for HASS/Home Assistant."});const kt={angle:{prefix:"number.",suffix:"_oscillation_angle"},childLock:{prefix:"switch.",suffix:"_child_lock"},timer:{prefix:"number.",suffix:"_delay_off_countdown"},ledNumber:{prefix:"number.",suffix:"_led_brightness"},ledSelect:{prefix:"select.",suffix:"_led_brightness"},ledSwitch:{prefix:"switch.",suffix:"_led"},temperature:{prefix:"sensor.",suffix:"_temperature"},humidity:{prefix:"sensor.",suffix:"_humidity"},powerSupply:{prefix:"binary_sensor.",suffix:"_power_supply"}};let Ct=class extends it{constructor(){super(...arguments),this.isConfigureAsyncFinished=!1,this.deviceEntities={},this.supportedAttributes={angle:!0,childLock:!0,timer:!0,rotationAngle:!0,speedLevels:4,naturalSpeed:!0,supportedAngles:[30,60,90,120],sleepMode:!1,led:!1,speedIncreaseDecreaseButtons:!1}}static async getConfigElement(){return await import("./xiaomi-fan-card-editor-75693221.js"),document.createElement("fan-xiaomi-card-editor")}static getStubConfig(){return Object.assign(Object.assign({},xt),{name:"Xiaomi Fan"})}setConfig(t){if(!t.entity)throw new Error("You must specify an entity");this.config=Object.assign(Object.assign({},xt),t),this.isConfigureAsyncFinished=!1,this.hass&&this.configureAsync()}getModel(){return"default"===this.config.platform?null:this.hass.states[this.config.entity].attributes.model}setChildLock(t){this.deviceEntities.childLock?this.hass.callService("switch",t?"turn_on":"turn_off",{entity_id:this.deviceEntities.childLock}):this.hass.callService(this.config.platform,t?"fan_set_child_lock_on":"fan_set_child_lock_off")}getChildLock(){return this.deviceEntities.childLock?"on"===this.hass.states[this.deviceEntities.childLock].state:this.hass.states[this.config.entity].attributes.child_lock}setTimer(t){this.deviceEntities.timer?this.hass.callService("number","set_value",{entity_id:this.deviceEntities.timer,value:t}):this.hass.callService(this.config.platform,"fan_set_delay_off",{entity_id:this.config.entity,delay_off_countdown:t})}getTimer(){if(this.deviceEntities.timer){let t=Number(this.hass.states[this.deviceEntities.timer].state);const e=this.hass.states[this.deviceEntities.timer].attributes.max;return e&&t>e&&(t=Math.ceil(t/60)),t}return Number(this.hass.states[this.config.entity].attributes.delay_off_countdown)}setAngle(t){this.deviceEntities.angle?this.hass.callService("number","set_value",{entity_id:this.deviceEntities.angle,value:t}):this.hass.callService(this.config.platform,"fan_set_oscillation_angle",{entity_id:this.config.entity,angle:t})}getAngle(){return this.deviceEntities.angle?Number(this.hass.states[this.deviceEntities.angle].state):this.hass.states[this.config.entity].attributes.angle}setOscillation(t){this.hass.callService("fan","oscillate",{entity_id:this.config.entity,oscillating:t})}getOscillation(){return this.hass.states[this.config.entity].attributes.oscillating}getSpeedPercentage(){return Number(this.hass.states[this.config.entity].attributes.percentage)}getSpeedLevel(){const t=this.supportedAttributes.speedLevels;return Math.ceil(this.getSpeedPercentage()/100*t)}setPresetMode(t){"default"===this.config.platform?this.hass.callService("fan","set_preset_mode",{entity_id:this.config.entity,preset_mode:t}):"Nature"===t?this.hass.callService(this.config.platform,"fan_set_natural_mode_on",{entity_id:this.config.entity}):this.hass.callService(this.config.platform,"fan_set_natural_mode_off",{entity_id:this.config.entity})}getPresetMode(){var t,e;const i=this.hass.states[this.config.entity].attributes;return"default"===this.config.platform?null===(t=i.preset_mode)||void 0===t?void 0:t.toLowerCase():null===(e=i.mode)||void 0===e?void 0:e.toLowerCase()}setLed(t){this.deviceEntities.ledNumber?this.hass.callService("number","set_value",{entity_id:this.deviceEntities.ledNumber,value:t?100:0}):this.deviceEntities.ledSelect?this.hass.callService("select","select_option",{entity_id:this.deviceEntities.ledSelect,option:t?"bright":"off"}):this.deviceEntities.ledSwitch?t?this.hass.callService("switch","turn_on",{entity_id:this.deviceEntities.ledSwitch}):this.hass.callService("switch","turn_off",{entity_id:this.deviceEntities.ledSwitch}):this.hass.callService(this.config.platform,t?"fan_set_led_on":"fan_set_led_off",{entity_id:this.config.entity})}getLed(){return this.deviceEntities.ledNumber?Number(this.hass.states[this.deviceEntities.ledNumber].state)>0:this.deviceEntities.ledSelect?"off"!==this.hass.states[this.deviceEntities.ledSelect].state:this.deviceEntities.ledSwitch?"on"===this.hass.states[this.deviceEntities.ledSwitch].state:this.hass.states[this.config.entity].attributes.led_brightness<2}getTemperature(){if(this.deviceEntities.temperature)return this.hass.states[this.deviceEntities.temperature].state}getHumidity(){if(this.deviceEntities.humidity)return this.hass.states[this.deviceEntities.humidity].state}getPowerSupply(){if(this.deviceEntities.powerSupply)return"on"===this.hass.states[this.deviceEntities.powerSupply].state}async findDeviceEntities(){var t;const e=await this.hass.callWS({type:"config/entity_registry/list"}),i=e.find((t=>t.entity_id===this.config.entity));if(!i)return{};const s=e.filter((t=>t.device_id===i.device_id)),n={};for(const e of Object.keys(kt)){const{prefix:i,suffix:o}=kt[e];n[e]=null===(t=s.find((t=>t.entity_id.startsWith(i)&&t.entity_id.endsWith(o))))||void 0===t?void 0:t.entity_id}return n}checkFanFeatures(t){t.preset_mode&&t.preset_modes&&t.preset_modes.some((t=>"nature"===t.toLowerCase()))&&(this.supportedAttributes.naturalSpeed=!0)}checkFanAuxFeatures(){if(this.deviceEntities.angle){this.supportedAttributes.angle=!0;const t=this.hass.states[this.deviceEntities.angle].attributes;if(t.min&&t.max&&t.step){const e=[];for(let i=t.min;i<=t.max;i+=t.step)e.push(i);this.supportedAttributes.supportedAngles=e}}this.deviceEntities.timer&&(this.supportedAttributes.timer=!0),this.deviceEntities.childLock&&(this.supportedAttributes.childLock=!0),(this.deviceEntities.ledNumber||this.deviceEntities.ledSelect||this.deviceEntities.ledSwitch)&&(this.supportedAttributes.led=!0)}async configureAsync(){if("default"===this.config.platform){const t=this.hass.states[this.config.entity];if(!t)return;this.deviceEntities=await this.findDeviceEntities(),this.checkFanFeatures(t.attributes),this.checkFanAuxFeatures()}else{const t=this.hass.states[this.config.entity].attributes;["dmaker.fan.p15","dmaker.fan.p18","dmaker.fan.p33"].includes(t.model)&&(this.supportedAttributes.supportedAngles=[30,60,90,120,140]),["zhimi.fan.fa1"].includes(t.model)&&(this.supportedAttributes.speedIncreaseDecreaseButtons=!0,this.supportedAttributes.angle=!1,this.supportedAttributes.childLock=!1,this.supportedAttributes.rotationAngle=!1,this.supportedAttributes.speedLevels=3,this.supportedAttributes.naturalSpeed=!1,this.supportedAttributes.timer=!1),["leshow.fan.ss4"].includes(t.model)&&(this.supportedAttributes.angle=!1,this.supportedAttributes.childLock=!1,this.supportedAttributes.rotationAngle=!1,this.supportedAttributes.naturalSpeed=!1,this.supportedAttributes.sleepMode=!0),this.config.force_sleep_mode_support&&(this.supportedAttributes.sleepMode=!0)}this.isConfigureAsyncFinished=!0}shouldUpdate(t){if(!this.config)return!1;if(!this.isConfigureAsyncFinished&&this.hass)return this.configureAsync(),!1;const e=t.get("hass");return!(!e||!Object.values(this.deviceEntities).some((t=>e.states[t]!==this.hass.states[t])))||function(t,e,i){if(e.has("config")||i)return!0;if(t.config.entity){var s=e.get("hass");return!s||s.states[t.config.entity]!==t.hass.states[t.config.entity]}return!1}(this,t,!1)}render(){const t=this.hass.states[this.config.entity];return R`
      <ha-card
        .header=${this.config.name||(null==t?void 0:t.attributes.friendly_name)||""}
        @action=${this.handleAction}
        .actionHandler=${Et({})}
        tabindex="0"
        .label=${`Xiaomi Fan: ${this.config.entity||"No Entity Defined"}`}
      >
        ${void 0===t||"unavailable"===t.state?R`<hui-warning
              >Fan entity ${this.config.entity}
              ${"unavailable"===t.state?"is unavailable":"was not found"}.</hui-warning
            >`:this.renderContent()}
      </ha-card>
    `}renderContent(){const t=this.hass.states[this.config.entity],e=this.getSpeedPercentage(),i=this.getChildLock(),s=this.getOscillation(),n=this.getTimer(),o=this.getAngle(),r=this.getPresetMode(),a=this.getModel(),l=this.getLed(),c=this.getTemperature(),h=this.getHumidity(),d=this.getPowerSupply(),p=this.getSpeedLevel();return R` <div class="fan-xiaomi-panel" @click=${t=>t.stopPropagation()}>
      ${this.config.disable_animation?"":R`<div class="fanbox-container">
            <div class="var-sensors">
              ${void 0!==c?R`${c}°C<br />`:""}
              ${void 0!==h?R`${h}%<br />`:""}
            </div>
            ${void 0!==d?R`<div class="var-power-supply">
                  <ha-icon icon="mdi:power-plug-${d?"":"off-"}outline"></ha-icon>
                </div>`:""}
            <div class="fanbox ${"on"===t.state?"active":""} ${s?"oscillation":""}">
              <div class="blades level${"on"===t.state?Math.max(1,p):0}">
                <div class="b1 ang1"></div>
                <div class="b2 ang25"></div>
                <div class="b3 ang49"></div>
              </div>
              ${function(){const t=[];for(let e=1;e<73;e++)t.push(R`<div class="fan ang${e}"></div>`);for(let e=1;e<73;e+=2)t.push(R`<div class="fan1 ang${e}"></div>`);return t}()}
              <div class="c2"></div>
              <div class="c3 ${l?"active":""}">
                <span class="icon-waper">
                  <ha-icon icon="mdi:power"></ha-icon>
                </span>
              </div>
              <div class="c1" @click=${this.toggleOnOff}></div>
              ${this.supportedAttributes.rotationAngle?R`<div class="chevron left" @click=${this.rotateLeft}>
                      <span class="icon-waper">
                        <ha-icon icon="mdi:chevron-left"></ha-icon>
                      </span>
                    </div>
                    <div class="chevron right" @click=${this.rotateRight}>
                      <span class="icon-waper">
                        <ha-icon icon="mdi:chevron-right"></ha-icon>
                      </span>
                    </div>`:""}
            </div>
          </div>`}
      <div class="attr-row upper-container">
        ${void 0!==i?R`<div class="attr button-childlock" @click=${this.toggleChildLock}>
              <p class="attr-title">Child Lock</p>
              <p class="attr-value var-childlock">${i?"On":"Off"}</p>
            </div>`:""}
        ${this.supportedAttributes.angle?R`<div class="attr button-angle" @click=${this.toggleOscillationAngle}>
              <p class="attr-title">Angle(&deg;)</p>
              <p class="attr-value var-angle">${o}</p>
            </div>`:""}
        ${void 0!==n?R`<div class="attr button-timer" @click=${this.toggleTimer}>
              <p class="attr-title">Timer</p>
              <p class="attr-value var-timer">${function(t,e){let i="Off";if(t){const s=["dmaker.fan.p15"].includes(e)?t/60:t,n=Math.floor(s/60),o=Math.floor(s%60);i=n?o?`${n}h ${o}m`:`${n}h`:`${o}m`}return i}(n,a)}</p>
            </div>`:""}
      </div>

      <div class="op-row">
        ${this.supportedAttributes.speedIncreaseDecreaseButtons?R`<div class="op var-speedup" @click=${this.increaseSpeed}>
                <button>
                  <span class="icon-waper">
                    <ha-icon icon="mdi:fan-chevron-up"></ha-icon>
                  </span>
                  Speed up
                </button>
              </div>
              <div class="op var-speeddown" @click=${this.decreaseSpeed}>
                <button>
                  <span class="icon-waper">
                    <ha-icon icon="mdi:fan-chevron-down"></ha-icon>
                  </span>
                  Speed down
                </button>
              </div>`:R`<div class="op var-speed ${p>0&&"on"===t.state?"active":""}" @click=${this.toggleSpeedLevel}>
                <button>
                  <span class="icon-waper">
                    <ha-icon icon="mdi:numeric-${"on"===t.state?p:0}-box-outline"></ha-icon>
                  </span>
                  Speed
                </button>
              </div>
              <div class="op var-oscillating ${s?"active":""}" @click=${this.toggleOscillation}>
                <button>
                  <span class="icon-waper">
                    <ha-icon icon="mdi:debug-step-over"></ha-icon>
                  </span>
                  Oscillate
                </button>
              </div>`}
        ${this.supportedAttributes.naturalSpeed?R`<div
              class="op var-natural ${"nature"===r?"active":""}"
              @click=${this.toggleNatureMode}
            >
              <button>
                <span class="icon-waper">
                  <ha-icon icon="mdi:leaf"></ha-icon>
                </span>
                Natural
              </button>
            </div>`:""}
        ${this.supportedAttributes.sleepMode?R`<div class="op var-sleep ${1===e?"active":""}" @click=${this.toggleSleepMode}>
              <button>
                <span class="icon-waper">
                  <ha-icon icon="mdi:power-sleep"></ha-icon>
                </span>
                Sleep
              </button>
            </div>`:""}
        ${this.supportedAttributes.led&&!this.config.hide_led_button?R`<div class="op var-led ${l?"active":""}" @click=${this.toggleLed}>
              <button>
                <span class="icon-waper">
                  <ha-icon icon="mdi:lightbulb-outline"></ha-icon>
                </span>
                LED
              </button>
            </div>`:""}
      </div>
    </div>`}handleAction(t){this.hass&&this.config&&t.detail.action&&function(t,e,i,s){var n;"double_tap"===s&&i.double_tap_action?n=i.double_tap_action:"hold"===s&&i.hold_action?n=i.hold_action:"tap"===s&&i.tap_action&&(n=i.tap_action),mt(t,e,i,n)}(this,this.hass,this.config,t.detail.action)}toggleOnOff(){this.hass.callService("fan","toggle",{entity_id:this.config.entity})}rotateLeft(){this.hass.callService("fan","set_direction",{entity_id:this.config.entity,direction:"default"===this.config.platform?"reverse":"left"})}rotateRight(){this.hass.callService("fan","set_direction",{entity_id:this.config.entity,direction:"default"===this.config.platform?"forward":"right"})}toggleSpeedLevel(){const t=this.getSpeedLevel(),e=(t>=this.supportedAttributes.speedLevels?this.config.disable_animation?"off"===this.hass.states[this.config.entity].state?1:0:1:t+1)/this.supportedAttributes.speedLevels*100;this.hass.callService("fan","set_percentage",{entity_id:this.config.entity,percentage:e})}increaseSpeed(){this.hass.callService("fan","increase_speed",{entity_id:this.config.entity})}decreaseSpeed(){this.hass.callService("fan","decrease_speed",{entity_id:this.config.entity})}toggleOscillationAngle(){const t=this.getAngle();let e;const i=this.supportedAttributes.supportedAngles.indexOf(t);e=i>=0&&i<this.supportedAttributes.supportedAngles.length-1?this.supportedAttributes.supportedAngles[i+1]:this.supportedAttributes.supportedAngles[0],this.setAngle(e)}toggleTimer(){const t=this.getTimer(),e=Math.floor(t/60),i=e>=8?0:e+1;this.setTimer(60*i)}toggleChildLock(){const t=this.getChildLock();this.setChildLock(!t)}toggleNatureMode(){const t="nature"===this.getPresetMode();this.setPresetMode(t?"Normal":"Nature")}toggleSleepMode(){1===this.getSpeedPercentage()?this.hass.callService("fan","set_speed",{entity_id:this.config.entity,speed:"low"}):this.hass.callService("fan","set_percentage",{entity_id:this.config.entity,percentage:1})}toggleLed(){const t=this.getLed();this.setLed(!t)}toggleOscillation(){const t=this.getOscillation();this.setOscillation(!t)}static get styles(){const t=[];for(let e=1;e<73;e++)t.push(c`
        .ang${e} {
          transform: rotate(${5*(e-1)}deg);
        }
      `);return t.push(c`
      .offline {
        opacity: 0.3;
      }
      .loading {
        opacity: 0.6;
      }
      .icon {
        overflow: hidden;
        width: 2em;
        height: 2em;
        vertical-align: -0.15em;
        fill: gray;
      }
      .fan-xiaomi-panel {
        text-align: center;
      }
      p {
        margin: 0;
        padding: 0;
      }
      .title {
        margin-top: 20px;
        height: 35px;
        cursor: pointer;
      }
      .title p {
        margin: 0;
        padding: 0;
        font-weight: 700;
        font-size: 18px;
      }
      .title span {
        font-size: 9pt;
      }
      .attr-row {
        display: flex;
      }
      .attr-row .attr {
        width: 100%;
        padding-bottom: 2px;
        border-left: 1px solid #01be9e;
      }
      .attr-row .attr:first-child {
        border-left: none;
      }
      .attr-row .attr-title {
        font-size: 9pt;
      }
      .attr-row .attr-value {
        font-size: 14px;
      }
      .op-row {
        display: flex;
        padding: 10px;
        border-top: 3px solid #717376 !important;
      }
      .op-row .op {
        width: 100%;
      }
      .op-row .op button {
        outline: 0;
        border: none;
        background: 0 0;
        cursor: pointer;
      }
      .op-row .op .icon-waper {
        display: block;
        margin: 0 auto 5px;
        width: 30px;
        height: 30px;
      }
      .op-row .op.active button {
        color: #01be9e !important;
        text-shadow: 0 0 10px #01be9e;
      }
      .fanbox-container {
        position: relative;
      }
      .var-sensors {
        position: absolute;
        left: 10px;
        text-align: left;
        color: var(--secondary-text-color);
      }
      .var-power-supply {
        position: absolute;
        right: 10px;
        color: var(--secondary-text-color);
      }
      .fanbox {
        position: relative;
        margin: 10px auto;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: #80808061;
      }
      .fanbox.active.oscillation {
        animation: oscillate 8s infinite linear;
      }
      .blades div {
        position: absolute;
        margin: 15% 0 0 15%;
        width: 35%;
        height: 35%;
        border-radius: 100% 50% 0;
        background: #989898;
        transform-origin: 100% 100%;
      }
      .blades {
        width: 100%;
        height: 100%;
      }
      .fanbox.active .blades.level1 {
        transform-origin: 50% 50%;
        animation: blades 9s infinite linear;
        transform-box: fill-box !important;
      }
      .fanbox.active .blades.level2 {
        transform-origin: 50% 50%;
        animation: blades 7s infinite linear;
        transform-box: fill-box !important;
      }
      .fanbox.active .blades.level3 {
        transform-origin: 50% 50%;
        animation: blades 5s infinite linear;
        transform-box: fill-box !important;
      }
      .fanbox.active .blades.level4 {
        transform-origin: 50% 50%;
        animation: blades 3s infinite linear;
        transform-box: fill-box !important;
      }
      .fan {
        top: 0;
        transform-origin: 0 250%;
      }
      .fan,
      .fan1 {
        position: absolute;
        left: 0;
        margin-left: 50%;
        width: 1%;
        height: 20%;
        background: #fff;
      }
      .fan1 {
        top: 20%;
        transform-origin: 0 150%;
      }
      .c1 {
        top: 20%;
        left: 20%;
        width: 60%;
        height: 60%;
        border: 2px solid #fff;
        border-radius: 50%;
        cursor: pointer;
        background: #ffffff00;
      }
      .c1,
      .c2 {
        position: absolute;
        box-sizing: border-box;
      }
      .c2 {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 10px solid #f7f7f7;
        border-radius: 50%;
      }
      .c3 {
        position: absolute;
        top: 40%;
        left: 40%;
        box-sizing: border-box;
        width: 20%;
        height: 20%;
        border-radius: 50%;
        background: #fff;
        color: #ddd;
        border: 2px solid white;
        line-height: 24px;
      }
      .c3.active {
        border: 2px solid #8dd5c3;
      }
      .c3 span ha-icon {
        width: 100%;
        height: 100%;
      }
      .chevron {
        position: absolute;
        top: 0;
        height: 100%;
        opacity: 0;
      }
      .chevron:hover {
        opacity: 1;
      }
      .chevron.left {
        left: -30px;
        cursor: pointer;
      }
      .chevron.right {
        right: -30px;
        cursor: pointer;
      }
      .chevron span ha-icon {
        width: 30px;
        height: 100%;
      }
      .chevron span ha-icon {
        width: 30px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .button-angle,
      .button-childlock,
      .button-timer {
        cursor: pointer;
      }

      @keyframes blades {
        0% {
          transform: translate(0, 0) rotate(0);
        }
        to {
          transform: translate(0, 0) rotate(3600deg);
        }
      }
      @keyframes oscillate {
        0% {
          transform: perspective(10em) rotateY(0);
        }
        25% {
          transform: perspective(10em) rotateY(40deg);
        }
        50% {
          transform: perspective(10em) rotateY(0);
        }
        75% {
          transform: perspective(10em) rotateY(-40deg);
        }
        to {
          transform: perspective(10em) rotateY(0);
        }
      }
    `),t}};s([rt({attribute:!1})],Ct.prototype,"hass",void 0),s([at()],Ct.prototype,"deviceEntities",void 0),s([at()],Ct.prototype,"supportedAttributes",void 0),s([at()],Ct.prototype,"config",void 0),Ct=s([nt("fan-xiaomi")],Ct);export{R as $,Ct as F,e as _,i as a,s as b,bt as c,yt as d,rt as e,j as f,at as g,n as h,h as i,xt as j,nt as k,dt as l,vt as n,lt as o,St as p,c as r,it as s,_t as t,D as w};
