<?php
defined('ABSPATH') || exit;

add_action('rest_api_init', function () {

	/**
	 * Endpoint: JSON-Dateien im Verzeichnis /wp-content/messdaten/ auflisten
	 * Rückgabeformat passend für SelectControl: [{ label, value }, ...]
	 */
	register_rest_route('ud/glattalp', '/scan-json', [
		'methods'  => 'GET',
		'callback' => function () {

			$dir = WP_CONTENT_DIR . '/messdaten';

			if (!is_dir($dir)) {
				return new WP_REST_Response([], 200);
			}

			$files = glob($dir . '/*.json') ?: [];
			$results = [];

			foreach ($files as $file) {
				$filename = basename($file);

				$results[] = [
					'label' => $filename,
					'value' => '/wp-content/messdaten/' . $filename,
				];
			}

			return new WP_REST_Response($results, 200);
		},
		'permission_callback' => '__return_true',
	]);

});