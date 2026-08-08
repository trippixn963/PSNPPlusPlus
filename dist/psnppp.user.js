// ==UserScript==
// @name         PSNP++
// @namespace    psnppp.trippixn
// @version      2.3.0
// @description  PSNP+ with local patches, plus two-way cross-device sync for your game lists
// @author       Trippixn
// @match        https://psnprofiles.com/*
// @run-at       document-start
// @inject-into  page
// @sandbox      raw
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        unsafeWindow
// @connect      trippixn.com
// @connect      psnp-plus.huskycode.dev
// @connect      platprices.com
// @downloadURL  https://trippixn.com/psnppp.user.js
// @updateURL    https://trippixn.com/psnppp.meta.js
// ==/UserScript==


/* ====================================================================
   PSNP+ v11.14 by HusKyCode — vendored verbatim, with 4 local patch(es): rename-floating-menu, skip-remove-confirm, theme-floating-menu, theme-psnp-plus-accent
   ==================================================================== */

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "launchAfterDomContentLoaded": () => (/* binding */ launchAfterDomContentLoaded),
/* harmony export */   "launchImmediately": () => (/* binding */ launchImmediately)
/* harmony export */ });
/* harmony import */ var _modules_Base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _modules_Frontpage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(46);
/* harmony import */ var _modules_immediate_FrontpageImmediate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(50);
/* harmony import */ var _modules_Guide__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(52);
/* harmony import */ var _modules_Profile__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(60);
/* harmony import */ var _modules_immediate_ProfileImmediate__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(82);
/* harmony import */ var _modules_Trophies__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(83);
/* harmony import */ var _modules_immediate_TrophiesImmediate__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(85);
/* harmony import */ var _modules_GameLeaderboard__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(86);
/* harmony import */ var _modules_Games__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(87);
/* harmony import */ var _modules_Search__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(88);
/* harmony import */ var _modules_Sessions__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(89);
/* harmony import */ var _modules_Series__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(90);
/* harmony import */ var _modules_100club__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(91);
/* harmony import */ var _modules_Trophy__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(92);
/* harmony import */ var _modules_Leaderboard__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(94);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(12);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(19);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(5);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(34);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(21);
/* harmony import */ var _modules_immediate_BaseImmediate__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(95);
/* harmony import */ var _modules_immediate_GuideImmediate__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(96);
/* harmony import */ var _modules_Guides__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(97);
























const featurePath = (0,_util_url__WEBPACK_IMPORTED_MODULE_16__.getPathSegments)()[0];
const pathSegment1 = (0,_util_url__WEBPACK_IMPORTED_MODULE_16__.getPathSegments)()[1];
const pathSegment2 = (0,_util_url__WEBPACK_IMPORTED_MODULE_16__.getPathSegments)()[2];
function launchImmediately() {
    console.debug('document-start launcher running. Feature path:', featurePath);
    new _modules_immediate_BaseImmediate__WEBPACK_IMPORTED_MODULE_21__.BaseImmediate(featurePath, pathSegment1, pathSegment2).run();
    switch (featurePath) {
        case 'guides':
        case 'leaderboard':
        case 'games':
        case 'trophy':
        case 'series':
        case 'lib':
        case 'login':
        case 'about':
        case 'account':
        case '100-club':
        case 'game-leaderboard':
        case 'search':
        case 'sessions':
        case 'session':
            // NOTE: We don't do anything here.
            break;
        case 'guide':
            new _modules_immediate_GuideImmediate__WEBPACK_IMPORTED_MODULE_22__.GuideImmediate(pathSegment2).run();
            break;
        case 'trophies':
            new _modules_immediate_TrophiesImmediate__WEBPACK_IMPORTED_MODULE_7__.TrophiesImmediate().run();
            break;
        default:
            if (featurePath != null) {
                new _modules_immediate_ProfileImmediate__WEBPACK_IMPORTED_MODULE_5__.ProfileImmediate().run();
            }
            else {
                new _modules_immediate_FrontpageImmediate__WEBPACK_IMPORTED_MODULE_2__.FrontpageImmediate(new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_18__.SettingsStorage()).run();
            }
            break;
    }
}
async function launchAfterDomContentLoaded() {
    const psnId = (0,_util_user__WEBPACK_IMPORTED_MODULE_17__.getPsnId)();
    const isMe = psnId === featurePath;
    console.debug('DOMContentLoaded launcher running. Feature path:', featurePath);
    await (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_19__.loadJqueryUi)();
    // Run Base module
    new _modules_Base__WEBPACK_IMPORTED_MODULE_0__.Base(psnId, new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_18__.SettingsStorage(), new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_20__.ScriptStateStorage()).run();
    switch (featurePath) {
        case 'lib':
        case 'login':
        case 'about':
        case 'account':
        case 'session':
            // NOTE: We don't do anything here.
            break;
        case 'leaderboard':
            new _modules_Leaderboard__WEBPACK_IMPORTED_MODULE_15__.Leaderboard().run();
            break;
        case '100-club':
            new _modules_100club__WEBPACK_IMPORTED_MODULE_13__.HundredClub().run();
            break;
        case 'game-leaderboard':
            new _modules_GameLeaderboard__WEBPACK_IMPORTED_MODULE_8__.GameLeaderboard(new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_18__.SettingsStorage()).run();
            break;
        case 'trophy':
            new _modules_Trophy__WEBPACK_IMPORTED_MODULE_14__.Trophy().run();
            break;
        case 'trophies':
            await new _modules_Trophies__WEBPACK_IMPORTED_MODULE_6__.Trophies(pathSegment2).run();
            break;
        case 'guide':
            await new _modules_Guide__WEBPACK_IMPORTED_MODULE_3__.Guide(pathSegment2).run();
            break;
        case 'games':
            new _modules_Games__WEBPACK_IMPORTED_MODULE_9__.Games(pathSegment1).run();
            break;
        case 'search':
            new _modules_Search__WEBPACK_IMPORTED_MODULE_10__.Search(pathSegment1).run();
            break;
        case 'series':
            new _modules_Series__WEBPACK_IMPORTED_MODULE_12__.Series(pathSegment2).run();
            break;
        case 'sessions':
            new _modules_Sessions__WEBPACK_IMPORTED_MODULE_11__.Sessions().run();
            break;
        case 'guides':
            new _modules_Guides__WEBPACK_IMPORTED_MODULE_23__.Guides(pathSegment1).run();
            break;
        default:
            // NOTE: featurePath is some username
            if (featurePath != null) {
                await (new _modules_Profile__WEBPACK_IMPORTED_MODULE_4__.Profile(isMe, featurePath, pathSegment1)).run();
            }
            else {
                new _modules_Frontpage__WEBPACK_IMPORTED_MODULE_1__.Frontpage(new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_18__.SettingsStorage()).run();
            }
            break;
    }
}


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Base": () => (/* binding */ Base)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _features_settings_SettingsPanel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19);
/* harmony import */ var _features_sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(17);
/* harmony import */ var _ui_ui_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(39);
/* harmony import */ var _features_plat_prices_PlatPricesStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(29);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(24);
/* harmony import */ var _features_update_UpdatePanel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(41);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(25);
/* harmony import */ var _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(30);
/* harmony import */ var _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(44);
/* harmony import */ var _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(45);












class Base {
    constructor(psnId, settingsStorage, scriptStateStorage) {
        this._psnId = psnId;
        this._settingsStorage = settingsStorage;
        this._scriptStateStorage = scriptStateStorage;
    }
    _getDropdownMenu() {
        return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.user-menu > div.dropdown > ul.dropdown-menu');
    }
    _appendButtonsInUserDropdown() {
        this._getDropdownMenu()
            .find('li', { containsText: 'Your Profile' })
            .after(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', `/${this._psnId}#gamelists`)
            .setText('Game Lists')));
    }
    _appendPsnppSettingsButton() {
        this._getDropdownMenu()
            .find('li', { containsText: 'Settings' })
            .after(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('PSNP+ Settings')
            .click((e) => {
            e.preventDefault();
            (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_4__.appendPanel)(new _features_settings_SettingsPanel__WEBPACK_IMPORTED_MODULE_1__.SettingsPanel());
        })));
    }
    _modifyUpdateProfileButton() {
        this._getDropdownMenu()
            .find('a', { containsText: 'Update Profile' })
            .setAttribute('href', (0,_util_user__WEBPACK_IMPORTED_MODULE_2__.getUpdateProfileRedirectPathname)(this._psnId, '/' + this._psnId));
    }
    _modifyGuidesLink() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div#header div.navigation a[href="/guides"]')
            .setAttribute('href', `/guides${_util_constants__WEBPACK_IMPORTED_MODULE_8__.HASH_ADVANCED_SEARCH}`);
    }
    _modifySessionsLink() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div#header div.navigation a[href="/sessions"]')
            .setAttribute('href', '/sessions?all');
    }
    _checkUpdate() {
        const version = this._scriptStateStorage.get('version');
        this._scriptStateStorage.set('version', "11.14");
        if (version !== "11.14") {
            (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_4__.appendPanel)(new _features_update_UpdatePanel__WEBPACK_IMPORTED_MODULE_7__.UpdatePanel());
        }
    }
    _appendScriptInfo() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.logo').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('style', `font-size: 9px; background: ${_util_constants__WEBPACK_IMPORTED_MODULE_8__.COLOR_PURPLE}; position: absolute; top: 42px; color: white; left: 15px;`)
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_8__.LINK_MAIN_THREAD)
            .setAttribute('target', '_blank')
            .setText(`PSNP+ v${"11.14"}`));
    }
    _detectServiceDown() {
        const isDown503 = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('h1', { equalsText: '503 Service Temporarily Unavailable' }).exists();
        const isDownHouston = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('h2.pull-right', { equalsText: 'Houston, We Have A Problem.' }).exists();
        const isDown = isDown503 || isDownHouston;
        if (isDown) {
            // NOTE: This essentially reloads the page without an actual reload (e.g. does not send form data again).
            // eslint-disable-next-line no-self-assign
            setTimeout(() => location.href = location.href, 5000);
        }
        return isDown;
    }
    run() {
        console.debug('Base module is running');
        if (this._detectServiceDown()) {
            return;
        }
        this._appendScriptInfo();
        this._checkUpdate();
        if (this._settingsStorage.get('automaticallyRedirectAfterUpdatingProfile')) {
            this._modifyUpdateProfileButton();
        }
        if (this._settingsStorage.get('guideShowAdvancedGuideSearchByDefault')) {
            this._modifyGuidesLink();
        }
        if (this._settingsStorage.get('gamingSessionsShowAllByDefault')) {
            this._modifySessionsLink();
        }
        this._appendButtonsInUserDropdown();
        this._appendPsnppSettingsButton();
        if (this._settingsStorage.get('gamingSessionsScraping')) {
            const sessionStorage = new _features_sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_3__.SessionStorage();
            sessionStorage.refresh()
                .then((didRefresh) => {
                if (didRefresh) {
                    console.debug('Sessions have been refreshed.');
                }
            })
                .catch((e) => console.debug('Failed to refresh sessions.', e));
        }
        if (this._settingsStorage.get('markUnobtainableTrophies')) {
            const utStorage = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_6__.UnobtainableTrophiesStorage();
            utStorage.refresh()
                .then((didRefresh) => {
                if (didRefresh) {
                    console.debug('Unobtainable trophies have been refreshed.');
                }
            })
                .catch((e) => console.debug('Failed to refresh unobtainable trophies.', e));
        }
        const donatorsStorage = new _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_10__.DonatorsStorage();
        donatorsStorage.refresh()
            .then((didRefresh) => {
            if (didRefresh) {
                console.debug('Donators have been refreshed.');
            }
        })
            .catch((e) => console.debug('Failed to refresh donators.', e));
        const shutdownsStorage = new _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_11__.ShutdownsStorage();
        shutdownsStorage.refresh()
            .then((didRefresh) => {
            if (didRefresh) {
                console.debug('Shutdowns have been refreshed.');
            }
        })
            .catch((e) => console.debug('Failed to refresh shutdowns.', e));
        if (this._settingsStorage.get('guideScrapeComplexity')) {
            const guideStorage = new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_9__.GuideStorage();
            guideStorage.refresh()
                .then((didRefresh) => {
                if (didRefresh) {
                    console.debug('Guides have been refreshed.');
                }
            })
                .catch((e) => console.debug('Failed to refresh guides.', e));
        }
        if (this._settingsStorage.get('platPricesIntegration')) {
            new _features_plat_prices_PlatPricesStorage__WEBPACK_IMPORTED_MODULE_5__.PlatPricesStorage().clearExpired();
        }
    }
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "J": () => (/* binding */ J),
/* harmony export */   "JC": () => (/* binding */ JC),
/* harmony export */   "all": () => (/* binding */ all)
/* harmony export */ });
function find(query, options, base = document) {
    let allElements = Array.from(base.querySelectorAll(query));
    if (options.containsText != null) {
        allElements = allElements.filter((el) => {
            const content = el.textContent == null ? '' : el.textContent;
            return RegExp(options.containsText).test(content);
        });
    }
    if (options.equalsText != null) {
        allElements = allElements.filter((el) => {
            const content = el.textContent == null ? '' : el.textContent;
            return options.equalsText === content;
        });
    }
    return allElements;
}
class J {
    constructor(base) {
        this._base = base;
    }
    static q(query, options = {}, base = document) {
        const allElements = find(query, options, base);
        if (allElements.length === 0) {
            return new J(null);
        }
        const chosenElement = options.eq === undefined
            ? allElements[0]
            : allElements[options.eq];
        return new J(chosenElement);
    }
    static c(tagname) {
        return new J(document.createElement(tagname));
    }
    find(query, options = {}) {
        if (this._base == null) {
            return this;
        }
        const allElements = find(query, options, this._base);
        if (allElements.length === 0) {
            this._base = null;
            return this;
        }
        this._base = options.eq === undefined
            ? allElements[0]
            : allElements[options.eq];
        return this;
    }
    append(...children) {
        children.forEach((x) => {
            if (x == null || this._base == null) {
                return;
            }
            const toAppend = typeof x === 'string'
                ? document.createTextNode(x)
                : x.get();
            this._base.appendChild(toAppend);
        });
        return this;
    }
    prepend(...children) {
        children.reverse().forEach((x) => {
            if (x == null || this._base == null || this._base.parentElement == null) {
                return;
            }
            const toAppend = typeof x === 'string'
                ? document.createTextNode(x)
                : x.get();
            this._base.insertBefore(toAppend, this._base.firstChild);
        });
        return this;
    }
    after(...children) {
        children.reverse().forEach((x) => {
            if (this._base == null) {
                return;
            }
            if (this._base.parentNode == null) {
                return;
            }
            const toAppend = typeof x === 'string'
                ? document.createTextNode(x)
                : x.get();
            this._base.parentNode.insertBefore(toAppend, this._base.nextSibling);
        });
        return this;
    }
    before(...children) {
        children.forEach((x) => {
            if (this._base == null) {
                return;
            }
            if (this._base.parentNode == null) {
                return;
            }
            const toAppend = typeof x === 'string'
                ? document.createTextNode(x)
                : x.get();
            this._base.parentNode.insertBefore(toAppend, this._base);
        });
        return this;
    }
    prev() {
        if (this._base == null) {
            return this;
        }
        this._base = this._base.previousElementSibling;
        return this;
    }
    closest(selector) {
        if (this._base == null) {
            return this;
        }
        this._base = this._base.closest(selector);
        return this;
    }
    next() {
        if (this._base == null) {
            return this;
        }
        this._base = this._base.nextElementSibling;
        return this;
    }
    isEmpty() {
        if (this._base == null) {
            return true;
        }
        return this._base.innerHTML.trim() === '';
    }
    empty() {
        if (this._base == null) {
            return this;
        }
        this._base.innerHTML = '';
        return this;
    }
    remove() {
        if (this._base == null) {
            return this;
        }
        if (this._base.parentNode == null) {
            return this;
        }
        this._base.parentNode.removeChild(this._base);
        return this;
    }
    getText() {
        if (this._base == null) {
            return '';
        }
        return this._base.textContent == null
            ? ''
            : this._base.textContent;
    }
    setText(text) {
        if (this._base == null) {
            return this;
        }
        this._base.textContent = text;
        return this;
    }
    getValue() {
        return this._base.value;
    }
    setValue(value) {
        this._base.value = value;
        return this;
    }
    getOuterHTML() {
        if (this._base == null) {
            return '';
        }
        return this._base.outerHTML;
    }
    setOuterHTML(value) {
        if (this._base == null) {
            return this;
        }
        this._base.outerHTML = value;
        return this;
    }
    getInnerHtml() {
        if (this._base == null) {
            return '';
        }
        return this._base.innerHTML;
    }
    setInnerHtml(value) {
        if (this._base == null) {
            return this;
        }
        this._base.innerHTML = value;
        return this;
    }
    getAttribute(attribute) {
        if (this._base == null) {
            return '';
        }
        const attributeValue = this._base.getAttribute(attribute);
        return attributeValue == null ? '' : attributeValue;
    }
    setAttribute(attribute, value) {
        if (this._base == null) {
            return this;
        }
        this._base.setAttribute(attribute, value);
        return this;
    }
    removeAttribute(attribute) {
        if (this._base == null) {
            return this;
        }
        this._base.removeAttribute(attribute);
        return this;
    }
    getClassName() {
        if (this._base == null) {
            return '';
        }
        return this._base.className;
    }
    toggleClass(className) {
        if (this._base == null) {
            return this;
        }
        this._base.classList.toggle(className);
        return this;
    }
    addClass(...classNames) {
        classNames.forEach((className) => {
            if (this._base == null) {
                return;
            }
            this._base.classList.add(className);
        });
        return this;
    }
    removeClass(className) {
        if (this._base == null) {
            return this;
        }
        this._base.classList.remove(className);
        return this;
    }
    hasClass(className) {
        if (this._base == null) {
            return false;
        }
        return this._base.classList.contains(className);
    }
    triggerClick() {
        if (this._base == null) {
            return this;
        }
        this._base.click();
        return this;
    }
    triggerKeypress(key) {
        if (this._base == null) {
            return this;
        }
        this._base.dispatchEvent(new KeyboardEvent('keypress', { key }));
        return this;
    }
    click(callback) {
        if (this._base == null) {
            return this;
        }
        this._base.addEventListener('click', (e) => callback(e, this));
        return this;
    }
    load(callback) {
        if (this._base == null) {
            return this;
        }
        this._base.addEventListener('load', (e) => callback(e, this));
        return this;
    }
    error(callback) {
        if (this._base == null) {
            return this;
        }
        this._base.addEventListener('error', (e) => callback(e, this));
        return this;
    }
    mouseenter(callback) {
        if (this._base == null) {
            return this;
        }
        this._base.addEventListener('mouseenter', (e) => callback(e, this));
        return this;
    }
    mouseleave(callback) {
        if (this._base == null) {
            return this;
        }
        this._base.addEventListener('mouseleave', (e) => callback(e, this));
        return this;
    }
    keyup(callback) {
        if (this._base == null) {
            return this;
        }
        this._base.addEventListener('keyup', (e) => callback(e, this));
        return this;
    }
    change(callback) {
        if (this._base == null) {
            return this;
        }
        this._base.addEventListener('change', (e) => callback(e, this));
        return this;
    }
    setCss(property, value) {
        if (this._base == null) {
            return this;
        }
        this._base.style[property] = value;
        return this;
    }
    exists() {
        return this._base != null;
    }
    parent() {
        if (this._base == null) {
            return this;
        }
        this._base = this._base.parentElement;
        return this;
    }
    show() {
        if (this._base == null) {
            return this;
        }
        this._base.style.display = '';
        return this;
    }
    hide() {
        if (this._base == null) {
            return this;
        }
        this._base.style.display = 'none';
        return this;
    }
    clone() {
        return new J(this._base);
    }
    get() {
        if (this._base == null) {
            throw new Error('Base element is null');
        }
        return this._base;
    }
    apply(runner) {
        if (this._base == null) {
            return this;
        }
        runner(this._base);
        return this;
    }
    condition(cond, runner) {
        if (!cond) {
            return this;
        }
        if (this._base == null) {
            return this;
        }
        runner(this);
        return this;
    }
}
class JC extends J {
    constructor(tagname) {
        super(J.c(tagname).get());
    }
}
function all(query, options = {}, base = document) {
    return find(query, options, base).map(x => new J(x));
}


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SettingsPanel": () => (/* binding */ SettingsPanel)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _SettingsStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _util_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
/* harmony import */ var _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(31);
/* harmony import */ var _sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(17);
/* harmony import */ var _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(32);
/* harmony import */ var _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(33);
/* harmony import */ var _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(36);
/* harmony import */ var _ui_panel_PanelBottom__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(37);
/* harmony import */ var _ISettings__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(6);
/* harmony import */ var _ui_panel_PanelSelect__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(38);
/* harmony import */ var _plat_prices_PlatPricesAPI__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(23);
/* harmony import */ var _plat_prices_PlatPricesStorage__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(29);
/* harmony import */ var _unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(24);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(25);
/* harmony import */ var _ui_ui_utils__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(39);
/* harmony import */ var _lists_ListRefreshPanel__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(40);
/* harmony import */ var _game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(20);
/* harmony import */ var _update_UpdatePanel__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(41);
/* harmony import */ var _util_async__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(42);
/* harmony import */ var _guide_GuideStorage__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(30);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(43);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(34);























class SettingsDataButtons extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(closePanelFunction) {
        super('div');
        this._closePanelFunction = closePanelFunction;
        this._build();
    }
    _build() {
        const fileInput = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('input')
            .setAttribute('type', 'file')
            .setAttribute('style', 'display: none;')
            .change(async (e) => {
            if (e == null || e.target == null) {
                return;
            }
            const target = e.target;
            if (target.files == null || target.files.length === 0) {
                return;
            }
            await (0,_util_data__WEBPACK_IMPORTED_MODULE_2__.importData)(target.files[0]);
            location.reload();
        });
        this
            .addClass('row', 'center-xs')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-2')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('button', 'green')
            .setAttribute('href', '#')
            .setText('Refresh Lists')
            .click((e) => {
            e.preventDefault();
            this._closePanelFunction();
            (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_15__.appendPanel)(new _lists_ListRefreshPanel__WEBPACK_IMPORTED_MODULE_16__.ListRefreshPanel());
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-2')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('button', 'yellow')
            .setAttribute('href', '#')
            .setText('Clear')
            .click((e) => {
            e.preventDefault();
            const confirmed = confirm('Are you sure you want to clear all your PSNP+ data? This operation is irreversible.');
            if (!confirmed) {
                return;
            }
            (0,_util_data__WEBPACK_IMPORTED_MODULE_2__.clearData)();
            location.reload();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-2')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('button', 'blue')
            .setAttribute('href', '#')
            .setText('Export')
            .click(async (e) => {
            e.preventDefault();
            await (0,_util_async__WEBPACK_IMPORTED_MODULE_19__.safeRun)(() => (0,_util_data__WEBPACK_IMPORTED_MODULE_2__.exportData)());
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-2')
            .append(fileInput, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('button', 'blue')
            .setAttribute('href', '#')
            .setText('Import')
            .click((e) => {
            e.preventDefault();
            fileInput.triggerClick();
        })));
    }
}
class SettingsPanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_3__.Panel {
    constructor() {
        super('PSNP+ Settings');
        this._addContent(new _SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage());
    }
    _addContent(settingsStorage) {
        const markUnobtainableTrophies = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Mark unobtainable trophies', settingsStorage.get('markUnobtainableTrophies'), 'Known unobtainable trophies will be marked across PSNProfiles.');
        const resizePS5Icons = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Resize PS5 icons', settingsStorage.get('resizePS5Icons'), 'This feature will resize PS5 icons to standard size. Available on the frontpage and in profiles.');
        const useNewTrophyIcons = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Use new trophy icons', settingsStorage.get('useNewTrophyIcons'), 'PSNP+ will replace old trophy icons with new trophy icons that arrived with PS5 generation.');
        const hideFloatingMenus = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Hide floating menus', settingsStorage.get('hideFloatingMenus'), 'Floating menus (top-left corner) will be hidden. Any functionality inside these menus will not be available.');
        const use24HourTimeFormat = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Use 24-hour time format', settingsStorage.get('use24HourTimeFormat'));
        const guideLazyLoadMedia = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Lazy load images and videos inside guides', settingsStorage.get('guideLazyLoadMedia'), 'Reduces loading times in guides by downloading images and videos only once they are visible on the screen. Also fixes embedded YouTube videos.');
        const enableScriptLogger = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Enable script logger', settingsStorage.get('enableScriptLogger'), 'PSNP+ will log extra debugging information to browser console.');
        const hideStacksOnTheFrontpage = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Merge stacks in "New Trophy Lists"', settingsStorage.get('hideStacksOnTheFrontpage'), 'PSNP+ will show you latest 10 unique trophy lists. All extra stacks will be merged.');
        const mergePopularGamesOnTheFrontpage = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Merge stacks in "Popular Games This Week"', settingsStorage.get('mergePopularGamesOnTheFrontpage'), 'PSNP+ will combine players statistics for all of the stacks in top 50. This also overrides "Show long stats" setting.');
        const loadDLCImagesOnTheFrontpage = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Load correct images for "New DLC"', settingsStorage.get('loadDLCImagesOnTheFrontpage'));
        const compactBanners = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Use compact banners', settingsStorage.get('compactBanners'), 'This feature will reduce the height of the banners shown across PSNP.');
        const hideRank = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Hide rank', settingsStorage.get('hideRank'), 'This feature will automatically hide rank in all profiles.');
        const profileShowAddToListButton = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Show "Add to list" button', settingsStorage.get('profileShowAddToListButton'), '"Add to list" button will be available for every game in the profile');
        const automaticallyRedirectAfterUpdatingProfile = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Automatically redirect after updating profile', settingsStorage.get('automaticallyRedirectAfterUpdatingProfile'));
        const profileShowOnlyUniqueGamesInRarestTrophies = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Show unique games in "Rarest Trophies" widget', settingsStorage.get('profileShowOnlyUniqueGamesInRarestTrophies'));
        const profileDisableScraping = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Disable scraping of game progress in your profile', settingsStorage.get('profileDisableScraping'), 'This is mostly useful for people with super large profiles where the script may crash due to storage issues. WARNING: Certain features will not work. You will not see your progress in lists or sessions.');
        const pricingPlatPricesIntegration = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Enable PlatPrices.com integration', settingsStorage.get('platPricesIntegration'), 'PSNP+ will automatically fetch pricing information from PlatPrices.com and will display this information inside trophy lists.');
        const pricingPlatPricesApiKey = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_6__.PanelInput('API key', settingsStorage.get('platPricesApiKey'), 'Your API key can be found in Settings over at PlatPrices.com.', (key) => {
            if (!pricingPlatPricesIntegration.serialize()) {
                return true;
            }
            return key !== '' && /\d+x[a-f0-9]{32}/.test(key);
        });
        const pricingPlatPricesRegion = new _ui_panel_PanelSelect__WEBPACK_IMPORTED_MODULE_10__.PanelSelect('Region', settingsStorage.get('platPricesRegion'), _plat_prices_PlatPricesAPI__WEBPACK_IMPORTED_MODULE_11__.PLAT_PRICES_REGIONS);
        const trophyListHideTrophyGuideBanner = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Hide trophy guide banner', settingsStorage.get('trophyListHideTrophyGuideBanner'));
        const trophyListSearchLinks = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_6__.PanelInput('Search links', settingsStorage.get('trophyListSearchLinks').join(', '), 'List of search links separated by ","', () => true, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'blue')
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_22__.tooltip)(el, 'Set to default'))
            .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_21__.Icon('fa-undo'))
            .click(e => {
            e.preventDefault();
            trophyListSearchLinks.setValue(_ISettings__WEBPACK_IMPORTED_MODULE_9__.DEFAULT_SETTINGS.trophyListSearchLinks.join(', '));
        }));
        const guideShowAdvancedGuideSearchByDefault = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Show advanced guide search by default', settingsStorage.get('guideShowAdvancedGuideSearchByDefault'));
        const guideAutomaticallyHideEarnedTrophies = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Automatically hide earned trophies in guides', settingsStorage.get('guideAutomaticallyHideEarnedTrophies'));
        const guideScrapeComplexity = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Show info about trophy guides across PSNP', settingsStorage.get('guideScrapeComplexity'));
        const gamingSessionsShowAllByDefault = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Show all gaming sessions by default', settingsStorage.get('gamingSessionsShowAllByDefault'));
        const gamingSessionsScraping = new _ui_panel_PanelCheckbox__WEBPACK_IMPORTED_MODULE_7__.PanelCheckbox('Show info about active sessions in profiles and game lists', settingsStorage.get('gamingSessionsScraping'), 'PSNP+ will automatically scrape gaming sessions (at most once an hour) and will show this information on other PSNProfiles pages.');
        const gameLeaderboardHighlightedCountries = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_6__.PanelInput('Highlighted countries', settingsStorage.get('gameLeaderboardHighlightedCountries').join(', '), 'List of countries separated by ",". Country needs to match exact country name used by PSNProfiles.');
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img').setAttribute('src', "https://psnp-plus.huskycode.dev/icon.png")
            .setAttribute('width', '16px')
            .setAttribute('height', '16px')
            .setAttribute('style', 'vertical-align: text-top;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText('PSNP+'), ` v${"11.14"} by `, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_14__.LINK_AUTHOR_PSNP_PROFILE)
            .setText(_util_constants__WEBPACK_IMPORTED_MODULE_14__.AUTHOR_PSN_ID), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .setAttribute('style', 'margin: 10px 0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('small')
            .setAttribute('style', 'padding: 3px; background-color: #E2AA51; border: 1px solid #a77b34; border-radius: 2px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_14__.LINK_DONATE)
            .setAttribute('target', '_blank')
            .setAttribute('style', 'color: white;')
            .append('If you find PSNP+ useful, please consider supporting this project and buying me a coffee ☕. Thanks!'))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_14__.LINK_WEBSITE)
            .setAttribute('target', '_blank')
            .setText('Website'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText(' • '), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Changelog')
            .click(e => {
            e.preventDefault();
            this.remove();
            (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_15__.appendPanel)(new _update_UpdatePanel__WEBPACK_IMPORTED_MODULE_18__.UpdatePanel());
        }), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText(' • '), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_14__.LINK_MAIN_THREAD)
            .setAttribute('target', '_blank')
            .setText('Forum'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText(' • '), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_14__.LINK_UNOBTAINABLE_TROPHIES_THREAD)
            .setAttribute('target', '_blank')
            .setText('Report Unobtainable Trophies')), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('General Settings', markUnobtainableTrophies, resizePS5Icons, useNewTrophyIcons, compactBanners, hideFloatingMenus, use24HourTimeFormat, enableScriptLogger), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('Frontpage', hideStacksOnTheFrontpage, mergePopularGamesOnTheFrontpage, loadDLCImagesOnTheFrontpage), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('Profile', hideRank, profileShowAddToListButton, automaticallyRedirectAfterUpdatingProfile, profileShowOnlyUniqueGamesInRarestTrophies, profileDisableScraping), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('Pricing', pricingPlatPricesIntegration, pricingPlatPricesApiKey, pricingPlatPricesRegion), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('Trophy List', trophyListHideTrophyGuideBanner, trophyListSearchLinks), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('Guide', guideShowAdvancedGuideSearchByDefault, guideLazyLoadMedia, guideAutomaticallyHideEarnedTrophies, guideScrapeComplexity), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('Gaming Sessions', gamingSessionsShowAllByDefault, gamingSessionsScraping), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('Game Leaderboard', gameLeaderboardHighlightedCountries), new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_5__.PanelSection('Data', new SettingsDataButtons(() => this.remove()))), new _ui_panel_PanelBottom__WEBPACK_IMPORTED_MODULE_8__.PanelBottom('Save & Reload', () => {
            const formInvalid = [
                pricingPlatPricesApiKey.validate()
            ].some(result => result === false);
            if (formInvalid) {
                return;
            }
            const newSettings = {
                enableScriptLogger: enableScriptLogger.serialize(),
                markUnobtainableTrophies: markUnobtainableTrophies.serialize(),
                resizePS5Icons: resizePS5Icons.serialize(),
                useNewTrophyIcons: useNewTrophyIcons.serialize(),
                compactBanners: compactBanners.serialize(),
                hideFloatingMenus: hideFloatingMenus.serialize(),
                use24HourTimeFormat: use24HourTimeFormat.serialize(),
                hideStacksOnTheFrontpage: hideStacksOnTheFrontpage.serialize(),
                mergePopularGamesOnTheFrontpage: mergePopularGamesOnTheFrontpage.serialize(),
                loadDLCImagesOnTheFrontpage: loadDLCImagesOnTheFrontpage.serialize(),
                hideRank: hideRank.serialize(),
                profileShowAddToListButton: profileShowAddToListButton.serialize(),
                automaticallyRedirectAfterUpdatingProfile: automaticallyRedirectAfterUpdatingProfile.serialize(),
                profileShowOnlyUniqueGamesInRarestTrophies: profileShowOnlyUniqueGamesInRarestTrophies.serialize(),
                profileDisableScraping: profileDisableScraping.serialize(),
                platPricesIntegration: pricingPlatPricesIntegration.serialize(),
                platPricesApiKey: pricingPlatPricesApiKey.serialize(),
                platPricesRegion: pricingPlatPricesRegion.serialize(),
                trophyListHideTrophyGuideBanner: trophyListHideTrophyGuideBanner.serialize(),
                trophyListSearchLinks: trophyListSearchLinks.commaSeparatedList(),
                guideShowAdvancedGuideSearchByDefault: guideShowAdvancedGuideSearchByDefault.serialize(),
                guideLazyLoadMedia: guideLazyLoadMedia.serialize(),
                guideAutomaticallyHideEarnedTrophies: guideAutomaticallyHideEarnedTrophies.serialize(),
                guideScrapeComplexity: guideScrapeComplexity.serialize(),
                gameLeaderboardHighlightedCountries: gameLeaderboardHighlightedCountries.commaSeparatedList(),
                gamingSessionsShowAllByDefault: gamingSessionsShowAllByDefault.serialize(),
                gamingSessionsScraping: gamingSessionsScraping.serialize()
            };
            settingsStorage.save(newSettings);
            if (!newSettings.platPricesIntegration) {
                new _plat_prices_PlatPricesStorage__WEBPACK_IMPORTED_MODULE_12__.PlatPricesStorage().clear();
            }
            if (!newSettings.gamingSessionsScraping) {
                new _sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_4__.SessionStorage().clear();
            }
            if (!newSettings.markUnobtainableTrophies) {
                new _unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_13__.UnobtainableTrophiesStorage().clear();
            }
            if (newSettings.profileDisableScraping) {
                new _game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_17__.GameProgressStorage().clear();
            }
            if (!newSettings.guideScrapeComplexity) {
                new _guide_GuideStorage__WEBPACK_IMPORTED_MODULE_20__.GuideStorage().clear();
            }
            this.remove();
            location.reload();
        }, 'Close', () => this.remove()));
    }
}


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SettingsStorage": () => (/* binding */ SettingsStorage)
/* harmony export */ });
/* harmony import */ var _ISettings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);

class SettingsStorage /* implements IExportableStorage<IList[]> */ {
    constructor() {
        this._storageKey = 'psnpp-settings';
    }
    _load() {
        try {
            const settingsString = localStorage.getItem(this._storageKey);
            if (settingsString == null) {
                return _ISettings__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SETTINGS;
            }
            return Object.assign({}, _ISettings__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SETTINGS, JSON.parse(settingsString));
        }
        catch (e) {
            console.error('Failed to load settings', e);
            return _ISettings__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SETTINGS;
        }
    }
    save(settings) {
        localStorage.setItem(this._storageKey, JSON.stringify(settings));
    }
    get(key) {
        const settings = this._load();
        return settings[key];
    }
    set(key, value) {
        const settings = this._load();
        settings[key] = value;
        this.save(settings);
    }
    disablePlatPricesIntegration() {
        const settings = this._load();
        settings.platPricesIntegration = false;
        this.save(settings);
    }
    export() {
        return this._load();
    }
    import(settings) {
        this.save(settings);
    }
    clear() {
        localStorage.removeItem(this._storageKey);
    }
}


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_SETTINGS": () => (/* binding */ DEFAULT_SETTINGS)
/* harmony export */ });
const DEFAULT_SETTINGS = {
    enableScriptLogger: false,
    markUnobtainableTrophies: true,
    resizePS5Icons: false,
    useNewTrophyIcons: false,
    compactBanners: false,
    hideFloatingMenus: false,
    use24HourTimeFormat: false,
    hideStacksOnTheFrontpage: true,
    mergePopularGamesOnTheFrontpage: true,
    loadDLCImagesOnTheFrontpage: true,
    hideRank: false,
    profileShowAddToListButton: false,
    automaticallyRedirectAfterUpdatingProfile: false,
    profileShowOnlyUniqueGamesInRarestTrophies: false,
    profileDisableScraping: false,
    platPricesIntegration: false,
    platPricesApiKey: '',
    platPricesRegion: 'US',
    guideShowAdvancedGuideSearchByDefault: false,
    guideLazyLoadMedia: true,
    guideAutomaticallyHideEarnedTrophies: false,
    guideScrapeComplexity: true,
    gameLeaderboardHighlightedCountries: [],
    gamingSessionsShowAllByDefault: false,
    gamingSessionsScraping: true,
    trophyListHideTrophyGuideBanner: false,
    trophyListSearchLinks: [
        '[G](https://www.google.com/search?q=game )',
        '[YT](https://www.youtube.com/results?search_query=gameplay )',
        '[PST](https://www.google.com/search?q=site:playstationtrophies.org/game )',
        '[PP](https://www.powerpyx.com/?s=)',
        '[TT](https://www.truetrophies.com/searchresults.aspx?search=)',
        '[TA](https://www.trueachievements.com/searchresults.aspx?search=)'
    ]
};


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clearData": () => (/* binding */ clearData),
/* harmony export */   "downloadBlob": () => (/* binding */ downloadBlob),
/* harmony export */   "downloadFile": () => (/* binding */ downloadFile),
/* harmony export */   "exportData": () => (/* binding */ exportData),
/* harmony export */   "importData": () => (/* binding */ importData),
/* harmony export */   "importList": () => (/* binding */ importList)
/* harmony export */ });
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _features_sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(17);
/* harmony import */ var _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(20);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(21);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(24);
/* harmony import */ var _features_compare_plus_ComparePlusStorage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(27);
/* harmony import */ var _features_plat_prices_PlatPricesStorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(29);
/* harmony import */ var _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(30);










async function getData() {
    return {
        version: 12,
        settings: new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage().export(),
        lists: new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_2__.ListStorage().export(),
        comparePlus: await (new _features_compare_plus_ComparePlusStorage__WEBPACK_IMPORTED_MODULE_7__.ComparePlusStorage()).export()
    };
}
function saveData(data) {
    switch (data.version) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage().import(data.settings);
            break;
        case 6:
        case 7:
        case 8:
            new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage().import(data.settings);
            new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_2__.ListStorage().import(data.lists);
            break;
        case 9:
        case 10:
        case 11:
        case 12:
            new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage().import(data.settings);
            new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_2__.ListStorage().import(data.lists);
            new _features_compare_plus_ComparePlusStorage__WEBPACK_IMPORTED_MODULE_7__.ComparePlusStorage().import(data.comparePlus);
            break;
        default:
            console.error('Skipping import for unknown version of backup:', data.version);
            break;
    }
}
function downloadBlob(dataBlob, fileName) {
    const a = _J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
        .setAttribute('style', 'display: none;')
        .setAttribute('href', dataBlob)
        .setAttribute('download', fileName);
    _J__WEBPACK_IMPORTED_MODULE_0__.J.q('body').append(a);
    a.triggerClick();
    a.remove();
}
function downloadFile(data, fileName, type) {
    const dataBlob = window.URL.createObjectURL(new Blob([data], { type }));
    downloadBlob(dataBlob, fileName);
    URL.revokeObjectURL(dataBlob);
}
async function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onerror = (e) => {
            console.error('Failed reading file', e);
            fileReader.abort();
            reject(new Error('File read failed'));
        };
        fileReader.onload = () => {
            if (fileReader.result == null) {
                return resolve('');
            }
            return resolve(fileReader.result);
        };
        fileReader.readAsText(file);
    });
}
async function exportData() {
    const data = await getData();
    downloadFile(JSON.stringify(data, null, 2), 'psnpp-export.json', 'application/json');
}
async function importData(file) {
    try {
        const textData = await readTextFile(file);
        const parsedData = JSON.parse(textData);
        saveData(parsedData);
    }
    catch (e) {
        console.error('Failed to import data', e);
    }
}
async function importList(file) {
    const textData = await readTextFile(file);
    const parsedData = JSON.parse(textData);
    return (new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_2__.ListStorage().createList(parsedData));
}
function clearUnused() {
    localStorage.removeItem('psnpp-backlog');
    localStorage.removeItem('psnpp-guidelist');
    localStorage.removeItem('psnpp-gameleaderboard');
}
function clearData() {
    new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_2__.ListStorage().clear();
    new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage().clear();
    new _features_sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_3__.SessionStorage().clear();
    new _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_4__.GameProgressStorage().clear();
    new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_5__.ScriptStateStorage().clear();
    new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_6__.UnobtainableTrophiesStorage().clear();
    new _features_compare_plus_ComparePlusStorage__WEBPACK_IMPORTED_MODULE_7__.ComparePlusStorage().clear();
    new _features_plat_prices_PlatPricesStorage__WEBPACK_IMPORTED_MODULE_8__.PlatPricesStorage().clear();
    new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_9__.GuideStorage().clear();
    clearUnused();
}


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListStorage": () => (/* binding */ ListStorage)
/* harmony export */ });
/* harmony import */ var _util_uuidv4__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _list_tags__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _ListScraper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);
/* harmony import */ var _util_promise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(15);
/* harmony import */ var _util_transform__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(16);





const ONE_DAY = 24 * 60 * 60 * 1000;
class ListStorage /* implements IExportableStorage<IList[]> */ {
    constructor() {
        this._storageKey = 'psnpp-lists';
    }
    get() {
        try {
            const listsData = localStorage.getItem(this._storageKey);
            if (listsData == null) {
                return [];
            }
            return JSON.parse(listsData);
        }
        catch (e) {
            console.error('Failed to load lists', e);
            return [];
        }
    }
    _save(lists) {
        localStorage.setItem(this._storageKey, JSON.stringify(lists));
    }
    createList(list) {
        const listToSave = { ...list, id: (0,_util_uuidv4__WEBPACK_IMPORTED_MODULE_0__.uuidv4)() };
        const currentLists = this.get();
        currentLists.push(listToSave);
        this._save(currentLists);
        return listToSave.id;
    }
    updateList(listId, newList) {
        const allLists = this.get();
        const listIndex = allLists.findIndex(list => list.id === listId);
        if (listIndex === -1) {
            throw new Error('Invalid list ID');
        }
        allLists[listIndex].name = newList.name;
        allLists[listIndex].tags = newList.tags;
        allLists[listIndex].removeStartedGames = newList.removeStartedGames;
        allLists[listIndex].removeGames = newList.removeGames;
        allLists[listIndex].orderBy = newList.orderBy;
        allLists[listIndex].direction = newList.direction;
        allLists[listIndex].note = newList.note;
        allLists[listIndex].url = newList.url;
        this._save(allLists);
    }
    getById(listId) {
        const allLists = this.get();
        const list = allLists.find(list => list.id === listId);
        if (list == null) {
            throw new Error('Invalid list ID');
        }
        return list;
    }
    getUniqueGamesForRefresh() {
        const allNonRemoteLists = this
            .get()
            .filter(list => list.url == null || list.url === '');
        const allGames = [];
        allNonRemoteLists.forEach(list => {
            list.games.forEach(game => allGames.push(game));
        });
        return (0,_util_transform__WEBPACK_IMPORTED_MODULE_4__.unique)(allGames, (item, currentItem) => item.id === currentItem.id);
    }
    addGameToList(listId, item, setTimestamp = false) {
        if (setTimestamp) {
            item.timestamp = Date.now();
        }
        const allLists = this.get();
        const listIndex = allLists.findIndex(list => list.id === listId);
        if (listIndex === -1) {
            return false;
        }
        const gameIndex = allLists[listIndex].games.findIndex(game => game.id === item.id);
        if (gameIndex > -1) {
            allLists[listIndex].games[gameIndex] = item;
        }
        else {
            const tags = (0,_list_tags__WEBPACK_IMPORTED_MODULE_1__.getDefaultTags)(allLists[listIndex].tags);
            item.tags = item.tags != null
                ? (0,_util_transform__WEBPACK_IMPORTED_MODULE_4__.unique)([...item.tags, ...tags])
                : tags;
            allLists[listIndex].games.push(item);
        }
        this._save(allLists);
        return true;
    }
    addTagsToList(listId, tags) {
        const list = this.getById(listId);
        const newTags = (0,_util_transform__WEBPACK_IMPORTED_MODULE_4__.unique)([...list.tags, ...tags]);
        this.updateList(listId, {
            timestamp: list.timestamp,
            name: list.name,
            tags: newTags,
            removeStartedGames: list.removeStartedGames,
            removeGames: list.removeGames,
            orderBy: list.orderBy,
            direction: list.direction,
            note: list.note,
            games: list.games
        });
    }
    remove(listId) {
        const allLists = this.get();
        const index = allLists.findIndex((x) => x.id === listId);
        if (index === -1) {
            return false;
        }
        allLists.splice(index, 1);
        this._save(allLists);
        return true;
    }
    moveCopyGame(fromListId, toListId, item, deleteOriginal) {
        const targetList = this.getById(toListId);
        const gameIndex = targetList.games.findIndex(game => game.id === item.id);
        if (gameIndex > -1) {
            return false;
        }
        if (item.tags != null) {
            this.addTagsToList(toListId, item.tags);
        }
        this.addGameToList(toListId, item);
        if (deleteOriginal) {
            this.removeGame(fromListId, item.id);
        }
        return true;
    }
    removeGame(listId, gameId) {
        const allLists = this.get();
        const listIndex = allLists.findIndex((x) => x.id === listId);
        if (listIndex === -1) {
            return false;
        }
        const gameIndex = allLists[listIndex].games.findIndex(game => game.id === gameId);
        if (gameIndex === -1) {
            return false;
        }
        allLists[listIndex].games.splice(gameIndex, 1);
        this._save(allLists);
        return true;
    }
    sortGame(listId, oldIndex, newIndex, shouldReverse) {
        const allLists = this.get();
        const listIndex = allLists.findIndex((x) => x.id === listId);
        if (listIndex === -1) {
            return false;
        }
        (0,_util_transform__WEBPACK_IMPORTED_MODULE_4__.move)(allLists[listIndex].games, oldIndex, newIndex, shouldReverse);
        this._save(allLists);
        return true;
    }
    moveToIndex(listId, gameId, targetIndex) {
        const allLists = this.get();
        const listIndex = allLists.findIndex((x) => x.id === listId);
        if (listIndex === -1) {
            return false;
        }
        const gameIndex = allLists[listIndex].games.findIndex(game => game.id === gameId);
        if (gameIndex === -1) {
            return false;
        }
        (0,_util_transform__WEBPACK_IMPORTED_MODULE_4__.move)(allLists[listIndex].games, gameIndex, targetIndex, false);
        this._save(allLists);
        return true;
    }
    removeGameFromAllListsWithAutoRemoval(game) {
        const allLists = this.get();
        const listsWithAutoRemoval = allLists.filter(list => (list.removeGames != null && list.removeGames != 'never')
            || list.removeStartedGames);
        const removeResults = listsWithAutoRemoval.map(list => {
            if (list.removeGames === 'started' || list.removeStartedGames) {
                return this.removeGame(list.id, game.id);
            }
            if (list.removeGames === 'completed' && game.progress === 100) {
                return this.removeGame(list.id, game.id);
            }
            if (list.removeGames === 'platinum'
                && (game.progress === 100 || (game.trophies != null && game.trophies.platinum > 0))) {
                return this.removeGame(list.id, game.id);
            }
            return false;
        });
        return removeResults.some(result => result === true);
    }
    clearTags(listId, tags) {
        const allLists = this.get();
        const listIndex = allLists.findIndex((x) => x.id === listId);
        if (listIndex === -1) {
            throw new Error('Invalid list ID');
        }
        allLists[listIndex].games.forEach(item => {
            tags.forEach(t => {
                if (typeof item.tags === 'undefined') {
                    return;
                }
                const tagIndex = item.tags.findIndex(itemTag => itemTag === t);
                if (tagIndex === -1) {
                    return;
                }
                item.tags.splice(tagIndex, 1);
            });
        });
        this._save(allLists);
    }
    hasInList(listId, id) {
        const allLists = this.get();
        const listIndex = allLists.findIndex((x) => x.id === listId);
        if (listIndex === -1) {
            throw new Error('Invalid list ID');
        }
        const index = allLists[listIndex].games.findIndex((x) => x.id === id);
        return index > -1;
    }
    has(id) {
        const allLists = this.get();
        return allLists.some(list => list.id === id);
    }
    clear() {
        localStorage.removeItem(this._storageKey);
    }
    export() {
        return this.get();
    }
    import(lists) {
        this._save(lists);
    }
    refreshGame(newScrape) {
        let refreshed = false;
        const allLists = this.get();
        allLists.forEach(list => {
            const gameIndex = list.games.findIndex(game => game.id === newScrape.id);
            if (gameIndex > -1) {
                newScrape.timestamp = list.games[gameIndex].timestamp;
                newScrape.psplus = list.games[gameIndex].psplus;
                newScrape.tags = list.games[gameIndex].tags;
                newScrape.note = list.games[gameIndex].note;
                this.addGameToList(list.id, newScrape);
                refreshed = true;
            }
        });
        return refreshed;
    }
    async refresh(onUpdate) {
        const uniqueGames = this.getUniqueGamesForRefresh();
        for (let i = 0; i < uniqueGames.length; i++) {
            const item = uniqueGames[i];
            if (typeof item.scrapetime !== 'undefined') {
                if (Date.now() - item.scrapetime < ONE_DAY) {
                    onUpdate('success', i);
                    continue;
                }
            }
            try {
                const newScrape = await _ListScraper__WEBPACK_IMPORTED_MODULE_2__.ListScraper.getFromUrl(item.url);
                this.refreshGame(newScrape);
                if (i < uniqueGames.length - 1) {
                    await (0,_util_promise__WEBPACK_IMPORTED_MODULE_3__.sleep)(5000);
                }
                onUpdate('success', i);
            }
            catch (e) {
                console.warn(`Failed to fetch item: ${item.title}. Keeping old data. Error:`, e);
                // NOTE: For now we don't process/display fetch errors.
                onUpdate('success', i);
            }
        }
        onUpdate('done', null);
    }
}


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "uuidv4": () => (/* binding */ uuidv4)
/* harmony export */ });
// NOTE: This isn't cryptographically secure but it works
// for our purposes.
// https://stackoverflow.com/a/2117523/7494817
function uuidv4() {
    const uuidv4Base = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return uuidv4Base.replace(/[xy]/g, (char) => {
        const random = Math.random() * 16 | 0;
        const value = char == 'x'
            ? random
            : (random & 0x3 | 0x8);
        return value.toString(16);
    });
}


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDefaultTags": () => (/* binding */ getDefaultTags)
/* harmony export */ });
function getTagPrefix(tag) {
    const match = tag.match(/^([@]{1})/);
    if (match == null) {
        return '';
    }
    return match[0];
}
function isDefaultTag(tag) {
    const prefix = getTagPrefix(tag);
    return prefix.indexOf('@') > -1;
}
function getDefaultTags(tags) {
    return tags.filter(tag => isDefaultTag(tag));
}


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListScraper": () => (/* binding */ ListScraper)
/* harmony export */ });
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(13);
/* harmony import */ var _regions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(14);




class ListScraper {
    constructor(doc) {
        this._doc = doc;
    }
    _q(query, options = {}) {
        return _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q(query, options, this._doc);
    }
    _getSidebarInfobox() {
        return this._q('div#content > div.row > div.col-xs-4 > div.box.no-top-border');
    }
    _getTrophyCountBox() {
        return this._getSidebarInfobox().find('div.trophy-count');
    }
    _getPlatformsBox() {
        return this._getSidebarInfobox().find('div.platforms');
    }
    _getTotalPointCount() {
        const numberText = this._getTrophyCountBox().find('span.small-info.floatr').find('b', { eq: 1 }).getText().replace(/[^\d]*/g, '');
        return parseInt(numberText, 10);
    }
    getFromTrophiesPage() {
        const title = this._q('meta[name="Description"]').getAttribute('content').split(' • ')[0].replace(' Trophy List', '');
        const image = this._q('meta[property="og:image"]').getAttribute('content');
        const url = this._q('meta[property="og:url"]').getAttribute('content');
        const points = this._getTotalPointCount();
        const id = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromUrl)(url);
        const isPS5 = this._getPlatformsBox().find('span.tag.platform.ps5').exists();
        const isPS4 = this._getPlatformsBox().find('span.tag.platform.ps4').exists();
        const isPS3 = this._getPlatformsBox().find('span.tag.platform.ps3').exists();
        const isPSVITA = this._getPlatformsBox().find('span.tag.platform.psvita').exists();
        const isPSVR = this._getPlatformsBox().find('span.tag.platform.psvr').exists();
        const isPC = this._getPlatformsBox().find('span.tag.platform.pc').exists();
        const platinum = parseInt(this._getTrophyCountBox().find('li.icon-sprite.platinum').getText(), 10);
        const gold = parseInt(this._getTrophyCountBox().find('li.icon-sprite.gold').getText(), 10);
        const silver = parseInt(this._getTrophyCountBox().find('li.icon-sprite.silver').getText(), 10);
        const bronze = parseInt(this._getTrophyCountBox().find('li.icon-sprite.bronze').getText(), 10);
        const regionTh = this._getSidebarInfobox().find('th.center');
        const regionLongDescription = regionTh.exists()
            ? regionTh.getText()
            : undefined;
        const region = typeof regionLongDescription !== 'undefined'
            ? (0,_regions__WEBPACK_IMPORTED_MODULE_3__.getCodeFromDescription)(regionLongDescription)
            : undefined;
        const dlccount = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('[id^="DLC-"]', {}, this._doc).length;
        const platinumpctMatch = this._q('span', { containsText: 'Platinum Achiever' }).getText().match(/\(([\d.]{1,6})%\)/);
        const platinumpct = platinumpctMatch != null
            ? parseFloat(platinumpctMatch[1])
            : undefined;
        const completepctMatch = this._q('span', { containsText: '100% Completed' }).getText().match(/\(([\d.]{1,6})%\)/);
        const completepct = completepctMatch != null
            ? parseFloat(completepctMatch[1])
            : undefined;
        const timestamp = Date.now();
        return {
            id,
            scrapetime: timestamp,
            title,
            image,
            url,
            points,
            platforms: {
                ps5: isPS5,
                ps4: isPS4,
                ps3: isPS3,
                psvita: isPSVITA,
                psvr: isPSVR,
                pc: isPC
            },
            trophies: {
                platinum,
                gold,
                silver,
                bronze
            },
            region,
            dlccount,
            platinumpct,
            completepct,
            timestamp,
            psplus: false,
            tags: [],
            note: '',
            // NOTE: Unused
            guideurl: undefined
        };
    }
    static async getFromUrl(url) {
        const doc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_2__.fetchDocument)(url);
        return new ListScraper(doc).getFromTrophiesPage();
    }
}


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getFirstLevelIdFromPathname": () => (/* binding */ getFirstLevelIdFromPathname),
/* harmony export */   "getFirstLevelIdFromUrl": () => (/* binding */ getFirstLevelIdFromUrl),
/* harmony export */   "getPathSegments": () => (/* binding */ getPathSegments),
/* harmony export */   "getPathSegmentsFromPathname": () => (/* binding */ getPathSegmentsFromPathname),
/* harmony export */   "getSearchParams": () => (/* binding */ getSearchParams),
/* harmony export */   "getSearchParamsFromHash": () => (/* binding */ getSearchParamsFromHash),
/* harmony export */   "getSecondLevelIdFromPathname": () => (/* binding */ getSecondLevelIdFromPathname),
/* harmony export */   "getTrophyListIdFromImageUrl": () => (/* binding */ getTrophyListIdFromImageUrl),
/* harmony export */   "getUrl": () => (/* binding */ getUrl),
/* harmony export */   "getUrlObject": () => (/* binding */ getUrlObject),
/* harmony export */   "getWebsiteUrl": () => (/* binding */ getWebsiteUrl),
/* harmony export */   "redirect": () => (/* binding */ redirect),
/* harmony export */   "validateUrl": () => (/* binding */ validateUrl)
/* harmony export */ });
function getUrlObject() {
    return new URL(window.location.href);
}
function getWebsiteUrl() {
    const url = getUrlObject();
    return url.protocol + '//' + url.host;
}
function getUrl() {
    return window.location.href;
}
function getPathSegmentsFromPathname(pathname) {
    return pathname
        .split('/')
        .filter((segment) => segment !== '');
}
function getPathSegments() {
    return getPathSegmentsFromPathname(window.location.pathname);
}
function getSearchParams() {
    const url = getUrlObject();
    return url.searchParams;
}
function getSearchParamsFromHash() {
    const url = getUrlObject();
    const fakeUrl = new URL('/' + url.hash.replace(/^#/, ''), 'https://psnprofiles.com');
    return fakeUrl.searchParams;
}
function getTrophyListIdFromImageUrl(imageUrl) {
    return (new URL(imageUrl)).pathname.split('/')[3];
}
function getFirstLevelIdFromPathname(pathname) {
    return pathname.split('/')[2].split('-')[0];
}
function getFirstLevelIdFromUrl(url) {
    return getFirstLevelIdFromPathname((new URL(url)).pathname);
}
function getSecondLevelIdFromPathname(pathname) {
    return pathname.split('/')[3].split('-')[0];
}
function redirect(path) {
    location.href = path;
}
function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
}


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fetchDocument": () => (/* binding */ fetchDocument),
/* harmony export */   "fetchJson": () => (/* binding */ fetchJson),
/* harmony export */   "fetchText": () => (/* binding */ fetchText),
/* harmony export */   "gmFetchJson": () => (/* binding */ gmFetchJson),
/* harmony export */   "gmFetchSafe": () => (/* binding */ gmFetchSafe),
/* harmony export */   "loadCssSheet": () => (/* binding */ loadCssSheet),
/* harmony export */   "loadScriptTag": () => (/* binding */ loadScriptTag)
/* harmony export */ });
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

async function fetchSafe(url) {
    const res = await fetch(url);
    if (res.status !== 200) {
        throw new Error(`Invalid response status code ${res.status}`);
    }
    return res;
}
async function fetchText(url) {
    const res = await fetchSafe(url);
    return res.text();
}
async function fetchJson(url) {
    const res = await fetchSafe(url);
    return res.json();
}
async function fetchDocument(url) {
    const htmlString = await fetchText(url);
    return new DOMParser().parseFromString(htmlString, 'text/html');
}
async function gmFetchSafe(url) {
    if (typeof GM_xmlhttpRequest === 'undefined') {
        throw new Error('This feature is not available in your web browser.');
    }
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url,
            onload: (res) => {
                if (res.status !== 200) {
                    reject(new Error(`Invalid response status code ${res.status}`));
                }
                else {
                    resolve(res);
                }
            },
            onerror: (e) => reject(e)
        });
    });
}
async function gmFetchJson(url) {
    const res = await gmFetchSafe(url);
    return JSON.parse(res.responseText);
}
const loadedResourcesMap = new Set();
function loadScriptTag(src) {
    if (loadedResourcesMap.has(src)) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        _J__WEBPACK_IMPORTED_MODULE_0__.J.q('head')
            .append(_J__WEBPACK_IMPORTED_MODULE_0__.J.c('script')
            .setAttribute('type', 'text/javascript')
            .setAttribute('src', src)
            .load(() => {
            loadedResourcesMap.add(src);
            resolve();
        })
            .error((e) => reject(e)));
    });
}
function loadCssSheet(src) {
    if (loadedResourcesMap.has(src)) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        _J__WEBPACK_IMPORTED_MODULE_0__.J.q('head')
            .append(_J__WEBPACK_IMPORTED_MODULE_0__.J.c('link')
            .setAttribute('type', 'text/css')
            .setAttribute('rel', 'stylesheet')
            .setAttribute('href', src)
            .load(() => {
            loadedResourcesMap.add(src);
            resolve();
        })
            .error((e) => reject(e)));
    });
}


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getCodeFromDescription": () => (/* binding */ getCodeFromDescription),
/* harmony export */   "getDescritionFromCode": () => (/* binding */ getDescritionFromCode)
/* harmony export */ });
const REGION_MAP = {
    'European List': 'EU',
    'Japanese List': 'JP',
    'North American List': 'NA',
    'United Kingdom List': 'UK',
    'Asian List': 'AS',
    'Australian List': 'AU',
    'Brazilian List': 'BR',
    'Chinese List': 'CN',
    'French List': 'FR',
    'German List': 'GER',
    'Hong Kong List': 'HK',
    'Korean List': 'KR',
    'Russian List': 'RU',
    'Saudi Arabian List': 'SA',
    'Spanish List': 'ES',
    'Taiwanese List': 'TW',
    'Western List': 'WE',
    'Digital Edition List': 'DG',
    'Physical/Disc List': 'PH',
    'Original List': 'OR',
    'Rereleased List': 'RR',
    'Pre-Order Bonus List': 'PO',
    'Bonus/Bundle List': 'BO'
};
function getCodeFromDescription(description) {
    return REGION_MAP[description];
}
function getDescritionFromCode(code) {
    const keys = Object.keys(REGION_MAP);
    for (let i = 0; i < keys.length; i++) {
        if (REGION_MAP[keys[i]] === code) {
            return keys[i];
        }
    }
}


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sleep": () => (/* binding */ sleep)
/* harmony export */ });
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
}


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cloneDeep": () => (/* binding */ cloneDeep),
/* harmony export */   "flatten": () => (/* binding */ flatten),
/* harmony export */   "move": () => (/* binding */ move),
/* harmony export */   "unique": () => (/* binding */ unique)
/* harmony export */ });
function unique(arr, equality = (item, currentItem) => (item === currentItem)) {
    return arr.reduce((uniqueElements, currentItem) => {
        if (!uniqueElements.some(item => equality(item, currentItem))) {
            uniqueElements.push(currentItem);
        }
        return uniqueElements;
    }, []);
}
function move(arr, fromIndex, toIndex, shouldReverse) {
    const indexMax = arr.length - 1;
    if ((fromIndex === toIndex) ||
        (fromIndex < 0 || fromIndex > indexMax) ||
        (toIndex < 0 || toIndex > indexMax)) {
        return;
    }
    if (shouldReverse) {
        arr.reverse();
    }
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
    if (shouldReverse) {
        arr.reverse();
    }
}
function cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// NOTE: Hacky type info but will work for now.
function flatten(target) {
    const output = {};
    function step(object, prev = '', currentDepth = 1) {
        Object.keys(object).forEach(function (key) {
            const value = object[key];
            const isarray = Array.isArray(value);
            const type = Object.prototype.toString.call(value);
            const isobject = (type === '[object Object]' ||
                type === '[object Array]');
            const newKey = prev.length > 0
                ? prev + '.' + key
                : key;
            if (!isarray && isobject && Object.keys(value).length > 0) {
                return step(value, newKey, currentDepth + 1);
            }
            output[newKey] = value;
        });
    }
    step(target);
    return output;
}


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SessionStorage": () => (/* binding */ SessionStorage)
/* harmony export */ });
/* harmony import */ var _SessionScraper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);


const ONE_HOUR = 1 * 60 * 60 * 1000;
class SessionStorage {
    constructor() {
        this._storageKey = 'psnpp-sessions';
    }
    get() {
        try {
            const sessionData = localStorage.getItem(this._storageKey);
            if (sessionData == null) {
                return [];
            }
            return JSON.parse(sessionData);
        }
        catch (e) {
            console.error('Failed to load sessions', e);
            return [];
        }
    }
    indexedByTrophyListId() {
        const currentSessions = this.get();
        const result = new Map();
        currentSessions.forEach(session => {
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getTrophyListIdFromImageUrl)(session.image);
            const sessionArray = result.get(trophyListId);
            if (typeof sessionArray === 'undefined') {
                result.set(trophyListId, [session]);
            }
            else {
                sessionArray.push(session);
            }
        });
        return result;
    }
    _save(newSessions) {
        localStorage.setItem(this._storageKey, JSON.stringify(newSessions));
    }
    clear() {
        localStorage.removeItem(this._storageKey);
    }
    async refresh() {
        const currentSessions = this.get();
        if (currentSessions.length > 0 && (currentSessions[0].scrapetime + ONE_HOUR) > Date.now()) {
            return false;
        }
        const newSessions = await _SessionScraper__WEBPACK_IMPORTED_MODULE_0__.SessionScraper.getFromSessionsPageRemotely();
        this._save(newSessions);
        return true;
    }
}


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SessionScraper": () => (/* binding */ SessionScraper)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(13);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(19);




class SessionScraper {
    constructor(doc) {
        this._doc = doc;
    }
    getFromSessionsPageWithElements() {
        return (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('table.box.zebra tr', {}, this._doc).map(row => {
            const title = row.clone().find('a.title').getText();
            const image = row.clone().find('img.game').getAttribute('src');
            const urlPath = row.clone().find('a.title').getAttribute('href');
            const hostElement = row.clone().find('a.small-title');
            const host = hostElement.exists()
                ? hostElement.getText()
                // NOTE: This is my own session located in "Your Upcoming Sessions" section.
                : (0,_util_user__WEBPACK_IMPORTED_MODULE_3__.getPsnId)();
            const url = (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getWebsiteUrl)() + urlPath;
            const id = (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getFirstLevelIdFromUrl)(url);
            const isPS5 = row.clone().find('span.tag.platform.ps5').exists();
            const isPS4 = row.clone().find('span.tag.platform.ps4').exists();
            const isPS3 = row.clone().find('span.tag.platform.ps3').exists();
            const isPSVITA = row.clone().find('span.tag.platform.psvita').exists();
            const isPSVR = row.clone().find('span.tag.platform.psvr').exists();
            const isPC = row.clone().find('span.tag.platform.pc').exists();
            return {
                el: row,
                session: {
                    id,
                    scrapetime: Date.now(),
                    title,
                    image,
                    url,
                    host,
                    platforms: {
                        ps5: isPS5,
                        ps4: isPS4,
                        ps3: isPS3,
                        psvita: isPSVITA,
                        psvr: isPSVR,
                        pc: isPC
                    }
                }
            };
        });
    }
    getFromSessionsPage() {
        return this.getFromSessionsPageWithElements().map(x => x.session);
    }
    static async getFromSessionsPageRemotely() {
        const doc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_2__.fetchDocument)((0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getWebsiteUrl)() + '/sessions?all');
        return new SessionScraper(doc).getFromSessionsPage();
    }
}


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getProfileUrl": () => (/* binding */ getProfileUrl),
/* harmony export */   "getPsnId": () => (/* binding */ getPsnId),
/* harmony export */   "getUpdateProfileRedirectPathname": () => (/* binding */ getUpdateProfileRedirectPathname),
/* harmony export */   "isLoggedIn": () => (/* binding */ isLoggedIn)
/* harmony export */ });
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

function getPsnId() {
    return _J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.dropdown.user-nav').find('span').getText();
}
function getProfileUrl() {
    return '/' + getPsnId();
}
function getUpdateProfileRedirectPathname(psnId, pathname) {
    return `/?psnId=${psnId}&redirect=${encodeURIComponent(pathname)}`;
}
function isLoggedIn() {
    return !_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#subnav a.signin.button').exists();
}


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GameProgressStorage": () => (/* binding */ GameProgressStorage)
/* harmony export */ });
class GameProgressStorage {
    constructor() {
        this._storageKey = 'psnpp-gameslist';
    }
    get() {
        try {
            const data = localStorage.getItem(this._storageKey);
            if (data == null) {
                return [];
            }
            return JSON.parse(data);
        }
        catch (e) {
            console.error('Failed to load game progress', e);
            return [];
        }
    }
    has(id) {
        const currentGames = this.get();
        return currentGames.some(game => game.id === id);
    }
    indexedById() {
        const currentGames = this.get();
        const result = new Map();
        currentGames.forEach(game => {
            result.set(game.id, game);
        });
        return result;
    }
    addMany(games) {
        const currentGames = this.get();
        games.forEach(game => {
            const progressExists = currentGames.findIndex((x) => x.id === game.id);
            if (progressExists > -1) {
                currentGames[progressExists] = game;
            }
            else {
                currentGames.push(game);
            }
        });
        this._save(currentGames);
    }
    _save(games) {
        localStorage.setItem(this._storageKey, JSON.stringify(games));
    }
    clear() {
        localStorage.removeItem(this._storageKey);
    }
}


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ScriptStateStorage": () => (/* binding */ ScriptStateStorage)
/* harmony export */ });
/* harmony import */ var _IScriptState__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22);
/* harmony import */ var _plat_prices_PlatPricesAPI__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(23);


class ScriptStateStorage {
    constructor() {
        this._storageKey = 'psnpp-scriptstate';
    }
    _load() {
        try {
            const state = localStorage.getItem(this._storageKey);
            if (state == null) {
                return _IScriptState__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SCRIPT_STATE;
            }
            return Object.assign({}, _IScriptState__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SCRIPT_STATE, JSON.parse(state));
        }
        catch (e) {
            console.error('Failed to load script state', e);
            return _IScriptState__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SCRIPT_STATE;
        }
    }
    _save(scriptState) {
        localStorage.setItem(this._storageKey, JSON.stringify(scriptState));
    }
    get(key) {
        const state = this._load();
        return state[key];
    }
    set(key, value) {
        const state = this._load();
        state[key] = value;
        this._save(state);
    }
    isPlatPricesCooldownActive() {
        const cooldown = this.get('platPricesCooldownTriggerTime');
        if (cooldown == null) {
            return false;
        }
        return cooldown + _plat_prices_PlatPricesAPI__WEBPACK_IMPORTED_MODULE_1__.PLAT_PRICES_COOLDOWN_PERIOD > Date.now();
    }
    clear() {
        localStorage.removeItem(this._storageKey);
    }
}


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_SCRIPT_STATE": () => (/* binding */ DEFAULT_SCRIPT_STATE)
/* harmony export */ });
const DEFAULT_SCRIPT_STATE = {
    version: "11.14",
    lastActiveGameList: null,
    platPricesCooldownTriggerTime: 0,
    guideSimpleMatching: false,
    seriesAutoCollapse: false,
    seriesDoNotCollapseNoStage: false,
    mySeriesCollapseNoStage: false,
    mySeriesCollapseNumberedStages: false,
    newListsSignature: '',
    latestGames: [],
    popularListsSignature: '',
    popularGames: [],
    newDLCSignature: '',
    dlcImages: [],
    activeChecklist: { guideId: '', checkedIds: [] },
    hideLowOwners: false,
    lowOwnersThreshold: 100,
    hideUnobtainableTrophiesInLog: false,
};


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IPlatPricesError": () => (/* binding */ IPlatPricesError),
/* harmony export */   "PLAT_PRICES_COOLDOWN_PERIOD": () => (/* binding */ PLAT_PRICES_COOLDOWN_PERIOD),
/* harmony export */   "PLAT_PRICES_REGIONS": () => (/* binding */ PLAT_PRICES_REGIONS),
/* harmony export */   "PlatPricesAPIError": () => (/* binding */ PlatPricesAPIError),
/* harmony export */   "fetchPrice": () => (/* binding */ fetchPrice)
/* harmony export */ });
/* harmony import */ var _settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);

const BASE_API_URL = 'https://platprices.com/psnpplus.php';
const PLAT_PRICES_COOLDOWN_PERIOD = 60 * 60 * 1000; // ONE HOUR
var IPlatPricesError;
(function (IPlatPricesError) {
    IPlatPricesError[IPlatPricesError["NETWORK_ERROR"] = -1] = "NETWORK_ERROR";
    IPlatPricesError[IPlatPricesError["OK"] = 0] = "OK";
    IPlatPricesError[IPlatPricesError["UNAUTHORIZED"] = 1] = "UNAUTHORIZED";
    IPlatPricesError[IPlatPricesError["FORBIDDEN"] = 2] = "FORBIDDEN";
    IPlatPricesError[IPlatPricesError["NOTFOUND"] = 3] = "NOTFOUND"; // 404, not found
})(IPlatPricesError || (IPlatPricesError = {}));
const PLAT_PRICES_REGIONS = {
    AR: 'Argentina',
    AU: 'Australia',
    AT: 'Austria',
    BE: 'Belgium',
    BR: 'Brazil',
    BG: 'Bulgaria',
    CA: 'Canada',
    CL: 'Chile',
    HR: 'Croatia',
    CZ: 'Czechia',
    DK: 'Denmark',
    FI: 'Finland',
    FR: 'France',
    DE: 'Germany',
    GR: 'Greece',
    HK: 'Hong Kong',
    HU: 'Hungary',
    IS: 'Iceland',
    IN: 'India',
    ID: 'Indonesia',
    IE: 'Ireland',
    IL: 'Israel',
    IT: 'Italy',
    JP: 'Japan',
    KR: 'Korea',
    MY: 'Malaysia',
    MX: 'Mexico',
    NL: 'Netherlands',
    NZ: 'New Zealand',
    NO: 'Norway',
    PL: 'Poland',
    PT: 'Portugal',
    RO: 'Romania',
    RU: 'Russia',
    SA: 'Saudi Arabia',
    SG: 'Singapore',
    SK: 'Slovakia',
    ZA: 'South Africa',
    ES: 'Spain',
    SE: 'Sweden',
    CH: 'Switzerland',
    TW: 'Taiwan',
    TH: 'Thailand',
    TR: 'Turkey',
    UA: 'Ukraine',
    AE: 'U. A. Emirates',
    GB: 'United Kingdom',
    US: 'United States'
};
class PlatPricesAPIError extends Error {
    constructor(response) {
        super('PlatPricesAPI Error');
        Object.setPrototypeOf(this, PlatPricesAPIError.prototype);
        this._response = response;
    }
    getErrorCode() {
        return this._response.error;
    }
    getNiceErrorMessage() {
        if (this._response.error == IPlatPricesError.NETWORK_ERROR) {
            return 'Network error. Please try again later.';
        }
        if (this._response.error === IPlatPricesError.OK) {
            return 'Invalid error state';
        }
        if (this._response.error === IPlatPricesError.UNAUTHORIZED) {
            return 'API key is invalid - check your settings';
        }
        if (this._response.error === IPlatPricesError.FORBIDDEN) {
            return 'Request limit reached - integration disabled for 1 hour';
        }
        if (this._response.error === IPlatPricesError.NOTFOUND) {
            return 'Not available';
        }
        return 'Invalid error state: ' + this._response.error;
    }
}
async function fetchPrice(trophyListIdentifiers) {
    const urlParamsObject = trophyListIdentifiers.reduce((acc, value, index) => {
        acc[`url${index + 1}`] = value;
        return acc;
    }, {});
    const settingsStorage = new _settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_0__.SettingsStorage();
    const apiKey = settingsStorage.get('platPricesApiKey');
    const region = settingsStorage.get('platPricesRegion');
    urlParamsObject['api'] = apiKey;
    urlParamsObject['reg'] = region;
    let req;
    try {
        req = await fetch(BASE_API_URL + '?' + new URLSearchParams(urlParamsObject));
    }
    catch (e) {
        console.warn('PlatPricesAPI Fetch failed', e);
        throw new PlatPricesAPIError({ error: -1 });
    }
    if (req.status >= 400 && req.status < 500) {
        const res = await req.json();
        throw new PlatPricesAPIError(res);
    }
    if (req.status !== 200) {
        throw new PlatPricesAPIError({ error: -1 });
    }
    return req.json();
}


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "UnobtainableTrophiesStorage": () => (/* binding */ UnobtainableTrophiesStorage)
/* harmony export */ });
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _storage_ExpirableStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26);


class UnobtainableTrophiesStorage extends _storage_ExpirableStorage__WEBPACK_IMPORTED_MODULE_1__.ExpirableStorage {
    constructor() {
        super({
            supportedVersion: 1,
            remoteUrl: _util_constants__WEBPACK_IMPORTED_MODULE_0__.LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST,
            storageKey: 'psnpp-unobtainabletrophies',
            // 4 hours
            expirationTimeMs: 4 * 60 * 60 * 1000,
            emptyValue: {},
            shouldWrap: false
        });
    }
    getByTrophyListId(id) {
        return this.get().data.list[id];
    }
}


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AUTHOR_PSN_ID": () => (/* binding */ AUTHOR_PSN_ID),
/* harmony export */   "COLOR_DARK_ORANGE": () => (/* binding */ COLOR_DARK_ORANGE),
/* harmony export */   "COLOR_DARK_YELLOW": () => (/* binding */ COLOR_DARK_YELLOW),
/* harmony export */   "COLOR_LIGHT_ORANGE": () => (/* binding */ COLOR_LIGHT_ORANGE),
/* harmony export */   "COLOR_LIGHT_YELLOW": () => (/* binding */ COLOR_LIGHT_YELLOW),
/* harmony export */   "COLOR_PURPLE": () => (/* binding */ COLOR_PURPLE),
/* harmony export */   "DEFAULT_TROPHY_LIST_ICON": () => (/* binding */ DEFAULT_TROPHY_LIST_ICON),
/* harmony export */   "EXTERNAL_SCRIPT_URLS": () => (/* binding */ EXTERNAL_SCRIPT_URLS),
/* harmony export */   "FAVICON_URL": () => (/* binding */ FAVICON_URL),
/* harmony export */   "HASH_ADVANCED_SEARCH": () => (/* binding */ HASH_ADVANCED_SEARCH),
/* harmony export */   "HASH_COMPARE_PLUS": () => (/* binding */ HASH_COMPARE_PLUS),
/* harmony export */   "HASH_GAME_LISTS": () => (/* binding */ HASH_GAME_LISTS),
/* harmony export */   "HASH_MY_SERIES": () => (/* binding */ HASH_MY_SERIES),
/* harmony export */   "HASH_PROFILE": () => (/* binding */ HASH_PROFILE),
/* harmony export */   "HASH_SHUTDOWNS": () => (/* binding */ HASH_SHUTDOWNS),
/* harmony export */   "HASH_UNOBTAINABLES": () => (/* binding */ HASH_UNOBTAINABLES),
/* harmony export */   "ICON_SPRITE": () => (/* binding */ ICON_SPRITE),
/* harmony export */   "LINK_AUTHOR_PSNP_PROFILE": () => (/* binding */ LINK_AUTHOR_PSNP_PROFILE),
/* harmony export */   "LINK_CHANGELOG": () => (/* binding */ LINK_CHANGELOG),
/* harmony export */   "LINK_DONATE": () => (/* binding */ LINK_DONATE),
/* harmony export */   "LINK_DONATORS": () => (/* binding */ LINK_DONATORS),
/* harmony export */   "LINK_GUIDES": () => (/* binding */ LINK_GUIDES),
/* harmony export */   "LINK_GUIDES_FULL": () => (/* binding */ LINK_GUIDES_FULL),
/* harmony export */   "LINK_MAIN_THREAD": () => (/* binding */ LINK_MAIN_THREAD),
/* harmony export */   "LINK_SERIES": () => (/* binding */ LINK_SERIES),
/* harmony export */   "LINK_SHUTDOWNS": () => (/* binding */ LINK_SHUTDOWNS),
/* harmony export */   "LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST": () => (/* binding */ LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST),
/* harmony export */   "LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST_FULL": () => (/* binding */ LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST_FULL),
/* harmony export */   "LINK_UNOBTAINABLE_TROPHIES_THREAD": () => (/* binding */ LINK_UNOBTAINABLE_TROPHIES_THREAD),
/* harmony export */   "LINK_WEBSITE": () => (/* binding */ LINK_WEBSITE),
/* harmony export */   "MAGIC_SPACE": () => (/* binding */ MAGIC_SPACE),
/* harmony export */   "NEW_TROPHY_ICONS": () => (/* binding */ NEW_TROPHY_ICONS),
/* harmony export */   "TROPHY_VALUES": () => (/* binding */ TROPHY_VALUES),
/* harmony export */   "UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN": () => (/* binding */ UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN)
/* harmony export */ });
const MAGIC_SPACE = ' ';
const UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN = 280;
const COLOR_DARK_ORANGE = '#db8320';
const COLOR_LIGHT_ORANGE = '#fbe2bf';
const COLOR_DARK_YELLOW = '#c5c500';
const COLOR_LIGHT_YELLOW = '#ffffed';
const COLOR_PURPLE = '#a77b34';
const HASH_PROFILE = '#profile';
const HASH_GAME_LISTS = '#gamelists';
const HASH_MY_SERIES = '#myseries';
const HASH_COMPARE_PLUS = '#compare-plus';
const HASH_UNOBTAINABLES = '#unobtainables';
const HASH_SHUTDOWNS = '#shutdowns';
const HASH_ADVANCED_SEARCH = '#advanced-search';
const EXTERNAL_SCRIPT_URLS = {
    JQUERY_UI: '/lib/js/jquery-ui.min.js',
    VANILLA_LAZYLOAD: 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/17.8.3/lazyload.min.js',
    PAPAPARSE: 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js',
    HTML2CANVAS: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    DATA_TABLES_JS: 'https://cdn.datatables.net/2.0.3/js/dataTables.min.js',
    DATA_TABLES_CSS: 'https://cdn.datatables.net/2.0.3/css/dataTables.dataTables.min.css',
};
const AUTHOR_PSN_ID = 'HusKyCode';
const LINK_AUTHOR_PSNP_PROFILE = 'https://psnprofiles.com/HusKyCode';
const LINK_WEBSITE = 'https://psnp-plus.huskycode.dev/';
const LINK_DONATE = 'https://psnp-plus.huskycode.dev/donate';
const LINK_CHANGELOG = 'https://psnp-plus.huskycode.dev/changelog.txt';
const LINK_MAIN_THREAD = 'https://forum.psnprofiles.com/topic/78709-psnp-plus';
const LINK_UNOBTAINABLE_TROPHIES_THREAD = 'https://forum.psnprofiles.com/topic/118915-psnp-unobtainable-trophies-master-list/';
const LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST = 'https://psnp-plus.huskycode.dev/list.min.json';
const LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST_FULL = 'https://psnp-plus.huskycode.dev/list.json';
const LINK_SERIES = 'https://psnp-plus.huskycode.dev/series.min.json';
const LINK_SHUTDOWNS = 'https://psnp-plus.huskycode.dev/shutdowns.min.json';
const LINK_DONATORS = 'https://psnp-plus.huskycode.dev/donators.min.json';
const LINK_GUIDES = 'https://psnp-plus.huskycode.dev/games-v2.min.json';
const LINK_GUIDES_FULL = 'https://psnp-plus.huskycode.dev/guides-v2.min.json';
const FAVICON_URL = 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=16&url=';
const NEW_TROPHY_ICONS = {
    x40: {
        platinum: 'https://psnp-plus.huskycode.dev/img/trophy-icons/40/platinum.png',
        gold: 'https://psnp-plus.huskycode.dev/img/trophy-icons/40/gold.png',
        silver: 'https://psnp-plus.huskycode.dev/img/trophy-icons/40/silver.png',
        bronze: 'https://psnp-plus.huskycode.dev/img/trophy-icons/40/bronze.png',
        hidden: 'https://psnp-plus.huskycode.dev/img/trophy-icons/40/hidden.png',
    },
    x24: {
        platinum: 'https://psnp-plus.huskycode.dev/img/trophy-icons/24/platinum.png',
        gold: 'https://psnp-plus.huskycode.dev/img/trophy-icons/24/gold.png',
        silver: 'https://psnp-plus.huskycode.dev/img/trophy-icons/24/silver.png',
        bronze: 'https://psnp-plus.huskycode.dev/img/trophy-icons/24/bronze.png',
        hidden: 'https://psnp-plus.huskycode.dev/img/trophy-icons/24/hidden.png',
    }
};
const DEFAULT_TROPHY_LIST_ICON = 'https://psnp-plus.huskycode.dev/img/list-icons/small.png';
const TROPHY_VALUES = {
    PLATINUM: 300,
    GOLD: 90,
    SILVER: 30,
    BRONZE: 15
};
const ICON_SPRITE = 'https://psnp-plus.huskycode.dev/img/sprites/icon-sprite.png';


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ExpirableStorage": () => (/* binding */ ExpirableStorage)
/* harmony export */ });
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);

class ExpirableStorage {
    constructor(config) {
        this._cache = null;
        this._config = config;
    }
    async _fetchVersionedJsonWrapped(url) {
        const res = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_0__.fetchJson)(url);
        return {
            version: this._config.supportedVersion,
            list: res
        };
    }
    _getEmptyValue() {
        return {
            timestamp: 0,
            data: {
                version: this._config.supportedVersion,
                list: this._config.emptyValue
            }
        };
    }
    get() {
        try {
            const data = localStorage.getItem(this._config.storageKey);
            if (data == null) {
                return this._getEmptyValue();
            }
            const parsed = JSON.parse(data);
            if (parsed.data.version !== this._config.supportedVersion) {
                this.clear();
                throw new Error('Invalid version, data cleared and will try to refetch next time.');
            }
            return parsed;
        }
        catch (e) {
            console.error('Failed to load data', this._config.storageKey, e);
            return this._getEmptyValue();
        }
    }
    cachedGet() {
        if (this._cache == null) {
            this._cache = this.get();
        }
        return this._cache;
    }
    _save(newList) {
        const toSave = {
            timestamp: Date.now(),
            data: newList
        };
        localStorage.setItem(this._config.storageKey, JSON.stringify(toSave));
    }
    clear() {
        localStorage.removeItem(this._config.storageKey);
    }
    async refresh(forceRefresh = false) {
        const currentData = this.get();
        if (currentData.timestamp + this._config.expirationTimeMs > Date.now() && !forceRefresh) {
            return false;
        }
        const newList = this._config.shouldWrap
            ? await this._fetchVersionedJsonWrapped(this._config.remoteUrl)
            : await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_0__.fetchJson)(this._config.remoteUrl);
        if (newList.version !== this._config.supportedVersion) {
            return false;
        }
        this._save(newList);
        return true;
    }
}


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ComparePlusStorage": () => (/* binding */ ComparePlusStorage)
/* harmony export */ });
/* harmony import */ var _storage_HybridStorage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(28);

class ComparePlusStorage {
    constructor() {
        this._storageKey = 'psnpp-compareplus';
        this._storage = new _storage_HybridStorage__WEBPACK_IMPORTED_MODULE_0__.HybridStorage();
    }
    async _get() {
        try {
            const data = await this._storage.getItem(this._storageKey);
            if (data == null) {
                return {};
            }
            return JSON.parse(data);
        }
        catch (e) {
            console.error('Failed to load compare plus data', e);
            return {};
        }
    }
    async getByTrophyListId(trophyListId) {
        const compareObject = await this._get();
        const value = compareObject[trophyListId];
        return value == null ? '' : value;
    }
    async set(trophyListId, comparePlusData) {
        const compareObject = await this._get();
        compareObject[trophyListId] = comparePlusData;
        this._save(compareObject);
    }
    async _save(compareObject) {
        await this._storage.setItem(this._storageKey, JSON.stringify(compareObject));
    }
    async clear() {
        await this._storage.removeItem(this._storageKey);
    }
    async export() {
        return this._get();
    }
    async import(compareObject) {
        await this._save(compareObject);
    }
}


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HybridStorage": () => (/* binding */ HybridStorage)
/* harmony export */ });
/**
 * NOTE: GM.* APIs used in this storage are not available
 * when running in UserScripts. We just fallback to localStorage.
 */
class HybridStorage {
    async setItem(key, value) {
        if (GM.setValue == null) {
            return localStorage.setItem(key, value);
        }
        localStorage.removeItem(key);
        return GM.setValue(key, value);
    }
    async getItem(key) {
        if (GM.getValue == null) {
            return localStorage.getItem(key);
        }
        const gmValue = await GM.getValue(key);
        return gmValue == null
            ? localStorage.getItem(key)
            : gmValue;
    }
    async removeItem(key) {
        if (GM.deleteValue != null) {
            await GM.deleteValue(key);
        }
        localStorage.removeItem(key);
    }
}


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PlatPricesStorage": () => (/* binding */ PlatPricesStorage)
/* harmony export */ });
/* harmony import */ var _PlatPricesAPI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(23);

const ONE_HOUR = 60 * 60 * 1000;
const TWELVE_HOURS = 12 * ONE_HOUR;
const TWENTYFOUR_HOURS = 2 * TWELVE_HOURS;
class PlatPricesStorage {
    constructor() {
        this._storageKey = 'psnpp-platprices';
    }
    get() {
        try {
            const prices = localStorage.getItem(this._storageKey);
            if (prices == null) {
                return [];
            }
            return JSON.parse(prices);
        }
        catch (e) {
            console.error('Failed to load prices from storage', e);
            return [];
        }
    }
    async getById(trophyListId, trophyListIdentifiers) {
        const prices = this.get();
        const price = prices.find(list => list.id === trophyListId);
        if (price == null || price.timestamp + TWELVE_HOURS < Date.now()) {
            let priceResponse;
            try {
                priceResponse = await (0,_PlatPricesAPI__WEBPACK_IMPORTED_MODULE_0__.fetchPrice)(trophyListIdentifiers);
            }
            catch (e) {
                const typedError = e;
                const errorCode = typedError.getErrorCode();
                // NOTE: Create dummy record for: 404, 5xx, random network errors
                if (errorCode === _PlatPricesAPI__WEBPACK_IMPORTED_MODULE_0__.IPlatPricesError.NETWORK_ERROR || errorCode === _PlatPricesAPI__WEBPACK_IMPORTED_MODULE_0__.IPlatPricesError.NOTFOUND) {
                    this.add({
                        id: trophyListId,
                        timestamp: Date.now() - TWELVE_HOURS + ONE_HOUR, // Expires in 1 hour
                        error: errorCode,
                        BasePrice: '',
                        SalePrice: '',
                        PlusPrice: '',
                        formattedBasePrice: '',
                        formattedSalePrice: '',
                        formattedPlusPrice: '',
                        PSStoreURL: '',
                        PlatPricesURL: '',
                        PSPExtra: '0',
                        PSPPremium: '0'
                    });
                }
                throw typedError;
            }
            const priceRecord = Object.assign({}, {
                id: trophyListId,
                timestamp: Date.now()
            }, priceResponse);
            this.add(priceRecord);
            return priceRecord;
            // NOTE: Price record exists and is not expired
        }
        else {
            // This is a cached error result
            // Throw error and UI will handle showing it to user
            if (price.error !== 0) {
                throw new _PlatPricesAPI__WEBPACK_IMPORTED_MODULE_0__.PlatPricesAPIError({ error: price.error });
            }
            return price;
        }
    }
    add(item) {
        const prices = this.get();
        const existsIndex = prices.findIndex((x) => x.id === item.id);
        if (existsIndex > -1) {
            prices[existsIndex] = item;
        }
        else {
            prices.push(item);
        }
        this._save(prices);
    }
    _save(newPrices) {
        localStorage.setItem(this._storageKey, JSON.stringify(newPrices));
    }
    clear() {
        localStorage.removeItem(this._storageKey);
    }
    clearExpired() {
        const prices = this.get();
        const validPrices = prices.filter(price => price.timestamp + TWENTYFOUR_HOURS > Date.now());
        this._save(validPrices);
    }
}


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GuideStorage": () => (/* binding */ GuideStorage)
/* harmony export */ });
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _storage_ExpirableStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26);


class GuideStorage extends _storage_ExpirableStorage__WEBPACK_IMPORTED_MODULE_1__.ExpirableStorage {
    constructor() {
        super({
            supportedVersion: 2,
            remoteUrl: _util_constants__WEBPACK_IMPORTED_MODULE_0__.LINK_GUIDES,
            storageKey: 'psnpp-guides',
            // 12 hours
            expirationTimeMs: 12 * 60 * 60 * 1000,
            emptyValue: { games: {}, processed: 0 },
            shouldWrap: true
        });
    }
}


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Panel": () => (/* binding */ Panel)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class PanelCornerButton extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(onClick) {
        super('a');
        this._onClick = onClick;
        this._build();
    }
    _build() {
        this
            .setAttribute('href', '#')
            .addClass('close')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img')
            .setAttribute('src', '/lib/img/layout/close.png')
            .setAttribute('title', 'close')
            .addClass('close_image')
            .click((e) => {
            e.preventDefault();
            this._onClick();
        }));
    }
}
class PanelTitle extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(title) {
        super('div');
        this._title = title;
        this._build();
    }
    _build() {
        this.addClass('title-bar', 'flex', 'v-align')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('grow')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('h3').setText(this._title)));
    }
}
class PanelMain extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(title, onClose) {
        super('div');
        this._title = title;
        this._onClose = onClose;
        this._holder = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('holder');
        this._build();
    }
    _build() {
        this
            .setAttribute('id', 'facebox')
            .setAttribute('style', `top: ${(window.scrollY || 0) + 50}px;`)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('popup')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('content')
            .append(new PanelTitle(this._title), this._holder), new PanelCornerButton(() => this._onClose())));
    }
    addContent(...content) {
        this._holder.append(...content);
    }
}
class PanelBackdrop extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(onClick) {
        super('div');
        this._onClick = onClick;
        this._build();
    }
    _build() {
        this.setAttribute('id', 'facebox_overlay')
            .setAttribute('style', 'opacity: 0.5; display: block;')
            .addClass('facebox_overlayBG')
            .click(() => this._onClick());
    }
}
class Panel extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(title) {
        super('div');
        this._backdropCloseEnabled = true;
        this._resolver = null;
        this._title = title;
        this._main = new PanelMain(this._title, () => this.remove());
        this._build();
    }
    _build() {
        this.append(this._main, new PanelBackdrop(() => {
            if (this._backdropCloseEnabled) {
                this.remove();
            }
        }));
    }
    addContent(...content) {
        this._main.addContent(...content);
    }
    disableBackdropClose() {
        this._backdropCloseEnabled = false;
    }
    wait() {
        return new Promise((resolve) => {
            this._resolver = resolve;
        });
    }
    resolve(result) {
        if (this._resolver != null) {
            this._resolver(result);
        }
    }
}


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PanelSection": () => (/* binding */ PanelSection)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class PanelSectionTitle extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(title) {
        super('div');
        this._build(title);
    }
    _build(title) {
        this.addClass('title', 'center', 'flex', 'v-align')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('grow')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('h3').setText(title)));
    }
}
class PanelSection extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(sectionTitle, ...children) {
        super('div');
        this._sectionTitle = sectionTitle;
        this._children = children;
        this._build();
    }
    _build() {
        const childrenContainer = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('box', 'no-top-border', 'form')
            .setAttribute('style', 'padding: 10px;');
        this._children.forEach(c => {
            childrenContainer.append(c);
        });
        this
            .addClass('row')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-12')
            .append(new PanelSectionTitle(this._sectionTitle), childrenContainer));
    }
}


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PanelInput": () => (/* binding */ PanelInput)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34);


class PanelInput extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(label, value, tooltipText, validator = () => true, action = null) {
        super('div');
        this._input = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('input');
        this._label = label;
        this._value = value;
        this._tooltipText = tooltipText;
        this._validator = validator;
        this._action = action;
        this._build();
    }
    _build() {
        this._input = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('input')
            .setAttribute('type', 'text')
            .setAttribute('value', this._value);
        if (this._tooltipText !== '') {
            this._input.apply(e => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_1__.tooltip)(e, this._tooltipText));
        }
        this
            .addClass('row', 'middle-xs')
            .setAttribute('style', 'margin-top: 10px; margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-2')
            .setAttribute('style', 'text-align: right;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('small-title')
            .setText(this._label)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass(this._action == null ? 'col-xs-10' : 'col-xs-9')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label')
            .addClass('input')
            .append(this._input, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i'))), this._action == null
            ? null
            : _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div').addClass('col-xs-1').append(this._action));
    }
    setValue(value) {
        this._input.setValue(value);
        return this;
    }
    serialize() {
        return this._input.getValue().trim();
    }
    commaSeparatedList() {
        return this.serialize()
            .split(',')
            .map((x) => x.trim())
            .filter((x) => x !== '');
    }
    validate() {
        const validationResult = this._validator(this.serialize());
        if (!validationResult) {
            this._input.setCss('borderColor', '#ffb6c1');
        }
        else {
            this._input.setCss('borderColor', '#e3e3e6');
        }
        return validationResult;
    }
}


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "activateSpoilers": () => (/* binding */ activateSpoilers),
/* harmony export */   "gamesListCanBeExpanded": () => (/* binding */ gamesListCanBeExpanded),
/* harmony export */   "loadAllGames": () => (/* binding */ loadAllGames),
/* harmony export */   "loadJqueryUi": () => (/* binding */ loadJqueryUi),
/* harmony export */   "sortable": () => (/* binding */ sortable),
/* harmony export */   "tooltip": () => (/* binding */ tooltip)
/* harmony export */ });
/* harmony import */ var _observe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(35);
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(13);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(25);




function tooltip(element, text) {
    $(element).tipTip({
        defaultPosition: 'bottom',
        maxWidth: '500px',
        edgeOffset: 0,
        delay: 0,
        fadeIn: 50,
        fadeOut: 50,
        content: text
    });
}
function loadAllGames(callback) {
    if (nextPage === 0) {
        callback();
        return;
    }
    const disconnect = (0,_observe__WEBPACK_IMPORTED_MODULE_0__.gamesObserve)(() => {
        disconnect();
        setTimeout(() => loadAllGames(callback), 1000);
    });
    loadMoreGames();
    nextPage = 0;
}
function gamesListCanBeExpanded() {
    return nextPage > 0;
}
function loadJqueryUi() {
    return (0,_fetch__WEBPACK_IMPORTED_MODULE_2__.loadScriptTag)(_constants__WEBPACK_IMPORTED_MODULE_3__.EXTERNAL_SCRIPT_URLS.JQUERY_UI);
}
function sortable(element, onSort) {
    $(element).sortable({
        axis: 'y',
        containment: $(_J__WEBPACK_IMPORTED_MODULE_1__.J.q('body').get()),
        cursor: 'ns-resize',
        handle: 'div.draggable-list-handle',
        placeholder: 'placeholder',
        revert: '150',
        items: 'tr',
        scrollSpeed: 50,
        scrollSensitivity: 100,
        start: (e, ui) => {
            ui.item.data('previndex', ui.item.index());
        },
        update: (e, ui) => onSort(e, ui),
    });
}
function activateSpoilers() {
    prepareSpoilers();
}


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "gamesObserve": () => (/* binding */ gamesObserve),
/* harmony export */   "htmlObserve": () => (/* binding */ htmlObserve),
/* harmony export */   "observe": () => (/* binding */ observe)
/* harmony export */ });
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

function observe(target, callback) {
    const observer = new MutationObserver(callback);
    observer.observe(target.get(), { childList: true, subtree: true });
    return () => observer.disconnect();
}
let singletonHtmlObserveDisconnect = null;
const htmlObserveCallbacks = [];
function htmlObserve(callback) {
    htmlObserveCallbacks.push(callback);
    if (singletonHtmlObserveDisconnect == null) {
        singletonHtmlObserveDisconnect = observe(_J__WEBPACK_IMPORTED_MODULE_0__.J.q('html'), (mutations, observer) => {
            htmlObserveCallbacks.forEach(x => x(mutations, observer));
        });
    }
}
function gamesObserve(callback) {
    const disconnect = observe(_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable').parent(), (mutations, observer) => {
        const scrollLoaderExists = _J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody > tr#table-loading').exists();
        const searchLoaderExists = _J__WEBPACK_IMPORTED_MODULE_0__.J.q(`#${CSS.escape('search-results')} .loadingoverlay`).exists();
        if (scrollLoaderExists || searchLoaderExists) {
            return;
        }
        callback(mutations, observer);
    });
    return disconnect;
}


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PanelCheckbox": () => (/* binding */ PanelCheckbox)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34);


class PanelCheckbox extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(label, value, labelTooltipText = undefined) {
        super('div');
        this._input = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('input');
        this._label = label;
        this._value = value;
        this._labelTooltipText = labelTooltipText;
        this._build();
    }
    _build() {
        this._input = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('input')
            .setAttribute('type', 'checkbox');
        if (this._value) {
            this._input.setAttribute('checked', 'checked');
        }
        this
            .addClass('row', 'middle-xs')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-10', 'col-xs-offset-2')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label')
            .addClass('checkbox')
            .append(this._input, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').setText(this._label).apply(el => {
            if (this._labelTooltipText != null) {
                (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_1__.tooltip)(el, this._labelTooltipText);
            }
        }))));
    }
    serialize() {
        return this._input.get().checked;
    }
}


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PanelBottom": () => (/* binding */ PanelBottom)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class PanelBottom extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(saveButtonLabel, onClickSave, closeButtonLabel, onClickClose) {
        super('div');
        this._onClickSave = onClickSave;
        this._onClickClose = onClickClose;
        this._saveButtonLabel = saveButtonLabel;
        this._closeButtonLabel = closeButtonLabel;
        this._build();
    }
    _build() {
        this.addClass('bottom', 'cf')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('floatr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setAttribute('style', 'margin-right: 4px;')
            .addClass('button', 'green')
            .setText(this._saveButtonLabel)
            .click((e) => {
            this._onClickSave();
            e.preventDefault();
        }), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'red')
            .setText(this._closeButtonLabel)
            .click((e) => {
            this._onClickClose();
            e.preventDefault();
        })));
    }
}


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PanelSelect": () => (/* binding */ PanelSelect)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class PanelSelect extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(label, value, options) {
        super('div');
        this._label = label;
        this._value = value;
        this._options = options;
        this._build();
    }
    _build() {
        this
            .addClass('row', 'middle-xs')
            .setAttribute('style', 'margin-top: 10px; margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-2')
            .setAttribute('style', 'text-align: right;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('small-title')
            .setText(this._label)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-10')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label')
            .addClass('select')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('select')
            .change(e => {
            if (e == null || e.target == null) {
                return;
            }
            this._value = e.target.value;
        })
            .append(...Object.keys(this._options).map(key => {
            return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('option')
                .setAttribute('value', key)
                .setText(this._options[key])
                .condition(this._value === key, (el) => el.setAttribute('selected', 'selected'));
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i'))));
    }
    serialize() {
        return this._value;
    }
}


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "appendPanel": () => (/* binding */ appendPanel),
/* harmony export */   "appendPanelWait": () => (/* binding */ appendPanelWait)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

function appendPanel(panel) {
    _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('body').append(panel);
}
function appendPanelWait(panel) {
    _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('body').append(panel);
    return panel.wait();
}


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListRefreshPanel": () => (/* binding */ ListRefreshPanel)
/* harmony export */ });
/* harmony import */ var _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(31);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _ListStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);



class SimpleProgress extends _util_J__WEBPACK_IMPORTED_MODULE_1__.JC {
    constructor() {
        super('span');
        this.done = 0;
        this.total = 0;
        this.hide();
        this.refresh();
    }
    refresh() {
        this.setText(`[ Progress: ${this.done}/${this.total} ]`);
    }
}
class ListRefreshPanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor() {
        super('Refresh games in your lists');
        this._addContent();
        this.disableBackdropClose();
    }
    _addContent() {
        const progress = new SimpleProgress();
        const buttonsContainer = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('center');
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('center')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append('PSNP+ allows you to refresh game data in your non-remote lists (name of the game, completion rates, guide availability etc.).', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), 'Each unique game in your lists can be refreshed once every 24 hours, but in general, you should not need to run this more than once every few weeks. It takes about 2-3 seconds to refresh a single game on average. Once you start the process, leave the window open and let PSNP+ finish the refresh.', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), 'Once the process is done, every game across all of your lists will be refreshed.', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), 'As a friendly reminder, make regular backups of your PSNP+ data every once in a while if you make large changes.'), buttonsContainer
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'blue')
            .setText('Refresh')
            .click(async (e) => {
            e.preventDefault();
            buttonsContainer.hide();
            const listStorage = new _ListStorage__WEBPACK_IMPORTED_MODULE_2__.ListStorage();
            progress.total = listStorage.getUniqueGamesForRefresh().length;
            progress.refresh();
            progress.show();
            await listStorage.refresh((state, index) => {
                if (state === 'success' && index !== null) {
                    progress.done = index + 1;
                    progress.refresh();
                }
                if (state === 'done') {
                    progress.setText('[ Refresh is done. You can reload the page now. ]');
                    buttonsContainer.empty()
                        .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                        .setAttribute('href', '#')
                        .addClass('button', 'green')
                        .setText('Reload')
                        .click((e) => {
                        e.preventDefault();
                        location.reload();
                    }))
                        .show();
                }
            });
        }), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'red')
            .setText('Close')
            .click((e) => {
            e.preventDefault();
            this.remove();
        })), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('center')
            .append(progress)));
    }
}


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "UpdatePanel": () => (/* binding */ UpdatePanel)
/* harmony export */ });
/* harmony import */ var _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(31);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(25);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(13);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3);




class UpdatePanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor() {
        super('PSNP+ Update');
        this._addContent();
        this._loadChangelog();
        this.disableBackdropClose();
    }
    async _loadChangelog() {
        try {
            const changelog = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_2__.fetchText)(_util_constants__WEBPACK_IMPORTED_MODULE_1__.LINK_CHANGELOG);
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-changelog').setValue(changelog);
        }
        catch (e) {
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-changelog').setValue('Failed to load changelog: ' + e.message);
        }
    }
    _addContent() {
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('center')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('img').setAttribute('src', "https://psnp-plus.huskycode.dev/icon.png"), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
            .setAttribute('style', 'font-size: 20px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText('PSNP+'), ' has been updated to ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText(`v${"11.14"}`)), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .setAttribute('style', 'margin: 10px 0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('small')
            .setAttribute('style', 'padding: 3px; background-color: #E2AA51; border: 1px solid #a77b34; border-radius: 2px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_1__.LINK_DONATE)
            .setAttribute('target', '_blank')
            .setAttribute('style', 'color: white;')
            .append('If you find PSNP+ useful, please consider supporting this project and buying me a coffee ☕. Thanks!'))), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('form')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('label')
            .addClass('textarea')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('textarea')
            .setAttribute('id', 'psnpp-changelog')
            .setAttribute('readonly', 'readonly')
            .setAttribute('style', 'width: 60%; height: 200px; font-family: monospace;'))), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), 'Visit ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_1__.LINK_MAIN_THREAD)
            .setAttribute('target', '_blank')
            .setText('discussion thread'), ' for more info.'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('center')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'red')
            .setText('Close')
            .click((e) => {
            e.preventDefault();
            this.remove();
        }))));
    }
}


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "safeRun": () => (/* binding */ safeRun)
/* harmony export */ });
async function safeRun(func) {
    try {
        await func();
    }
    catch (e) {
        console.error('[PSNP+ SafeRun]', e);
    }
}


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Icon": () => (/* binding */ Icon)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class Icon extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(icon) {
        super('i');
        this._build(icon);
    }
    _build(icon) {
        this
            .addClass('fa', icon)
            .setAttribute('aria-hidden', 'true');
    }
}


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DonatorsStorage": () => (/* binding */ DonatorsStorage)
/* harmony export */ });
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _storage_ExpirableStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26);


class DonatorsStorage extends _storage_ExpirableStorage__WEBPACK_IMPORTED_MODULE_1__.ExpirableStorage {
    constructor() {
        super({
            supportedVersion: 1,
            remoteUrl: _util_constants__WEBPACK_IMPORTED_MODULE_0__.LINK_DONATORS,
            storageKey: 'psnpp-donators',
            // 4 hours
            expirationTimeMs: 4 * 60 * 60 * 1000,
            emptyValue: {},
            shouldWrap: false
        });
    }
    getDonatorStatus(psnId) {
        const donators = this.cachedGet();
        if (donators.data.list[psnId] == null) {
            return {
                isDonator: false,
                count: 0
            };
        }
        return { isDonator: true, count: donators.data.list[psnId] };
    }
}


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ShutdownsStorage": () => (/* binding */ ShutdownsStorage)
/* harmony export */ });
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _storage_ExpirableStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(26);


class ShutdownsStorage extends _storage_ExpirableStorage__WEBPACK_IMPORTED_MODULE_1__.ExpirableStorage {
    constructor() {
        super({
            supportedVersion: 1,
            remoteUrl: _util_constants__WEBPACK_IMPORTED_MODULE_0__.LINK_SHUTDOWNS,
            storageKey: 'psnpp-shutdowns',
            // 24 hours
            expirationTimeMs: 24 * 60 * 60 * 1000,
            emptyValue: {},
            shouldWrap: false
        });
    }
    getByTrophyListId(id) {
        return this.get().data.list[id];
    }
}


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Frontpage": () => (/* binding */ Frontpage)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19);
/* harmony import */ var _util_observe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(35);
/* harmony import */ var _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(20);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(25);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(21);
/* harmony import */ var _features_blacklist_GamesScraper__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(47);
/* harmony import */ var _features_lists_platforms__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(48);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(34);
/* harmony import */ var _util_Logger__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(49);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(13);












class Frontpage {
    constructor(settingsStorage) {
        this._settingsStorage = settingsStorage;
        this._logger = new _util_Logger__WEBPACK_IMPORTED_MODULE_10__.Logger(this._settingsStorage.get('enableScriptLogger'), 'Frontpage');
    }
    _getRedirect() {
        return (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getSearchParams)().get('redirect');
    }
    _isRedirectSet() {
        const redirectParam = this._getRedirect();
        return (typeof redirectParam === 'string' && redirectParam.length > 0);
    }
    _getPsnId() {
        return (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getSearchParams)().get('psnId');
    }
    _overrideRefreshBox() {
        // Override green Update User button
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.button.green', { containsText: 'Update User' })
            .setAttribute('onclick', '')
            .click((e) => {
            e.preventDefault();
            const psnId = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#psnId').getValue();
            if (psnId === '') {
                return;
            }
            (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.redirect)((0,_util_user__WEBPACK_IMPORTED_MODULE_2__.getUpdateProfileRedirectPathname)(psnId, '/' + psnId));
        });
        // Override 'Update' button in inline results
        const observableTarget = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#inline-results');
        if (!observableTarget.exists()) {
            return;
        }
        (0,_util_observe__WEBPACK_IMPORTED_MODULE_3__.observe)(observableTarget, () => {
            (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('#inline-results tr').forEach((el) => {
                const username = el.clone().find('td', { eq: 0 }).find('a').getText();
                el
                    .find('td', { eq: 1 })
                    .find('a', { eq: 1 })
                    .setAttribute('onclick', '')
                    .setAttribute('href', (0,_util_user__WEBPACK_IMPORTED_MODULE_2__.getUpdateProfileRedirectPathname)(username, '/' + username));
            });
        });
    }
    _highlightRelevantDlcs() {
        const gameProgressStorage = new _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_4__.GameProgressStorage();
        const gameProgressList = gameProgressStorage.indexedById();
        const newDlcBanner = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.grow > h3', { equalsText: 'New DLC' });
        const newDlcTable = newDlcBanner
            .clone()
            .parent()
            .parent()
            .next()
            .find('table.zebra');
        (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('tr', {}, newDlcTable.get()).forEach(el => {
            const pathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getFirstLevelIdFromPathname)(pathname);
            const gameProgress = gameProgressList.get(trophyListId);
            if (gameProgress == null) {
                return;
            }
            el.setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_5__.COLOR_LIGHT_YELLOW);
        });
    }
    async _mergePopularGames() {
        const header = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('h3', { equalsText: 'Popular Games This Week' });
        const gamesContainer = header.parent().parent().next();
        const signature = (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('tr', {}, gamesContainer.get())
            .map(row => {
            const pathname = row.clone().find('span.small-title').parent().getAttribute('href');
            const recentPlayers = row.clone().find('span.typo-top').getText();
            return (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getFirstLevelIdFromPathname)(pathname) + recentPlayers;
        })
            .join('');
        const scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_6__.ScriptStateStorage();
        const storedSignature = scriptStateStorage.get('popularListsSignature');
        let popularGames = scriptStateStorage.get('popularGames');
        if (storedSignature !== signature) {
            try {
                popularGames = await _features_blacklist_GamesScraper__WEBPACK_IMPORTED_MODULE_7__.GamesScraper.getFromUrl('https://psnprofiles.com/games?order=popular');
                scriptStateStorage.set('popularListsSignature', signature);
                scriptStateStorage.set('popularGames', popularGames);
            }
            catch (e) {
                this._logger.error('Failed to fetch popular games', e);
            }
        }
        const duplicateInfo = {};
        const gamesToUse = [];
        for (let i = 0; i < popularGames.length; i++) {
            const matchingGame = gamesToUse.find(game => game.title === popularGames[i].title);
            if (matchingGame != null) {
                duplicateInfo[popularGames[i].title] = duplicateInfo[popularGames[i].title] || 0;
                duplicateInfo[popularGames[i].title]++;
                for (const [key, value] of Object.entries(popularGames[i].platforms)) {
                    if (value) {
                        matchingGame.platforms[key] = value;
                    }
                }
                matchingGame.recent += popularGames[i].recent;
                continue;
            }
            if (gamesToUse.length < 10) {
                gamesToUse.push(popularGames[i]);
            }
        }
        gamesToUse.sort((a, b) => b.recent - a.recent);
        gamesContainer.empty();
        gamesContainer.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('table')
            .addClass('zebra')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tbody')
            .append(...gamesToUse.map(game => {
            return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tr')
                .addClass('even')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', game.url)
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img')
                .addClass('game')
                .setAttribute('src', game.image))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                .setAttribute('style', 'width: 100%;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .addClass('line-clamp', 'two', 'title')
                .setAttribute('href', game.url)
                .setText(game.title), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                .addClass('platforms')
                .append(...Object.entries((0,_features_lists_platforms__WEBPACK_IMPORTED_MODULE_8__.mapPlatforms)(game.platforms))
                .map(([key, value]) => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .addClass('tag', 'platform', key)
                .setText(value)), duplicateInfo[game.title] != null
                ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                    .addClass('small-info')
                    .setAttribute('href', '/search/games?q=' + encodeURIComponent(game.title))
                    .setText(` (+${duplicateInfo[game.title]})`)
                    .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_9__.tooltip)(el, `Number of hidden stacks: ${duplicateInfo[game.title]}. Click to search.`))
                : null)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-top').setText(game.recent.toLocaleString('en-US')), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-bottom').setText('Players'))));
        }))));
    }
    async _hideStacksInNewTrophylists() {
        const header = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('h3', { equalsText: 'New Trophy Lists' });
        const gamesContainer = header.parent().parent().next();
        const signature = (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('tr', {}, gamesContainer.get())
            .map(row => {
            const pathname = row.clone().find('a.title').getAttribute('href');
            return (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getFirstLevelIdFromPathname)(pathname);
        })
            .join('');
        const scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_6__.ScriptStateStorage();
        const storedSignature = scriptStateStorage.get('newListsSignature');
        let latestGames = scriptStateStorage.get('latestGames');
        if (storedSignature !== signature) {
            try {
                latestGames = await _features_blacklist_GamesScraper__WEBPACK_IMPORTED_MODULE_7__.GamesScraper.getFromUrl('https://psnprofiles.com/games');
                scriptStateStorage.set('newListsSignature', signature);
                scriptStateStorage.set('latestGames', latestGames);
            }
            catch (e) {
                this._logger.error('Failed to fetch new games', e);
            }
        }
        const duplicateInfo = {};
        const gamesToUse = [];
        for (let i = 0; i < latestGames.length; i++) {
            const matchingGameIndex = gamesToUse.findIndex(game => game.title === latestGames[i].title);
            const matchingGame = gamesToUse[matchingGameIndex];
            if (matchingGame != null) {
                duplicateInfo[latestGames[i].title] = duplicateInfo[latestGames[i].title] || 0;
                duplicateInfo[latestGames[i].title]++;
                for (const [key, value] of Object.entries(latestGames[i].platforms)) {
                    if (value) {
                        matchingGame.platforms[key] = value;
                    }
                }
                // Prefer PS5 trophy list... this is ugly
                if (latestGames[i].platforms.ps5) {
                    for (const [key, value] of Object.entries(matchingGame.platforms)) {
                        if (value) {
                            latestGames[i].platforms[key] = value;
                        }
                    }
                    gamesToUse[matchingGameIndex] = latestGames[i];
                }
                continue;
            }
            gamesToUse.push(latestGames[i]);
            if (gamesToUse.length === 10) {
                break;
            }
        }
        gamesContainer.empty();
        gamesContainer.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('table')
            .addClass('zebra')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tbody')
            .append(...gamesToUse.map(game => {
            return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tr')
                .addClass('even')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', game.url)
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img')
                .addClass('game')
                .setAttribute('src', game.image))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                .setAttribute('style', 'width: 100%;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .addClass('line-clamp', 'two', 'title')
                .setAttribute('href', game.url)
                .setText(game.title), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                .addClass('platforms')
                .append(...Object.entries((0,_features_lists_platforms__WEBPACK_IMPORTED_MODULE_8__.mapPlatforms)(game.platforms))
                .map(([key, value]) => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .addClass('tag', 'platform', key)
                .setText(value)), duplicateInfo[game.title] != null
                ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                    .addClass('small-info')
                    .setAttribute('href', '/search/games?q=' + encodeURIComponent(game.title))
                    .setText(` (+${duplicateInfo[game.title]})`)
                    .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_9__.tooltip)(el, `Number of hidden stacks: ${duplicateInfo[game.title]}. Click to search.`))
                : null)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                .addClass('trophy-count', 'cf')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('ul')
                .addClass('floatr')
                .append(game.trophies.platinum === 1
                ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').addClass('icon-sprite', 'platinum').setText(game.trophies.platinum.toString())
                : null, _util_constants__WEBPACK_IMPORTED_MODULE_5__.MAGIC_SPACE, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').addClass('icon-sprite', 'gold').setText(game.trophies.gold.toString()), _util_constants__WEBPACK_IMPORTED_MODULE_5__.MAGIC_SPACE, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').addClass('icon-sprite', 'silver').setText(game.trophies.silver.toString()), _util_constants__WEBPACK_IMPORTED_MODULE_5__.MAGIC_SPACE, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').addClass('icon-sprite', 'bronze').setText(game.trophies.bronze.toString())), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .addClass('small-info', 'floatr')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b')
                .setText((game.trophies.platinum + game.trophies.gold + game.trophies.silver + game.trophies.bronze).toString()), ' Trophies ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(game.points.toLocaleString('en-US')), ' Points'))));
        }))));
    }
    async _loadDlcImages() {
        const header = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('h3', { equalsText: 'New DLC' });
        const gamesContainer = header.parent().parent().next();
        const pathnames = (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('tr', {}, gamesContainer.get())
            .map(row => row.clone().find('a.title').getAttribute('href'));
        const signature = pathnames.join(',');
        const scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_6__.ScriptStateStorage();
        const storedSignature = scriptStateStorage.get('newDLCSignature');
        let dlcImages = scriptStateStorage.get('dlcImages');
        if (signature !== storedSignature) {
            const dlcDocument = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_11__.fetchDocument)('https://psnprofiles.com/games/dlc');
            dlcImages = pathnames.map(pathname => {
                return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q(`a.title[href="${pathname}"]`, {}, dlcDocument)
                    .parent()
                    .prev()
                    .find('picture')
                    .getOuterHTML();
            });
            scriptStateStorage.set('newDLCSignature', signature);
            scriptStateStorage.set('dlcImages', dlcImages);
        }
        (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('tr', {}, gamesContainer.get()).forEach((row, i) => {
            row.find('a')
                .empty()
                .setInnerHtml(dlcImages[i]);
        });
    }
    run() {
        this._logger.debug('Running');
        const shouldRedirect = this._isRedirectSet();
        const psnId = this._getPsnId();
        if (shouldRedirect && psnId != null) {
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.button.green', { containsText: 'Update User' }).triggerClick();
            const destroy = (0,_util_observe__WEBPACK_IMPORTED_MODULE_3__.observe)(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div#processing'), () => {
                const updateDone = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.psn-info').find('span.success', { containsText: 'Updated' }).exists();
                const errorOccured = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.psn-info').find('span.error', { containsText: 'Error' }).exists();
                if (updateDone || errorOccured) {
                    destroy();
                }
                if (updateDone) {
                    const redirectPath = this._getRedirect();
                    if (redirectPath != null) {
                        (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.redirect)(redirectPath);
                    }
                }
            });
            return;
        }
        if (location.hash.startsWith(_util_constants__WEBPACK_IMPORTED_MODULE_5__.HASH_PROFILE)) {
            const websiteUrl = (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getWebsiteUrl)();
            const psnId = (0,_util_user__WEBPACK_IMPORTED_MODULE_2__.getPsnId)();
            const searchParams = (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getSearchParamsFromHash)();
            const hash = searchParams.get('hash');
            this._logger.debug('Redirecting to profile. Hash:', hash);
            const urlToRedirectTo = `${websiteUrl}/${psnId}${hash == null ? '' : '#' + hash}`;
            location.href = urlToRedirectTo;
            return;
        }
        if (this._settingsStorage.get('automaticallyRedirectAfterUpdatingProfile')) {
            this._overrideRefreshBox();
        }
        if (this._settingsStorage.get('hideStacksOnTheFrontpage')) {
            this._hideStacksInNewTrophylists();
        }
        if (this._settingsStorage.get('mergePopularGamesOnTheFrontpage')) {
            this._mergePopularGames();
        }
        if (this._settingsStorage.get('loadDLCImagesOnTheFrontpage')) {
            this._loadDlcImages();
        }
        this._highlightRelevantDlcs();
    }
}


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GamesScraper": () => (/* binding */ GamesScraper)
/* harmony export */ });
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);



class GamesScraper {
    constructor(doc) {
        this._doc = doc;
    }
    _q(query, options = {}) {
        return _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q(query, options, this._doc);
    }
    getFromGamesPage() {
        const gameList = this._q('#game_list');
        return (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('tr', {}, gameList.get()).map(row => {
            const titleElement = row.clone().find('a.title');
            const pathname = titleElement.getAttribute('href');
            const id = (0,_util_url__WEBPACK_IMPORTED_MODULE_2__.getFirstLevelIdFromPathname)(pathname);
            const title = titleElement.getText();
            const image = row.clone().find('picture img').getAttribute('src');
            const url = (0,_util_url__WEBPACK_IMPORTED_MODULE_2__.getWebsiteUrl)() + pathname;
            const pointsText = row.clone().find('span.small-info', { eq: 1 }).find('b', { eq: 1 }).getText().replace(/[^\d]*/g, '');
            const points = parseInt(pointsText, 10);
            const owners = parseInt(row.clone().find('span.small-info').find('b').getText().replace(/[^\d]*/g, ''), 10);
            const recent = parseInt(row.clone().find('span.small-info').find('b', { eq: 1 }).getText().replace(/[^\d]*/g, ''), 10);
            const platinumElement = row.clone().find('span.icon-sprite.platinum');
            const platinum = platinumElement.exists()
                ? parseInt(platinumElement.next().getText(), 10)
                : 0;
            const gold = parseInt(row.clone().find('span.icon-sprite.gold').next().getText(), 10);
            const silver = parseInt(row.clone().find('span.icon-sprite.silver').next().getText(), 10);
            const bronze = parseInt(row.clone().find('span.icon-sprite.bronze').next().getText(), 10);
            const isPS5 = row.clone().find('span.tag.platform.ps5').exists();
            const isPS4 = row.clone().find('span.tag.platform.ps4').exists();
            const isPS3 = row.clone().find('span.tag.platform.ps3').exists();
            const isPSVITA = row.clone().find('span.tag.platform.psvita').exists();
            const isPSVR = row.clone().find('span.tag.platform.psvr').exists();
            const isPC = row.clone().find('span.tag.platform.pc').exists();
            return {
                id,
                title,
                image,
                url,
                points,
                owners,
                recent,
                platforms: {
                    ps3: isPS3,
                    ps4: isPS4,
                    ps5: isPS5,
                    psvita: isPSVITA,
                    psvr: isPSVR,
                    pc: isPC,
                },
                trophies: {
                    platinum,
                    gold,
                    silver,
                    bronze
                }
            };
        });
    }
    static async getFromUrl(url) {
        const doc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_0__.fetchDocument)(url);
        return new GamesScraper(doc).getFromGamesPage();
    }
}


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mapPlatforms": () => (/* binding */ mapPlatforms)
/* harmony export */ });
const PLATFORM_MAP = {
    ps5: 'PS5',
    ps4: 'PS4',
    ps3: 'PS3',
    psvita: 'Vita',
    psvr: 'VR',
    pc: 'PC'
};
function mapPlatforms(platforms) {
    const mapped = {};
    if (platforms == null) {
        return mapped;
    }
    Object.keys(platforms).forEach((key) => {
        const platformFlagSet = platforms[key] === true;
        if (platformFlagSet) {
            mapped[key] = PLATFORM_MAP[key];
        }
    });
    return mapped;
}


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Logger": () => (/* binding */ Logger)
/* harmony export */ });
class Logger {
    constructor(enabled, marker) {
        this._enabled = enabled;
        this._marker = marker;
    }
    _getTag(level) {
        return `[PSNP+][${this._marker}][${level}]`;
    }
    log(...args) {
        if (this._enabled) {
            console.log(this._getTag('log'), ...args);
        }
    }
    warn(...args) {
        if (this._enabled) {
            console.warn(this._getTag('warn'), ...args);
        }
    }
    error(...args) {
        if (this._enabled) {
            console.error(this._getTag('error'), ...args);
        }
    }
    debug(...args) {
        if (this._enabled) {
            console.debug(this._getTag('debug'), ...args);
        }
    }
}


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FrontpageImmediate": () => (/* binding */ FrontpageImmediate)
/* harmony export */ });
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(51);

class FrontpageImmediate {
    constructor(settingsStorage) {
        this._settingsStorage = settingsStorage;
    }
    run() {
        console.debug('FrontpageImmediate module is running');
        if (this._settingsStorage.get('resizePS5Icons')) {
            (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.STYLESHEET_FRONTPAGE_RESIZE_PS5_ICONS);
        }
        if (this._settingsStorage.get('compactBanners')) {
            (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.STYLESHEET_FRONTPAGE_COMPACT_BANNERS);
        }
    }
}


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "STYLESHEET_COMPACT_BANNERS": () => (/* binding */ STYLESHEET_COMPACT_BANNERS),
/* harmony export */   "STYLESHEET_FRONTPAGE_COMPACT_BANNERS": () => (/* binding */ STYLESHEET_FRONTPAGE_COMPACT_BANNERS),
/* harmony export */   "STYLESHEET_FRONTPAGE_RESIZE_PS5_ICONS": () => (/* binding */ STYLESHEET_FRONTPAGE_RESIZE_PS5_ICONS),
/* harmony export */   "STYLESHEET_GLOBAL": () => (/* binding */ STYLESHEET_GLOBAL),
/* harmony export */   "STYLESHEET_GLOBAL_FLOATING_MENU_STYLE": () => (/* binding */ STYLESHEET_GLOBAL_FLOATING_MENU_STYLE),
/* harmony export */   "STYLESHEET_GUIDE": () => (/* binding */ STYLESHEET_GUIDE),
/* harmony export */   "STYLESHEET_PROFILE_HIDE_RANK": () => (/* binding */ STYLESHEET_PROFILE_HIDE_RANK),
/* harmony export */   "STYLESHEET_PROFILE_RESIZE_PS5_ICONS": () => (/* binding */ STYLESHEET_PROFILE_RESIZE_PS5_ICONS),
/* harmony export */   "STYLESHEET_TROPHIES_HIDE_GUIDE_BANNER": () => (/* binding */ STYLESHEET_TROPHIES_HIDE_GUIDE_BANNER),
/* harmony export */   "getDifficultyClass": () => (/* binding */ getDifficultyClass),
/* harmony export */   "getHoursClass": () => (/* binding */ getHoursClass),
/* harmony export */   "getPlaythroughsClass": () => (/* binding */ getPlaythroughsClass),
/* harmony export */   "injectStylesheet": () => (/* binding */ injectStylesheet)
/* harmony export */ });
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(25);


const STYLESHEET_GLOBAL = `
table.list-table .placeholder {
  height: 67px !important;
}

.psnpp-hide {
  display: none !important;
}

.psnpp-code {
  background: lightgrey;
  display: inline-block;
  padding: 0 2px;
  border-radius: 2px;
}

.button.purple {
    background: ${_constants__WEBPACK_IMPORTED_MODULE_1__.COLOR_PURPLE} !important;
    color: #fff;
}

.psnpp-guide-color0 {
  background-color: #999;
}

.psnpp-guide-color1 {
  background-color: #618839;
}

.psnpp-guide-color2 {
  background-color: #898825;
}

.psnpp-guide-color3 {
  background-color: #b38811;
}

.psnpp-guide-color4 {
  background-color: #d38603;
}

.psnpp-guide-color5 {
  background-color: #dd7e04;
}

.psnpp-guide-color6 {
  background-color: #dc7111;
}

.psnpp-guide-color7 {
  background-color: #d16226;
}

.psnpp-guide-color8 {
  background-color: #c2543a;
}

.psnpp-guide-color9 {
  background-color: #ba4b47;
}

.psnpp-guide-color10 {
  background-color: #ba4b47;
}
`;
const STYLESHEET_GLOBAL_FLOATING_MENU_STYLE = `
@media only screen and (min-width: 1850px) {
  .psnpp-floating-menu {
    opacity: 1 !important;
  }
}

@media (hover: none) {
  .psnpp-floating-menu {
    opacity: 1 !important;
  }
}

.button.grey {
  background: #646464;
}`;
const STYLESHEET_COMPACT_BANNERS = `
div#banner {
  height: 260px !important;
  transition: none;
}`;
const STYLESHEET_FRONTPAGE_COMPACT_BANNERS = `
div#banner {
  height: 370px !important;
  transition: none;
}`;
const STYLESHEET_FRONTPAGE_RESIZE_PS5_ICONS = `
div#content table.zebra tr > td:first-child {
  text-align: center !important;
}

div#content table.zebra tr img.game {
  max-height: 56px !important;
  width: auto !important;
}

picture.game {
  width: unset !important;
}

picture.game > img {
  max-height: 56px !important;
  width: auto !important;
}
`;
// profile
// trophy log, advisor, level history
const STYLESHEET_PROFILE_RESIZE_PS5_ICONS = `
#gamesTable td:first-child, #search-results td:first-child, .list-table td:has(picture.game), table.zebra td:first-child {
  text-align: center;
}

#gamesTable picture.game, .list-table picture.game, #search-results picture.game, table.zebra picture.game {
  width: unset;
}

#gamesTable picture.game > img, .list-table picture.game > img, #search-results picture.game > img, table.zebra td > a > img {
  max-height: 56px !important;
  width: auto !important;
}`;
const STYLESHEET_PROFILE_HIDE_RANK = `
span.stat.rank,
span.stat.country-rank {
  display: none !important;
}
`;
const STYLESHEET_TROPHIES_HIDE_GUIDE_BANNER = `
div.guide-page-info {
  display: none !important;
}
`;
const STYLESHEET_GUIDE = `
.psnpp-strikethrough-fade {
  text-decoration: line-through;
  opacity: 0.3;
}

.psnpp-highlight {
  background-color: #ecf8ea;
  border: 1px solid #dae9d7;
}
`;
function injectStylesheet(stylesheet) {
    const target = _J__WEBPACK_IMPORTED_MODULE_0__.J.q('head').exists()
        ? _J__WEBPACK_IMPORTED_MODULE_0__.J.q('head')
        : new _J__WEBPACK_IMPORTED_MODULE_0__.J(document.body).exists()
            ? new _J__WEBPACK_IMPORTED_MODULE_0__.J(document.body)
            : new _J__WEBPACK_IMPORTED_MODULE_0__.J(document.documentElement);
    if (!target.exists()) {
        setTimeout(() => injectStylesheet(stylesheet), 50);
        return;
    }
    target
        .append(_J__WEBPACK_IMPORTED_MODULE_0__.J.c('style')
        .setAttribute('type', 'text/css')
        .setInnerHtml(stylesheet));
}
function getDifficultyClass(difficulty) {
    return `psnpp-guide-color${Math.floor(difficulty)}`;
}
function getPlaythroughsClass(playthroughs) {
    return playthroughs === 0 ? 'psnpp-guide-color0' :
        playthroughs === 1 ? 'psnpp-guide-color1' :
            playthroughs === 2 ? 'psnpp-guide-color3' :
                playthroughs === 3 ? 'psnpp-guide-color5' :
                    playthroughs === 4 ? 'psnpp-guide-color7' :
                        playthroughs === 5 ? 'psnpp-guide-color9' :
                            'psnpp-guide-color10';
}
function getHoursClass(hours) {
    return hours === 0 ? 'psnpp-guide-color0' :
        hours <= 15 ? 'psnpp-guide-color1' :
            hours < 25 ? 'psnpp-guide-color2' :
                hours < 40 ? 'psnpp-guide-color3' :
                    hours < 50 ? 'psnpp-guide-color4' :
                        hours < 65 ? 'psnpp-guide-color5' :
                            hours < 80 ? 'psnpp-guide-color6' :
                                'psnpp-guide-color10';
}


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Guide": () => (/* binding */ Guide)
/* harmony export */ });
/* harmony import */ var _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(53);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(13);
/* harmony import */ var _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(20);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(21);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(34);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(19);
/* harmony import */ var _features_lists_platforms__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(48);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(51);
/* harmony import */ var _util_video__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(54);
/* harmony import */ var _util_Logger__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(49);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(24);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(12);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(25);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(55);
/* harmony import */ var _features_guide_GuideScraper__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(56);
/* harmony import */ var _util_string__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(57);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(43);
/* harmony import */ var _util_transform__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(16);
/* harmony import */ var _util_observe__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(35);
/* harmony import */ var _ui_ui_utils__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(39);
/* harmony import */ var _features_guide_GuideTrophySelectionPanel__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(58);
/* harmony import */ var _features_compare_plus_TrophyListProgressScraper__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(59);
























const LOAD_FROM_LINK_VALUE = '__psnpp_load_from_link__';
const ID_CHECKLIST_DATA_ATTRIBUTE = 'data-psnpp-checklist-id';
const ID_PROGRESS_LOADER_TITLE = 'psnpp-progress-loader-title';
const ID_PROGRESS_LOADER_TABLE = 'psnpp-progress-loader-table';
const ID_GUIDE_BREAKDOWN_TABLE = 'psnpp-guide-breakdown-table';
class Guide {
    constructor(subSection) {
        this._earnedTrophiesHidden = false;
        this._sidebarHidden = false;
        this._videosHidden = false;
        this._tagHidden = false;
        this._subSection = undefined;
        this._linkableTrophies = [];
        this._guideId = (0,_util_url__WEBPACK_IMPORTED_MODULE_13__.getFirstLevelIdFromPathname)(window.location.pathname);
        this._settingsStorage = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_2__.SettingsStorage();
        this._scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_5__.ScriptStateStorage();
        this._logger = new _util_Logger__WEBPACK_IMPORTED_MODULE_11__.Logger(this._settingsStorage.get('enableScriptLogger'), 'Guide');
        this._subSection = subSection;
        this._matchingGames = this._getMatchingGames();
        this._logger.debug('Matching games for this guide:', this._matchingGames);
        this._selectedMatchingGameUrl = this._matchingGames.length > 0
            ? this._matchingGames[0].url
            : LOAD_FROM_LINK_VALUE;
        this._trophyListLink = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('input')
            .setAttribute('type', 'text')
            .setAttribute('style', 'margin-top: 5px; width: 100%;')
            .setAttribute('placeholder', 'Trophy list link')
            .hide()
            .condition(this._selectedMatchingGameUrl === LOAD_FROM_LINK_VALUE, (el) => el.show());
        const isSimpleMatchingEnabled = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_5__.ScriptStateStorage().get('guideSimpleMatching');
        this._simpleMatchingCheckbox = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('input')
            .setAttribute('type', 'checkbox')
            .condition(isSimpleMatchingEnabled, (el) => el.setAttribute('checked', 'checked'))
            .change(ev => {
            const checked = ev.currentTarget.checked;
            new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_5__.ScriptStateStorage().set('guideSimpleMatching', checked);
        });
    }
    _getMatchingGames() {
        const fullTitle = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#desc-name').getText();
        const isDLCGuide = fullTitle.indexOf('DLC Trophy Guide') > -1;
        const gameName = isDLCGuide
            ? fullTitle.split(' - ').slice(0, -1).join(' - ').trim()
            : fullTitle.replace('Trophy Guide', '').trim();
        const profileGames = new _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_4__.GameProgressStorage().get();
        const matchingGames = profileGames
            .filter(game => {
            if (game.title == null || game.url == null) {
                return false;
            }
            return game.title.toLowerCase().includes(gameName.toLowerCase()) ||
                gameName.toLowerCase().includes(game.title.toLowerCase());
        })
            // Sort by longest matching substring
            .sort((a, b) => {
            if (a.title == null || b.title == null) {
                return 0;
            }
            return (0,_util_string__WEBPACK_IMPORTED_MODULE_17__.levenshtein)(gameName, a.title) - (0,_util_string__WEBPACK_IMPORTED_MODULE_17__.levenshtein)(gameName, b.title);
        });
        return matchingGames;
    }
    _toggleElement(el) {
        if (this._earnedTrophiesHidden) {
            el.hide();
        }
        else {
            el.show();
        }
    }
    _toggleEarnedTrophies() {
        // Main trophy list
        const earned = [];
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div[id^="SectionContainer"]').forEach((el) => {
            const hasTrophyEarned = el.clone().find('img.trophy.earned').exists();
            if (!hasTrophyEarned) {
                return;
            }
            const navigationId = el.clone().find('div').getAttribute('id');
            earned.push(`#${navigationId}`);
            this._toggleElement(el);
        });
        // Overview
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.guide.overview a.icon-sprite').forEach((el) => {
            const href = el.getAttribute('href');
            if (earned.indexOf(href) > -1) {
                this._toggleElement(el);
            }
        });
        // Sidebar
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('li[id^="TOCSection"].earned').forEach((el) => this._toggleElement(el));
        // Roadmap
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.roadmap-trophies > div.col-xs-6 > div.earned,div.roadmap-trophies > div.col-xs-12 > div.earned')
            .map((el) => el.parent())
            .forEach((el) => this._toggleElement(el));
        // Strikethrough all trophies inside texts
        const trophyLinks = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('a')
            .filter(el => {
            const href = el.getAttribute('href');
            return earned.some(e => href.indexOf(e) > -1);
        });
        if (this._earnedTrophiesHidden) {
            trophyLinks.forEach(el => el.setCss('textDecoration', 'line-through').setCss('opacity', '0.3'));
        }
        else {
            trophyLinks.forEach(el => el.setCss('textDecoration', 'none').setCss('opacity', '1'));
        }
    }
    _highlightEarnedTrophies() {
        const earnedTrophies = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('li[id^="TOCSection"].earned')
            .map(el => el.clone().find('a').getAttribute('href'));
        // This is the overview with tags
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.guide.overview a.icon-sprite').forEach(el => {
            const href = el.getAttribute('href');
            if (earnedTrophies.indexOf(href) > -1) {
                el.addClass('psnpp-highlight');
            }
        });
        // NOTE: Links with .title are those that appear inside trophy banners.
        // We don't need those.
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#content #sections a:not(.title)').forEach(el => {
            const href = el.getAttribute('href');
            // NOTE: The URL might be encoded. We also need to remove first character (#) because reasons.
            if (earnedTrophies.some(e => href.endsWith(e) || href.endsWith(encodeURIComponent(e.substring(1))))) {
                el.addClass('psnpp-highlight');
            }
        });
    }
    _clearProgress() {
        // Main trophy list
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div[id^="SectionContainer"]').forEach((mainItem) => {
            const hasTrophyImage = mainItem.clone().find('img.trophy').exists();
            if (!hasTrophyImage) {
                return;
            }
            // Trophy icon border
            mainItem.clone().find('img.trophy').removeClass('earned').addClass('unearned');
            // Date
            mainItem.clone().find('td', { eq: 2 }).find('center').remove();
        });
        // Sidebar
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('li[id^="TOCSection"]').forEach(sidebarItem => sidebarItem.removeClass('earned'));
        // Roadmap
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.roadmap-trophies > div.col-xs-6 > div.trophy,div.roadmap-trophies > div.col-xs-12 > div.trophy')
            .forEach((roadmapItem) => roadmapItem.removeClass('earned'));
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('.psnpp-highlight').forEach(el => el.removeClass('psnpp-highlight'));
    }
    _markTrophyAsEarned(trophyRow) {
        const simpleMatchingIsEnabled = this._simpleMatchingCheckbox.get().checked;
        let trophyName = trophyRow.clone().find('a.title').getText().trim().toLowerCase();
        if (simpleMatchingIsEnabled) {
            const numberString = trophyRow.clone().find('a.title').getAttribute('href').split('/').reverse()[0].match(/^[0-9]{1,3}/);
            if (numberString != null) {
                const number = parseInt(numberString[0], 10);
                (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div[id^="SectionContainer"] a.title').forEach(title => {
                    const guideNumberString = title.clone().getAttribute('href').split('/').reverse()[0].match(/^[0-9]{1,3}/);
                    if (guideNumberString != null) {
                        const guideNumber = parseInt(guideNumberString[0], 10);
                        if (number === guideNumber) {
                            trophyName = title.clone().getText().trim().toLowerCase();
                        }
                    }
                });
            }
        }
        const date = trophyRow.clone().find('span.typo-top-date').getText();
        const time = trophyRow.clone().find('span.typo-bottom-date').getText();
        // Main trophy list
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div[id^="SectionContainer"]').forEach((mainItem) => {
            const hasTrophyImage = mainItem.clone().find('img.trophy').exists();
            if (!hasTrophyImage) {
                return;
            }
            const text = mainItem.clone().find('a.title').getText().trim().toLowerCase();
            if (text === trophyName) {
                mainItem.clone().find('img.trophy').removeClass('unearned').addClass('earned');
                // Date
                mainItem.clone().find('td', { eq: 2 }).append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('center')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span').addClass('typo-top-date').append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('nobr').setText(date)), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span').addClass('typo-bottom-date').append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('nobr').setText(time))));
            }
        });
        // Sidebar
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('li[id^="TOCSection"]').forEach(sidebarItem => {
            const text = sidebarItem.clone().find('a').getText().trim().toLowerCase();
            if (text === trophyName) {
                sidebarItem.addClass('earned');
            }
        });
        // Roadmap
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.roadmap-trophies > div.col-xs-6 > div.trophy,div.roadmap-trophies > div.col-xs-12 > div.trophy')
            .forEach((roadmapItem) => {
            const text = roadmapItem.clone().find('a.title').getText().trim().toLowerCase();
            if (text === trophyName) {
                roadmapItem.addClass('earned');
            }
        });
    }
    async _loadProgress() {
        try {
            const shouldRetoggleEarnedTrophies = this._earnedTrophiesHidden;
            const urlToLoad = this._selectedMatchingGameUrl === LOAD_FROM_LINK_VALUE
                ? this._trophyListLink.getValue()
                : this._selectedMatchingGameUrl;
            const trophyListDoc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_3__.fetchDocument)(urlToLoad);
            const earnedTrophies = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#content.page > div.row > div.col-xs tr.completed', {}, trophyListDoc);
            if (shouldRetoggleEarnedTrophies) {
                _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#psnpp-toggle-earned').triggerClick();
            }
            this._clearProgress();
            earnedTrophies.forEach(earnedTrophy => this._markTrophyAsEarned(earnedTrophy));
            this._highlightEarnedTrophies();
            if (shouldRetoggleEarnedTrophies) {
                _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#psnpp-toggle-earned').triggerClick();
            }
        }
        catch (e) {
            this._logger.error('Failed to load progress', e);
            // TODO: Replace this
            alert('PSNP+: Failed to load progress.');
        }
    }
    _appendGuideLoader() {
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.game-image-holder')
            .next()
            .after(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .setAttribute('id', ID_PROGRESS_LOADER_TITLE)
            .addClass('title', 'flex', 'v-align')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('h3')
            .addClass('grow')
            .setText('Progress')), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('table')
            .setAttribute('id', ID_PROGRESS_LOADER_TABLE)
            .addClass('box', 'zebra')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tbody')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .setAttribute('style', 'padding-right: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .addClass('form')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('label')
            .addClass('select')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('select')
            .change((e) => {
            if (e == null || e.target == null) {
                return;
            }
            this._selectedMatchingGameUrl = e.target.value;
            if (this._selectedMatchingGameUrl === LOAD_FROM_LINK_VALUE) {
                this._trophyListLink.show();
            }
            else {
                this._trophyListLink.hide();
            }
        })
            .append(...this._matchingGames.map((game) => {
            const platformTags = Object.values((0,_features_lists_platforms__WEBPACK_IMPORTED_MODULE_8__.mapPlatforms)(game.platforms));
            const itemText = game.title
                + ' (' + platformTags.join(', ') + ')'
                + (game.region == null
                    ? ''
                    : ' [' + game.region + ']');
            return _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('option')
                .setAttribute('value', game.url + '?order=psn')
                .setText(itemText);
        })
            .concat([
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('option')
                .setAttribute('value', LOAD_FROM_LINK_VALUE)
                .setText('Load from link')
        ])), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('i')), this._trophyListLink, _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('label')
            .addClass('checkbox')
            .append(this._simpleMatchingCheckbox, _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('i'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .setText('Use simple matching')
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, 'Uses trophy numbers instead of trophy names to match progress from trophy list. You can use this when trophy list language does not match guide language or when the trophy names are different.'))), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .setAttribute('style', 'margin-top: 5px;')
            .addClass('button', 'green')
            .setText('Load')
            .click(async (e, el) => {
            e.preventDefault();
            if (this._selectedMatchingGameUrl == null) {
                return;
            }
            el.addClass('state-disabled');
            el.setText('Loading...');
            await this._loadProgress();
            el.removeClass('state-disabled');
            el.setText('Load');
        })))))));
    }
    _appendMenu(lazyLoadInstance) {
        const menuWrapper = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div');
        const toggleEarnedButton = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('id', 'psnpp-toggle-earned')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setText('🔴 Hide earned trophies')
            .click((e) => {
            e.preventDefault();
            this._earnedTrophiesHidden = !this._earnedTrophiesHidden;
            if (this._earnedTrophiesHidden) {
                toggleEarnedButton.setText('🟢 Hide earned trophies');
            }
            else {
                toggleEarnedButton.setText('🔴 Hide earned trophies');
            }
            this._toggleEarnedTrophies();
        });
        const toggleSidebar = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setAttribute('style', 'margin-top: 5px;')
            .setText('🔴 Hide sidebar')
            .click((e) => {
            e.preventDefault();
            this._sidebarHidden = !this._sidebarHidden;
            if (this._sidebarHidden) {
                toggleSidebar.setText('🟢 Hide sidebar');
            }
            else {
                toggleSidebar.setText('🔴 Hide sidebar');
            }
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.col-xs-4.col-xs-max-320').toggleClass('psnpp-hide');
        });
        const hideVideos = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setAttribute('style', 'margin-top: 5px;')
            .setText('🔴 Hide videos')
            .click((e) => {
            e.preventDefault();
            this._videosHidden = !this._videosHidden;
            if (this._videosHidden) {
                hideVideos.setText('🟢 Hide videos');
            }
            else {
                hideVideos.setText('🔴 Hide videos');
            }
            (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('iframe[data-src^="https://www.youtube.com/embed"]').forEach(x => x.parent().toggleClass('psnpp-hide'));
        });
        const activeChecklist = this._scriptStateStorage.get('activeChecklist');
        const shouldAppendChecklistsButton = activeChecklist.guideId !== this._guideId;
        const enableChecklists = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setAttribute('style', 'margin-top: 5px;')
            .setText('Enable checklists')
            .click((e) => {
            e.preventDefault();
            this._scriptStateStorage.set('activeChecklist', { guideId: this._guideId, checkedIds: [] });
            this._activateChecklists();
            enableChecklists.remove();
            alert('Checklists enabled for this guide. Your checked items will be saved. Enabling checklists in another guide will clear the progress here.');
        });
        const refreshProgressButton = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .setAttribute('style', 'margin-top: 5px;')
            .addClass('button', 'grey')
            .setText('Refresh progress')
            .setAttribute('href', '#')
            .click((e) => {
            e.preventDefault();
            (0,_util_url__WEBPACK_IMPORTED_MODULE_13__.redirect)((0,_util_user__WEBPACK_IMPORTED_MODULE_7__.getUpdateProfileRedirectPathname)((0,_util_user__WEBPACK_IMPORTED_MODULE_7__.getPsnId)(), location.pathname + location.hash));
        });
        const showAllSpoilersButton = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .setAttribute('style', 'margin-top: 5px;')
            .addClass('button', 'grey')
            .setText('Show all spoilers')
            .click((e) => {
            e.preventDefault();
            (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('span.spoiler').forEach(el => el.triggerClick());
        });
        const loadAllLazyMedia = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .setAttribute('style', 'margin-top: 5px;')
            .addClass('button', 'grey')
            .setText('Load all media')
            .click((e) => {
            e.preventDefault();
            lazyLoadInstance === null || lazyLoadInstance === void 0 ? void 0 : lazyLoadInstance.loadAll();
            loadAllLazyMedia.remove();
        });
        menuWrapper.append(this._isGameplayGuide() ? null : toggleEarnedButton, this._isGameplayGuide() ? null : _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), toggleSidebar, _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), hideVideos, _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), shouldAppendChecklistsButton ? enableChecklists : null, shouldAppendChecklistsButton ? _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br') : null, refreshProgressButton, _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), showAllSpoilersButton, lazyLoadInstance == null ? null : _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), lazyLoadInstance == null ? null : loadAllLazyMedia);
        const floatingMenu = new _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_0__.FloatingMenu(menuWrapper);
        floatingMenu.insert();
    }
    _markMissingInTheRoadmap() {
        const roadmapTrophies = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.roadmap-trophies a.title');
        const sidebarTrophies = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('li[id^="TOCSection"] span.icon-sprite').map(x => x.parent().find('a'));
        if (roadmapTrophies.length >= sidebarTrophies.length) {
            return;
        }
        const missingTrophies = sidebarTrophies.filter(x => !roadmapTrophies.some(r => r.getAttribute('href') === x.getAttribute('href')));
        const taggedTrophiesContainer = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td');
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('table.tags > tbody')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('tag')
            .setAttribute('style', 'background: #5865f2;')
            .setText('No Roadmap')), taggedTrophiesContainer));
        missingTrophies.forEach(t => {
            const iconType = t.getAttribute('class');
            const hashHref = t.getAttribute('href');
            taggedTrophiesContainer
                .append(_util_constants__WEBPACK_IMPORTED_MODULE_14__.MAGIC_SPACE, _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('nobr')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                .addClass('trophy', iconType)
                .condition(iconType === 'platinum', x => x.setAttribute('style', `background-position: 0 2px; background-size: 14px; background-repeat: no-repeat; background-image: url("${_util_constants__WEBPACK_IMPORTED_MODULE_14__.ICON_SPRITE}");`))
                .condition(iconType !== 'platinum', x => x.addClass('icon-sprite'))
                .setAttribute('href', hashHref)
                .setText(t.getText().trim())));
            const individualTrophy = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#' + CSS.escape(hashHref.slice(1)));
            const tags = individualTrophy.clone().find('#tags');
            if (!tags.exists()) {
                individualTrophy
                    .clone()
                    .find('div.section-original')
                    .prepend(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
                    .setAttribute('id', 'tags')
                    .addClass('section-tags', 'box', 'light', 'clearfix', 'no-top-border')
                    .setAttribute('style', 'padding: 5px 5px 5px 4px;'));
            }
            individualTrophy
                .clone()
                .find('#tags')
                .prepend(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .addClass('tag')
                .setAttribute('style', `background: ${_util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_PURPLE};`)
                .setText('No Roadmap'));
        });
    }
    _markUnobtainableTrophies() {
        if (!this._settingsStorage.get('markUnobtainableTrophies')) {
            return;
        }
        const unobtainableTrophies = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_12__.UnobtainableTrophiesStorage().get();
        const firstTrophyPath = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('a.title[href^="/trophy/"]').getAttribute('href');
        const trophyListId = parseInt((0,_util_url__WEBPACK_IMPORTED_MODULE_13__.getFirstLevelIdFromPathname)(firstTrophyPath), 10);
        const unobtainableTrophiesForList = unobtainableTrophies.data.list[trophyListId];
        if (unobtainableTrophiesForList == null) {
            return;
        }
        const taggedTrophiesContainer = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td');
        const unobtainableTag = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('tag')
            .setAttribute('style', 'background: #5865f2;')
            .setText('Unobtainable')
            .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, 'Information comes from PSNP+ Unobtainable Trophies Master List'))), taggedTrophiesContainer);
        const tagsTable = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('table.tags > tbody');
        const unattainableTag = tagsTable.clone().find('span.tag', { equalsText: 'Unattainable' });
        if (unattainableTag.exists()) {
            unattainableTag.clone().parent().parent().after(unobtainableTag);
        }
        else {
            tagsTable.append(unobtainableTag);
        }
        let foundAtLeastOneTrophy = false;
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('a.title[href^="/trophy/"]')
            .sort((a, b) => {
            const trophyNameA = a.getText();
            const trophyNameB = b.getText();
            return trophyNameA.localeCompare(trophyNameB);
        })
            .forEach(trophyLink => {
            const trophyPath = trophyLink.getAttribute('href');
            const trophyName = trophyLink.getText();
            const trophyId = parseInt((0,_util_url__WEBPACK_IMPORTED_MODULE_13__.getSecondLevelIdFromPathname)(trophyPath), 10);
            if (unobtainableTrophiesForList.includes(trophyId) || unobtainableTrophiesForList[0] === 0) {
                foundAtLeastOneTrophy = true;
                const upperContainer = trophyLink.clone()
                    .parent().parent().parent().parent().parent().parent();
                const isPlatinum = upperContainer.clone().find('img[alt="Platinum"]').exists();
                if (isPlatinum) {
                    return;
                }
                const tagsContainer = upperContainer.clone().find('#tags');
                if (!tagsContainer.exists()) {
                    upperContainer
                        .clone()
                        .find('div.section-original')
                        .prepend(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
                        .setAttribute('id', 'tags')
                        .addClass('section-tags', 'box', 'light', 'clearfix', 'no-top-border')
                        .setAttribute('style', 'padding: 5px 5px 5px 4px;'));
                }
                upperContainer.clone().find('#tags')
                    .prepend(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                    .addClass('tag')
                    .setAttribute('style', `background: ${_util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_PURPLE};`)
                    .setText('Unobtainable'));
                const iconClass = upperContainer.clone()
                    .find('img[alt="Gold"],img[alt="Silver"],img[alt="Bronze"]')
                    .getAttribute('alt')
                    .toLowerCase();
                taggedTrophiesContainer
                    .append(_util_constants__WEBPACK_IMPORTED_MODULE_14__.MAGIC_SPACE, _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('nobr')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                    .addClass('icon-sprite', 'trophy', iconClass)
                    .setAttribute('href', '#' + upperContainer.getAttribute('id'))
                    .setText(trophyName)));
            }
        });
        if (!foundAtLeastOneTrophy) {
            taggedTrophiesContainer
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setAttribute('style', 'font-size: 15px;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                .setAttribute('href', `/trophies/${trophyListId}`)
                .setText('Trophy list'), ' contains unobtainable trophies not covered by this guide.'));
        }
    }
    _attachTagClickListeners() {
        const allTags = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table.tags span.tag');
        allTags.forEach(el => {
            el.setCss('cursor', 'pointer');
            el.click((ev, el) => {
                if (!this._tagHidden) {
                    const nextTd = el.clone().parent().next();
                    const allTrophyNames = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('a', undefined, nextTd.get()).map(el => el.getText());
                    this._hideByWhitelist(allTrophyNames);
                    el.setCss('border', '2px dashed #44484b');
                }
                else {
                    this._hideByWhitelist(null);
                    allTags.forEach(tag => tag.setCss('border', 'none'));
                }
                this._tagHidden = !this._tagHidden;
            });
        });
    }
    _hideByWhitelist(whitelist) {
        // Main trophy list
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div[id^="SectionContainer"]').forEach((el) => {
            const hasTrophyImage = el.clone().find('img.trophy').exists();
            if (!hasTrophyImage) {
                return;
            }
            const trophyName = el.clone().find('a.title').getText();
            if (whitelist != null && whitelist.indexOf(trophyName) === -1) {
                el.hide();
            }
            else {
                el.show();
            }
        });
        // Overview
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.guide.overview a.icon-sprite').forEach((el) => {
            const trophyName = el.getText();
            if (whitelist != null && whitelist.indexOf(trophyName) === -1) {
                el.hide();
            }
            else {
                el.show();
            }
        });
        // Sidebar
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('li[id^="TOCSection"] a').forEach((el) => {
            const trophyName = el.getText().trim();
            if (whitelist != null && whitelist.indexOf(trophyName) === -1) {
                el.parent().hide();
            }
            else {
                el.parent().show();
            }
        });
        // Roadmap
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.roadmap-trophies > div.col-xs-6 > div.trophy,div.roadmap-trophies > div.col-xs-12 > div.trophy')
            .map((el) => el.parent())
            .forEach((el) => {
            const trophyName = el.clone().find('a').getText();
            if (whitelist != null && whitelist.indexOf(trophyName) === -1) {
                el.hide();
            }
            else {
                el.show();
            }
        });
    }
    _activateChecklists() {
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#sections ul > li, #sections ol > li, #sections table:not(.tags):not(.zebra) tr').forEach((checkableElement, index) => {
            checkableElement.setCss('cursor', 'pointer');
            checkableElement.setAttribute(ID_CHECKLIST_DATA_ATTRIBUTE, index.toString());
            checkableElement.click((_e, clickElement) => {
                clickElement.toggleClass('psnpp-strikethrough-fade');
                const checkedId = clickElement.getAttribute(ID_CHECKLIST_DATA_ATTRIBUTE);
                const currentState = this._scriptStateStorage.get('activeChecklist');
                if (currentState.checkedIds.includes(checkedId)) {
                    currentState.checkedIds = currentState.checkedIds.filter(x => x !== checkedId);
                    this._scriptStateStorage.set('activeChecklist', currentState);
                }
                else {
                    currentState.checkedIds = (0,_util_transform__WEBPACK_IMPORTED_MODULE_19__.unique)([...currentState.checkedIds, checkedId]);
                    this._scriptStateStorage.set('activeChecklist', currentState);
                }
            });
        });
    }
    _restoreChecklistState() {
        const currentState = this._scriptStateStorage.get('activeChecklist');
        this._logger.debug('Restoring checklist state:', currentState);
        currentState.checkedIds.forEach(id => {
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q(`[${ID_CHECKLIST_DATA_ATTRIBUTE}="${id}"]`).toggleClass('psnpp-strikethrough-fade');
        });
    }
    _isGameplayGuide() {
        const firstTrophy = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('a.title[href^="/trophy/"]');
        return !firstTrophy.exists();
    }
    _switchHoursTo24HourFormat() {
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_2__.SettingsStorage().get('use24HourTimeFormat')) {
            return;
        }
        (0,_util_date__WEBPACK_IMPORTED_MODULE_15__.switchHoursTo24HourFormat)();
    }
    _appendGuideBreakdown() {
        const relatedGuidesExist = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('h3.grow', { equalsText: 'Related Guides' }).exists();
        if (!relatedGuidesExist) {
            return;
        }
        const guidesPathname = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.title-bar').find('a[href^="/guides/"]').getAttribute('href');
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#' + ID_PROGRESS_LOADER_TABLE)
            .after(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .addClass('title', 'flex', 'v-align')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('h3')
            .addClass('grow')
            .setText('Guide Breakdown')), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('table')
            .setAttribute('id', ID_GUIDE_BREAKDOWN_TABLE)
            .addClass('box', 'zebra')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tbody')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('center')
            .setText('Click the Load button to load information about complexity from related guides.'))), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('center')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setAttribute('style', 'display: block;')
            .setText('Load')
            .click(async (e) => {
            e.preventDefault();
            const guidesDocument = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_3__.fetchDocument)(guidesPathname);
            const allGuidesPathnames = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('a[href^="/guide/"]', {}, guidesDocument)
                .map(el => el.getAttribute('href'));
            const tBody = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tbody');
            const spinnerRow = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('center')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('i')
                .addClass('fa', 'fa-spinner', 'fa-spin', 'fa-fw')
                .setAttribute('aria-hidden', 'true'), 'Loading...')));
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#' + ID_GUIDE_BREAKDOWN_TABLE)
                .empty()
                .append(tBody
                .append(spinnerRow));
            for (const guidePathname of [...allGuidesPathnames]) {
                const guideDoc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_3__.fetchDocument)(guidePathname);
                const guideName = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#desc-name', {}, guideDoc).getText();
                const guideAuthors = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.title-author > a', {}, guideDoc).getText();
                const isDlc = guideName.includes('DLC Trophy Guide');
                const isGuideWithComplexity = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('a.title[href^="/trophy/"]', {}, guideDoc).exists();
                const label = !isGuideWithComplexity
                    ? 'Gameplay Guide'
                    : isDlc
                        ? 'DLC Guide'
                        : 'Trophy Guide';
                // NOTE: Dummy ID 0
                // We don't store this data anywhere afterwards
                const guideInfo = new _features_guide_GuideScraper__WEBPACK_IMPORTED_MODULE_16__.GuideScraper(guideDoc).getFromGuidePage('0');
                tBody
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
                    .addClass('ellipsis')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                    .addClass('small-title')
                    .setAttribute('href', guidePathname)
                    .setText(guideName)), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                    .addClass('small-info', 'line-clamp', 'two')
                    .append(' by ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a').setAttribute('href', '/' + guideAuthors).setText(guideAuthors)), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
                    .setAttribute('style', 'margin-top: 5px; font-size: 11px;')
                    .condition(location.pathname === guidePathname, div => {
                    div
                        .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                        .setAttribute('style', 'background: #64a75c; color: black; padding: 1px 2px; border-radius: 50%;')
                        .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_18__.Icon('fa-eye'))
                        .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, 'Currently viewed guide')), ' ');
                })
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                    .setText(label)
                    .setAttribute('style', 'background: #057fcc; color: white; padding: 1px 2px; border-radius: 2px;'))
                    .condition(isGuideWithComplexity, div => {
                    div.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                        .setText(`${guideInfo.difficulty}/10`)
                        .setAttribute('style', `${guideInfo.difficultyStyle}; color: white; padding: 1px 2px; border-radius: 2px;`)
                        .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, 'Difficulty')), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                        .setText(`${guideInfo.playthroughs}x`)
                        .setAttribute('style', `${guideInfo.playthroughsStyle}; color: white; padding: 1px 2px; border-radius: 2px;`)
                        .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, 'Playthroughs')), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                        .setText(`${guideInfo.time}h`)
                        .setAttribute('style', `${guideInfo.timeStyle}; color: white; padding: 1px 2px; border-radius: 2px;`)
                        .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, 'Time')));
                }))));
            }
            spinnerRow.remove();
        })))))));
    }
    _makeCollapsibleHeaders() {
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.box.section-holder').forEach(holder => {
            const isPlatinum = holder.clone().find('img[alt="Platinum"]').exists();
            if (isPlatinum) {
                return;
            }
            holder.apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, 'Click to collapse'));
            holder.setCss('cursor', 'pointer');
            holder.click(e => {
                holder.clone().next().toggleClass('psnpp-hide');
                e.preventDefault();
            });
        });
    }
    async _collectLinkableGuideTrophies() {
        this._linkableTrophies = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.box.section-holder')
            .map(el => {
            const url = '#' + el.clone().parent().getAttribute('id');
            const name = el.clone().find('a.title').getText().trim();
            const trophyGrade = (el.clone().find('img[alt="Bronze"]').exists() ? 'bronze'
                : el.clone().find('img[alt="Silver"]').exists() ? 'silver'
                    : el.clone().find('img[alt="Gold"]').exists() ? 'gold'
                        : 'platinum');
            const description = el.clone().find('a.title').parent().getText().replace(name, '').trim();
            return {
                name,
                url,
                trophyGrade,
                description
            };
        });
        const listUrl = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.game-image-holder').find('a').getAttribute('href');
        const trophyList = await _features_compare_plus_TrophyListProgressScraper__WEBPACK_IMPORTED_MODULE_23__.TrophyListProgressScraper.getFromUrl(listUrl, false);
        if (trophyList == null) {
            return;
        }
        const linkableTrophiesFromTrophyList = trophyList.trophies
            .map(trophy => {
            if (this._linkableTrophies.some(x => x.name === trophy.name)) {
                return null;
            }
            return {
                name: trophy.name,
                url: trophy.path,
                trophyGrade: trophy.trophyGrade,
                description: trophy.description
            };
        })
            .filter(x => x != null);
        this._linkableTrophies = this._linkableTrophies.concat(linkableTrophiesFromTrophyList);
        this._logger.debug('Collected linkable trophies:', this._linkableTrophies);
    }
    _expandGuideEditToolbar() {
        (0,_util_observe__WEBPACK_IMPORTED_MODULE_20__.htmlObserve)(() => {
            (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.fr-toolbar').forEach(toolbar => {
                const isFirstChildOurButton = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('button', {}, toolbar.get())[0].hasClass('psnpp-insert-trophy');
                if (isFirstChildOurButton) {
                    toolbar.clone().find('button.psnpp-insert-trophy').remove();
                }
                const buttonExists = toolbar.clone().find('button.psnpp-insert-trophy').exists();
                if (buttonExists) {
                    return;
                }
                toolbar.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
                    .addClass('fr-separator', 'fr-vs')
                    .setAttribute('role', 'separator')
                    .setAttribute('aria-orientation', 'vertical'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('button')
                    .addClass('fr-command', 'fr-btn', 'fr-btn-font_awesome', 'psnpp-insert-trophy')
                    .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_18__.Icon('fa-trophy'))
                    .click((ev) => {
                    ev.preventDefault();
                    (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_21__.appendPanel)(new _features_guide_GuideTrophySelectionPanel__WEBPACK_IMPORTED_MODULE_22__.GuideTrophySelectionPanel(this._linkableTrophies));
                }));
            });
        });
    }
    async run() {
        this._logger.debug('Running');
        if (this._subSection == null) {
            this._logger.debug('Main page');
            (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_9__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_9__.STYLESHEET_GUIDE);
            let lazyLoadInstance = null;
            if (this._settingsStorage.get('guideLazyLoadMedia')) {
                lazyLoadInstance = await (0,_util_video__WEBPACK_IMPORTED_MODULE_10__.applyLazyLoad)();
            }
            this._appendMenu(lazyLoadInstance);
            this._switchHoursTo24HourFormat();
            if (!this._isGameplayGuide()) {
                this._markMissingInTheRoadmap();
                this._markUnobtainableTrophies();
                this._highlightEarnedTrophies();
                this._appendGuideLoader();
                this._appendGuideBreakdown();
                this._attachTagClickListeners();
                this._makeCollapsibleHeaders();
            }
            const activeChecklist = this._scriptStateStorage.get('activeChecklist');
            if (activeChecklist.guideId === this._guideId) {
                this._activateChecklists();
                this._restoreChecklistState();
            }
            if (this._settingsStorage.get('guideAutomaticallyHideEarnedTrophies')) {
                _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#psnpp-toggle-earned').triggerClick();
            }
        }
        else if (this._subSection === 'edit') {
            this._logger.debug('Edit mode');
            await this._collectLinkableGuideTrophies();
            this._expandGuideEditToolbar();
        }
    }
}


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FloatingMenu": () => (/* binding */ FloatingMenu)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(51);



class FloatingMenu extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(content, onShow = () => {
        // Noop
    }, onHide = () => {
        // Noop
    }) {
        super('div');
        this.addClass('psnpp-floating-menu');
        this._baseStyle = [
            'position: fixed;',
            'top: 20px;',
            'left: 20px;',
            'z-index: 2147483647;',
            'background-color: #1b1d1f;',
            'padding: 8px 10px;',
            'border: 1px solid #26292b;',
            'opacity: 0.55;',
            'color: #cfd2d5;',
            'border-radius: 6px;',
            'font-size: 12px;',
            'letter-spacing: 0.04em;',
            'box-shadow: 0 2px 10px rgba(0,0,0,.45);'
        ].join(' ');
        this._content = content;
        this._onShow = onShow;
        this._onHide = onHide;
        this._build();
    }
    _build() {
        this
            .setAttribute('style', this._baseStyle)
            .mouseenter((_, el) => {
            el.setCss('opacity', '1');
            this._onShow();
        })
            .mouseleave((_, el) => {
            el.setCss('opacity', '0.2');
            this._onHide();
        })
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText('PSNP++ Menu')));
    }
    insert() {
        if (new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage().get('hideFloatingMenus')) {
            this.setCss('display', 'none');
        }
        this.append(this._content);
        (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_2__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_2__.STYLESHEET_GLOBAL_FLOATING_MENU_STYLE);
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('body').append(this);
    }
}


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "applyLazyLoad": () => (/* binding */ applyLazyLoad)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(25);
/* harmony import */ var _fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);



function loadVanillaLazyload() {
    return (0,_fetch__WEBPACK_IMPORTED_MODULE_1__.loadScriptTag)(_constants__WEBPACK_IMPORTED_MODULE_0__.EXTERNAL_SCRIPT_URLS.VANILLA_LAZYLOAD);
}
function embedLazyYT() {
    (0,_J__WEBPACK_IMPORTED_MODULE_2__.all)('div.lazyYT').forEach((el) => {
        const videoId = el.getAttribute('data-youtube-id');
        el
            .empty()
            .setAttribute('style', 'position: relative; padding-bottom: 56.25%; height: 0; margin: 0;')
            .append(_J__WEBPACK_IMPORTED_MODULE_2__.J.c('iframe')
            .addClass('lazy')
            .setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;')
            .setAttribute('frameborder', '0')
            .setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
            .setAttribute('allowfullscreen', 'allowfullscreen')
            .setAttribute('data-src', `https://www.youtube.com/embed/${videoId}`));
    });
}
async function applyLazyLoad(embed = false) {
    try {
        await loadVanillaLazyload();
        if (embed) {
            embedLazyYT();
        }
        return new LazyLoad();
    }
    catch (e) {
        console.error('Failed to load youtube videos', e);
        return null;
    }
}


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "formatCompletionTimeString": () => (/* binding */ formatCompletionTimeString),
/* harmony export */   "formatStringToSupDate": () => (/* binding */ formatStringToSupDate),
/* harmony export */   "getPrettyDate": () => (/* binding */ getPrettyDate),
/* harmony export */   "getUtcLocaleDateString": () => (/* binding */ getUtcLocaleDateString),
/* harmony export */   "parseCompletionTime": () => (/* binding */ parseCompletionTime),
/* harmony export */   "parseSupDate": () => (/* binding */ parseSupDate),
/* harmony export */   "switchHoursTo24HourFormat": () => (/* binding */ switchHoursTo24HourFormat)
/* harmony export */ });
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
// January 20th 2022
const format1Regex = /([a-zA-Z]+) ([\d]{1,2})(st|nd|rd|th) ([\d]{4})/;
// 20th Jan 2022
const format2Regex = /([\d]+)(st|nd|rd|th) ([a-zA-Z]{3}) ([\d]{4})/;
// 20th January 2022
const format3Regex = /([\d]{1,2})(st|nd|rd|th) ([a-zA-Z]+) ([\d]{4})/;
function ordinalSuffixOf(i) {
    const j = i % 10;
    const k = i % 100;
    if (j == 1 && k != 11) {
        return 'st';
    }
    if (j == 2 && k != 12) {
        return 'nd';
    }
    if (j == 3 && k != 13) {
        return 'rd';
    }
    return 'th';
}
function getPrettyDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthName = monthNames[month];
    const suffix = ordinalSuffixOf(day);
    return {
        day,
        month,
        monthName,
        year,
        suffix
    };
}
function formatStringToSupDate(dateString) {
    if (format1Regex.test(dateString)) {
        const match = dateString.match(format1Regex);
        return [
            match[1],
            ' ',
            match[2],
            _J__WEBPACK_IMPORTED_MODULE_0__.J.c('sup').setText(match[3]),
            ' ',
            match[4]
        ];
    }
    else if (format2Regex.test(dateString)) {
        const match = dateString.match(format2Regex);
        return [
            match[1],
            _J__WEBPACK_IMPORTED_MODULE_0__.J.c('sup').setText(match[2]),
            ' ',
            match[3],
            ' ',
            match[4]
        ];
    }
    return [];
}
function parseSupDate(dateString) {
    const match = dateString.match(format3Regex);
    if (match == null) {
        return new Date(0);
    }
    const [, day, , month, year] = match;
    const dateToReturn = new Date();
    dateToReturn.setDate(parseInt(day, 10));
    dateToReturn.setMonth(monthNames.findIndex(x => x === month));
    dateToReturn.setFullYear(parseInt(year, 10));
    return dateToReturn;
}
function parseCompletionTime(timeString) {
    function getValueForRegex(timeString, regex) {
        const match = timeString.match(regex);
        if (match == null) {
            return 0;
        }
        return parseInt(match[1], 10);
    }
    const SECOND_VALUE = 1;
    const MINUTE_VALUE = 60 * SECOND_VALUE;
    const HOUR_VALUE = 60 * MINUTE_VALUE;
    const DAY_VALUE = 24 * HOUR_VALUE;
    const WEEK_VALUE = 7 * DAY_VALUE;
    const MONTH_VALUE = 30 * DAY_VALUE;
    const YEAR_VALUE = 365 * DAY_VALUE;
    const years = getValueForRegex(timeString, /([\d]+) year/) * YEAR_VALUE;
    const months = getValueForRegex(timeString, /([\d]+) month/) * MONTH_VALUE;
    const weeks = getValueForRegex(timeString, /([\d]+) week/) * WEEK_VALUE;
    const days = getValueForRegex(timeString, /([\d]+) day/) * DAY_VALUE;
    const hours = getValueForRegex(timeString, /([\d]+) hour/) * HOUR_VALUE;
    const minutes = getValueForRegex(timeString, /([\d]+) minute/) * MINUTE_VALUE;
    const seconds = getValueForRegex(timeString, /([\d]+) second/) * SECOND_VALUE;
    return years + months + weeks + days + hours + minutes + seconds;
}
function formatCompletionTimeString(completionTimeString) {
    const match = completionTimeString.match(/(Completed in|Platinum in) ([a-z0-9, ]+)/);
    if (match == null) {
        return [];
    }
    return [
        match[1],
        ' ',
        _J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(match[2])
    ];
}
function switchHoursTo24HourFormat() {
    (0,_J__WEBPACK_IMPORTED_MODULE_0__.all)('.typo-bottom-date > nobr').forEach(timestamp => {
        const currentTimestamp = timestamp.getText();
        const newTime = currentTimestamp.replace(/^(?<hours>\d{1,2}):(?<minutes>\d{1,2}):(?<seconds>\d{1,2}) (?<meridiem>[AP]M)$/, (...args) => {
            const matches = args[7];
            if (matches.meridiem === 'PM') {
                matches.hours = (parseInt(matches.hours, 10) + 12).toString();
            }
            if (matches.hours === '12') {
                matches.hours = '0';
            }
            if (matches.hours === '24') {
                matches.hours = '12';
            }
            return matches.hours.padStart(2, '0') + ':' + matches.minutes + ':' + matches.seconds;
        });
        timestamp.setText(newTime);
    });
}
function getUtcLocaleDateString(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
        timeZone: 'UTC'
    });
}


/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GuideScraper": () => (/* binding */ GuideScraper)
/* harmony export */ });
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(13);



class GuideScraper {
    constructor(doc) {
        this._doc = doc;
    }
    _q(query, options = {}) {
        return _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q(query, options, this._doc);
    }
    getFromGuidePage(trophyListId) {
        const guidePathname = this._q('div.no-shrink.navigation li a').getAttribute('href');
        const guideId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(guidePathname);
        const difficultyElement = this._q('.overview-info span:first-child .typo-top');
        const playthroughsElement = this._q('.overview-info span:nth-child(2) .typo-top');
        const timeElement = this._q('.overview-info span:last-child .typo-top');
        const difficulty = parseInt(difficultyElement.getText().replace('/10', ''), 10);
        const difficultyStyle = difficultyElement.clone().parent().getAttribute('style');
        const playthroughs = parseInt(playthroughsElement.getText(), 10);
        const playthroughsStyle = playthroughsElement.clone().parent().getAttribute('style');
        const time = parseInt(timeElement.getText(), 10);
        const timeStyle = timeElement.clone().parent().getAttribute('style');
        const onlineRequired = this._q('span.tag', { equalsText: 'Online Required' }).exists();
        const multiplayerOnly = this._q('span.tag', { equalsText: 'Multiplayer Only' }).exists();
        // NOTE: The '-' below is U+2011 instead of more common U+002d.
        const onlineCoop = this._q('span.tag', { equalsText: 'Online Co‑Op' }).exists();
        const buggy = this._q('span.tag', { equalsText: 'Buggy' }).exists();
        const timestamp = Date.now();
        return {
            trophyListId,
            guideId,
            difficulty,
            difficultyStyle,
            playthroughs,
            playthroughsStyle,
            time,
            timeStyle,
            online: onlineRequired || multiplayerOnly || onlineCoop,
            buggy,
            timestamp
        };
    }
    static async getFromUrl(url, trophyListId) {
        const doc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_2__.fetchDocument)(url);
        return new GuideScraper(doc).getFromGuidePage(trophyListId);
    }
}


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "capitalizeFirstLetter": () => (/* binding */ capitalizeFirstLetter),
/* harmony export */   "insertAtSelection": () => (/* binding */ insertAtSelection),
/* harmony export */   "levenshtein": () => (/* binding */ levenshtein),
/* harmony export */   "linkifyText": () => (/* binding */ linkifyText)
/* harmony export */ });
/* harmony import */ var _J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

function linkifyText(text, options = {}) {
    // NOTE: [Link Text](http://link.url)
    const linkRegex = /\[(.+?)\]\((.+?)\)/g;
    let match;
    let startIndex = 0;
    const result = [];
    while ((match = linkRegex.exec(text)) != null) {
        result.push(text.substring(startIndex, match.index));
        startIndex = match.index + match[0].length;
        let url = match[2];
        if (options.appendToLink != null) {
            url += options.appendToLink;
        }
        result.push(_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', url)
            .setText(match[1])
            .condition(options.targetBlank === true, (a) => a.setAttribute('target', '_blank')));
    }
    result.push(text.substring(startIndex, text.length));
    return result;
}
function levenshtein(initial, compared) {
    if (initial.length === 0)
        return compared.length;
    if (compared.length === 0)
        return initial.length;
    const arr = [];
    for (let i = 0; i <= compared.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= initial.length; j++) {
            arr[i][j] =
                i === 0
                    ? j
                    : Math.min(arr[i - 1][j] + 1, arr[i][j - 1] + 1, arr[i - 1][j - 1] + (initial[j - 1] === compared[i - 1] ? 0 : 1));
        }
    }
    return arr[compared.length][initial.length];
}
function insertAtSelection(oldRange, element) {
    var _a, _b;
    if (oldRange != null) {
        (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
        (_b = window.getSelection()) === null || _b === void 0 ? void 0 : _b.addRange(oldRange);
    }
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
        return;
    }
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(element);
    range.setStartAfter(element);
    range.setEndAfter(element);
    selection.removeAllRanges();
    selection.addRange(range);
}
function capitalizeFirstLetter(value) {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}


/***/ }),
/* 58 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GuideTrophySelectionPanel": () => (/* binding */ GuideTrophySelectionPanel)
/* harmony export */ });
/* harmony import */ var _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(31);
/* harmony import */ var _ui_panel_PanelBottom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(37);
/* harmony import */ var _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(33);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3);
/* harmony import */ var _util_string__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(57);





class GuideTrophySelectionPanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor(trophies) {
        var _a;
        super('Choose a trophy');
        this._trophies = trophies;
        this._selectedTrophy = trophies[0];
        this._range = (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.getRangeAt(0);
        this._addContent();
    }
    _addContent() {
        const urlInput = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_2__.PanelInput('Link', this._selectedTrophy.url, 'You can change this value if needed.');
        const listSelector = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('form', 'box')
            .setAttribute('style', 'padding: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('label')
            .addClass('select')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('select')
            .change(e => {
            if (e == null || e.target == null) {
                return;
            }
            this._selectedTrophy = this._trophies.find(x => x.name === e.target.value) || this._trophies[0];
            urlInput.setValue(this._selectedTrophy.url);
        })
            .append(...this._trophies.map(trophy => {
            return _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('option')
                .setAttribute('value', trophy.name)
                .setText(`[${(0,_util_string__WEBPACK_IMPORTED_MODULE_4__.capitalizeFirstLetter)(trophy.trophyGrade)}] ${trophy.name} - ${trophy.description}`);
        })), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('i')), urlInput);
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('center')
            .append(listSelector)), new _ui_panel_PanelBottom__WEBPACK_IMPORTED_MODULE_1__.PanelBottom('Insert', () => {
            const chosenTrophy = this._selectedTrophy;
            (0,_util_string__WEBPACK_IMPORTED_MODULE_4__.insertAtSelection)(this._range, _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('img')
                .setAttribute('src', `/lib/img/icons/buttons/${chosenTrophy.trophyGrade}.png`)
                .setAttribute('title', chosenTrophy.name)
                .setAttribute('alt', 'Trophy')
                .addClass('input', 'fr-fic', 'fr-dii'), '\xA0', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
                .setAttribute('href', urlInput.serialize())
                .setText(chosenTrophy.name)
                .setAttribute('rel', 'noopener noreferrer'))
                .get());
            this.remove();
        }, 'Close', () => this.remove()));
    }
}


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TrophyListProgressScraper": () => (/* binding */ TrophyListProgressScraper)
/* harmony export */ });
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);


class TrophyListProgressScraper {
    constructor(doc) {
        this._doc = doc;
    }
    _q(query, options = {}) {
        return _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q(query, options, this._doc);
    }
    _getProgressBox() {
        return this._q('#content table.box');
    }
    _allTrophyRows() {
        return (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#content.page > div.row > div.col-xs tr', {}, this._doc)
            .filter(e => e.clone().find('img[title="Platinum"], img[title="Gold"], img[title="Silver"], img[title="Bronze"]').exists());
    }
    getFromTrophiesPage(exitEarly) {
        const hasProgress = this._q('#content div.col-xs table.box div.progress-bar').exists();
        if (!hasProgress && exitEarly) {
            return null;
        }
        const url = this._q('meta[property="og:url"]').getAttribute('content');
        const username = this._q('.title-bar').find('a').getText();
        const avatar = this._q('#content img.trophy').getAttribute('src');
        const lastActive = this._getProgressBox().find('span.small-info').getText().trim().replace(/[0-9]{1,2} of [0-9]{1,3} Trophies/, '').trim();
        const rank = this._getProgressBox().find('span.game-rank').getText();
        const progress = this._getProgressBox().find('div.progress-bar span').getText();
        const dlcCount = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('[id^="DLC-"]', {}, this._doc).length;
        const trophies = this._allTrophyRows().map((row, index) => {
            const subListName = row
                .clone()
                .parent()
                .parent()
                .parent()
                .find('span.title')
                .getText()
                .trim();
            const subListIcon = row.clone().parent().parent().parent().find('img').getAttribute('src');
            const completed = row.hasClass('completed');
            const image = row.clone().find('picture > img').getAttribute('src');
            const path = row.clone().find('a.title').getAttribute('href');
            const name = row.clone().find('a.title').getText();
            const description = row
                .clone()
                .find('td', { eq: 1 })
                .getText()
                .replace(name, '')
                .replace(/[\t\n\r]/g, '');
            const date = row.clone().find('span.typo-top-date').getText();
            const time = row.clone().find('span.typo-bottom-date').getText();
            const progress = row.clone().find('span.typo-top').getText().includes('/')
                ? row.find('span.typo-top').getText()
                : '';
            const trophyGrade = row
                .clone()
                .find('img[title="Platinum"], img[title="Gold"], img[title="Silver"], img[title="Bronze"]')
                .getAttribute('title')
                .toLowerCase();
            const trophyGradeIcon = row
                .clone()
                .find('img[title="Platinum"], img[title="Gold"], img[title="Silver"], img[title="Bronze"]')
                .getAttribute('src');
            const rarity = row.clone().find('td.hover-hide span.typo-top').getText();
            const rarityGrade = row.clone().find('td.hover-hide span.typo-bottom').getText();
            return {
                id: index + 1,
                subListName,
                subListIcon,
                completed,
                image,
                path,
                name,
                description,
                date,
                time,
                progress,
                rarity,
                rarityGrade,
                trophyGrade,
                trophyGradeIcon
            };
        });
        return {
            url,
            username,
            avatar,
            lastActive,
            rank,
            progress,
            dlcCount,
            trophies
        };
    }
    static async getFromUrl(url, exitEarly) {
        const doc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_0__.fetchDocument)(url);
        return new TrophyListProgressScraper(doc).getFromTrophiesPage(exitEarly);
    }
}


/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Profile": () => (/* binding */ Profile)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(53);
/* harmony import */ var _features_lists_ListTable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(61);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(19);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(12);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(34);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(5);
/* harmony import */ var _features_sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(17);
/* harmony import */ var _util_observe__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(35);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(55);
/* harmony import */ var _features_game_progress_scrapeGameProgress__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(75);
/* harmony import */ var _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(20);
/* harmony import */ var _features_lists_ListManager__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(76);
/* harmony import */ var _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(8);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(21);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(24);
/* harmony import */ var _features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(68);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(25);
/* harmony import */ var _ui_ui_utils__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(39);
/* harmony import */ var _features_lists_ListPanel__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(77);
/* harmony import */ var _util_Logger__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(49);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(13);
/* harmony import */ var _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(44);
/* harmony import */ var _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(79);
/* harmony import */ var _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(30);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(51);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(43);
/* harmony import */ var _features_my_series_ISeriesList__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(80);
/* harmony import */ var _features_my_series_MySeriesTable__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(81);
/* harmony import */ var _features_guide_IGuide__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(69);
/* harmony import */ var _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(45);
































class Profile {
    constructor(isMe, username, section) {
        this._settingsStorage = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_6__.SettingsStorage();
        this._logger = new _util_Logger__WEBPACK_IMPORTED_MODULE_20__.Logger(this._settingsStorage.get('enableScriptLogger'), 'Profile');
        this._isMe = isMe;
        this._username = username;
        this._section = location.hash !== ''
            ? location.hash
            : typeof section === 'undefined'
                ? 'games'
                : section;
        this._listsLink = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_17__.HASH_GAME_LISTS)
            .setText('Game Lists');
        this._mySeriesLink = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_17__.HASH_MY_SERIES)
            .setText('My Series');
    }
    _insertMenu() {
        const menuWrapper = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div');
        const updateProfileButton = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setText('Update profile')
            .click((e) => {
            e.preventDefault();
            (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.redirect)((0,_util_user__WEBPACK_IMPORTED_MODULE_3__.getUpdateProfileRedirectPathname)(this._username, location.pathname + location.search + location.hash));
        });
        menuWrapper.append(updateProfileButton);
        const refreshText = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.sidebar > span.floatr > small').getText().replace(/\s\s+/g, ' ').split(' • ');
        const refreshContainer = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').hide();
        if (!refreshText.some(t => t == null)) {
            menuWrapper.append(refreshContainer);
            refreshContainer.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('small').setText(refreshText[0]).setAttribute('style', 'font-size: 10px;'));
            refreshContainer.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('small').setText(refreshText[1]).setAttribute('style', 'font-size: 10px;'));
        }
        const floatingMenu = new _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_1__.FloatingMenu(menuWrapper, () => refreshContainer.show(), () => refreshContainer.hide());
        floatingMenu.insert();
    }
    _appendNavigation() {
        const toAppend = [
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').append(this._listsLink),
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').append(this._mySeriesLink)
        ];
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.navigation > li', { eq: 0 }).after(...toAppend);
    }
    _renderLists() {
        var _a;
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.navigation > li.active').removeClass('active');
        this._listsLink.parent().addClass('active');
        const listStorage = new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_13__.ListStorage();
        const lists = listStorage.get().sort((a, b) => a.name.localeCompare(b.name));
        const lastActiveGameList = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_14__.ScriptStateStorage().get('lastActiveGameList');
        let currentList = (_a = lists.find(list => list.id === lastActiveGameList)) !== null && _a !== void 0 ? _a : lists[0];
        const otherLists = lists.filter(list => list.id !== currentList.id);
        const resizePS5Icons = this._settingsStorage.get('resizePS5Icons');
        let listTable = lists.length > 0
            ? new _features_lists_ListTable__WEBPACK_IMPORTED_MODULE_2__.ListTable(currentList, otherLists, (listItem) => {
                listStorage.removeGame(currentList.id, listItem.id);
            }, (oldIndex, newIndex, shouldReverse) => {
                listStorage.sortGame(currentList.id, oldIndex, newIndex, shouldReverse);
            }, (listItem, targetIndex) => {
                const movedToIndex = listStorage.moveToIndex(currentList.id, listItem.id, targetIndex);
                if (movedToIndex) {
                    this._renderLists();
                }
            }, (listItem, note) => {
                listItem.note = note;
                listStorage.addGameToList(currentList.id, listItem);
            }, (listItem, state) => {
                listItem.psplus = state;
                listStorage.addGameToList(currentList.id, listItem);
            }, (listItem, tags) => {
                listItem.tags = tags;
                listStorage.addGameToList(currentList.id, listItem);
            }, { showUrlRefreshButton: currentList.url != null && currentList.url != '', showActionsDropdown: true, isSortAllowed: currentList.orderBy == null || currentList.orderBy === 'custom', resizePS5Icons })
            : null;
        const listManager = new _features_lists_ListManager__WEBPACK_IMPORTED_MODULE_12__.ListManager(lists, (listId) => {
            const list = listStorage.get().find(list => list.id === listId);
            if (list == null) {
                throw new Error('Invalid list ID');
            }
            currentList = list;
            const otherLists = lists.filter(list => list.id !== currentList.id);
            if (listTable != null) {
                listTable.remove();
            }
            listTable = new _features_lists_ListTable__WEBPACK_IMPORTED_MODULE_2__.ListTable(currentList, otherLists, (listItem) => {
                listStorage.removeGame(currentList.id, listItem.id);
            }, (oldIndex, newIndex, shouldReverse) => {
                listStorage.sortGame(currentList.id, oldIndex, newIndex, shouldReverse);
            }, (listItem, targetIndex) => {
                const movedToIndex = listStorage.moveToIndex(currentList.id, listItem.id, targetIndex);
                if (movedToIndex) {
                    this._renderLists();
                }
            }, (listItem, note) => {
                listItem.note = note;
                listStorage.addGameToList(currentList.id, listItem);
            }, (listItem, state) => {
                listItem.psplus = state;
                listStorage.addGameToList(currentList.id, listItem);
            }, (listItem, tags) => {
                listItem.tags = tags;
                listStorage.addGameToList(currentList.id, listItem);
            }, { showUrlRefreshButton: currentList.url != null && currentList.url != '', showActionsDropdown: true, isSortAllowed: currentList.orderBy == null || currentList.orderBy === 'custom', resizePS5Icons });
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div#content').append(listTable);
        });
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div#content').empty().append(listManager, listTable);
    }
    async _renderMySeries() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.navigation > li.active').removeClass('active');
        this._mySeriesLink.parent().addClass('active');
        const container = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div#content');
        container.empty();
        container
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('h1')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i')
            .addClass('fa', 'fa-spinner', 'fa-spin', 'fa-fw')
            .setAttribute('aria-hidden', 'true'), ' Loading...')));
        const series = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_21__.fetchJson)(_util_constants__WEBPACK_IMPORTED_MODULE_17__.LINK_SERIES);
        container.empty();
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div#content').empty().append(series.version === _features_my_series_ISeriesList__WEBPACK_IMPORTED_MODULE_27__.SUPPORTED_MYSERIES_VERSION
            ? new _features_my_series_MySeriesTable__WEBPACK_IMPORTED_MODULE_28__.MySeriesTable(series)
            : 'This script does not support series version provided by the server. Server version: ' + series.version + ', script version: ' + _features_my_series_ISeriesList__WEBPACK_IMPORTED_MODULE_27__.SUPPORTED_MYSERIES_VERSION);
    }
    _displayPoints() {
        const platinum = parseInt(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.platinum').getText().trim().replace(/,/g, ''), 10);
        const gold = parseInt(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.gold').getText().trim().replace(/,/g, ''), 10);
        const silver = parseInt(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.silver').getText().trim().replace(/,/g, ''), 10);
        const bronze = parseInt(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.bronze').getText().trim().replace(/,/g, ''), 10);
        const platinumPoints = platinum * _util_constants__WEBPACK_IMPORTED_MODULE_17__.TROPHY_VALUES.PLATINUM;
        const goldPoints = gold * _util_constants__WEBPACK_IMPORTED_MODULE_17__.TROPHY_VALUES.GOLD;
        const silverPoints = silver * _util_constants__WEBPACK_IMPORTED_MODULE_17__.TROPHY_VALUES.SILVER;
        const bronzePoints = bronze * _util_constants__WEBPACK_IMPORTED_MODULE_17__.TROPHY_VALUES.BRONZE;
        const points = platinumPoints + goldPoints + silverPoints + bronzePoints;
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.total').apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, `${points.toLocaleString('en-US')} Points`));
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.platinum').apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, `${platinumPoints.toLocaleString('en-US')} Points`));
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.gold').apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, `${goldPoints.toLocaleString('en-US')} Points`));
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.silver').apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, `${silverPoints.toLocaleString('en-US')} Points`));
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('ul.profile-bar li.bronze').apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, `${bronzePoints.toLocaleString('en-US')} Points`));
    }
    _checkDonatorStatus() {
        const donatorStatus = new _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_22__.DonatorsStorage().getDonatorStatus(this._username);
        if (!donatorStatus.isDonator) {
            return;
        }
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('span.username')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .setText('☕')
            .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, `PSNP+ supporter - ${donatorStatus.count} coffee${donatorStatus.count > 1 ? 's' : ''}`)));
    }
    _runEasterEgg() {
        if (this._username !== _util_constants__WEBPACK_IMPORTED_MODULE_17__.AUTHOR_PSN_ID) {
            return;
        }
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('span.username')
            .parent()
            .next()
            .setCss('maxWidth', '200px')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('marquee')
            .setAttribute('style', `border-radius: 2px; background-color: ${_util_constants__WEBPACK_IMPORTED_MODULE_17__.COLOR_PURPLE}aa; border: 1px solid ${_util_constants__WEBPACK_IMPORTED_MODULE_17__.COLOR_PURPLE};`)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('comment')
            .setText('Thank you for using PSNP+! 🥚')));
    }
    _getAllGameRows() {
        return (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('#gamesTable:not([style*="display: none"]) tr, #search-results:not([style*="display: none"]) tr')
            .filter(row => {
            const id = row.getAttribute('id');
            return id !== 'load-more' && id !== 'table-loading';
        })
            .filter(row => {
            return !row.clone().find('h2.center').exists();
        });
    }
    _getAllUnprocessedRows() {
        return this._getAllGameRows()
            .filter(row => {
            const alreadyEnhanced = row.getAttribute('data-psnpp-processed');
            return alreadyEnhanced !== 'true';
        });
    }
    _markRowsAsProcessed(rows) {
        rows.forEach(row => {
            row.setAttribute('data-psnpp-processed', 'true');
        });
    }
    _removeGamesFromLists(games) {
        if (!this._isMe) {
            return;
        }
        const listStorage = new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_13__.ListStorage();
        games.forEach(game => {
            const removed = listStorage.removeGameFromAllListsWithAutoRemoval(game);
            if (removed) {
                this._logger.debug('Automatically removed game with id', game.id, 'from at least 1 list.');
            }
        });
    }
    _enhanceRowsWithSessions(rows) {
        if (!this._settingsStorage.get('gamingSessionsScraping')) {
            return;
        }
        const indexedSession = new _features_sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_7__.SessionStorage().indexedByTrophyListId();
        rows
            .forEach(row => {
            const imageUrl = row.clone().find('td').find('img').getAttribute('src');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getTrophyListIdFromImageUrl)(imageUrl);
            const activeSessions = indexedSession.get(trophyListId);
            if (activeSessions == null) {
                return;
            }
            const gamePath = row.clone().find('td', { eq: 1 }).find('a').getAttribute('href');
            const titleSpan = row.clone().find('td', { eq: 1 }).find('span');
            titleSpan.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', gamePath.replace('trophies', 'sessions').replace(this._username, ''))
                .setAttribute('style', 'color:#646464;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i')
                .addClass('fa', 'fa-users', 'marker-session')
                .setAttribute('aria-hidden', 'true')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, activeSessions.length + ' Active Gaming Session(s)'))));
        });
    }
    _enhanceRowsWithShutdownInfo(rows) {
        const shutdowns = new _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_30__.ShutdownsStorage().get().data;
        rows
            .forEach(row => {
            const trophyListPathname = row.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(trophyListPathname);
            const shutdownForList = shutdowns.list[trophyListId];
            if (shutdownForList == null) {
                return;
            }
            const titleSpan = row.clone().find('td', { eq: 1 }).find('span');
            const shutdownDate = (0,_util_date__WEBPACK_IMPORTED_MODULE_9__.getUtcLocaleDateString)(shutdownForList.shutdownTimestamp);
            const tooltipText = `<b>SHUTDOWN NOTICE</b><br>The online servers for this game are scheduled to be shut down on ${shutdownDate}.`;
            titleSpan.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-clock-o')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, tooltipText)));
        });
    }
    _enhanceRowsWithUnobtainableTrophies(rows) {
        if (!this._settingsStorage.get('markUnobtainableTrophies')) {
            return;
        }
        const unobtainableTrophies = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_15__.UnobtainableTrophiesStorage().get();
        rows
            .forEach(row => {
            const trophyListPathname = row.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(trophyListPathname);
            const unobtainableTrophiesForList = unobtainableTrophies.data.list[trophyListId];
            if (unobtainableTrophiesForList == null) {
                return;
            }
            const titleSpan = row.clone().find('td', { eq: 1 }).find('span');
            titleSpan.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i')
                .addClass('fa', 'fa-exclamation-circle', 'marker-unobtainable-trophies')
                .setAttribute('aria-hidden', 'true')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, (0,_features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_16__.getUnobtainableTrophiesDescription)(unobtainableTrophiesForList))));
        });
    }
    _enhanceRowsWithGuideInfo(rows) {
        const guides = new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_24__.GuideStorage().get();
        rows
            .forEach(row => {
            const trophyListPathname = row.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(trophyListPathname);
            const guide = guides.data.list.games[trophyListId];
            if (guide == null) {
                return;
            }
            const [difficulty, playthroughs, hours] = guide.r;
            const guideLink = (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_29__.getGuideHref)(guide.a, guide.p);
            const target = row.clone().find('div.small-info');
            target.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .addClass('psnpp-guide-info-profile')
                .append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', guideLink.href)
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .setText(`${difficulty}/10`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_25__.getDifficultyClass)(difficulty))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .setText(`${playthroughs}x`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_25__.getPlaythroughsClass)(playthroughs))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .setText(`${hours}h`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_25__.getHoursClass)(hours))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'))
                .condition(guideLink.isExternal, (el) => {
                el.setAttribute('target', '_blank');
            })));
        });
    }
    _enhanceRowsWithAddToListButton(rows) {
        if (!this._settingsStorage.get('profileShowAddToListButton')) {
            return;
        }
        const lastActiveGameList = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_14__.ScriptStateStorage().get('lastActiveGameList');
        if (lastActiveGameList == null) {
            return;
        }
        const listExists = new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_13__.ListStorage().has(lastActiveGameList);
        if (!listExists) {
            return;
        }
        rows
            .forEach(row => {
            const trophyListUrl = row.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(trophyListUrl);
            row.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .addClass('separator', 'left')
                .append(new _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_23__.ListButtonSmall(trophyListId, trophyListUrl, lastActiveGameList, 'psnpp-list-button'))));
        });
    }
    _enhanceRows(rows) {
        this._enhanceRowsWithSessions(rows);
        this._enhanceRowsWithUnobtainableTrophies(rows);
        this._enhanceRowsWithShutdownInfo(rows);
        this._enhanceRowsWithGuideInfo(rows);
        this._enhanceRowsWithAddToListButton(rows);
        this._markRowsAsProcessed(rows);
    }
    _scrapeProgress(rows) {
        if (!this._isMe || this._settingsStorage.get('profileDisableScraping')) {
            return [];
        }
        const games = (0,_features_game_progress_scrapeGameProgress__WEBPACK_IMPORTED_MODULE_10__.scrapeGameProgress)(rows);
        new _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_11__.GameProgressStorage().addMany(games);
        return games;
    }
    _orderGamesByCompletionTime() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            const progressA = parseInt(rowA.clone().find('div.progress-bar').find('span').getText().replace('%', ''), 10);
            const completionTimeContainerA = rowA.clone().find('td', { eq: 1 }).find('div.small-info', { eq: 1 }).find('b');
            const completionTimeA = completionTimeContainerA.exists()
                ? (0,_util_date__WEBPACK_IMPORTED_MODULE_9__.parseCompletionTime)(completionTimeContainerA.getText())
                : null;
            const progressB = parseInt(rowB.clone().find('div.progress-bar').find('span').getText().replace('%', ''), 10);
            const completionTimeContainerB = rowB.clone().find('td', { eq: 1 }).find('div.small-info', { eq: 1 }).find('b');
            const completionTimeB = completionTimeContainerB.exists()
                ? (0,_util_date__WEBPACK_IMPORTED_MODULE_9__.parseCompletionTime)(completionTimeContainerB.getText())
                : null;
            if (completionTimeA == null && completionTimeB == null) {
                return progressB - progressA;
            }
            if (completionTimeA == null && completionTimeB != null) {
                return 1;
            }
            if (completionTimeA != null && completionTimeB == null) {
                return -1;
            }
            if (completionTimeA != null && completionTimeB != null) {
                return completionTimeB - completionTimeA;
            }
            return 0;
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _getRates(row) {
        const platinumpctElement = row.clone().find('span.completion-status').find('span.platinum');
        const platinumpct = platinumpctElement.exists()
            ? parseFloat(platinumpctElement.getText().replace('%', ''))
            : undefined;
        const completepctElement = row.clone().find('span.completion-status').find('span.completion');
        const completepct = completepctElement.exists()
            ? parseFloat(completepctElement.getText().replace('%', ''))
            : undefined;
        return { platinumpct, completepct };
    }
    _orderGamesByPlatinumRate() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            var _a, _b, _c, _d;
            const ratesA = this._getRates(rowA);
            const ratesB = this._getRates(rowB);
            const valueA = (_b = (_a = ratesA.platinumpct) !== null && _a !== void 0 ? _a : ratesA.completepct) !== null && _b !== void 0 ? _b : 0;
            const valueB = (_d = (_c = ratesB.platinumpct) !== null && _c !== void 0 ? _c : ratesB.completepct) !== null && _d !== void 0 ? _d : 0;
            return valueB - valueA;
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _orderGamesByCompletionRate() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            var _a, _b, _c, _d;
            const ratesA = this._getRates(rowA);
            const ratesB = this._getRates(rowB);
            const valueA = (_b = (_a = ratesA.completepct) !== null && _a !== void 0 ? _a : ratesA.platinumpct) !== null && _b !== void 0 ? _b : 0;
            const valueB = (_d = (_c = ratesB.completepct) !== null && _c !== void 0 ? _c : ratesB.platinumpct) !== null && _d !== void 0 ? _d : 0;
            return valueB - valueA;
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _orderByRank() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            // NOTE: Text is a single-character string from "SABCDEF".
            let rankA = rowA.clone().find('span.game-rank').getText();
            let rankB = rowB.clone().find('span.game-rank').getText();
            // NOTE: Using ASCII codes here. '0'(48) is lower than 'A' (65).
            if (rankA === 'S')
                rankA = '0';
            if (rankB === 'S')
                rankB = '0';
            return rankA.charCodeAt(0) - rankB.charCodeAt(0);
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _orderByTotalNumberOfTrophies() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            // NOTE: This matches first "small-info"
            const trophiesAMatch = rowA.clone().find('div.small-info').getText().match(/(\d+) Trophies/);
            const trophiesBMatch = rowB.clone().find('div.small-info').getText().match(/(\d+) Trophies/);
            let trophiesA = 0;
            if (trophiesAMatch != null) {
                trophiesA = parseInt(trophiesAMatch[1], 10);
            }
            let trophiesB = 0;
            if (trophiesBMatch != null) {
                trophiesB = parseInt(trophiesBMatch[1], 10);
            }
            return trophiesB - trophiesA;
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _orderByNumberOfEarnedTrophies() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            // NOTE: This matches first "small-info"
            const trophiesAMatch1 = rowA.clone().find('div.small-info').getText().replace(/\s+/g, ' ').trim().match(/(\d+) of (\d+) Trophies/);
            const trophiesBMatch1 = rowB.clone().find('div.small-info').getText().replace(/\s+/g, ' ').trim().match(/(\d+) of (\d+) Trophies/);
            const trophiesAMatch2 = rowA.clone().find('div.small-info').getText().replace(/\s+/g, ' ').trim().match(/All (\d+) Trophies/);
            const trophiesBMatch2 = rowB.clone().find('div.small-info').getText().replace(/\s+/g, ' ').trim().match(/All (\d+) Trophies/);
            let earnedTrophiesA = 0;
            if (trophiesAMatch1 != null) {
                earnedTrophiesA = parseInt(trophiesAMatch1[1], 10);
            }
            if (trophiesAMatch2 != null) {
                earnedTrophiesA = parseInt(trophiesAMatch2[1], 10);
            }
            let earnedTrophiesB = 0;
            if (trophiesBMatch1 != null) {
                earnedTrophiesB = parseInt(trophiesBMatch1[1], 10);
            }
            if (trophiesBMatch2 != null) {
                earnedTrophiesB = parseInt(trophiesBMatch2[1], 10);
            }
            return earnedTrophiesB - earnedTrophiesA;
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _orderByNumberOfUnearnedTrophies() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            // NOTE: This matches first "small-info"
            const trophiesAMatch = rowA.clone().find('div.small-info').getText().replace(/\s+/g, ' ').trim().match(/(\d+) of (\d+) Trophies/);
            const trophiesBMatch = rowB.clone().find('div.small-info').getText().replace(/\s+/g, ' ').trim().match(/(\d+) of (\d+) Trophies/);
            let unearnedTrophiesA = 0;
            if (trophiesAMatch != null) {
                unearnedTrophiesA = parseInt(trophiesAMatch[2], 10) - parseInt(trophiesAMatch[1], 10);
            }
            let unearnedTrophiesB = 0;
            if (trophiesBMatch != null) {
                unearnedTrophiesB = parseInt(trophiesBMatch[2], 10) - parseInt(trophiesBMatch[1], 10);
            }
            return unearnedTrophiesB - unearnedTrophiesA;
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _orderByTime() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        const guides = new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_24__.GuideStorage().get();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            var _a, _b, _c, _d;
            const aId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(rowA.clone().find('a.title').getAttribute('href'));
            const bId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(rowB.clone().find('a.title').getAttribute('href'));
            const aTime = (_b = (_a = guides.data.list.games[aId]) === null || _a === void 0 ? void 0 : _a.r[2]) !== null && _b !== void 0 ? _b : 9999;
            const bTime = (_d = (_c = guides.data.list.games[bId]) === null || _c === void 0 ? void 0 : _c.r[2]) !== null && _d !== void 0 ? _d : 9999;
            return aTime - bTime;
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _orderByDifficulty() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
        const guides = new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_24__.GuideStorage().get();
        this._getAllGameRows()
            .sort((rowA, rowB) => {
            var _a, _b, _c, _d;
            const aId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(rowA.clone().find('a.title').getAttribute('href'));
            const bId = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(rowB.clone().find('a.title').getAttribute('href'));
            const aDifficulty = (_b = (_a = guides.data.list.games[aId]) === null || _a === void 0 ? void 0 : _a.r[0]) !== null && _b !== void 0 ? _b : 11;
            const bDifficulty = (_d = (_c = guides.data.list.games[bId]) === null || _c === void 0 ? void 0 : _c.r[0]) !== null && _d !== void 0 ? _d : 11;
            return aDifficulty - bDifficulty;
        })
            .forEach(row => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#gamesTable > tbody').append(row));
    }
    _appendOtherButtons() {
        const all = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('All')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.other').setText('Other (all)');
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
            const allGames = this._getAllGameRows();
            allGames.forEach(row => row.show());
            this._updateTitleWithGameCount(allGames.length);
        }));
        const withUnobtainableTrophies = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('With Unobtainables')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.other').setText('Other (w/ Unobtainables)');
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
            const allGames = this._getAllGameRows();
            let count = allGames.length;
            allGames.forEach(row => {
                row.show();
                const containsUnobtainableTrophies = row.clone().find('.marker-unobtainable-trophies').exists();
                if (!containsUnobtainableTrophies) {
                    row.hide();
                    count--;
                }
            });
            this._updateTitleWithGameCount(count);
        }));
        const withoutUnobtainableTrophies = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Without Unobtainables')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.other').setText('Other (w/o Unobtainables)');
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
            const allGames = this._getAllGameRows();
            let count = allGames.length;
            allGames.forEach(row => {
                row.show();
                const containsUnobtainableTrophies = row.clone().find('.marker-unobtainable-trophies').exists();
                if (containsUnobtainableTrophies) {
                    row.hide();
                    count--;
                }
            });
            this._updateTitleWithGameCount(count);
        }));
        const sessionAvailable = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Session available')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.other').setText('Other (Session)');
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
            const allGames = this._getAllGameRows();
            let count = allGames.length;
            allGames.forEach(row => {
                row.show();
                const hasSessionGoing = row.clone().find('.marker-session').exists();
                if (!hasSessionGoing) {
                    row.hide();
                    count--;
                }
            });
            this._updateTitleWithGameCount(count);
        }));
        const withPlatinum = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('With Platinum')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.other').setText('Other (w/ Platinum)');
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
            const allGames = this._getAllGameRows();
            let count = allGames.length;
            allGames.forEach(row => {
                row.show();
                const hasPlatinumIcon = row.clone().find('img.icon-sprite.platinum-18').exists();
                if (!hasPlatinumIcon) {
                    row.hide();
                    count--;
                }
            });
            this._updateTitleWithGameCount(count);
        }));
        const withoutPlatinum = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Without Platinum')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.other').setText('Other (w/o Platinum)');
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#load-more').remove();
            const allGames = this._getAllGameRows();
            let count = allGames.length;
            allGames.forEach(row => {
                row.show();
                const hasPlatinumIcon = row.clone().find('img.icon-sprite.platinum-18').exists();
                if (hasPlatinumIcon) {
                    row.hide();
                    count--;
                }
            });
            this._updateTitleWithGameCount(count);
        }));
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.row > div.col-xs-8 > div.title.flex.v-align > div.no-shrink')
            .prepend(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('dropdown', 'buttons')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('dropdown-toggle', 'other')
            .setAttribute('style', 'background-position: 4px -141px;')
            .setAttribute('data-toggle', 'dropdown')
            .setAttribute('href', '')
            .setText('Other (All)'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('ul')
            .addClass('dropdown-menu')
            .setAttribute('role', 'menu')
            .setAttribute('aria-labelledby', 'dLabel')
            .append(all, sessionAvailable, withUnobtainableTrophies, withoutUnobtainableTrophies, withPlatinum, withoutPlatinum)));
    }
    _appendLoadAllGamesButton() {
        if (!(0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.gamesListCanBeExpanded)()) {
            return false;
        }
        let clicked = false;
        const loadAllGamesButton = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-arrow-circle-down'))
            .setAttribute('style', 'margin: 0; padding: 6px 8px 8px 8px;')
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, 'Load all games'))
            .click((e, el) => {
            e.preventDefault();
            if (clicked) {
                return;
            }
            clicked = true;
            (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.loadAllGames)(() => loadAllGamesButton.remove());
            // NOTE: Need to manually hide tiptip, otherwise it stays visible
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div#tiptip_holder').hide();
            el.clone().find('i')
                .removeClass('fa-arrow-circle-down')
                .addClass('fa-spinner', 'fa-spin', 'fa-fw');
        });
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.row > div.col-xs-8 > div.title.flex.v-align > div.no-shrink')
            .prepend(loadAllGamesButton);
        return true;
    }
    _appendHideMyGamesButton(shouldApplyLeftMargin) {
        let hidden = false;
        const leftMargin = shouldApplyLeftMargin
            ? '5px'
            : '0';
        const diffButton = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-eraser'))
            .setAttribute('style', `margin-left: ${leftMargin}; padding: 6px 8px 8px 8px;`)
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, 'Hide my games'))
            .click((e) => {
            e.preventDefault();
            const playedGames = new _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_11__.GameProgressStorage().indexedById();
            const allRows = this._getAllGameRows();
            let count = allRows.length;
            allRows.forEach(row => {
                const path = row.clone().find('a.title').getAttribute('href');
                const id = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(path);
                if (playedGames.has(id)) {
                    if (hidden) {
                        row.show();
                    }
                    else {
                        row.hide();
                        count--;
                    }
                }
            });
            this._updateTitleWithGameCount(count);
            hidden = !hidden;
        });
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.row > div.col-xs-8 > div.title.flex.v-align > div.no-shrink')
            .prepend(diffButton);
    }
    _appendUnobtainableFilter() {
        if (!this._settingsStorage.get('markUnobtainableTrophies')) {
            return;
        }
        const scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_14__.ScriptStateStorage();
        const utStorage = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_15__.UnobtainableTrophiesStorage();
        const isChecked = scriptStateStorage.get('hideUnobtainableTrophiesInLog');
        const description = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').setText('Hide Unobtainables (0)');
        const toggleVisibility = (checked) => {
            let count = 0;
            const unobtainableTrophies = utStorage.get();
            const rows = (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('table.zebra tr');
            rows.forEach(row => {
                const titleAnchor = row.clone().find('a.title');
                if (!titleAnchor.exists())
                    return;
                const trophyPath = titleAnchor.getAttribute('href');
                const trophyListId = parseInt((0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(trophyPath), 10);
                const trophyId = parseInt((0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getSecondLevelIdFromPathname)(trophyPath), 10);
                const unobtainableTrophiesForList = unobtainableTrophies.data.list[trophyListId];
                const isUnobtainable = unobtainableTrophiesForList != null &&
                    (unobtainableTrophiesForList.includes(trophyId) || unobtainableTrophiesForList[0] === 0);
                if (checked && isUnobtainable) {
                    row.hide();
                    count++;
                }
                else {
                    row.show();
                }
                description.setText(`Hide Unobtainables (${count})`);
            });
        };
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.row > div.col-xs-12 > div.title.flex.v-align > div.no-shrink')
            .prepend(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label')
            .setAttribute('for', 'psnpp-hide-unobtainable')
            .setAttribute('style', 'vertical-align: inherit; padding: 0px 15px 0px 15px; display: inline-block; cursor: pointer;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('input')
            .setAttribute('type', 'checkbox')
            .setAttribute('id', 'psnpp-hide-unobtainable')
            .condition(isChecked, (el) => el.setAttribute('checked', ''))
            .setAttribute('style', 'top: 2px; position: relative; margin-right: 0.5rem;')
            .click((ev) => {
            const isChecked = ev.target.checked;
            scriptStateStorage.set('hideUnobtainableTrophiesInLog', isChecked);
            toggleVisibility(isChecked);
        }), description)));
        toggleVisibility(isChecked);
    }
    _appendOrderByButtons() {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order')
            .parent()
            .find('ul.dropdown-menu')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Completion Time')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Completion Time)');
            this._orderGamesByCompletionTime();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Rank')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Rank)');
            this._orderByRank();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Total Trophies')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Total Trophies)');
            this._orderByTotalNumberOfTrophies();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Earned Trophies')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Earned Trophies)');
            this._orderByNumberOfEarnedTrophies();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Unearned Trophies')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Unearned Trophies)');
            this._orderByNumberOfUnearnedTrophies();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Platinum Rate')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Platinum Rate)');
            this._orderGamesByPlatinumRate();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Completion Rate')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Completion Rate)');
            this._orderGamesByCompletionRate();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Guide Time')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Guide Time)');
            this._orderByTime();
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .setAttribute('style', 'background: #e0e0e0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Difficulty')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('a.dropdown-toggle.order').setText('Order (Difficulty)');
            this._orderByDifficulty();
        })));
    }
    _updateTitleWithGameCount(count) {
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#content > div > div.col-xs-8 > div.title > div > h3')
            .setText(`Games (${count}${(0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.gamesListCanBeExpanded)() ? '+' : ''})`)
            .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_5__.tooltip)(el, 'Number of loaded games in this profile. Use "Load all games" button to load everything or scroll down to load more games.'));
    }
    _processRows() {
        const allGameRows = this._getAllGameRows();
        this._updateTitleWithGameCount(allGameRows.length);
        const unprocessedRows = this._getAllUnprocessedRows();
        const scrapedGames = this._scrapeProgress(unprocessedRows);
        this._enhanceRows(unprocessedRows);
        // This can be very slow, offloaded to next event loop cycle
        setTimeout(() => {
            this._removeGamesFromLists(scrapedGames);
        }, 0);
    }
    _watchGamesList() {
        const disconnect = (0,_util_observe__WEBPACK_IMPORTED_MODULE_8__.gamesObserve)(() => {
            disconnect();
            this._processRows();
            this._watchGamesList();
        });
    }
    _processHash() {
        if (location.hash.startsWith(_util_constants__WEBPACK_IMPORTED_MODULE_17__.HASH_GAME_LISTS)) {
            this._renderLists();
            const hashSearchParams = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getSearchParamsFromHash)();
            const url = hashSearchParams.get('import');
            if (url != null) {
                (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_18__.appendPanel)(new _features_lists_ListPanel__WEBPACK_IMPORTED_MODULE_19__.ListImportPanel(url));
            }
            return;
        }
        if (location.hash.startsWith(_util_constants__WEBPACK_IMPORTED_MODULE_17__.HASH_MY_SERIES)) {
            this._renderMySeries();
            return;
        }
    }
    _observeHash() {
        window.addEventListener('hashchange', () => this._processHash());
    }
    async _modifyRarestTrophiesWidget() {
        if (!this._settingsStorage.get('profileShowOnlyUniqueGamesInRarestTrophies')) {
            return;
        }
        const trophyLogPath = `/${this._username}/log?order=rarity&dir=asc`;
        this._logger.debug('Going to fetch rarest trophies from:', trophyLogPath);
        try {
            const doc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_21__.fetchDocument)(trophyLogPath);
            const rarest50Trophies = (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('table.zebra tr', {}, doc)
                .map(e => {
                const trophyListPath = e.clone().find('a[href^="/trophies/"]').getAttribute('href');
                const trophyPath = e.clone().find('a[href^="/trophy/"]').getAttribute('href');
                return {
                    trophyListId: (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(trophyListPath),
                    trophyListPath,
                    trophyListTitle: e.clone().find('img.game').getAttribute('title'),
                    trophyTitle: e.clone().find('a.title').getText(),
                    trophyPath,
                    image: e.clone().find('img.trophy').getAttribute('src'),
                    rarity: e.clone().find('td', { eq: 8 }).find('span.typo-top').getText(),
                    rarityType: e.clone().find('td', { eq: 8 }).find('span.typo-bottom nobr').getText(),
                    trophyIcon: e.clone().find('td', { eq: 9 }).find('img').getAttribute('src'),
                    trophyType: e.clone().find('td', { eq: 9 }).find('img').getAttribute('title')
                };
            })
                .sort((a, b) => {
                const trophyTypeMap = {
                    Platinum: 0,
                    Gold: 1,
                    Silver: 2,
                    Bronze: 3
                };
                if (a.rarity === b.rarity) {
                    return trophyTypeMap[a.trophyType] - trophyTypeMap[b.trophyType];
                }
                const rarityA = parseInt(a.rarity, 10);
                const rarityB = parseInt(b.rarity, 10);
                return rarityA - rarityB;
            });
            const usedGames = new Set();
            const rarestUniqueGameTrophies = rarest50Trophies.reduce((prev, current) => {
                if (!usedGames.has(current.trophyListId) && usedGames.size < 5) {
                    prev.push(current);
                    usedGames.add(current.trophyListId);
                }
                return prev;
            }, []);
            const header = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('h3', { equalsText: 'Rarest Trophies' });
            header.setText('Rarest Unique Trophies');
            const target = header
                .parent().parent().next()
                .find('table.zebra tbody');
            target.empty();
            target.append(...rarestUniqueGameTrophies.map(trophy => {
                return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tr')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                    .setAttribute('style', 'width: 1%;')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                    .setAttribute('href', trophy.trophyPath)
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('picture')
                    .addClass('trophy')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img').setAttribute('src', trophy.image)))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                    .setAttribute('style', 'padding-left: 10px;')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                    .addClass('ellipsis')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                    .addClass('small-title')
                    .setAttribute('href', trophy.trophyPath)
                    .setText(trophy.trophyTitle)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                    .addClass('ellipsis')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                    .setAttribute('href', trophy.trophyListPath)
                    .setAttribute('rel', 'nofollow')
                    .setText(trophy.trophyListTitle))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                    .setAttribute('style', 'width: 1%;')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-top').setText(trophy.rarity), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-bottom').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('nobr').setText(trophy.rarityType)))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                    .setAttribute('style', 'width: 1%;')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                    .addClass('separator', 'left')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img')
                    .setAttribute('src', trophy.trophyIcon))));
            }));
        }
        catch (e) {
            this._logger.warn('Failed to fetch rarest trophies', e);
        }
    }
    // Trophy Log
    _markTrophyLogWithUnobtainableTrophies() {
        if (!this._settingsStorage.get('markUnobtainableTrophies')) {
            return;
        }
        const unobtainableTrophies = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_15__.UnobtainableTrophiesStorage().get();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('table.zebra tr').forEach(row => {
            const trophyPath = row.clone().find('a.title').getAttribute('href');
            const trophyListId = parseInt((0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getFirstLevelIdFromPathname)(trophyPath), 10);
            const trophyId = parseInt((0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getSecondLevelIdFromPathname)(trophyPath), 10);
            const unobtainableTrophiesForList = unobtainableTrophies.data.list[trophyListId];
            if (unobtainableTrophiesForList == null) {
                return;
            }
            if (unobtainableTrophiesForList.includes(trophyId) || unobtainableTrophiesForList[0] === 0) {
                row.setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_17__.COLOR_LIGHT_ORANGE);
            }
        });
    }
    _switchHoursTo24HourFormat() {
        if (!this._settingsStorage.get('use24HourTimeFormat')) {
            return;
        }
        (0,_util_date__WEBPACK_IMPORTED_MODULE_9__.switchHoursTo24HourFormat)();
    }
    _addAccurateTrophyNumbersInLog() {
        const filteredNumberMatch = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#content h3').getText().replace(',', '').match(/^Listing (\d+) Trophies$/);
        if (filteredNumberMatch == null) {
            return;
        }
        const filteredNumber = parseInt(filteredNumberMatch[1], 10);
        const highestNumber = parseInt(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('table.zebra tr b').getText().replace('#', '').replace(',', ''));
        if (filteredNumber === highestNumber) {
            return;
        }
        const currentPageNumberText = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('li a.typo-button.active').exists()
            ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('li a.typo-button.active').getText()
            : '1';
        const currentPage = parseInt(currentPageNumberText, 10);
        const startingNumber = filteredNumber - ((currentPage - 1) * 50);
        (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('table.zebra tr').forEach((row, i) => {
            row.clone().find('b').parent()
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b')
                .setText('#' + (startingNumber - i).toLocaleString('en-US')));
        });
    }
    async run() {
        this._logger.debug('Running');
        this._insertMenu();
        this._displayPoints();
        this._checkDonatorStatus();
        this._runEasterEgg();
        if (this._isMe) {
            this._appendNavigation();
            this._observeHash();
            this._processHash();
        }
        if (this._section === 'games') {
            this._appendOtherButtons();
            const appendedLoadAllGamesButton = this._appendLoadAllGamesButton();
            this._appendOrderByButtons();
            if (!this._isMe) {
                this._appendHideMyGamesButton(appendedLoadAllGamesButton);
            }
            this._processRows();
            this._watchGamesList();
            this._modifyRarestTrophiesWidget();
        }
        if (this._section === 'log') {
            this._markTrophyLogWithUnobtainableTrophies();
            this._switchHoursTo24HourFormat();
            this._addAccurateTrophyNumbersInLog();
            this._appendUnobtainableFilter();
        }
    }
}


/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListTable": () => (/* binding */ ListTable)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(62);
/* harmony import */ var _ui_SearchBox__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(63);
/* harmony import */ var _ui_NoSearchResults__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(64);
/* harmony import */ var _ListTableTitle__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(65);
/* harmony import */ var _ui_MultiDropdownMenu__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(66);
/* harmony import */ var _ListTableRow__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(67);
/* harmony import */ var _sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(17);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(34);
/* harmony import */ var _game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(20);
/* harmony import */ var _ui_ui_utils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(39);
/* harmony import */ var _util_transform__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(16);
/* harmony import */ var _unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(24);
/* harmony import */ var _shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(45);
/* harmony import */ var _ListRandomGamePanel__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(73);
/* harmony import */ var _util_data__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(7);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(13);
/* harmony import */ var _ListStorage__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(8);
/* harmony import */ var _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(21);
/* harmony import */ var _platforms__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(48);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(19);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(25);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(55);
/* harmony import */ var _MoveCopyPanel__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(74);
/* harmony import */ var _guide_GuideStorage__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(30);
/* harmony import */ var _guide_IGuide__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(69);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(43);



























const orderFunctions = {
    custom: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => 1 * d,
    timestamp: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => (a.timestamp - b.timestamp) * d,
    lastActivity: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b;
        const lastActivityA = (_a = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.lastActivity) !== null && _a !== void 0 ? _a : 0;
        const lastActivityB = (_b = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.lastActivity) !== null && _b !== void 0 ? _b : 0;
        return (lastActivityA - lastActivityB) * d;
    },
    completionTime: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b;
        const completionTimeStringA = (_a = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.completionTimeString) !== null && _a !== void 0 ? _a : '';
        const completionTimeStringB = (_b = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.completionTimeString) !== null && _b !== void 0 ? _b : '';
        const completionTimeA = (0,_util_date__WEBPACK_IMPORTED_MODULE_22__.parseCompletionTime)(completionTimeStringA);
        const completionTimeB = (0,_util_date__WEBPACK_IMPORTED_MODULE_22__.parseCompletionTime)(completionTimeStringB);
        return (completionTimeA - completionTimeB) * d;
    },
    alphabetical: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        if (titleA < titleB)
            return -1 * d;
        if (titleA > titleB)
            return 1 * d;
        return 0;
    },
    points: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => (a.points - b.points) * d,
    unearnedPoints: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const totalPointsA = a.points;
        const bronzePointsA = ((_b = (_a = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.trophies) === null || _a === void 0 ? void 0 : _a.bronze) !== null && _b !== void 0 ? _b : 0) * _util_constants__WEBPACK_IMPORTED_MODULE_21__.TROPHY_VALUES.BRONZE;
        const silverPointsA = ((_d = (_c = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.trophies) === null || _c === void 0 ? void 0 : _c.silver) !== null && _d !== void 0 ? _d : 0) * _util_constants__WEBPACK_IMPORTED_MODULE_21__.TROPHY_VALUES.SILVER;
        const goldPointsA = ((_f = (_e = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.trophies) === null || _e === void 0 ? void 0 : _e.gold) !== null && _f !== void 0 ? _f : 0) * _util_constants__WEBPACK_IMPORTED_MODULE_21__.TROPHY_VALUES.GOLD;
        const platinumPointsA = ((_h = (_g = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.trophies) === null || _g === void 0 ? void 0 : _g.platinum) !== null && _h !== void 0 ? _h : 0) * _util_constants__WEBPACK_IMPORTED_MODULE_21__.TROPHY_VALUES.PLATINUM;
        const unearnedA = totalPointsA - bronzePointsA - silverPointsA - goldPointsA - platinumPointsA;
        const totalPointsB = b.points;
        const bronzePointsB = ((_k = (_j = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.trophies) === null || _j === void 0 ? void 0 : _j.bronze) !== null && _k !== void 0 ? _k : 0) * _util_constants__WEBPACK_IMPORTED_MODULE_21__.TROPHY_VALUES.BRONZE;
        const silverPointsB = ((_m = (_l = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.trophies) === null || _l === void 0 ? void 0 : _l.silver) !== null && _m !== void 0 ? _m : 0) * _util_constants__WEBPACK_IMPORTED_MODULE_21__.TROPHY_VALUES.SILVER;
        const goldPointsB = ((_p = (_o = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.trophies) === null || _o === void 0 ? void 0 : _o.gold) !== null && _p !== void 0 ? _p : 0) * _util_constants__WEBPACK_IMPORTED_MODULE_21__.TROPHY_VALUES.GOLD;
        const platinumPointsB = ((_r = (_q = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.trophies) === null || _q === void 0 ? void 0 : _q.platinum) !== null && _r !== void 0 ? _r : 0) * _util_constants__WEBPACK_IMPORTED_MODULE_21__.TROPHY_VALUES.PLATINUM;
        const unearnedB = totalPointsB - bronzePointsB - silverPointsB - goldPointsB - platinumPointsB;
        return (unearnedA - unearnedB) * d;
    },
    trophies: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        const trophiesA = a.trophies.platinum +
            a.trophies.gold +
            a.trophies.silver +
            a.trophies.bronze;
        const trophiesB = b.trophies.platinum +
            b.trophies.gold +
            b.trophies.silver +
            b.trophies.bronze;
        return (trophiesA - trophiesB) * d;
    },
    unearnedTrophies: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const totalTrophiesA = a.trophies.bronze + a.trophies.silver + a.trophies.gold + a.trophies.platinum;
        const bronzeTrophiesA = (_b = (_a = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.trophies) === null || _a === void 0 ? void 0 : _a.bronze) !== null && _b !== void 0 ? _b : 0;
        const silverTrophiesA = (_d = (_c = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.trophies) === null || _c === void 0 ? void 0 : _c.silver) !== null && _d !== void 0 ? _d : 0;
        const goldTrophiesA = (_f = (_e = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.trophies) === null || _e === void 0 ? void 0 : _e.gold) !== null && _f !== void 0 ? _f : 0;
        const platinumTrophiesA = (_h = (_g = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.trophies) === null || _g === void 0 ? void 0 : _g.platinum) !== null && _h !== void 0 ? _h : 0;
        const unearnedA = totalTrophiesA - bronzeTrophiesA - silverTrophiesA - goldTrophiesA - platinumTrophiesA;
        const totalTrophiesB = b.trophies.bronze + b.trophies.silver + b.trophies.gold + b.trophies.platinum;
        const bronzeTrophiesB = (_k = (_j = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.trophies) === null || _j === void 0 ? void 0 : _j.bronze) !== null && _k !== void 0 ? _k : 0;
        const silverTrophiesB = (_m = (_l = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.trophies) === null || _l === void 0 ? void 0 : _l.silver) !== null && _m !== void 0 ? _m : 0;
        const goldTrophiesB = (_p = (_o = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.trophies) === null || _o === void 0 ? void 0 : _o.gold) !== null && _p !== void 0 ? _p : 0;
        const platinumTrophiesB = (_r = (_q = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.trophies) === null || _q === void 0 ? void 0 : _q.platinum) !== null && _r !== void 0 ? _r : 0;
        const unearnedB = totalTrophiesB - bronzeTrophiesB - silverTrophiesB - goldTrophiesB - platinumTrophiesB;
        return (unearnedA - unearnedB) * d;
    },
    platinum: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b, _c, _d;
        const completionA = (_b = (_a = a.platinumpct) !== null && _a !== void 0 ? _a : a.completepct) !== null && _b !== void 0 ? _b : 0;
        const completionB = (_d = (_c = b.platinumpct) !== null && _c !== void 0 ? _c : b.completepct) !== null && _d !== void 0 ? _d : 0;
        return (completionA - completionB) * d;
    },
    full: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b;
        const completionA = (_a = a.completepct) !== null && _a !== void 0 ? _a : 0;
        const completionB = (_b = b.completepct) !== null && _b !== void 0 ? _b : 0;
        return (completionA - completionB) * d;
    },
    progress: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b;
        const progressA = (_a = progressItemA === null || progressItemA === void 0 ? void 0 : progressItemA.progress) !== null && _a !== void 0 ? _a : -1;
        const progressB = (_b = progressItemB === null || progressItemB === void 0 ? void 0 : progressItemB.progress) !== null && _b !== void 0 ? _b : -1;
        return (progressA - progressB) * d;
    },
    difficulty: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b;
        const difficultyA = (_a = guideItemA === null || guideItemA === void 0 ? void 0 : guideItemA.r[0]) !== null && _a !== void 0 ? _a : 0;
        const difficultyB = (_b = guideItemB === null || guideItemB === void 0 ? void 0 : guideItemB.r[0]) !== null && _b !== void 0 ? _b : 0;
        return (difficultyA - difficultyB) * d;
    },
    guideTime: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b;
        const timeA = (_a = guideItemA === null || guideItemA === void 0 ? void 0 : guideItemA.r[2]) !== null && _a !== void 0 ? _a : 0;
        const timeB = (_b = guideItemB === null || guideItemB === void 0 ? void 0 : guideItemB.r[2]) !== null && _b !== void 0 ? _b : 0;
        return (timeA - timeB) * d;
    },
    note: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b;
        const noteA = (_a = a.note) !== null && _a !== void 0 ? _a : '';
        const noteB = (_b = b.note) !== null && _b !== void 0 ? _b : '';
        return noteA.localeCompare(noteB) * d;
    },
    /**
     * @deprecated
     */
    time: (a, progressItemA, guideItemA, b, progressItemB, guideItemB, d) => {
        var _a, _b;
        const timeA = (_a = guideItemA === null || guideItemA === void 0 ? void 0 : guideItemA.r[2]) !== null && _a !== void 0 ? _a : 0;
        const timeB = (_b = guideItemB === null || guideItemB === void 0 ? void 0 : guideItemB.r[2]) !== null && _b !== void 0 ? _b : 0;
        return (timeA - timeB) * d;
    },
};
const PSPLUS_TAG_VALUE = '__psnpp__psplus__tag__';
const GUIDE_AVAILABLE_TAG_VALUE = '__psnpp__guide_available__tag__';
const SESSION_AVAILABLE_TAG_VALUE = '__psnpp__session_available__tag__';
const SHUTDOWN_INFO_TAG_VALUE = '__psnpp__shutdown_info__tag__';
const UNOBTAINABLE_TROPHIES_TAG_VALUE = '__psnpp__unobtainable_trophies__tag__';
const ONLINE_TROPHIES_TAG_VALUE = '__psnpp__online_trophies__tag__';
const BUGGY_TROPHIES_TAG_VALUE = '__psnpp__buggy_trophies__tag__';
const MISSABLE_TROPHIES_TAG_VALUE = '__psnpp__missable_trophies__tag__';
const HAS_NOT_TAG_VALUE = '__psnpp__has_note__tag__';
class ListTable extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(list, otherLists, onRowDeleted, onRowSorted, onRowMovedToIndex, onEditNote, onPsPlusToggled, onTagsChanged, listTableSettings) {
        super('div');
        this._searchValue = '';
        this._orderBy = 'custom';
        this._platform = 'all';
        this._completion = 'all';
        this._direction = 'ascending';
        this._selectedTags = [];
        this._list = list;
        this._games = (0,_util_transform__WEBPACK_IMPORTED_MODULE_11__.cloneDeep)(list.games);
        this._gamesFiltered = (0,_util_transform__WEBPACK_IMPORTED_MODULE_11__.cloneDeep)(list.games);
        this._tags = list.tags;
        this._otherLists = otherLists;
        this._orderBy = list.orderBy == null
            ? 'custom'
            : list.orderBy;
        this._direction = list.direction == null
            ? 'descending'
            : list.direction;
        this._onRowDeleted = onRowDeleted;
        this._onRowSorted = onRowSorted;
        this._onRowMovedToIndex = onRowMovedToIndex;
        this._onEditNote = onEditNote;
        this._onPsPlusToggled = onPsPlusToggled;
        this._onTagsChanged = onTagsChanged;
        this._listTableSettings = listTableSettings;
        this._listContainer = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tbody');
        this._noSearchResults = new _ui_NoSearchResults__WEBPACK_IMPORTED_MODULE_3__.NoSearchResults('No games found').hide();
        this._listTableTitle = new _ListTableTitle__WEBPACK_IMPORTED_MODULE_4__.ListTableTitle([], new Map());
        this._indexedSessions = new _sessions_SessionStorage__WEBPACK_IMPORTED_MODULE_7__.SessionStorage().indexedByTrophyListId();
        this._indexedGameProgress = new _game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_9__.GameProgressStorage().indexedById();
        this._indexedGuides = new _guide_GuideStorage__WEBPACK_IMPORTED_MODULE_24__.GuideStorage().get();
        this._unobtainableTrophies = new _unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_12__.UnobtainableTrophiesStorage().get().data;
        this._shutdowns = new _shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_13__.ShutdownsStorage().get().data;
        this._build();
    }
    _getExportDropdown() {
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_1__.DropdownMenu({
            mainButton: new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-arrow-circle-up')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_8__.tooltip)(el, 'Export')),
            mainButtonIconClass: 'rarity',
            mainButtonStyle: 'background-image: none; padding-left: 10px; margin-left: 5px;',
            dropdownMenuClass: 'right',
            options: [
                {
                    text: 'JSON (can be imported)',
                    value: 'json',
                    selected: false
                },
                {
                    text: 'CSV (export only)',
                    value: 'csv',
                    selected: false
                },
                {
                    text: 'Copy as image',
                    value: 'copypng',
                    selected: false
                },
                {
                    text: 'Save as image',
                    value: 'savepng',
                    selected: false
                },
                {
                    text: 'Copy BBCode',
                    value: 'bbcode',
                    selected: false
                }
            ],
            onSelected: async (type) => {
                try {
                    const normalizedListName = this._list.name
                        .toLowerCase()
                        .replace(/[^a-zA-Z0-9_\- ]{1}/g, '')
                        .replace(/ /g, '_');
                    if (type === 'json') {
                        const listFromStorage = new _ListStorage__WEBPACK_IMPORTED_MODULE_17__.ListStorage().getById(this._list.id);
                        (0,_util_data__WEBPACK_IMPORTED_MODULE_15__.downloadFile)(JSON.stringify(listFromStorage, null, 2), `psnpp-${normalizedListName}.json`, 'application/json');
                    }
                    else if (type === 'csv') {
                        await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_16__.loadScriptTag)(_util_constants__WEBPACK_IMPORTED_MODULE_21__.EXTERNAL_SCRIPT_URLS.PAPAPARSE);
                        const toExport = this._gamesFiltered
                            .map(listItem => ({ row: listItem, profile: this._indexedGameProgress.get(listItem.id), guide: this._indexedGuides.data.list.games[listItem.id] }))
                            .map(x => (0,_util_transform__WEBPACK_IMPORTED_MODULE_11__.flatten)(x));
                        if (toExport.length === 0) {
                            return;
                        }
                        const sortedExport = (0,_util_transform__WEBPACK_IMPORTED_MODULE_11__.cloneDeep)(toExport)
                            .sort((a, b) => Object.keys(b).length - Object.keys(a).length);
                        const columns = Object.keys(sortedExport[0]);
                        const csv = Papa.unparse(toExport, { columns });
                        (0,_util_data__WEBPACK_IMPORTED_MODULE_15__.downloadFile)(csv, `psnpp-${normalizedListName}.csv`, 'text/csv');
                    }
                    else if (type === 'bbcode') {
                        const html = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(this._list.name + ' by ' + (0,_util_user__WEBPACK_IMPORTED_MODULE_20__.getPsnId)())), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('table')
                            .setAttribute('border', '1')
                            .setAttribute('cellspacing', '10')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tr')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                            .setAttribute('style', 'padding: 10px;')
                            .setAttribute('align', 'center')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText('Icon')), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                            .setAttribute('style', 'padding: 10px;')
                            .setAttribute('align', 'center')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText('Game')), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                            .setAttribute('style', 'padding: 10px;')
                            .setAttribute('align', 'center')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText('Platform')), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                            .setAttribute('style', 'padding: 10px;')
                            .setAttribute('align', 'center')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText('Progress')), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                            .setAttribute('style', 'padding: 10px;')
                            .setAttribute('align', 'center')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText('Rarities')), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                            .setAttribute('style', 'padding: 10px;')
                            .setAttribute('align', 'center')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText('Completion'))))
                            .append(...this._gamesFiltered.map(item => {
                            const hasPlatinum = item.trophies.platinum > 0;
                            const game = this._indexedGameProgress.get(item.id);
                            const earnedTrophies = (game === null || game === void 0 ? void 0 : game.trophies) == null
                                ? 0
                                : game.trophies.bronze + game.trophies.silver + game.trophies.gold + game.trophies.platinum;
                            const platinumPct = item.platinumpct == null
                                ? (hasPlatinum ? '🏆 0.00%' : '🏆 -')
                                : '🏆 ' + item.platinumpct + '%';
                            const completePct = item.completepct == null
                                ? '💯 -'
                                : '💯 ' + item.completepct + '%';
                            return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tr')
                                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                                .setAttribute('width', '100')
                                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img').setAttribute('src', item.image)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                                .setAttribute('style', 'padding: 10px;')
                                .setAttribute('align', 'center')
                                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a').setAttribute('href', item.url + '/' + (0,_util_user__WEBPACK_IMPORTED_MODULE_20__.getPsnId)()).setText(' ' + item.title + ' ')), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                                .setAttribute('style', 'padding: 10px;')
                                .setAttribute('align', 'center')
                                .setText(Object.values((0,_platforms__WEBPACK_IMPORTED_MODULE_19__.mapPlatforms)(item.platforms)).join(', ')), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                                .setAttribute('style', 'padding: 10px;')
                                .setAttribute('align', 'center')
                                .setText(earnedTrophies + '/' + (item.trophies.bronze + item.trophies.silver + item.trophies.gold + item.trophies.platinum) + ' - ' + (game == null ? '0' : game.progress) + '%'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                                .setAttribute('style', 'padding: 10px;')
                                .setAttribute('align', 'center')
                                .setText(platinumPct + ' / ' + completePct), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                                .setAttribute('style', 'padding: 10px;')
                                .setAttribute('align', 'center')
                                .setText(game == null || game.progress === 0
                                ? '🟥'
                                : game.progress !== 100
                                    ? '🟦'
                                    : '🟩'));
                        }))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div').setText('🟥 = not started • 🟦 = started • 🟩 = completed'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i').setText('Generated with PSNP+')))
                            .getOuterHTML();
                        const clipboardItem = new ClipboardItem({
                            'text/html': new Blob([html], { type: 'text/html' }),
                            'text/plain': new Blob([html], { type: 'text/plain' })
                        });
                        await navigator.clipboard.write([clipboardItem]);
                        alert('BBCode was copied to clipboard. You can now paste it into a forum post.');
                    }
                    else if (type === 'copypng') {
                        await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_16__.loadScriptTag)(_util_constants__WEBPACK_IMPORTED_MODULE_21__.EXTERNAL_SCRIPT_URLS.HTML2CANVAS);
                        const tableElement = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#content').setAttribute('style', 'min-height: 0;').get();
                        const canvas = await html2canvas(tableElement, { allowTaint: true, useCORS: true });
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        canvas.toBlob(async (blob) => {
                            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                            alert('Image was copied to clipboard.');
                        });
                        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#content').removeAttribute('style');
                    }
                    else if (type === 'savepng') {
                        await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_16__.loadScriptTag)(_util_constants__WEBPACK_IMPORTED_MODULE_21__.EXTERNAL_SCRIPT_URLS.HTML2CANVAS);
                        const tableElement = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#content').setAttribute('style', 'min-height: 0;').get();
                        const canvas = await html2canvas(tableElement, { allowTaint: true, useCORS: true });
                        const image = canvas.toDataURL('image/png', 1.0);
                        (0,_util_data__WEBPACK_IMPORTED_MODULE_15__.downloadBlob)(image, `psnpp-${normalizedListName}.png`);
                        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('#content').removeAttribute('style');
                    }
                }
                catch (e) {
                    const typedE = e;
                    if (typedE.message === 'ClipboardItem is not defined') {
                        alert('Access to clipboard is forbidden.\n\nIf you are using Firefox, please enable "dom.events.asyncClipboard.clipboardItem" in "about:config".');
                    }
                    else {
                        console.log('Export failed:', typedE);
                        alert('Export failed: ' + typedE.message);
                    }
                }
            }
        });
    }
    _getCompletionDropdown() {
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_1__.DropdownMenu({
            mainButton: 'Completion',
            mainButtonIconClass: 'completion',
            options: [
                {
                    text: '100%',
                    value: 'completion100percent',
                    selected: false
                },
                {
                    text: 'Not 100%',
                    value: 'completionNot100percent',
                    selected: false
                },
                {
                    text: 'Not 100% or Platinum',
                    value: 'completionNot100percentOrPlatinum',
                    selected: false
                },
                {
                    text: 'Platinum',
                    value: 'completionPlatinum',
                    selected: false
                },
                {
                    text: 'Platinum, not 100%',
                    value: 'completionPlatinumNot100%',
                    selected: false
                },
                {
                    text: 'All',
                    value: 'all',
                    selected: true
                },
            ],
            onSelected: (completion) => {
                this._completion = completion;
                this._renderList();
            }
        });
    }
    _getPlatformsDropdown() {
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_1__.DropdownMenu({
            mainButton: 'Platform',
            mainButtonIconClass: 'platform',
            options: [
                {
                    text: 'PlayStation 5',
                    value: 'ps5',
                    selected: false
                },
                {
                    text: 'PlayStation 4',
                    value: 'ps4',
                    selected: false
                },
                {
                    text: 'PlayStation 3',
                    value: 'ps3',
                    selected: false
                },
                {
                    text: 'PlayStation Vita',
                    value: 'psvita',
                    selected: false
                },
                {
                    text: 'PlayStation VR',
                    value: 'psvr',
                    selected: false
                },
                {
                    text: 'PC',
                    value: 'pc',
                    selected: false
                },
                {
                    text: 'All',
                    value: 'all',
                    selected: true
                },
            ],
            onSelected: (platform) => {
                this._platform = platform;
                this._renderList();
            }
        });
    }
    _getOrderDropdown() {
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_1__.DropdownMenu({
            mainButton: 'Order',
            mainButtonIconClass: 'order',
            options: [
                {
                    text: 'Custom',
                    value: 'custom',
                    selected: this._orderBy === 'custom'
                },
                {
                    text: 'Date Added',
                    value: 'timestamp',
                    selected: this._orderBy === 'timestamp'
                },
                {
                    text: 'Last Activity',
                    value: 'lastActivity',
                    selected: this._orderBy === 'lastActivity'
                },
                {
                    text: 'Completion Time',
                    value: 'completionTime',
                    selected: this._orderBy === 'completionTime'
                },
                {
                    text: 'Alphabetical',
                    value: 'alphabetical',
                    selected: this._orderBy === 'alphabetical'
                },
                {
                    text: 'Points',
                    value: 'points',
                    selected: this._orderBy === 'points'
                },
                {
                    text: 'Unearned Points',
                    value: 'unearnedPoints',
                    selected: this._orderBy === 'unearnedPoints'
                },
                {
                    text: 'Trophies',
                    value: 'trophies',
                    selected: this._orderBy === 'trophies'
                },
                {
                    text: 'Unearned Trophies',
                    value: 'unearnedTrophies',
                    selected: this._orderBy === 'unearnedTrophies'
                },
                {
                    text: 'Platinum Rate',
                    value: 'platinum',
                    selected: this._orderBy === 'platinum'
                },
                {
                    text: '100% Rate',
                    value: 'full',
                    selected: this._orderBy === 'full'
                },
                {
                    text: 'Progress',
                    value: 'progress',
                    selected: this._orderBy === 'progress'
                },
                {
                    text: 'Difficulty',
                    value: 'difficulty',
                    selected: this._orderBy === 'difficulty'
                },
                {
                    text: 'Guide Time',
                    value: 'guideTime',
                    selected: this._orderBy === 'guideTime' || this._orderBy === 'time'
                },
                {
                    text: 'Note',
                    value: 'note',
                    selected: this._orderBy === 'note'
                }
            ],
            onSelected: (order) => {
                this._listTableSettings.isSortAllowed = (order === 'custom');
                this._orderBy = order;
                this._renderList();
            }
        });
    }
    _getDirectionDropdown() {
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_1__.DropdownMenu({
            mainButton: 'Direction',
            mainButtonIconClass: 'direction',
            options: [
                {
                    text: 'Ascending',
                    value: 'ascending',
                    selected: this._direction === 'ascending'
                },
                {
                    text: 'Descending',
                    value: 'descending',
                    selected: this._direction === 'descending'
                },
            ],
            onSelected: (direction) => {
                this._direction = direction;
                this._renderList();
            }
        });
    }
    _getTagsDropdown() {
        const options = [
            {
                text: 'PS+',
                value: PSPLUS_TAG_VALUE,
                selected: false
            },
            {
                text: 'Guide Available',
                value: GUIDE_AVAILABLE_TAG_VALUE,
                selected: false
            },
            {
                text: 'Session Available',
                value: SESSION_AVAILABLE_TAG_VALUE,
                selected: false
            },
            {
                text: 'Shutdown Notice',
                value: SHUTDOWN_INFO_TAG_VALUE,
                selected: false
            },
            {
                text: 'Unobtainable Trophies',
                value: UNOBTAINABLE_TROPHIES_TAG_VALUE,
                selected: false
            },
            {
                text: 'Online Trophies',
                value: ONLINE_TROPHIES_TAG_VALUE,
                selected: false
            },
            {
                text: 'Buggy Trophies',
                value: BUGGY_TROPHIES_TAG_VALUE,
                selected: false
            },
            {
                text: 'Missable Trophies',
                value: MISSABLE_TROPHIES_TAG_VALUE,
                selected: false
            },
            {
                text: 'Has Note',
                value: HAS_NOT_TAG_VALUE,
                selected: false
            }
        ];
        options.push(...this._tags.map(t => ({
            text: t,
            value: t,
            selected: false
        })));
        return new _ui_MultiDropdownMenu__WEBPACK_IMPORTED_MODULE_5__.MultiDropdownMenu({
            mainButton: 'Tags',
            mainButtonIconClass: 'rarity',
            options,
            onSelectionChanged: (tags) => {
                this._selectedTags = tags;
                this._renderList();
            }
        });
    }
    _build() {
        this
            .addClass('col-xs-12')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('title', 'flex', 'v-align')
            .append(this._listTableTitle)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('no-shrink')
            .append(this._getExportDropdown(), this._listTableSettings.showUrlRefreshButton
            ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', '#')
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-refresh'))
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_8__.tooltip)(el, 'Reload from URL'))
                .click(async (e) => {
                try {
                    e.preventDefault();
                    const continueReload = confirm('You are about to reload data in this list from a remote URL. All manual changes done by you will be lost.\n\nContinue?');
                    if (!continueReload) {
                        return;
                    }
                    const url = this._list.url;
                    const listId = this._list.id;
                    const newList = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_16__.gmFetchJson)(url);
                    newList.url = url;
                    const listStorage = new _ListStorage__WEBPACK_IMPORTED_MODULE_17__.ListStorage();
                    const newListId = listStorage.createList(newList);
                    listStorage.remove(listId);
                    new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_18__.ScriptStateStorage().set('lastActiveGameList', newListId);
                    location.reload();
                }
                catch (e) {
                    const typedE = e;
                    alert('Failed to reload list! Error message: ' + typedE.message);
                }
            })
            : null, this._games.length >= 2
            ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', '#')
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-random'))
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_8__.tooltip)(el, 'Random game'))
                .click((e) => {
                e.preventDefault();
                (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_10__.appendPanel)(new _ListRandomGamePanel__WEBPACK_IMPORTED_MODULE_14__.ListRandomGamePanel(this._gamesFiltered));
            })
            : null, this._getPlatformsDropdown(), this._getOrderDropdown(), this._getDirectionDropdown(), this._getCompletionDropdown(), this._getTagsDropdown())))
            .append(new _ui_SearchBox__WEBPACK_IMPORTED_MODULE_2__.SearchBox('Search your games', value => {
            this._searchValue = value;
            this._renderList();
        }))
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('box', 'no-top-border')
            .append(this._noSearchResults)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('table')
            .addClass('zebra', 'list-table')
            .append(this._listContainer)));
        this._renderList();
    }
    _renderList() {
        const searchValue = this._searchValue;
        const orderBy = this._orderBy;
        const platform = this._platform;
        const completion = this._completion;
        const tags = this._selectedTags;
        const directionCoeficient = this._direction === 'ascending'
            ? 1
            : -1;
        let listItems = this._games.reverse();
        const totalNumberOfListItems = listItems.length;
        if (searchValue !== '') {
            listItems = listItems.filter((x) => x.title.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
        }
        if (platform !== 'all') {
            listItems = listItems.filter((x) => x.platforms[platform] === true);
        }
        if (tags.length > 0) {
            listItems = listItems.filter((x) => {
                const guide = this._indexedGuides.data.list.games[x.id];
                if (tags.indexOf(PSPLUS_TAG_VALUE) > -1 && x.psplus === true) {
                    return true;
                }
                if (tags.indexOf(GUIDE_AVAILABLE_TAG_VALUE) > -1 && guide != null) {
                    return true;
                }
                if (tags.indexOf(SESSION_AVAILABLE_TAG_VALUE) > -1) {
                    const sessions = this._indexedSessions.get(x.id);
                    if (sessions != null) {
                        return true;
                    }
                }
                if (tags.indexOf(SHUTDOWN_INFO_TAG_VALUE) > -1) {
                    const shutdown = this._shutdowns.list[x.id];
                    if (shutdown != null) {
                        return true;
                    }
                }
                if (tags.indexOf(UNOBTAINABLE_TROPHIES_TAG_VALUE) > -1) {
                    const unobtainableTrophies = this._unobtainableTrophies.list[x.id];
                    if (unobtainableTrophies != null) {
                        return true;
                    }
                }
                if (tags.indexOf(ONLINE_TROPHIES_TAG_VALUE) > -1) {
                    return guide != null && (0,_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasOnlineTrophies)(guide.a);
                }
                if (tags.indexOf(BUGGY_TROPHIES_TAG_VALUE) > -1) {
                    return guide != null && (0,_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasBuggyTrophies)(guide.a);
                }
                if (tags.indexOf(MISSABLE_TROPHIES_TAG_VALUE) > -1) {
                    return guide != null && (0,_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasMissableTrophies)(guide.a);
                }
                if (tags.indexOf(HAS_NOT_TAG_VALUE) > -1) {
                    return x.note != null && x.note.length > 0;
                }
                if (typeof x.tags === 'undefined' || x.tags.length === 0) {
                    return false;
                }
                // NOTE: Intersection length > 0
                return tags.some((t) => {
                    const gameTags = typeof x.tags === 'undefined' ? [] : x.tags;
                    return gameTags.indexOf(t) > -1;
                });
            });
        }
        if (orderBy !== 'custom') {
            listItems.sort((a, b) => {
                const progressA = this._indexedGameProgress.get(a.id);
                const progressB = this._indexedGameProgress.get(b.id);
                const guideA = this._indexedGuides.data.list.games[a.id];
                const guideB = this._indexedGuides.data.list.games[b.id];
                return orderFunctions[orderBy](a, progressA, guideA, b, progressB, guideB, directionCoeficient);
            });
        }
        else {
            if (this._direction === 'descending') {
                listItems.reverse();
            }
        }
        if (completion !== 'all') {
            switch (completion) {
                case 'completion100percent':
                    listItems = listItems.filter(item => { var _a; return ((_a = this._indexedGameProgress.get(item.id)) === null || _a === void 0 ? void 0 : _a.progress) === 100; });
                    break;
                case 'completionNot100percent':
                    listItems = listItems.filter(item => { var _a; return ((_a = this._indexedGameProgress.get(item.id)) === null || _a === void 0 ? void 0 : _a.progress) !== 100; });
                    break;
                case 'completionNot100percentOrPlatinum':
                    listItems = listItems.filter(item => {
                        var _a;
                        const gameProgressItem = this._indexedGameProgress.get(item.id);
                        if (gameProgressItem == null) {
                            return true;
                        }
                        return gameProgressItem.progress !== 100 && ((_a = gameProgressItem.trophies) === null || _a === void 0 ? void 0 : _a.platinum) === 0;
                    });
                    break;
                case 'completionPlatinum':
                    listItems = listItems.filter(item => { var _a, _b; return ((_b = (_a = this._indexedGameProgress.get(item.id)) === null || _a === void 0 ? void 0 : _a.trophies) === null || _b === void 0 ? void 0 : _b.platinum) === 1; });
                    break;
                case 'completionPlatinumNot100%':
                    listItems = listItems.filter(item => {
                        var _a;
                        const gameProgressItem = this._indexedGameProgress.get(item.id);
                        if (gameProgressItem == null) {
                            return false;
                        }
                        return gameProgressItem.progress !== 100 && ((_a = gameProgressItem.trophies) === null || _a === void 0 ? void 0 : _a.platinum) === 1;
                    });
                    break;
                default:
                    break;
            }
        }
        this._gamesFiltered = listItems;
        this._listContainer.empty();
        this._listTableTitle.update(listItems, this._indexedGameProgress);
        if (listItems.length === 0) {
            this._noSearchResults.setTitleText(`No games found (${totalNumberOfListItems} hidden)`);
            this._noSearchResults.show();
            return;
        }
        else {
            this._noSearchResults.hide();
        }
        listItems
            .map(item => {
            const sessions = this._indexedSessions.get(item.id);
            const game = this._indexedGameProgress.get(item.id);
            const guide = this._indexedGuides.data.list.games[item.id];
            const unobtainableTrophies = this._unobtainableTrophies.list[item.id];
            const shutdown = this._shutdowns.list[item.id];
            return new _ListTableRow__WEBPACK_IMPORTED_MODULE_6__.ListRow(item, this._tags, sessions, game, guide, unobtainableTrophies, shutdown, this._otherLists, async (movedCopiedRow, listItem, action) => {
                const shouldRemoveRow = await (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_10__.appendPanelWait)(new _MoveCopyPanel__WEBPACK_IMPORTED_MODULE_23__.MoveCopyPanel(listItem, action, this._list));
                if (shouldRemoveRow) {
                    const itemIndex = this._games.findIndex((x) => x.id === listItem.id);
                    this._games.splice(itemIndex, 1);
                    movedCopiedRow.remove();
                    this._listTableTitle.update(this._games, this._indexedGameProgress);
                }
            }, (deletedRow, listItem) => {
                const result = (localStorage.getItem("psnppp.skipRemoveConfirm") !== "false")
  ? true
  : confirm(`Are you sure you want to remove ${listItem.title}?`);
                if (!result) {
                    return;
                }
                this._onRowDeleted(listItem);
                const itemIndex = this._games.findIndex((x) => x.id === listItem.id);
                this._games.splice(itemIndex, 1);
                deletedRow.remove();
                this._listTableTitle.update(this._games, this._indexedGameProgress);
            }, (movedRow, listItem) => {
                // NOTE: Target indexes are switched here because games are rendered from bottom to top
                // 0 - bottom, length-1 - top
                this._onRowMovedToIndex(listItem, this._games.length - 1);
            }, (movedRow, listItem) => {
                // Same applies here
                this._onRowMovedToIndex(listItem, 0);
            }, this._onEditNote, this._onPsPlusToggled, this._onTagsChanged, this._listTableSettings);
        })
            .forEach((el) => {
            this._listContainer.append(el);
        });
        if (this._listTableSettings.isSortAllowed) {
            this.apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_8__.sortable)(el, (e, ui) => {
                const shouldReverse = this._direction === 'ascending';
                const oldIndex = parseInt(ui.item.data('previndex'), 10);
                const newIndex = ui.item.index();
                (0,_util_transform__WEBPACK_IMPORTED_MODULE_11__.move)(this._games, oldIndex, newIndex, shouldReverse);
                this._onRowSorted(oldIndex, newIndex, shouldReverse);
            }));
        }
    }
}


/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DropdownMenu": () => (/* binding */ DropdownMenu)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class DropdownMenu extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(dropdownOptions) {
        super('div');
        this._build(dropdownOptions);
    }
    _getMainButtonText(mainText, menuItemText) {
        return `${mainText} (${menuItemText})`;
    }
    _build(dropdownOptions) {
        const mainButton = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('dropdown-toggle', dropdownOptions.mainButtonIconClass)
            .condition(typeof dropdownOptions.mainButtonStyle !== 'undefined', (el) => el.setAttribute('style', dropdownOptions.mainButtonStyle))
            .setAttribute('data-toggle', 'dropdown')
            .setAttribute('href', '');
        if (typeof dropdownOptions.mainButton === 'string') {
            const optionWithText = dropdownOptions.options.find(option => option !== 'divider' && option.selected);
            if (optionWithText != null && optionWithText !== 'divider') {
                mainButton.setText(this._getMainButtonText(dropdownOptions.mainButton, optionWithText.text));
            }
        }
        else {
            mainButton.append(dropdownOptions.mainButton);
        }
        const optionsContainer = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('ul')
            .addClass('dropdown-menu')
            .setAttribute('role', 'menu')
            .setAttribute('aria-labelledby', 'dLabel');
        if (dropdownOptions.dropdownMenuClass != null) {
            optionsContainer.addClass(dropdownOptions.dropdownMenuClass);
        }
        const options = dropdownOptions.options.map((option) => {
            if (option === 'divider') {
                return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').addClass('divider');
            }
            return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', '#')
                .setText(option.text)
                .click((e) => {
                e.preventDefault();
                if (typeof dropdownOptions.mainButton === 'string') {
                    mainButton.setText(this._getMainButtonText(dropdownOptions.mainButton, option.text));
                }
                dropdownOptions.onSelected(option.value, option.context);
            }));
        });
        optionsContainer.append(...options);
        return this
            .addClass('dropdown', 'buttons')
            .append(mainButton)
            .append(optionsContainer);
    }
}


/***/ }),
/* 63 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SearchBox": () => (/* binding */ SearchBox)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class SearchBox extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(placeholder, onChange) {
        super('div');
        this._searchValue = '';
        this._input = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('input');
        this._onChange = onChange;
        this._build(placeholder);
    }
    _build(placeholder) {
        const form = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('form')
            .setAttribute('style', 'margin: 0 5px 5px;');
        const label = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label').addClass('input', 'focus');
        const icon = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i').addClass('icon-prepend', 'fa-search');
        this._input
            .setAttribute('type', 'text')
            .setAttribute('placeholder', placeholder)
            .keyup((_, el) => {
            const searchValue = el.getValue();
            if (this._searchValue === searchValue) {
                return;
            }
            this._searchValue = searchValue;
            this._onChange(searchValue);
        });
        label.append(icon, this._input);
        form.append(label);
        this
            .addClass('box')
            .setAttribute('style', 'padding-top: 5px; border-bottom-width: 1px;')
            .append(form);
    }
    setInputValue(value) {
        this._input.setValue(value);
    }
}


/***/ }),
/* 64 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NoSearchResults": () => (/* binding */ NoSearchResults)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class NoSearchResults extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(description) {
        super('table');
        this._titleElement = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('h2')
            .addClass('center')
            .setText(description);
        this._build();
    }
    _build() {
        const tbody = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tbody');
        const tr = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('tr');
        const td = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td').setAttribute('style', 'padding: 20px;');
        td.append(this._titleElement);
        tr.append(td);
        tbody.append(tr);
        return this
            .addClass('zebra', 'list-table')
            .append(tbody);
    }
    setTitleText(text) {
        this._titleElement.setText(text);
    }
}


/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListTableTitle": () => (/* binding */ ListTableTitle)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class ListTableTitle extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(listItems, games) {
        super('div');
        this._listItems = listItems;
        this._games = games;
        this._build();
    }
    _getNumbers() {
        const gameProgressItems = this._listItems
            .filter(x => {
            const gameProgressItem = this._games.get(x.id);
            return gameProgressItem != null && gameProgressItem.trophies != null;
        })
            .map(x => this._games.get(x.id));
        return {
            numberOfItems: this._listItems.length,
            earnedTrophies: gameProgressItems.reduce((acc, { trophies: { platinum, gold, silver, bronze } }) => acc + platinum + gold + silver + bronze, 0),
            totalTrophies: this._listItems.reduce((acc, { trophies: { platinum, gold, silver, bronze } }) => acc + platinum + gold + silver + bronze, 0),
            totalPoints: this._listItems.reduce((acc, current) => acc + current.points, 0)
        };
    }
    _getText() {
        const { numberOfItems, earnedTrophies, totalTrophies, totalPoints } = this._getNumbers();
        const plural = numberOfItems === 1
            ? ''
            : 's';
        const earnedText = earnedTrophies > 0
            ? `${earnedTrophies.toLocaleString('en-US')} of `
            : '';
        return [
            `${numberOfItems} Game${plural} `,
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'),
            ` ${earnedText}${totalTrophies.toLocaleString('en-US')} Trophies `,
            _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'),
            ` ${totalPoints.toLocaleString('en-US')} Points`
        ];
    }
    _build() {
        const h3 = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('h3')
            .append(...this._getText());
        this.addClass('grow').append(h3);
    }
    update(listItems, games) {
        this._listItems = listItems;
        this._games = games;
        const text = this._getText();
        this.clone().find('h3').empty().append(...text);
    }
}


/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MultiDropdownMenu": () => (/* binding */ MultiDropdownMenu)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class MultiDropdownMenu extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(multiDropdownOptions) {
        super('div');
        this._options = multiDropdownOptions;
        this._build();
    }
    _getOptionsText(option) {
        const prefix = option.selected
            ? '✓ '
            : '';
        return `${prefix} ${option.text}`;
    }
    _build() {
        const mainButton = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('dropdown-toggle', this._options.mainButtonIconClass)
            .setAttribute('data-toggle', 'dropdown')
            .setAttribute('href', '');
        if (typeof this._options.mainButton === 'string') {
            mainButton.setText(this._options.mainButton);
        }
        else {
            mainButton.append(this._options.mainButton);
        }
        const optionsContainer = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('ul')
            .addClass('dropdown-menu')
            .setAttribute('role', 'menu')
            .setAttribute('aria-labelledby', 'dLabel');
        if (this._options.dropdownMenuClass != null) {
            optionsContainer.addClass(this._options.dropdownMenuClass);
        }
        const optionElements = this._options.options.map((option) => {
            return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', '#')
                .setText(this._getOptionsText(option))
                .click((e, el) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                option.selected = !option.selected;
                el.setText(this._getOptionsText(option));
                this._options.onSelectionChanged(this._options.options.filter(o => o.selected).map(o => o.value));
            }));
        });
        optionsContainer.append(...optionElements);
        optionsContainer.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').addClass('divider'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Select all')
            .click((e) => {
            e.preventDefault();
            this._options.options.forEach((o, index) => {
                o.selected = true;
                optionElements[index].clone().find('a').setText(this._getOptionsText(o));
            });
            this._options.onSelectionChanged(this._options.options.map(o => o.value));
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .setText('Deselect all')
            .click((e) => {
            e.preventDefault();
            this._options.options.forEach((o, index) => {
                o.selected = false;
                optionElements[index].clone().find('a').setText(this._getOptionsText(o));
            });
            this._options.onSelectionChanged([]);
        })));
        return this
            .addClass('dropdown', 'buttons')
            .append(mainButton)
            .append(optionsContainer);
    }
}


/***/ }),
/* 67 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListRow": () => (/* binding */ ListRow)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(55);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34);
/* harmony import */ var _ui_MultiDropdownMenu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(66);
/* harmony import */ var _regions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(14);
/* harmony import */ var _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(62);
/* harmony import */ var _unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(68);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(51);
/* harmony import */ var _guide_IGuide__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(69);
/* harmony import */ var _ui_PlatformsColumns__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(71);
/* harmony import */ var _ui_TrophiesColumn__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(72);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(25);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(43);
/* harmony import */ var _util_string__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(57);














class ListImage extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(url, title, image, resizePS5Icons) {
        super('td');
        this._build(url, title, image, resizePS5Icons);
    }
    _build(url, title, image, resizePS5Icons) {
        const pathname = new URL(url).pathname;
        this
            .setAttribute('style', 'width: 1%;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', pathname)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('picture')
            .setCss('textAlign', 'center')
            .addClass('game')
            .setAttribute('alt', title)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img')
            .setAttribute('src', image)
            .condition(resizePS5Icons, (el) => {
            el.setCss('maxHeight', '56px')
                .setCss('maxWidth', '100px')
                .setCss('height', 'auto')
                .setCss('width', 'auto');
        }))));
    }
}
class ListDescription extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(listItem, pathname, title, region, totalTrophies, totalPoints, note, addedOn, game, activeSessions, unobtainableTrophies, shutdown, guide, onEditNote) {
        super('td');
        this._noteVisible = false;
        this._noteDiv = null;
        this._listItem = listItem;
        this._noteText = note !== null && note !== void 0 ? note : '';
        this._onEditNote = onEditNote;
        this._build(pathname, title, region, totalTrophies, totalPoints, addedOn, game, activeSessions, unobtainableTrophies, shutdown, guide);
    }
    _createNoteDiv() {
        this._noteDiv = this._noteText.length > 0
            ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                .setAttribute('style', 'white-space: pre-wrap; font-size: 1.2rem; margin-top: 5px; border: 1px solid #e3e3e6; border-radius: 5px; padding: 5px; border-left: 3px solid #9b9ba5;')
                .append(...(0,_util_string__WEBPACK_IMPORTED_MODULE_13__.linkifyText)(this._noteText))
            : null;
    }
    _build(pathname, title, region, totalTrophies, totalPoints, addedOn, game, activeSessions, unobtainableTrophies, shutdown, guide) {
        const additional = [];
        if (typeof region !== 'undefined') {
            additional.push(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .setText(region)
                .apply((el) => {
                const tooltipText = (0,_regions__WEBPACK_IMPORTED_MODULE_4__.getDescritionFromCode)(region);
                if (typeof tooltipText !== 'undefined') {
                    (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, tooltipText);
                }
            }));
        }
        if (activeSessions != null) {
            additional.push(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', pathname.replace('trophies', 'sessions'))
                .setAttribute('style', 'color:#646464;')
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_12__.Icon('fa-users')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, activeSessions.length + ' Active Gaming Session(s)'))));
        }
        if (unobtainableTrophies != null) {
            additional.push(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_12__.Icon('fa-exclamation-circle')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, (0,_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_6__.getUnobtainableTrophiesDescription)(unobtainableTrophies))));
        }
        if (shutdown != null) {
            const shutdownDate = (0,_util_date__WEBPACK_IMPORTED_MODULE_1__.getUtcLocaleDateString)(shutdown.shutdownTimestamp);
            const tooltipText = `<b>SHUTDOWN NOTICE</b><br>The online servers for this game are scheduled to be shut down on ${shutdownDate}.`;
            additional.push(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_12__.Icon('fa-clock-o')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, tooltipText)));
        }
        const titleElement = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('ellipsis')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('title')
            .setAttribute('href', pathname)
            .setText(title), ...additional));
        const trophiesAndPoints = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('small-info')
            .setAttribute('style', 'margin-top: 4px;')
            .condition(game != null, el => {
            if (game == null || game.trophies == null) {
                return;
            }
            const earnedCount = game.trophies.bronze + game.trophies.silver + game.trophies.gold + game.trophies.platinum;
            if (earnedCount === 0) {
                return;
            }
            if (earnedCount === totalTrophies) {
                el.append('All ');
            }
            else {
                el.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(earnedCount.toString()), ' of ');
            }
        })
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(totalTrophies.toString()), ' Trophies ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ')
            .condition(game != null, el => {
            if (game == null || game.trophies == null) {
                return;
            }
            const earnedPoints = game.trophies.bronze * _util_constants__WEBPACK_IMPORTED_MODULE_11__.TROPHY_VALUES.BRONZE
                + game.trophies.silver * _util_constants__WEBPACK_IMPORTED_MODULE_11__.TROPHY_VALUES.SILVER
                + game.trophies.gold * _util_constants__WEBPACK_IMPORTED_MODULE_11__.TROPHY_VALUES.GOLD
                + game.trophies.platinum * _util_constants__WEBPACK_IMPORTED_MODULE_11__.TROPHY_VALUES.PLATINUM;
            if (earnedPoints === 0 || earnedPoints === totalPoints) {
                return;
            }
            el.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(earnedPoints.toLocaleString('en-US')), ' of ');
        })
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(totalPoints.toLocaleString('en-US')), ' Points');
        if (guide != null) {
            const [difficulty, playthroughs, hours] = guide.r;
            const guideLink = (0,_guide_IGuide__WEBPACK_IMPORTED_MODULE_8__.getGuideHref)(guide.a, guide.p);
            trophiesAndPoints.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', guideLink.href)
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .setText(`${difficulty}/10`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_7__.getDifficultyClass)(difficulty))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .setText(`${playthroughs}x`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_7__.getPlaythroughsClass)(playthroughs))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .setText(`${hours}h`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_7__.getHoursClass)(hours))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'))
                .condition(guideLink.isExternal, (el) => {
                el.setAttribute('target', '_blank');
            })
                .condition((0,_guide_IGuide__WEBPACK_IMPORTED_MODULE_8__.hasOnlineTrophies)(guide.a), el => {
                el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                    .setAttribute('style', 'background: #3a87ad; font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;')
                    .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, 'Online'))
                    .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_12__.Icon('fa-globe')));
            })
                .condition((0,_guide_IGuide__WEBPACK_IMPORTED_MODULE_8__.hasBuggyTrophies)(guide.a), el => {
                el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                    .setAttribute('style', 'background: #b94a48; font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;')
                    .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, 'Buggy'))
                    .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_12__.Icon('fa-bug')));
            })
                .condition((0,_guide_IGuide__WEBPACK_IMPORTED_MODULE_8__.hasMissableTrophies)(guide.a), el => {
                el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                    .setAttribute('style', 'background: #DD8301; font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;')
                    .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, 'Missable'))
                    .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_12__.Icon('fa-exclamation-triangle')));
            }));
        }
        const date = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('small-info')
            .setAttribute('style', 'margin-top: 4px;')
            .append('Added on', ` ${addedOn.day}`, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('sup').setText(addedOn.suffix), ` ${addedOn.monthName} ${addedOn.year}`)
            .condition((game === null || game === void 0 ? void 0 : game.lastActivity) != null, (el) => {
            const lastActivity = (0,_util_date__WEBPACK_IMPORTED_MODULE_1__.getPrettyDate)(game === null || game === void 0 ? void 0 : game.lastActivity);
            el
                .append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', 'Last activity', ` ${lastActivity.day}`, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('sup').setText(lastActivity.suffix), ` ${lastActivity.monthName} ${lastActivity.year}`);
        })
            .condition((game === null || game === void 0 ? void 0 : game.completionTimeString) != null, (el) => {
            el
                .append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' ', ...(0,_util_date__WEBPACK_IMPORTED_MODULE_1__.formatCompletionTimeString)(game === null || game === void 0 ? void 0 : game.completionTimeString));
        });
        this._createNoteDiv();
        this
            .setAttribute('style', 'width: 100%;')
            .append(titleElement, trophiesAndPoints, date, this._noteDiv);
    }
    editNote() {
        if (this._noteVisible) {
            return;
        }
        this._noteVisible = true;
        const textArea = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('textarea')
            .setAttribute('placeholder', 'Short notes, checklists and ideas can be stored here. You can also include clickable links as [Link Text](Link URL)')
            .setValue(this._noteText);
        const noteElement = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('form')
            .setAttribute('style', 'margin-top: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label')
            .addClass('textarea')
            .append(textArea)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .setAttribute('style', 'margin-top: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('button', 'green')
            .setAttribute('style', 'display: inline-block; margin-right: 5px;')
            .setAttribute('href', '#')
            .setText('Save')
            .click(e => {
            var _a;
            e.preventDefault();
            this._noteText = textArea.getValue().trim();
            noteElement.remove();
            (_a = this._noteDiv) === null || _a === void 0 ? void 0 : _a.remove();
            this._createNoteDiv();
            this.append(this._noteDiv);
            this._onEditNote(this._listItem, this._noteText);
            this._noteVisible = false;
        }), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .addClass('button', 'red')
            .setAttribute('style', 'display: inline-block;')
            .setAttribute('href', '#')
            .setText('Close')
            .click(e => {
            e.preventDefault();
            this._noteVisible = false;
            noteElement.remove();
        })));
        this.append(noteElement);
    }
}
class ListCustomColumn extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(item, tags, onPsPlusToggled, onTagsChanged) {
        super('td');
        this._item = item;
        this._tags = tags;
        this._onPsPlusToggled = onPsPlusToggled;
        this._onTagsChanged = onTagsChanged;
        this._psPlusToggled = typeof this._item.psplus === 'undefined'
            ? false
            : this._item.psplus;
        this._hasItemTags = typeof this._item.tags === 'undefined' || this._item.tags.length === 0
            ? false
            : true;
        this._psPlusImage = this._setupPsPlusImage();
        this._tagsDropdown = this._setupTagsDropdown();
        this._build();
    }
    _setupPsPlusImage() {
        const image = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img')
            .setAttribute('src', '/lib/img/icons/ps-plus.png')
            .setAttribute('width', '18')
            .setAttribute('height', '18')
            .setAttribute('style', 'margin-right: 8px;')
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, 'Toggle PS+ Tag'))
            .addClass('psnpp-toggle-psplus')
            .setCss('cursor', 'pointer')
            .click(() => {
            this._psPlusToggled = !this._psPlusToggled;
            this._onPsPlusToggled(this._item, this._psPlusToggled);
        });
        if (!this._psPlusToggled) {
            image.hide();
        }
        return image;
    }
    _setupTagsDropdown() {
        const availableTags = this._tags;
        const itemTags = typeof this._item.tags === 'undefined'
            ? []
            : this._item.tags;
        if (availableTags.length === 0) {
            return null;
        }
        const dropdown = new _ui_MultiDropdownMenu__WEBPACK_IMPORTED_MODULE_3__.MultiDropdownMenu({
            mainButton: new _ui_Icon__WEBPACK_IMPORTED_MODULE_12__.Icon('fa-tags')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, 'Manage Tags')),
            mainButtonIconClass: 'rarity',
            options: availableTags.map(t => ({
                text: t,
                value: t,
                selected: itemTags.indexOf(t) > -1
            })),
            onSelectionChanged: (tags) => {
                this._hasItemTags = tags.length > 0;
                this._onTagsChanged(this._item, tags);
            }
        });
        if (!this._hasItemTags) {
            dropdown.hide();
        }
        return dropdown;
    }
    _build() {
        this
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .setAttribute('style', 'width: 55px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('flex', 'v-align', 'center')
            .append(this._psPlusImage, this._tagsDropdown)));
    }
    showColumn() {
        this._psPlusImage.show();
        if (this._tagsDropdown !== null) {
            this._tagsDropdown.show();
        }
    }
    hideColumn() {
        if (!this._psPlusToggled) {
            this._psPlusImage.hide();
        }
        if (!this._hasItemTags && this._tagsDropdown != null) {
            this._tagsDropdown.hide();
        }
    }
}
class ListCompletion extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(listItem, game) {
        super('td');
        this._build(listItem, game);
    }
    _build(item, game) {
        var _a, _b;
        const hasPlatinum = item.trophies.platinum > 0;
        const hasEarnedPlatinum = game != null && game.trophies != null && game.trophies.platinum > 0;
        const hasEarned100pct = game != null && game.progress === 100;
        const extraElements = [];
        extraElements.push(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'));
        extraElements.push(hasPlatinum
            ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .addClass('platinum')
                .condition(hasEarnedPlatinum, el => el.addClass('earned'))
                .setText(`${((_a = item.platinumpct) !== null && _a !== void 0 ? _a : 0).toFixed(2)}%`)
            : null);
        // NOTE: Does not have platinum OR it has platinum but also DLC
        extraElements.push(((!hasPlatinum) || (hasPlatinum && typeof item.dlccount === 'number' && item.dlccount > 0))
            ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .addClass('completion')
                .condition(hasEarned100pct, el => el.addClass('earned'))
                .setText(`${((_b = item.completepct) !== null && _b !== void 0 ? _b : 0).toFixed(2)}%`)
                .apply(el => {
                if (typeof item.dlccount !== 'undefined' && item.dlccount > 0) {
                    (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_2__.tooltip)(el, 'Number of DLCs: ' + item.dlccount);
                }
            })
            : null);
        this
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('separator', 'left', 'completion-status')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('img')
            .addClass('icon-sprite', hasPlatinum ? 'platinum-18' : 'completion')
            .condition(hasEarnedPlatinum || hasEarned100pct, el => el.addClass('earned'))
            .setAttribute('src', '/lib/img/layout/spacer.png'), ...extraElements));
    }
}
class ListItemActions extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(otherLists, onClick) {
        super('td');
        this._otherLists = otherLists;
        this._onClick = onClick;
        this._build();
    }
    _build() {
        this.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('separator', 'left')
            .append(new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_5__.DropdownMenu({
            mainButton: _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', '#')
                .addClass('button', 'blue')
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_12__.Icon('fa-caret-down')),
            mainButtonIconClass: 'rarity',
            options: [
                {
                    text: 'Edit Note',
                    value: 'editNote',
                    selected: false,
                },
                'divider',
                {
                    text: 'Move to list',
                    value: 'moveToList',
                    selected: false
                },
                {
                    text: 'Copy to list',
                    value: 'copyToList',
                    selected: false
                },
                'divider',
                {
                    text: 'Move to top',
                    value: 'moveToTop',
                    selected: false
                },
                {
                    text: 'Move to bottom',
                    value: 'moveToBottom',
                    selected: false
                },
                'divider',
                {
                    text: 'Delete',
                    value: 'delete',
                    selected: false
                }
            ],
            onSelected: (value, context) => {
                this._onClick(value, context);
            },
            dropdownMenuClass: 'right'
        })));
    }
}
class ListRow extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(listItem, tags, activeSessions, game, guide, unobtainableTrophies, shutdown, otherLists, onMoveCopy, onDelete, onMoveToTop, onMoveToBottom, onEditNote, onPsPlusToggled, onTagsChanged, listTableSettings) {
        super('tr');
        this._tags = tags;
        this._onMoveCopy = onMoveCopy;
        this._onDelete = onDelete;
        this._onMoveToTop = onMoveToTop;
        this._onMoveToBottom = onMoveToBottom;
        this._onEditNote = onEditNote;
        this._onPsPlusToggled = onPsPlusToggled;
        this._onTagsChanged = onTagsChanged;
        this._listTableSettings = listTableSettings;
        this._build(listItem, activeSessions, game, guide, unobtainableTrophies, shutdown, otherLists);
    }
    _build(listItem, activeSessions, game, guide, unobtainableTrophies, shutdown, otherLists) {
        const totalTrophies = listItem.trophies.platinum +
            listItem.trophies.gold +
            listItem.trophies.silver +
            listItem.trophies.bronze;
        const addedOn = (0,_util_date__WEBPACK_IMPORTED_MODULE_1__.getPrettyDate)(listItem.timestamp);
        const customColumn = new ListCustomColumn(listItem, this._tags, this._onPsPlusToggled, this._onTagsChanged);
        if (game != null && game.trophies != null) {
            if (game.trophies.platinum === 1) {
                this.addClass('platinum');
            }
            else if (game.progress === 100) {
                this.addClass('completed');
            }
        }
        const listDescription = new ListDescription(listItem, listItem.url, listItem.title, listItem.region, totalTrophies, listItem.points, listItem.note, addedOn, game, activeSessions, unobtainableTrophies, shutdown, guide, (listItem, note) => {
            this._onEditNote(listItem, note);
        });
        this
            .append(this._listTableSettings.isSortAllowed
            ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('td')
                .setAttribute('style', 'width: 1%;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                .addClass('draggable-list-handle')
                .setAttribute('style', 'height: 56px; width: 30px; background: url(/lib/img/icons/drag-handle.png) no-repeat center; cursor: ns-resize;'))
            : null, new ListImage(listItem.url, listItem.title, listItem.image, this._listTableSettings.resizePS5Icons), listDescription, customColumn, new _ui_PlatformsColumns__WEBPACK_IMPORTED_MODULE_9__.PlatformsColumn(listItem.platforms), new _ui_TrophiesColumn__WEBPACK_IMPORTED_MODULE_10__.TrophiesColumn(listItem.trophies, game, undefined, false), new ListCompletion(listItem, game), this._listTableSettings.showActionsDropdown
            ? new ListItemActions(otherLists, (action) => {
                if (action === 'editNote') {
                    listDescription.editNote();
                }
                if (action === 'delete') {
                    this._onDelete(this, listItem);
                }
                if (action === 'moveToTop') {
                    this._onMoveToTop(this, listItem);
                }
                if (action === 'moveToBottom') {
                    this._onMoveToBottom(this, listItem);
                }
                if (action === 'moveToList' || action === 'copyToList') {
                    this._onMoveCopy(this, listItem, action);
                }
            })
            : null)
            .mouseenter(() => customColumn.showColumn())
            .mouseleave(() => customColumn.hideColumn());
    }
}


/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getUnobtainableTrophiesDescription": () => (/* binding */ getUnobtainableTrophiesDescription)
/* harmony export */ });
function getUnobtainableTrophiesDescription(unobtainableTrophies) {
    const specifier = unobtainableTrophies.length > 0
        ? unobtainableTrophies.length === 1 && unobtainableTrophies[0] === 0
            ? 'only'
            : unobtainableTrophies.length
        : 'some';
    const trophyPlural = specifier === 1
        ? 'trophy'
        : 'trophies';
    return `This trophy list contains ${specifier} unobtainable ${trophyPlural}`;
}


/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getGuideHref": () => (/* binding */ getGuideHref),
/* harmony export */   "hasBuggyTrophies": () => (/* binding */ hasBuggyTrophies),
/* harmony export */   "hasMissableTrophies": () => (/* binding */ hasMissableTrophies),
/* harmony export */   "hasOnlineTrophies": () => (/* binding */ hasOnlineTrophies),
/* harmony export */   "isDLCGuide": () => (/* binding */ isDLCGuide),
/* harmony export */   "isPlatformPC": () => (/* binding */ isPlatformPC),
/* harmony export */   "isPlatformPS3": () => (/* binding */ isPlatformPS3),
/* harmony export */   "isPlatformPS4": () => (/* binding */ isPlatformPS4),
/* harmony export */   "isPlatformPS5": () => (/* binding */ isPlatformPS5),
/* harmony export */   "isPlatformVR": () => (/* binding */ isPlatformVR),
/* harmony export */   "isPlatformVita": () => (/* binding */ isPlatformVita),
/* harmony export */   "isSourceKnoef": () => (/* binding */ isSourceKnoef),
/* harmony export */   "isSourcePSNP": () => (/* binding */ isSourcePSNP),
/* harmony export */   "isSourcePlatGet": () => (/* binding */ isSourcePlatGet),
/* harmony export */   "isSourcePlaystationTrophies": () => (/* binding */ isSourcePlaystationTrophies),
/* harmony export */   "isSourcePowerPyx": () => (/* binding */ isSourcePowerPyx),
/* harmony export */   "isSourceVGL": () => (/* binding */ isSourceVGL),
/* harmony export */   "isTrophyGuide": () => (/* binding */ isTrophyGuide)
/* harmony export */ });
/* harmony import */ var _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(70);

function getGuideHref(attributes, id) {
    if (isSourcePSNP(attributes)) {
        return { href: '/guide/' + id, isExternal: false };
    }
    if (isSourcePowerPyx(attributes)) {
        return { href: 'https://www.powerpyx.com/' + id, isExternal: true };
    }
    if (isSourceKnoef(attributes)) {
        return { href: 'https://knoef.info/' + id, isExternal: true };
    }
    if (isSourcePlatGet(attributes)) {
        return { href: 'https://platget.com/' + id, isExternal: true };
    }
    if (isSourcePlaystationTrophies(attributes)) {
        return { href: 'https://www.playstationtrophies.org/game/' + id, isExternal: true };
    }
    if (isSourceVGL(attributes)) {
        return { href: 'https://videogamelizard.com/' + id, isExternal: true };
    }
    return { href: 'invalid', isExternal: false };
}
function isSourcePSNP(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_PSNP);
}
function isSourcePowerPyx(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_POWERPYX);
}
function isSourceKnoef(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_KNOEF);
}
function isSourcePlatGet(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_PLATGET);
}
function isSourcePlaystationTrophies(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_PLAYSTATIONTROPHIES);
}
function isSourceVGL(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_VIDEOGAMELIZARD);
}
function isTrophyGuide(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.IS_TROPHY_GUIDE);
}
function isDLCGuide(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.IS_DLC);
}
function hasBuggyTrophies(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.HAS_BUGGY_TROPHIES);
}
function hasOnlineTrophies(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.HAS_ONLINE_TROPHIES);
}
function hasMissableTrophies(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.HAS_MISSABLE_TROPHIES);
}
function isPlatformPS3(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_PS3);
}
function isPlatformPS4(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_PS4);
}
function isPlatformPS5(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_PS5);
}
function isPlatformVita(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_VITA);
}
function isPlatformPC(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_PC);
}
function isPlatformVR(attributes) {
    return Boolean(attributes & _guide_filter_types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_VR);
}


/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HAS_BUGGY_TROPHIES": () => (/* binding */ HAS_BUGGY_TROPHIES),
/* harmony export */   "HAS_MISSABLE_TROPHIES": () => (/* binding */ HAS_MISSABLE_TROPHIES),
/* harmony export */   "HAS_ONLINE_TROPHIES": () => (/* binding */ HAS_ONLINE_TROPHIES),
/* harmony export */   "IS_DLC": () => (/* binding */ IS_DLC),
/* harmony export */   "IS_TROPHY_GUIDE": () => (/* binding */ IS_TROPHY_GUIDE),
/* harmony export */   "PLATFORM_PC": () => (/* binding */ PLATFORM_PC),
/* harmony export */   "PLATFORM_PS3": () => (/* binding */ PLATFORM_PS3),
/* harmony export */   "PLATFORM_PS4": () => (/* binding */ PLATFORM_PS4),
/* harmony export */   "PLATFORM_PS5": () => (/* binding */ PLATFORM_PS5),
/* harmony export */   "PLATFORM_VITA": () => (/* binding */ PLATFORM_VITA),
/* harmony export */   "PLATFORM_VR": () => (/* binding */ PLATFORM_VR),
/* harmony export */   "SOURCE_KNOEF": () => (/* binding */ SOURCE_KNOEF),
/* harmony export */   "SOURCE_PLATGET": () => (/* binding */ SOURCE_PLATGET),
/* harmony export */   "SOURCE_PLAYSTATIONTROPHIES": () => (/* binding */ SOURCE_PLAYSTATIONTROPHIES),
/* harmony export */   "SOURCE_POWERPYX": () => (/* binding */ SOURCE_POWERPYX),
/* harmony export */   "SOURCE_PSNP": () => (/* binding */ SOURCE_PSNP),
/* harmony export */   "SOURCE_VIDEOGAMELIZARD": () => (/* binding */ SOURCE_VIDEOGAMELIZARD)
/* harmony export */ });
const SOURCE_PSNP = 1 << 0;
const SOURCE_KNOEF = 1 << 1;
const SOURCE_PLATGET = 1 << 2;
const SOURCE_PLAYSTATIONTROPHIES = 1 << 3;
const SOURCE_POWERPYX = 1 << 4;
const SOURCE_VIDEOGAMELIZARD = 1 << 16;
const IS_TROPHY_GUIDE = 1 << 5;
const IS_DLC = 1 << 6;
const PLATFORM_PS3 = 1 << 7;
const PLATFORM_PS4 = 1 << 8;
const PLATFORM_PS5 = 1 << 9;
const PLATFORM_VITA = 1 << 10;
const PLATFORM_PC = 1 << 11;
const PLATFORM_VR = 1 << 12;
const HAS_BUGGY_TROPHIES = 1 << 13;
const HAS_MISSABLE_TROPHIES = 1 << 14;
const HAS_ONLINE_TROPHIES = 1 << 15;


/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PlatformsColumn": () => (/* binding */ PlatformsColumn)
/* harmony export */ });
/* harmony import */ var _features_lists_platforms__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);


class PlatformsColumn extends _util_J__WEBPACK_IMPORTED_MODULE_1__.JC {
    constructor(platforms) {
        super('td');
        this._build(this._getPlatformElements(platforms));
    }
    _getPlatformElements(platforms) {
        const platformTags = Object.entries((0,_features_lists_platforms__WEBPACK_IMPORTED_MODULE_0__.mapPlatforms)(platforms))
            .map(([key, value]) => _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('tag', 'platform', key)
            .setText(value));
        return platformTags;
    }
    _build(platformElements) {
        const platforms = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .addClass('platforms')
            .setAttribute('style', 'width: 100%;');
        platformElements.forEach((el) => {
            platforms.append(el);
        });
        this
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('separator', 'left')
            .append(platforms));
    }
}


/***/ }),
/* 72 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TrophiesColumn": () => (/* binding */ TrophiesColumn)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class TrophiesColumn extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(trophies, game, smallInfo, displayPlatinum) {
        super('td');
        this._build(trophies, game, smallInfo, displayPlatinum);
    }
    _build(trophies, game, smallInfo, displayPlatinum) {
        const platinum = game != null && game.trophies != null
            ? game.trophies.platinum.toString()
            : trophies.platinum.toString();
        const gold = game != null && game.trophies != null
            ? game.trophies.gold.toString()
            : trophies.gold.toString();
        const silver = game != null && game.trophies != null
            ? game.trophies.silver.toString()
            : trophies.silver.toString();
        const bronze = game != null && game.trophies != null
            ? game.trophies.bronze.toString()
            : trophies.bronze.toString();
        if (platinum === '0') {
            displayPlatinum = false;
        }
        this
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('separator', 'left')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('trophy-count')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('flex', 'v-align', 'center')
            .append(displayPlatinum ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('icon-sprite', 'platinum') : null, displayPlatinum ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').setText(platinum) : null, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('icon-sprite', 'gold'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').setText(gold), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('icon-sprite', 'silver'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').setText(silver), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('icon-sprite', 'bronze'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').setText(bronze)), typeof game === 'undefined'
            ? null
            : _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
                .addClass('progress-bar')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').setText(`${game.progress}%`), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div').setAttribute('style', `width: ${game.progress}%`)), typeof smallInfo === 'undefined'
            ? null
            : smallInfo)));
    }
}


/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListRandomGamePanel": () => (/* binding */ ListRandomGamePanel)
/* harmony export */ });
/* harmony import */ var _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(31);
/* harmony import */ var _util_transform__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);



class ListRandomGamePanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor(listItems) {
        super('Your random game is...');
        this._listItems = listItems;
        this._textContainer = _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('span')
            .setAttribute('style', 'font-size: 20px;');
        this._imageContainer = _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('img')
            .setAttribute('style', 'height: 176px; border-radius: 10px; background-color: #292b2d;');
        this._addContent();
        this._animate();
    }
    _addContent() {
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('center')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(this._textContainer, _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('br'), this._imageContainer), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('center')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setText('Reroll')
            .click((e) => {
            e.preventDefault();
            this._animate();
        }))));
    }
    _animate() {
        const ding = new Audio('https://psnprofiles.com/lib/sound/ding.mp3');
        ding.setAttribute('preload', 'true');
        const shuffledGames = (0,_util_transform__WEBPACK_IMPORTED_MODULE_1__.cloneDeep)(this._listItems).sort(() => Math.random() - 0.5);
        let index = 0;
        const interval = setInterval(() => {
            this._textContainer.setText(shuffledGames[index].title);
            this._imageContainer.setAttribute('src', shuffledGames[index].image);
            index++;
            if (index === shuffledGames.length) {
                index = 0;
            }
        }, 75);
        setTimeout(() => {
            clearInterval(interval);
            const index = Math.floor(Math.random() * shuffledGames.length);
            this._textContainer
                .setText('')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('a')
                .setAttribute('href', shuffledGames[index].url)
                .setText(shuffledGames[index].title));
            this._imageContainer.setAttribute('src', shuffledGames[index].image);
            if (typeof Elevator === 'function') {
                ding.play();
            }
        }, 1500);
    }
}


/***/ }),
/* 74 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MoveCopyPanel": () => (/* binding */ MoveCopyPanel)
/* harmony export */ });
/* harmony import */ var _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(31);
/* harmony import */ var _ui_panel_PanelBottom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(37);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _ListStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8);




class MoveCopyPanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor(listItem, action, currentList) {
        super(`${action === 'moveToList' ? 'Move ' : 'Copy '} to another list`);
        this._listStorage = new _ListStorage__WEBPACK_IMPORTED_MODULE_3__.ListStorage();
        this._listsToDisplay = this._listStorage
            .get()
            .sort((a, b) => a.name.localeCompare(b.name))
            // NOTE: We don't want to move / copy to the same list
            .filter(list => list.id !== currentList.id);
        this._selectedList = this._listsToDisplay[0].id;
        this._addContent(listItem, action, currentList);
    }
    _addContent(listItem, action, currentList) {
        const listSelector = _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .addClass('form', 'box')
            .setAttribute('style', 'padding: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('label')
            .addClass('select')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('select')
            .change(e => {
            if (e == null || e.target == null) {
                return;
            }
            this._selectedList = e.target.value;
        })
            .append(...this._listsToDisplay.map(list => {
            return _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('option')
                .setAttribute('value', list.id)
                .setText(`${list.name}${list.url != null && list.url !== '' ? ' [ 📡 ]' : ''}`);
        })), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('i')));
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('center')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('img')
            .setAttribute('src', listItem.image)
            .setAttribute('style', 'max-width: 100px;'), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('h2').setText(listItem.title), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('span').setText(`${action === 'moveToList' ? 'Move ' : 'Copy '} to:`), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('br'), listSelector)), new _ui_panel_PanelBottom__WEBPACK_IMPORTED_MODULE_1__.PanelBottom(action === 'moveToList' ? 'Move' : 'Copy', () => {
            const deleteOriginal = action === 'moveToList';
            const actionDone = this._listStorage.moveCopyGame(currentList.id, this._selectedList, listItem, deleteOriginal);
            if (actionDone) {
                if (action === 'moveToList') {
                    this.resolve(true);
                }
                this.remove();
            }
            else {
                alert(`${listItem.title} cannot be ${action === 'moveToList' ? 'moved' : 'copied'} because it's already included in the selected list.`);
            }
        }, 'Close', () => this.remove()));
    }
}


/***/ }),
/* 75 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scrapeGameProgress": () => (/* binding */ scrapeGameProgress)
/* harmony export */ });
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(55);


function scrapeGameProgress(rows) {
    return rows.map(row => {
        const titleElement = row.clone().find('a.title');
        const title = titleElement.getText();
        const urlPath = titleElement.getAttribute('href');
        const url = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getWebsiteUrl)() + urlPath;
        const id = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(urlPath);
        const progress = parseInt(row.clone().find('div.progress-bar').find('span').getText().replace('%', ''), 10);
        const image = row.clone().find('picture img').getAttribute('src');
        let region = titleElement.clone().parent().getText().split(' • ')[1];
        if (region != null) {
            region = region.trim();
        }
        const [lastActivityString, completionTimeString] = row.clone()
            .find('div.small-info', { eq: 1 })
            .getText()
            .replace(/\s+/g, ' ')
            .trim()
            .split(' • ');
        const lastActivity = lastActivityString == ''
            ? undefined
            : (0,_util_date__WEBPACK_IMPORTED_MODULE_1__.parseSupDate)(lastActivityString).getTime();
        const platinumIcon = row.clone().find('img.icon-sprite.platinum-18');
        const platinum = platinumIcon.exists() && platinumIcon.hasClass('earned')
            ? 1
            : 0;
        const gold = parseInt(row.clone().find('span.icon-sprite.gold').next().getText(), 10);
        const silver = parseInt(row.clone().find('span.icon-sprite.silver').next().getText(), 10);
        const bronze = parseInt(row.clone().find('span.icon-sprite.bronze').next().getText(), 10);
        const isPS5 = row.clone().find('span.tag.platform.ps5').exists();
        const isPS4 = row.clone().find('span.tag.platform.ps4').exists();
        const isPS3 = row.clone().find('span.tag.platform.ps3').exists();
        const isPSVITA = row.clone().find('span.tag.platform.psvita').exists();
        const isPSVR = row.clone().find('span.tag.platform.psvr').exists();
        const isPC = row.clone().find('span.tag.platform.pc').exists();
        return {
            id,
            title,
            url,
            scrapetime: Date.now(),
            progress,
            image,
            region,
            lastActivity,
            completionTimeString,
            trophies: {
                platinum,
                gold,
                silver,
                bronze
            },
            platforms: {
                ps5: isPS5,
                ps4: isPS4,
                ps3: isPS3,
                psvita: isPSVITA,
                psvr: isPSVR,
                pc: isPC
            }
        };
    });
}


/***/ }),
/* 76 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListManager": () => (/* binding */ ListManager)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _ListPanel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(77);
/* harmony import */ var _ListStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _ui_ui_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(39);
/* harmony import */ var _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(21);
/* harmony import */ var _util_string__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(57);






class NoteRow extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor() {
        super('div');
        this._noteContainer = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-12');
        this._build();
    }
    _build() {
        this
            .addClass('row')
            .append(this._noteContainer);
    }
    appendNote(...children) {
        this._noteContainer.empty();
        this._noteContainer.append(...children);
        this.show();
    }
}
class ListManager extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(lists, onListChanged) {
        var _a;
        super('div');
        this._lists = lists;
        const lastActiveGameList = new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__.ScriptStateStorage().get('lastActiveGameList');
        this._selectedList = (_a = lists.find(list => list.id === lastActiveGameList)) !== null && _a !== void 0 ? _a : lists[0];
        this._noteRow = new NoteRow().hide();
        if (this._selectedList != null && this._selectedList.note !== '') {
            this._noteRow.appendNote(...(0,_util_string__WEBPACK_IMPORTED_MODULE_5__.linkifyText)(this._selectedList.note));
        }
        this._onListChanged = onListChanged;
        this._build();
    }
    _build() {
        const noLists = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .setAttribute('style', 'padding-top: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setText('Create new list')
            .click(e => {
            e.preventDefault();
            (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_3__.appendPanel)(new _ListPanel__WEBPACK_IMPORTED_MODULE_1__.ListCreatePanel());
        })));
        const listSelector = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('form', 'box')
            .setAttribute('style', 'padding: 5px; margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('row')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-3')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label')
            .addClass('select')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('select')
            .change(e => {
            if (e == null || e.target == null) {
                return;
            }
            const listId = e.target.value;
            const list = this._lists.find(list => list.id === listId);
            if (list == null) {
                throw new Error('Invalid list ID');
            }
            new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__.ScriptStateStorage().set('lastActiveGameList', listId);
            this._selectedList = list;
            if (this._selectedList.note !== '') {
                this._noteRow.appendNote(...(0,_util_string__WEBPACK_IMPORTED_MODULE_5__.linkifyText)(this._selectedList.note));
            }
            else {
                this._noteRow.hide();
            }
            this._onListChanged(list.id);
        })
            .append(...this._lists.map(list => {
            const option = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('option')
                .setAttribute('value', list.id)
                .setText(`${list.name} (${list.games.length})${list.url != null && list.url !== '' ? ' [ 📡 ]' : ''}`);
            if (this._selectedList != null && list.id === this._selectedList.id) {
                option.setAttribute('selected', 'selected');
            }
            return option;
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i'))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-1')
            .setAttribute('style', 'padding-top: 6px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'blue')
            .setText('Edit')
            .click((e) => {
            e.preventDefault();
            if (typeof this._selectedList !== 'undefined') {
                (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_3__.appendPanel)(new _ListPanel__WEBPACK_IMPORTED_MODULE_1__.ListCreatePanel(this._selectedList.id));
            }
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-1')
            .setAttribute('style', 'padding-top: 6px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'red')
            .setText('Delete')
            .click((e) => {
            e.preventDefault();
            const result = confirm('Are you sure you want to delete this list?');
            if (result) {
                if (typeof this._selectedList !== 'undefined') {
                    new _ListStorage__WEBPACK_IMPORTED_MODULE_2__.ListStorage().remove(this._selectedList.id);
                    new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__.ScriptStateStorage().set('lastActiveGameList', null);
                }
                location.reload();
            }
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-1', 'col-xs-offset-5')
            .setAttribute('style', 'padding-top: 6px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setText('Create')
            .click((e) => {
            e.preventDefault();
            (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_3__.appendPanel)(new _ListPanel__WEBPACK_IMPORTED_MODULE_1__.ListCreatePanel());
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-1')
            .setAttribute('style', 'padding-top: 6px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setText('Import')
            .click((e) => {
            e.preventDefault();
            (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_3__.appendPanel)(new _ListPanel__WEBPACK_IMPORTED_MODULE_1__.ListImportPanel());
        }))), this._noteRow);
        this.append(this._lists.length === 0
            ? _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('h1').setText('Game Lists'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div').setText('This is your personal catalogue of games. Create your own game lists - backlogs, wishlists or community challenge lists.'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), 'Start by creating your very first list.'))
            : null, this._lists.length === 0
            ? noLists
            : listSelector);
    }
}


/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListCreatePanel": () => (/* binding */ ListCreatePanel),
/* harmony export */   "ListImportPanel": () => (/* binding */ ListImportPanel)
/* harmony export */ });
/* harmony import */ var _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(31);
/* harmony import */ var _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(32);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(33);
/* harmony import */ var _ui_panel_PanelBottom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(37);
/* harmony import */ var _ListStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8);
/* harmony import */ var _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(21);
/* harmony import */ var _ui_panel_PanelRadio__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(78);
/* harmony import */ var _ui_panel_PanelSelect__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(38);
/* harmony import */ var _util_data__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(7);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(13);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(12);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(25);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(34);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(43);















class ListCreatePanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor(listId = null) {
        super('PSNP+ List');
        this._values = {
            name: '',
            tags: [],
            note: '',
            removeStartedGames: false,
            removeGames: 'never',
            orderBy: 'custom',
            direction: 'ascending',
            timestamp: Date.now(),
            url: '',
            games: []
        };
        this._listStorage = new _ListStorage__WEBPACK_IMPORTED_MODULE_5__.ListStorage();
        this._listId = listId;
        this._mode = this._listId == null
            ? 'CREATE'
            : 'EDIT';
        if (this._mode === 'EDIT') {
            const list = this._listStorage.getById(this._listId);
            this._values.name = list.name;
            this._values.tags = list.tags;
            this._values.note = list.note;
            this._values.url = list.url == null
                ? ''
                : list.url;
            this._values.removeGames = list.removeStartedGames
                ? 'started'
                : list.removeGames != null
                    ? list.removeGames
                    : 'never';
            this._values.orderBy = list.orderBy == null
                ? 'custom'
                : list.orderBy;
            this._values.direction = list.direction == null
                ? 'descending'
                : list.direction;
        }
        this._addContent();
    }
    _addContent() {
        const nameInput = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_3__.PanelInput('Name', this._values.name, 'Name of your list, e.g. "Wishlist". This field cannot be empty.', (name) => name.trim() !== '');
        const tagsInput = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_3__.PanelInput('Tags', this._values.tags.join(', '), 'List of tags separated by ",". Tags starting with "@" will be added automatically to new items.');
        const noteInput = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_3__.PanelInput('Note', this._values.note, 'You can also include clickable links as [Link Text](Link URL)');
        const urlInput = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_3__.PanelInput('URL', this._values.url, 'URL which can be used to reload list. Useful if the list is hosted elsewhere.', (url) => url === '' || (0,_util_url__WEBPACK_IMPORTED_MODULE_11__.validateUrl)(url));
        const defaultOrderBy = new _ui_panel_PanelSelect__WEBPACK_IMPORTED_MODULE_8__.PanelSelect('Order by', this._values.orderBy, {
            custom: 'Custom',
            timestamp: 'Date Added',
            lastActivity: 'Last Activity',
            completionTime: 'Completion Time',
            alphabetical: 'Alphabetical',
            points: 'Points',
            unearnedPoints: 'Unearned Points',
            trophies: 'Trophies',
            unearnedTrophies: 'Unearned Trophies',
            platinum: 'Platinum Rate',
            full: '100% Rate',
            progress: 'Progress',
            difficulty: 'Difficulty',
            guideTime: 'Guide Time',
            note: 'Note'
        });
        const defaultOrderDirection = new _ui_panel_PanelRadio__WEBPACK_IMPORTED_MODULE_7__.PanelRadio('Order direction', this._values.direction, [
            { name: 'direction', value: 'ascending', text: 'Ascending' },
            { name: 'direction', value: 'descending', text: 'Descending' }
        ]);
        const removeGamesRadio = new _ui_panel_PanelRadio__WEBPACK_IMPORTED_MODULE_7__.PanelRadio('Remove games', this._values.removeGames, [
            { name: 'removeGames', value: 'never', text: 'Never', tooltip: 'Games will never be removed automatically from this list.' },
            { name: 'removeGames', value: 'started', text: 'Started', tooltip: 'Games that appear in your profile will be automatically removed from this list.' },
            { name: 'removeGames', value: 'platinum', text: 'Platinum', tooltip: 'Games with earned platinum trophy will be removed. Platinum-less games will be removed if you reach 100% completion.' },
            { name: 'removeGames', value: 'completed', text: 'Completed', tooltip: 'Games with 100% completion will be automatically removed from this list.' }
        ]);
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(new _ui_panel_PanelSection__WEBPACK_IMPORTED_MODULE_1__.PanelSection('List Settings', nameInput, tagsInput, noteInput, urlInput, defaultOrderBy, defaultOrderDirection, removeGamesRadio)), new _ui_panel_PanelBottom__WEBPACK_IMPORTED_MODULE_4__.PanelBottom('Save & Reload', () => {
            const formInvalid = [
                nameInput.validate(),
                tagsInput.validate(),
                urlInput.validate(),
                noteInput.validate()
            ].some(result => result === false);
            if (formInvalid) {
                return;
            }
            if (this._mode === 'EDIT') {
                const oldTags = this._values.tags;
                const newTags = tagsInput.commaSeparatedList();
                const removedTags = oldTags.filter(o => newTags.indexOf(o) === -1);
                if (removedTags.length > 0) {
                    this._listStorage.clearTags(this._listId, removedTags);
                }
            }
            const newList = {
                name: nameInput.serialize().trim(),
                timestamp: Date.now(),
                tags: tagsInput.commaSeparatedList(),
                orderBy: defaultOrderBy.serialize(),
                direction: defaultOrderDirection.serialize(),
                removeGames: removeGamesRadio.serialize(),
                note: noteInput.serialize().trim(),
                url: urlInput.serialize(),
                games: [],
                removeStartedGames: false
            };
            if (this._mode === 'CREATE') {
                const listId = this._listStorage.createList(newList);
                new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_6__.ScriptStateStorage().set('lastActiveGameList', listId);
            }
            else if (this._mode === 'EDIT') {
                this._listStorage.updateList(this._listId, newList);
            }
            this.remove();
            location.reload();
        }, 'Close', () => this.remove()));
    }
}
class ListImportPanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor(url) {
        super('PSNP+ List Import');
        this._values = {
            url: '',
        };
        this._listStorage = new _ListStorage__WEBPACK_IMPORTED_MODULE_5__.ListStorage();
        this._scriptStateStorage = new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_6__.ScriptStateStorage();
        if (url != null) {
            this._values.url = url;
        }
        this._addContent();
    }
    _addContent() {
        const urlInput = new _ui_panel_PanelInput__WEBPACK_IMPORTED_MODULE_3__.PanelInput('URL', this._values.url, 'Exact URL that leads to previously exported list', (url) => (0,_util_url__WEBPACK_IMPORTED_MODULE_11__.validateUrl)(url), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'blue')
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_13__.tooltip)(el, 'Copy shareable URL'))
            .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_14__.Icon('fa-clipboard'))
            .click(async (e, el) => {
            e.preventDefault();
            const validUrl = urlInput.validate();
            if (!validUrl) {
                alert('Invalid URL: ' + urlInput.serialize());
                return;
            }
            const websiteUrl = (0,_util_url__WEBPACK_IMPORTED_MODULE_11__.getWebsiteUrl)();
            const urlToCopy = `${websiteUrl}${_util_constants__WEBPACK_IMPORTED_MODULE_12__.HASH_PROFILE}?hash=${_util_constants__WEBPACK_IMPORTED_MODULE_12__.HASH_GAME_LISTS.replace('#', '')}?import=${encodeURIComponent(encodeURIComponent(urlInput.serialize()))}`;
            try {
                await navigator.clipboard.writeText(urlToCopy);
                el.clone().find('i').removeClass('fa-clipboard').addClass('fa-check');
                setTimeout(() => el.clone().find('i').removeClass('fa-check').addClass('fa-clipboard'), 1000);
            }
            catch (e) {
                const typedE = e;
                alert('Copying to clipboard failed: ' + typedE.message);
                console.error('Copy error', typedE);
            }
        }));
        const _handleLocalCopy = async () => {
            try {
                const url = urlInput.serialize();
                const list = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_10__.gmFetchJson)(url);
                list.url = url;
                const id = this._listStorage.createList(list);
                this._scriptStateStorage.set('lastActiveGameList', id);
                location.hash = _util_constants__WEBPACK_IMPORTED_MODULE_12__.HASH_GAME_LISTS;
                location.reload();
            }
            catch (e) {
                const typedE = e;
                alert('Failed to download list! Error message: ' + typedE.message);
            }
        };
        const fileInput = _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('input')
            .setAttribute('type', 'file')
            .setAttribute('style', 'display: none;')
            .change(async (e) => {
            if (e == null || e.target == null) {
                return;
            }
            const target = e.target;
            if (target.files == null || target.files.length === 0) {
                return;
            }
            try {
                const id = await (0,_util_data__WEBPACK_IMPORTED_MODULE_9__.importList)(target.files[0]);
                this._scriptStateStorage.set('lastActiveGameList', id);
                location.reload();
            }
            catch (e) {
                const typedE = e;
                alert('Failed to import list! Error message: ' + typedE.message);
            }
        });
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .addClass('row', 'center-xs')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .addClass('col-xs-2')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('a')
            .addClass('button', 'green')
            .setAttribute('href', '#')
            .setText('Import from JSON file')
            .click((e) => {
            e.preventDefault();
            fileInput.triggerClick();
        }))), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .addClass('row', 'center-xs')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .addClass('col-xs-12')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('h3')
            .setAttribute('style', 'width: 100%; text-align: center; border-bottom: 1px solid #e3e3e6; line-height: 0.01em; margin: 10px 0 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('span')
            .setAttribute('style', 'background: #fafafa; padding: 0 10px;')
            .setText('or')))), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .addClass('form')
            .append(urlInput), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .addClass('row')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .addClass('col-xs-2', 'col-xs-offset-2')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('a')
            .addClass('button', 'green')
            .setAttribute('href', '#')
            .setText('Import from URL')
            .click((e) => {
            e.preventDefault();
            _handleLocalCopy();
        })))));
    }
}


/***/ }),
/* 78 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PanelRadio": () => (/* binding */ PanelRadio)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34);


class PanelRadio extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(label, value, options) {
        super('div');
        this._radioInputs = [];
        this._label = label;
        this._value = value;
        this._options = options;
        this._build();
    }
    _build() {
        this
            .addClass('row', 'middle-xs')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-2')
            .setAttribute('style', 'text-align: right;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('small-title')
            .setText(this._label)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-10')
            .setAttribute('style', 'display: flex;')
            .append(...this._options.map(option => {
            const input = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('input')
                .setAttribute('type', 'radio')
                .setAttribute('name', option.name)
                .setAttribute('value', option.value)
                .condition(option.value === this._value, el => el.setAttribute('checked', 'checked'));
            this._radioInputs.push(input);
            return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label')
                .addClass('radio')
                .setAttribute('style', 'display: flex; margin-right: 20px;')
                .append(input, _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
                .setText(option.text)
                .condition(option.tooltip != null, el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_1__.tooltip)(el.get(), option.tooltip)));
        })));
    }
    serialize() {
        const checked = this._radioInputs.find(input => input.get().checked);
        if (checked != null) {
            return checked.getValue();
        }
        return this._options[0].value;
    }
}


/***/ }),
/* 79 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ListButton": () => (/* binding */ ListButton),
/* harmony export */   "ListButtonSmall": () => (/* binding */ ListButtonSmall)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34);
/* harmony import */ var _lists_ListScraper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);
/* harmony import */ var _lists_ListStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8);
/* harmony import */ var _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(21);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(19);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(12);







class ListButtonSmall extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(trophyListId, trophyListUrl, listId, buttonClass) {
        super('a');
        this._type = 'add';
        this._enabled = true;
        this._addProperties = { color: 'green', icon: 'plus' };
        this._removeProperties = { color: 'red', icon: 'minus' };
        this._trophyListId = trophyListId;
        this._trophyListUrl = trophyListUrl;
        this._listId = listId;
        this._buttonClass = buttonClass;
        this._listStorage = new _lists_ListStorage__WEBPACK_IMPORTED_MODULE_3__.ListStorage();
        this._type = this._listStorage.hasInList(this._listId, this._trophyListId)
            ? 'remove'
            : 'add';
        this._build();
    }
    _setProperties() {
        const oldProps = this._type === 'add'
            ? this._removeProperties
            : this._addProperties;
        const newProps = this._type === 'add'
            ? this._addProperties
            : this._removeProperties;
        const getIconClass = (icon) => `fa-${icon}-circle`;
        this.removeClass(oldProps.color)
            .clone().find('i')
            .removeClass(getIconClass(oldProps.icon));
        this.addClass(newProps.color)
            .clone().find('i')
            .addClass(getIconClass(newProps.icon));
    }
    _build() {
        const lastActiveGameListName = this._listStorage.getById(this._listId).name;
        this
            .setAttribute('href', '#')
            .addClass('button', this._buttonClass)
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_1__.tooltip)(el, `Last active game list: ${lastActiveGameListName}`))
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i').addClass('fa'))
            .click(async (e) => {
            e.preventDefault();
            if (!this._enabled) {
                return;
            }
            this._enabled = false;
            if (this._type === 'add') {
                try {
                    const listItem = await _lists_ListScraper__WEBPACK_IMPORTED_MODULE_2__.ListScraper.getFromUrl(this._trophyListUrl);
                    this._listStorage.addGameToList(this._listId, listItem, true);
                    this._type = 'remove';
                }
                catch (e) {
                    console.warn('Adding to list failed', e);
                }
            }
            else {
                this._listStorage.removeGame(this._listId, this._trophyListId);
                this._type = 'add';
            }
            this._setProperties();
            this._enabled = true;
        });
        this._setProperties();
    }
}
class ListButton extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(listStorage, listItem) {
        var _a, _b;
        super('div');
        this._selectedListId = '';
        this._listStorage = listStorage;
        this._listItem = listItem;
        this._lists = this._listStorage
            .get()
            .filter(list => !list.games.some(game => game.id === this._listItem.id))
            .sort((a, b) => a.name.localeCompare(b.name));
        if (this._lists.length === 0) {
            this._buildRedirect();
            return;
        }
        const lastActiveGameList = new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__.ScriptStateStorage().get('lastActiveGameList');
        this._selectedListId = (_b = (_a = this._lists.find(list => list.id === lastActiveGameList)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : this._lists[0].id;
        this._build();
    }
    // Builds basic button which just redirects if user has 0 lists
    _buildRedirect() {
        this
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setText('Add to list')
            .click((e) => {
            e.preventDefault();
            const psnId = (0,_util_user__WEBPACK_IMPORTED_MODULE_5__.getPsnId)();
            (0,_util_url__WEBPACK_IMPORTED_MODULE_6__.redirect)('/' + psnId + '#gamelists');
        }));
    }
    _build() {
        this
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('form')
            .setAttribute('style', 'padding: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('row')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-8')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('label')
            .addClass('select')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('select')
            .change((e) => {
            if (e == null || e.target == null) {
                return;
            }
            this._selectedListId = e.target.value;
            new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__.ScriptStateStorage().set('lastActiveGameList', this._selectedListId);
        })
            .append(...this._lists.map(list => {
            const option = _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('option')
                .setAttribute('value', list.id)
                .setText(list.name + ' (' + list.games.length + ')');
            if (this._selectedListId === list.id) {
                option.setAttribute('selected', 'selected');
            }
            return option;
        })), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('i'))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-4')
            .setAttribute('style', 'padding-top: 6px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setText('Add to list')
            .click((e) => {
            e.preventDefault();
            this._listStorage.addGameToList(this._selectedListId, this._listItem, true);
            location.reload();
        })))));
    }
}


/***/ }),
/* 80 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SUPPORTED_MYSERIES_VERSION": () => (/* binding */ SUPPORTED_MYSERIES_VERSION)
/* harmony export */ });
const SUPPORTED_MYSERIES_VERSION = 1;


/***/ }),
/* 81 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MySeriesTable": () => (/* binding */ MySeriesTable)
/* harmony export */ });
/* harmony import */ var _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(62);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(43);
/* harmony import */ var _ui_MultiDropdownMenu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(66);
/* harmony import */ var _ui_SearchBox__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(63);
/* harmony import */ var _ui_TrophiesColumn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(72);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3);
/* harmony import */ var _util_transform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(16);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(34);
/* harmony import */ var _game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(20);
/* harmony import */ var _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(21);










function flattenSeriesGames(games) {
    return Object.values(games).reduce((accumulator, value) => accumulator.concat(value), []);
}
function flattenSeriesGames2(games) {
    return Object.values(games).reduce((accumulator, value) => accumulator.concat(value), []);
}
class MySeriesTableRow extends _util_J__WEBPACK_IMPORTED_MODULE_5__.JC {
    constructor(row) {
        super('tr');
        this._row = row;
        this._build();
    }
    _build() {
        if (this._row.perfectCompletion) {
            this.addClass('completed');
        }
        this
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('td')
            .setAttribute('style', 'width: 1%;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('a')
            .setAttribute('href', this._row.series.pathname)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('picture')
            .addClass('series')
            .setAttribute('alt', this._row.series.title)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('img')
            .setAttribute('src', this._row.series.image)))), _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('td')
            .setAttribute('style', 'width: 100%;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('div')
            .addClass('ellipsis')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('span')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('a')
            .addClass('title')
            .setAttribute('href', this._row.series.pathname)
            .append(this._row.series.title))), _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('div')
            .addClass('small-info')
            .setAttribute('style', 'margin-top: 4px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('b').setText(flattenSeriesGames(this._row.series.games).length.toString()), ' Games')), new _ui_TrophiesColumn__WEBPACK_IMPORTED_MODULE_4__.TrophiesColumn({
            platinum: this._row.series.trophies.platinum,
            gold: this._row.series.trophies.gold,
            silver: this._row.series.trophies.silver,
            bronze: this._row.series.trophies.bronze
        }, undefined, _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('span')
            .addClass('small-info')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('b')
            .setText(this._row.series.totalTrophies.toString()), ' Trophies ', _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('b').setText(this._row.series.points.toLocaleString('en-US')), ' Points')
            .condition(this._row.hasBeenCollapsed, (el) => el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('bullet').setText('•'), ' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_1__.Icon('fa-warning').apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_7__.tooltip)(el, 'The number of trophies here does not reflect collapsed games.')))), true), _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('td')
            .setAttribute('style', 'width: 100%;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('span')
            .addClass('separator', 'left')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('b')
            .append(flattenSeriesGames2(this._row.mappedGames).length.toString(), '/', flattenSeriesGames(this._row.series.games).length.toString()))), _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('td')
            .setAttribute('style', 'width: 100%;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('span')
            .addClass('separator', 'left')
            .append(this._row.perfectCompletion
            ? _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('img')
                .addClass('icon-sprite', 'completion-star')
                .setAttribute('src', '/lib/img/layout/spacer.png')
                .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_7__.tooltip)(el, 'Perfect! All games from the series are at 100%.'))
                .condition(this._row.hasBeenCollapsed, (el) => { el.setAttribute('style', 'filter: hue-rotate(90deg);'); })
            : this._row.hasImperfectGames
                ? _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('img')
                    .addClass('icon-sprite', 'incomplete')
                    .setAttribute('src', '/lib/img/layout/spacer.png')
                    .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_7__.tooltip)(el, 'This series has incomplete games.'))
                : _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('img')
                    .addClass('icon-sprite', 'completion')
                    .setAttribute('src', '/lib/img/layout/spacer.png')
                    .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_7__.tooltip)(el, 'All started games are at 100% so the series is considered finished for now.')))));
    }
}
const orderFunctions = {
    id: (a, b) => parseInt(a.id, 10) - parseInt(b.id),
    alphabetical: (a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        if (titleA < titleB)
            return -1;
        if (titleA > titleB)
            return 1;
        return 0;
    },
    lastUpdate: (a, b) => (a.scrapetime - b.scrapetime) * -1,
};
class MySeriesTable extends _util_J__WEBPACK_IMPORTED_MODULE_5__.JC {
    constructor(seriesList) {
        super('div');
        this._tbody = _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('tbody');
        this._searchValue = '';
        this._myGames = new _game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_8__.GameProgressStorage().indexedById();
        this._scriptStateStorage = new _state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_9__.ScriptStateStorage();
        this._tableTitle = _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('h3')
            .setText('Advanced Guide Search');
        this._orderBy = 'lastUpdate';
        this._completion = 'all';
        this._collapseOptions = [];
        this._seriesList = seriesList;
        if (this._scriptStateStorage.get('mySeriesCollapseNoStage')) {
            this._collapseOptions.push('collapseNoStage');
        }
        if (this._scriptStateStorage.get('mySeriesCollapseNumberedStages')) {
            this._collapseOptions.push('collapseNumberedStages');
        }
        this._build();
    }
    _getOrderDropdown() {
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_0__.DropdownMenu({
            mainButton: 'Order',
            mainButtonIconClass: 'order',
            options: [
                {
                    text: 'Series ID',
                    value: 'id',
                    selected: this._orderBy === 'id'
                },
                {
                    text: 'Alphabetical',
                    value: 'alphabetical',
                    selected: this._orderBy === 'alphabetical'
                },
                {
                    text: 'Last Update',
                    value: 'lastUpdate',
                    selected: this._orderBy === 'lastUpdate'
                },
            ],
            onSelected: (order) => {
                this._orderBy = order;
                this._renderRows();
            }
        });
    }
    _getCompletionDropdown() {
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_0__.DropdownMenu({
            mainButton: 'Completion',
            mainButtonIconClass: 'completion',
            options: [
                {
                    text: 'All',
                    value: 'all',
                    selected: this._completion === 'all'
                },
                {
                    text: 'Perfect',
                    value: 'perfect',
                    selected: this._completion === 'perfect'
                },
                {
                    text: 'Finished',
                    value: 'finished',
                    selected: this._completion === 'finished'
                },
                {
                    text: 'Active',
                    value: 'active',
                    selected: this._completion === 'active'
                },
            ],
            onSelected: (completion) => {
                this._completion = completion;
                this._renderRows();
            }
        });
    }
    _getCollapseDropdown() {
        const options = [
            {
                text: 'Collapse No Stage',
                value: 'collapseNoStage',
                selected: this._collapseOptions.includes('collapseNoStage')
            },
            {
                text: 'Collapse Numbered Stages',
                value: 'collapseNumberedStages',
                selected: this._collapseOptions.includes('collapseNumberedStages')
            }
        ];
        return new _ui_MultiDropdownMenu__WEBPACK_IMPORTED_MODULE_2__.MultiDropdownMenu({
            mainButton: 'Collapse',
            mainButtonIconClass: 'rarity',
            options,
            onSelectionChanged: (collapseOptions) => {
                this._collapseOptions = collapseOptions;
                this._scriptStateStorage.set('mySeriesCollapseNoStage', collapseOptions.includes('collapseNoStage'));
                this._scriptStateStorage.set('mySeriesCollapseNumberedStages', collapseOptions.includes('collapseNumberedStages'));
                this._renderRows();
            }
        });
    }
    _renderRows() {
        const clonedSeriesList = (0,_util_transform__WEBPACK_IMPORTED_MODULE_6__.cloneDeep)(this._seriesList.list);
        const filteredSeries = Object.values(clonedSeriesList)
            .filter(x => x.title.toLocaleLowerCase().includes(this._searchValue.toLocaleLowerCase()));
        if (this._orderBy !== 'id') {
            filteredSeries.sort((a, b) => {
                return orderFunctions[this._orderBy](a, b);
            });
        }
        let flattenedSeries = filteredSeries.filter(x => flattenSeriesGames(x.games).some(game => this._myGames.has(game)))
            .map(series => {
            const mappedGames = {};
            Object.entries(series.games).forEach(([key, value]) => {
                mappedGames[key] = [];
                value.forEach(gameId => {
                    if (this._myGames.has(gameId)) {
                        mappedGames[key].push(this._myGames.get(gameId));
                    }
                });
            });
            const collapseNoStage = this._collapseOptions.includes('collapseNoStage');
            const collapseNumberedStages = this._collapseOptions.includes('collapseNumberedStages');
            let hasBeenCollapsed = false;
            if (collapseNoStage || collapseNumberedStages) {
                Object.keys(series.games).forEach(key => {
                    if ((collapseNoStage && key === 'no') || (collapseNumberedStages && key !== 'no')) {
                        const numberOfPerfectGamesForThisStage = mappedGames[key].filter(game => game.progress === 100).length;
                        if (numberOfPerfectGamesForThisStage > 0 && numberOfPerfectGamesForThisStage < series.games[key].length) {
                            hasBeenCollapsed = true;
                            mappedGames[key] = mappedGames[key].filter(game => game.progress === 100);
                            series.games[key] = mappedGames[key].map(game => game.id);
                        }
                    }
                });
            }
            const flatSeries = flattenSeriesGames(series.games);
            const flatMappedGames = flattenSeriesGames2(mappedGames);
            const perfectGames = flatMappedGames.filter(game => game.progress === 100);
            const perfectCompletion = perfectGames.length === flatSeries.length;
            const hasImperfectGames = flatMappedGames.filter(game => game.progress !== 100).length > 0;
            return {
                series,
                mappedGames,
                perfectCompletion,
                hasImperfectGames,
                hasBeenCollapsed
            };
        });
        if (this._completion !== 'all') {
            if (this._completion === 'perfect') {
                flattenedSeries = flattenedSeries.filter(x => x.perfectCompletion);
            }
            else if (this._completion === 'finished') {
                flattenedSeries = flattenedSeries.filter(x => !x.hasImperfectGames);
            }
            else if (this._completion === 'active') {
                flattenedSeries = flattenedSeries.filter(x => x.hasImperfectGames);
            }
        }
        this._tableTitle.setText('My Series - ' + flattenedSeries.length + ' Series');
        this._tbody.empty();
        this._tbody.append(...flattenedSeries.map((series) => {
            return new MySeriesTableRow(series);
        }));
    }
    _build() {
        const searchBox = new _ui_SearchBox__WEBPACK_IMPORTED_MODULE_3__.SearchBox('Search your series', value => {
            this._searchValue = value;
            this._renderRows();
        });
        searchBox.setInputValue(this._searchValue);
        this
            .addClass('col-xs-12')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('div')
            .addClass('title', 'flex', 'v-align')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('div')
            .addClass('grow')
            .append(this._tableTitle), _util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('div')
            .addClass('no-shrink')
            .append(this._getOrderDropdown(), this._getCompletionDropdown(), this._getCollapseDropdown())))
            .append(searchBox)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('div')
            .addClass('box', 'no-top-border')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_5__.J.c('table')
            .addClass('zebra', 'list-table')
            .append(this._tbody)));
        this._renderRows();
    }
}


/***/ }),
/* 82 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProfileImmediate": () => (/* binding */ ProfileImmediate)
/* harmony export */ });
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(51);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);


class ProfileImmediate {
    run() {
        console.debug('ProfileImmediate module is running');
        const settingsStorage = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage();
        if (settingsStorage.get('resizePS5Icons')) {
            (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.STYLESHEET_PROFILE_RESIZE_PS5_ICONS);
        }
        if (settingsStorage.get('hideRank')) {
            (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.STYLESHEET_PROFILE_HIDE_RANK);
        }
        if (settingsStorage.get('compactBanners')) {
            (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_0__.STYLESHEET_COMPACT_BANNERS);
        }
    }
}


/***/ }),
/* 83 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Trophies": () => (/* binding */ Trophies)
/* harmony export */ });
/* harmony import */ var _features_lists_ListScraper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
/* harmony import */ var _features_plat_prices_PlatPricesStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(29);
/* harmony import */ var _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(53);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3);
/* harmony import */ var _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(79);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5);
/* harmony import */ var _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(8);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(21);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(19);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(12);
/* harmony import */ var _features_plat_prices_PlatPricesAPI__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(23);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(24);
/* harmony import */ var _features_lists_platforms__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(48);
/* harmony import */ var _features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(68);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(25);
/* harmony import */ var _features_compare_plus_TrophyListProgressScraper__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(59);
/* harmony import */ var _util_promise__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(15);
/* harmony import */ var _features_compare_plus_ProgressBox__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(84);
/* harmony import */ var _features_compare_plus_ComparePlusStorage__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(27);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(55);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(34);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(13);
/* harmony import */ var _util_Logger__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(49);
/* harmony import */ var _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(30);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(51);
/* harmony import */ var _features_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(69);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(43);
/* harmony import */ var _util_string__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(57);
/* harmony import */ var _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(45);





























class RarityBox extends _util_J__WEBPACK_IMPORTED_MODULE_3__.JC {
    constructor(rarityInfo, onClick) {
        super('table');
        this.setAttribute('id', 'rarity-box');
        this._rarityInfo = rarityInfo;
        this._onClick = onClick;
        this._build();
    }
    _getCell(value, rarity, sprite) {
        return _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td')
            .setAttribute('style', 'text-align: center; font-weight: 700;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('img').addClass('icon-sprite', 'rarity', sprite).setAttribute('src', '/lib/img/layout/spacer.png'), ' ', value.toString())
            .click(e => {
            e.preventDefault();
            this._onClick(rarity);
        });
    }
    _build() {
        const cells = [
            this._getCell(this._rarityInfo.ultraRare, 'ultra-rare', 'ultra-rare').apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Ultra Rare')),
            this._getCell(this._rarityInfo.veryRare, 'very-rare', 'very-rare').apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Very Rare')),
            this._getCell(this._rarityInfo.rare, 'rare', 'rare').apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Rare')),
            this._getCell(this._rarityInfo.uncommon, 'uncommon', 'common').apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Uncommon')),
            this._getCell(this._rarityInfo.common, 'common', 'common').apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Baby Stuff 👶🍼'))
        ];
        this.addClass('zebra')
            .setAttribute('style', 'border-top: 1px solid #e3e3e6;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tbody')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr')
            .setAttribute('style', 'cursor: pointer;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').setAttribute('style', 'text-align: center;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('img')
            .addClass('icon-sprite', 'level')
            .setAttribute('src', '/lib/img/layout/spacer.png')
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'All'))
            .click((e) => {
            e.preventDefault();
            this._onClick('all');
        })), ...cells)));
    }
}
class ListInfo extends _util_J__WEBPACK_IMPORTED_MODULE_3__.JC {
    constructor(listStorage, listItem) {
        super('div');
        this._inLists = listStorage
            .get()
            .filter(list => list.games.some(game => game.id === listItem.id));
        if (this._inLists.length > 0) {
            this._build();
        }
    }
    _build() {
        this
            .setAttribute('style', 'padding-left: 5px; padding-top: 5px; text-align: initial;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div').setText('You have added this trophy list to:'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('ul')
            .append(...this._inLists.map(list => {
            return _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('li')
                .setCss('cursor', 'pointer')
                .setText(list.name)
                .click(e => {
                e.preventDefault();
                new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_7__.ScriptStateStorage().set('lastActiveGameList', list.id);
                const psnId = (0,_util_user__WEBPACK_IMPORTED_MODULE_8__.getPsnId)();
                (0,_util_url__WEBPACK_IMPORTED_MODULE_9__.redirect)('/' + psnId + '#gamelists');
            });
        })));
    }
}
class Trophies {
    constructor(psnId) {
        this._trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_9__.getFirstLevelIdFromPathname)(window.location.pathname);
        this._logger = new _util_Logger__WEBPACK_IMPORTED_MODULE_22__.Logger(new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_5__.SettingsStorage().get('enableScriptLogger'), 'Trophies');
        this._psnId = psnId;
        this._showGeometricMeanRarity = true;
    }
    _appendListButton() {
        const listItem = new _features_lists_ListScraper__WEBPACK_IMPORTED_MODULE_0__.ListScraper(document).getFromTrophiesPage();
        const listStorage = new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_6__.ListStorage();
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div.game-image-holder')
            .after(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .setAttribute('style', 'text-align: center; border: 2px solid #e3e3e6; border-top: none; padding: 5px;')
            .append(new _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_4__.ListButton(listStorage, listItem), new ListInfo(listStorage, listItem)));
    }
    _getTrophyCountBox() {
        return _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#content.page > div.row > div.col-xs-4 > div.box.no-top-border')
            .find('div.trophy-count');
    }
    _getTotalTrophyCount() {
        const numberText = this._getTrophyCountBox().find('span.small-info.floatr').find('b').getText();
        return parseInt(numberText, 10);
    }
    _getCompletedTrophies() {
        const completedElements = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('tr.completed');
        let completed = 0;
        let points = 0;
        completedElements.forEach((el) => {
            const isSummary = el.clone().find('div.trophy-count').exists();
            if (isSummary)
                return;
            const isBronze = el.clone().find('img[title="Bronze"]').exists();
            const isSilver = el.clone().find('img[title="Silver"]').exists();
            const isGold = el.clone().find('img[title="Gold"]').exists();
            const isPlatinum = el.clone().find('img[title="Platinum"]').exists();
            if (isBronze)
                points += _util_constants__WEBPACK_IMPORTED_MODULE_14__.TROPHY_VALUES.BRONZE;
            if (isSilver)
                points += _util_constants__WEBPACK_IMPORTED_MODULE_14__.TROPHY_VALUES.SILVER;
            if (isGold)
                points += _util_constants__WEBPACK_IMPORTED_MODULE_14__.TROPHY_VALUES.GOLD;
            if (isPlatinum)
                points += _util_constants__WEBPACK_IMPORTED_MODULE_14__.TROPHY_VALUES.PLATINUM;
            completed++;
        });
        return {
            completed,
            points
        };
    }
    _appendCompareLink() {
        const myPsnId = (0,_util_user__WEBPACK_IMPORTED_MODULE_8__.getPsnId)();
        if (this._psnId == null || this._psnId === myPsnId) {
            return;
        }
        const currentUrl = location.origin + location.pathname;
        // NOTE: Check if currentUrl isn't compareUrl already
        const compareUrl = currentUrl.indexOf(',' + myPsnId) > -1
            ? currentUrl
            : currentUrl + ',' + myPsnId;
        const forumLink = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('ul.navigation > li > a', { equalsText: 'Forum' });
        const forumLinkParentPrevSibling = forumLink.parent().prev();
        forumLinkParentPrevSibling.after(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('li')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a').setAttribute('href', compareUrl).setText('Compare')));
    }
    _appendTrophiesAndPointsEarnedSoFar() {
        const totalTrophyCount = this._getTotalTrophyCount();
        const completedTrophies = this._getCompletedTrophies();
        if (completedTrophies.completed > 0 && completedTrophies.completed < totalTrophyCount) {
            this._getTrophyCountBox()
                .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                .addClass('small-info', 'floatr')
                .setAttribute('style', 'margin-top: 5px;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText(completedTrophies.completed.toString()), ' Trophies ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText(completedTrophies.points.toLocaleString('en-US')), ' Points')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Trophies and points earned so far')));
        }
    }
    _getAllTrophyRows() {
        return (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('#content.page > div.row > div.col-xs tr')
            .filter(e => e.clone().find('img[title="Platinum"], img[title="Gold"], img[title="Silver"], img[title="Bronze"]').exists());
    }
    _appendRarityBox() {
        const psnRarityElementIsVisible = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('td.hover-hide nobr img.icon-sprite.rarity').exists();
        if (psnRarityElementIsVisible) {
            return;
        }
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#rarity-box').remove();
        const rarityInfo = {
            ultraRare: (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.hover-hide nobr', { equalsText: 'Ultra Rare' }).length,
            veryRare: (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.hover-hide nobr', { equalsText: 'Very Rare' }).length,
            rare: (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.hover-hide nobr', { equalsText: 'Rare' }).length,
            uncommon: (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.hover-hide nobr', { equalsText: 'Uncommon' }).length,
            common: (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.hover-hide nobr', { equalsText: 'Common' }).length
        };
        const rarityBox = new RarityBox(rarityInfo, (type) => {
            const textMap = {
                'ultra-rare': 'Ultra Rare',
                'very-rare': 'Very Rare',
                'rare': 'Rare',
                'uncommon': 'Uncommon',
                'common': 'Common',
            };
            if (type === 'all') {
                this._getAllTrophyRows().forEach(e => e.show());
            }
            else {
                this._getAllTrophyRows().forEach(e => e.hide());
                (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.hover-hide nobr', { equalsText: textMap[type] }).forEach((e) => {
                    // big oof
                    e.parent().parent().parent().parent().show();
                });
            }
        });
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > div.row > div.col-xs-4 > div.box.no-top-border > table.zebra')
            .after(rarityBox);
    }
    _removeMetadataByAttribution() {
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('td', { containsText: 'Metadata by ' }).parent().remove();
    }
    _appendAverageRarity() {
        let target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('table.gameInfo.zebra > tbody');
        if (!target.exists()) {
            target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > div.row > div.col-xs-4 > div.box.no-top-border > table.zebra');
        }
        const textContainerId = 'psnpp-avg-rarity-text';
        const detailContainerId = 'psnpp-avg-rarity-detail';
        const rarityElements = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.hover-hide span.typo-top');
        const rarities = rarityElements
            .map((el) => parseFloat(el.getText().replace('%', '')))
            .sort((a, b) => a - b);
        const middle = Math.floor(rarities.length / 2);
        const median = rarities.length % 2 === 1
            ? rarities[middle]
            : (rarities[middle - 1] + rarities[middle]) / 2.0;
        const sum = rarities.reduce((prev, current) => prev + current, 0);
        const average = sum / rarities.length;
        const low = rarities[0];
        const high = rarities[rarities.length - 1];
        const mainText = `${average.toFixed(2)}% `;
        const detailText = `(${low.toFixed(2)}% / ${high.toFixed(2)}% / ${median.toFixed(2)}%)`;
        const textContainer = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#' + textContainerId);
        if (textContainer.exists()) {
            textContainer.setText(mainText);
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#' + detailContainerId).setText(detailText);
        }
        else {
            target.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').setText('Avg. Rarity'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                .setAttribute('id', textContainerId)
                .setText(mainText), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                .setAttribute('id', detailContainerId)
                .setAttribute('style', 'font-size: 11px;')
                .setText(detailText)
                .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'low / high / median')))));
        }
    }
    _appendGuideInfo() {
        const title = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('meta[name="Description"]').getAttribute('content').split(' • ')[0].replace(' Trophy List', '');
        let target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('table.gameInfo.zebra > tbody');
        if (!target.exists()) {
            target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > div.row > div.col-xs-4 > div.box.no-top-border > table.zebra');
        }
        const guides = new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_23__.GuideStorage().get();
        const guide = guides.data.list.games[this._trophyListId];
        if (guide == null) {
            target.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').setText('Guide'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
                .setAttribute('href', `/guides#advanced-search|q=${encodeURIComponent(title)}`)
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Advanced Guide Search'))
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-search')))));
            return;
        }
        const [difficulty, playthroughs, hours] = guide.r;
        const guideLink = (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.getGuideHref)(guide.a, guide.p);
        console.log('Guide', guide, (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasBuggyTrophies)(guide.a), (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasMissableTrophies)(guide.a), (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasOnlineTrophies)(guide.a));
        target.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').setText('Guide'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', guideLink.href)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
            .setText(`${difficulty}/10`)
            .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_24__.getDifficultyClass)(difficulty))
            .setAttribute('style', 'color: white; padding: 1px 2px; border-radius: 2px;')
            .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Difficulty')), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
            .setText(`${playthroughs}x`)
            .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_24__.getPlaythroughsClass)(playthroughs))
            .setAttribute('style', 'color: white; padding: 1px 2px; border-radius: 2px;')
            .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Playthroughs')), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
            .setText(`${hours}h`)
            .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_24__.getHoursClass)(hours))
            .setAttribute('style', 'color: white; padding: 1px 2px; border-radius: 2px;')
            .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Time')))
            .condition(guideLink.isExternal, (el) => {
            el.setAttribute('target', '_blank');
        })
            .condition((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasOnlineTrophies)(guide.a), el => {
            el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                .setAttribute('style', 'background: #3a87ad; color: white; padding: 1px 2px; border-radius: 2px;')
                .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Online'))
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-globe')));
        })
            .condition((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasBuggyTrophies)(guide.a), el => {
            el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                .setAttribute('style', 'background: #b94a48; color: white; padding: 1px 2px; border-radius: 2px;')
                .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Buggy'))
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-bug')));
        })
            .condition((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_25__.hasMissableTrophies)(guide.a), el => {
            el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                .setAttribute('style', 'background: #DD8301; color: white; padding: 1px 2px; border-radius: 2px;')
                .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Missable'))
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-exclamation-triangle')));
        }), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', `/guides#advanced-search|q=${encodeURIComponent(title)}`)
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Advanced Guide Search'))
            .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-search')))));
    }
    _appendSearchLinks() {
        const title = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('meta[name="Description"]').getAttribute('content').split(' • ')[0].replace(' Trophy List', '');
        let target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('table.gameInfo.zebra > tbody');
        if (!target.exists()) {
            target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > div.row > div.col-xs-4 > div.box.no-top-border > table.zebra');
        }
        const searchLinks = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_5__.SettingsStorage().get('trophyListSearchLinks');
        if (searchLinks.length === 0) {
            return;
        }
        const remapped = searchLinks.map(link => (0,_util_string__WEBPACK_IMPORTED_MODULE_27__.linkifyText)(link, {
            appendToLink: encodeURIComponent(title),
            targetBlank: true
        }));
        const container = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td');
        remapped.forEach((x, index) => {
            if (index > 0) {
                container.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('bullet').setText('•'), ' ');
            }
            container.append(...x);
        });
        target.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').setText('Search'), container));
    }
    _collectOtherPlatformsAndRegionsPathnames() {
        const heading = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('h3', { equalsText: 'Other Platforms and Regions' });
        if (!heading.exists()) {
            return [];
        }
        const tableContainer = heading
            .parent() // div
            .parent() // div
            .next(); // table
        const allLinkElements = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('span > a', {}, tableContainer.get());
        return allLinkElements
            .map(el => el.getAttribute('href'));
    }
    _appendPrices() {
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_5__.SettingsStorage().get('platPricesIntegration')
            || new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_7__.ScriptStateStorage().isPlatPricesCooldownActive()) {
            return;
        }
        let target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('table.gameInfo.zebra > tbody');
        if (!target.exists()) {
            target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > div.row > div.col-xs-4 > div.box.no-top-border > table.zebra');
        }
        const otherPlatformsAndRegionsIdentifiers = this._collectOtherPlatformsAndRegionsPathnames();
        const trophyListIdentifiers = [
            (0,_util_url__WEBPACK_IMPORTED_MODULE_9__.getPathSegmentsFromPathname)(window.location.pathname)[1],
            ...otherPlatformsAndRegionsIdentifiers.map(x => (0,_util_url__WEBPACK_IMPORTED_MODULE_9__.getPathSegmentsFromPathname)(x)[1])
        ];
        const priceStorage = new _features_plat_prices_PlatPricesStorage__WEBPACK_IMPORTED_MODULE_1__.PlatPricesStorage();
        priceStorage.getById(this._trophyListId, trophyListIdentifiers)
            .then(price => {
            const priceRow = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr');
            const basePriceSpan = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span');
            const priceRowStrings = [
                basePriceSpan.setText(price.formattedBasePrice).apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Standard price'))
            ];
            if (price.formattedSalePrice !== price.formattedBasePrice) {
                priceRowStrings.push(' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText(price.formattedSalePrice).apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Sale price')));
                basePriceSpan.setCss('textDecoration', 'line-through');
                priceRow.setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_LIGHT_YELLOW);
            }
            if (price.formattedPlusPrice !== price.formattedBasePrice && price.formattedPlusPrice !== price.formattedSalePrice) {
                priceRowStrings.push(' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText(price.formattedPlusPrice).apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'PS+ price')));
                basePriceSpan.setCss('textDecoration', 'line-through');
                priceRow.setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_LIGHT_YELLOW);
            }
            target.append(priceRow.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').setText('Price'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').append(...priceRowStrings)), price.PSPExtra === '1' || price.PSPPremium === '1'
                ? _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('img')
                    .setAttribute('src', '/lib/img/icons/ps-plus.png')
                    .setAttribute('width', '15')), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td')
                    .append('Available on ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b')
                    .setCss('borderRadius', '2px')
                    .setCss('padding', '1px 2px')
                    .setCss('backgroundColor', price.PSPExtra === '1' ? '#f0c117' : 'black')
                    .setCss('color', price.PSPExtra === '1' ? 'black' : '#f0c117')
                    .setText(price.PSPExtra === '1' ? 'Extra' : 'Premium')))
                : null, _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').setText('Store'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
                .setAttribute('href', price.PSStoreURL)
                .setAttribute('target', '_blank')
                .setText('PSN'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
                .setAttribute('href', price.PlatPricesURL)
                .setAttribute('target', '_blank')
                .setText('PlatPrices'))));
        })
            .catch(e => {
            this._logger.warn(e);
            // Invalid key -> disable integration
            if (e.getErrorCode() === _features_plat_prices_PlatPricesAPI__WEBPACK_IMPORTED_MODULE_10__.IPlatPricesError.UNAUTHORIZED) {
                new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_5__.SettingsStorage().disablePlatPricesIntegration();
            }
            // API limit reached -> set global cooldown
            if (e.getErrorCode() === _features_plat_prices_PlatPricesAPI__WEBPACK_IMPORTED_MODULE_10__.IPlatPricesError.FORBIDDEN) {
                new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_7__.ScriptStateStorage().set('platPricesCooldownTriggerTime', Date.now());
            }
            target.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr').append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').setText('Price'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td').append(e.getNiceErrorMessage())));
        });
    }
    _buildForumHeader() {
        const forumLink = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('.title-bar').find('a', { equalsText: 'Forum' }).getAttribute('href');
        const forumHeader = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('h3').setText('Recent Forum Posts');
        const forumHeaderContainer = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('title', 'flex', 'v-align')
            .setAttribute('style', 'margin-top: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('grow')
            .append(forumHeader), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('no-shrink')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', forumLink)
            .setText('More')));
        const emptyTable = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('table')
            .addClass('box', 'zebra', 'no-top-border')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tbody')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('center')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span').setText('Forum for this stack is empty'))))));
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('h3', { equalsText: 'Other Platforms and Regions' })
            .parent()
            .parent()
            .before(forumHeaderContainer, emptyTable);
        return forumHeader;
    }
    _appendForumLoaderButton() {
        const alreadyAdded = new Set();
        const otherStacks = this._collectOtherPlatformsAndRegionsPathnames().reverse();
        if (otherStacks.length === 0) {
            return;
        }
        let forumHeader = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('h3', { equalsText: 'Recent Forum Posts' });
        if (!forumHeader.exists()) {
            forumHeader = this._buildForumHeader();
        }
        else {
            const currentForumPosts = forumHeader.clone().parent().parent().next().getInnerHtml();
            alreadyAdded.add(currentForumPosts);
        }
        const target = forumHeader.clone().parent().parent().next();
        let clicked = false;
        forumHeader
            .parent()
            .after(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('no-shrink')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', '#')
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'Load forum posts from other stacks'))
            .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-comments-o'))
            .click(async (e, el) => {
            e.preventDefault();
            if (clicked) {
                return;
            }
            clicked = true;
            el.clone()
                .find('i')
                .removeClass('fa-comments-o')
                .addClass('fa-spinner', 'fa-spin', 'fa-fw');
            try {
                let firstAppended = false;
                for (let i = 0; i < otherStacks.length; i++) {
                    const trophyListDoc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_21__.fetchDocument)(otherStacks[i]);
                    const forumPostsTitle = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('h3', { equalsText: 'Recent Forum Posts' }, trophyListDoc);
                    if (!forumPostsTitle.exists()) {
                        continue;
                    }
                    const toAppend = forumPostsTitle.parent().parent().next().getInnerHtml();
                    if (alreadyAdded.has(toAppend)) {
                        continue;
                    }
                    else {
                        alreadyAdded.add(toAppend);
                    }
                    target
                        .addClass('no-bottom-border')
                        .after(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('table')
                        .addClass('box', 'zebra')
                        .condition(firstAppended, (el) => el.addClass('no-bottom-border'))
                        .setAttribute('style', 'border-top-color: darkgrey;')
                        .setInnerHtml(toAppend));
                    firstAppended = true;
                }
            }
            catch (e) {
                const typedE = e;
                alert('Failed to load forum posts: ' + typedE.message);
                this._logger.error('Failed to load error posts', typedE);
            }
            el.parent().remove();
            // NOTE: Need to manually hide tiptip, otherwise it stays visible
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#tiptip_holder').hide();
        })));
    }
    _recalculateUnobtainableTrophiesToReport() {
        const trophyList = new _features_lists_ListScraper__WEBPACK_IMPORTED_MODULE_0__.ListScraper(document).getFromTrophiesPage();
        const platforms = (0,_features_lists_platforms__WEBPACK_IMPORTED_MODULE_12__.mapPlatforms)(trophyList.platforms);
        const allCheckedTrophies = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('input[name="unobtainable-trophies"]:checked');
        const allTrophiesAreChecked = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('input[name="unobtainable-trophies"]').length === allCheckedTrophies.length;
        const trophies = [];
        if (allTrophiesAreChecked) {
            trophies.push(0);
        }
        else {
            allCheckedTrophies
                .map(el => {
                const row = el.parent().parent().parent().parent(); // oof
                const trophyPath = row.clone().find('a.title').getAttribute('href');
                const trophyId = [...trophyPath.matchAll(/\/([0-9]+)-/g)][1][1];
                return { path: trophyPath, id: parseInt(trophyId, 10) };
            })
                .sort((a, b) => a.id - b.id)
                .forEach(x => {
                trophies.push(x.id);
            });
        }
        const note = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-note').getValue().trim();
        const newReport = {
            title: trophyList.title,
            platforms: Object.values(platforms),
            region: trophyList.region,
            submitter: (0,_util_user__WEBPACK_IMPORTED_MODULE_8__.getPsnId)(),
            note,
            trophies,
            timestamp: Date.now()
        };
        const prefix = `"${trophyList.id}": `;
        const postfix = ',';
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-textarea')
            .setValue(prefix + JSON.stringify(newReport, null, 2) + postfix);
    }
    async _appendComparePlusBox() {
        const url = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('meta[property="og:url"]').getAttribute('content');
        const target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > div.row > div.col-xs-4.col-xs-max-320');
        const value = await new _features_compare_plus_ComparePlusStorage__WEBPACK_IMPORTED_MODULE_18__.ComparePlusStorage().getByTrophyListId(this._trophyListId);
        target
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('title', 'flex', 'v-align')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('h3')
            .addClass('grow')
            .setText('Compare+')), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('table')
            .addClass('box', 'zebra')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tbody')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td')
            .setAttribute('style', 'padding-right: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .setAttribute('style', 'text-align: justify; margin-bottom: 8px;')
            .setText('Playing this game in co-op or side-by-side with your friends? Enter PSN IDs of up to 4 players in the text box below (including your own and separated with comma) to see better comparison.'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('form')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('label')
            .addClass('input')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('input')
            .setAttribute('type', 'text')
            .setAttribute('id', 'psnpp-compare-plus-psnids')
            .setValue(value), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('i')), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', '#')
            .setAttribute('style', 'margin-top: 5px;')
            .addClass('button', 'green')
            .setText('Show')
            .click((e) => {
            e.preventDefault();
            const value = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-compare-plus-psnids')
                .getValue();
            const psnIds = value
                .split(',')
                .map((x) => x.trim())
                .filter((x) => x !== '');
            if (psnIds.length < 2) {
                alert('You need to enter at least 2 PSN IDs.');
                return;
            }
            if (psnIds.length > 4) {
                alert('You can enter maximum of 4 PSN IDs.');
                return;
            }
            new _features_compare_plus_ComparePlusStorage__WEBPACK_IMPORTED_MODULE_18__.ComparePlusStorage().set(this._trophyListId, value);
            location.href =
                url +
                    '/' +
                    psnIds[0] +
                    ',' +
                    psnIds[1] +
                    _util_constants__WEBPACK_IMPORTED_MODULE_14__.HASH_COMPARE_PLUS +
                    '?psnId=' +
                    psnIds.join('&psnId=');
        })))))));
    }
    _appendCreateUnobtainablesReport() {
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#flagUserLink').click(() => {
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies').remove();
        });
        const target = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > div.row > div.col-xs-4.col-xs-max-320');
        target.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('table')
            .addClass('zebra', 'box')
            .setAttribute('style', 'margin-top: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tbody')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('tr')
            .setAttribute('id', 'psnpp-report-unobtainable-trophies')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td')
            .setAttribute('colspan', '2')
            .setAttribute('style', 'padding: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('center')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('style', `color: ${_util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_DARK_ORANGE}; font-weight: 500;`)
            .setAttribute('href', '#')
            .setText('Report unobtainable trophies')
            .click((e) => {
            e.preventDefault();
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-form').show();
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div.flag-user').parent().parent().remove();
            (0,_util_fetch__WEBPACK_IMPORTED_MODULE_21__.fetchJson)(_util_constants__WEBPACK_IMPORTED_MODULE_14__.LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST_FULL)
                .then(result => {
                var _a;
                const details = result.list[this._trophyListId];
                if (details == null) {
                    return;
                }
                const value = (_a = details.note) !== null && _a !== void 0 ? _a : '';
                _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-note').setValue(value);
                _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-note-length').setText(value.length + '/' + _util_constants__WEBPACK_IMPORTED_MODULE_14__.UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN);
                this._recalculateUnobtainableTrophiesToReport();
            })
                .catch(e => {
                alert('Failed to preload note in the report.');
                this._logger.error('Failed to preload note in the report.', e);
            });
            (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.check.form').forEach(td => {
                td.clone().find('span.separator').remove();
                const isAlreadyMarked = td.clone().parent().find('picture.unobtainable').exists();
                const isPlatinum = td.clone().parent().find('img[title="Platinum"]').exists();
                const isPlatinumGroup = !td.clone().parent().parent().parent().parent().prev().find('h3').getText().startsWith('DLC Trophy Pack');
                td
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                    .addClass('separator', 'left')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('label')
                    .addClass('checkbox')
                    .condition(isPlatinum, el => el.setAttribute('style', 'cursor: not-allowed;'))
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('input')
                    .setAttribute('name', 'unobtainable-trophies')
                    .setAttribute('type', 'checkbox')
                    .condition(isPlatinum, (el) => el
                    .setAttribute('disabled', 'disabled')
                    .setAttribute('id', 'psnpp-report-unobtainable-trophies-platinum-trophy'))
                    .condition(!isPlatinum && isPlatinumGroup, (el) => el.setAttribute('data-group', 'psnpp-platinum-group'))
                    .condition(isAlreadyMarked, (el) => el.setAttribute('checked', 'checked'))
                    .click(() => {
                    const platinumShouldBeChecked = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('input[data-group="psnpp-platinum-group"]:checked').length > 0;
                    if (platinumShouldBeChecked) {
                        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-platinum-trophy').setAttribute('checked', 'checked');
                    }
                    else {
                        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-platinum-trophy').removeAttribute('checked');
                    }
                    this._recalculateUnobtainableTrophiesToReport();
                }), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('i'), '\u00A0')));
                td.show();
            });
            this._recalculateUnobtainableTrophiesToReport();
        })))), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .setAttribute('id', 'psnpp-report-unobtainable-trophies-form')
            .setAttribute('style', 'display: none; margin-top: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('row', 'form')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('col-xs-12')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('label')
            .addClass('input')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('label')
            .addClass('textarea')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('textarea')
            .setAttribute('id', 'psnpp-report-unobtainable-trophies-note')
            .setAttribute('style', 'margin-bottom: 5px;')
            .setAttribute('type', 'text')
            .setAttribute('placeholder', 'Note (required)')
            .apply(e => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(e, 'Required. Clickable links can be included as: [text](URL)'))
            .keyup((ev, el) => {
            const value = el.getValue();
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-note-length').setText(value.length + '/' + _util_constants__WEBPACK_IMPORTED_MODULE_14__.UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN);
            if (value.length < 1 || value.length > _util_constants__WEBPACK_IMPORTED_MODULE_14__.UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN) {
                el.setCss('borderColor', '#ffb6c1');
            }
            else {
                el.setCss('borderColor', '#e3e3e6');
            }
            this._recalculateUnobtainableTrophiesToReport();
        }), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
            .setAttribute('id', 'psnpp-report-unobtainable-trophies-note-length')
            .addClass('small-info')
            .setText('0/' + _util_constants__WEBPACK_IMPORTED_MODULE_14__.UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN))), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('label')
            .addClass('textarea')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('textarea')
            .setAttribute('id', 'psnpp-report-unobtainable-trophies-textarea')
            .setAttribute('readonly', 'readonly')
            .setAttribute('wrap', 'off')
            .setAttribute('style', 'width: 100%; height: 200px; font-family: monospace; margin-top: 10px;')), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('center')
            .setAttribute('style', 'padding-top: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setAttribute('style', 'display: inline-block;')
            .setText('Copy')
            .click(async (e, el) => {
            e.preventDefault();
            const noteLength = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-note').getValue().trim().length;
            if (noteLength === 0) {
                alert('Note cannot be empty.');
                return;
            }
            if (noteLength > _util_constants__WEBPACK_IMPORTED_MODULE_14__.UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN) {
                alert(`Note cannot be longer than ${_util_constants__WEBPACK_IMPORTED_MODULE_14__.UNOBTAINABLE_TROPHIES_REPORT_NOTE_MAXLEN} characters.`);
                return;
            }
            const numberOfCheckedTrophies = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('input[name="unobtainable-trophies"]:checked').length;
            if (numberOfCheckedTrophies === 0) {
                alert('Your report does not contain any trophies. Please check the checkbox next to each unobtainable trophy.');
                return;
            }
            const stringToCopy = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-report-unobtainable-trophies-textarea').getValue();
            try {
                await navigator.clipboard.writeText(stringToCopy);
                el.setText('Copied!');
                setTimeout(() => el.setText('Copy'), 1000);
            }
            catch (e) {
                alert('Copying to clipboard failed. Select the text and press Ctrl+C or update your browser. 😅');
                this._logger.error('Copy error', e);
            }
        }), ' and ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', 'https://forum.psnprofiles.com/topic/118915-psnp-unobtainable-trophies-master-list/')
            .setAttribute('target', '_blank')
            .setText('report here'))))))))));
    }
    _updateSeriesLink() {
        if (this._psnId == null) {
            return;
        }
        (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('a.series-info').forEach(seriesInfoBox => {
            const currentUrl = seriesInfoBox.getAttribute('href');
            seriesInfoBox.setAttribute('href', `${currentUrl}/${this._psnId}`);
        });
    }
    _modifyRecentPlayers() {
        const { url } = new _features_lists_ListScraper__WEBPACK_IMPORTED_MODULE_0__.ListScraper(document).getFromTrophiesPage();
        const recentPlayersHeader = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('h3', { equalsText: 'Recent Players' });
        if (!recentPlayersHeader.exists()) {
            return;
        }
        const tableBelow = recentPlayersHeader.parent().parent().next();
        const allRecentPlayers = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('a.small-title', {}, tableBelow.get());
        allRecentPlayers.forEach(player => {
            const currentUrl = player.getAttribute('href');
            player.setAttribute('href', url + currentUrl);
        });
    }
    _recalcDlcRarities() {
        function getRarityType(rarity) {
            if (rarity <= 5) {
                return 'Ultra Rare';
            }
            if (rarity <= 10) {
                return 'Very Rare';
            }
            if (rarity <= 20) {
                return 'Rare';
            }
            if (rarity <= 50) {
                return 'Uncommon';
            }
            return 'Common';
        }
        const gameOwnersText = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('span', { equalsText: 'Game Owners' }).parent().getText()
            .replace('Game Owners', '')
            .replace(/,/g, '');
        const gameOwners = parseInt(gameOwnersText, 10);
        const allDlcHeaders = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('div[id^="DLC-"]');
        // For each DLC
        allDlcHeaders.forEach(dlcHeader => {
            const dlcTable = dlcHeader.clone().next();
            const dlcOwnersText = dlcTable.clone().find('span.typo-top').getText().replace(/,/g, '');
            const dlcOwners = parseInt(dlcOwnersText, 10);
            // Process each trophy
            (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td.hover-hide span.rarity', {}, dlcTable.get()).forEach(raritySpan => {
                const pctSpan = raritySpan.clone().find('span.typo-top');
                const rarityText = pctSpan.getText().replace('%', '');
                const rarityValue = parseFloat(rarityText) / 100;
                const newValue = (Math.sqrt(gameOwners * dlcOwners) * rarityValue) / gameOwners * 100;
                const newValueText = newValue.toFixed(2) + '%';
                raritySpan.setAttribute('data-rarity', newValueText);
                raritySpan.setAttribute('data-rarity-type', getRarityType(newValue));
            });
        });
    }
    _swapDlcRarities() {
        (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('span[data-rarity]').forEach(raritySpan => {
            const typoTop = raritySpan.clone().find('span.typo-top');
            const typoBottom = raritySpan.clone().find('span.typo-bottom nobr');
            const toSwapRarity = raritySpan.getAttribute('data-rarity');
            const toSwapRarityType = raritySpan.getAttribute('data-rarity-type');
            const toStoreRarity = typoTop.getText();
            const toStoreRarityType = typoBottom.getText();
            typoTop.setText(toSwapRarity);
            typoBottom.setText(toSwapRarityType);
            raritySpan.setAttribute('data-rarity', toStoreRarity);
            raritySpan.setAttribute('data-rarity-type', toStoreRarityType);
        });
    }
    _checkShutdown() {
        const shutdownsStorage = new _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_28__.ShutdownsStorage();
        const shutdown = shutdownsStorage.getByTrophyListId(this._trophyListId);
        if (shutdown == null) {
            return;
        }
        this._logger.debug('Found shutdown for trophy list:', this._trophyListId, shutdown);
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > .row > .col-xs').prepend(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('box', 'information', 'center')
            .setAttribute('style', 'padding: 10px; font-size: 15px; line-height: 15px; margin-bottom: 10px;')
            .setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_LIGHT_YELLOW)
            .setCss('border', `2px solid ${_util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_DARK_YELLOW}`)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText('SHUTDOWN NOTICE: '), `The online servers for this game are scheduled to be shut down on ${(0,_util_date__WEBPACK_IMPORTED_MODULE_19__.getUtcLocaleDateString)(shutdown.shutdownTimestamp)}.`)
            .condition(shutdown.note != '', el => el.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), 'Note: ', ...(0,_util_string__WEBPACK_IMPORTED_MODULE_27__.linkifyText)(shutdown.note))));
    }
    _markUnobtainableTrophies() {
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_5__.SettingsStorage().get('markUnobtainableTrophies')) {
            return;
        }
        const utStorage = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_11__.UnobtainableTrophiesStorage();
        const unobtainableTrophies = utStorage.getByTrophyListId(this._trophyListId);
        if (unobtainableTrophies == null) {
            return;
        }
        let showDetails = false;
        let detailsLoaded = false;
        const detailsContainer = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .setAttribute('id', 'psnpp-unobtainable-trophies-details-container')
            .setAttribute('style', 'text-align: left; font-size: 13px;')
            .hide();
        const unobtainablesToggle = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', '#')
            .setAttribute('target', '_blank')
            .setText('Show details')
            .click((e, el) => {
            e.preventDefault();
            showDetails = !showDetails;
            if (showDetails) {
                el.setText('Hide details');
                this._getAllTrophyRows()
                    .forEach(row => {
                    const isUnobtainable = row.clone().find('picture.unobtainable').exists();
                    if (!isUnobtainable) {
                        row.addClass('psnpp-hide');
                    }
                });
                if (!detailsLoaded) {
                    detailsLoaded = true;
                    detailsContainer
                        .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('i')
                        .addClass('fa', 'fa-spinner', 'fa-spin', 'fa-fw')
                        .setAttribute('aria-hidden', 'true'));
                    (0,_util_fetch__WEBPACK_IMPORTED_MODULE_21__.fetchJson)(_util_constants__WEBPACK_IMPORTED_MODULE_14__.LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST_FULL)
                        .then(result => {
                        detailsContainer.empty();
                        const details = result.list[this._trophyListId];
                        if (details == null) {
                            detailsContainer
                                .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span').setText('Details not found. PSNP+ is most likely showing outdated information which will disappear in the next 24 hours.'));
                            return;
                        }
                        detailsContainer
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText('Submitted by:'), ' ', details.submitter == null ? '-' : _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a').setAttribute('href', '/' + details.submitter).setText(details.submitter), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText('Report date:'), ' ', details.timestamp == null ? '-' : new Date(details.timestamp).toLocaleDateString(), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText('Note:'), ' ');
                        if (details.note == null) {
                            detailsContainer.append('-');
                        }
                        else {
                            detailsContainer.append(...(0,_util_string__WEBPACK_IMPORTED_MODULE_27__.linkifyText)(details.note));
                        }
                        detailsContainer
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
                            .setAttribute('href', '/games' + _util_constants__WEBPACK_IMPORTED_MODULE_14__.HASH_UNOBTAINABLES)
                            .setText('[ All games with unobtainable trophies ]'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
                            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_14__.LINK_UNOBTAINABLE_TROPHIES_THREAD)
                            .setAttribute('target', '_blank')
                            .setText('[ You can report outdated information in our forum thread ]'));
                    })
                        .catch(e => {
                        alert('Failed to load details: ' + e.message);
                    });
                }
                detailsContainer.show();
            }
            else {
                el.setText('Show details');
                detailsContainer.hide();
                (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('div.col-xs table.zebra tr').forEach(row => row.removeClass('psnpp-hide'));
            }
        });
        const progressInfo = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div');
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#content > .row > .col-xs').prepend(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .addClass('box', 'information', 'center')
            .setAttribute('style', 'padding: 10px; font-size: 15px; line-height: 15px; margin-bottom: 10px;')
            .setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_LIGHT_ORANGE)
            .setCss('border', `2px solid ${_util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_DARK_ORANGE}`)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b').setText('WARNING: '), (0,_features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_13__.getUnobtainableTrophiesDescription)(unobtainableTrophies), ' ', _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('bullet').setText('•'), ' ', unobtainablesToggle, progressInfo, detailsContainer));
        const allValidRows = (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('#content.page > div.row > div.col-xs tr')
            .filter(e => {
            const hasTrophyImage = e.clone().find('img[title="Platinum"],img[title="Gold"],img[title="Silver"],img[title="Bronze"],img[title="Secret"]').exists();
            return hasTrophyImage;
        });
        let obtainedUnobtainables = 0;
        let unobtainableTrophiesCount = 0;
        allValidRows.forEach(row => {
            const isPlatinum = row.clone().find('img[title="Platinum"]').exists();
            const trophyId = parseInt(row.clone().find('a').getAttribute('href').split('/')[3].split('-')[0], 10);
            if (unobtainableTrophies.indexOf(trophyId) > -1 || unobtainableTrophies[0] === 0) {
                if (!isPlatinum)
                    unobtainableTrophiesCount++;
                const isCompleted = row.hasClass('completed');
                if (isCompleted && !isPlatinum) {
                    obtainedUnobtainables++;
                }
                row.clone().find('picture').setCss('borderColor', _util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_DARK_ORANGE).addClass('unobtainable');
                if (!isCompleted) {
                    (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('td', {}, row.get()).forEach(td => td.setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_14__.COLOR_LIGHT_ORANGE));
                }
            }
        });
        const overallProgress = parseInt(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div.progress-bar').find('span').getText(), 10);
        const inProgress = overallProgress > 0 && overallProgress < 100;
        if (inProgress) {
            console.log('obtainedUnobtainables', obtainedUnobtainables, unobtainableTrophiesCount);
            const completeable = obtainedUnobtainables === unobtainableTrophiesCount;
            if (completeable) {
                progressInfo.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
                    .setAttribute('style', 'font-size: 12px; color: darkgreen; background: lightgreen; border: 1px solid darkgreen; border-radius: 2px; padding: 2px 4px; margin: 2px 0; display: inline-block;')
                    .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-check'), ' 100% can be obtained'));
            }
            else {
                progressInfo.append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
                    .setAttribute('style', 'font-size: 12px; color: darkred; background: #ffcccb; border: 1px solid darkred; border-radius: 2px; padding: 2px 4px; margin: 2px 0; display: inline-block;')
                    .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_26__.Icon('fa-times'), ' 100% cannot be obtained'));
            }
        }
    }
    _refreshListItem() {
        const newScrape = new _features_lists_ListScraper__WEBPACK_IMPORTED_MODULE_0__.ListScraper(document).getFromTrophiesPage();
        const refreshed = new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_6__.ListStorage().refreshGame(newScrape);
        if (refreshed) {
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div.game-image-holder')
                .after(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
                .setAttribute('style', 'background: #ecf8ea; color: #61bf19; text-align: center; border: 2px solid #e3e3e6; padding: 5px;')
                .setText('List data has been refreshed')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_20__.tooltip)(el, 'PSNP+ automatically refreshes data (such as platinum rate, guide availability, etc.) every time you visit a trophy list that is included in any of your game lists.')));
        }
    }
    _insertMenu() {
        const psnRarityElementIsVisible = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('td.hover-hide nobr img.icon-sprite.rarity').exists();
        const atLeastOneDlcExists = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div#DLC-1').exists();
        const shouldAppendDlcRaritiesButton = !psnRarityElementIsVisible && atLeastOneDlcExists;
        const psnIdToUse = this._psnId == null
            ? (0,_util_user__WEBPACK_IMPORTED_MODULE_8__.getPsnId)()
            : this._psnId;
        const toggleDlcRaritiesButton = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setAttribute('style', 'margin-top: 5px;')
            .setText('🔴 Global DLC rarities')
            .click((e) => {
            e.preventDefault();
            this._showGeometricMeanRarity = !this._showGeometricMeanRarity;
            if (this._showGeometricMeanRarity) {
                toggleDlcRaritiesButton.setText('🔴 Global DLC rarities');
            }
            else {
                toggleDlcRaritiesButton.setText('🟢 Global DLC rarities');
            }
            this._swapDlcRarities();
            this._appendRarityBox();
            this._appendAverageRarity();
        });
        const refreshProgressButton = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setText('Refresh progress')
            .setAttribute('href', (0,_util_user__WEBPACK_IMPORTED_MODULE_8__.getUpdateProfileRedirectPathname)(psnIdToUse, location.pathname));
        const menuWrapper = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .append(refreshProgressButton, shouldAppendDlcRaritiesButton ? _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br') : null, shouldAppendDlcRaritiesButton ? toggleDlcRaritiesButton : null);
        const floatingMenu = new _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_2__.FloatingMenu(menuWrapper);
        floatingMenu.insert();
    }
    _isCompareMode() {
        return _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('meta[property="og:title"]').getAttribute('content').startsWith('Comparing ');
    }
    _isComparePlusMode() {
        return location.hash.startsWith(_util_constants__WEBPACK_IMPORTED_MODULE_14__.HASH_COMPARE_PLUS);
    }
    async _startComparePlus() {
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('div.col-xs-4.col-xs-max-320').remove();
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#content div.button-bar.flex').remove();
        const trophyListUrl = _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('meta[property="og:url"]').getAttribute('content');
        const urlParams = (0,_util_url__WEBPACK_IMPORTED_MODULE_9__.getSearchParamsFromHash)();
        const psnIds = urlParams.getAll('psnId').slice(0, 4);
        _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#content div.col-xs').prepend(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('div')
            .setAttribute('style', 'display: block; text-align: center; font-size: 20px; margin-bottom: 10px;')
            .setAttribute('id', 'psnpp-compare-plus-loading')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('h3').setText('[Compare+] Loading... (0 / ' + psnIds.length + ')')));
        const results = [];
        for (const [index, psnId] of psnIds.entries()) {
            const url = trophyListUrl + '/' + psnId + '?order=psn';
            const result = await _features_compare_plus_TrophyListProgressScraper__WEBPACK_IMPORTED_MODULE_15__.TrophyListProgressScraper.getFromUrl(url, true);
            if (result != null) {
                results.push(result);
            }
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-compare-plus-loading h3').setText('[Compare+] Loading... (' + (index + 1) + ' / ' + psnIds.length + ')');
            if (index + 1 < psnIds.length) {
                await (0,_util_promise__WEBPACK_IMPORTED_MODULE_16__.sleep)(1000);
            }
        }
        if (results.length < 2) {
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-compare-plus-loading h3').setText('[Compare+] Unable to load player data.');
        }
        else {
            _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#psnpp-compare-plus-loading').remove();
        }
        // Progress boxes
        results.forEach((res, index) => {
            if (index <= 1) {
                _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#content table.box', { eq: index }).find('a.title').setAttribute('href', res.url + '/' + res.username);
            }
            else {
                _util_J__WEBPACK_IMPORTED_MODULE_3__.J.q('#content table.box', { eq: index - 1 }).after(new _features_compare_plus_ProgressBox__WEBPACK_IMPORTED_MODULE_17__.ProgressBox(res));
            }
        });
        (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('div.box.no-top-border').forEach((subList, index) => {
            const table = results[0].dlcCount === 0
                ? subList.clone().find('table.zebra')
                : index === 0
                    ? subList.clone().find('table.zebra', { eq: 2 })
                    : subList.clone().find('table.zebra', { eq: 1 });
            const playerRow = results[0].dlcCount === 0
                ? table.clone().find('tr')
                : table.clone().find('tr', { eq: 1 });
            playerRow
                .append(...results.filter((_res, index) => index > 1).map(res => {
                return _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td')
                    .addClass('center')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                    .addClass('separator', 'left')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
                    .setAttribute('href', '/' + res.username)
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('img')
                    .addClass('trophy', 'md')
                    .setAttribute('style', 'margin-bottom: 5px;')
                    .setAttribute('src', res.avatar)), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('nobr')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('a')
                    .addClass('title')
                    .setAttribute('href', '/' + res.username)
                    .setText(res.username))));
            }));
            (0,_util_J__WEBPACK_IMPORTED_MODULE_3__.all)('tr', {}, subList.get()).slice(results[0].dlcCount === 0 ? 1 : 3).forEach(row => {
                const trophyPath = row.clone().find('a.title').getAttribute('href');
                const trophyId = parseInt([...trophyPath.matchAll(/\/([0-9]+)-/g)][1][1], 10);
                const trophyIndex = trophyId - 1;
                row.clone().find('td', { eq: 5 }).remove();
                row.clone().find('td', { eq: 4 }).remove();
                row
                    .append(...results.map(res => {
                    const currentTrophy = res.trophies[trophyIndex];
                    return _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('td')
                        .append(currentTrophy.completed
                        ? _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                            .addClass('separator', 'left')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('img')
                            .setAttribute('alt', 'earned')
                            .setAttribute('title', currentTrophy.trophyGrade)
                            .setAttribute('src', `/lib/img/icons/40-${currentTrophy.trophyGrade}.png`), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('small')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('center')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                            .addClass('typo-top-date')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('nobr')
                            .append(...(0,_util_date__WEBPACK_IMPORTED_MODULE_19__.formatStringToSupDate)(currentTrophy.date))), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                            .addClass('typo-bottom-date')
                            .append(_util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('nobr')
                            .setText(currentTrophy.time))))))
                        : _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('span')
                            .addClass('separator', 'left')
                            .append(currentTrophy.progress !== ''
                            ? _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('b')
                                .setAttribute('style', 'font-size: 18px;')
                                .setText(currentTrophy.progress)
                            : _util_J__WEBPACK_IMPORTED_MODULE_3__.J.c('img')
                                .setAttribute('alt', 'unearned')
                                .setAttribute('src', '/lib/img/icons/40-lock.png')));
                }));
            });
        });
    }
    _switchHoursTo24HourFormat() {
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_5__.SettingsStorage().get('use24HourTimeFormat')) {
            return;
        }
        (0,_util_date__WEBPACK_IMPORTED_MODULE_19__.switchHoursTo24HourFormat)();
    }
    async run() {
        this._logger.debug('Running');
        if (this._isCompareMode()) {
            if (this._isComparePlusMode()) {
                this._startComparePlus();
            }
            return;
        }
        this._switchHoursTo24HourFormat();
        this._removeMetadataByAttribution();
        this._appendCompareLink();
        this._appendListButton();
        this._appendTrophiesAndPointsEarnedSoFar();
        this._appendRarityBox();
        // Sidebar
        this._appendAverageRarity();
        this._appendGuideInfo();
        this._appendSearchLinks();
        this._appendPrices();
        this._appendForumLoaderButton();
        this._markUnobtainableTrophies();
        this._checkShutdown();
        await this._appendComparePlusBox();
        this._appendCreateUnobtainablesReport();
        this._updateSeriesLink();
        this._modifyRecentPlayers();
        this._refreshListItem();
        this._recalcDlcRarities();
        this._insertMenu();
    }
}


/***/ }),
/* 84 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ProgressBox": () => (/* binding */ ProgressBox)
/* harmony export */ });
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);


class ProgressBox extends _util_J__WEBPACK_IMPORTED_MODULE_1__.JC {
    constructor(trophyListProgress) {
        super('table');
        this._progress = trophyListProgress;
        this._build();
    }
    _build() {
        this
            .addClass('box')
            .setAttribute('style', 'margin-bottom: 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tbody')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
            .condition(this._progress.trophies.some(t => t.trophyGrade === 'platinum' && t.completed), el => el.addClass('platinum'))
            .condition(!this._progress.trophies.some(t => t.trophyGrade === 'platinum') && this._progress.trophies.every(t => t.completed), el => el.addClass('completed'))
            .append(
        // 1
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '/' + this._progress.username)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('img')
            .addClass('trophy')
            .setAttribute('src', this._progress.avatar))), 
        // 2
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .setAttribute('style', 'width: 100%;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .addClass('title')
            .setAttribute('href', this._progress.url + '/' + this._progress.username)
            .setAttribute('rel', 'nofollow')
            .setText(this._progress.username), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('small-info')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('b')
            .setText(this._progress.trophies.filter(x => x.completed).length.toString()), ' of ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('b')
            .setText(this._progress.trophies.length.toString()), ' Trophies', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), ...(0,_util_date__WEBPACK_IMPORTED_MODULE_0__.formatStringToSupDate)(this._progress.lastActive))), 
        // 3
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('center')
            .setAttribute('style', 'padding: 0 10px; border-right: 1px solid #dddddd;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('game-rank', this._progress.rank)
            .setText(this._progress.rank), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('typo-bottom')
            .setText('RANK'))), 
        // 4
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('separator')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('img')
            .setAttribute('width', '21')
            .condition(this._progress.trophies.some(x => x.trophyGrade === 'platinum'), el => {
            el.setAttribute('src', `/lib/img/icons/platinum-icon${this._progress.trophies.some(t => t.trophyGrade === 'platinum' && t.completed) ? '' : '-off'}.png`);
        })
            .condition(!this._progress.trophies.some(x => x.trophyGrade === 'platinum'), el => {
            el.setAttribute('src', `/lib/img/icons/complete-icon${this._progress.trophies.every(t => t.completed) ? '' : '-off'}.png`);
        }))), 
        // 5
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .addClass('separator', 'left')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .addClass('trophy-count')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('ul')
            .addClass('floatr')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('li')
            .addClass('icon-sprite', 'gold')
            .setText(this._progress.trophies.filter(t => t.trophyGrade === 'gold' && t.completed).length.toString()), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('li')
            .addClass('icon-sprite', 'silver')
            .setText(this._progress.trophies.filter(t => t.trophyGrade === 'silver' && t.completed).length.toString()), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('li')
            .addClass('icon-sprite', 'bronze')
            .setText(this._progress.trophies.filter(t => t.trophyGrade === 'bronze' && t.completed).length.toString())), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .addClass('progress-bar')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
            .setText(this._progress.progress), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .setAttribute('style', `width: ${this._progress.progress};`))))))));
    }
}


/***/ }),
/* 85 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TrophiesImmediate": () => (/* binding */ TrophiesImmediate)
/* harmony export */ });
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(51);


class TrophiesImmediate {
    run() {
        console.debug('TrophiesImmediate module is running');
        const settingsStorage = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_0__.SettingsStorage();
        if (settingsStorage.get('trophyListHideTrophyGuideBanner')) {
            (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_1__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_1__.STYLESHEET_TROPHIES_HIDE_GUIDE_BANNER);
        }
        if (settingsStorage.get('compactBanners')) {
            (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_1__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_1__.STYLESHEET_COMPACT_BANNERS);
        }
    }
}


/***/ }),
/* 86 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GameLeaderboard": () => (/* binding */ GameLeaderboard)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(55);
/* harmony import */ var _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(44);




class GameLeaderboard {
    constructor(settingsStorage) {
        this._settingsStorage = settingsStorage;
    }
    _highlightPlayers(countries) {
        let count = 0;
        (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('tr').forEach((el) => {
            const country = el.clone().find('img.round-flags').getAttribute('title');
            if (countries.indexOf(country) > -1) {
                count++;
                el.setCss('backgroundColor', 'rgb(236, 248, 234)');
            }
        });
        _util_J__WEBPACK_IMPORTED_MODULE_0__.J.q('div.title-bar > div.grow').append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('h3').setText(`(Highlighted: ${count})`));
    }
    _adjustPlayerLinks() {
        const donatorStorage = new _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_3__.DonatorsStorage();
        const url = (0,_util_url__WEBPACK_IMPORTED_MODULE_1__.getUrl)();
        const trophyList = url
            .replace('game-leaderboard', 'trophies')
            .replace(/\?page=[0-9]+$/, '');
        (0,_util_J__WEBPACK_IMPORTED_MODULE_0__.all)('tr').forEach((el) => {
            const usernameLink = el.clone().find('a.title');
            const username = usernameLink.getText().trim();
            usernameLink.setAttribute('href', trophyList + '/' + username);
            console.log('username', username);
            const isDonator = donatorStorage.getDonatorStatus(username).isDonator;
            if (isDonator) {
                usernameLink.setText(username + ' ☕');
            }
        });
    }
    _switchHoursTo24HourFormat() {
        if (!this._settingsStorage.get('use24HourTimeFormat')) {
            return;
        }
        (0,_util_date__WEBPACK_IMPORTED_MODULE_2__.switchHoursTo24HourFormat)();
    }
    run() {
        console.debug('Game Leaderboard module is running');
        this._switchHoursTo24HourFormat();
        this._highlightPlayers(this._settingsStorage.get('gameLeaderboardHighlightedCountries'));
        this._adjustPlayerLinks();
    }
}


/***/ }),
/* 87 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Games": () => (/* binding */ Games)
/* harmony export */ });
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(79);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(21);
/* harmony import */ var _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8);
/* harmony import */ var _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(20);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(25);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(5);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(24);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(34);
/* harmony import */ var _features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(68);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(13);
/* harmony import */ var _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(30);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(51);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(55);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(43);
/* harmony import */ var _features_guide_IGuide__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(69);
/* harmony import */ var _util_string__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(57);
/* harmony import */ var _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(62);
/* harmony import */ var _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(45);




















const GENRES = {
    2: 'Point-and-click',
    4: 'Fighting',
    5: 'Shooter',
    7: 'Music',
    8: 'Platform',
    9: 'Puzzle',
    10: 'Racing',
    11: 'Real Time Strategy',
    12: 'Role-playing',
    13: 'Simulator',
    14: 'Sport',
    15: 'Strategy',
    16: 'Turn-based Strategy',
    24: 'Tactical',
    25: 'Hack and slash/Beat \'em up',
    26: 'Quiz/Trivia',
    30: 'Pinball',
    31: 'Adventure',
    32: 'Indie',
    33: 'Arcade',
    34: 'Visual Novel',
    35: 'Card & Board Game',
    36: 'MOBA'
};
class Games {
    constructor(subSection) {
        this._subSection = undefined;
        this._subSection = subSection;
        console.log('Games module constructor. Subsection:', subSection);
        const listStorage = new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_4__.ListStorage();
        const scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_3__.ScriptStateStorage();
        const allLists = listStorage.get();
        this._lastActiveGameList = scriptStateStorage.get('lastActiveGameList');
        if (this._lastActiveGameList == null && allLists.length > 0) {
            this._lastActiveGameList = allLists[0].id;
        }
    }
    _appendListButtons() {
        if (this._lastActiveGameList == null) {
            return;
        }
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table#game_list tr').forEach((el) => {
            const pathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(pathname);
            const trophyListUrl = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getWebsiteUrl)() + pathname;
            el.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .addClass('separator', 'left')
                .append(new _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_2__.ListButtonSmall(trophyListId, trophyListUrl, this._lastActiveGameList, 'psnpp-list-button'))));
        });
    }
    _addProgress() {
        const gameProgressStorage = new _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_5__.GameProgressStorage();
        const gameProgressList = gameProgressStorage.indexedById();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table#game_list tr').forEach(el => {
            const pathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(pathname);
            const gameProgress = gameProgressList.get(trophyListId);
            if (gameProgress == null) {
                return;
            }
            el.clone().find('a.title').setCss('fontWeight', 'bold');
            if (gameProgress.trophies != null && gameProgress.trophies.platinum === 1) {
                el.addClass('platinum');
            }
            else if (gameProgress.progress === 100) {
                el.addClass('completed');
            }
            else {
                // NOTE: Game was found in the profile, let's mark it
                el.setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_6__.COLOR_LIGHT_YELLOW);
            }
        });
    }
    _enhanceRowsWithShutdownInfo() {
        const shutdowns = new _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_19__.ShutdownsStorage().get().data;
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table#game_list tr').forEach(el => {
            const trophyListPathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(trophyListPathname);
            const shutdownForList = shutdowns.list[trophyListId];
            if (shutdownForList == null) {
                return;
            }
            const titleSpan = el.clone().find('td', { eq: 1 }).find('span');
            const shutdownDate = (0,_util_date__WEBPACK_IMPORTED_MODULE_14__.getUtcLocaleDateString)(shutdownForList.shutdownTimestamp);
            const tooltipText = `<b>SHUTDOWN NOTICE</b><br>The online servers for this game are scheduled to be shut down on ${shutdownDate}.`;
            titleSpan
                .append(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_15__.Icon('fa-clock-o')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_9__.tooltip)(el, tooltipText)));
        });
    }
    _addGenreDropdown() {
        var _a;
        const genre = (_a = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getSearchParams)().get('genre')) !== null && _a !== void 0 ? _a : 'all';
        const genreDropdown = new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_18__.DropdownMenu({
            mainButton: 'Genre',
            mainButtonIconClass: 'rarity',
            mainButtonStyle: 'margin-left: 5px;',
            options: [
                {
                    text: 'All',
                    value: 'all',
                    selected: genre === 'all'
                },
                ...Object
                    .entries(GENRES)
                    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                    .map(([id, name]) => ({
                    text: name,
                    value: id,
                    selected: genre.startsWith(id + '-')
                }))
            ],
            onSelected: (genreId) => {
                if (genreId === 'all') {
                    (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.redirect)('/games');
                }
                else {
                    (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.redirect)('/games?genre=' + genreId);
                }
            }
        });
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.row > div.col-xs-8 > div.title.flex.v-align > div.no-shrink')
            .prepend(genreDropdown);
    }
    _enhanceRowsWithUnobtainableTrophies() {
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_7__.SettingsStorage().get('markUnobtainableTrophies')) {
            return;
        }
        const unobtainableTrophies = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_8__.UnobtainableTrophiesStorage().get();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table#game_list tr').forEach(el => {
            const trophyListPathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(trophyListPathname);
            const unobtainableTrophiesForList = unobtainableTrophies.data.list[trophyListId];
            if (unobtainableTrophiesForList == null) {
                return;
            }
            const titleSpan = el.clone().find('td', { eq: 1 }).find('span');
            titleSpan
                .append(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_15__.Icon('fa-exclamation-circle')
                .addClass('marker-unobtainable-trophies')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_9__.tooltip)(el, (0,_features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_10__.getUnobtainableTrophiesDescription)(unobtainableTrophiesForList))));
        });
    }
    _appendLowOwnersFilter() {
        const scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_3__.ScriptStateStorage();
        const isChecked = scriptStateStorage.get('hideLowOwners');
        const lowOwnersThreshold = scriptStateStorage.get('lowOwnersThreshold');
        function toggleVisibility(checked) {
            const currentLowOwnersThreshold = scriptStateStorage.get('lowOwnersThreshold');
            (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table#game_list tr').forEach(row => {
                var _a;
                const ownersText = row.clone().find('span.small-info b').getText();
                const owners = (_a = parseInt(ownersText.replace(/,/g, ''))) !== null && _a !== void 0 ? _a : 0;
                if (checked && owners < currentLowOwnersThreshold) {
                    row.hide();
                }
                else {
                    row.show();
                }
            });
        }
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.row > div.col-xs-8 > div.title.flex.v-align > div.no-shrink')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('style', 'padding: 0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('label')
            .setAttribute('for', 'hide-low-owners')
            .setAttribute('style', 'vertical-align: inherit; padding: 0px 15px 0px 15px; display: inline-block;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('input')
            .setAttribute('type', 'checkbox')
            .setAttribute('id', 'hide-low-owners')
            .condition(isChecked, (el) => el.setAttribute('checked', ''))
            .setAttribute('style', 'top: 2px; position: relative; margin-right: 0.5rem;')
            .click((ev) => {
            const isChecked = ev.target.checked;
            scriptStateStorage.set('hideLowOwners', isChecked);
            toggleVisibility(isChecked);
        }), 'Hide Low Owners', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('input')
            .setAttribute('type', 'text')
            .addClass('form-control', 'form-control-sm', 'text-sm')
            .setAttribute('style', 'width: 32px; height: 20px; font-size: 85%; text-align: center; margin: 5px 0 5px 1rem;')
            .setAttribute('value', lowOwnersThreshold.toString())
            .keyup((_, el) => {
            const value = parseInt(el.getValue());
            if (isNaN(value)) {
                return;
            }
            scriptStateStorage.set('lowOwnersThreshold', value);
            toggleVisibility(scriptStateStorage.get('hideLowOwners'));
        }))));
        toggleVisibility(isChecked);
    }
    _enhanceRowsWithGuideInfo() {
        const guides = new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_12__.GuideStorage().get();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table#game_list tr')
            .forEach(row => {
            const trophyListPathname = row.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(trophyListPathname);
            const guide = guides.data.list.games[trophyListId];
            if (guide == null) {
                return;
            }
            const [difficulty, playthroughs, hours] = guide.r;
            const guideLink = (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_16__.getGuideHref)(guide.a, guide.p);
            const target = row.clone().find('span.small-info');
            target.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .addClass('psnpp-guide-info-games')
                .append(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                .setAttribute('href', guideLink.href)
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${difficulty}/10`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_13__.getDifficultyClass)(difficulty))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${playthroughs}x`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_13__.getPlaythroughsClass)(playthroughs))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${hours}h`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_13__.getHoursClass)(hours))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'))
                .condition(guideLink.isExternal, (el) => {
                el.setAttribute('target', '_blank');
            })));
        });
    }
    _appendExtraNavLinks() {
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.banner-overlay div.navigation')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('li')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '/series')
            .setText('Series')), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('li')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_6__.HASH_UNOBTAINABLES)
            .setText('Unobtainables')), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('li')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_6__.HASH_SHUTDOWNS)
            .setText('Shutdowns')));
    }
    async _showGamesWithUnobtainableTrophies() {
        try {
            await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_11__.loadCssSheet)(_util_constants__WEBPACK_IMPORTED_MODULE_6__.EXTERNAL_SCRIPT_URLS.DATA_TABLES_CSS);
            await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_11__.loadScriptTag)(_util_constants__WEBPACK_IMPORTED_MODULE_6__.EXTERNAL_SCRIPT_URLS.DATA_TABLES_JS);
            (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.banner-overlay div.no-shrink').forEach(x => x.remove());
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#content').empty();
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.title-bar > div.grow')
                .empty()
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('h3').setText('Games with unobtainable trophies'));
            const result = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_11__.fetchJson)(_util_constants__WEBPACK_IMPORTED_MODULE_6__.LINK_UNOBTAINABLE_TROPHIES_MASTER_LIST_FULL);
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#content')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('table')
                .setAttribute('id', 'unobtainables-table')
                .setAttribute('style', 'border-collapse: collapse;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('thead')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
                .setAttribute('style', 'border-bottom: 2px solid black; font-weight: bold;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('List ID'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Title'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('# of Trophies'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Platforms'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Submitted by'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Note'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Date'))), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tbody')
                .append(...Object.keys(result.list).reverse().map((id) => {
                const resultRow = result.list[id];
                const row = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').setText(id), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                    .setAttribute('href', '/trophies/' + id)
                    .setText(resultRow.title)), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').setText(resultRow.trophies[0] === 0 ? 'all' : resultRow.trophies.length.toString()), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').setText(resultRow.platforms.join(', ')), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').append(resultRow.submitter == null ? '-' : _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a').setAttribute('href', '/' + resultRow.submitter).setText(resultRow.submitter)));
                if (resultRow.note == null) {
                    row.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').setText('-'));
                }
                else {
                    row.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').append(...(0,_util_string__WEBPACK_IMPORTED_MODULE_17__.linkifyText)(resultRow.note)));
                }
                let date = '-';
                if (resultRow.timestamp != null) {
                    const prettySubmittedDate = (0,_util_date__WEBPACK_IMPORTED_MODULE_14__.getPrettyDate)(resultRow.timestamp);
                    date = `${prettySubmittedDate.day}${prettySubmittedDate.suffix} ${prettySubmittedDate.monthName} ${prettySubmittedDate.year}`;
                }
                row
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
                    .setAttribute('data-order', resultRow.timestamp == null ? '0' : resultRow.timestamp.toString())
                    .setText(date));
                return row;
            }))));
            new DataTable('#unobtainables-table', {
                order: [[0, 'desc']],
                pagingType: 'full_numbers',
                autoWidth: false
            });
            // Refresh the unobtainables list in the background
            await (new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_8__.UnobtainableTrophiesStorage()).refresh(true);
        }
        catch (err) {
            console.error('Failed to load unobtainables', err);
            alert('Failed to load unobtainables: ' + err.message);
        }
    }
    async _showGamesWithShutdowns() {
        try {
            await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_11__.loadCssSheet)(_util_constants__WEBPACK_IMPORTED_MODULE_6__.EXTERNAL_SCRIPT_URLS.DATA_TABLES_CSS);
            await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_11__.loadScriptTag)(_util_constants__WEBPACK_IMPORTED_MODULE_6__.EXTERNAL_SCRIPT_URLS.DATA_TABLES_JS);
            (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('div.banner-overlay div.no-shrink').forEach(x => x.remove());
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#content').empty();
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.title-bar > div.grow')
                .empty()
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('h3').setText('Games with incoming shutdowns'));
            const shutdowns = new _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_19__.ShutdownsStorage().get().data;
            _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#content')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('table')
                .setAttribute('id', 'shutdowns')
                .setAttribute('style', 'border-collapse: collapse;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('thead')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
                .setAttribute('style', 'border-bottom: 2px solid black; font-weight: bold;')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('List ID'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Title'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Platforms'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Submitted by'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Note'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('th').setText('Shutdown date'))), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tbody')
                .append(...Object.keys(shutdowns.list).map((id) => {
                const resultRow = shutdowns.list[id];
                const row = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('tr')
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').setText(id), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                    .setAttribute('href', '/trophies/' + id)
                    .setText(resultRow.title)), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').setText(resultRow.platforms.join(', ')), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').append(resultRow.submitter == null ? '-' : _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a').setAttribute('href', '/' + resultRow.submitter).setText(resultRow.submitter)));
                if (resultRow.note == null) {
                    row.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').setText('-'));
                }
                else {
                    row.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td').append(...(0,_util_string__WEBPACK_IMPORTED_MODULE_17__.linkifyText)(resultRow.note)));
                }
                const date = (0,_util_date__WEBPACK_IMPORTED_MODULE_14__.getUtcLocaleDateString)(resultRow.shutdownTimestamp);
                row
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
                    .setAttribute('data-order', resultRow.shutdownTimestamp.toString())
                    .setText(date));
                return row;
            }))));
            new DataTable('#shutdowns', {
                order: [[5, 'asc']],
                pagingType: 'full_numbers',
                pageLength: 100,
                autoWidth: false
            });
            // Refresh the shutdowns in the background
            await (new _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_19__.ShutdownsStorage()).refresh(true);
        }
        catch (err) {
            alert('Failed to load shutdowns: ' + err.message);
        }
    }
    _observeHash() {
        window.addEventListener('hashchange', () => this._processHash());
    }
    _processHash() {
        if (location.hash.startsWith(_util_constants__WEBPACK_IMPORTED_MODULE_6__.HASH_UNOBTAINABLES)) {
            this._showGamesWithUnobtainableTrophies();
            return;
        }
        if (location.hash.startsWith(_util_constants__WEBPACK_IMPORTED_MODULE_6__.HASH_SHUTDOWNS)) {
            this._showGamesWithShutdowns();
            return;
        }
    }
    run() {
        console.debug('Games module is running');
        this._observeHash();
        this._processHash();
        this._appendExtraNavLinks();
        if (this._subSection == null) {
            if (this._lastActiveGameList != null) {
                this._appendListButtons();
            }
            this._addProgress();
            this._addGenreDropdown();
            this._enhanceRowsWithUnobtainableTrophies();
            this._enhanceRowsWithShutdownInfo();
            this._enhanceRowsWithGuideInfo();
            this._appendLowOwnersFilter();
        }
    }
}


/***/ }),
/* 88 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Search": () => (/* binding */ Search)
/* harmony export */ });
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _util_observe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(35);
/* harmony import */ var _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(79);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(21);
/* harmony import */ var _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8);
/* harmony import */ var _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(20);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(25);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(5);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(24);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(34);
/* harmony import */ var _features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(68);
/* harmony import */ var _util_Logger__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(49);
/* harmony import */ var _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(30);
/* harmony import */ var _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(45);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(55);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(51);
/* harmony import */ var _features_guide_IGuide__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(69);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(43);



















const LIST_BUTTON_CLASS = 'psnpp-list-button';
class Search {
    constructor(section) {
        this._section = section;
        this._settingsStorage = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_8__.SettingsStorage();
        this._logger = new _util_Logger__WEBPACK_IMPORTED_MODULE_12__.Logger(this._settingsStorage.get('enableScriptLogger'), 'Search');
        const listStorage = new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_5__.ListStorage();
        const scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_4__.ScriptStateStorage();
        const gameProgressStorage = new _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_6__.GameProgressStorage();
        this._gameProgressList = gameProgressStorage.indexedById();
        const allLists = listStorage.get();
        this._lastActiveGameList = scriptStateStorage.get('lastActiveGameList');
        if (this._lastActiveGameList == null && allLists.length > 0) {
            this._lastActiveGameList = allLists[0].id;
        }
    }
    _appendRefineSearchButton() {
        const searchForm = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#content > div.form');
        searchForm.setAttribute('style', 'margin-bottom: 10px; display: flex;');
        searchForm.clone().find('label').setAttribute('style', 'width: 90%;');
        searchForm.clone().find('label')
            .after(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'green')
            .setAttribute('style', 'width: 10%;margin: auto 0 auto 20px;padding-top: 6px;height: fit-content;')
            .setText('Refine')
            .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_10__.tooltip)(el, 'Refined search provides narrowed-down results that are more accurate in most cases.'))
            .click((e) => {
            e.preventDefault();
            const searchBox = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#search');
            const oldValue = searchBox.getValue().replace(/[ ]{2,}/g, ' ').trim();
            this._logger.debug('Old search value:', oldValue);
            if (oldValue.includes(' AND ')) {
                alert('Search value is already refined.');
                return;
            }
            const newValue = oldValue.split(' ').length === 1
                ? `OR ${oldValue} OR`
                : oldValue.split(' ').join(' AND ');
            this._logger.debug('New search value:', newValue);
            searchBox.setValue(newValue);
            searchBox.triggerKeypress('Enter');
        }));
    }
    _appendListButtons() {
        if (this._lastActiveGameList == null) {
            return;
        }
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#search-results tr').forEach((el) => {
            const alreadyAdded = el.clone().find('.' + LIST_BUTTON_CLASS).exists();
            if (alreadyAdded) {
                return;
            }
            const pathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(pathname);
            const trophyListUrl = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getWebsiteUrl)() + pathname;
            el.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .addClass('separator', 'left')
                .append(new _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_3__.ListButtonSmall(trophyListId, trophyListUrl, this._lastActiveGameList, LIST_BUTTON_CLASS))));
        });
    }
    _addProgress() {
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#search-results tr').forEach((el) => {
            const pathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(pathname);
            const gameProgress = this._gameProgressList.get(trophyListId);
            if (gameProgress == null) {
                return;
            }
            el.clone().find('a.title').setCss('fontWeight', 'bold');
            if (gameProgress.trophies != null && gameProgress.trophies.platinum === 1) {
                el.addClass('platinum');
            }
            else if (gameProgress.progress === 100) {
                el.addClass('completed');
            }
            else {
                // NOTE: Game was found in the profile, let's mark it
                el.setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_7__.COLOR_LIGHT_YELLOW);
            }
        });
    }
    _enhanceRowsWithUnobtainableTrophies() {
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_8__.SettingsStorage().get('markUnobtainableTrophies')) {
            return;
        }
        const unobtainableTrophies = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_9__.UnobtainableTrophiesStorage().get();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#search-results tr')
            .filter(el => el.getAttribute('data-psnpp-unobtainable-processed') !== 'true')
            .forEach(el => {
            const trophyListPathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(trophyListPathname);
            el.setAttribute('data-psnpp-unobtainable-processed', 'true');
            const unobtainableTrophiesForList = unobtainableTrophies.data.list[trophyListId];
            if (unobtainableTrophiesForList == null) {
                return;
            }
            const titleBr = el.clone().find('td', { eq: 1 }).find('br');
            titleBr
                .before(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('i')
                .addClass('fa', 'fa-exclamation-circle', 'marker-unobtainable-trophies')
                .setAttribute('aria-hidden', 'true')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_10__.tooltip)(el, (0,_features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_11__.getUnobtainableTrophiesDescription)(unobtainableTrophiesForList))));
        });
    }
    _enhanceRowsWithShutdownInfo() {
        const shutdowns = new _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_14__.ShutdownsStorage().get().data;
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#search-results tr')
            .filter(el => el.getAttribute('data-psnpp-shutdown-processed') !== 'true')
            .forEach(el => {
            const trophyListPathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(trophyListPathname);
            el.setAttribute('data-psnpp-shutdown-processed', 'true');
            const shutdownForList = shutdowns.list[trophyListId];
            if (shutdownForList == null) {
                return;
            }
            const titleBr = el.clone().find('td', { eq: 1 }).find('br');
            const shutdownDate = (0,_util_date__WEBPACK_IMPORTED_MODULE_15__.getUtcLocaleDateString)(shutdownForList.shutdownTimestamp);
            const tooltipText = `<b>SHUTDOWN NOTICE</b><br>The online servers for this game are scheduled to be shut down on ${shutdownDate}.`;
            titleBr
                .before(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_18__.Icon('fa-clock-o')
                .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_10__.tooltip)(el, tooltipText)));
        });
    }
    _enhanceRowsGameComplexity() {
        const guides = new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_13__.GuideStorage().get();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('#search-results tr')
            .filter(el => el.getAttribute('data-psnpp-guide-processed') !== 'true')
            .forEach(el => {
            const trophyListPathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(trophyListPathname);
            el.setAttribute('data-psnpp-guide-processed', 'true');
            const guide = guides.data.list.games[trophyListId];
            if (guide == null) {
                return;
            }
            const [difficulty, playthroughs, hours] = guide.r;
            const guideLink = (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_17__.getGuideHref)(guide.a, guide.p);
            const platforms = el.clone().find('td', { eq: 1 }).find('div.platforms');
            platforms
                .after(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .addClass('psnpp-guide-info-search')
                .append(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                .setAttribute('href', guideLink.href)
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${difficulty}/10`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_16__.getDifficultyClass)(difficulty))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${playthroughs}x`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_16__.getPlaythroughsClass)(playthroughs))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${hours}h`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_16__.getHoursClass)(hours))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'))
                .condition(guideLink.isExternal, (el) => {
                el.setAttribute('target', '_blank');
            })));
        });
    }
    _enhanceRows() {
        this._appendListButtons();
        this._enhanceRowsWithUnobtainableTrophies();
        this._enhanceRowsWithShutdownInfo();
        this._enhanceRowsGameComplexity();
        this._addProgress();
    }
    _observeSearchResults() {
        const destroy = (0,_util_observe__WEBPACK_IMPORTED_MODULE_2__.observe)(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('#search-results'), () => {
            destroy();
            this._enhanceRows();
            this._observeSearchResults();
        });
    }
    run() {
        this._logger.debug('Running');
        // NOTE: Missing search section defaults to "games"
        if (this._section !== 'games' && this._section != null) {
            return;
        }
        this._appendRefineSearchButton();
        this._enhanceRows();
        this._observeSearchResults();
    }
}


/***/ }),
/* 89 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Sessions": () => (/* binding */ Sessions)
/* harmony export */ });
/* harmony import */ var _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(62);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _ui_SearchBox__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(63);
/* harmony import */ var _features_sessions_SessionScraper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(18);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(19);
/* harmony import */ var _util_transform__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(16);
/* harmony import */ var _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(53);
/* harmony import */ var _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(20);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(12);









const HOST_ANYONE_VALUE = '__psnpp__anyone__';
const HOST_ME_VALUE = '__psnpp__me__';
class Sessions {
    constructor() {
        this._hideFinished = false;
        this._hidePlatinumed = false;
        this._host = HOST_ANYONE_VALUE;
        this._platform = 'all';
        this._searchValue = '';
        this._sessions = [];
        this._gameProgress = new _features_game_progress_GameProgressStorage__WEBPACK_IMPORTED_MODULE_7__.GameProgressStorage().indexedById();
    }
    _getPlatformsDropdown() {
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_0__.DropdownMenu({
            mainButton: 'Platform',
            mainButtonIconClass: 'platform',
            options: [
                {
                    text: 'All',
                    value: 'all',
                    selected: true
                },
                {
                    text: 'PlayStation 5',
                    value: 'ps5',
                    selected: false
                },
                {
                    text: 'PlayStation 4',
                    value: 'ps4',
                    selected: false
                },
                {
                    text: 'PlayStation 3',
                    value: 'ps3',
                    selected: false
                },
                {
                    text: 'PlayStation Vita',
                    value: 'psvita',
                    selected: false
                },
                {
                    text: 'PlayStation VR',
                    value: 'psvr',
                    selected: false
                },
                {
                    text: 'PC',
                    value: 'pc',
                    selected: false
                }
            ],
            onSelected: (platform) => {
                this._platform = platform;
                this._filterSessions();
            }
        });
    }
    _getHostDropdown() {
        const usernames = (0,_util_transform__WEBPACK_IMPORTED_MODULE_5__.unique)(this._sessions.map(x => x.session.host))
            .sort((a, b) => a.localeCompare(b));
        return new _ui_DropdownMenu__WEBPACK_IMPORTED_MODULE_0__.DropdownMenu({
            mainButton: 'Host',
            mainButtonIconClass: 'language',
            options: [
                {
                    text: 'Anyone',
                    value: HOST_ANYONE_VALUE,
                    selected: true
                },
                {
                    text: 'Me',
                    value: HOST_ME_VALUE,
                    selected: false
                },
                'divider',
                ...usernames.map(username => ({ text: username, value: username, selected: false }))
            ],
            onSelected: (host) => {
                this._host = host;
                this._filterSessions();
            }
        });
    }
    _filterSessions() {
        const platform = this._platform;
        const searchValue = this._searchValue;
        const host = this._host;
        const myUsername = (0,_util_user__WEBPACK_IMPORTED_MODULE_4__.getPsnId)();
        this._sessions.forEach(session => {
            var _a;
            const sessionItem = session.session;
            const gameProgressItem = this._gameProgress.get((0,_util_url__WEBPACK_IMPORTED_MODULE_8__.getTrophyListIdFromImageUrl)(sessionItem.image));
            const titleMatchSearch = sessionItem.title.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
            const hostMatchSearch = sessionItem.host.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
            const platformMatch = platform === 'all' || sessionItem.platforms[platform] === true;
            const hostMatch = host === HOST_ANYONE_VALUE
                || (host === HOST_ME_VALUE && sessionItem.host === myUsername)
                || host === sessionItem.host;
            const isHiddenViaFinishedToggle = this._hideFinished && (gameProgressItem === null || gameProgressItem === void 0 ? void 0 : gameProgressItem.progress) === 100;
            const isHiddenViaPlatinumToggle = this._hidePlatinumed && ((_a = gameProgressItem === null || gameProgressItem === void 0 ? void 0 : gameProgressItem.trophies) === null || _a === void 0 ? void 0 : _a.platinum) === 1;
            const shouldBeVisible = (titleMatchSearch || hostMatchSearch)
                && platformMatch
                && hostMatch
                && !isHiddenViaFinishedToggle
                && !isHiddenViaPlatinumToggle;
            if (shouldBeVisible) {
                session.el.show();
            }
            else {
                session.el.hide();
            }
        });
    }
    _appendDropdowns() {
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.row > div.col-xs-12 > div.title.flex.v-align > div.no-shrink')
            .prepend(this._getHostDropdown(), this._getPlatformsDropdown());
    }
    _appendSearchBox() {
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('div.row > div.col-xs-12 > div.title.flex.v-align')
            .after(new _ui_SearchBox__WEBPACK_IMPORTED_MODULE_2__.SearchBox('Search by game or host', value => {
            this._searchValue = value;
            this._filterSessions();
        }));
    }
    _scrapeSessions() {
        this._sessions = new _features_sessions_SessionScraper__WEBPACK_IMPORTED_MODULE_3__.SessionScraper(document).getFromSessionsPageWithElements();
    }
    _insertMenu() {
        const menuWrapper = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div');
        const togglePlatinumedButton = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setText('🔴 Hide platinumed')
            .click((e) => {
            e.preventDefault();
            this._hidePlatinumed = !this._hidePlatinumed;
            if (this._hidePlatinumed) {
                togglePlatinumedButton.setText('🟢 Hide platinumed');
            }
            else {
                togglePlatinumedButton.setText('🔴 Hide platinumed');
            }
            this._filterSessions();
        });
        const toggleFinishedButton = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .setAttribute('href', '#')
            .addClass('button', 'grey')
            .setAttribute('style', 'margin-top: 5px;')
            .setText('🔴 Hide 100%')
            .click((e) => {
            e.preventDefault();
            this._hideFinished = !this._hideFinished;
            if (this._hideFinished) {
                toggleFinishedButton.setText('🟢 Hide 100%');
            }
            else {
                toggleFinishedButton.setText('🔴 Hide 100%');
            }
            this._filterSessions();
        });
        menuWrapper.append(togglePlatinumedButton, _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('br'), toggleFinishedButton);
        const floatingMenu = new _ui_FloatingMenu__WEBPACK_IMPORTED_MODULE_6__.FloatingMenu(menuWrapper);
        floatingMenu.insert();
    }
    run() {
        console.debug('Sessions module is running');
        this._scrapeSessions();
        this._insertMenu();
        this._appendDropdowns();
        this._appendSearchBox();
    }
}


/***/ }),
/* 90 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Series": () => (/* binding */ Series)
/* harmony export */ });
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(79);
/* harmony import */ var _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(21);
/* harmony import */ var _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(24);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(34);
/* harmony import */ var _features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(68);
/* harmony import */ var _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(30);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(51);
/* harmony import */ var _features_guide_IGuide__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(69);
/* harmony import */ var _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(45);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(55);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(43);














class Series {
    constructor(username) {
        this._username = username;
        const listStorage = new _features_lists_ListStorage__WEBPACK_IMPORTED_MODULE_4__.ListStorage();
        this._scriptStateStorage = new _features_state_ScriptStateStorage__WEBPACK_IMPORTED_MODULE_3__.ScriptStateStorage();
        const allLists = listStorage.get();
        this._lastActiveGameList = this._scriptStateStorage.get('lastActiveGameList');
        if (this._lastActiveGameList == null && allLists.length > 0) {
            this._lastActiveGameList = allLists[0].id;
        }
    }
    _getAllRows() {
        return (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table.series:not(.legend) tr');
    }
    _appendListButtons() {
        this._getAllRows().forEach((el) => {
            const pathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(pathname);
            const trophyListUrl = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getWebsiteUrl)() + pathname;
            const toAppend = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .addClass('separator', 'left')
                .append(new _features_lists_ListButtons__WEBPACK_IMPORTED_MODULE_2__.ListButtonSmall(trophyListId, trophyListUrl, this._lastActiveGameList, 'psnpp-list-button')));
            const seriesCompletionTdExists = el.clone().find('td.series').exists();
            if (seriesCompletionTdExists) {
                el.clone().find('td.series').prev().after(toAppend);
            }
            else {
                el.append(toAppend);
            }
        });
    }
    _updateTrophyListLinks() {
        if (this._username == null) {
            return;
        }
        this._getAllRows().forEach((el) => {
            const target = el.clone().find('a.title');
            const pathname = target.getAttribute('href');
            const slash = pathname[pathname.length - 1] === '/'
                ? ''
                : '/';
            target.setAttribute('href', pathname + slash + this._username);
        });
    }
    _markUnobtainableTrophies() {
        const unobtainableTrophies = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_5__.UnobtainableTrophiesStorage().get();
        this._getAllRows().forEach((el) => {
            const pathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(pathname);
            const unobtainableTrophiesForList = unobtainableTrophies.data.list[trophyListId];
            if (unobtainableTrophiesForList != null) {
                const titleSpan = el.clone().find('a.title').parent();
                titleSpan.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('i')
                    .addClass('fa', 'fa-exclamation-circle', 'marker-unobtainable-trophies')
                    .setAttribute('aria-hidden', 'true')
                    .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, (0,_features_unobtainables_unobtainables_utils__WEBPACK_IMPORTED_MODULE_7__.getUnobtainableTrophiesDescription)(unobtainableTrophiesForList))));
            }
        });
    }
    _enhanceRowsWithShutdownInfo() {
        const shutdowns = new _features_shutdowns_ShutdownsStorage__WEBPACK_IMPORTED_MODULE_11__.ShutdownsStorage().get().data;
        this._getAllRows().forEach((el) => {
            const pathname = el.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(pathname);
            const shutdownForList = shutdowns.list[trophyListId];
            if (shutdownForList != null) {
                const titleSpan = el.clone().find('a.title').parent();
                const shutdownDate = (0,_util_date__WEBPACK_IMPORTED_MODULE_12__.getUtcLocaleDateString)(shutdownForList.shutdownTimestamp);
                const tooltipText = `<b>SHUTDOWN NOTICE</b><br>The online servers for this game are scheduled to be shut down on ${shutdownDate}.`;
                titleSpan.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_13__.Icon('fa-clock-o')
                    .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, tooltipText)));
            }
        });
    }
    _addGuideInfo() {
        const guides = new _features_guide_GuideStorage__WEBPACK_IMPORTED_MODULE_8__.GuideStorage().get();
        this._getAllRows()
            .forEach(row => {
            const trophyListPathname = row.clone().find('a.title').getAttribute('href');
            const trophyListId = (0,_util_url__WEBPACK_IMPORTED_MODULE_0__.getFirstLevelIdFromPathname)(trophyListPathname);
            const guide = guides.data.list.games[trophyListId];
            if (guide == null) {
                return;
            }
            const [difficulty, playthroughs, hours] = guide.r;
            const guideLink = (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_10__.getGuideHref)(guide.a, guide.p);
            const target = row.clone().find('span.small-info,div.small-info');
            target.append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .addClass('psnpp-guide-info-series')
                .append(' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('bullet').setText('•'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
                .setAttribute('href', guideLink.href)
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${difficulty}/10`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_9__.getDifficultyClass)(difficulty))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${playthroughs}x`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_9__.getPlaythroughsClass)(playthroughs))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setText(`${hours}h`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_9__.getHoursClass)(hours))
                .setAttribute('style', 'font-size: 10px; color: white; padding: 1px 2px; border-radius: 2px;'))
                .condition(guideLink.isExternal, (el) => {
                el.setAttribute('target', '_blank');
            })));
        });
    }
    _collapseSeries() {
        const isSeriesDoNotCollapseNoStageEnabled = this._scriptStateStorage.get('seriesDoNotCollapseNoStage');
        (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('table.series.basic-completion:not(.legend)').forEach(table => {
            const containsNoStageElement = table.clone().find('span.typo-top', { equalsText: 'NO' }).exists()
                && table.clone().find('span.typo-bottom', { equalsText: 'Stage' }).exists();
            if (isSeriesDoNotCollapseNoStageEnabled && containsNoStageElement) {
                return;
            }
            const stageInfoTd = table.clone().find('span.separator').parent();
            const stageCompletionBadgeTd = table.clone().find('td.series');
            const rowsToBeRemoved = (0,_util_J__WEBPACK_IMPORTED_MODULE_1__.all)('tr:not(.platinum):not(.completed)', {}, table.get());
            table.addClass('full-completion').removeClass('basic-completion');
            table.clone().find('td.basic-completion').addClass('full-completion').removeClass('basic-completion');
            table.clone().find('td.series img.completion').addClass('completion-star').removeClass('completion');
            table.clone().find('td.series')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
                .addClass('center')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span')
                .setAttribute('style', 'font-size: 11px;')
                .apply(el => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_6__.tooltip)(el, 'Number of collapsed trophy lists'))
                .setText(`(${rowsToBeRemoved.length})`)));
            rowsToBeRemoved.forEach(el => el.remove());
            table.clone().find('tr').prepend(stageInfoTd);
            table.clone().find('tr').append(stageCompletionBadgeTd);
        });
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('table.series.basic-completion.legend').remove();
    }
    _appendCollapseButton() {
        const isSeriesAutoCollapseEnabled = this._scriptStateStorage.get('seriesAutoCollapse');
        const isSeriesDoNotCollapseNoStageEnabled = this._scriptStateStorage.get('seriesDoNotCollapseNoStage');
        const collapseButton = _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('a')
            .addClass('button', 'green')
            .setAttribute('href', '#')
            .setText('Collapse')
            .click((e, el) => {
            e.preventDefault();
            this._collapseSeries();
            el.setText('Stages are collapsed');
        });
        _util_J__WEBPACK_IMPORTED_MODULE_1__.J.q('table.series.legend.incomplete').after(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
            .addClass('form', 'center')
            .setAttribute('style', 'margin-top: 20px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('label')
            .setAttribute('style', 'text-align: left;')
            .addClass('checkbox')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('input')
            .setAttribute('type', 'checkbox')
            .condition(isSeriesAutoCollapseEnabled, (el) => el.setAttribute('checked', 'checked'))
            .change((ev) => {
            const checked = ev.currentTarget.checked;
            this._scriptStateStorage.set('seriesAutoCollapse', checked);
        }), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('i'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span').setText('Autocollapse')), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('label')
            .setAttribute('style', 'text-align: left;')
            .addClass('checkbox')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('input')
            .setAttribute('type', 'checkbox')
            .condition(isSeriesDoNotCollapseNoStageEnabled, (el) => el.setAttribute('checked', 'checked'))
            .change((ev) => {
            const checked = ev.currentTarget.checked;
            this._scriptStateStorage.set('seriesDoNotCollapseNoStage', checked);
        }), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('i'), _util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('span').setText('Do not collapse "No Stage"')), collapseButton));
        return collapseButton;
    }
    run() {
        console.debug('Series module is running');
        const collapseButton = this._appendCollapseButton();
        if (this._scriptStateStorage.get('seriesAutoCollapse')) {
            collapseButton.triggerClick();
        }
        if (this._lastActiveGameList != null) {
            this._appendListButtons();
        }
        this._markUnobtainableTrophies();
        this._enhanceRowsWithShutdownInfo();
        this._addGuideInfo();
        this._updateTrophyListLinks();
    }
}


/***/ }),
/* 91 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HundredClub": () => (/* binding */ HundredClub)
/* harmony export */ });
/* harmony import */ var _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(44);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(55);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(12);





class HundredClub {
    _adjustPlayerLinks() {
        const donatorStorage = new _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_0__.DonatorsStorage();
        const url = (0,_util_url__WEBPACK_IMPORTED_MODULE_4__.getUrl)();
        const trophyList = url
            .replace('100-club', 'trophies')
            .replace(/\?page=[0-9]+$/, '');
        (0,_util_J__WEBPACK_IMPORTED_MODULE_2__.all)('tr').forEach((el) => {
            const usernameLink = el.clone().find('a.title');
            const username = usernameLink.getText();
            usernameLink.setAttribute('href', trophyList + '/' + username);
            const isDonator = donatorStorage.getDonatorStatus(username).isDonator;
            if (isDonator) {
                usernameLink.setText(username + ' ☕');
            }
        });
    }
    _switchHoursTo24HourFormat() {
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage().get('use24HourTimeFormat')) {
            return;
        }
        (0,_util_date__WEBPACK_IMPORTED_MODULE_3__.switchHoursTo24HourFormat)();
    }
    run() {
        console.debug('100% Club module is running');
        this._switchHoursTo24HourFormat();
        this._adjustPlayerLinks();
    }
}


/***/ }),
/* 92 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Trophy": () => (/* binding */ Trophy)
/* harmony export */ });
/* harmony import */ var _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(44);
/* harmony import */ var _features_guide_GuideBanner__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(93);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(24);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(43);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(25);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(55);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(13);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(3);
/* harmony import */ var _util_Logger__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(49);
/* harmony import */ var _util_promise__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(15);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(34);
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(12);
/* harmony import */ var _util_video__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(54);














class Trophy {
    constructor() {
        this._settingsStorage = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_2__.SettingsStorage();
        this._logger = new _util_Logger__WEBPACK_IMPORTED_MODULE_9__.Logger(this._settingsStorage.get('enableScriptLogger'), 'Trophy');
    }
    _getTrophyListLinkElement() {
        return _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('ul.navigation > li > a', { equalsText: 'Trophies' });
    }
    _getGuidesLinkElement() {
        return _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('ul.navigation > li > a', { equalsText: 'Guides' });
    }
    _getTrophyGuideLinkElement() {
        return _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('ul.navigation > li > a', { equalsText: 'Trophy Guide' });
    }
    _getGuidesPathname() {
        const trophyGuidesLink = this._getGuidesLinkElement();
        if (trophyGuidesLink.exists()) {
            return trophyGuidesLink.getAttribute('href');
        }
        const trophyGuideLink = this._getTrophyGuideLinkElement();
        if (trophyGuideLink.exists()) {
            return this._getTrophyListLinkElement().getAttribute('href').replace('trophies', 'guides');
        }
        return null;
    }
    async _loadGuide(matchByTrophyName) {
        var _a;
        this._logger.debug('Loading guide info');
        const guidesPathname = this._getGuidesPathname();
        if (guidesPathname == null) {
            // NOTE: We should never get here since the button should not be visible at this point.
            return;
        }
        const trophyPathname = (0,_util_url__WEBPACK_IMPORTED_MODULE_12__.getUrlObject)().pathname;
        const trophyId = (0,_util_url__WEBPACK_IMPORTED_MODULE_12__.getSecondLevelIdFromPathname)(trophyPathname);
        const trophyName = _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('#content span.title').getText();
        this._logger.debug('Going to fetch guides list:', { guidesPathname, trophyName, trophyPathname, trophyId });
        const guidesDoc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_7__.fetchDocument)(guidesPathname);
        const availableGuides = (0,_util_J__WEBPACK_IMPORTED_MODULE_8__.all)('a[href^="/guide/"]', {}, guidesDoc);
        this._logger.debug('Number of guides found: ', availableGuides.length, '-', availableGuides.map(x => x.getAttribute('href')));
        for (const guideAnchor of availableGuides) {
            const guidePathname = guideAnchor.getAttribute('href');
            const guideTitle = guideAnchor.clone().find('span').getText();
            const guideBackgroundStyle = guideAnchor
                .clone()
                .find('div.background')
                .getAttribute('style');
            const guideAuthors = guideAnchor
                .clone()
                .find('span.author')
                .getText()
                .trim()
                .replace(/^By /, 'Written by ');
            const guideUserFavourites = guideAnchor
                .clone()
                .find('span.stat', { eq: 0 })
                .getText()
                .trim()
                .replace('User Favourites', '');
            const guideRatings = guideAnchor
                .clone()
                .find('span.stat', { eq: 1 })
                .getText()
                .trim()
                .replace('Ratings', '');
            const guideRatingsClass = guideAnchor
                .clone()
                .find('span.stat', { eq: 1 })
                .find('span.rating-inline')
                .getClassName()
                .split(' ')[1];
            const guideViews = guideAnchor
                .clone()
                .find('span.stat', { eq: 2 })
                .getText()
                .trim()
                .replace('Views', '');
            this._logger.debug('Processing guide:', { guideTitle, guidePathname, guideBackgroundStyle, guideAuthors, guideUserFavourites, guideRatings, guideRatingsClass, guideViews });
            const guideDoc = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_7__.fetchDocument)(guidePathname);
            const authorInfo = _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('div.title-author', {}, guideDoc).getText();
            const publishedDate = authorInfo.split('•')[1].trim().replace('Published ', '');
            // NOTE: Some guides are never updated.
            const updatedDate = (_a = authorInfo.split('•')[2]) === null || _a === void 0 ? void 0 : _a.trim().replace('Updated ', '');
            const trophyAnchor = (0,_util_J__WEBPACK_IMPORTED_MODULE_8__.all)('a.title[href^="/trophy/"]', {}, guideDoc)
                .find(scannedTrophy => {
                const scannedTrophyPathname = scannedTrophy.getAttribute('href');
                const scannedTrophyId = (0,_util_url__WEBPACK_IMPORTED_MODULE_12__.getSecondLevelIdFromPathname)(scannedTrophyPathname);
                const scannedTrophyName = scannedTrophy.getText();
                if (matchByTrophyName) {
                    return scannedTrophyName === trophyName;
                }
                return scannedTrophyId === trophyId;
            });
            if (trophyAnchor == null) {
                this._logger.debug('Did not find matching trophy in this guide.');
                await (0,_util_promise__WEBPACK_IMPORTED_MODULE_10__.sleep)(1000);
                continue;
            }
            const matchedTrophyName = trophyAnchor.getText();
            const trophyGuideBox = trophyAnchor
                .parent()
                .parent()
                .parent()
                .parent()
                .parent()
                .parent(); // mega oof!
            this._logger.debug('Displaying content from trophy guide:', { publishedDate, updatedDate, trophyGuideBoxExists: trophyGuideBox.exists(), matchedTrophyName });
            const trophyGuideContent = trophyGuideBox.clone().find('div.section-original');
            _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('#trophyTips')
                .append(trophyName === matchedTrophyName
                ? null
                : _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('div')
                    .addClass('box', 'information', 'center')
                    .setAttribute('style', 'padding: 10px; font-size: 15px; line-height: 15px; margin-bottom: 10px;')
                    .setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_5__.COLOR_LIGHT_ORANGE)
                    .setCss('border', `2px solid ${_util_constants__WEBPACK_IMPORTED_MODULE_5__.COLOR_DARK_ORANGE}`)
                    .append(_util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('b').setText('WARNING: '), 'Showing guide for trophy ID ', _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('b').setText(trophyId), ', but trophy names do not match.', ' Guide displayed below for trophy ', _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('i').setText(`"${matchedTrophyName}"`), ' might be incorrect.', _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('a')
                    .setAttribute('href', '#')
                    .setAttribute('style', 'margin-left: 10px;')
                    .addClass('button', 'green')
                    .setText('Search by trophy name')
                    .click(async (e) => {
                    e.preventDefault();
                    _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('#trophyTips').empty();
                    _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('#psnpp-load-guide-button').show();
                    await this._loadGuide(true);
                    _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('#psnpp-load-guide-button').hide();
                })), new _features_guide_GuideBanner__WEBPACK_IMPORTED_MODULE_1__.GuideBanner({
                title: guideTitle,
                pathname: guidePathname + '#' + trophyGuideBox.getAttribute('id'),
                backgroundStyle: guideBackgroundStyle,
                authors: guideAuthors,
                favourites: guideUserFavourites,
                views: guideViews,
                ratings: guideRatings,
                ratingsClass: guideRatingsClass,
                publishedDate,
                updatedDate
            }), _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('div').setInnerHtml(trophyGuideContent.getOuterHTML()));
            (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_11__.activateSpoilers)();
            (0,_util_video__WEBPACK_IMPORTED_MODULE_13__.applyLazyLoad)(true);
            return;
        }
        _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('#trophyTips')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('div')
            .addClass('box', 'information', 'center')
            .setAttribute('style', 'padding: 10px; font-size: 15px; line-height: 15px; margin-bottom: 10px;')
            .setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_5__.COLOR_LIGHT_ORANGE)
            .setCss('border', `2px solid ${_util_constants__WEBPACK_IMPORTED_MODULE_5__.COLOR_DARK_ORANGE}`)
            .append('Trophy guide was not found.'));
    }
    _appendLoadGuideButton() {
        // If guide is already present...
        const guideIsEmpty = _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('#trophyTips').isEmpty();
        if (!guideIsEmpty) {
            return false;
        }
        // ...or this is platinum trophy...
        const thisIsPlatinumTrophy = _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('img[title="Platinum"]').exists();
        if (thisIsPlatinumTrophy) {
            return false;
        }
        // ...or there are no guides available.
        const guidesPathname = this._getGuidesPathname();
        if (guidesPathname == null) {
            return false;
        }
        const addToCabinetButton = _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('a', { equalsText: 'Add to Cabinet' });
        addToCabinetButton.setAttribute('style', 'margin-left: 0px !important');
        let clicked = false;
        const button = _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('a')
            .setAttribute('id', 'psnpp-load-guide-button')
            .setAttribute('href', '#')
            .setAttribute('style', 'margin-left: 10px;')
            .addClass('button', 'blue')
            .apply((el) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_11__.tooltip)(el, _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('center')
            .append('Load guide', _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('span')
            .setAttribute('style', 'font-size: 11px;')
            .setText('PSNP+ will attempt to load appropriate trophy guide if there is one available'))
            .getOuterHTML()))
            .click(async (e, el) => {
            e.preventDefault();
            if (clicked) {
                return;
            }
            clicked = true;
            el.clone()
                .find('i')
                .removeClass('fa-book')
                .addClass('fa-spinner', 'fa-spin', 'fa-fw');
            try {
                await this._loadGuide(false);
            }
            catch (e) {
                const typedE = e;
                alert('Failed to load guide! Error message: ' + typedE.message);
            }
            el.hide();
            // NOTE: Need to manually hide tiptip, otherwise it stays visible
            _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('div#tiptip_holder').hide();
        })
            .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_4__.Icon('fa-book'));
        _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('table.box.zebra td', { eq: 1 })
            .after(_util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('td')
            .append(addToCabinetButton.exists()
            ? button
            : _util_J__WEBPACK_IMPORTED_MODULE_8__.J.c('span').addClass('separator', 'right').append(button)));
        return true;
    }
    _markTrophyAsUnobtainable() {
        const unobtainableTrophies = new _features_unobtainables_UnobtainableTrophiesStorage__WEBPACK_IMPORTED_MODULE_3__.UnobtainableTrophiesStorage().get();
        const trophyPath = (0,_util_url__WEBPACK_IMPORTED_MODULE_12__.getUrlObject)().pathname;
        const trophyListId = parseInt((0,_util_url__WEBPACK_IMPORTED_MODULE_12__.getFirstLevelIdFromPathname)(trophyPath), 10);
        const trophyId = parseInt((0,_util_url__WEBPACK_IMPORTED_MODULE_12__.getSecondLevelIdFromPathname)(trophyPath), 10);
        const unobtainableTrophiesForList = unobtainableTrophies.data.list[trophyListId];
        if (unobtainableTrophiesForList == null) {
            return;
        }
        if (unobtainableTrophiesForList.includes(trophyId) || unobtainableTrophiesForList[0] === 0) {
            _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('table.box.zebra tr').setCss('backgroundColor', _util_constants__WEBPACK_IMPORTED_MODULE_5__.COLOR_LIGHT_ORANGE);
        }
    }
    _renumberLatestAchievers() {
        const totalAchieversText = _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('nobr', { equalsText: 'Achievers' }).parent().prev().prev().getText().replace(/,/g, '');
        let totalAchievers = parseInt(totalAchieversText, 10);
        const latestAchieversContainer = _util_J__WEBPACK_IMPORTED_MODULE_8__.J.q('h3', { equalsText: 'Latest Achievers' }).parent().parent().parent();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_8__.all)('td.rank', {}, latestAchieversContainer.get()).forEach(x => {
            x.setAttribute('title', totalAchievers.toLocaleString('en-US'));
            totalAchievers--;
        });
    }
    _adjustPlayerLinks() {
        const donatorStorage = new _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_0__.DonatorsStorage();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_8__.all)('tr').forEach((el) => {
            const usernameLink = el.clone().find('a.title');
            const username = usernameLink.getText().trim();
            const isDonator = donatorStorage.getDonatorStatus(username).isDonator;
            if (isDonator) {
                usernameLink.setText(username + ' ☕');
            }
        });
    }
    _switchHoursTo24HourFormat() {
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_2__.SettingsStorage().get('use24HourTimeFormat')) {
            return;
        }
        (0,_util_date__WEBPACK_IMPORTED_MODULE_6__.switchHoursTo24HourFormat)();
    }
    run() {
        this._logger.debug('Running');
        const appended = this._appendLoadGuideButton();
        this._logger.debug('Added button to load guide', appended);
        if (!appended && this._settingsStorage.get('guideLazyLoadMedia')) {
            (0,_util_video__WEBPACK_IMPORTED_MODULE_13__.applyLazyLoad)(true);
        }
        this._markTrophyAsUnobtainable();
        this._switchHoursTo24HourFormat();
        this._renumberLatestAchievers();
        this._adjustPlayerLinks();
    }
}


/***/ }),
/* 93 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GuideBanner": () => (/* binding */ GuideBanner)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class GuideBanner extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(props) {
        super('div');
        this._props = props;
        this._build();
    }
    _build() {
        this
            .addClass('cf')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('guide-page-info', 'sm')
            .setAttribute('style', 'margin-bottom: 0;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setAttribute('href', this._props.pathname)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('background')
            .setAttribute('style', this._props.backgroundStyle)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('shade')
            .setAttribute('style', 'text-align: left;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('flex', 'v-align')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('grow')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('h3')
            .addClass('ellipsis')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').setText(this._props.title)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('info')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span')
            .addClass('line-clamp', 'two')
            .append(this._props.authors, ' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' Published ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(this._props.publishedDate))
            .condition(this._props.updatedDate != null, (el) => {
            el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('bullet').setText('•'), ' Updated ', _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('b').setText(this._props.updatedDate));
        }))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('no-shrink')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('flex')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
            .setAttribute('style', 'padding: 0 10px 0 10px; border-right:1px solid rgba(255,255,255,.3);')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('rating-inline', this._props.ratingsClass), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-bottom').setText(this._props.ratings + ' Ratings'))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
            .setAttribute('style', 'padding: 0 10px 0 10px; border-right:1px solid rgba(255,255,255,.3);')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-top').setText(this._props.views), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-bottom').setText('Views'))), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('center')
            .setAttribute('style', 'padding: 0 10px 0 10px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-top').setText(this._props.favourites), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('br'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('span').addClass('typo-bottom').setText('Favorites')))))))))));
    }
}


/***/ }),
/* 94 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Leaderboard": () => (/* binding */ Leaderboard)
/* harmony export */ });
/* harmony import */ var _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(44);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _util_Logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(49);




class Leaderboard {
    constructor() {
        this._settingsStorage = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_1__.SettingsStorage();
        this._logger = new _util_Logger__WEBPACK_IMPORTED_MODULE_3__.Logger(this._settingsStorage.get('enableScriptLogger'), 'Leaderboard');
    }
    _adjustPlayerLinks() {
        const donatorStorage = new _features_donators_DonatorsStorage__WEBPACK_IMPORTED_MODULE_0__.DonatorsStorage();
        (0,_util_J__WEBPACK_IMPORTED_MODULE_2__.all)('tr').forEach((el) => {
            const usernameLink = el.clone().find('a.title');
            const username = usernameLink.getText().trim();
            const isDonator = donatorStorage.getDonatorStatus(username).isDonator;
            if (isDonator) {
                usernameLink.setText(username + ' ☕');
            }
        });
    }
    run() {
        this._logger.debug('Running');
        this._adjustPlayerLinks();
    }
}


/***/ }),
/* 95 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseImmediate": () => (/* binding */ BaseImmediate)
/* harmony export */ });
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(25);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _util_observe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(35);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(51);





const TROPHY_ICON_MAP = {
    '/lib/img/icons/40-platinum.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x40.platinum,
    '/lib/img/icons/buttons/platinum.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x24.platinum,
    '/lib/img/icons/40-gold.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x40.gold,
    '/lib/img/icons/buttons/gold.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x24.gold,
    '/lib/img/icons/40-silver.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x40.silver,
    '/lib/img/icons/buttons/silver.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x24.silver,
    '/lib/img/icons/40-bronze.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x40.bronze,
    '/lib/img/icons/buttons/bronze.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x24.bronze,
    '/lib/img/icons/40-hidden.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x40.hidden,
    '/lib/img/icons/buttons/hidden.png': _util_constants__WEBPACK_IMPORTED_MODULE_1__.NEW_TROPHY_ICONS.x24.hidden
};
class BaseImmediate {
    constructor(featurePath, pathSegment1, pathSegment2) {
        this._featurePath = featurePath;
        this._pathSegment1 = pathSegment1;
        this._pathSegment2 = pathSegment2;
    }
    _replaceTrophyIcons() {
        function replaceTrophyIcon(imageElement) {
            const src = imageElement.getAttribute('src');
            if (src in TROPHY_ICON_MAP) {
                imageElement.setAttribute('src', TROPHY_ICON_MAP[src]);
            }
        }
        function adjustNode(node) {
            if (node.childNodes.length > 0) {
                node.childNodes.forEach(node => adjustNode(node));
            }
            if (node.nodeName === 'IMG') {
                const imageElement = new _util_J__WEBPACK_IMPORTED_MODULE_2__.J(node);
                replaceTrophyIcon(imageElement);
            }
        }
        // Action time...
        (0,_util_J__WEBPACK_IMPORTED_MODULE_2__.all)('img[src^="/lib/img/icons/"]').forEach(el => replaceTrophyIcon(el));
        (0,_util_observe__WEBPACK_IMPORTED_MODULE_3__.htmlObserve)((mutationList) => {
            mutationList.forEach(mutation => mutation.addedNodes.forEach(node => adjustNode(node)));
        });
    }
    run() {
        console.debug('BaseImmediate module is running');
        // Global style
        (0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_4__.injectStylesheet)(_util_stylesheet__WEBPACK_IMPORTED_MODULE_4__.STYLESHEET_GLOBAL);
        if (new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_0__.SettingsStorage().get('useNewTrophyIcons')) {
            if (this._featurePath !== 'guide' || this._pathSegment2 !== 'edit') {
                this._replaceTrophyIcons();
            }
        }
    }
}


/***/ }),
/* 96 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GuideImmediate": () => (/* binding */ GuideImmediate)
/* harmony export */ });
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _util_observe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(35);



class GuideImmediate {
    constructor(subSection) {
        this._subSection = subSection;
    }
    run() {
        console.debug('GuideImmediate module is running');
        if (this._subSection != null) {
            // Edit guide, comments and other stuff...
            return;
        }
        if (!new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_0__.SettingsStorage().get('guideLazyLoadMedia')) {
            return;
        }
        (0,_util_observe__WEBPACK_IMPORTED_MODULE_2__.htmlObserve)((mutationList) => {
            mutationList.forEach(mutation => mutation.addedNodes.forEach(node => {
                if (node.nodeName === 'IMG') {
                    const imageElement = new _util_J__WEBPACK_IMPORTED_MODULE_1__.J(node);
                    const src = imageElement.getAttribute('src');
                    imageElement.removeAttribute('src');
                    imageElement.addClass('lazy');
                    imageElement.setAttribute('data-src', src);
                }
                if (node.nodeName === 'DIV' && node.classList.contains('lazyYT')) {
                    const videoDiv = new _util_J__WEBPACK_IMPORTED_MODULE_1__.J(node);
                    const videoId = videoDiv.getAttribute('data-youtube-id');
                    videoDiv
                        .after(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('div')
                        .setAttribute('style', 'position: relative; padding-bottom: 56.25%; height: 0; margin: 0;')
                        .append(_util_J__WEBPACK_IMPORTED_MODULE_1__.J.c('iframe')
                        .addClass('lazy')
                        .setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;')
                        .setAttribute('frameborder', '0')
                        .setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
                        .setAttribute('allowfullscreen', 'allowfullscreen')
                        .setAttribute('data-src', `https://www.youtube.com/embed/${videoId}`)));
                    videoDiv.remove();
                }
            }));
        });
    }
}


/***/ }),
/* 97 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Guides": () => (/* binding */ Guides)
/* harmony export */ });
/* harmony import */ var _features_guide_AdvancedGuideSearchHelpPanel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(98);
/* harmony import */ var _features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(69);
/* harmony import */ var _features_guide_guide_filter_guide_filter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(99);
/* harmony import */ var _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(43);
/* harmony import */ var _ui_Pagination__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(101);
/* harmony import */ var _ui_PlatformsColumns__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(71);
/* harmony import */ var _ui_SearchBox__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(63);
/* harmony import */ var _ui_TrophiesColumn__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(72);
/* harmony import */ var _ui_ui_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(39);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(3);
/* harmony import */ var _util_Logger__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(49);
/* harmony import */ var _util_constants__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(25);
/* harmony import */ var _util_date__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(55);
/* harmony import */ var _util_fetch__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(13);
/* harmony import */ var _util_stylesheet__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(51);
/* harmony import */ var _util_unsafe__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(34);

















const PAGE_SIZE = 50;
function getSourceFavicon(attributes) {
    if ((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePSNP)(attributes)) {
        return _util_constants__WEBPACK_IMPORTED_MODULE_12__.FAVICON_URL + 'http://psnprofiles.com';
    }
    if ((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePowerPyx)(attributes)) {
        return _util_constants__WEBPACK_IMPORTED_MODULE_12__.FAVICON_URL + 'http://powerpyx.com';
    }
    if ((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourceKnoef)(attributes)) {
        return _util_constants__WEBPACK_IMPORTED_MODULE_12__.FAVICON_URL + 'http://knoef.info';
    }
    if ((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePlatGet)(attributes)) {
        return _util_constants__WEBPACK_IMPORTED_MODULE_12__.FAVICON_URL + 'https://platget.com/';
    }
    if ((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePlaystationTrophies)(attributes)) {
        return _util_constants__WEBPACK_IMPORTED_MODULE_12__.FAVICON_URL + 'https://www.playstationtrophies.org/';
    }
    if ((0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourceVGL)(attributes)) {
        return _util_constants__WEBPACK_IMPORTED_MODULE_12__.FAVICON_URL + 'https://videogamelizard.com/';
    }
    return 'Unknown';
}
function getTrophyListIcon(image) {
    if (image == null || image === '') {
        return _util_constants__WEBPACK_IMPORTED_MODULE_12__.DEFAULT_TROPHY_LIST_ICON;
    }
    if (image.includes('-')) {
        return 'https://img.psnprofiles.com/game/s/' + image;
    }
    return 'https://i.psnprofiles.com/games/' + image;
}
class GuideListRow extends _util_J__WEBPACK_IMPORTED_MODULE_10__.JC {
    constructor(id, item) {
        super('tr');
        this._id = id;
        this._item = item;
        this._build();
    }
    _build() {
        const [difficulty, playthroughs, hours] = this._item.r;
        const publishedDate = (0,_util_date__WEBPACK_IMPORTED_MODULE_13__.getPrettyDate)(this._item.d);
        this
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('td')
            .setAttribute('style', 'width: 1%;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('a')
            .setAttribute('href', (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.getGuideHref)(this._item.a, this._id).href)
            .condition(!(0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePSNP)(this._item.a), x => x.setAttribute('target', '_blank'))
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('picture')
            .addClass('game')
            .setAttribute('alt', this._item.n)
            .setAttribute('style', 'text-align: center;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('img')
            .setAttribute('src', getTrophyListIcon(this._item.i))))), _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('td')
            .setAttribute('style', 'width: 100%;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div')
            .addClass('ellipsis')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('a')
            .addClass('title')
            .setAttribute('href', (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.getGuideHref)(this._item.a, this._id).href)
            .condition(!(0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePSNP)(this._item.a), x => x.setAttribute('target', '_blank'))
            .append(this._item.n)
            .condition(!(0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePSNP)(this._item.a), x => x
            .append(' ', new _ui_Icon__WEBPACK_IMPORTED_MODULE_4__.Icon('fa-external-link'))))), _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div')
            .addClass('small-info')
            .setAttribute('style', 'margin-top: 4px;')
            .condition(this._item.g != null && this._item.g.length > 0, (el) => {
            var _a;
            el.append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('a')
                .setAttribute('href', 'trophies/' + ((_a = this._item.g) !== null && _a !== void 0 ? _a : [])[0])
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_4__.Icon('fa-list'))
                .apply((x) => (0,_util_unsafe__WEBPACK_IMPORTED_MODULE_16__.tooltip)(x, 'View Trophy List')), ' ', _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('bullet').setText('•'), ' ');
        })
            .append('By ', ...this._item.u.join(', '))
            .condition(this._item.d != null, (el) => {
            el.append(' ', _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('bullet').setText('•'), ' Published ', ` ${publishedDate.day}`, _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('sup').setText(publishedDate.suffix), ` ${publishedDate.monthName} ${publishedDate.year}`);
        })), new _ui_PlatformsColumns__WEBPACK_IMPORTED_MODULE_6__.PlatformsColumn({
            ps5: (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isPlatformPS5)(this._item.a),
            ps4: (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isPlatformPS4)(this._item.a),
            ps3: (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isPlatformPS3)(this._item.a),
            psvita: (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isPlatformVita)(this._item.a),
            psvr: (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isPlatformVR)(this._item.a),
            pc: (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isPlatformPC)(this._item.a),
        }), this._item.t == null
            ? _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('td')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
                .addClass('separator', 'left')
                .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_4__.Icon('fa-question-circle-o')))
            : new _ui_TrophiesColumn__WEBPACK_IMPORTED_MODULE_8__.TrophiesColumn({
                platinum: this._item.t[0],
                gold: this._item.t[1],
                silver: this._item.t[2],
                bronze: this._item.t[3]
            }, undefined, undefined, true), _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
            .addClass('separator', 'left')
            .append(difficulty == null
            ? new _ui_Icon__WEBPACK_IMPORTED_MODULE_4__.Icon('fa-question-circle-o')
            : _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
                .setText(`${difficulty}/10`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_15__.getDifficultyClass)(difficulty))
                .setAttribute('style', 'color: white; padding: 1px 2px; border-radius: 2px;'))), _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
            .addClass('separator', 'left')
            .append(playthroughs == null
            ? new _ui_Icon__WEBPACK_IMPORTED_MODULE_4__.Icon('fa-question-circle-o')
            : _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
                .setText(`${playthroughs}x`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_15__.getPlaythroughsClass)(playthroughs))
                .setAttribute('style', 'color: white; padding: 1px 2px; border-radius: 2px;'))), _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
            .addClass('separator', 'left')
            .append(hours == null
            ? new _ui_Icon__WEBPACK_IMPORTED_MODULE_4__.Icon('fa-question-circle-o')
            : _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
                .setText(`${hours}h`)
                .addClass((0,_util_stylesheet__WEBPACK_IMPORTED_MODULE_15__.getHoursClass)(hours))
                .setAttribute('style', 'color: white; padding: 1px 2px; border-radius: 2px;'))), _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('td')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
            .addClass('separator', 'left')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('img')
            .setAttribute('width', '16')
            .setAttribute('height', '16')
            .setAttribute('src', getSourceFavicon(this._item.a)))));
    }
}
class Guides {
    constructor(pathSegment) {
        this._guides = {};
        this._searchValue = '';
        this._page = 1;
        this._maxPages = 1;
        this._tbody = _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('tbody');
        this._tableTitle = _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('h3')
            .setText('Advanced Guide Search');
        this._topPagination = new _ui_Pagination__WEBPACK_IMPORTED_MODULE_5__.Pagination(this._page, this._maxPages, (currentPage) => {
            this._page = currentPage;
            this._setHash(this._searchValue, this._page);
            this._renderRows();
        });
        this._bottomPagination = new _ui_Pagination__WEBPACK_IMPORTED_MODULE_5__.Pagination(this._page, this._maxPages, (currentPage) => {
            this._page = currentPage;
            this._setHash(this._searchValue, this._page);
            this._renderRows();
            scrollTo(0, 0);
        });
        this._processHash = () => {
            const hash = decodeURIComponent(location.hash);
            if (hash.startsWith(_util_constants__WEBPACK_IMPORTED_MODULE_12__.HASH_ADVANCED_SEARCH)) {
                this._stopObservingHash();
                this._initSearch(hash)
                    .catch((err) => {
                    alert('Failed to initialize search: ' + err.message);
                });
            }
        };
        this._settingsStorage = new _features_settings_SettingsStorage__WEBPACK_IMPORTED_MODULE_3__.SettingsStorage();
        this._logger = new _util_Logger__WEBPACK_IMPORTED_MODULE_11__.Logger(this._settingsStorage.get('enableScriptLogger'), 'Guides');
        this._pathSegment = pathSegment;
    }
    _appendAdvancedSearchButton() {
        const target = _util_J__WEBPACK_IMPORTED_MODULE_10__.J.q('div.title-bar');
        target
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('a')
            .setAttribute('href', _util_constants__WEBPACK_IMPORTED_MODULE_12__.HASH_ADVANCED_SEARCH)
            .addClass('button', 'purple')
            .setAttribute('style', 'margin-left: 10px;')
            .setText('Advanced Search'));
    }
    _renderRows() {
        const filteredGuides = (0,_features_guide_guide_filter_guide_filter__WEBPACK_IMPORTED_MODULE_2__.filter)(this._guides, this._searchValue)
            // NOTE: Intentionally filter out any sources that we don't support
            .filter(guide => (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePSNP)(guide.a)
            || (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePowerPyx)(guide.a)
            || (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourceKnoef)(guide.a)
            || (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePlatGet)(guide.a)
            || (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourcePlaystationTrophies)(guide.a)
            || (0,_features_guide_IGuide__WEBPACK_IMPORTED_MODULE_1__.isSourceVGL)(guide.a));
        this._maxPages = Math.max(Math.ceil(Object.keys(filteredGuides).length / PAGE_SIZE), 1);
        this._topPagination.setPageRange(this._page, this._maxPages);
        this._bottomPagination.setPageRange(this._page, this._maxPages);
        this._tableTitle.setText('Advanced Guide Search - ' + filteredGuides.length + ' Guides');
        const startIndex = (this._page - 1) * PAGE_SIZE;
        const endIndex = this._page * PAGE_SIZE;
        const guidesToRender = filteredGuides
            .slice(startIndex, endIndex);
        this._logger.debug('Start index:', startIndex, 'End index (exclusive):', endIndex);
        this._logger.debug('Guides to render:', guidesToRender);
        this._tbody.empty();
        this._tbody.append(...guidesToRender.map((guide) => {
            return new GuideListRow(guide.id, guide);
        }));
    }
    _setHash(q, p) {
        location.replace(_util_constants__WEBPACK_IMPORTED_MODULE_12__.HASH_ADVANCED_SEARCH + '|q=' + q + '&p=' + p);
    }
    async _initSearch(hash) {
        var _a, _b;
        if (hash.startsWith(_util_constants__WEBPACK_IMPORTED_MODULE_12__.HASH_ADVANCED_SEARCH + '|')) {
            const query = hash.replace(_util_constants__WEBPACK_IMPORTED_MODULE_12__.HASH_ADVANCED_SEARCH + '|', '');
            const parsedQuery = new URLSearchParams(query);
            this._searchValue = (_a = parsedQuery.get('q')) !== null && _a !== void 0 ? _a : '';
            this._page = parseInt((_b = parsedQuery.get('p')) !== null && _b !== void 0 ? _b : '1', 10);
        }
        _util_J__WEBPACK_IMPORTED_MODULE_10__.J.q('div.title-bar div.navigation li.active').removeClass('active');
        const container = _util_J__WEBPACK_IMPORTED_MODULE_10__.J.q('#content');
        container.empty();
        container
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('center')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('h1')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('i')
            .addClass('fa', 'fa-spinner', 'fa-spin', 'fa-fw')
            .setAttribute('aria-hidden', 'true'), ' Loading...')));
        this._guides = await (0,_util_fetch__WEBPACK_IMPORTED_MODULE_14__.fetchJson)(_util_constants__WEBPACK_IMPORTED_MODULE_12__.LINK_GUIDES_FULL);
        container.empty();
        const searchBox = new _ui_SearchBox__WEBPACK_IMPORTED_MODULE_7__.SearchBox('Search guides', value => {
            this._searchValue = value;
            this._page = 1;
            this._setHash(this._searchValue, this._page);
            this._renderRows();
        });
        searchBox.setInputValue(this._searchValue);
        container
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div')
            .addClass('col-xs-12')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div')
            .addClass('title', 'flex', 'v-align')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div')
            .addClass('grow')
            .append(this._tableTitle))
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div')
            .addClass('no-shrink')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('a')
            .setAttribute('href', '#')
            .setText('Help')
            .click((e) => {
            e.preventDefault();
            (0,_ui_ui_utils__WEBPACK_IMPORTED_MODULE_9__.appendPanel)(new _features_guide_AdvancedGuideSearchHelpPanel__WEBPACK_IMPORTED_MODULE_0__.AdvancedGuideSearchHelpPanel((example, mode) => {
                if (mode === 'replace') {
                    this._searchValue = example;
                }
                else {
                    this._searchValue += (' ' + example);
                }
                searchBox.setInputValue(this._searchValue);
                this._setHash(this._searchValue, this._page);
                this._renderRows();
            }));
        }))))
            .append(searchBox)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div')
            .addClass('box', 'no-top-border')
            .setAttribute('style', 'padding: 5px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div').setText('See "Help" for the list of all search options.'), _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span').setText('Examples: '), _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
            .setCss('cursor', 'pointer')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('code')
            .addClass('psnpp-code')
            .setText('platinum:no dlc:no type:trophy-guide order:-published'))
            .click((e, el) => {
            e.preventDefault();
            this._searchValue = el.getText();
            searchBox.setInputValue(this._searchValue);
            this._setHash(this._searchValue, this._page);
            this._renderRows();
        }), ' or ', _util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('span')
            .setCss('cursor', 'pointer')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('code')
            .addClass('psnpp-code')
            .setText('difficulty:>7 trophies:<30'))
            .click((e, el) => {
            e.preventDefault();
            this._searchValue = el.getText();
            searchBox.setInputValue(this._searchValue);
            this._setHash(this._searchValue, this._page);
            this._renderRows();
        })))
            .append(this._topPagination)
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('div')
            .addClass('box', 'no-top-border')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_10__.J.c('table')
            .addClass('zebra', 'list-table')
            .append(this._tbody)))
            .append(this._bottomPagination));
        this._renderRows();
    }
    _startObservingHash() {
        window.addEventListener('hashchange', this._processHash);
    }
    _stopObservingHash() {
        window.removeEventListener('hashchange', this._processHash);
    }
    run() {
        this._logger.debug('Running');
        if (this._pathSegment != null) {
            return;
        }
        this._startObservingHash();
        this._processHash();
        this._appendAdvancedSearchButton();
    }
}


/***/ }),
/* 98 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AdvancedGuideSearchHelpPanel": () => (/* binding */ AdvancedGuideSearchHelpPanel)
/* harmony export */ });
/* harmony import */ var _ui_Icon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(43);
/* harmony import */ var _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(31);
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);



class AdvancedGuideSearchHelpPanel extends _ui_panel_Panel__WEBPACK_IMPORTED_MODULE_1__.Panel {
    constructor(onExampleChosen) {
        super('How to use advanced search');
        this._onExampleChosen = onExampleChosen;
        this._addContent();
    }
    _addHelpText(codeText, description, examples) {
        const ret = [
            _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
                .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('code')
                .addClass('psnpp-code')
                .setAttribute('style', 'background: grey; color: #fff;')
                .setText(codeText), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('span')
                .setText(' - ' + description))
        ];
        if (examples != null) {
            ret.push(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
                .setAttribute('style', 'margin-top: 2px;')
                .append('↳ ', ...examples.map(x => _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('code')
                .addClass('psnpp-code')
                .setAttribute('style', 'margin-right: 5px;')
                .setCss('cursor', 'pointer')
                .setText(x)
                .click(e => {
                e.preventDefault();
                this._onExampleChosen(x, 'append');
                this.remove();
            }))));
        }
        return _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .setAttribute('style', 'margin-bottom: 15px;')
            .append(...ret);
    }
    _addExample(codeText, description) {
        return _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .setAttribute('style', 'margin-bottom: 15px;')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .setText(description), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('span')
            .setCss('cursor', 'pointer')
            .append(new _ui_Icon__WEBPACK_IMPORTED_MODULE_0__.Icon('fa-search'), ' ', _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('code')
            .addClass('psnpp-code')
            .setText(codeText))
            .click(e => {
            e.preventDefault();
            this._onExampleChosen(codeText, 'replace');
            this.remove();
        }))));
    }
    _addContent() {
        this.addContent(_util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .setAttribute('id', 'inner')
            .addClass('inner')
            .append(this._addHelpText('<anything>', 'Search any text inside guide titles.'), this._addHelpText('titleregex', 'Applies regular expression to guide title.', ['titleregex:^K', 'titleregex:[0-9]{4}']), this._addHelpText('type', 'Search by guide type.', ['type:trophy-guide', 'type:guide']), this._addHelpText('src', 'Search by guide source.', ['src:psnp', 'src:pst', 'src:powerpyx', 'src:platget', 'src:knoef', 'src:vgl', 'src:psnp,powerpyx', 'src:-psnp']), this._addHelpText('author', 'Search by author\'s PSN ID. Multiple authors can be separated by comma.', ['author:HusKyCode', 'author:langdon', 'author:arcesius,mori', 'author:+HusKyCode', 'author:HusKyCode,-Koro']), this._addHelpText('difficulty', 'Search by difficulty.', ['difficulty:3', 'difficulty:>7', 'difficulty:<6', 'difficulty:4-6']), this._addHelpText('playthroughs', 'Search by the number of needed playthroughs.', ['playthroughs:1', 'playthroughs:>1', 'playthroughs:<5', 'playthroughs:2-3']), this._addHelpText('hours', 'Search by playtime.', ['hours:15', 'hours:<20', 'hours:>99', 'hours:10-20']), this._addHelpText('trophies', 'Search by the number of trophies.', ['trophies:50', 'trophies:<20', 'trophies:>99', 'trophies:50-100']), this._addHelpText('dlc', 'Guide is written for DLC.', ['dlc:yes', 'dlc:no']), this._addHelpText('platinum', 'Guide is written for a game with platinum trophy. This also includes DLC guides - use "dlc:no" to remove them.', ['platinum:yes', 'platinum:no']), this._addHelpText('buggy', 'Guide mentions buggy trophies.', ['buggy:yes', 'buggy:no']), this._addHelpText('online', 'Guide mentions online trophies.', ['online:yes', 'online:no']), this._addHelpText('missable', 'Guide mentions missable trophies.', ['missable:yes', 'missable:no']), this._addHelpText('order', 'Order results by guide property. Prepend property name with "-" to reverse the order.', ['order:title', 'order:hours', 'order:-hours', 'order:difficulty', 'order:playthroughs', 'order:published', 'order:difficulty,hours']), this._addHelpText('platform', 'Search by platform. Multiple platforms can be separated by comma. Prepending platform with "-" blacklists that platform.', ['platform:ps5', 'platform:ps3,-vita', 'platform:ps5,ps4,ps3,vita,vr,pc', 'platform:+vita']), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('h2')
            .setText('Examples'), this._addExample('platinum:no dlc:no type:trophy-guide order:-published', 'Latest trophy guides for games without a platinum trophy.'), this._addExample('hours:>99 difficulty:>7 platform:ps3,-vita', 'Guides for difficult (8+) and lenghty (100+) PS3 games that don\'t exist on PS Vita.'), this._addExample('platform:+vita', 'Guides for PS Vita exclusives.'), this._addExample('difficulty:<3 hours:<6 dlc:no order:difficulty', 'Guides for easy and short games.'), this._addExample('hell let loose dlc:yes', 'All DLC guides for Hell Let Loose.'), this._addExample('titleregex:^A dlc:no hours:5-15 platinum:yes', 'Short games with platinum and starting with letter A.'), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('h2')
            .setText('Credits'), _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('div')
            .append('Big thanks to ', _util_J__WEBPACK_IMPORTED_MODULE_2__.J.c('a').setAttribute('href', '/langdon').setAttribute('target', '_blank').setText('langdon'), ' for providing data as well as the text-based search engine for this feature.')));
    }
}


/***/ }),
/* 99 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filter": () => (/* binding */ filter)
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(70);
/* harmony import */ var _token_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(100);


function filter(guides, searchText) {
    const tokens = new _token_parser__WEBPACK_IMPORTED_MODULE_1__.tokenParser().parse(searchText, [
        'author',
        'buggy',
        'difficulty',
        'dlc',
        'hours',
        'missable',
        'online',
        'order',
        'platform',
        'platinum',
        'playthroughs',
        'src',
        'titleregex',
        'type',
        'trophies',
    ]);
    // parse order details
    const orderFields = !tokens.order
        ? []
        : tokens.order.split(',').map(field => {
            const reverse = field.startsWith('-');
            const property = field.replace('-', '').toLowerCase();
            return { property, reverse };
        });
    // if no order fields are specified, default to showing newest first
    orderFields.push({ property: 'published', reverse: true });
    // remove duplicates while preserving order
    const uniqueOrderFields = orderFields
        .filter((field, index, arr) => arr.findIndex(f => f.property === field.property) === index);
    const punctuationRegex = /[-:,.’'"“”]/g;
    const cleanedUpTerms = tokens.leftOverTerms.toLowerCase()
        .replace(punctuationRegex, '')
        .replace(/ {2}/g, ' ')
        .trim();
    const result = Object.entries(guides)
        .filter(([_, g]) => {
        // the general strategy here:
        // - everything is a match until it's not
        // - so quit (return false to filter) if something is amiss
        // use leftOverTerms to search title
        if (tokens.leftOverTerms) {
            const name = g.n.toLowerCase()
                .replace(punctuationRegex, '')
                .replace(/ {2}/g, ' ')
                .trim();
            if (name.includes(cleanedUpTerms) === false) {
                return false;
            }
        }
        // titleregex token
        if (tokens['titleregex']) {
            try {
                const regex = new RegExp(tokens['titleregex'], 'i');
                if (regex.test(g.n) === false) {
                    return false;
                }
            }
            catch (e) {
                // invalid regex, ignore filter
            }
        }
        // difficulty token
        if (tokens['difficulty'] && compareRatingForFiltering(0, tokens['difficulty'], g) === false) {
            return false;
        }
        // hours token
        if (tokens['hours'] && compareRatingForFiltering(2, tokens['hours'], g) === false) {
            return false;
        }
        // playthroughs token
        if (tokens['playthroughs'] && compareRatingForFiltering(1, tokens['playthroughs'], g) === false) {
            return false;
        }
        // buggy token
        if (tokens['buggy'] && compareYesNoAttributeForFiltering(tokens['buggy'], _types__WEBPACK_IMPORTED_MODULE_0__.HAS_BUGGY_TROPHIES, g) === false) {
            return false;
        }
        // dlc token
        if (tokens['dlc'] && compareYesNoAttributeForFiltering(tokens['dlc'], _types__WEBPACK_IMPORTED_MODULE_0__.IS_DLC, g) === false) {
            return false;
        }
        // missable token
        if (tokens['missable'] && compareYesNoAttributeForFiltering(tokens['missable'], _types__WEBPACK_IMPORTED_MODULE_0__.HAS_MISSABLE_TROPHIES, g) === false) {
            return false;
        }
        // online token
        if (tokens['online'] && compareYesNoAttributeForFiltering(tokens['online'], _types__WEBPACK_IMPORTED_MODULE_0__.HAS_ONLINE_TROPHIES, g) === false) {
            return false;
        }
        // author token
        if (tokens['author']) {
            const guideAuthors = g.u.map(author => author.toLowerCase());
            const mustHaveExclusive = tokens['author']
                .split(',')
                .filter((a) => a.startsWith('+'))
                .map((a) => a.substring(1).toLowerCase());
            if (mustHaveExclusive.length > 0) {
                // For exclusive, the guide must have exactly these authors and no others
                const hasAllExclusive = mustHaveExclusive.every((a) => guideAuthors.some(b => b.includes(a)));
                const hasOnlyExclusive = guideAuthors.every(author => mustHaveExclusive.some(a => author.includes(a)));
                if (!hasAllExclusive || !hasOnlyExclusive) {
                    return false;
                }
            }
            else {
                const mustHave = tokens['author']
                    .split(',')
                    .filter((a) => !a.startsWith('-') && !a.startsWith('+'))
                    .map((a) => a.toLowerCase());
                const cannotHave = tokens['author']
                    .split(',')
                    .filter((a) => a.startsWith('-'))
                    .map((a) => a.substring(1).toLowerCase());
                if (mustHave.length > 0 && mustHave.every((a) => guideAuthors.some(b => b.includes(a))) === false) {
                    return false;
                }
                if (cannotHave.length > 0 && cannotHave.some((a) => guideAuthors.some(b => b.includes(a))) === true) {
                    return false;
                }
            }
        }
        // platform token
        if (tokens['platform']) {
            const guidePlatforms = buildPlatformList(g);
            const mustHaveExclusive = tokens['platform']
                .split(',')
                .filter((p) => p.startsWith('+'))
                .map((p) => {
                const platform = p.substring(1);
                return (platform === 'psv' ? 'vita' : platform).toLowerCase();
            });
            if (mustHaveExclusive.length > 0) {
                // For exclusive, the guide must have exactly these platforms and no others
                const hasAllExclusive = mustHaveExclusive.every((p) => guidePlatforms.includes(p));
                const hasOnlyExclusive = guidePlatforms.every(platform => mustHaveExclusive.includes(platform));
                if (!hasAllExclusive || !hasOnlyExclusive || guidePlatforms.length !== mustHaveExclusive.length) {
                    return false;
                }
            }
            else {
                const mustHave = tokens['platform']
                    .split(',')
                    .filter((p) => !p.startsWith('-') && !p.startsWith('+'))
                    .map((p) => (p === 'psv' ? 'vita' : p).toLowerCase());
                const cannotHave = tokens['platform']
                    .split(',')
                    .filter((p) => p.startsWith('-'))
                    .map((p) => (p === '-psv' ? '-vita' : p).substring(1).toLowerCase());
                if (mustHave.length > 0 && mustHave.every((p) => guidePlatforms.some(b => b == p)) === false) {
                    return false;
                }
                if (cannotHave.length > 0 && cannotHave.some((p) => guidePlatforms.includes(p)) === true) {
                    return false;
                }
            }
        }
        // platinum token
        if (tokens['platinum']) {
            // want platinum but there isn't one? bad
            if (tokens['platinum'].toLowerCase() === 'yes' && (!g.t || g.t[0] === 0)) {
                return false;
            }
            // don't want platinum but there is one? bad
            if (tokens['platinum'].toLowerCase() === 'no' && g.t && g.t[0] === 1) {
                return false;
            }
        }
        // src token
        if (tokens['src']) {
            // it's nonsensical to have exclusive sources, so just in case someone tries, just ignore the + character
            const source = tokens['src'].replace(/\+/g, '');
            const mustHave = source
                .split(',')
                .filter((s) => s.startsWith('-') === false)
                .map((s) => s.toLowerCase());
            const cannotHave = source
                .split(',')
                .filter((s) => s.startsWith('-') === true)
                .map((s) => s.substring(1).toLowerCase());
            const guideSources = buildSourceList(g);
            if (mustHave.length > 0 && mustHave.some((s) => guideSources.some(b => b == s)) === false) {
                return false;
            }
            if (cannotHave.length > 0 && cannotHave.some((s) => guideSources.includes(s)) === true) {
                return false;
            }
        }
        // type token
        if (tokens['type']) {
            if (tokens['type'].toLowerCase() === 'trophy-guide' && (g.a & _types__WEBPACK_IMPORTED_MODULE_0__.IS_TROPHY_GUIDE) === 0) {
                return false;
            }
            if (tokens['type'].toLowerCase() === 'guide' && (g.a & _types__WEBPACK_IMPORTED_MODULE_0__.IS_TROPHY_GUIDE) !== 0) {
                return false;
            }
        }
        // trophies token
        if (tokens['trophies']) {
            if (!g.t) {
                // if the guide doesn't even have trophies, don't include it
                return false;
            }
            if (!compareTrophyCountForFiltering(tokens['trophies'], g)) {
                return false;
            }
        }
        // no reason for it not to be a match? return it
        return true;
    })
        .sort((tupleA, tupleB) => {
        const [_, rowA] = tupleA;
        const [__, rowB] = tupleB;
        // iterate through each sort field until we find a non-zero comparison
        for (const { property, reverse } of uniqueOrderFields) {
            const { a, b } = reverse ? { a: rowB, b: rowA } : { a: rowA, b: rowB };
            let comparison = 0;
            switch (property) {
                case 'title':
                    comparison = a.n.localeCompare(b.n);
                    break;
                case 'difficulty':
                    comparison = compareRatingForSorting(0, a, b, reverse ? 0 : 9999);
                    break;
                case 'playthroughs':
                    comparison = compareRatingForSorting(1, a, b, reverse ? 0 : 9999);
                    break;
                case 'hours':
                    comparison = compareRatingForSorting(2, a, b, reverse ? 0 : 9999);
                    break;
                case 'published':
                    comparison = a.d - b.d;
                    break;
                default:
                    // unknown field, skip
                    continue;
            }
            // if this field produces a non-zero comparison, use it
            if (comparison !== 0) {
                return comparison;
            }
        }
        // all fields were equal, maintain original order
        return 0;
    })
        .map(([id, guide]) => ({
        id,
        ...guide,
    }));
    // turn the entries back into an object
    return result;
}
// TODO its own file? its own tests?
function buildPlatformList(guide) {
    const platforms = [];
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_PS3) {
        platforms.push('ps3');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_PS4) {
        platforms.push('ps4');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_PS5) {
        platforms.push('ps5');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_PC) {
        platforms.push('pc');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_VITA) {
        platforms.push('vita');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.PLATFORM_VR) {
        platforms.push('vr');
    }
    return platforms;
}
// TODO its own file? its own tests?
function buildSourceList(guide) {
    const sources = [];
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_PSNP) {
        sources.push('psnp');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_KNOEF) {
        sources.push('knoef');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_PLATGET) {
        sources.push('platget');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_PLAYSTATIONTROPHIES) {
        sources.push('pst');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_POWERPYX) {
        sources.push('powerpyx');
    }
    if (guide.a & _types__WEBPACK_IMPORTED_MODULE_0__.SOURCE_VIDEOGAMELIZARD) {
        sources.push('vgl');
    }
    return sources;
}
// TODO its own file? its own tests?
function compareRatingForFiltering(index, tokenValue, guide) {
    // check for range pattern (e.g., "4-6")
    if (tokenValue.includes('-') && !tokenValue.startsWith('<') && !tokenValue.startsWith('>')) {
        const [minStr, maxStr] = tokenValue.split('-');
        const minValue = Number(minStr);
        const maxValue = Number(maxStr);
        if (!isNaN(minValue) && !isNaN(maxValue)) {
            const guideValue = guide.r != null && guide.r[index] ? guide.r[index] : 0;
            // inclusive range: >= min and < (max + 1)
            if (guideValue >= minValue && guideValue < maxValue + 1) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    const difficultyNumber = Number(tokenValue.replace(/<|>/, ''));
    if (tokenValue.startsWith('>')) {
        // if difficulty starts with ">" find guides with higher difficulty
        if (guide.r == null || !guide.r[index] || guide.r[index] <= difficultyNumber) {
            return false;
        }
    }
    else if (tokenValue.startsWith('<')) {
        // if difficulty starts with "<" find guides with lower difficulty
        if (guide.r == null || !guide.r[index] || guide.r[index] >= difficultyNumber) {
            return false;
        }
    }
    else if (!isNaN(difficultyNumber)) {
        // if difficulty is a number, find perfect matches
        if (guide.r[index] !== difficultyNumber) {
            return false;
        }
    }
    return true;
}
// TODO its own file? its own tests?
function compareTrophyCountForFiltering(tokenValue, guide) {
    const guideTrophyCount = guide.t ? guide.t.reduce((p, c) => p + c, 0) : 0;
    // check for range pattern (e.g., "20-50")
    if (tokenValue.includes('-') && !tokenValue.startsWith('<') && !tokenValue.startsWith('>')) {
        const [minStr, maxStr] = tokenValue.split('-');
        const minValue = Number(minStr);
        const maxValue = Number(maxStr);
        if (!isNaN(minValue) && !isNaN(maxValue)) {
            // inclusive range: >= min and <= max
            if (guideTrophyCount >= minValue && guideTrophyCount <= maxValue) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    const desiredTrophyCount = Number(tokenValue.replace(/<|>/, ''));
    if (tokenValue.startsWith('>')) {
        // if trophy count starts with ">" find guides with a higher count
        if (guideTrophyCount <= desiredTrophyCount) {
            return false;
        }
    }
    else if (tokenValue.startsWith('<')) {
        // if trophy count starts with "<" find guides with a lower count
        if (guideTrophyCount >= desiredTrophyCount) {
            return false;
        }
    }
    else if (!isNaN(desiredTrophyCount)) {
        // if trophy count is a number, find perfect matches
        if (guideTrophyCount !== desiredTrophyCount) {
            return false;
        }
    }
    return true;
}
// TODO its own file? its own tests?
function compareRatingForSorting(index, a, b, defaultValue) {
    const valueA = a.r != null && a.r[index] ? a.r[index] : defaultValue;
    const valueB = b.r != null && b.r[index] ? b.r[index] : defaultValue;
    return valueA - valueB;
}
// TODO its own file? its own tests?
function compareYesNoAttributeForFiltering(tokenValue, attribute, guide) {
    if (tokenValue.toLowerCase() === 'yes' && (guide.a & attribute) === 0) {
        return false;
    }
    if (tokenValue.toLowerCase() === 'no' && (guide.a & attribute) !== 0) {
        return false;
    }
    return true;
}


/***/ }),
/* 100 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "tokenParser": () => (/* binding */ tokenParser)
/* harmony export */ });
class tokenParser {
    constructor() {
        this.STATE_TOKEN_OR_TEXT = 1;
        this.STATE_TEXT_FOR_TOKEN = 2;
        this.ACTION_IGNORE = 1;
        this.ACTION_APPEND = 2;
        this.ACTION_COMPLETE = 3;
    }
    parse(input, validTokens = []) {
        const textToParse = (input || '') + '\x01';
        const tokens = { leftOverTerms: '', };
        let action, // TODO enum/or piped const list
        chr, i, parensLevel = 0, state = this.STATE_TOKEN_OR_TEXT, textBeingBuilt = '', tokenBeingBuilt = '';
        for (i = 0; i < textToParse.length; i++) {
            chr = textToParse[i];
            action = this.ACTION_IGNORE;
            switch (chr) {
                case ':':
                    if (state === this.STATE_TOKEN_OR_TEXT) {
                        if (validTokens.length === 0 || validTokens.includes(tokenBeingBuilt) === true) {
                            state = this.STATE_TEXT_FOR_TOKEN;
                        }
                        else {
                            action = this.ACTION_APPEND;
                        }
                    }
                    else if (state === this.STATE_TEXT_FOR_TOKEN) {
                        action = this.ACTION_APPEND;
                    }
                    break;
                case '(':
                    if (state === this.STATE_TEXT_FOR_TOKEN) {
                        parensLevel += 1;
                    }
                    if (parensLevel > 1) {
                        action = this.ACTION_APPEND;
                    }
                    break;
                case ')':
                    if (state === this.STATE_TOKEN_OR_TEXT) {
                        action = this.ACTION_APPEND;
                    }
                    else if (state === this.STATE_TEXT_FOR_TOKEN) {
                        parensLevel -= 1;
                        if (parensLevel === 0) {
                            action = this.ACTION_COMPLETE;
                        }
                        else {
                            action = this.ACTION_APPEND;
                        }
                    }
                    break;
                case ' ':
                    if (state === this.STATE_TOKEN_OR_TEXT) {
                        if (tokenBeingBuilt !== '') {
                            action = this.ACTION_COMPLETE;
                        }
                    }
                    else if (state === this.STATE_TEXT_FOR_TOKEN) {
                        if (parensLevel === 0) {
                            action = this.ACTION_COMPLETE;
                        }
                        else if (parensLevel > 0) {
                            action = this.ACTION_APPEND;
                        }
                    }
                    break;
                case '\x01':
                    if (parensLevel > 0) {
                        state = this.STATE_TOKEN_OR_TEXT;
                        action = this.ACTION_COMPLETE;
                    }
                    else {
                        action = this.ACTION_COMPLETE;
                    }
                    break;
                default:
                    action = this.ACTION_APPEND;
                    break;
            }
            switch (action) {
                case this.ACTION_APPEND:
                    if (state === this.STATE_TOKEN_OR_TEXT) {
                        tokenBeingBuilt += chr;
                    }
                    else if (state === this.STATE_TEXT_FOR_TOKEN) {
                        textBeingBuilt += chr;
                    }
                    break;
                case this.ACTION_COMPLETE:
                    if (state === this.STATE_TOKEN_OR_TEXT) {
                        tokens.leftOverTerms += ((tokens.leftOverTerms) ? ' ' : '') + tokenBeingBuilt;
                    }
                    else if (state === this.STATE_TEXT_FOR_TOKEN) {
                        tokens[tokenBeingBuilt] = (tokens[tokenBeingBuilt] || '') + textBeingBuilt;
                        state = this.STATE_TOKEN_OR_TEXT;
                    }
                    textBeingBuilt = '';
                    tokenBeingBuilt = '';
                    break;
            }
        }
        return tokens;
    }
}


/***/ }),
/* 101 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Pagination": () => (/* binding */ Pagination)
/* harmony export */ });
/* harmony import */ var _util_J__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

class Pagination extends _util_J__WEBPACK_IMPORTED_MODULE_0__.JC {
    constructor(currentPage, maxPage, onPageChange) {
        super('div');
        this._currentPage = currentPage;
        this._maxPage = maxPage;
        this._onPageChange = onPageChange;
        this._build();
    }
    _getNumbers() {
        const left = 1;
        const right = this._maxPage;
        const midLow = Math.max(1, this._currentPage - 3);
        const midHigh = Math.min(this._currentPage + 3, this._maxPage);
        const numberOfMidValues = midHigh - midLow + 1;
        const mid = [...Array(numberOfMidValues).keys()].map(x => x + midLow);
        return {
            left,
            right,
            mid,
            printLeft: !mid.includes(left),
            printRight: !mid.includes(right),
        };
    }
    _build() {
        const { left, right, mid, printLeft, printRight } = this._getNumbers();
        const getA = (page) => {
            return _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
                .setAttribute('href', '#')
                .addClass('typo-button')
                .setText(page.toString())
                .condition(this._currentPage === page, x => x.addClass('active'))
                .click((e) => {
                e.preventDefault();
                this._currentPage = page;
                this._onPageChange(this._currentPage);
            });
        };
        this
            .addClass('box', 'no-top-border')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('row', 'center-xs')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('div')
            .addClass('col-xs-12')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('ul')
            .addClass('pagination')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .addClass('button')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setText('‹')
            .setAttribute('href', '#')
            .click(e => {
            e.preventDefault();
            if (this._currentPage > 1) {
                this._currentPage--;
                this._onPageChange(this._currentPage);
            }
        })))
            .condition(printLeft, (el) => {
            el.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').append(getA(left)), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').addClass('dots').setText('•'));
        })
            .append(...mid.map(number => _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').append(getA(number))))
            .condition(printRight, (el) => {
            el.append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').addClass('dots').setText('•'), _util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li').append(getA(right)));
        })
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('li')
            .addClass('button')
            .append(_util_J__WEBPACK_IMPORTED_MODULE_0__.J.c('a')
            .setText('›')
            .setAttribute('href', '#')
            .click(e => {
            e.preventDefault();
            if (this._currentPage < this._maxPage) {
                this._currentPage++;
                this._onPageChange(this._currentPage);
            }
        }))))));
    }
    setPageRange(currentPage, maxPage) {
        this._currentPage = currentPage;
        this._maxPage = maxPage;
        this.empty();
        this._build();
    }
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _launcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _util_user__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(19);


function onLoad() {
    (async function start() {
        try {
            await (0,_launcher__WEBPACK_IMPORTED_MODULE_0__.launchAfterDomContentLoaded)();
        }
        catch (e) {
            console.error('PSNP+ launch failed (onLoad)', e);
        }
    })();
}
console.debug('PSNP+ is running, version', "11.14");
if ((0,_util_user__WEBPACK_IMPORTED_MODULE_1__.isLoggedIn)()) {
    (0,_launcher__WEBPACK_IMPORTED_MODULE_0__.launchImmediately)();
    if (document.readyState === 'complete') {
        onLoad();
    }
    else {
        window.addEventListener('load', () => {
            onLoad();
        });
    }
}
else {
    console.debug('User not logged in. Stopping PSNP+.');
}

})();

/******/ })()
;

/* ====================================================================
   PSNP++ by Trippixn
   ==================================================================== */

(() => {
  // userscript/src/doc.mjs
  var DOC_VERSION = 1;
  var META_FIELDS = [
    "name",
    "tags",
    "removeStartedGames",
    "removeGames",
    "orderBy",
    "direction",
    "note",
    "timestamp"
  ];
  function emptyDoc() {
    return { version: DOC_VERSION, lists: {} };
  }
  function isRemoteList(list) {
    return typeof list.url === "string" && list.url !== "";
  }
  function splitRemote(lists) {
    const syncable = [];
    const remote = [];
    for (const list of lists) {
      (isRemoteList(list) ? remote : syncable).push(list);
    }
    return { syncable, remote };
  }
  function toDoc(lists) {
    const doc = emptyDoc();
    for (const list of splitRemote(lists).syncable) {
      const meta = { updatedAt: 0 };
      for (const field of META_FIELDS) meta[field] = list[field];
      const games = {};
      const gameOrder = [];
      for (const game of list.games ?? []) {
        games[game.id] = { ...game, updatedAt: 0 };
        gameOrder.push(game.id);
      }
      doc.lists[list.id] = {
        meta,
        games,
        gameOrder,
        orderUpdatedAt: 0,
        deletedGames: {},
        deletedAt: null
      };
    }
    return doc;
  }
  function fromDoc(doc) {
    const lists = [];
    for (const [listId, node] of Object.entries(doc.lists)) {
      if (node.deletedAt != null) continue;
      const ordered = node.gameOrder.filter((id) => node.games[id] != null);
      const seen = new Set(ordered);
      for (const id of Object.keys(node.games)) {
        if (!seen.has(id)) ordered.push(id);
      }
      const list = { id: listId };
      for (const field of META_FIELDS) list[field] = node.meta[field];
      list.games = ordered.map((id) => {
        const { updatedAt, ...game } = node.games[id];
        return game;
      });
      lists.push(list);
    }
    return lists;
  }

  // userscript/src/sync-client.mjs
  function gmRequest(options) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        ...options,
        onload: (response) => resolve({ status: response.status, responseText: response.responseText }),
        onerror: () => reject(new Error("Network error")),
        ontimeout: () => reject(new Error("Request timed out")),
        onabort: () => reject(new Error("Request aborted"))
      });
    });
  }
  function parseBody(response) {
    try {
      return JSON.parse(response.responseText);
    } catch {
      const snippet = String(response.responseText ?? "").slice(0, 120);
      throw new Error(`Malformed response body (HTTP ${response.status}): ${snippet}`);
    }
  }
  function assertDocVersion(doc) {
    if (doc == null || doc.version !== DOC_VERSION) {
      throw new Error(`Unsupported document version: ${doc?.version}`);
    }
  }
  function createSyncClient({
    endpoint,
    key,
    request = gmRequest,
    timeoutMs = 15e3,
    documentKey = null
  }) {
    const base = String(endpoint).replace(/\/+$/, "");
    const headers = { "X-Sync-Key": key, "Content-Type": "application/json" };
    const url = documentKey == null ? `${base}/state` : `${base}/state?document=${encodeURIComponent(documentKey)}`;
    return {
      async getState() {
        const response = await request({
          method: "GET",
          url,
          headers,
          timeout: timeoutMs
        });
        if (response.status !== 200) {
          throw new Error(`Sync server returned ${response.status}`);
        }
        const body = parseBody(response);
        assertDocVersion(body.doc);
        return { revision: body.revision, updatedAt: body.updatedAt, doc: body.doc };
      },
      async putState(baseRevision, doc) {
        const response = await request({
          method: "PUT",
          url,
          headers,
          timeout: timeoutMs,
          data: JSON.stringify({ baseRevision, doc })
        });
        if (response.status === 409) {
          const body = parseBody(response);
          assertDocVersion(body.doc);
          return { ok: false, conflict: true, revision: body.revision, doc: body.doc };
        }
        if (response.status !== 200) {
          throw new Error(`Sync server returned ${response.status}`);
        }
        return { ok: true, revision: parseBody(response).revision };
      }
    };
  }

  // userscript/src/config.mjs
  var ENDPOINT_KEY = "psnppp.endpoint";
  var SECRET_KEY = "psnppp.key";
  var DEFAULT_ENDPOINT = "https://trippixn.com/api/psnppp";
  async function loadConfig() {
    const endpoint = await GM.getValue(ENDPOINT_KEY, DEFAULT_ENDPOINT);
    const key = await GM.getValue(SECRET_KEY, "");
    return { endpoint, key };
  }
  async function saveConfig({ endpoint, key }) {
    await GM.setValue(ENDPOINT_KEY, endpoint);
    await GM.setValue(SECRET_KEY, key);
  }
  var AUTO_CONFIRM_REMOVE_KEY = "psnppp.autoConfirmRemove";
  var AUTO_CONFIRM_REMOVE_DEFAULT = true;
  async function loadAutoConfirmRemove() {
    const stored = await GM.getValue(AUTO_CONFIRM_REMOVE_KEY, AUTO_CONFIRM_REMOVE_DEFAULT);
    return stored !== false;
  }
  async function saveAutoConfirmRemove(enabled) {
    await GM.setValue(AUTO_CONFIRM_REMOVE_KEY, enabled === true);
  }
  function isAllowedEndpoint(endpoint) {
    let parsed;
    try {
      parsed = new URL(String(endpoint));
    } catch {
      return false;
    }
    if (parsed.protocol === "https:") return true;
    if (parsed.protocol !== "http:") return false;
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  }
  var INSECURE_ENDPOINT_MESSAGE = "That endpoint was not saved. The sync key is sent as a request header, so the endpoint must be https:// (http:// is allowed only for localhost or 127.0.0.1).";
  function describeStoredKey(key) {
    return key ? "One is already stored. Leave this blank to keep it." : "None stored yet.";
  }
  async function applyConfig(submitted) {
    const endpoint = String(submitted?.endpoint ?? "").trim();
    const rawKey = submitted?.key;
    if (!isAllowedEndpoint(endpoint)) {
      return { ok: false, message: INSECURE_ENDPOINT_MESSAGE };
    }
    const current = await loadConfig();
    const typedKey = String(rawKey ?? "").trim();
    const config = { endpoint, key: typedKey === "" ? current.key : typedKey };
    await saveConfig(config);
    return { ok: true, config };
  }

  // userscript/src/backup.mjs
  var INDEX_KEY = "psnppp.backups";
  var MAX_BACKUPS = 5;
  async function saveBackup(lists, now = Date.now()) {
    const index = await GM.getValue(INDEX_KEY, []);
    const id = `psnppp.backup.${now}`;
    await GM.setValue(id, JSON.stringify(lists));
    const next = [{ id, at: now, listCount: lists.length }, ...index];
    const dropped = next.slice(MAX_BACKUPS);
    for (const entry of dropped) await GM.deleteValue(entry.id);
    await GM.setValue(INDEX_KEY, next.slice(0, MAX_BACKUPS));
    return id;
  }
  async function listBackups() {
    return GM.getValue(INDEX_KEY, []);
  }
  async function restoreBackup(id) {
    const raw = await GM.getValue(id, null);
    if (raw == null) throw new Error(`No such backup: ${id}`);
    return JSON.parse(raw);
  }

  // userscript/src/history.mjs
  var HISTORY_KEY = "psnppp.history";
  var MAX_HISTORY = 20;
  async function listSyncHistory() {
    const stored = await GM.getValue(HISTORY_KEY, []);
    return Array.isArray(stored) ? stored : [];
  }
  async function recordSync({ revision, delta }, now = Date.now()) {
    const entries = await listSyncHistory();
    const next = [{ at: now, revision, delta }, ...entries].slice(0, MAX_HISTORY);
    await GM.setValue(HISTORY_KEY, next);
    return next;
  }

  // userscript/src/lists-bridge.mjs
  var LISTS_KEY = "psnpp-lists";
  function readLists(storage) {
    try {
      const raw = storage.getItem(LISTS_KEY);
      if (raw == null) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((l) => l != null && typeof l === "object");
    } catch {
      return [];
    }
  }
  function writeLists(storage, lists) {
    storage.setItem(LISTS_KEY, JSON.stringify(lists));
  }
  function readGameTitles(storage) {
    const titles = /* @__PURE__ */ new Set();
    for (const list of readLists(storage)) {
      const games = list.games;
      if (!Array.isArray(games)) continue;
      for (const game of games) {
        if (game == null || typeof game !== "object") continue;
        const title = game.title;
        if (typeof title === "string" && title !== "") titles.add(title);
      }
    }
    return titles;
  }
  function readSyncable(storage) {
    return splitRemote(readLists(storage));
  }
  function writeSyncable(storage, syncedLists) {
    const { remote } = readSyncable(storage);
    const remoteIds = new Set(remote.map((l) => l.id));
    const cleaned = syncedLists.filter((l) => {
      if (isRemoteList(l)) {
        console.warn("[psnppp] writeSyncable: dropping remote list in syncedLists:", l.id);
        return false;
      }
      if (remoteIds.has(l.id)) {
        console.warn("[psnppp] writeSyncable: dropping syncedList with remote id collision:", l.id);
        return false;
      }
      return true;
    });
    writeLists(storage, [...cleaned, ...remote]);
  }
  function watchLists(storage, onChange, { intervalMs = 2e3, target = globalThis } = {}) {
    let last = storage.getItem(LISTS_KEY);
    let inCheck = false;
    const check = () => {
      if (inCheck) return;
      inCheck = true;
      try {
        const current = storage.getItem(LISTS_KEY);
        if (current === last) return;
        last = current;
        try {
          onChange();
        } catch (e) {
          console.error("[psnppp] Sync callback error:", e);
        }
      } finally {
        last = storage.getItem(LISTS_KEY);
        inCheck = false;
      }
    };
    const proto = target.Storage?.prototype;
    const originalSetItem = proto?.setItem;
    let patchedSetItem;
    if (originalSetItem) {
      patchedSetItem = function(key, value) {
        originalSetItem.call(this, key, value);
        if (key === LISTS_KEY) {
          try {
            check();
          } catch (e) {
            console.error("[psnppp] Storage patch error:", e);
          }
        }
      };
      proto.setItem = patchedSetItem;
    }
    const onStorageEvent = (event) => {
      if (event.key === LISTS_KEY) {
        try {
          check();
        } catch (e) {
          console.error("[psnppp] Storage event error:", e);
        }
      }
    };
    target.addEventListener?.("storage", onStorageEvent);
    const timer = setInterval(() => {
      try {
        check();
      } catch (e) {
        console.error("[psnppp] Poll error:", e);
      }
    }, intervalMs);
    return function stop() {
      if (originalSetItem && proto.setItem === patchedSetItem) {
        proto.setItem = originalSetItem;
      }
      target.removeEventListener?.("storage", onStorageEvent);
      clearInterval(timer);
    };
  }

  // userscript/src/auto-confirm.mjs
  var REMOVE_PREFIX = "Are you sure you want to remove ";
  var REMOVE_SUFFIX = "?";
  function extractRemovedTitle(message) {
    if (typeof message !== "string") return null;
    if (!message.startsWith(REMOVE_PREFIX) || !message.endsWith(REMOVE_SUFFIX)) {
      try {
        console.warn("[psnppp] confirm seen, not the remove prompt:", JSON.stringify(message));
      } catch {
      }
      return null;
    }
    const title = message.slice(REMOVE_PREFIX.length, -REMOVE_SUFFIX.length);
    if (title === "") return null;
    if (title.includes("\n") || title.includes("\r")) return null;
    return title;
  }
  var knows = (titles, title) => titles instanceof Set && titles.has(title);
  function shouldAutoConfirm(message, knownTitles) {
    const title = extractRemovedTitle(message);
    if (title == null) return false;
    const titles = typeof knownTitles === "function" ? knownTitles() : knownTitles;
    if (knows(titles, title)) return true;
    try {
      const known = titles instanceof Set ? [...titles] : [];
      const near = known.filter((t2) => {
        const a = t2.toLowerCase().trim();
        const b = title.toLowerCase().trim();
        return a === b || a.includes(b) || b.includes(a);
      });
      console.warn(
        "[psnppp] not auto-confirming: the dialog names a title that is not in any list.",
        { dialogTitle: title, knownCount: known.length, nearMatches: near.slice(0, 5) }
      );
    } catch {
    }
    return false;
  }
  var INERT = { installed: false, uninstall() {
  } };
  function installAutoConfirm({ target, knownTitles } = {}) {
    if (target == null || typeof target.confirm !== "function") return INERT;
    const original = target.confirm;
    const hadOwn = Object.prototype.hasOwnProperty.call(target, "confirm");
    const descriptor = hadOwn ? Object.getOwnPropertyDescriptor(target, "confirm") : null;
    let active = true;
    function override(...args) {
      try {
        if (active && shouldAutoConfirm(args[0], knownTitles)) return true;
      } catch (error) {
        try {
          console.error("[psnppp] auto-confirm check failed; showing the dialog:", error);
        } catch {
        }
      }
      return Reflect.apply(original, target, args);
    }
    try {
      target.confirm = override;
    } catch (error) {
      console.error("[psnppp] could not install the auto-confirm override:", error);
      return INERT;
    }
    if (target.confirm !== override) {
      console.error("[psnppp] the auto-confirm override did not take; leaving confirm alone.");
      return INERT;
    }
    let removed = false;
    return {
      installed: true,
      uninstall() {
        if (removed) return;
        removed = true;
        active = false;
        try {
          if (target.confirm !== override) return;
          if (descriptor) Object.defineProperty(target, "confirm", descriptor);
          else delete target.confirm;
        } catch (error) {
          console.error("[psnppp] could not restore the original confirm:", error);
        }
      }
    };
  }

  // userscript/src/theme.mjs
  var TOKENS = {
    plate: "#1b1d1f",
    sunken: "#141618",
    control: "#24272a",
    hairline: "#26292b",
    edge: "#33373a",
    quiet: "#646464",
    engrave: "#8a8d91",
    data: "#cfd2d5",
    bright: "#e0e0e0",
    bronze: "#dd8301",
    bronzeDim: "#a77b34",
    silver: "#c3c6cc",
    gold: "#f0c117",
    platinum: "#a9d6ea",
    fault: "#ba4b47",
    faultDim: "#5c3230",
    // The same red as `fault`, in the form rgba() needs. Written out because a
    // hand-converted `rgba(186, 75, 71, …)` elsewhere in the sheet would keep the
    // old colour after `fault` changed, with nothing to catch it.
    faultRgb: "186, 75, 71"
  };
  var TIERS = {
    locked: TOKENS.edge,
    bronze: TOKENS.bronze,
    silver: TOKENS.silver,
    gold: TOKENS.gold,
    platinum: TOKENS.platinum,
    fault: TOKENS.fault
  };
  var LOCKED_TIER = "locked";
  var INDICATOR_ID = "psnppp-indicator";
  var PANEL_ID = "psnppp-panel";
  var PANEL_WIDTH_PX = 300;
  var EDGE_INSET_PX = 12;
  var CHIP_FALLBACK_SIZE = { width: 120, height: 26 };
  var DOCK_SNAP_MS = 220;
  var Z_LAYER = 99999;
  var PLATE_SHADOW = "0 1px 4px rgba(0, 0, 0, .45)";
  var TYPE = {
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    data: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  };
  var STYLE_ID = "psnppp-style";
  var styled = /* @__PURE__ */ new WeakSet();
  var t = TOKENS;
  var tierRules = Object.entries(TIERS).map(
    ([tier, color]) => `
#${INDICATOR_ID}.psnppp-tier-${tier} .psnppp-rail { background: ${color}; }
#${INDICATOR_ID}.psnppp-tier-${tier} .psnppp-label { color: ${tier === LOCKED_TIER ? t.engrave : color}; }`
  ).join("");
  var litTiers = Object.keys(TIERS).filter((tier) => tier !== LOCKED_TIER).map((tier) => `#${INDICATOR_ID}.psnppp-tier-${tier}`).join(",\n");
  var CSS = `
/* A reset that cannot leak: the universal selector is fenced behind our own
   ids, so it only ever reaches our own descendants. psnprofiles.com sets
   margins, floats and text-shadows on plenty of generic elements, and any of
   them landing inside the widget would be a page style reaching in. */
#${INDICATOR_ID},
#${INDICATOR_ID} *,
#${PANEL_ID},
#${PANEL_ID} * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  text-align: left;
  float: none;
  text-shadow: none;
}

/* ---- the chip ---------------------------------------------------------- */

#${INDICATOR_ID} {
  position: fixed;
  right: ${EDGE_INSET_PX}px;
  bottom: ${EDGE_INSET_PX}px;
  z-index: ${Z_LAYER};
  display: inline-flex;
  align-items: stretch;
  gap: 0;
  max-width: calc(100vw - ${EDGE_INSET_PX * 2}px);
  min-height: ${CHIP_FALLBACK_SIZE.height - 2}px;
  overflow: hidden;
  background: ${t.plate};
  border: 1px solid ${t.edge};
  border-radius: 3px;
  box-shadow: ${PLATE_SHADOW};
  cursor: pointer;
  user-select: none;
  touch-action: none;
  opacity: .55;
  transition: opacity .18s ease, border-color .18s ease;
}

/* PSNP+'s own floating menu sits at opacity .2 until you touch it. Fading at
   rest is this page's established manner for a guest widget; .55 keeps ours
   legible while still receding. */
#${INDICATOR_ID}:hover,
#${INDICATOR_ID}:focus-visible,
#${INDICATOR_ID}.psnppp-open {
  opacity: 1;
}

#${INDICATOR_ID}:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 2px;
}

/* The post-drop snap to an edge. Scoped to its own class rather than folded
   into the base transition list above: a drag has to track the pointer with
   no lag, and only the deliberate snap that happens AFTER release may ease.
   The class is added for exactly the snap's duration and lifted after, so an
   ordinary drag never picks up this transition by accident. */
#${INDICATOR_ID}.psnppp-dock-snap {
  transition: left ${DOCK_SNAP_MS}ms cubic-bezier(.22, .61, .36, 1),
    top ${DOCK_SNAP_MS}ms cubic-bezier(.22, .61, .36, 1);
}

#${INDICATOR_ID} .psnppp-rail {
  flex: 0 0 3px;
  width: 3px;
  align-self: stretch;
  background: ${t.edge};
  transition: background .18s ease;
}

#${INDICATOR_ID} .psnppp-label {
  flex: 0 1 auto;
  padding: 6px 10px 6px 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: ${TYPE.display};
  font-size: 10px;
  font-weight: 700;
  font-style: normal;
  line-height: 12px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: ${t.engrave};
  transition: color .18s ease;
}

/* Locked is the settled look: an unlit plate. No metal, no gradient, nothing
   to look at \u2014 which is the point, because nothing is being asked of anyone. */
${tierRules}

/* Anything with a metal has something to say, so it stops receding. */
${litTiers} {
  opacity: 1;
}

/* An error is the one state that may not be mistaken for the page. Full
   opacity, the only warm hue in the widget, and the plate's own edge turns. */
#${INDICATOR_ID}.psnppp-tier-fault {
  border-color: ${t.fault};
  box-shadow: ${PLATE_SHADOW}, 0 0 0 1px rgba(${t.faultRgb}, .35);
}

/* THE SIGNATURE \u2014 the pop.
   One specular band crosses the plate the moment a state arrives that needs
   the user, and never again until the next one. It is the trophy-unlock shine
   from the console this hobby lives on, spent once, on the only event worth
   spending it on. Locked states never get it. */
#${INDICATOR_ID} .psnppp-sheen {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, .16) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

#${INDICATOR_ID}.psnppp-pop .psnppp-sheen {
  animation: psnppp-sweep .52s cubic-bezier(.22, .61, .36, 1) 1;
}

@keyframes psnppp-sweep {
  0%   { opacity: 0; transform: translateX(-120%); }
  12%  { opacity: 1; }
  100% { opacity: 0; transform: translateX(340%); }
}

/*
 * Hosted inside PSNP+'s floating menu.
 *
 * The menu is what floats, docks and drags in that mode, so the chip must stop
 * positioning itself \u2014 otherwise it stays pinned to the viewport while its own
 * container moves out from under it. Everything else about it (plate, rail,
 * tier colours, sheen) is inherited unchanged, which is the point: it is the
 * same control, not a second one styled to look like it.
 *
 * Sits AFTER the base rule so it wins on order alone: no !important, no
 * specificity games.
 */
#${INDICATOR_ID}.psnppp-hosted {
  position: static;
  right: auto;
  bottom: auto;
  margin-top: 6px;
  max-width: none;
  width: 100%;
  box-shadow: none;
}

/* ---- the panel --------------------------------------------------------- */

#${PANEL_ID} {
  position: fixed;
  z-index: ${Z_LAYER};
  width: ${PANEL_WIDTH_PX}px;
  max-width: calc(100vw - ${EDGE_INSET_PX * 2}px);
  max-height: calc(100vh - ${EDGE_INSET_PX * 2}px);
  overflow: auto;
  background: ${t.plate};
  border: 1px solid ${t.edge};
  border-radius: 3px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, .55);
  color: ${t.engrave};
  font-family: ${TYPE.body};
  font-size: 12px;
  line-height: 1.45;
}

#${PANEL_ID} .psnppp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-bottom: 1px solid ${t.edge};
}

#${PANEL_ID} .psnppp-title {
  font-family: ${TYPE.display};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid ${t.edge};
}

#${PANEL_ID} .psnppp-tab {
  flex: 1 1 0;
  padding: 8px 4px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  text-align: center;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-tab:hover { color: ${t.engrave}; }

/* Deliberately NOT gold. Gold is spent once in this panel, on Save \u2014 the one
   control that writes anything. A gold tab underline competed with it and made
   "which tab am I on" look as urgent as "this is the button that commits". */
#${PANEL_ID} .psnppp-tab[aria-selected="true"] {
  color: ${t.bright};
  border-bottom-color: ${t.bright};
}

#${PANEL_ID} .psnppp-pane { padding: 10px; }

#${PANEL_ID} .psnppp-field { margin-bottom: 10px; }

#${PANEL_ID} .psnppp-fieldlabel {
  display: block;
  margin-bottom: 4px;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-input {
  display: block;
  width: 100%;
  padding: 6px 7px;
  background: ${t.sunken};
  border: 1px solid ${t.edge};
  border-radius: 2px;
  font-family: ${TYPE.data};
  font-size: 11px;
  line-height: 1.4;
  color: ${t.bright};
}

#${PANEL_ID} .psnppp-input:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-hint {
  margin-top: 4px;
  font-size: 11px;
  color: ${t.quiet};
}

/* The one control in this panel that commits the moment it is clicked, so it
   is set apart from the two fields above it by a rule rather than by wording. */
#${PANEL_ID} .psnppp-check {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid ${t.hairline};
}

#${PANEL_ID} .psnppp-checkbox {
  flex: 0 0 auto;
  width: 13px;
  height: 13px;
  margin: 0;
  accent-color: ${t.gold};
  cursor: pointer;
}

#${PANEL_ID} .psnppp-checkbox:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-checklabel {
  flex: 1 1 auto;
  min-width: 0;
  font-family: ${TYPE.body};
  font-size: 11px;
  line-height: 1.4;
  color: ${t.bright};
  cursor: pointer;
}

/* The hint drops to its own full-width line under both. */
#${PANEL_ID} .psnppp-check .psnppp-hint { flex: 1 0 100%; margin-top: 2px; }

#${PANEL_ID} .psnppp-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-top: 1px solid ${t.hairline};
}

#${PANEL_ID} .psnppp-row:first-child { border-top: 0; }

#${PANEL_ID} .psnppp-rowmain {
  flex: 1 1 auto;
  min-width: 0;
  font-family: ${TYPE.data};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: ${t.data};
  overflow-wrap: anywhere;
}

#${PANEL_ID} .psnppp-rowmeta {
  display: block;
  font-size: 10px;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-empty {
  padding: 4px 0 2px;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 2px;
}

#${PANEL_ID} .psnppp-btn {
  padding: 5px 10px;
  background: ${t.control};
  border: 1px solid ${t.edge};
  border-radius: 2px;
  cursor: pointer;
  font-family: ${TYPE.display};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-btn:hover { border-color: ${t.quiet}; color: ${t.bright}; }

#${PANEL_ID} .psnppp-btn:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-btn-key { color: ${t.gold}; border-color: ${t.bronzeDim}; }
#${PANEL_ID} .psnppp-btn-key:hover { color: ${t.gold}; border-color: ${t.gold}; }

#${PANEL_ID} .psnppp-btn-danger { color: ${t.fault}; border-color: ${t.faultDim}; }
#${PANEL_ID} .psnppp-btn-danger:hover { color: ${t.fault}; border-color: ${t.fault}; }

#${PANEL_ID} .psnppp-close {
  padding: 2px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  font-family: ${TYPE.body};
  font-size: 14px;
  line-height: 1;
  color: ${t.quiet};
}

#${PANEL_ID} .psnppp-close:hover { color: ${t.bright}; }

#${PANEL_ID} .psnppp-close:focus-visible {
  outline: 2px solid ${t.platinum};
  outline-offset: 1px;
}

#${PANEL_ID} .psnppp-message {
  padding: 8px 10px;
  border-top: 1px solid ${t.edge};
  font-size: 11px;
  color: ${t.engrave};
  overflow-wrap: anywhere;
}

#${PANEL_ID} .psnppp-message-error {
  color: ${t.fault};
  background: rgba(${t.faultRgb}, .08);
}

/* Full width, under the row it belongs to. Sitting beside the timestamp
   squeezed both into two ragged columns and put "Replace lists" \u2014 the only
   destructive control in the widget \u2014 where it read as an afterthought. */
#${PANEL_ID} .psnppp-confirm {
  flex: 1 0 100%;
  padding: 4px 0 2px;
  color: ${t.engrave};
}

#${PANEL_ID} .psnppp-confirm .psnppp-actions { padding-top: 6px; }

/* The quality floor, not announced anywhere in the UI: a widget that animates
   through a vestibular disorder is a bug, and every transition above is
   decoration over an instant state change. */
@media (prefers-reduced-motion: reduce) {
  #${INDICATOR_ID},
  #${INDICATOR_ID} .psnppp-rail,
  #${INDICATOR_ID} .psnppp-label {
    transition: none;
  }
  #${INDICATOR_ID}.psnppp-pop .psnppp-sheen { animation: none; }
  /* Same id+class specificity as the rule that turns the snap on, so this
     wins on being LATER in the sheet rather than needing !important \u2014 the
     same reasoning theme.mjs already documents for every other selector here. */
  #${INDICATOR_ID}.psnppp-dock-snap { transition: none; }
}

/* Narrow viewports: the plate keeps its metal and loses its width. */
@media (max-width: 420px) {
  #${INDICATOR_ID} .psnppp-label { padding: 6px 8px 6px 6px; max-width: 46vw; }
  #${PANEL_ID} { width: calc(100vw - ${EDGE_INSET_PX * 2}px); }
}
`;
  function installStyles(doc) {
    if (!doc || styled.has(doc)) return null;
    if (doc.getElementById?.(STYLE_ID)) {
      styled.add(doc);
      return null;
    }
    const host = doc.head ?? doc.documentElement ?? doc.body;
    if (!host || typeof host.appendChild !== "function") return null;
    if (typeof doc.createElement !== "function") return null;
    const style = doc.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    host.appendChild(style);
    styled.add(doc);
    return style;
  }

  // userscript/src/indicator.mjs
  var STATES = {
    idle: { label: "Sync", tier: "locked", action: "sync", pops: false },
    syncing: { label: "Syncing", tier: "silver", action: "sync", pops: false },
    synced: { label: "Synced", tier: "locked", action: "sync", pops: false },
    reload: { label: "Reload page", tier: "platinum", action: "reload", pops: true },
    offline: { label: "Offline", tier: "fault", action: "sync", pops: true },
    conflict: { label: "Conflict", tier: "fault", action: "sync", pops: true },
    unconfigured: { label: "Set up sync", tier: "bronze", action: "sync", pops: true },
    // A userscript cannot silently self-install — that would be a security hole
    // — so this is an offer, not an update. The click opens the install page in
    // a NEW tab (see onUpdate below); it deliberately does not navigate the
    // current psnprofiles.com tab away.
    update: { label: "Update ready", tier: "gold", action: "update", pops: true },
    // PSNP+ saves its lists in a shape this build does not understand, so the
    // sync cycle never runs at all (see compat.mjs). `sync` stays the action: the
    // check re-runs at the top of every cycle, so a click is the way back the
    // moment PSNP++ is updated — and a click that cannot make things worse is the
    // right thing to leave under a chip that has just refused to touch anything.
    incompatible: { label: "Sync paused", tier: "fault", action: "sync", pops: true }
  };
  var CLICK_HINT = {
    sync: "click to sync now, right-click for settings.",
    reload: "click to reload the page, right-click for settings.",
    update: "click to install the update, right-click for settings."
  };
  var POSITION_KEY = "psnppp.chipPosition";
  var EDGE_MARGIN = 8;
  var DRAG_THRESHOLD_PX = 4;
  var FALLBACK_SIZE = CHIP_FALLBACK_SIZE;
  var finiteOr = (value, fallback) => Number.isFinite(value) ? value : fallback;
  function clampAxis(value, size, view, margin = EDGE_MARGIN) {
    const furthest = Math.max(margin, finiteOr(view, 0) - Math.max(0, finiteOr(size, 0)) - margin);
    return Math.min(Math.max(finiteOr(value, margin), margin), furthest);
  }
  function clampToViewport(position, size, viewport, margin = EDGE_MARGIN) {
    return {
      left: clampAxis(
        position?.left,
        finiteOr(size?.width, FALLBACK_SIZE.width),
        viewport?.width,
        margin
      ),
      top: clampAxis(
        position?.top,
        finiteOr(size?.height, FALLBACK_SIZE.height),
        viewport?.height,
        margin
      )
    };
  }
  function isUsablePosition(position) {
    return position != null && typeof position === "object" && Number.isFinite(position.left) && Number.isFinite(position.top);
  }
  function isDockSide(value) {
    return value === "left" || value === "right";
  }
  function sideFor(left, width, viewWidth) {
    const view = finiteOr(viewWidth, 0);
    const distLeft = Math.max(0, finiteOr(left, 0));
    const distRight = view - distLeft - Math.max(0, finiteOr(width, 0));
    return distRight < distLeft ? "right" : "left";
  }
  function dockedLeft(side, width, viewWidth, inset = EDGE_INSET_PX) {
    const view = finiteOr(viewWidth, 0);
    return side === "right" ? clampAxis(view, width, view, inset) : clampAxis(-view, width, view, inset);
  }
  var readPosition = async () => {
    const stored = await GM.getValue(POSITION_KEY, null);
    if (typeof stored === "string") {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return stored;
  };
  var writePosition = async (position) => GM.setValue(POSITION_KEY, position);
  function createIndicator({
    onSyncNow,
    onSettings,
    onReload,
    onUpdate,
    loadPosition = readPosition,
    savePosition = writePosition,
    onPositionError = (error) => console.error("[psnppp] chip position:", error),
    /**
     * Mount inside this element instead of standing alone.
     *
     * Given PSNP+'s floating menu, the chip becomes a row in it and the MENU is
     * what drags and docks — one surface on the page rather than two widgets
     * that both float and both have to be moved out of the way separately.
     *
     * Null keeps the standalone chip, which is not a legacy path: it is what runs
     * when PSNP+ fails to load or its menu is switched off, and losing every sync
     * control in either case would be worse than having two widgets.
     */
    host = null
  } = {}) {
    installStyles(document);
    const element = document.createElement("div");
    element.id = INDICATOR_ID;
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    const rail = document.createElement("span");
    rail.className = "psnppp-rail";
    rail.setAttribute("aria-hidden", "true");
    element.appendChild(rail);
    const label = document.createElement("span");
    label.className = "psnppp-label";
    element.appendChild(label);
    const sheen = document.createElement("span");
    sheen.className = "psnppp-sheen";
    sheen.setAttribute("aria-hidden", "true");
    element.appendChild(sheen);
    let current = STATES.idle;
    let panelOpen = false;
    let snapping = false;
    const paintClasses = (pop = false) => {
      element.className = [
        `psnppp-tier-${current.tier}`,
        pop ? "psnppp-pop" : "",
        panelOpen ? "psnppp-open" : "",
        snapping ? "psnppp-dock-snap" : "",
        hosted ? "psnppp-hosted" : ""
      ].filter(Boolean).join(" ");
    };
    const viewport = () => ({
      width: globalThis.window?.innerWidth ?? 0,
      height: globalThis.window?.innerHeight ?? 0
    });
    let surface = host ?? element;
    let hosted = host != null;
    const rectOf = () => typeof surface.getBoundingClientRect === "function" ? surface.getBoundingClientRect() : null;
    const measure = () => {
      const rect = rectOf();
      return {
        width: rect?.width || surface.offsetWidth || FALLBACK_SIZE.width,
        height: rect?.height || surface.offsetHeight || FALLBACK_SIZE.height
      };
    };
    let position = null;
    let dockSide = "right";
    function apply(next) {
      position = next;
      surface.style.left = `${next.left}px`;
      surface.style.top = `${next.top}px`;
      surface.style.right = "auto";
      surface.style.bottom = "auto";
    }
    const place = (candidate, size = measure()) => apply(clampToViewport(candidate, size, viewport()));
    function applyDocked(side, top, size = measure()) {
      dockSide = isDockSide(side) ? side : "right";
      const view = viewport();
      apply({
        left: dockedLeft(dockSide, finiteOr(size?.width, FALLBACK_SIZE.width), view.width),
        top: clampAxis(top, finiteOr(size?.height, FALLBACK_SIZE.height), view.height, EDGE_MARGIN)
      });
      return position;
    }
    const persist = () => {
      if (position == null) return;
      try {
        Promise.resolve(savePosition({ ...position, side: dockSide })).catch(onPositionError);
      } catch (error) {
        onPositionError(error);
      }
    };
    async function restorePosition() {
      try {
        const stored = await loadPosition();
        if (!isUsablePosition(stored)) return null;
        const size = measure();
        const side = isDockSide(stored.side) ? stored.side : sideFor(stored.left, finiteOr(size.width, FALLBACK_SIZE.width), viewport().width);
        const corrected = applyDocked(side, stored.top, size);
        if (corrected.left !== stored.left || corrected.top !== stored.top || side !== stored.side) {
          persist();
        }
        return corrected;
      } catch (error) {
        onPositionError(error);
        return null;
      }
    }
    function handleResize() {
      if (position == null) return;
      const before = position;
      applyDocked(dockSide, position.top);
      if (position.left !== before.left || position.top !== before.top) persist();
    }
    globalThis.window?.addEventListener?.("resize", handleResize);
    let drag = null;
    let suppressClick = false;
    element.addEventListener("pointerdown", (event) => {
      if ((event.button ?? 0) !== 0) return;
      const size = measure();
      const rect = rectOf();
      const start2 = position ?? clampToViewport({ left: rect?.left ?? 0, top: rect?.top ?? 0 }, size, viewport());
      drag = {
        pointerId: event.pointerId,
        originX: event.clientX ?? 0,
        originY: event.clientY ?? 0,
        startLeft: start2.left,
        startTop: start2.top,
        // Measured once here and reused for the whole gesture. The chip cannot
        // change size while it is being dragged, and re-measuring per move forced
        // a synchronous layout at pointer frequency (120Hz+) on a page we do not
        // own — write, read, write, every single move event.
        size,
        moved: false
      };
      try {
        element.setPointerCapture?.(event.pointerId);
      } catch {
      }
    });
    element.addEventListener("pointermove", (event) => {
      if (drag == null || event.pointerId != null && event.pointerId !== drag.pointerId) return;
      const dx = (event.clientX ?? 0) - drag.originX;
      const dy = (event.clientY ?? 0) - drag.originY;
      if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
      drag.moved = true;
      place({ left: drag.startLeft + dx, top: drag.startTop + dy }, drag.size);
    });
    let snapTimer = null;
    function snapToNearestSide(size) {
      const side = sideFor(
        position?.left ?? 0,
        finiteOr(size?.width, FALLBACK_SIZE.width),
        viewport().width
      );
      snapping = true;
      paintClasses(element.className.includes("psnppp-pop"));
      applyDocked(side, position?.top ?? 0, size);
      persist();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        snapping = false;
        paintClasses(element.className.includes("psnppp-pop"));
      }, DOCK_SNAP_MS);
    }
    const endDrag = (event, { commit = true } = {}) => {
      if (drag == null || event?.pointerId != null && event.pointerId !== drag.pointerId) return;
      const { moved, pointerId, size } = drag;
      drag = null;
      try {
        element.releasePointerCapture?.(pointerId);
      } catch {
      }
      if (!commit || !moved) return;
      suppressClick = true;
      snapToNearestSide(size);
    };
    element.addEventListener("pointerup", endDrag);
    element.addEventListener("pointercancel", (event) => endDrag(event, { commit: false }));
    const activate = () => {
      if (current.action === "reload") onReload();
      else if (current.action === "update") onUpdate();
      else onSyncNow();
    };
    element.addEventListener("click", () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      activate();
    });
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
      event.preventDefault?.();
      activate();
    });
    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      onSettings();
    });
    function setState(state, detail = "") {
      const name = typeof state === "string" ? state : "";
      const text = typeof detail === "string" ? detail : "";
      const style = Object.hasOwn(STATES, name) ? STATES[name] : STATES.idle;
      const arrived = style.tier !== current.tier;
      const pop = style.pops && arrived;
      current = style;
      if (pop) {
        paintClasses(false);
        void element.offsetWidth;
      }
      paintClasses(pop);
      label.textContent = style.label;
      const hint = CLICK_HINT[style.action] ?? CLICK_HINT.sync;
      const title = text ? `PSNP++ \u2014 ${text}
${hint[0].toUpperCase()}${hint.slice(1)}` : `PSNP++ \u2014 ${hint}`;
      element.title = title;
      element.setAttribute("aria-label", title.replace(/\n/g, " "));
    }
    function setPanelOpen(open) {
      panelOpen = Boolean(open);
      paintClasses(element.className.includes("psnppp-pop"));
    }
    setState("idle");
    return {
      element,
      setState,
      setPanelOpen,
      restorePosition,
      handleResize,
      /**
       * Move the chip into `newHost` and make THAT the thing that floats.
       *
       * Exists because the host is not known when the chip is built: PSNP+ inserts
       * its floating menu during its own DOMContentLoaded pass, well after the chip
       * has to be on screen reporting state. Without this, the chip could be moved
       * into the menu but `surface` would still point at the chip — so dragging
       * would try to move an element the stylesheet has just made static, and the
       * menu would sit there while nothing happened.
       *
       * Re-clamps immediately: a position saved for a small chip can put a much
       * wider menu off the edge of the screen.
       */
      rehost(newHost) {
        if (newHost == null || newHost === surface) return false;
        try {
          newHost.appendChild(element);
          hosted = true;
          paintClasses();
          element.style.left = "";
          element.style.top = "";
          element.style.right = "";
          element.style.bottom = "";
          surface = newHost;
          if (position != null) place(position);
          return true;
        } catch (error) {
          onPositionError(error);
          return false;
        }
      },
      /** Where the chip is, or null while it still sits in its default corner. */
      getPosition: () => position == null ? null : { ...position },
      /**
       * Which edge the chip is docked to — 'left' or 'right', always. Defaults
       * to 'right' before the first drag or restore, matching the CSS corner
       * the chip actually sits in until then, so the panel always has a real
       * side to open away from instead of a third "unknown" case to handle.
       */
      getSide: () => dockSide
    };
  }

  // userscript/src/panel.mjs
  var TABS = [
    { name: "sync", label: "Sync" },
    { name: "backups", label: "Backups" },
    { name: "log", label: "Log" }
  ];
  function describeFailure(error, fallback) {
    try {
      const text = typeof error?.message === "string" && error.message ? error.message : String(error);
      return text && text !== "null" && text !== "undefined" && text !== "[object Object]" ? `${fallback}: ${text}` : `${fallback}.`;
    } catch {
      return `${fallback}.`;
    }
  }
  var stamp = (at) => {
    const date = new Date(at);
    return Number.isNaN(date.getTime()) ? "unknown time" : date.toLocaleString();
  };
  var countOf = (n, noun) => `${n} ${noun}${n === 1 ? "" : "s"}`;
  function createSettingsPanel({
    doc = globalThis.document,
    anchor = null,
    // Which edge the chip is docked to. Defaults 'right' to match the CSS
    // corner the chip sits in before it has ever been dragged (see
    // indicator.mjs's getSide) — that is also the one case `anchor` can be
    // non-null while genuinely undocked, so the default has to agree with it.
    side = "right",
    config = { endpoint: "", key: "" },
    backups = [],
    history = [],
    describeDelta: describeDelta2 = () => "lists updated",
    // Refusing defaults, not permissive ones. An unwired panel must not report a
    // saved credential or a completed restore.
    onSave = async () => ({ ok: false, message: "Settings are not wired up." }),
    onRestore = async () => ({ ok: false, message: "Restore is not wired up." }),
    // Whether PSNP+'s "remove <game>?" dialog answers itself (auto-confirm.mjs).
    // Imported rather than repeated, so an un-wired panel can never render the box
    // unticked and imply the feature is off while it is running.
    autoConfirmRemove = AUTO_CONFIRM_REMOVE_DEFAULT,
    onToggleAutoConfirm = async () => ({ ok: false, message: "That setting is not wired up." }),
    onClose = () => {
    }
  } = {}) {
    const make = (tag2, className, text) => {
      const node = doc.createElement(tag2);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      return node;
    };
    const tag = (node, value) => {
      node.setAttribute("data-psnppp", value);
      return node;
    };
    const show = (node, visible) => {
      node.hidden = !visible;
      node.style.display = visible ? "" : "none";
    };
    const element = make("div");
    element.id = PANEL_ID;
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-label", "PSNP++ settings");
    const head = make("div", "psnppp-head");
    head.appendChild(make("span", "psnppp-title", "PSNP++"));
    const closeButton = tag(make("button", "psnppp-close", "\xD7"), "close");
    closeButton.setAttribute("type", "button");
    closeButton.setAttribute("aria-label", "Close settings");
    closeButton.addEventListener("click", () => close());
    head.appendChild(closeButton);
    element.appendChild(head);
    const tabBar = make("div", "psnppp-tabs");
    tabBar.setAttribute("role", "tablist");
    const tabButtons = /* @__PURE__ */ new Map();
    const panes = /* @__PURE__ */ new Map();
    for (const { name, label } of TABS) {
      const button = tag(make("button", "psnppp-tab", label), `tab-${name}`);
      button.setAttribute("type", "button");
      button.setAttribute("role", "tab");
      button.addEventListener("click", () => selectTab(name));
      tabBar.appendChild(button);
      tabButtons.set(name, button);
    }
    element.appendChild(tabBar);
    const syncPane = tag(make("div", "psnppp-pane"), "pane-sync");
    const endpointField = make("div", "psnppp-field");
    const endpointLabel = make("label", "psnppp-fieldlabel", "Endpoint");
    endpointLabel.setAttribute("for", "psnppp-endpoint");
    endpointField.appendChild(endpointLabel);
    const endpointInput = tag(make("input", "psnppp-input"), "endpoint");
    endpointInput.id = "psnppp-endpoint";
    endpointInput.setAttribute("type", "text");
    endpointInput.setAttribute("spellcheck", "false");
    endpointInput.setAttribute("autocomplete", "off");
    endpointInput.value = config?.endpoint ?? "";
    endpointField.appendChild(endpointInput);
    syncPane.appendChild(endpointField);
    const keyField = make("div", "psnppp-field");
    const keyLabel = make("label", "psnppp-fieldlabel", "Sync key");
    keyLabel.setAttribute("for", "psnppp-key");
    keyField.appendChild(keyLabel);
    const keyInput = tag(make("input", "psnppp-input"), "key");
    keyInput.id = "psnppp-key";
    keyInput.setAttribute("type", "password");
    keyInput.setAttribute("autocomplete", "off");
    keyInput.value = "";
    keyField.appendChild(keyInput);
    keyField.appendChild(tag(
      make("div", "psnppp-hint", describeStoredKey(config?.key)),
      "keyhint"
    ));
    syncPane.appendChild(keyField);
    const autoConfirmField = make("div", "psnppp-field psnppp-check");
    const autoConfirmBox = tag(make("input", "psnppp-checkbox"), "autoconfirm");
    autoConfirmBox.id = "psnppp-autoconfirm";
    autoConfirmBox.setAttribute("type", "checkbox");
    autoConfirmBox.checked = autoConfirmRemove !== false;
    const autoConfirmLabel = make("label", "psnppp-checklabel", 'Skip the "remove game?" prompt');
    autoConfirmLabel.setAttribute("for", "psnppp-autoconfirm");
    autoConfirmField.appendChild(autoConfirmBox);
    autoConfirmField.appendChild(autoConfirmLabel);
    autoConfirmField.appendChild(tag(make(
      "div",
      "psnppp-hint",
      "Removes games from a list without asking. Only that one PSNP+ prompt \u2014 deleting a list, clearing PSNP+ data and reloading a remote list still ask. A removal syncs to your other devices."
    ), "autoconfirm-hint"));
    let toggling = false;
    autoConfirmBox.addEventListener("change", () => {
      const wanted = autoConfirmBox.checked === true;
      if (toggling) {
        autoConfirmBox.checked = !wanted;
        return;
      }
      toggling = true;
      autoConfirmBox.disabled = true;
      void (async () => {
        let failure = null;
        try {
          const result = await onToggleAutoConfirm(wanted);
          if (!result || result.ok !== true) {
            failure = result?.message ?? "Could not save that setting.";
          }
        } catch (error) {
          failure = describeFailure(error, "Could not save that setting");
        }
        toggling = false;
        autoConfirmBox.disabled = false;
        if (failure != null) autoConfirmBox.checked = !wanted;
        try {
          if (failure != null) showMessage(failure, { error: true });
          else clearMessage();
        } catch (error) {
          console.error("[psnppp] could not report the auto-confirm result:", error);
        }
      })();
    });
    syncPane.appendChild(autoConfirmField);
    const syncActions = make("div", "psnppp-actions");
    const cancelButton = tag(make("button", "psnppp-btn", "Cancel"), "cancel");
    cancelButton.setAttribute("type", "button");
    cancelButton.addEventListener("click", () => close());
    syncActions.appendChild(cancelButton);
    const saveButton = tag(make("button", "psnppp-btn psnppp-btn-key", "Save"), "save");
    saveButton.setAttribute("type", "button");
    saveButton.addEventListener("click", () => {
      submit().catch((error) => {
        showMessage(describeFailure(error, "Could not save your settings"), { error: true });
      });
    });
    syncActions.appendChild(saveButton);
    syncPane.appendChild(syncActions);
    element.appendChild(syncPane);
    panes.set("sync", syncPane);
    const backupsPane = tag(make("div", "psnppp-pane"), "pane-backups");
    if (backups.length === 0) {
      backupsPane.appendChild(tag(
        make("div", "psnppp-empty", "No backups yet. One is taken before every merge that writes."),
        "backups-empty"
      ));
    } else {
      for (const entry of backups) {
        backupsPane.appendChild(backupRow(entry));
      }
    }
    element.appendChild(backupsPane);
    panes.set("backups", backupsPane);
    function backupRow(entry) {
      const row = tag(make("div", "psnppp-row"), "backup-row");
      const main = make("div", "psnppp-rowmain", stamp(entry?.at));
      main.appendChild(tag(
        make("span", "psnppp-rowmeta", countOf(Number(entry?.listCount) || 0, "list")),
        "backup-count"
      ));
      row.appendChild(main);
      const restoreButton = tag(make("button", "psnppp-btn", "Restore"), "restore");
      restoreButton.setAttribute("type", "button");
      row.appendChild(restoreButton);
      const confirm = tag(make("div", "psnppp-confirm"), "backup-confirm");
      confirm.appendChild(make("div", null, "Replace your lists with this backup?"));
      const confirmActions = make("div", "psnppp-actions");
      const keepButton = tag(make("button", "psnppp-btn", "Keep mine"), "restore-cancel");
      keepButton.setAttribute("type", "button");
      keepButton.addEventListener("click", () => {
        show(confirm, false);
        show(restoreButton, true);
      });
      confirmActions.appendChild(keepButton);
      const goButton = tag(make("button", "psnppp-btn psnppp-btn-danger", "Replace lists"), "restore-confirm");
      goButton.setAttribute("type", "button");
      goButton.addEventListener("click", () => {
        runRestore(entry?.id, goButton).catch((error) => {
          goButton.disabled = false;
          showMessage(describeFailure(error, "Could not restore that backup"), { error: true });
        });
      });
      confirmActions.appendChild(goButton);
      confirm.appendChild(confirmActions);
      show(confirm, false);
      row.appendChild(confirm);
      restoreButton.addEventListener("click", () => {
        show(restoreButton, false);
        show(confirm, true);
      });
      return row;
    }
    const logPane = tag(make("div", "psnppp-pane"), "pane-log");
    if (history.length === 0) {
      logPane.appendChild(tag(
        make(
          "div",
          "psnppp-empty",
          "No sync changes yet. Only syncs that actually wrote to your lists are logged, so a run of quiet syncs leaves this empty."
        ),
        "log-empty"
      ));
    } else {
      for (const entry of history) {
        const row = tag(make("div", "psnppp-row"), "log-row");
        const main = make("div", "psnppp-rowmain", stamp(entry?.at));
        main.appendChild(make(
          "span",
          "psnppp-rowmeta",
          `r${entry?.revision} \u2014 ${describeDelta2(entry?.delta)}`
        ));
        row.appendChild(main);
        logPane.appendChild(row);
      }
    }
    element.appendChild(logPane);
    panes.set("log", logPane);
    const message = tag(make("div", "psnppp-message"), "message");
    show(message, false);
    element.appendChild(message);
    function showMessage(text, { error = false } = {}) {
      message.textContent = text;
      message.className = error ? "psnppp-message psnppp-message-error" : "psnppp-message";
      message.setAttribute("role", error ? "alert" : "status");
      show(message, Boolean(text));
    }
    function clearMessage() {
      showMessage("");
    }
    let currentTab = null;
    function selectTab(name) {
      if (!panes.has(name) || name === currentTab) return;
      currentTab = name;
      for (const [key, pane] of panes) show(pane, key === name);
      for (const [key, button] of tabButtons) {
        button.setAttribute("aria-selected", key === name ? "true" : "false");
        button.setAttribute("tabindex", key === name ? "0" : "-1");
      }
    }
    async function submit() {
      clearMessage();
      const result = await onSave({ endpoint: endpointInput.value, key: keyInput.value });
      if (!result || result.ok !== true) {
        showMessage(result?.message ?? "Could not save your settings.", { error: true });
        return;
      }
      close();
    }
    async function runRestore(id, button) {
      clearMessage();
      button.disabled = true;
      const result = await onRestore(id);
      if (!result || result.ok !== true) {
        button.disabled = false;
        showMessage(result?.message ?? "Could not restore that backup.", { error: true });
        return;
      }
      showMessage(result.message ?? "Backup restored.");
    }
    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      try {
        element.remove?.();
      } catch (error) {
        console.error("[psnppp] could not remove the settings panel:", error);
      }
      try {
        onClose();
      } catch (error) {
        console.error("[psnppp] settings panel onClose failed:", error);
      }
    }
    element.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" && event.key !== "Esc") return;
      event.stopPropagation?.();
      close();
    });
    selectTab(TABS[0].name);
    position();
    function position() {
      const view = {
        width: globalThis.window?.innerWidth ?? 0,
        height: globalThis.window?.innerHeight ?? 0
      };
      const rect = typeof anchor?.getBoundingClientRect === "function" ? anchor.getBoundingClientRect() : null;
      if (!rect || !view.width || !view.height) {
        element.style.right = `${EDGE_INSET_PX}px`;
        element.style.bottom = `${EDGE_INSET_PX * 2 + CHIP_FALLBACK_SIZE.height}px`;
        return;
      }
      const width = Math.min(PANEL_WIDTH_PX, Math.max(0, view.width - EDGE_INSET_PX * 2));
      const isDockedLeft = side === "left";
      const desiredLeft = isDockedLeft ? rect.right + EDGE_INSET_PX : rect.left - width - EDGE_INSET_PX;
      element.style.left = `${clampAxis(desiredLeft, width, view.width, EDGE_INSET_PX)}px`;
      element.style.right = "auto";
      const spaceBelow = view.height - rect.bottom;
      if (spaceBelow >= rect.top) {
        element.style.top = `${Math.round(rect.bottom + EDGE_INSET_PX)}px`;
        element.style.bottom = "auto";
      } else {
        element.style.bottom = `${Math.round(view.height - rect.top + EDGE_INSET_PX)}px`;
        element.style.top = "auto";
      }
    }
    return { element, close, showMessage };
  }

  // userscript/src/merger.mjs
  var TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1e3;
  var clone = (value) => JSON.parse(JSON.stringify(value));
  function stableStringify(obj) {
    if (obj === null || typeof obj !== "object") {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return "[" + obj.map((v) => v === void 0 ? "null" : stableStringify(v)).join(",") + "]";
    }
    const sorted = Object.keys(obj).filter((k) => obj[k] !== void 0).sort().map((k) => `"${k}":${stableStringify(obj[k])}`);
    return "{" + sorted.join(",") + "}";
  }
  function sameRecord(a, b) {
    if (a == null || b == null) return false;
    const { updatedAt: _a, ...left } = a;
    const { updatedAt: _b, ...right } = b;
    return stableStringify(left) === stableStringify(right);
  }
  function sameOrder(a, b) {
    return a.length === b.length && a.every((id, i) => id === b[i]);
  }
  function stampChanges(base, local, now) {
    const out = { version: DOC_VERSION, lists: {} };
    for (const [listId, localList] of Object.entries(local.lists)) {
      const baseList = base.lists[listId];
      const node = clone(localList);
      node.meta.updatedAt = sameRecord(localList.meta, baseList?.meta) ? baseList.meta.updatedAt : now;
      node.orderUpdatedAt = baseList != null && sameOrder(localList.gameOrder, baseList.gameOrder) ? baseList.orderUpdatedAt : now;
      for (const [gameId, localGame] of Object.entries(localList.games)) {
        const baseGame = baseList?.games?.[gameId];
        node.games[gameId].updatedAt = sameRecord(localGame, baseGame) ? baseGame.updatedAt : now;
      }
      node.deletedGames = {};
      for (const [gameId, timestamp] of Object.entries(baseList?.deletedGames ?? {})) {
        if (localList.games[gameId] == null) {
          node.deletedGames[gameId] = timestamp;
        }
      }
      for (const gameId of Object.keys(baseList?.games ?? {})) {
        if (localList.games[gameId] == null && node.deletedGames[gameId] == null) {
          node.deletedGames[gameId] = now;
        }
      }
      node.deletedAt = null;
      out.lists[listId] = node;
    }
    for (const [listId, baseList] of Object.entries(base.lists)) {
      if (local.lists[listId] != null) continue;
      out.lists[listId] = {
        meta: clone(baseList.meta),
        games: {},
        gameOrder: [],
        orderUpdatedAt: baseList.orderUpdatedAt,
        deletedGames: clone(baseList.deletedGames ?? {}),
        deletedAt: baseList.deletedAt ?? now
      };
    }
    return out;
  }
  function mergeTombstones(left = {}, right = {}) {
    const out = { ...left };
    for (const [gameId, deletedAt] of Object.entries(right)) {
      if (out[gameId] == null || deletedAt > out[gameId]) out[gameId] = deletedAt;
    }
    return out;
  }
  function latestActivity(node) {
    if (node == null) return 0;
    let latest = Math.max(node.meta?.updatedAt ?? 0, node.orderUpdatedAt ?? 0);
    for (const game of Object.values(node.games ?? {})) {
      if (game.updatedAt > latest) latest = game.updatedAt;
    }
    return latest;
  }
  function pickNewer(localItem, remoteItem) {
    const localTs = localItem?.updatedAt ?? 0;
    const remoteTs = remoteItem?.updatedAt ?? 0;
    if (localTs !== remoteTs) return localTs > remoteTs ? localItem : remoteItem;
    return stableStringify(localItem) >= stableStringify(remoteItem) ? localItem : remoteItem;
  }
  function pickOrderSource(localNode, remoteNode) {
    if (localNode.deletedAt != null) return remoteNode;
    if (remoteNode.deletedAt != null) return localNode;
    const localTs = localNode.orderUpdatedAt ?? 0;
    const remoteTs = remoteNode.orderUpdatedAt ?? 0;
    if (localTs !== remoteTs) return localTs > remoteTs ? localNode : remoteNode;
    return stableStringify(localNode.gameOrder) >= stableStringify(remoteNode.gameOrder) ? localNode : remoteNode;
  }
  function mergeList(localNode, remoteNode) {
    if (localNode == null) return clone(remoteNode);
    if (remoteNode == null) return clone(localNode);
    const deletedAt = Math.max(localNode.deletedAt ?? 0, remoteNode.deletedAt ?? 0);
    if (deletedAt > 0) {
      const survivor = localNode.deletedAt != null ? remoteNode : localNode;
      if (deletedAt > latestActivity(survivor)) {
        const meta2 = clone(pickNewer(localNode.meta, remoteNode.meta));
        const deletingNode = localNode.deletedAt != null ? localNode : remoteNode;
        return {
          meta: meta2,
          games: {},
          gameOrder: [],
          orderUpdatedAt: deletingNode.orderUpdatedAt ?? 0,
          deletedGames: mergeTombstones(localNode.deletedGames, remoteNode.deletedGames),
          deletedAt
        };
      }
    }
    const meta = clone(pickNewer(localNode.meta, remoteNode.meta));
    const deletedGames = mergeTombstones(localNode.deletedGames, remoteNode.deletedGames);
    const games = {};
    const gameIds = /* @__PURE__ */ new Set([...Object.keys(localNode.games), ...Object.keys(remoteNode.games)]);
    for (const gameId of gameIds) {
      const localGame = localNode.games[gameId];
      const remoteGame = remoteNode.games[gameId];
      const winner = localGame == null ? remoteGame : remoteGame == null ? localGame : pickNewer(localGame, remoteGame);
      const tombstone = deletedGames[gameId];
      if (tombstone != null && tombstone > winner.updatedAt) continue;
      if (tombstone != null) delete deletedGames[gameId];
      games[gameId] = clone(winner);
    }
    const orderSource = pickOrderSource(localNode, remoteNode);
    const gameOrder = orderSource.gameOrder.filter((id) => games[id] != null);
    const seen = new Set(gameOrder);
    for (const gameId of Object.keys(games)) {
      if (!seen.has(gameId)) gameOrder.push(gameId);
    }
    return {
      meta,
      games,
      gameOrder,
      orderUpdatedAt: Math.max(localNode.orderUpdatedAt ?? 0, remoteNode.orderUpdatedAt ?? 0),
      deletedGames,
      deletedAt: null
    };
  }
  function mergeDoc(base, local, remote, now) {
    const out = { version: DOC_VERSION, lists: {} };
    const listIds = /* @__PURE__ */ new Set([...Object.keys(local.lists), ...Object.keys(remote.lists)]);
    for (const listId of listIds) {
      out.lists[listId] = mergeList(local.lists[listId], remote.lists[listId]);
    }
    return out;
  }
  function gcTombstones(doc, now, ttl = TOMBSTONE_TTL_MS) {
    const out = { version: DOC_VERSION, lists: {} };
    for (const [listId, node] of Object.entries(doc.lists)) {
      if (node.deletedAt != null && now - node.deletedAt > ttl) continue;
      const copy = clone(node);
      for (const [gameId, deletedAt] of Object.entries(copy.deletedGames)) {
        if (now - deletedAt > ttl) delete copy.deletedGames[gameId];
      }
      out.lists[listId] = copy;
    }
    return out;
  }

  // userscript/src/adopt.mjs
  var clone2 = (value) => JSON.parse(JSON.stringify(value));
  var normalize = (name) => String(name ?? "").trim().toLowerCase();
  function indexByName(doc) {
    const byName = /* @__PURE__ */ new Map();
    for (const [listId, node] of Object.entries(doc.lists)) {
      if (node.deletedAt != null) continue;
      const key = normalize(node.meta?.name);
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push(listId);
    }
    return byName;
  }
  function planAdoptions(localDoc, remoteDoc) {
    const remoteByName = indexByName(remoteDoc);
    const localByName = indexByName(localDoc);
    const adoptions = [];
    for (const [key, localIds] of localByName) {
      const remoteIds = remoteByName.get(key);
      if (localIds.length !== 1 || remoteIds == null || remoteIds.length !== 1) continue;
      const localId = localIds[0];
      const remoteId = remoteIds[0];
      if (localId === remoteId) continue;
      if (localDoc.lists[remoteId] != null) continue;
      if (remoteDoc.lists[localId] != null) continue;
      adoptions.push({ localId, remoteId, name: localDoc.lists[localId].meta.name });
    }
    return adoptions;
  }
  function applyAdoptions(localDoc, adoptions) {
    if (adoptions.length === 0) return localDoc;
    const rename = new Map(adoptions.map((a) => [a.localId, a.remoteId]));
    for (const { remoteId } of adoptions) {
      if (localDoc.lists[remoteId] != null && !rename.has(remoteId)) {
        throw new Error(`Collision: remoteId "${remoteId}" already exists in local and is not being renamed`);
      }
    }
    const out = { version: localDoc.version, lists: {} };
    for (const [listId, node] of Object.entries(localDoc.lists)) {
      const newId = rename.get(listId) ?? listId;
      out.lists[newId] = clone2(node);
    }
    return out;
  }

  // userscript/src/sync-cycle.mjs
  var DEFAULT_MAX_ATTEMPTS = 3;
  function fingerprint(lists) {
    return JSON.stringify([...lists].sort((a, b) => String(a.id).localeCompare(String(b.id))));
  }
  function stableStringify2(value) {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return "[" + value.map((v) => v === void 0 ? "null" : stableStringify2(v)).join(",") + "]";
    }
    const entries = Object.keys(value).filter((key) => value[key] !== void 0).sort().map((key) => `"${key}":${stableStringify2(value[key])}`);
    return "{" + entries.join(",") + "}";
  }
  function sameDoc(left, right) {
    return stableStringify2(left) === stableStringify2(right);
  }
  var ZERO_DELTA = {
    listsAdded: 0,
    listsRemoved: 0,
    gamesAdded: 0,
    gamesRemoved: 0,
    listsLinked: 0
  };
  var zeroDelta = () => ({ ...ZERO_DELTA });
  function summarizeDelta(before, after, renames) {
    const gameIds = (list) => new Set((list.games ?? []).map((g) => String(g.id)));
    const beforeById = new Map(before.map((l) => [renames.get(String(l.id)) ?? String(l.id), l]));
    const afterById = new Map(after.map((l) => [String(l.id), l]));
    const delta = { ...ZERO_DELTA, listsLinked: renames.size };
    for (const [listId, list] of afterById) {
      const previous = beforeById.get(listId);
      if (previous == null) {
        delta.listsAdded += 1;
        delta.gamesAdded += gameIds(list).size;
        continue;
      }
      const had = gameIds(previous);
      const has = gameIds(list);
      for (const gameId of has) if (!had.has(gameId)) delta.gamesAdded += 1;
      for (const gameId of had) if (!has.has(gameId)) delta.gamesRemoved += 1;
    }
    for (const [listId, list] of beforeById) {
      if (afterById.has(listId)) continue;
      delta.listsRemoved += 1;
      delta.gamesRemoved += gameIds(list).size;
    }
    return delta;
  }
  function dropLists(doc, ids) {
    if (ids.size === 0) return doc;
    const out = { version: doc.version, lists: {} };
    for (const [listId, node] of Object.entries(doc.lists)) {
      if (!ids.has(listId)) out.lists[listId] = node;
    }
    return out;
  }
  function readSnapshot(storage) {
    const raw = storage.getItem(LISTS_KEY);
    const { syncable, remote } = readSyncable(storage);
    return { raw, syncable, remote, corrupt: looksCorrupt(raw, syncable, remote) };
  }
  function looksCorrupt(raw, syncable, remote) {
    if (raw == null) return false;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return true;
    }
    if (!Array.isArray(parsed)) return true;
    if (parsed.length !== syncable.length + remote.length) return true;
    return syncable.some((l) => l.id == null) || remote.some((l) => l.id == null);
  }
  async function runSyncCycle({
    storage,
    client,
    loadBase: loadBase2,
    saveBase: saveBase2,
    saveBackup: saveBackup2,
    confirmAdoptions: confirmAdoptions2,
    now = Date.now(),
    maxAttempts = DEFAULT_MAX_ATTEMPTS
  }) {
    const base = await loadBase2() ?? emptyDoc();
    let remote = await client.getState();
    const adoptions = planAdoptions(toDoc(readSyncable(storage).syncable), remote.doc);
    const adopt = adoptions.length > 0 && await confirmAdoptions2(adoptions);
    const renames = new Map(adopt ? adoptions.map((a) => [String(a.localId), String(a.remoteId)]) : []);
    let pushed = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const snapshot = readSnapshot(storage);
      if (snapshot.raw == null && Object.values(base.lists).some((n) => n.deletedAt == null)) {
        return { status: "corrupt", revision: remote.revision, changed: false, delta: zeroDelta() };
      }
      if (snapshot.corrupt) {
        return { status: "corrupt", revision: remote.revision, changed: false, delta: zeroDelta() };
      }
      const frozenIds = new Set(snapshot.remote.map((l) => l.id));
      const workingBase = dropLists(base, frozenIds);
      const rawLocalDoc = toDoc(snapshot.syncable);
      const localDoc = adopt ? applyAdoptions(rawLocalDoc, adoptions) : rawLocalDoc;
      const stamped = stampChanges(workingBase, localDoc, now);
      const merged = gcTombstones(mergeDoc(workingBase, stamped, remote.doc, now), now);
      const mergedLists = fromDoc(dropLists(merged, frozenIds));
      const currentLists = snapshot.syncable;
      const changed = fingerprint(fromDoc(toDoc(currentLists))) !== fingerprint(mergedLists);
      const delta = changed ? summarizeDelta(currentLists, mergedLists, renames) : zeroDelta();
      let settledRevision = remote.revision;
      if (!sameDoc(merged, remote.doc)) {
        const result = await client.putState(remote.revision, merged);
        if (!result.ok) {
          remote = { revision: result.revision, doc: result.doc };
          continue;
        }
        settledRevision = result.revision;
        pushed = true;
        remote = { revision: settledRevision, doc: merged };
      }
      if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
        if (pushed && attempt < maxAttempts) continue;
        return { status: "synced", revision: settledRevision, changed: false, delta: zeroDelta() };
      }
      if (changed) {
        await saveBackup2(currentLists);
        if (storage.getItem(LISTS_KEY) !== snapshot.raw) {
          if (pushed && attempt < maxAttempts) continue;
          return { status: "synced", revision: settledRevision, changed: false, delta: zeroDelta() };
        }
        writeSyncable(storage, mergedLists);
      }
      await saveBase2(dropLists(merged, frozenIds));
      return { status: "synced", revision: settledRevision, changed, delta };
    }
    return { status: "conflict", revision: remote.revision, changed: false, delta: zeroDelta() };
  }

  // userscript/src/migrate.mjs
  var OLD_DEFAULT_ENDPOINT = "https://trippixn.com/api/psnp-sync";
  var OLD_PREFIX = "psnpsync.";
  var NEW_PREFIX = "psnppp.";
  var COPIED_SUFFIXES = ["endpoint", "key", "base"];
  var OLD_BACKUP_PREFIX = `${OLD_PREFIX}backup.`;
  var NEW_BACKUP_PREFIX = `${NEW_PREFIX}backup.`;
  var OLD_INDEX_KEY = `${OLD_PREFIX}backups`;
  var NEW_INDEX_KEY = `${NEW_PREFIX}backups`;
  var OLD_ENDPOINT_KEY = `${OLD_PREFIX}endpoint`;
  var NEW_ENDPOINT_KEY = `${NEW_PREFIX}endpoint`;
  var read = async (key) => GM.getValue(key, null);
  async function moveKey(oldKey, newKey) {
    const oldValue = await read(oldKey);
    if (oldValue == null) return false;
    if (await read(newKey) == null) await GM.setValue(newKey, oldValue);
    await GM.deleteValue(oldKey);
    return true;
  }
  async function migrateBackups() {
    const oldIndex = await read(OLD_INDEX_KEY);
    if (!Array.isArray(oldIndex)) return 0;
    if (await read(NEW_INDEX_KEY) != null) return 0;
    const newIndex = [];
    const oldBlobKeys = [];
    let moved = 0;
    for (const entry of oldIndex) {
      if (entry == null || typeof entry.id !== "string" || !entry.id.startsWith(OLD_BACKUP_PREFIX)) {
        newIndex.push(entry);
        continue;
      }
      const newId = NEW_BACKUP_PREFIX + entry.id.slice(OLD_BACKUP_PREFIX.length);
      const blob = await read(entry.id);
      if (blob != null) {
        await GM.setValue(newId, blob);
        oldBlobKeys.push(entry.id);
        moved += 1;
      }
      newIndex.push({ ...entry, id: newId });
    }
    await GM.setValue(NEW_INDEX_KEY, newIndex);
    for (const key of oldBlobKeys) await GM.deleteValue(key);
    await GM.deleteValue(OLD_INDEX_KEY);
    return moved;
  }
  async function rewriteDefaultEndpoint() {
    const current = await read(NEW_ENDPOINT_KEY);
    if (current == null) return false;
    if (current !== OLD_DEFAULT_ENDPOINT && current !== `${OLD_DEFAULT_ENDPOINT}/`) return false;
    await GM.setValue(NEW_ENDPOINT_KEY, DEFAULT_ENDPOINT);
    return true;
  }
  async function migrateGmStorage() {
    let keys = 0;
    for (const suffix of COPIED_SUFFIXES) {
      if (await moveKey(OLD_PREFIX + suffix, NEW_PREFIX + suffix)) keys += 1;
    }
    const blobs = await migrateBackups();
    const endpointRewritten = await rewriteDefaultEndpoint();
    return { keys, blobs, endpointRewritten };
  }

  // userscript/src/update-check.mjs
  var THROTTLE_MS = 30 * 60 * 1e3;
  function parseVersion(metaText) {
    if (typeof metaText !== "string") return null;
    const match = metaText.match(/@version\s+(\S+)/);
    if (!match) return null;
    const version = match[1];
    return /^\d+(\.\d+)*$/.test(version) ? version : null;
  }
  function isNewer(latest, current) {
    const segments = (value) => String(value ?? "").split(".").map((part) => {
      const n = Number.parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
    const a = segments(latest);
    const b = segments(current);
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i += 1) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      if (av !== bv) return av > bv;
    }
    return false;
  }
  async function checkForUpdate({
    currentVersion,
    metaUrl,
    request = gmRequest,
    now = Date.now(),
    loadState,
    saveState
  }) {
    let state = null;
    try {
      state = await loadState();
    } catch {
      state = null;
    }
    if (state && typeof state.checkedAt === "number" && now - state.checkedAt < THROTTLE_MS) {
      const cached = state.latest ?? null;
      return { available: cached != null && isNewer(cached, currentVersion), latest: cached };
    }
    let result = { available: false, latest: null };
    try {
      const response = await request({ method: "GET", url: metaUrl });
      if (response && response.status === 200) {
        const latest = parseVersion(response.responseText);
        if (latest != null) {
          result = { available: isNewer(latest, currentVersion), latest };
        }
      }
    } catch {
    }
    try {
      await saveState({ checkedAt: now, latest: result.latest });
    } catch {
    }
    return result;
  }

  // userscript/src/compat.mjs
  var SCRIPT_STATE_KEY = "psnpp-scriptstate";
  var isIdentity = (value) => typeof value === "string" || typeof value === "number";
  var isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  function readRaw(storage, key) {
    try {
      const raw = storage?.getItem?.(key);
      return typeof raw === "string" ? raw : null;
    } catch {
      return null;
    }
  }
  function readPsnpPlusVersion(storage) {
    const raw = readRaw(storage, SCRIPT_STATE_KEY);
    if (raw == null) return null;
    try {
      const state = JSON.parse(raw);
      if (!isPlainObject(state)) return null;
      const version = state.version;
      return typeof version === "string" && version !== "" ? version : null;
    } catch {
      return null;
    }
  }
  var REASONS = {
    "list-id": "a list whose id is no longer a plain value",
    "list-url": "a list whose feed url is no longer plain text",
    "games-not-array": "a list whose games are no longer stored as a list",
    "game-not-object": "a game entry that is no longer a record",
    "game-id": "a game with no usable id",
    "game-updated-at": "a game carrying a new updatedAt field, which PSNP++ uses for its own bookkeeping",
    "list-name": "lists that no longer carry a name"
  };
  var compatible = (version) => ({ ok: true, code: null, reason: null, version });
  var incompatible = (code, version) => ({ ok: false, code, reason: REASONS[code], version });
  var DEFER = Symbol("defer");
  var REMOTE = Symbol("remote");
  function checkList(list) {
    if (list.id == null) return DEFER;
    const url = list.url;
    if (url != null && typeof url !== "string") return "list-url";
    if (isRemoteList(list)) return REMOTE;
    if (!isIdentity(list.id)) return "list-id";
    const games = list.games;
    if (games == null) return null;
    if (!Array.isArray(games)) return "games-not-array";
    for (const game of games) {
      if (!isPlainObject(game)) return "game-not-object";
      if (!isIdentity(game.id)) return "game-id";
      if (Object.hasOwn(game, "updatedAt")) return "game-updated-at";
    }
    return null;
  }
  function checkPsnpPlusCompat(storage) {
    const version = readPsnpPlusVersion(storage);
    try {
      const raw = readRaw(storage, LISTS_KEY);
      if (raw == null) return compatible(version);
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return compatible(version);
      }
      if (!Array.isArray(parsed)) return compatible(version);
      const lists = parsed.filter(isPlainObject);
      let syncable = 0;
      let named = 0;
      for (const list of lists) {
        const verdict = checkList(list);
        if (verdict === DEFER || verdict === REMOTE) continue;
        if (verdict !== null) return incompatible(verdict, version);
        syncable += 1;
        if (Object.hasOwn(list, "name")) named += 1;
      }
      if (syncable > 0 && named === 0) return incompatible("list-name", version);
      return compatible(version);
    } catch (error) {
      console.error("[psnppp] compatibility check failed:", error);
      return compatible(version);
    }
  }
  function describeIncompatibility(result) {
    const version = typeof result?.version === "string" && result.version !== "" ? ` v${result.version}` : "";
    const reason = typeof result?.reason === "string" && result.reason !== "" ? ` \u2014 ${result.reason}` : "";
    return `PSNP+${version} has changed how it saves your lists${reason}. PSNP++ has paused syncing: nothing was uploaded and nothing on this device was changed, so your lists are untouched. Syncing resumes once PSNP++ understands the new format.`;
  }

  // userscript/src/settings-bridge.mjs
  var SETTINGS_KEY = "psnpp-settings";
  var SCRIPT_STATE_KEY2 = "psnpp-scriptstate";
  var STORE_KEYS = [SETTINGS_KEY, SCRIPT_STATE_KEY2];
  var UNSYNCED_SETTINGS_FIELDS = Object.freeze(["platPricesApiKey"]);
  var SYNCED_SCRIPT_STATE_FIELDS = Object.freeze([
    "activeChecklist",
    "guideSimpleMatching",
    "hideLowOwners",
    "hideUnobtainableTrophiesInLog",
    "lowOwnersThreshold",
    "mySeriesCollapseNoStage",
    "mySeriesCollapseNumberedStages",
    "seriesAutoCollapse",
    "seriesDoNotCollapseNoStage"
  ]);
  var UNSYNCED_SETTINGS = new Set(UNSYNCED_SETTINGS_FIELDS);
  var SYNCED_SCRIPT_STATE = new Set(SYNCED_SCRIPT_STATE_FIELDS);
  function isSyncedField(store, field) {
    if (store === SETTINGS_KEY) return !UNSYNCED_SETTINGS.has(field);
    if (store === SCRIPT_STATE_KEY2) return SYNCED_SCRIPT_STATE.has(field);
    return false;
  }
  function readStore(storage, key) {
    let raw;
    try {
      raw = storage.getItem(key);
    } catch {
      return null;
    }
    if (raw == null) return null;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  }
  function isUnreadable(storage, key) {
    let raw;
    try {
      raw = storage.getItem(key);
    } catch {
      return true;
    }
    return raw != null && readStore(storage, key) == null;
  }
  function readSettingsValues(storage) {
    const out = {};
    for (const store of STORE_KEYS) {
      const parsed = readStore(storage, store);
      if (parsed == null) continue;
      const fields = {};
      for (const [field, value] of Object.entries(parsed)) {
        if (isSyncedField(store, field)) fields[field] = value;
      }
      out[store] = fields;
    }
    return out;
  }
  function writeSettingsValues(storage, values) {
    let wrote = false;
    for (const store of STORE_KEYS) {
      const fields = values?.[store];
      if (fields == null || Object.keys(fields).length === 0) continue;
      if (isUnreadable(storage, store)) continue;
      const current = readStore(storage, store) ?? {};
      const next = { ...current };
      for (const [field, value] of Object.entries(fields)) {
        if (isSyncedField(store, field)) next[field] = value;
      }
      const serialized = JSON.stringify(next);
      if (serialized === storage.getItem(store)) continue;
      storage.setItem(store, serialized);
      wrote = true;
    }
    return wrote;
  }

  // userscript/src/settings-sync.mjs
  var SETTINGS_DOCUMENT = "settings";
  var SETTINGS_DOC_VERSION = 1;
  function emptySettingsDoc() {
    return { version: SETTINGS_DOC_VERSION, settings: {} };
  }
  var nameOf = (store, field) => `${store}.${field}`;
  var stable = (value) => {
    const walk = (obj) => {
      if (Array.isArray(obj)) return obj.map(walk);
      if (obj == null || typeof obj !== "object") return obj;
      const out = {};
      for (const key of Object.keys(obj).sort()) {
        if (obj[key] !== void 0) out[key] = walk(obj[key]);
      }
      return out;
    };
    return JSON.stringify(walk(value));
  };
  function stampSettings(base, values, now) {
    const previous = base?.settings ?? {};
    const firstSync = Object.keys(previous).length === 0;
    const settings = {};
    for (const [store, fields] of Object.entries(values ?? {})) {
      for (const [field, value] of Object.entries(fields ?? {})) {
        const key = nameOf(store, field);
        const before = previous[key];
        const unchanged = before != null && stable(before.value) === stable(value);
        settings[key] = {
          value,
          updatedAt: firstSync ? 0 : unchanged ? before.updatedAt : now
        };
      }
    }
    return { version: SETTINGS_DOC_VERSION, settings, firstSync };
  }
  function mergeSettings(localDoc, remoteDoc, { preferRemote = false } = {}) {
    const local = localDoc?.settings ?? {};
    const remote = remoteDoc?.settings ?? {};
    const settings = {};
    for (const key of /* @__PURE__ */ new Set([...Object.keys(local), ...Object.keys(remote)])) {
      const mine = local[key];
      const theirs = remote[key];
      if (mine == null) {
        settings[key] = theirs;
        continue;
      }
      if (theirs == null) {
        settings[key] = mine;
        continue;
      }
      if (theirs.updatedAt > mine.updatedAt) {
        settings[key] = theirs;
        continue;
      }
      if (theirs.updatedAt < mine.updatedAt) {
        settings[key] = mine;
        continue;
      }
      if (preferRemote) {
        settings[key] = theirs;
        continue;
      }
      settings[key] = stable(theirs.value) <= stable(mine.value) ? theirs : mine;
    }
    return { version: SETTINGS_DOC_VERSION, settings };
  }
  function toStoreValues(doc) {
    const values = {};
    for (const [key, entry] of Object.entries(doc?.settings ?? {})) {
      if (entry == null || !Object.hasOwn(entry, "value")) continue;
      const cut = key.indexOf(".");
      if (cut <= 0) continue;
      const store = key.slice(0, cut);
      const field = key.slice(cut + 1);
      (values[store] ??= {})[field] = entry.value;
    }
    return values;
  }
  async function syncSettings({ storage, client, loadBase: loadBase2, saveBase: saveBase2, now = Date.now() }) {
    const base = await loadBase2() ?? emptySettingsDoc();
    const remote = await client.getState();
    const stamped = stampSettings(base, readSettingsValues(storage), now);
    const merged = mergeSettings(stamped, remote.doc, { preferRemote: stamped.firstSync });
    const changed = writeSettingsValues(storage, toStoreValues(merged));
    const result = await client.putState(remote.revision, merged);
    if (result.ok) await saveBase2(merged);
    return { status: result.ok ? "synced" : "conflict", changed };
  }

  // userscript/src/health.mjs
  var BADGE_CONTAINER = "div.logo";
  var BADGE_PREFIX = "PSNP+ v";
  var DISPOSABLE_KEYS = Object.freeze([
    "psnpp-platprices",
    "psnpp-sessions",
    "psnpp-guides",
    "psnpp-unobtainabletrophies",
    "psnpp-donators",
    "psnpp-shutdowns"
  ]);
  var STORAGE_WARN_BYTES = 4 * 1024 * 1024;
  var PSNP_PREFIX = "psnpp-";
  function checkPsnpPlusPresent(doc) {
    try {
      if (doc == null || typeof doc.querySelector !== "function") return "unknown";
      if (doc.readyState !== "complete") return "unknown";
      const container = doc.querySelector(BADGE_CONTAINER);
      if (container == null) return "unknown";
      const text = typeof container.textContent === "string" ? container.textContent : "";
      const badges = countOccurrences(text, BADGE_PREFIX);
      if (badges === 0) return "missing";
      return badges > 1 ? "duplicate" : "running";
    } catch {
      return "unknown";
    }
  }
  var countOccurrences = (haystack, needle) => {
    let count = 0;
    let at = haystack.indexOf(needle);
    while (at !== -1) {
      count += 1;
      at = haystack.indexOf(needle, at + needle.length);
    }
    return count;
  };
  function measurePsnpStorage(storage) {
    const keys = [];
    let bytes = 0;
    try {
      const total = typeof storage.length === "number" ? storage.length : 0;
      for (let i = 0; i < total; i += 1) {
        const key = storage.key(i);
        if (typeof key !== "string") continue;
        if (!key.startsWith(PSNP_PREFIX) && !key.startsWith("psnppp.")) continue;
        const value = storage.getItem(key);
        const size = key.length + (typeof value === "string" ? value.length : 0);
        keys.push({ key, bytes: size });
        bytes += size;
      }
    } catch {
    }
    keys.sort((a, b) => b.bytes - a.bytes);
    return { bytes, keys };
  }
  function checkHealth({ storage, doc, warnBytes = STORAGE_WARN_BYTES }) {
    const psnpPlus = checkPsnpPlusPresent(doc);
    const { bytes, keys } = measurePsnpStorage(storage);
    return {
      psnpPlus,
      bytes,
      keys,
      storageTight: bytes >= warnBytes,
      disposableBytes: keys.filter((entry) => DISPOSABLE_KEYS.includes(entry.key)).reduce((sum, entry) => sum + entry.bytes, 0)
    };
  }
  var mb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  function describeHealth(health) {
    if (health == null) return null;
    if (health.psnpPlus === "duplicate") {
      return "Two copies of PSNP+ are running. PSNP++ now includes PSNP+ \u2014 disable the separate PSNP+ script in your userscript manager, or the two will overwrite each other's list edits.";
    }
    if (health.psnpPlus === "missing") {
      return "PSNP+ did not load on this page. Your lists are safe, but PSNP+ is not running.";
    }
    if (health.storageTight) {
      const freeable = health.disposableBytes > 0 ? ` ${mb(health.disposableBytes)} of that is refetchable cache.` : "";
      return `PSNP+ storage is at ${mb(health.bytes)}. Near the browser limit, edits can fail to save.${freeable}`;
    }
    return null;
  }

  // userscript/src/progress-history.mjs
  var GAMES_LIST_KEY = "psnpp-gameslist";
  var PROGRESS_DOCUMENT = "progress";
  var PROGRESS_DOC_VERSION = 1;
  var MAX_POINTS_PER_GAME = 50;
  function emptyProgressDoc() {
    return { version: PROGRESS_DOC_VERSION, games: {} };
  }
  var isPlainObject2 = (value) => value != null && typeof value === "object" && !Array.isArray(value);
  function readScrapedGames(storage) {
    try {
      const raw = storage.getItem(GAMES_LIST_KEY);
      if (typeof raw !== "string") return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isPlainObject2) : [];
    } catch {
      return [];
    }
  }
  var trophiesOf = (game) => {
    const t2 = isPlainObject2(game.trophies) ? game.trophies : {};
    return {
      platinum: Number(t2.platinum) || 0,
      gold: Number(t2.gold) || 0,
      silver: Number(t2.silver) || 0,
      bronze: Number(t2.bronze) || 0
    };
  };
  function observationOf(game) {
    return {
      progress: Number(game.progress) || 0,
      trophies: trophiesOf(game),
      lastActivity: Number(game.lastActivity) || 0
    };
  }
  var sameObservation = (a, b) => a != null && b != null && a.progress === b.progress && a.lastActivity === b.lastActivity && a.trophies.platinum === b.trophies.platinum && a.trophies.gold === b.trophies.gold && a.trophies.silver === b.trophies.silver && a.trophies.bronze === b.trophies.bronze;
  function recordScrape(doc, games, now) {
    const base = isPlainObject2(doc?.games) ? doc.games : {};
    const next = { ...base };
    let recorded = 0;
    for (const game of games) {
      const id = game?.id;
      if (id == null || id === "") continue;
      const key = String(id);
      const observation = observationOf(game);
      const existing = next[key];
      const points = Array.isArray(existing?.points) ? existing.points : [];
      const newest = points.length > 0 ? points[points.length - 1] : null;
      const title = typeof game.title === "string" && game.title !== "" ? game.title : existing?.title ?? "";
      if (sameObservation(newest, observation)) {
        if (title !== existing?.title) next[key] = { ...existing, title };
        continue;
      }
      const appended = [...points, { at: now, ...observation }];
      next[key] = {
        title,
        points: appended.length > MAX_POINTS_PER_GAME ? appended.slice(appended.length - MAX_POINTS_PER_GAME) : appended
      };
      recorded += 1;
    }
    return { doc: { version: PROGRESS_DOC_VERSION, games: next }, recorded };
  }
  function mergeProgress(localDoc, remoteDoc) {
    const local = isPlainObject2(localDoc?.games) ? localDoc.games : {};
    const remote = isPlainObject2(remoteDoc?.games) ? remoteDoc.games : {};
    const games = {};
    for (const key of /* @__PURE__ */ new Set([...Object.keys(local), ...Object.keys(remote)])) {
      const mine = local[key];
      const theirs = remote[key];
      const byTime = /* @__PURE__ */ new Map();
      for (const point of [...mine?.points ?? [], ...theirs?.points ?? []]) {
        if (point == null || typeof point.at !== "number") continue;
        if (!byTime.has(point.at)) byTime.set(point.at, point);
      }
      const points = [...byTime.values()].sort((a, b) => a.at - b.at);
      games[key] = {
        title: theirs?.title || mine?.title || "",
        points: points.length > MAX_POINTS_PER_GAME ? points.slice(points.length - MAX_POINTS_PER_GAME) : points
      };
    }
    return { version: PROGRESS_DOC_VERSION, games };
  }
  async function syncProgress({ storage, client, loadBase: loadBase2, saveBase: saveBase2, now = Date.now() }) {
    const base = await loadBase2() ?? emptyProgressDoc();
    const remote = await client.getState();
    const merged = mergeProgress(base, remote.doc);
    const { doc, recorded } = recordScrape(merged, readScrapedGames(storage), now);
    if (JSON.stringify(doc) === JSON.stringify(remote.doc)) {
      await saveBase2(doc);
      return { status: "synced", recorded: 0, pushed: false };
    }
    const result = await client.putState(remote.revision, doc);
    if (result.ok) await saveBase2(doc);
    return { status: result.ok ? "synced" : "conflict", recorded, pushed: result.ok };
  }

  // userscript/src/watch.mjs
  var SHUTDOWNS_KEY = "psnpp-shutdowns";
  var UNOBTAINABLES_KEY = "psnpp-unobtainabletrophies";
  var SHUTDOWN_HORIZON_DAYS = 120;
  var DAY_MS = 24 * 60 * 60 * 1e3;
  var isPlainObject3 = (value) => value != null && typeof value === "object" && !Array.isArray(value);
  function readFeed(storage, key) {
    try {
      const raw = storage.getItem(key);
      if (typeof raw !== "string") return {};
      const parsed = JSON.parse(raw);
      const list = parsed?.data?.list;
      return isPlainObject3(list) ? list : {};
    } catch {
      return {};
    }
  }
  function gamesInLists(storage) {
    const games = /* @__PURE__ */ new Map();
    for (const list of readLists(storage)) {
      if (!Array.isArray(list?.games)) continue;
      for (const game of list.games) {
        if (!isPlainObject3(game) || game.id == null) continue;
        const id = String(game.id);
        const entry = games.get(id) ?? { id, title: game.title ?? "", lists: [] };
        if (typeof list.name === "string" && !entry.lists.includes(list.name)) {
          entry.lists.push(list.name);
        }
        if (!entry.title && typeof game.title === "string") entry.title = game.title;
        games.set(id, entry);
      }
    }
    return [...games.values()];
  }
  function shutdownWatch(games, feed, now, horizonDays = SHUTDOWN_HORIZON_DAYS) {
    const soon = [];
    const passed = [];
    for (const game of games) {
      const entry = feed[game.id];
      if (!isPlainObject3(entry)) continue;
      const at = Number(entry.shutdownTimestamp);
      if (!Number.isFinite(at) || at === 0) continue;
      const days = Math.round((at - now) / DAY_MS);
      const found = { ...game, at, days, note: typeof entry.note === "string" ? entry.note : "" };
      if (at <= now) passed.push(found);
      else if (days <= horizonDays) soon.push(found);
    }
    soon.sort((a, b) => a.at - b.at);
    passed.sort((a, b) => b.at - a.at);
    return { soon, passed };
  }
  function unobtainableWatch(games, feed) {
    const out = [];
    for (const game of games) {
      const trophies = feed[game.id];
      if (!Array.isArray(trophies) || trophies.length === 0) continue;
      out.push({ ...game, count: trophies.length });
    }
    return out.sort((a, b) => b.count - a.count);
  }
  function checkWatch({ storage, now = Date.now(), horizonDays = SHUTDOWN_HORIZON_DAYS }) {
    try {
      const games = gamesInLists(storage);
      const shutdowns = shutdownWatch(games, readFeed(storage, SHUTDOWNS_KEY), now, horizonDays);
      const unobtainable = unobtainableWatch(games, readFeed(storage, UNOBTAINABLES_KEY));
      return { shutdowns, unobtainable, gamesChecked: games.length };
    } catch {
      return { shutdowns: { soon: [], passed: [] }, unobtainable: [], gamesChecked: 0 };
    }
  }
  var plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  function describeWatch(watch) {
    const soon = watch?.shutdowns?.soon ?? [];
    if (soon.length === 0) return null;
    const next = soon[0];
    const when = next.days <= 0 ? "today" : `in ${plural(next.days, "day")}`;
    const rest = soon.length > 1 ? ` (+${soon.length - 1} more)` : "";
    return `${next.title || "A game"} in your lists shuts down ${when}${rest}.`;
  }

  // userscript/src/menu.mjs
  var MENU_SELECTOR = ".psnpp-floating-menu";
  var ENTRY_ID = "psnppp-menu-entry";
  var WAIT_MS = 8e3;
  function attachMenuEntry(doc, { onClick, label = "Sync now" } = {}) {
    try {
      const menu = doc?.querySelector?.(MENU_SELECTOR);
      if (menu == null) return null;
      const existing = doc.getElementById?.(ENTRY_ID);
      if (existing != null) {
        return { element: existing, setLabel: (text) => {
          existing.textContent = text;
        } };
      }
      const row = doc.createElement("div");
      row.id = ENTRY_ID;
      row.textContent = label;
      row.style.cssText = [
        "margin-top:6px",
        `border-top:1px solid ${TOKENS.hairline}`,
        "padding-top:6px",
        "cursor:pointer",
        `color:${TOKENS.gold}`,
        "user-select:none"
      ].join(";");
      row.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          onClick?.();
        } catch (error) {
          console.error("[psnppp] menu action failed:", error);
        }
      });
      menu.appendChild(row);
      return { element: row, setLabel: (text) => {
        row.textContent = text;
      } };
    } catch (error) {
      console.error("[psnppp] could not add the menu entry:", error);
      return null;
    }
  }
  function attachMenuEntryWhenReady(doc, options = {}, { waitMs = WAIT_MS } = {}) {
    return new Promise((resolve) => {
      try {
        const immediate = attachMenuEntry(doc, options);
        if (immediate != null) {
          resolve(immediate);
          return;
        }
        if (typeof MutationObserver !== "function" || doc?.body == null) {
          resolve(null);
          return;
        }
        let settled = false;
        const finish = (handle) => {
          if (settled) return;
          settled = true;
          observer.disconnect();
          clearTimeout(timer);
          resolve(handle);
        };
        const observer = new MutationObserver(() => {
          const handle = attachMenuEntry(doc, options);
          if (handle != null) finish(handle);
        });
        observer.observe(doc.body, { childList: true, subtree: true });
        const timer = setTimeout(() => finish(null), waitMs);
      } catch (error) {
        console.error("[psnppp] could not watch for the menu:", error);
        resolve(null);
      }
    });
  }

  // userscript/src/main.mjs
  var BASE_KEY = "psnppp.base";
  var SETTINGS_BASE_KEY = "psnppp.settingsBase";
  var PROGRESS_BASE_KEY = "psnppp.progressBase";
  var CHANGE_DEBOUNCE_MS = 3e3;
  var PSNP_PLUS_VERSION_KEY = "psnppp.psnpPlusVersion";
  var UPDATE_META_URL = "https://trippixn.com/psnppp.meta.js";
  var UPDATE_INSTALL_URL = "https://trippixn.com/psnppp.user.js";
  var UPDATE_STATE_KEY = "psnppp.updateCheck";
  var loadUpdateState = () => GM.getValue(UPDATE_STATE_KEY, null);
  var saveUpdateState = (state) => GM.setValue(UPDATE_STATE_KEY, state);
  async function recordPsnpPlusVersion(version) {
    if (typeof version !== "string" || version === "") return;
    try {
      const seen = await GM.getValue(PSNP_PLUS_VERSION_KEY, null);
      if (seen === version) return;
      await GM.setValue(PSNP_PLUS_VERSION_KEY, version);
      if (seen != null) {
        console.info(`[psnppp] PSNP+ changed version: ${seen} -> ${version}`);
      }
    } catch (error) {
      console.error("[psnppp] could not record the PSNP+ version:", error);
    }
  }
  function currentScriptVersion() {
    return typeof GM_info !== "undefined" && GM_info?.script?.version || null;
  }
  var loadBase = async () => {
    const raw = await GM.getValue(BASE_KEY, null);
    if (raw == null) return emptyDoc();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return emptyDoc();
    }
    if (parsed == null || typeof parsed.lists !== "object" || parsed.lists === null || Array.isArray(parsed.lists)) {
      return emptyDoc();
    }
    return parsed;
  };
  var saveBase = async (doc) => GM.setValue(BASE_KEY, JSON.stringify(doc));
  var loadSettingsBase = async () => {
    const raw = await GM.getValue(SETTINGS_BASE_KEY, null);
    if (raw == null) return emptySettingsDoc();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return emptySettingsDoc();
    }
    if (parsed == null || typeof parsed.settings !== "object" || parsed.settings === null || Array.isArray(parsed.settings)) {
      return emptySettingsDoc();
    }
    return parsed;
  };
  var saveSettingsBase = async (doc) => GM.setValue(SETTINGS_BASE_KEY, JSON.stringify(doc));
  var loadProgressBase = async () => {
    const raw = await GM.getValue(PROGRESS_BASE_KEY, null);
    if (raw == null) return emptyProgressDoc();
    try {
      const parsed = JSON.parse(raw);
      if (parsed == null || typeof parsed.games !== "object" || parsed.games === null || Array.isArray(parsed.games)) {
        return emptyProgressDoc();
      }
      return parsed;
    } catch {
      return emptyProgressDoc();
    }
  };
  var saveProgressBase = async (doc) => GM.setValue(PROGRESS_BASE_KEY, JSON.stringify(doc));
  async function confirmAdoptions(adoptions) {
    const names = adoptions.map((a) => `\u2022 ${a.name}`).join("\n");
    return window.confirm(
      `PSNP++ found lists on the server with the same names as lists on this device:

${names}

Link them so they stay in sync? Choose Cancel to keep them separate.`
    );
  }
  function confirmTarget() {
    try {
      if (typeof unsafeWindow !== "undefined" && unsafeWindow != null && typeof unsafeWindow.confirm === "function") {
        return unsafeWindow;
      }
    } catch (error) {
      console.error("[psnppp] could not reach unsafeWindow:", error);
    }
    return typeof window !== "undefined" ? window : null;
  }
  var autoConfirm = null;
  async function applyAutoConfirm(enabled, { target = confirmTarget() } = {}) {
    try {
      autoConfirm?.uninstall();
    } catch (error) {
      console.error("[psnppp] could not remove the auto-confirm override:", error);
    }
    autoConfirm = null;
    if (!enabled) return true;
    try {
      autoConfirm = installAutoConfirm({
        target,
        // Read at click time, not snapshotted here: the user is deleting games,
        // so a set captured at install would go stale within one click.
        knownTitles: () => readGameTitles(window.localStorage)
      });
      return autoConfirm.installed === true;
    } catch (error) {
      console.error("[psnppp] could not install the auto-confirm override:", error);
      return false;
    }
  }
  var activePanel = null;
  var PENDING_PANEL = { close() {
  } };
  async function openSettings({ chip = null } = {}) {
    let panel = null;
    let mounted = false;
    try {
      if (activePanel) {
        const open = activePanel;
        activePanel = null;
        open.close();
        return;
      }
      activePanel = PENDING_PANEL;
      const [backups, history, config, autoConfirmRemove, loadError] = await loadPanelData();
      await new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          activePanel = null;
          try {
            chip?.setPanelOpen?.(false);
          } catch (error) {
            console.error("[psnppp] could not un-mark the chip:", error);
          }
          resolve();
        };
        panel = createSettingsPanel({
          anchor: chip?.element ?? null,
          side: chip?.getSide?.() ?? "right",
          config,
          backups,
          history,
          describeDelta,
          autoConfirmRemove,
          // Three things have to agree afterwards: the checkbox, GM storage, and
          // what is actually installed on `confirm`. So switch the override
          // first, only record it once that worked, and undo it if the record
          // fails — every early exit reports `{ ok: false }`, which is what makes
          // the panel put the checkbox back.
          onToggleAutoConfirm: async (next) => {
            try {
              if (!await applyAutoConfirm(next)) {
                return {
                  ok: false,
                  message: "PSNP++ could not take over that PSNP+ prompt on this page, so it will keep asking. Nothing was changed."
                };
              }
              try {
                await saveAutoConfirmRemove(next);
              } catch (error) {
                await applyAutoConfirm(!next);
                throw error;
              }
              return { ok: true };
            } catch (error) {
              console.error("[psnppp] could not save the auto-confirm setting:", error);
              return { ok: false, message: describeFailure(error, "Could not save that setting") };
            }
          },
          onSave: async ({ endpoint, key }) => {
            try {
              return await applyConfig({ endpoint, key });
            } catch (error) {
              console.error("[psnppp] could not save settings:", error);
              return { ok: false, message: describeFailure(error, "Could not save your settings") };
            }
          },
          onRestore: async (id) => {
            try {
              const restored = await restoreBackup(id);
              const { syncable: currentLists } = readSyncable(window.localStorage);
              await saveBackup(currentLists);
              writeSyncable(window.localStorage, restored);
              window.location.reload();
              return { ok: true, message: "Backup restored. Reloading." };
            } catch (error) {
              console.error("[psnppp] could not restore a backup:", error);
              return { ok: false, message: describeFailure(error, "Could not restore that backup") };
            }
          },
          onClose: finish
        });
        activePanel = panel;
        chip?.setPanelOpen?.(true);
        document.body.appendChild(panel.element);
        mounted = true;
        if (loadError) panel.showMessage(loadError, { error: true });
      });
    } catch (error) {
      console.error("[psnppp] settings failed:", error);
      if (mounted && panel) {
        panel.showMessage(describeFailure(error, "Settings failed"), { error: true });
        return;
      }
      activePanel = null;
      chip?.setPanelOpen?.(false);
      window.alert(`PSNP++ \u2014 ${describeFailure(error, "settings failed")}`);
    }
  }
  async function loadPanelData() {
    const [backups, history, config, autoConfirmRemove] = await Promise.allSettled([
      listBackups(),
      listSyncHistory(),
      loadConfig(),
      loadAutoConfirmRemove()
    ]);
    const failures = [backups, history, config, autoConfirmRemove].filter((result) => result.status === "rejected").map((result) => describeFailure(result.reason, "Could not read your saved settings"));
    return [
      backups.status === "fulfilled" ? backups.value : [],
      history.status === "fulfilled" ? history.value : [],
      config.status === "fulfilled" ? config.value : { endpoint: DEFAULT_ENDPOINT, key: "" },
      // Falls back to the DEFAULT, not to `false`: an unreadable toggle must not
      // render a box that says the feature is off while it is actually running.
      autoConfirmRemove.status === "fulfilled" ? autoConfirmRemove.value : AUTO_CONFIRM_REMOVE_DEFAULT,
      failures[0] ?? ""
    ];
  }
  async function handleSyncNowClick({ loadConfig: loadConfig2, openSettings: openSettings2, sync }) {
    const config = await loadConfig2();
    if (!config.key) {
      await openSettings2();
      return;
    }
    await sync();
  }
  var countOf2 = (n, noun) => `${n} ${noun}${n === 1 ? "" : "s"}`;
  function describeDelta(delta) {
    if (delta == null) return "lists updated";
    const parts = [];
    if (delta.gamesAdded > 0) parts.push(`+${countOf2(delta.gamesAdded, "game")}`);
    if (delta.gamesRemoved > 0) parts.push(`-${countOf2(delta.gamesRemoved, "game")}`);
    if (delta.listsAdded > 0) parts.push(`+${countOf2(delta.listsAdded, "list")}`);
    if (delta.listsRemoved > 0) parts.push(`-${countOf2(delta.listsRemoved, "list")}`);
    if (delta.listsLinked > 0) parts.push(`${countOf2(delta.listsLinked, "list")} linked`);
    return parts.length > 0 ? parts.join(", ") : "lists updated";
  }
  function describeSyncResult(result) {
    if (result.status === "synced") {
      return result.changed ? {
        state: "reload",
        detail: `Revision ${result.revision} \u2014 ${describeDelta(result.delta)} \u2014 reload the page to see your updated lists`
      } : { state: "synced", detail: `Revision ${result.revision}` };
    }
    if (result.status === "corrupt") {
      return {
        state: "conflict",
        detail: "Your PSNP+ list data looks unreadable \u2014 nothing was synced. Right-click to restore a backup."
      };
    }
    return { state: "conflict", detail: "Could not settle \u2014 try again" };
  }
  function createIndicatorPainter(setState) {
    let awaitingReload = false;
    let reloadDetail = "";
    let updateAvailable = false;
    let updateDetail = "";
    return (state, detail = "") => {
      if (state === "reload") {
        awaitingReload = true;
        reloadDetail = detail;
      }
      if (state === "update") {
        updateAvailable = true;
        updateDetail = detail;
      }
      if (awaitingReload && (state === "synced" || state === "syncing" || state === "update")) {
        setState("reload", reloadDetail);
        return;
      }
      if (updateAvailable && (state === "synced" || state === "syncing")) {
        setState("update", updateDetail);
        return;
      }
      setState(state, detail);
    };
  }
  var INSECURE_ENDPOINT_WARNING = "WARNING: this endpoint is not https, so your sync key is sent unencrypted. Right-click the chip and change it on the Sync tab.";
  function decorateDetail(detail, endpoint, health = null, watch = null) {
    const lines = [];
    if (!isAllowedEndpoint(endpoint)) lines.push(INSECURE_ENDPOINT_WARNING);
    const healthLine = describeHealth(health);
    if (healthLine) lines.push(healthLine);
    const watchLine = describeWatch(watch);
    if (watchLine) lines.push(watchLine);
    if (detail) lines.push(detail);
    return lines.join("\n");
  }
  async function start() {
    try {
      await migrateGmStorage();
    } catch (error) {
      console.error("[psnppp] GM storage migration failed:", error);
    }
    try {
      await applyAutoConfirm(await loadAutoConfirmRemove());
    } catch (error) {
      console.error("[psnppp] could not set up the remove-prompt setting:", error);
    }
    let indicator;
    const settings = () => openSettings({ chip: indicator });
    indicator = createIndicator({
      onSyncNow: () => {
        void handleSyncNowClick({ loadConfig, openSettings: settings, sync });
      },
      onSettings: async () => {
        await settings();
        void sync();
      },
      // Only ever reached from the `reload` state, i.e. after a cycle that
      // actually wrote to localStorage behind an already-drawn PSNP+ list view.
      // Never automatic — the user asks for it by clicking the chip that says so.
      onReload: () => {
        window.location.reload();
      },
      // A userscript cannot silently self-install — Tampermonkey requires the
      // user's own click on its install page. window.open, not
      // window.location.assign: this never navigates the psnprofiles.com tab
      // itself away, only opens a new one.
      onUpdate: () => {
        window.open(UPDATE_INSTALL_URL, "_blank", "noopener");
      }
    });
    document.body.appendChild(indicator.element);
    indicator.restorePosition().catch((error) => {
      console.error("[psnppp] could not restore the chip position:", error);
    });
    const paint = createIndicatorPainter(indicator.setState);
    let running = false;
    let pending = false;
    let timer = null;
    async function sync() {
      if (running) {
        pending = true;
        return;
      }
      running = true;
      try {
        const config = await loadConfig();
        if (!config.key) {
          paint("unconfigured", "Click to set up sync (or right-click for settings)");
          return;
        }
        const compat = checkPsnpPlusCompat(window.localStorage);
        void recordPsnpPlusVersion(compat.version);
        const health = checkHealth({ storage: window.localStorage, doc: document });
        const watch = checkWatch({ storage: window.localStorage });
        if (!compat.ok) {
          paint("incompatible", decorateDetail(describeIncompatibility(compat), config.endpoint, health, watch));
          return;
        }
        paint("syncing");
        const client = createSyncClient({ ...config, request: gmRequest });
        const result = await runSyncCycle({
          storage: window.localStorage,
          client,
          loadBase,
          saveBase,
          saveBackup,
          confirmAdoptions,
          now: Date.now()
        });
        const { state, detail } = describeSyncResult(result);
        paint(state, decorateDetail(detail, config.endpoint, health, watch));
        if (result.status === "synced" && result.changed) {
          try {
            await recordSync({ revision: result.revision, delta: result.delta });
          } catch (error) {
            console.error("[psnppp] could not record sync history:", error);
          }
        }
        const settings2 = await syncSettings({
          storage: window.localStorage,
          client: createSyncClient({
            ...config,
            request: gmRequest,
            documentKey: SETTINGS_DOCUMENT
          }),
          loadBase: loadSettingsBase,
          saveBase: saveSettingsBase,
          now: Date.now()
        }).catch((error) => {
          console.error("[psnppp] settings sync failed:", error);
          return { status: "offline", changed: false };
        });
        if (settings2.changed && !(result.status === "synced" && result.changed)) {
          paint("reload", decorateDetail(
            "PSNP+ settings updated \u2014 reload the page to apply them",
            config.endpoint
          ));
        }
        await syncProgress({
          storage: window.localStorage,
          client: createSyncClient({
            ...config,
            request: gmRequest,
            documentKey: PROGRESS_DOCUMENT
          }),
          loadBase: loadProgressBase,
          saveBase: saveProgressBase,
          now: Date.now()
        }).catch((error) => console.error("[psnppp] progress archive failed:", error));
      } catch (error) {
        paint("offline", describeFailure(error, "Sync failed"));
      } finally {
        running = false;
        if (pending) {
          pending = false;
          void sync();
        }
      }
    }
    void attachMenuEntryWhenReady(document, {}).then((handle) => {
      const menu = handle?.element?.parentElement;
      if (menu == null || indicator?.element == null) return;
      handle.element.remove();
      indicator.rehost(menu);
    });
    watchLists(window.localStorage, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void sync();
      }, CHANGE_DEBOUNCE_MS);
    });
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void sync();
    });
    async function checkUpdateAndPaint() {
      const currentVersion = currentScriptVersion();
      if (!currentVersion) return;
      try {
        const { available, latest } = await checkForUpdate({
          currentVersion,
          metaUrl: UPDATE_META_URL,
          loadState: loadUpdateState,
          saveState: saveUpdateState
        });
        if (available) {
          paint("update", `Version ${latest} is available`);
        }
      } catch (error) {
        console.error("[psnppp] update check failed:", error);
      }
    }
    void sync().then(() => {
      void checkUpdateAndPaint();
    });
  }
  if (typeof document !== "undefined") {
    const onStartError = (error) => console.error("[psnppp] start() failed:", error);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        start().catch(onStartError);
      });
    } else {
      start().catch(onStartError);
    }
  }
})();
