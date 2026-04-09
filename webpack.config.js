/*
 * Erweiterte Webpack-Konfiguration für WordPress-Plugins.
 * Diese Datei wird nur verwendet, wenn sie in package.json via --config referenziert wird.
 */

const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");

module.exports = {
	...defaultConfig,
	entry: {
		// JavaScript
		"editor-script": path.resolve(__dirname, "src/js/editor.js"),
		"frontend-script": path.resolve(__dirname, "src/js/frontend.js"),

		// SCSS → CSS
		"editor-style": path.resolve(__dirname, "src/css/editor.scss"),
		"frontend-style": path.resolve(__dirname, "src/css/frontend.scss"),
	},
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "[name].js",
	},
};