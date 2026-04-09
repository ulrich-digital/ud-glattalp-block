import { useEffect, useMemo, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
	PanelBody,
	PanelRow,
	SelectControl,
	Spinner,
} from "@wordpress/components";

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
		year: "numeric",
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

export default function Edit({ attributes, setAttributes }) {
	/* =============================================================== *\
   		1. Block-Props / Attribute
	\* =============================================================== */
	const {
		dataUrl = "",
		temperatureKey = "Aussentemperatur_Glattalp_C",
		snowKey = "Schneehoehe_Glattalp_cm",
	} = attributes;

	const blockProps = useBlockProps();

	/* =============================================================== *\
   		2. Datei-Auswahl (REST via apiFetch)
	\* =============================================================== */
	const [fileOptions, setFileOptions] = useState([
		{ label: "Lade…", value: "" },
	]);
	const [loadingFiles, setLoadingFiles] = useState(true);

	useEffect(() => {
		let off = false;

		apiFetch({ path: "/ud/glattalp/scan-json" })
			.then((data) => {
				if (off) return;

				if (Array.isArray(data)) {
					setFileOptions(
						data.length
							? [{ label: "Bitte auswählen", value: "" }, ...data]
							: [
									{
										label: "Keine JSON-Dateien gefunden",
										value: "",
									},
							  ]
					);
				} else {
					setFileOptions([{ label: "Fehler beim Laden", value: "" }]);
				}
			})
			.catch(
				() =>
					!off &&
					setFileOptions([{ label: "Fehler beim Laden", value: "" }])
			)
			.finally(() => !off && setLoadingFiles(false));

		return () => {
			off = true;
		};
	}, []);

	/* =============================================================== *\
   		3. JSON laden (Editor-Preview)
	\* =============================================================== */
	const [rows, setRows] = useState([]);
	const [loadingData, setLoadingData] = useState(false);

	useEffect(() => {
		let off = false;

		if (!dataUrl) {
			setRows([]);
			return;
		}

		setLoadingData(true);

		fetch(dataUrl)
			.then((r) => r.json())
			.then((json) => {
				if (off) return;
				setRows(Array.isArray(json) ? json : []);
			})
			.catch(() => !off && setRows([]))
			.finally(() => !off && setLoadingData(false));

		return () => {
			off = true;
		};
	}, [dataUrl]);

	/* =============================================================== *\
   		4. Werte berechnen
	\* =============================================================== */
	const computed = useMemo(() => {
		if (!Array.isArray(rows) || rows.length === 0) {
			return {
				latestTemp: null,
				latestSnow: null,
				minTodayVal: null,
				minTodayTs: null,
				min30dVal: null,
				min30dTs: null,
			};
		}

		const latest = rows[rows.length - 1] || {};
		const latestTemp =
			typeof latest?.[temperatureKey] !== "undefined"
				? Number(latest[temperatureKey])
				: null;
		const latestSnow =
			typeof latest?.[snowKey] !== "undefined"
				? Number(latest[snowKey])
				: null;

		const latestTs = latest?.time ? Date.parse(latest.time) : NaN;
		const todayYmd = Number.isFinite(latestTs)
			? new Date(latestTs).toISOString().slice(0, 10)
			: null;
		const sinceTs30 = Number.isFinite(latestTs)
			? latestTs - 30 * 24 * 60 * 60 * 1000
			: null;

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
			min30dTs,
		};
	}, [rows, temperatureKey, snowKey]);

	/* =============================================================== *\
   		5. Render
	\* =============================================================== */
	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title="Datei-Auswahl" initialOpen>
					{loadingFiles ? (
						<Spinner />
					) : (
						<PanelRow>
							<SelectControl
								__next40pxDefaultSize={true}
								__nextHasNoMarginBottom={true}
								label="Messdaten-Datei"
								options={fileOptions}
								value={dataUrl}
								onChange={(value) =>
									setAttributes({ dataUrl: value })
								}
							/>
						</PanelRow>
					)}
				</PanelBody>
			</InspectorControls>

			{!dataUrl ? (
				<div className="ud-glattalp-notice ud-glattalp-no-file">
					Bitte eine Messdaten-Datei auswählen.
				</div>
			) : (
				<div className="ud-glattalp-preview">
					<section className="ud-glattalp-output ud-glattalp-temperature">

						{loadingData && (
							<div className="ud-glattalp-meta">
								Daten werden geladen…
							</div>
						)}

						<div className="ud-glattalp-row row_01">
							<div className="ud-glattalp-card">
								<h2 className="ud-glattalp-label">
									Aktuelle Temperatur
								</h2>
								<div className="ud-glattalp-value-container">
									<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 288 512">
                            			<path d="M144,48c-35.2999878,0-64,28.6999969-64,64v174.3999939c0,6.1000061-2.3000031,11.8999939-6.3999939,16.3000183-15.9000092,17.0999756-25.6000061,40-25.6000061,65.2999878,0,53,43,96,96,96s96-43,96-96c0-25.2000122-9.7000122-48.1000061-25.6000061-65.2999878-4.1000061-4.4000244-6.3999939-10.3000183-6.3999939-16.3000183V112c0-35.3000031-28.7000122-64-64-64ZM32,112C32,50.0999985,82.1000061,0,144,0s112,50.0999985,112,112v165.5c20,24.7000122,32,56.2000122,32,90.5,0,79.5-64.5,144-144,144S0,447.5,0,368c0-34.2999878,12-65.7999878,32-90.5V112ZM192,368c0,26.5-21.5,48-48,48s-48-21.5-48-48c0-17.7999878,9.7000122-33.2999878,24-41.6000061V112c0-13.3000031,10.7000122-24,24-24s24,10.6999969,24,24v214.3999939c14.2999878,8.3000183,24,23.8000183,24,41.6000061Z"></path>
                        			</svg>
									<span className="ud-glattalp-number">
										{formatTemp(computed.latestTemp)}°
									</span>
								</div>
							</div>
						</div>
						<div className="ud-glattalp-row row_02">
							<div className="ud-glattalp-card">
								<h2 className="ud-glattalp-label">
									Tiefstwert heute
								</h2>
								<div className="ud-glattalp-value-container">
									<span className="ud-glattalp-number">
										{formatTemp(computed.minTodayVal)}°
									</span>
								</div>
								{computed.minTodayTs && (
									<div className="ud-glattalp-meta">
										{formatTime(computed.minTodayTs)} Uhr
									</div>
								)}
							</div>

							<div className="ud-glattalp-card">
								<h2 className="ud-glattalp-label">
									Tiefstwert letzte 30 Tage
								</h2>
								<div className="ud-glattalp-value-container">
									<span className="ud-glattalp-number">
										{formatTemp(computed.min30dVal)}°
									</span>
								</div>
								{computed.min30dTs && (
									<div className="ud-glattalp-meta">
										{formatDateTime(computed.min30dTs)} Uhr
									</div>
								)}
							</div>

							<div className="ud-glattalp-card">
								<h2 className="ud-glattalp-label">
									Rekordtiefstwert
								</h2>
								<div className="ud-glattalp-meta">
									Wird im Frontend aus den gespeicherten
									Rekord-Daten angezeigt.
								</div>
							</div>
						</div>
					</section>

					<section
						className="ud-glattalp-output ud-glattalp-snow"
						style={{ marginTop: "1rem" }}
					>

						<div className="ud-glattalp-row row_01">
							<div className="ud-glattalp-card">
								<h2 className="ud-glattalp-label">
									Aktuelle Schneehöhe
								</h2>
								<div className="ud-glattalp-value-container">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72.8 145.6">
                            <path id="ruler-vertical-regular" d="M54.6,13.65a4.563,4.563,0,0,1,4.55,4.55v9.1H45.5a4.55,4.55,0,0,0,0,9.1H59.15V54.6H45.5a4.55,4.55,0,0,0,0,9.1H59.15V81.9H45.5a4.55,4.55,0,0,0,0,9.1H59.15v18.2H45.5a4.55,4.55,0,0,0,0,9.1H59.15v9.1a4.563,4.563,0,0,1-4.55,4.55H18.2a4.563,4.563,0,0,1-4.55-4.55V18.2a4.563,4.563,0,0,1,4.55-4.55ZM18.2,0A18.217,18.217,0,0,0,0,18.2V127.4a18.217,18.217,0,0,0,18.2,18.2H54.6a18.217,18.217,0,0,0,18.2-18.2V18.2A18.217,18.217,0,0,0,54.6,0Z" fill="#004c5b" />
                        </svg>
									<span className="ud-glattalp-number">
										{formatSnow(computed.latestSnow)}
									</span>
									<span className="ud-glattalp-unit">cm</span>
								</div>
							</div>
						</div>
					</section>
				</div>
			)}
		</div>
	);
}
