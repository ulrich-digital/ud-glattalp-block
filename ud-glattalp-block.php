<?php
/**
 * Plugin Name:     UD Block: Glattalp Block
 * Description:     Zeigt Glattalp-Messwerte (Temperatur, Schneehöhe) sowie den Tiefstwert aus einer JSON-Datei an.
 * Version:         1.0.0
 * Author:          ulrich.digital gmbh
 * Author URI:      https://ulrich.digital/
 * License:         GPL v2 or later
 * License URI:     https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:     ud-glattalp-block-ud
 */

defined('ABSPATH') || exit;

// Basis-Konstanten
define('UD_GLATTALP_BLOCK_VERSION', '1.0.0');
define('UD_GLATTALP_BLOCK_FILE', __FILE__);
define('UD_GLATTALP_BLOCK_DIR', plugin_dir_path(__FILE__));
define('UD_GLATTALP_BLOCK_URL', plugin_dir_url(__FILE__));
define('UD_GLATTALP_BLOCK_BASENAME', plugin_basename(__FILE__));

$includes = [
	'includes/helpers.php',
	/*'includes/settings.php',*/
	'includes/render.php',
	'includes/block-register.php',
'includes/rest-api.php',

];

foreach ($includes as $rel) {
	$path = UD_GLATTALP_BLOCK_DIR . $rel;
	if (file_exists($path)) {
		require_once $path;
	}
}

/* =============================================================== *\
   Settings-Link in der Pluginliste hinzufügen
\* =============================================================== */

/*
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
	$settings_url  = admin_url('options-general.php?page=ud_glattalp_settings');
	$settings_link = '<a href="' . esc_url($settings_url) . '">' . __('Einstellungen', 'ud-glattalp-block-ud') . '</a>';
	array_unshift($links, $settings_link);
	return $links;
});
*/