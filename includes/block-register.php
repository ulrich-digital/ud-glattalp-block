<?php
defined('ABSPATH') || exit;

/**
 * Registriert den Block `ud/glattalp-block` über block.json.
 */

function ud_glattalp_register_block() {
	register_block_type(
		__DIR__ . '/../',
		[
			'render_callback' => 'ud_glattalp_render',
		]
	);
}
add_action('init', 'ud_glattalp_register_block');