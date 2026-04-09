/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/edit.js"
/*!************************!*\
  !*** ./src/js/edit.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);





function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatTime(ts) {
  if (!Number.isFinite(ts)) return "";
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function formatDateTime(ts) {
  if (!Number.isFinite(ts)) return "";
  const d = new Date(ts);
  const date = d.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const time = formatTime(ts);
  return `${date}, ${time}`;
}
function formatTemp(v) {
  if (!Number.isFinite(v)) return "–";
  return v.toFixed(1);
}
function formatSnow(v) {
  if (!Number.isFinite(v)) return "–";
  return String(Math.round(v));
}
function Edit({
  attributes,
  setAttributes
}) {
  /* =============================================================== *\
    		1. Block-Props / Attribute
  \* =============================================================== */
  const {
    dataUrl = "",
    temperatureKey = "Aussentemperatur_Glattalp_C",
    snowKey = "Schneehoehe_Glattalp_cm"
  } = attributes;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)();

  /* =============================================================== *\
    		2. Datei-Auswahl (REST via apiFetch)
  \* =============================================================== */
  const [fileOptions, setFileOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([{
    label: "Lade…",
    value: ""
  }]);
  const [loadingFiles, setLoadingFiles] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    let off = false;
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
      path: "/ud/glattalp/scan-json"
    }).then(data => {
      if (off) return;
      if (Array.isArray(data)) {
        setFileOptions(data.length ? [{
          label: "Bitte auswählen",
          value: ""
        }, ...data] : [{
          label: "Keine JSON-Dateien gefunden",
          value: ""
        }]);
      } else {
        setFileOptions([{
          label: "Fehler beim Laden",
          value: ""
        }]);
      }
    }).catch(() => !off && setFileOptions([{
      label: "Fehler beim Laden",
      value: ""
    }])).finally(() => !off && setLoadingFiles(false));
    return () => {
      off = true;
    };
  }, []);

  /* =============================================================== *\
    		3. JSON laden (Editor-Preview)
  \* =============================================================== */
  const [rows, setRows] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [loadingData, setLoadingData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    let off = false;
    if (!dataUrl) {
      setRows([]);
      return;
    }
    setLoadingData(true);
    fetch(dataUrl).then(r => r.json()).then(json => {
      if (off) return;
      setRows(Array.isArray(json) ? json : []);
    }).catch(() => !off && setRows([])).finally(() => !off && setLoadingData(false));
    return () => {
      off = true;
    };
  }, [dataUrl]);

  /* =============================================================== *\
    		4. Werte berechnen
  \* =============================================================== */
  const computed = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        latestTemp: null,
        latestSnow: null,
        minTodayVal: null,
        minTodayTs: null,
        min30dVal: null,
        min30dTs: null
      };
    }
    const latest = rows[rows.length - 1] || {};
    const latestTemp = typeof latest?.[temperatureKey] !== "undefined" ? Number(latest[temperatureKey]) : null;
    const latestSnow = typeof latest?.[snowKey] !== "undefined" ? Number(latest[snowKey]) : null;
    const latestTs = latest?.time ? Date.parse(latest.time) : NaN;
    const todayYmd = Number.isFinite(latestTs) ? new Date(latestTs).toISOString().slice(0, 10) : null;
    const sinceTs30 = Number.isFinite(latestTs) ? latestTs - 30 * 24 * 60 * 60 * 1000 : null;
    let minTodayVal = null;
    let minTodayTs = null;
    let min30dVal = null;
    let min30dTs = null;
    for (const entry of rows) {
      if (!entry || typeof entry !== "object") continue;
      if (!entry.time) continue;
      if (typeof entry[temperatureKey] === "undefined") continue;
      const ts = Date.parse(entry.time);
      if (!Number.isFinite(ts)) continue;
      const temp = Number(entry[temperatureKey]);
      if (!Number.isFinite(temp)) continue;

      // heute
      if (todayYmd) {
        const ymd = new Date(ts).toISOString().slice(0, 10);
        if (ymd === todayYmd) {
          if (minTodayVal === null || temp < minTodayVal) {
            minTodayVal = temp;
            minTodayTs = ts;
          }
        }
      }

      // letzte 30 Tage
      if (sinceTs30 !== null && Number.isFinite(latestTs)) {
        if (ts >= sinceTs30 && ts <= latestTs) {
          if (min30dVal === null || temp < min30dVal) {
            min30dVal = temp;
            min30dTs = ts;
          }
        }
      }
    }
    return {
      latestTemp,
      latestSnow,
      minTodayVal,
      minTodayTs,
      min30dVal,
      min30dTs
    };
  }, [rows, temperatureKey, snowKey]);

  /* =============================================================== *\
    		5. Render
  \* =============================================================== */
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
        title: "Datei-Auswahl",
        initialOpen: true,
        children: loadingFiles ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {}) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelRow, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            label: "Messdaten-Datei",
            options: fileOptions,
            value: dataUrl,
            onChange: value => setAttributes({
              dataUrl: value
            })
          })
        })
      })
    }), !dataUrl ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
      className: "ud-glattalp-notice ud-glattalp-no-file",
      children: "Bitte eine Messdaten-Datei ausw\xE4hlen."
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
      className: "ud-glattalp-preview",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("section", {
        className: "ud-glattalp-output ud-glattalp-temperature",
        children: [loadingData && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
          className: "ud-glattalp-meta",
          children: "Daten werden geladen\u2026"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
          className: "ud-glattalp-row row_01",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
            className: "ud-glattalp-card",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("h2", {
              className: "ud-glattalp-label",
              children: "Aktuelle Temperatur"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
              className: "ud-glattalp-value-container",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                version: "1.1",
                viewBox: "0 0 288 512",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("path", {
                  d: "M144,48c-35.2999878,0-64,28.6999969-64,64v174.3999939c0,6.1000061-2.3000031,11.8999939-6.3999939,16.3000183-15.9000092,17.0999756-25.6000061,40-25.6000061,65.2999878,0,53,43,96,96,96s96-43,96-96c0-25.2000122-9.7000122-48.1000061-25.6000061-65.2999878-4.1000061-4.4000244-6.3999939-10.3000183-6.3999939-16.3000183V112c0-35.3000031-28.7000122-64-64-64ZM32,112C32,50.0999985,82.1000061,0,144,0s112,50.0999985,112,112v165.5c20,24.7000122,32,56.2000122,32,90.5,0,79.5-64.5,144-144,144S0,447.5,0,368c0-34.2999878,12-65.7999878,32-90.5V112ZM192,368c0,26.5-21.5,48-48,48s-48-21.5-48-48c0-17.7999878,9.7000122-33.2999878,24-41.6000061V112c0-13.3000031,10.7000122-24,24-24s24,10.6999969,24,24v214.3999939c14.2999878,8.3000183,24,23.8000183,24,41.6000061Z"
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("span", {
                className: "ud-glattalp-number",
                children: [formatTemp(computed.latestTemp), "\xB0"]
              })]
            })]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
          className: "ud-glattalp-row row_02",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
            className: "ud-glattalp-card",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("h2", {
              className: "ud-glattalp-label",
              children: "Tiefstwert heute"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
              className: "ud-glattalp-value-container",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("span", {
                className: "ud-glattalp-number",
                children: [formatTemp(computed.minTodayVal), "\xB0"]
              })
            }), computed.minTodayTs && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
              className: "ud-glattalp-meta",
              children: [formatTime(computed.minTodayTs), " Uhr"]
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
            className: "ud-glattalp-card",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("h2", {
              className: "ud-glattalp-label",
              children: "Tiefstwert letzte 30 Tage"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
              className: "ud-glattalp-value-container",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("span", {
                className: "ud-glattalp-number",
                children: [formatTemp(computed.min30dVal), "\xB0"]
              })
            }), computed.min30dTs && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
              className: "ud-glattalp-meta",
              children: [formatDateTime(computed.min30dTs), " Uhr"]
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
            className: "ud-glattalp-card",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("h2", {
              className: "ud-glattalp-label",
              children: "Rekordtiefstwert"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
              className: "ud-glattalp-meta",
              children: "Wird im Frontend aus den gespeicherten Rekord-Daten angezeigt."
            })]
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("section", {
        className: "ud-glattalp-output ud-glattalp-snow",
        style: {
          marginTop: "1rem"
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
          className: "ud-glattalp-row row_01",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
            className: "ud-glattalp-card",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("h2", {
              className: "ud-glattalp-label",
              children: "Aktuelle Schneeh\xF6he"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
              className: "ud-glattalp-value-container",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 72.8 145.6",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("path", {
                  id: "ruler-vertical-regular",
                  d: "M54.6,13.65a4.563,4.563,0,0,1,4.55,4.55v9.1H45.5a4.55,4.55,0,0,0,0,9.1H59.15V54.6H45.5a4.55,4.55,0,0,0,0,9.1H59.15V81.9H45.5a4.55,4.55,0,0,0,0,9.1H59.15v18.2H45.5a4.55,4.55,0,0,0,0,9.1H59.15v9.1a4.563,4.563,0,0,1-4.55,4.55H18.2a4.563,4.563,0,0,1-4.55-4.55V18.2a4.563,4.563,0,0,1,4.55-4.55ZM18.2,0A18.217,18.217,0,0,0,0,18.2V127.4a18.217,18.217,0,0,0,18.2,18.2H54.6a18.217,18.217,0,0,0,18.2-18.2V18.2A18.217,18.217,0,0,0,54.6,0Z",
                  fill: "#004c5b"
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
                className: "ud-glattalp-number",
                children: formatSnow(computed.latestSnow)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
                className: "ud-glattalp-unit",
                children: "cm"
              })]
            })]
          })
        })
      })]
    })]
  });
}

/***/ },

/***/ "./src/js/save.js"
/*!************************!*\
  !*** ./src/js/save.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ save)
/* harmony export */ });
function save() {
  return null;
}

/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "./block.json"
/*!********************!*\
  !*** ./block.json ***!
  \********************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"ud/glattalp-block","title":"Glattalp Block","category":"widgets","icon":"chart-line","description":"Zeigt aktuelle Messwerte und den historischen Tiefstwert der Glattalp an.","editorScript":"file:./build/editor-script.js","editorStyle":"file:./build/editor-style.css","script":"file:./build/frontend-script.js","style":"file:./build/frontend-style.css","attributes":{"dataUrl":{"type":"string","default":"/wp-content/messdaten/data-glattalp.json"},"temperatureKey":{"type":"string","default":"Aussentemperatur_Glattalp_C"},"snowKey":{"type":"string","default":"Schneehoehe_Glattalp_cm"},"temperatureHeading":{"type":"string","default":"Temperatur"},"snowHeading":{"type":"string","default":"Schneehöhe"},"recordHeading":{"type":"string","default":"Tiefstwert"},"showTemperature":{"type":"boolean","default":true},"showSnow":{"type":"boolean","default":true},"showRecord":{"type":"boolean","default":true}},"supports":{"html":false}}');

/***/ }

/******/ 	});
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
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/js/editor.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./edit */ "./src/js/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./save */ "./src/js/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../block.json */ "./block.json");
/**
 * editor.js
 *
 * JavaScript für den Block-Editor (Gutenberg).
 * Wird ausschließlich im Backend geladen.
 *
 * Hinweis:
 * Diese Datei enthält editor-spezifische Interaktionen oder React-Komponenten.
 * Wird über webpack zu editor.js gebündelt und in block.json oder enqueue.php eingebunden.
 */




wp.blocks.registerBlockType(_block_json__WEBPACK_IMPORTED_MODULE_2__.name, {
  ..._block_json__WEBPACK_IMPORTED_MODULE_2__,
  edit: _edit__WEBPACK_IMPORTED_MODULE_0__["default"],
  save: _save__WEBPACK_IMPORTED_MODULE_1__["default"]
});
})();

/******/ })()
;
//# sourceMappingURL=editor-script.js.map