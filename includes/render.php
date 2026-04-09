<?php

/**
 * Server-Side Rendering Callback für den Glattalp-Block
 */

defined('ABSPATH') || exit;



function ud_glattalp_render($attributes, $content, $block) {

    $dataUrl        = $attributes['dataUrl'] ?? '/wp-content/messdaten/data-glattalp.json';
    $temperatureKey = $attributes['temperatureKey'] ?? 'Aussentemperatur_Glattalp_C';

    $wrapper_attributes = get_block_wrapper_attributes();

    $fullPath = ABSPATH . ltrim($dataUrl, '/');
    if (!file_exists($fullPath)) {
        return '<div ' . $wrapper_attributes . '><div class="ud-glattalp-notice">Datei nicht gefunden: ' . esc_html($dataUrl) . '</div></div>';
    }

    $body = file_get_contents($fullPath);
    $data = json_decode($body, true);

    if (!is_array($data) || empty($data)) {
        return '<div ' . $wrapper_attributes . '><div class="ud-glattalp-notice">Keine Daten gefunden.</div></div>';
    }

    $latest = end($data);
    if (!is_array($latest) || !isset($latest['time'])) {
        return '<div ' . $wrapper_attributes . '><div class="ud-glattalp-notice">Keine verwertbaren Daten gefunden.</div></div>';
    }

    // ---- Werte vorbereiten
    $latestTimeStr = (string) $latest['time'];
    $latestTemp    = isset($latest[$temperatureKey]) ? (float) $latest[$temperatureKey] : null;

    $snowKey    = $attributes['snowKey'] ?? 'Schneehoehe_Glattalp_cm';
    $latestSnow = isset($latest[$snowKey]) ? (float) $latest[$snowKey] : null;

    $fmtSnow = function ($v) {
        if ($v === null || !is_finite($v)) return '–';
        return (string) intval(round((float) $v));
    };

    $latestTs = strtotime($latestTimeStr);
    $todayYmd = $latestTs ? date('Y-m-d', $latestTs) : null;

    // Fenster: letzte 30 Tage (relativ zum letzten Datensatz)
    $sinceTs30 = $latestTs ? ($latestTs - (30 * DAY_IN_SECONDS)) : null;

    // Tiefstwerte inkl. Zeitstempel merken
    $minTodayVal = null;
    $minTodayTs  = null;

    $min30dVal = null;
    $min30dTs  = null;

    foreach ($data as $entry) {
        if (!is_array($entry) || !isset($entry['time']) || !isset($entry[$temperatureKey])) {
            continue;
        }

        $ts = strtotime((string) $entry['time']);
        if (!$ts) {
            continue;
        }

        $temp = (float) $entry[$temperatureKey];

        // Tiefstwert heute (bezogen auf Datum des letzten Datensatzes)
        if ($todayYmd && date('Y-m-d', $ts) === $todayYmd) {
            if ($minTodayVal === null || $temp < $minTodayVal) {
                $minTodayVal = $temp;
                $minTodayTs  = $ts;
            }
        }

        // Tiefstwert letzte 30 Tage (wenn weniger Daten vorhanden: Minimum der vorhandenen Daten im Fenster)
        if ($sinceTs30 !== null && $ts >= $sinceTs30 && $ts <= $latestTs) {
            if ($min30dVal === null || $temp < $min30dVal) {
                $min30dVal = $temp;
                $min30dTs  = $ts;
            }
        }
    }

    // Rekord (global gespeichert)
    $recordTemp = (float) get_option('ud_glattalp_record_temp', -52.5);
    $recordDate = (string) get_option('ud_glattalp_record_date', '1991-02-07'); // kann auch schon ISO sein

    // ---- Format-Helfer
    $fmtTemp = function ($v) {
        if ($v === null || !is_finite($v)) return '–';
        return number_format((float) $v, 1, '.', '');
    };

    $fmtTime = function ($ts) {
        if (!$ts) return '';
        return wp_date('H:i', (int) $ts);
    };

    $fmtDateTime = function ($ts) {
        if (!$ts) return '';
        return wp_date('d. F Y, H:i', (int) $ts);
    };

    $fmtRecordDate = function ($dateStr) {
        $ts = strtotime((string) $dateStr);
        if (!$ts) return $dateStr;
        return wp_date('d. F Y', (int) $ts);
    };

    ob_start();
?>
    <div <?php echo $wrapper_attributes; ?>>
        <section class="ud-glattalp-output ud-glattalp-temperature">

            <div class="ud-glattalp-row row_01">
                <div class="ud-glattalp-card">
                    <h2 class="ud-glattalp-label">Aktuelle Temperatur</h2>
                    <div class="ud-glattalp-value-container">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 288 512">
                            <path d="M144,48c-35.2999878,0-64,28.6999969-64,64v174.3999939c0,6.1000061-2.3000031,11.8999939-6.3999939,16.3000183-15.9000092,17.0999756-25.6000061,40-25.6000061,65.2999878,0,53,43,96,96,96s96-43,96-96c0-25.2000122-9.7000122-48.1000061-25.6000061-65.2999878-4.1000061-4.4000244-6.3999939-10.3000183-6.3999939-16.3000183V112c0-35.3000031-28.7000122-64-64-64ZM32,112C32,50.0999985,82.1000061,0,144,0s112,50.0999985,112,112v165.5c20,24.7000122,32,56.2000122,32,90.5,0,79.5-64.5,144-144,144S0,447.5,0,368c0-34.2999878,12-65.7999878,32-90.5V112ZM192,368c0,26.5-21.5,48-48,48s-48-21.5-48-48c0-17.7999878,9.7000122-33.2999878,24-41.6000061V112c0-13.3000031,10.7000122-24,24-24s24,10.6999969,24,24v214.3999939c14.2999878,8.3000183,24,23.8000183,24,41.6000061Z"></path>
                        </svg>
                        <span class="ud-glattalp-number"><?php echo esc_html($fmtTemp($latestTemp)); ?>°</span>
                    </div>
                </div>
            </div>
            <div class="ud-glattalp-row row_02">
                <div class="ud-glattalp-card">
                    <h2 class="ud-glattalp-label">Tiefstwert heute</h2>
                    <div class="ud-glattalp-value-container">

                        <span class="ud-glattalp-number"><?php echo esc_html($fmtTemp($minTodayVal)); ?>°</span>
                    </div>
                    <?php if (!empty($minTodayTs)) : ?>
                        <div class="ud-glattalp-meta"><?php echo esc_html($fmtTime($minTodayTs)) . ' Uhr'; ?></div>
                    <?php endif; ?>
                </div>

                <div class="ud-glattalp-card">
                    <h2 class="ud-glattalp-label">Tiefstwert letzte 30 Tage</h2>
                    <div class="ud-glattalp-value-container">

                        <span class="ud-glattalp-number"><?php echo esc_html($fmtTemp($min30dVal)); ?>°</span>
                    </div>
                    <?php if (!empty($min30dTs)) : ?>
                        <div class="ud-glattalp-meta"><?php echo esc_html($fmtDateTime($min30dTs)); ?> Uhr</div>
                    <?php endif; ?>
                </div>

                <div class="ud-glattalp-card">
                    <h2 class="ud-glattalp-label">Rekordtiefstwert</h2>
                    <div class="ud-glattalp-value-container">

                        <span class="ud-glattalp-number"><?php echo esc_html($fmtTemp($recordTemp)); ?>°</span>
                    </div>
                    <div class="ud-glattalp-meta"><?php echo esc_html($fmtRecordDate($recordDate)); ?></div>
                </div>
            </div>
        </section>
        <section class="ud-glattalp-output ud-glattalp-snow">

            <div class="ud-glattalp-row row_01">
                <div class="ud-glattalp-card">
                    <h2 class="ud-glattalp-label">Aktuelle Schneehöhe</h2>
                    <div class="ud-glattalp-value-container">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72.8 145.6">
                            <path id="ruler-vertical-regular" d="M54.6,13.65a4.563,4.563,0,0,1,4.55,4.55v9.1H45.5a4.55,4.55,0,0,0,0,9.1H59.15V54.6H45.5a4.55,4.55,0,0,0,0,9.1H59.15V81.9H45.5a4.55,4.55,0,0,0,0,9.1H59.15v18.2H45.5a4.55,4.55,0,0,0,0,9.1H59.15v9.1a4.563,4.563,0,0,1-4.55,4.55H18.2a4.563,4.563,0,0,1-4.55-4.55V18.2a4.563,4.563,0,0,1,4.55-4.55ZM18.2,0A18.217,18.217,0,0,0,0,18.2V127.4a18.217,18.217,0,0,0,18.2,18.2H54.6a18.217,18.217,0,0,0,18.2-18.2V18.2A18.217,18.217,0,0,0,54.6,0Z" fill="#004c5b" />
                        </svg>

                        <div class="ud-glattalp-value">
                            <span class="ud-glattalp-number"><?php echo esc_html($fmtSnow($latestSnow)); ?></span>
                            <span class="ud-glattalp-unit">cm</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
<?php
    return ob_get_clean();
}
