// ==UserScript==
// @name         Eclesiar Profile Hover Card
// @namespace    https://eclesiar.com/
// @version      1.1.6
// @description  Shows a hover card with player stats when hovering over profile links
// @author       Derailedman
// @homepage     https://eclesiar.com/user/9861
// @supportURL   https://eclesiar.com/user/9861
// @updateURL    https://cdn.nekobot.pl/scripts/Eclesiar_Profile_Hover_Card.user.js
// @downloadURL  https://cdn.nekobot.pl/scripts/Eclesiar_Profile_Hover_Card.user.js
// @match        https://eclesiar.com/*
// @match        https://apollo.eclesiar.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @connect      eclesiar.com
// @connect      apollo.eclesiar.com
// @connect      ecltools.nekobot.pl
// ==/UserScript==

(function () {
    'use strict';

    const VERSION = '1.1.6';

    // ── Battles in-memory cache (session only) ──────────────────────────────
    // key: `${server}_${userId}`, value: battle data array
    const battlesCache = {};

    // Detect server name from hostname: eclesiar.com → 'zeus', apollo.* → 'apollo'
    function getServer() {
        return window.location.hostname.includes('apollo') ? 'apollo' : 'zeus';
    }

    // Fetch battles from ECL-Tools API
    function fetchBattles(userId) {
        const server = getServer();
        const url = `https://ecltools.nekobot.pl/api/${server}/wars/fighter/${userId}/all?limit=25`;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url,
                responseType: 'json',
                onload(r) {
                    if (r.status === 200) {
                        const json = typeof r.response === 'object' ? r.response : JSON.parse(r.responseText);
                        resolve(json.data || []);
                    } else {
                        reject(new Error(`HTTP ${r.status}`));
                    }
                },
                onerror(e) { reject(new Error('Network error')); },
            });
        });
    }


    // ── Perf items: category → [media IDs] — built from server_equipment.csv ──
    const PERF_IDS = {
        MILITAR_DESERT:    [9469,9470,9471,9472,9473,9474,9475,9476,9477,9478,9479,9480,9481,9482,9483,9484,9485,9486,9487,9488,9489,9490,9491,9492,9493,9494,9495,9496,9497,9498],
        MILITAR_FLATLAND:  [9554,9555,9556,9557,9558,9559,9560,9561,9562,9563,9564,9565,9566,9567,9568,9569,9570,9571,9572,9573,9574,9575,9576,9577,9578,9579,9580,9581,9582,9583],
        MILITAR_FOREST:    [9721,9722,9723,9724,9725,9741,9742,9743,9744,9745,9746,9747,9748,9749,9750,9756,9757,9758,9759,9760,9761,9762,9763,9764,9765,9766,9767,9768,9769,9770],
        MILITAR_MOUNTAINS: [9650,9651,9652,9653,9654,9655,9656,9657,9658,9659,9660,9661,9662,9663,9664,9665,9666,9667,9668,9669,9670,9671,9673,9674,9675,9676,9677,9678,9679,9680],
    };
    // Build reverse lookup: media_id (number) → category — done once at startup
    const PERF_MAP = {};
    for (const [cat, ids] of Object.entries(PERF_IDS)) {
        for (const id of ids) PERF_MAP[id] = cat;
    }
    const PERF_COLORS = {
        MILITAR_DESERT:    '#ffd700',
        MILITAR_FLATLAND:  '#ff8c00',
        MILITAR_FOREST:    '#22c55e',
        MILITAR_MOUNTAINS: '#00e5ff',
    };

    // Extract media ID from storage URL: ".../medias/9469.png?v=..." → 9469 (number)
    function getPerfCategory(src) {
        const m = src && src.match(/\/medias\/(\d+)/);
        if (!m) return null;
        return PERF_MAP[+m[1]] || null;
    }

    const CACHE_KEY_PREFIX = 'eclesiar_player_' + window.location.hostname + '_';
    const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week in ms

    // Detect which domain we're running on and use it for all XHR requests
    const BASE_URL = window.location.origin;

    // ─── User settings (stored in GM storage) ────────────────────────────────
    const SETTINGS_KEY = 'ecl_hover_settings';
    const SETTINGS_DEFAULTS = {
        hoverDelay:  300,   // ms before card appears
        hideDelay:   800,   // ms before card disappears after cursor leaves
    };

    function loadSettings() {
        try {
            const raw = GM_getValue(SETTINGS_KEY, null);
            if (!raw) {
                GM_setValue(SETTINGS_KEY, JSON.stringify(SETTINGS_DEFAULTS));
                return Object.assign({}, SETTINGS_DEFAULTS);
            }
            return Object.assign({}, SETTINGS_DEFAULTS, JSON.parse(raw));
        } catch { return Object.assign({}, SETTINGS_DEFAULTS); }
    }

    function saveSettings(obj) {
        GM_setValue(SETTINGS_KEY, JSON.stringify(obj));
    }

    let ECL_SETTINGS = loadSettings();

    // ─── CSS ──────────────────────────────────────────────────────────────────
    GM_addStyle(`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700;900&family=Exo+2:wght@400;500;600;700&display=swap');

        #ecl-hover-card {
            position: fixed;
            z-index: 2147483647;
            width: 440px;
            background: linear-gradient(160deg, #0d1821 0%, #1a2d40 60%, #0d1821 100%);
            border: 1px solid rgba(100, 180, 255, 0.25);
            border-radius: 14px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(100,180,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06);
            font-family: 'Exo 2', sans-serif;
            color: #e0eeff;
            pointer-events: auto;
            display: none;
            overflow: visible;
            transition: opacity 0.18s ease, transform 0.18s ease;
            opacity: 0;
            transform: translateY(6px) scale(0.98);
        }
        #ecl-hover-card.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        /* Header stripe */
        #ecl-hover-card .ecl-card-header {
            background: linear-gradient(90deg, rgba(45,100,160,0.5) 0%, rgba(20,50,90,0.3) 100%);
            border-bottom: 1px solid rgba(100,180,255,0.15);
            border-radius: 14px 14px 0 0;
            padding: 12px 14px 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        }
        #ecl-hover-card .ecl-avatar-wrap {
            position: relative;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-avatar {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            border: 2px solid rgba(100,180,255,0.5);
            object-fit: cover;
            box-shadow: 0 0 12px rgba(100,180,255,0.3);
        }
        #ecl-hover-card .ecl-avatar-border {
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            pointer-events: none;
        }
        #ecl-hover-card .ecl-online-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid #0d1821;
            background: #4caf50;
            box-shadow: 0 0 6px #4caf50;
        }
        #ecl-hover-card .ecl-online-dot.offline {
            background: #666;
            box-shadow: none;
        }
        #ecl-hover-card .ecl-online-dot.offline-stale {
            background: #ffd040;
            box-shadow: 0 0 5px rgba(255,208,64,0.6);
        }
        #ecl-hover-card .ecl-online-dot.offline-old {
            background: #e04040;
            box-shadow: 0 0 5px rgba(224,64,64,0.5);
        }
        #ecl-hover-card .ecl-header-info {
            flex: 1;
            min-width: 0;
        }
        /* Nick + level on same row */
        #ecl-hover-card .ecl-name-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            flex-wrap: nowrap;
            overflow: hidden;
        }
        #ecl-hover-card a:hover .ecl-name { text-decoration: underline; }
        #ecl-hover-card .ecl-name {
            font-family: 'Rajdhani', sans-serif;
            font-size: 17px;
            font-weight: 900;
            color: #fff;
            letter-spacing: 0.5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        #ecl-hover-card .ecl-level-badge {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            background: rgba(255,200,60,0.12);
            border: 1px solid rgba(255,200,60,0.3);
            border-radius: 20px;
            padding: 1px 7px;
            font-size: 10px;
            font-weight: 700;
            color: #ffd561;
            white-space: nowrap;
            flex-shrink: 0;
            letter-spacing: 0.3px;
        }
        /* Country + region on one line */
        #ecl-hover-card .ecl-geo-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 3px;
            font-size: 10px;
            color: rgba(180,210,255,0.7);
            flex-wrap: nowrap;
            overflow: hidden;
        }
        #ecl-hover-card .ecl-geo-sep {
            color: rgba(255,255,255,0.2);
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-location-row {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-location-row img {
            width: 16px;
            height: 11px;
            object-fit: cover;
            border-radius: 2px;
        }
        #ecl-hover-card a:has(.ecl-location-row):hover .ecl-location-row span {
            text-decoration: underline;
            color: #7ec8ff;
        }

        /* Refresh button */
        #ecl-hover-card .ecl-header-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: auto;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-refresh-btn {
            background: rgba(100,180,255,0.1);
            border: 1px solid rgba(100,180,255,0.25);
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: rgba(180,220,255,0.8);
            font-size: 13px;
            padding: 0;
        }
        #ecl-hover-card .ecl-refresh-btn svg {
            width: 14px;
            height: 14px;
            display: block;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-refresh-btn:hover {
            background: rgba(100,180,255,0.2);
            border-color: rgba(100,180,255,0.5);
            color: #fff;
            transform: rotate(30deg);
        }
        #ecl-hover-card .ecl-refresh-btn.spinning {
            animation: eclSpin 0.8s linear infinite;
        }
        @keyframes eclSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes eclRingDrain {
            from { stroke-dashoffset: 0; }
            to   { stroke-dashoffset: var(--ring-circumference); }
        }

        /* ── Hide countdown ring in card header ── */
        #ecl-hover-card .ecl-hide-ring {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            opacity: 0;
            transition: opacity 0.15s;
            transform: rotate(-90deg);
            cursor: default;
        }
        #ecl-hover-card .ecl-hide-ring.visible { opacity: 1; }
        #ecl-hover-card .ecl-hide-ring circle.bg {
            fill: none;
            stroke: rgba(100,180,255,0.12);
            stroke-width: 2.5;
        }
        #ecl-hover-card .ecl-hide-ring circle.fg {
            fill: none;
            stroke: rgba(100,180,255,0.55);
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-dasharray: var(--ring-circumference);
            stroke-dashoffset: 0;
        }
        #ecl-hover-card .ecl-hide-ring.animating circle.fg {
            animation: eclRingDrain var(--ring-duration) linear forwards;
        }

        /* ── Settings panel on /user/settings ── */
        #ecl-settings-panel {
            margin-top: 16px;
        }
        #ecl-settings-panel .ecl-settings-title {
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #ecl-settings-panel .ecl-settings-title span {
            font-size: 11px;
            font-weight: 400;
            color: #888;
        }
        #ecl-settings-panel .ecl-settings-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        #ecl-settings-panel .ecl-settings-table td {
            padding: 4px 6px 4px 0;
            vertical-align: middle;
            font-size: 13px;
        }
        #ecl-settings-panel .ecl-settings-table td:first-child {
            white-space: nowrap;
            padding-right: 12px;
        }
        #ecl-settings-panel .ecl-settings-table td:nth-child(2) {
            width: 100%;
        }
        #ecl-settings-panel .ecl-settings-table input[type=range] {
            width: 100%;
            display: block;
        }
        #ecl-settings-panel .ecl-settings-table td:last-child {
            white-space: nowrap;
            text-align: right;
            padding-left: 10px;
            width: 80px;
            min-width: 80px;
            font-weight: 600;
            font-size: 13px;
            color: #0d6efd;
        }

        /* Body */
        /* ── Tabs ── */
        #ecl-hover-card .ecl-tabs {
            display: flex;
            gap: 0;
            border-bottom: 1px solid rgba(100,180,255,0.12);
            background: rgba(0,0,0,0.2);
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-tab {
            flex: 1;
            padding: 7px 0;
            font-size: 10px;
            font-weight: 700;
            font-family: 'Rajdhani', sans-serif;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: rgba(160,200,255,0.45);
            background: none;
            border: none;
            cursor: pointer;
            transition: color 0.15s, border-bottom 0.15s;
            border-bottom: 2px solid transparent;
            margin-bottom: -1px;
        }
        #ecl-hover-card .ecl-tab:hover {
            color: rgba(160,200,255,0.8);
        }
        #ecl-hover-card .ecl-tab.active {
            color: #7ec8ff;
            border-bottom: 2px solid #7ec8ff;
        }
        #ecl-hover-card .ecl-tab-panel {
            display: none;
        }
        #ecl-hover-card .ecl-tab-panel.active {
            display: block;
        }

        #ecl-hover-card .ecl-card-body {
            padding: 10px 14px 14px;
        }

        /* Section divider */
        #ecl-hover-card .ecl-section-label {
            font-family: 'Rajdhani', sans-serif;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: rgba(100,180,255,0.5);
            margin: 8px 0 5px;
            padding-bottom: 3px;
            border-bottom: 1px solid rgba(100,180,255,0.08);
        }

        /* Stat rows (org section) */
        #ecl-hover-card .ecl-org-row {
            display: flex;
            gap: 6px;
            align-items: stretch;
            margin-top: 2px;
        }
        #ecl-hover-card .ecl-stat-row {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 6px;
            flex: 1;
            background: rgba(10,22,36,0.4);
            border: 1px solid rgba(100,180,255,0.07);
            border-radius: 5px;
            min-width: 0;
        }
        #ecl-hover-card .ecl-stat-row img {
            width: 22px;
            height: 22px;
            object-fit: contain;
            border-radius: 3px;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-stat-label {
            font-size: 10px;
            color: rgba(160,200,255,0.6);
            line-height: 1.1;
        }
        #ecl-hover-card .ecl-stat-value {
            font-size: 13px;
            font-weight: 600;
            color: #e8f4ff;
            line-height: 1.2;
        }
        #ecl-hover-card .ecl-stat-row a {
            color: inherit;
            text-decoration: none;
        }
        #ecl-hover-card .ecl-stat-row a:hover .ecl-stat-value {
            color: #7ec8ff;
            text-decoration: underline;
        }

        /* ── Citizen 2-col layout ── */
        #ecl-hover-card .ecl-citizen-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 6px;
            margin-top: 2px;
        }
        #ecl-hover-card .ecl-citizen-col {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        /* ── Stats grid (2-col cards like the screenshot) ── */
        #ecl-hover-card .ecl-stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
            margin-top: 2px;
        }
        #ecl-hover-card .ecl-stats-grid.single-col {
            grid-template-columns: 1fr;
        }
        #ecl-hover-card .ecl-sg-cell {
            background: rgba(10,22,36,0.7);
            border: 1px solid rgba(100,180,255,0.1);
            border-radius: 6px;
            padding: 5px 8px;
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
        }
        #ecl-hover-card .ecl-sg-icon {
            font-size: 13px;
            flex-shrink: 0;
            width: 16px;
            text-align: center;
            opacity: 0.85;
        }
        #ecl-hover-card .ecl-sg-inner {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 4px;
            overflow: hidden;
        }
        #ecl-hover-card .ecl-sg-label {
            font-size: 9.5px;
            color: rgba(160,200,255,0.55);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-shrink: 1;
            min-width: 0;
        }
        #ecl-hover-card .ecl-sg-value {
            font-size: 12px;
            font-weight: 700;
            color: #e8f4ff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: 'Rajdhani', sans-serif;
            letter-spacing: 0.3px;
            flex-shrink: 1;
            min-width: 0;
            max-width: 60%;
        }
        #ecl-hover-card .ecl-sg-value.positive { color: #6ee686; }
        #ecl-hover-card .ecl-sg-value.zero     { color: rgba(160,200,255,0.35); }
        #ecl-hover-card .ecl-sg-img {
            width: 20px;
            height: 20px;
            object-fit: contain;
            border-radius: 3px;
            flex-shrink: 0;
        }

        /* Equipment grid */
        #ecl-hover-card .ecl-equip-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 5px;
            margin-top: 4px;
        }
        #ecl-hover-card .ecl-equip-slot {
            position: relative;
            background: rgba(20,45,70,0.6);
            border: 1px solid rgba(100,180,255,0.15);
            border-radius: 6px;
            aspect-ratio: 1;
            overflow: visible;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #ecl-hover-card .ecl-equip-slot img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 5px;
        }
        /* Q1 - grey */
        #ecl-hover-card .ecl-equip-slot.q1 {
            border-color: rgba(160,160,160,0.5);
            background: rgba(160,160,160,0.08);
            box-shadow: inset 0 0 6px rgba(160,160,160,0.08);
        }
        /* Q2 - green */
        #ecl-hover-card .ecl-equip-slot.q2 {
            border-color: rgba(60,200,80,0.55);
            background: rgba(60,200,80,0.08);
            box-shadow: inset 0 0 6px rgba(60,200,80,0.1);
        }
        /* Q3 - blue */
        #ecl-hover-card .ecl-equip-slot.q3 {
            border-color: rgba(60,140,255,0.6);
            background: rgba(60,140,255,0.1);
            box-shadow: inset 0 0 8px rgba(60,140,255,0.12);
        }
        /* Q4 - purple-pink */
        #ecl-hover-card .ecl-equip-slot.q4 {
            border-color: rgba(190,80,220,0.65);
            background: rgba(190,80,220,0.1);
            box-shadow: inset 0 0 8px rgba(190,80,220,0.15);
        }
        /* Q5 - golden yellow */
        #ecl-hover-card .ecl-equip-slot.q5 {
            border-color: rgba(255,200,30,0.7);
            background: rgba(255,200,30,0.1);
            box-shadow: inset 0 0 10px rgba(255,200,30,0.18), 0 0 4px rgba(255,200,30,0.15);
        }
        /* Q6 - blood red */
        #ecl-hover-card .ecl-equip-slot.q6 {
            border-color: rgba(210,30,30,0.75);
            background: rgba(210,30,30,0.12);
            box-shadow: inset 0 0 10px rgba(210,30,30,0.2), 0 0 5px rgba(210,30,30,0.2);
        }
        /* Q badge inside slot */
        #ecl-hover-card .ecl-equip-q-badge {
            position: absolute;
            bottom: 1px;
            right: 2px;
            font-size: 8px;
            font-weight: 800;
            font-family: 'Rajdhani', sans-serif;
            line-height: 1;
            pointer-events: none;
            text-shadow: 0 1px 3px rgba(0,0,0,0.9);
            letter-spacing: 0;
        }
        #ecl-hover-card .ecl-equip-slot.q1 .ecl-equip-q-badge { color: #b0b0b0; }
        #ecl-hover-card .ecl-equip-slot.q2 .ecl-equip-q-badge { color: #4eca58; }
        #ecl-hover-card .ecl-equip-slot.q3 .ecl-equip-q-badge { color: #5aabff; }
        #ecl-hover-card .ecl-equip-slot.q4 .ecl-equip-q-badge { color: #df65f0; }
        #ecl-hover-card .ecl-equip-slot.q5 .ecl-equip-q-badge { color: #ffd530; }
        #ecl-hover-card .ecl-equip-slot.q6 .ecl-equip-q-badge { color: #f03030; }

        /* Perf item — simple dashed border */
        #ecl-hover-card .ecl-equip-slot.perf {
            overflow: visible;
            border: 2px dashed var(--perf-color, #fff) !important;
            box-shadow: 0 0 6px var(--perf-color, #fff);
        }

        /* EQ Bonuses section */
        #ecl-hover-card .ecl-eq-bonus-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px;
            margin-top: 2px;
            max-height: calc(4 * (24px + 2px));
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: thin;
            scrollbar-color: rgba(100,180,255,0.2) transparent;
        }
        #ecl-hover-card .ecl-eq-bonus-grid::-webkit-scrollbar {
            width: 4px;
        }
        #ecl-hover-card .ecl-eq-bonus-grid::-webkit-scrollbar-track {
            background: transparent;
        }
        #ecl-hover-card .ecl-eq-bonus-grid::-webkit-scrollbar-thumb {
            background: rgba(100,180,255,0.2);
            border-radius: 2px;
        }
        #ecl-hover-card .ecl-eq-bonus-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 6px;
            background: rgba(10,22,36,0.5);
            border: 1px solid rgba(100,180,255,0.07);
            border-radius: 4px;
            font-size: 9px;
            gap: 6px;
        }
        #ecl-hover-card .ecl-eq-bonus-name {
            color: rgba(160,200,255,0.55);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }
        #ecl-hover-card .ecl-eq-bonus-val {
            font-weight: 700;
            font-family: 'Rajdhani', sans-serif;
            font-size: 10px;
            white-space: nowrap;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-eq-bonus-val.pos { color: #6ee686; }
        #ecl-hover-card .ecl-eq-bonus-val.neg { color: #e06060; }

        /* Tooltip for equipment */
        #ecl-hover-card .ecl-equip-tooltip {
            display: none;
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: #0a1520;
            border: 1px solid rgba(100,180,255,0.3);
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 11px;
            color: #cce8ff;
            white-space: nowrap;
            z-index: 9999;
            pointer-events: none;
            box-shadow: 0 8px 24px rgba(0,0,0,0.7);
            min-width: 120px;
        }
        #ecl-hover-card .ecl-equip-tooltip .good-bonus {
            color: #6ee686;
            font-weight: 700;
        }
        #ecl-hover-card .ecl-equip-tooltip p {
            margin: 2px 0;
        }
        #ecl-hover-card .ecl-equip-slot:hover .ecl-equip-tooltip {
            display: block;
        }

        /* Loading state */
        #ecl-hover-card .ecl-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            gap: 12px;
        }
        #ecl-hover-card .ecl-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(100,180,255,0.2);
            border-top-color: rgba(100,180,255,0.8);
            border-radius: 50%;
            animation: eclSpin 0.7s linear infinite;
        }
        #ecl-hover-card .ecl-loading-text {
            font-size: 12px;
            color: rgba(160,200,255,0.5);
            font-family: 'Rajdhani', sans-serif;
            letter-spacing: 1px;
        }

        /* Error state */
        #ecl-hover-card .ecl-error {
            padding: 20px;
            text-align: center;
            color: rgba(255,120,120,0.8);
            font-size: 12px;
        }

        /* Cache timestamp */
        /* ── Battles tab ── */
        #ecl-hover-card .ecl-battles-powered {
            display: block;
            text-align: center;
            font-size: 8.5px;
            color: rgba(120,180,255,0.4);
            letter-spacing: 0.8px;
            text-transform: uppercase;
            text-decoration: none;
            padding: 5px 0 6px;
            transition: color 0.15s;
        }
        #ecl-hover-card .ecl-battles-powered:hover { color: rgba(120,180,255,0.9); text-decoration: underline; }
        #ecl-hover-card .ecl-battles-powered span { color: #7ec8ff; }
        #ecl-hover-card .ecl-battles-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
            table-layout: fixed;
        }
        #ecl-hover-card .ecl-battles-table colgroup .col-att   { width: 100px; }
        #ecl-hover-card .ecl-battles-table colgroup .col-vs    { width: 26px; }
        #ecl-hover-card .ecl-battles-table colgroup .col-def   { width: 100px; }
        #ecl-hover-card .ecl-battles-table colgroup .col-badge { width: 38px; }
        #ecl-hover-card .ecl-battles-table colgroup .col-date  { width: 44px; }
        #ecl-hover-card .ecl-battles-table colgroup .col-dmg   { width: 40px; }
        #ecl-hover-card .ecl-battles-table colgroup .col-link  { width: 40px; }
        #ecl-hover-card .ecl-battles-table th {
            font-size: 8px;
            font-weight: 700;
            font-family: 'Rajdhani', sans-serif;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            color: rgba(100,180,255,0.45);
            padding: 3px 3px;
            border-bottom: 1px solid rgba(100,180,255,0.1);
            white-space: nowrap;
        }
        #ecl-hover-card .ecl-battles-table td {
            padding: 4px 3px;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            color: rgba(220,235,255,0.85);
            vertical-align: middle;
            overflow: hidden;
        }
        #ecl-hover-card .ecl-battles-table tr:last-child td { border-bottom: none; }
        #ecl-hover-card .ecl-battles-table tr:hover td { background: rgba(100,180,255,0.04); }
        /* Attacker cell — flag + name, right-aligned */
        #ecl-hover-card .ecl-battles-side {
            display: flex;
            align-items: center;
            gap: 3px;
            overflow: hidden;
        }
        #ecl-hover-card .ecl-battles-side.att {
            justify-content: flex-start;
            flex-direction: row;
        }
        #ecl-hover-card .ecl-battles-side.def {
            justify-content: flex-start;
        }
        #ecl-hover-card .ecl-battles-side span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 8.5px;
        }
        /* VS center column */
        #ecl-hover-card .ecl-battles-vs {
            text-align: center;
            padding: 0 4px;
            font-size: 8px;
            color: rgba(255,255,255,0.25);
            font-weight: 700;
            white-space: nowrap;
        }
        /* badge column — badges sit here */
        #ecl-hover-card .ecl-battles-badge-cell {
            text-align: left;
        }
        #ecl-hover-card .ecl-battles-flag {
            width: 16px;
            height: 11px;
            object-fit: cover;
            border-radius: 1px;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-battles-date {
            font-size: 8px;
            color: rgba(160,200,255,0.45);
            white-space: nowrap;
            text-align: center;
        }
        #ecl-hover-card .ecl-battles-closed { opacity: 0.45; }
        #ecl-hover-card .ecl-battles-dmg {
            color: #6ee686;
            font-weight: 700;
            font-family: 'Rajdhani', sans-serif;
            font-size: 10px;
            text-align: right;
            white-space: nowrap;
        }
        #ecl-hover-card .ecl-battles-link {
            font-size: 8px;
            color: rgba(100,180,255,0.55);
            text-decoration: none;
            white-space: nowrap;
            border: 1px solid rgba(100,180,255,0.2);
            border-radius: 3px;
            padding: 2px 5px;
            transition: all 0.15s;
            display: inline-block;
            text-align: center;
            box-sizing: border-box;
            width: 100%;
        }
        #ecl-hover-card .ecl-battles-link:hover { color: #7ec8ff; border-color: rgba(100,180,255,0.6); }
        #ecl-hover-card .ecl-battles-rev {
            font-size: 7px;
            background: rgba(255,160,40,0.15);
            color: rgba(255,160,40,0.85);
            border-radius: 3px;
            padding: 0 3px;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-battles-gold {
            font-size: 7px;
            background: rgba(255,215,0,0.15);
            color: #ffd700;
            border-radius: 3px;
            padding: 0 3px;
            flex-shrink: 0;
        }
        #ecl-hover-card .ecl-battles-loading {
            text-align: center;
            padding: 18px 0;
            font-size: 11px;
            color: rgba(160,200,255,0.4);
        }
        /* Pagination */
        #ecl-hover-card .ecl-battles-pager {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 0 2px;
        }
        #ecl-hover-card .ecl-battles-pager button {
            background: rgba(100,180,255,0.08);
            border: 1px solid rgba(100,180,255,0.2);
            border-radius: 4px;
            color: rgba(160,200,255,0.7);
            font-size: 10px;
            padding: 2px 8px;
            cursor: pointer;
            transition: all 0.15s;
        }
        #ecl-hover-card .ecl-battles-pager button:hover:not(:disabled) { background: rgba(100,180,255,0.18); color: #7ec8ff; }
        #ecl-hover-card .ecl-battles-pager button:disabled { opacity: 0.3; cursor: default; }
        #ecl-hover-card .ecl-battles-pager span {
            font-size: 9px;
            color: rgba(160,200,255,0.45);
            font-family: 'Rajdhani', sans-serif;
        }

        #ecl-hover-card .ecl-cache-info {
            padding: 6px 14px;
            font-size: 9px;
            color: rgba(100,150,200,0.35);
            text-align: right;
            border-top: 1px solid rgba(100,180,255,0.06);
        }
        #ecl-hover-card .ecl-cache-info.stale {
            color: rgba(255,160,40,0.7);
            border-top-color: rgba(255,160,40,0.15);
        }
        #ecl-hover-card .ecl-cache-info.stale::before {
            content: '⚠ ';
        }
    `);

    // ─── Card Element ─────────────────────────────────────────────────────────
    const card = document.createElement('div');
    card.id = 'ecl-hover-card';
    document.body.appendChild(card);

    let hideTimeout   = null;
    let showTimeout   = null;
    let currentUserId = null;
    let currentAnchor = null;

    // ── Hide countdown ring — lives inside card header ────────────────────────
    const RING_R    = 11;
    const RING_CIRC = +(2 * Math.PI * RING_R).toFixed(2);

    function getHideRing() {
        return card.querySelector('.ecl-hide-ring');
    }

    function startHideRing(duration) {
        const el = getHideRing();
        if (!el) return;
        el.style.setProperty('--ring-circumference', RING_CIRC);
        el.style.setProperty('--ring-duration', duration + 'ms');
        el.classList.remove('animating');
        void el.offsetWidth; // reflow
        el.classList.add('visible', 'animating');
    }

    function stopHideRing() {
        const el = getHideRing();
        if (!el) return;
        el.classList.remove('visible', 'animating');
    }

    // showRing / hideRing are no-ops now (hover delay has no separate ring)
    function showRing() {}
    function hideRing() {}

    function showCard(anchor, userId) {
        clearTimeout(hideTimeout);
        const cardVisible = card.classList.contains('visible');
        const delay = cardVisible ? 0 : ECL_SETTINGS.hoverDelay;

        if (delay === 0) {
            // Card already open — switch instantly
            clearTimeout(showTimeout);
            hideRing();
            _openCard(anchor, userId);
        } else {
            showRing(delay);
            showTimeout = setTimeout(() => {
                hideRing();
                _openCard(anchor, userId);
            }, delay);
        }
    }

    function _openCard(anchor, userId) {
        currentUserId = userId;
        currentAnchor = anchor;
        card.style.display = 'block';
        card.style.visibility = 'hidden';
        requestAnimationFrame(() => {
            positionCard(anchor);
            card.style.visibility = '';
            card.classList.add('visible');
        });
        renderCard(userId, false);
    }

    function hideCard() {
        clearTimeout(showTimeout);
        startHideRing(ECL_SETTINGS.hideDelay);
        hideTimeout = setTimeout(() => {
            stopHideRing();
            card.classList.remove('visible');
            setTimeout(() => {
                if (!card.classList.contains('visible')) {
                    card.style.display = 'none';
                    currentUserId = null;
                }
            }, 200);
        }, ECL_SETTINGS.hideDelay);
    }

    function positionCard(anchor) {
        const rect  = anchor.getBoundingClientRect();
        // Use real rendered height if available, else conservative estimate
        const cardW = card.offsetWidth  || 440;
        const cardH = card.offsetHeight || 300;
        const vw    = window.innerWidth;
        const vh    = window.innerHeight;
        const GAP   = 12;
        const EDGE  = 10;

        // Determine horizontal side: prefer right, fallback left
        let left;
        if (rect.right + GAP + cardW <= vw - EDGE) {
            left = rect.right + GAP;
        } else if (rect.left - GAP - cardW >= EDGE) {
            left = rect.left - GAP - cardW;
        } else {
            left = Math.max(EDGE, Math.round((vw - cardW) / 2));
        }

        // Vertical: align card top to anchor top, then clamp into viewport
        let top = rect.top;
        if (top + cardH > vh - EDGE) top = vh - EDGE - cardH;
        if (top < EDGE)              top = EDGE;

        // Horizontal clamp
        if (left + cardW > vw - EDGE) left = vw - EDGE - cardW;
        if (left < EDGE)              left = EDGE;

        card.style.left = left + 'px';
        card.style.top  = top  + 'px';
    }

    card.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        clearTimeout(showTimeout);
        stopHideRing();
    });
    card.addEventListener('mouseleave', hideCard);

    // ─── Cache helpers ────────────────────────────────────────────────────────
    function getCached(userId) {
        try {
            const raw = GM_getValue(CACHE_KEY_PREFIX + userId, null);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (Date.now() - obj.timestamp > CACHE_TTL) return null;
            return obj;
        } catch { return null; }
    }

    function setCache(userId, data) {
        try {
            GM_setValue(CACHE_KEY_PREFIX + userId, JSON.stringify({
                timestamp: Date.now(),
                data
            }));
        } catch (e) {
            console.warn('[ECL] GM_setValue failed:', e);
        }
    }

    // ─── Fetch profile ────────────────────────────────────────────────────────
    function fetchProfile(userId) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `${BASE_URL}/user/${userId}`,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                onload(res) {
                    if (res.status !== 200) return reject(new Error('HTTP ' + res.status));
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(res.responseText, 'text/html');
                        resolve(parseProfile(doc, userId));
                    } catch (e) { reject(e); }
                },
                onerror(err) { reject(err); }
            });
        });
    }

    function parseProfile(doc, userId) {
        const data = { userId };

        // Avatar
        const avatarEl = doc.querySelector('.new-avatar-upload, .profile-container .avatar');
        data.avatarSrc = avatarEl ? avatarEl.getAttribute('src') : '';

        // Avatar border
        const borderEl = doc.querySelector('.avatar-border');
        data.avatarBorderSrc = borderEl ? (borderEl.style.backgroundImage || '').replace(/url\(['"]?|['"]?\)/g, '') : '';

        // Nickname
        const nickEl = doc.querySelector('.nickname-text');
        data.nickname = nickEl ? nickEl.textContent.trim() : '';

        // Level
        const levelEl = doc.querySelector('.level-display');
        data.level = levelEl ? levelEl.textContent.trim() : '';

        // Online status — check both .online-tag and .offline-tag inside .c-tooltip wrapper
        const onlineTagEl  = doc.querySelector('.online-tag');
        const offlineTagEl = doc.querySelector('.offline-tag');
        data.isOnline   = !!onlineTagEl && !offlineTagEl;
        data.lastSeen   = null; // null = online or unknown

        if (offlineTagEl) {
            // Tooltip sibling contains "Last seen: X" text
            const tooltipEl = offlineTagEl.closest('.c-tooltip');
            if (tooltipEl) {
                const tip = tooltipEl.querySelector('.tooltip-content p');
                if (tip) {
                    const raw = tip.textContent.trim();
                    // raw examples: "Last seen: 1 hours ago" / "Last seen: 05-02-2026"
                    const match = raw.match(/:\s*(.+)$/);
                    if (match) data.lastSeen = match[1].trim();
                }
            }
        }

        // Nationality flag + name
        // Nationality — first <a class="link-nationality"> (has /country/ href)
        const natLinkEl = doc.querySelector('a.link-nationality[href^="/country/"]');
        if (natLinkEl) {
            const natImg = natLinkEl.querySelector('img');
            data.nationalityFlag = natImg ? natImg.getAttribute('src') : '';
            data.nationalityName = natImg ? natImg.getAttribute('alt') : '';
            data.nationalityHref = natLinkEl.getAttribute('href') || '';
        } else {
            data.nationalityFlag = '';
            data.nationalityName = '';
            data.nationalityHref = '';
        }

        // Current Location — <a class="link-nationality"> with /region/ href
        // Contains: region name in <span> + flag of the country that owns that region
        const locLinkEl = doc.querySelector('a.link-nationality[href^="/region/"]');
        if (locLinkEl) {
            const locSpan = locLinkEl.querySelector('span');
            const locImg  = locLinkEl.querySelector('img');
            data.location        = locSpan ? locSpan.textContent.trim() : '';
            data.locationFlag    = locImg  ? locImg.getAttribute('src') : '';
            data.locationCountry = locImg  ? locImg.getAttribute('alt') : '';
            data.locationHref    = locLinkEl.getAttribute('href') || '';
        } else {
            data.location        = '';
            data.locationFlag    = '';
            data.locationCountry = '';
            data.locationHref    = '';
        }

        // Parse all .player-statistics-item blocks by their image src
        // Structure from HTML:
        //   item[0]: military rank img (storage URL) + rank <p> + damage.png + damage <p>
        //   item[1]: builder rank img (storage URL) + builder rank <p> + builder.png + progress <p>
        //   item[2]: strength.png + strength <p>
        //   item[3]: economy.png + economic level <p>
        const allStatItems = doc.querySelectorAll('.player-statistics-item');
        allStatItems.forEach(item => {
            const imgs = Array.from(item.querySelectorAll('img'));
            const srcs = imgs.map(i => i.getAttribute('src') || '');

            if (srcs.some(s => s.includes('strength'))) {
                const p = item.querySelector('p');
                data.strength = p ? p.textContent.trim() : '';
            }
            if (srcs.some(s => s.includes('economy'))) {
                const p = item.querySelector('p');
                data.economicLevel = p ? p.textContent.trim() : '';
            }
            if (srcs.some(s => s.includes('damage.png'))) {
                const dmgP = item.querySelector('p[style*="font-size"]') || item.querySelector('.d-flex p');
                data.totalDamage = dmgP ? dmgP.textContent.trim() : '';
            }
            if (srcs.some(s => s.includes('builder.png'))) {
                const bldP = item.querySelector('p[style*="font-size"]') || item.querySelector('.d-flex p');
                data.builderProgress = bldP ? bldP.textContent.trim() : '';
            }
        });

        // Military rank — first .player-statistics-item, grab rank image (storage) + first <p>
        const milRankArea = allStatItems[0];
        if (milRankArea) {
            // rank image is the first img (the tall rank badge from storage)
            const rankImg = milRankArea.querySelector('.image-placeholder img');
            data.militaryRankImg = rankImg ? rankImg.getAttribute('src') : '';
            const rankP = milRankArea.querySelector('p');
            data.militaryRank = rankP ? rankP.textContent.trim() : '';
        }

        // Builder rank — second .player-statistics-item
        const builderRankArea = allStatItems[1];
        if (builderRankArea) {
            const bRankImg = builderRankArea.querySelector('.image-placeholder img');
            data.builderRankImg = bRankImg ? bRankImg.getAttribute('src') : '';
            const bRankP = builderRankArea.querySelector('p');
            data.builderRank = bRankP ? bRankP.textContent.trim() : '';
        }

        // Military unit
        const muLink = doc.querySelector('a[href^="/militaryunit/"]');
        if (muLink) {
            data.militaryUnitHref = muLink.getAttribute('href');
            const muImg = muLink.querySelector('img');
            data.militaryUnitImg = muImg ? muImg.getAttribute('src') : '';
            const muName = muLink.querySelector('p');
            data.militaryUnitName = muName ? muName.textContent.trim() : '';
        }

        // Party
        const partyLink = doc.querySelector('a[href^="/party/"]');
        if (partyLink) {
            data.partyHref = partyLink.getAttribute('href');
            const pImg = partyLink.querySelector('img');
            data.partyImg = pImg ? pImg.getAttribute('src') : '';
            const pName = partyLink.querySelector('p');
            data.partyName = pName ? pName.textContent.trim() : '';
        }

        // Stats from .player-stats-card
        // Strategy: try known span classes first (most reliable, language-agnostic),
        // then scan every <p> and grab its last <span> as the value — order in the DOM
        // matches the visual order shown in the screenshot.
        const statsCard = doc.querySelector('.player-stats-card');
        data.stats = {};
        if (statsCard) {
            // Known class map (generated by the game engine, stable across languages)
            const classMap = [
                ['base-damage-input',     'baseDamage'],
                ['bonus-damage-input',    'bonusDamage'],
                ['critical-chance-input', 'critChance'],
                ['critical-hit-input',    'critHit'],
                ['accuracy-input',        'accuracy'],
                ['drop-chance-input',     'dropChance'],
                ['flatland-input',        'flatLand'],
                ['flat-land-input',       'flatLand'],
                ['mountains-input',       'mountains'],
                ['forest-input',          'forest'],
                ['desert-input',          'desert'],
            ];
            classMap.forEach(([cls, key]) => {
                const el = statsCard.querySelector('.' + cls);
                if (el && !data.stats[key]) data.stats[key] = el.textContent.trim();
            });

            // Fallback: walk every <p> in order and pull label + value.
            // The label is the text node before the <span>, the value is the last <span>.
            // This is language-agnostic because we rely on DOM position, not text.
            if (!data.stats.baseDamage) {
                const paragraphs = Array.from(statsCard.querySelectorAll('p'));
                // Map index position → key (matches the visual 2-column layout order)
                // Left col: 0=baseDmg, 2=bonusDmg, 4=accuracy, 6=flatLand, 8=forest
                // Right col: 1=critChance, 3=critHit, 5=dropChance, 7=mountains, 9=desert
                const indexKeyMap = {
                    0: 'baseDamage',
                    1: 'critChance',
                    2: 'bonusDamage',
                    3: 'critHit',
                    4: 'accuracy',
                    5: 'dropChance',
                    6: 'flatLand',
                    7: 'mountains',
                    8: 'forest',
                    9: 'desert',
                };
                paragraphs.forEach((p, idx) => {
                    const span = p.querySelector('span');
                    if (!span) return;
                    const key = indexKeyMap[idx];
                    if (key && !data.stats[key]) {
                        data.stats[key] = span.textContent.trim();
                    }
                });
            }
        }

        // Equipment slots
        data.equipment = [];
        data.eqBonuses = {}; // aggregated bonuses from all eq tooltips: name → numeric sum

        const equipSlots = doc.querySelectorAll('.equip-slot');
        equipSlots.forEach((slot) => {
            const equipItem = slot.querySelector('.equipment-item');
            if (!equipItem) { data.equipment.push(null); return; }
            const img = equipItem.querySelector('img');
            const quality = parseInt(equipItem.getAttribute('data-tier') || '0', 10) || 0;
            // Parse tooltip stats: each <p> has a bonus span + text node (stat name)
            // Structure: <span class="good-bonus|bad-bonus">+X%</span> Stat name
            // Language-agnostic: we use the text node after the span as the key.
            // Try both .tooltip-content (profile page) and any direct child tooltip
            const tipEl = equipItem.querySelector('.tooltip-content') || equipItem.querySelector('[class*="tooltip"]');
            if (tipEl) {
                tipEl.querySelectorAll('p').forEach(p => {
                    const span = p.querySelector('span.good-bonus, span.bad-bonus');
                    if (!span) return;
                    const spanText = span.textContent.trim();
                    // Stat name: remove span text from full p text
                    const statName = p.textContent.replace(spanText, '').trim();
                    if (!statName) return;
                    // Parse value: keep sign, strip non-numeric except dot
                    const isNeg = spanText.startsWith('-');
                    const isPercent = spanText.includes('%');
                    const num = parseFloat(spanText.replace(/[^0-9.]/g, '')) * (isNeg ? -1 : 1);
                    if (isNaN(num) || num === 0) return;
                    const mapKey = statName + (isPercent ? '%' : '');
                    data.eqBonuses[mapKey] = (data.eqBonuses[mapKey] || 0) + num;
                });
            }

            data.equipment.push({
                src: img ? img.getAttribute('src') : '',
                quality,
                tooltipHTML: tipEl ? tipEl.innerHTML : ''
            });
        });

        return data;
    }

    // ─── Online status helpers ───────────────────────────────────────────────────

    // Parse lastSeen string → Date or null
    function parseLastSeen(str) {
        if (!str) return null;
        // Format: "DD-MM-YYYY"
        const dateMatch = str.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (dateMatch) {
            return new Date(+dateMatch[3], +dateMatch[2] - 1, +dateMatch[1]);
        }
        // Format: "N hours ago" / "N minutes ago" / "N days ago"
        const agoMatch = str.match(/(\d+)\s*(minute|hour|day|week)/i);
        if (agoMatch) {
            const n = parseInt(agoMatch[1]);
            const unit = agoMatch[2].toLowerCase();
            const ms = unit.startsWith('m') ? n * 60000
                     : unit.startsWith('h') ? n * 3600000
                     : unit.startsWith('d') ? n * 86400000
                     : n * 7 * 86400000;
            return new Date(Date.now() - ms);
        }
        return null;
    }

    // Returns CSS color string for the status text
    function eclOnlineColor(d) {
        if (d.isOnline) return '#6ee686';
        if (!d.lastSeen) return '#888';
        const dt = parseLastSeen(d.lastSeen);
        if (!dt) return '#888';
        const ageDays = (Date.now() - dt.getTime()) / 86400000;
        if (ageDays <= 7)  return '#ffd040'; // yellow — within a week
        return '#e04040';                     // red — older than a week
    }

    // Returns dot CSS class
    function eclDotClass(d) {
        if (d.isOnline) return '';
        if (!d.lastSeen) return 'offline';
        const dt = parseLastSeen(d.lastSeen);
        if (!dt) return 'offline';
        const ageDays = (Date.now() - dt.getTime()) / 86400000;
        if (ageDays <= 7) return 'offline-stale';
        return 'offline-old';
    }

    // Returns the full status label with last seen appended if available
    function eclOnlineLabel(d) {
        if (d.isOnline) return '● Online';
        if (d.lastSeen) return `○ Offline · ${escHtml(d.lastSeen)}`;
        return '○ Offline';
    }

    // ─── Render helpers ───────────────────────────────────────────────────────

    // Build a 2-col stats grid cell with emoji icon
    function sgCell(icon, label, value) {
        if (!value && value !== '0' && value !== '0%') return '';
        const isZero     = value === '0' || value === '0%';
        const isPositive = !isZero && !value.startsWith('-');
        const cls = isZero ? 'zero' : (isPositive ? 'positive' : '');
        return `
            <div class="ecl-sg-cell">
                <span class="ecl-sg-icon">${icon}</span>
                <div class="ecl-sg-inner">
                    <span class="ecl-sg-label">${label}</span>
                    <span class="ecl-sg-value ${cls}">${escHtml(value)}</span>
                </div>
            </div>`;
    }

    // Build a citizen-section cell with an <img> icon instead of emoji
    function sgCellImg(imgSrc, label, value, extraCls) {
        if (!value) return '';
        const cls = extraCls || '';
        return `
            <div class="ecl-sg-cell">
                <img class="ecl-sg-img" src="${imgSrc}" alt="">
                <div class="ecl-sg-inner">
                    <span class="ecl-sg-label">${label}</span>
                    <span class="ecl-sg-value ${cls}">${escHtml(value)}</span>
                </div>
            </div>`;
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    async function renderCard(userId, forceRefresh) {
        card.innerHTML = '';

        let cached = forceRefresh ? null : getCached(userId);

        if (!cached) {
            card.innerHTML = `
                <div class="ecl-card-header" style="border-radius:14px 14px 0 0;">
                    <div class="ecl-loading">
                        <div class="ecl-spinner"></div>
                        <div class="ecl-loading-text">LOADING PROFILE...</div>
                    </div>
                </div>`;

            try {
                const data = await fetchProfile(userId);
                setCache(userId, data);
                if (currentUserId === userId) {
                    renderData(data, false);
                    if (currentAnchor) positionCard(currentAnchor);
                }
            } catch (e) {
                if (currentUserId === userId) {
                    card.innerHTML = `<div class="ecl-error">⚠ Failed to load profile.<br><small>${e.message}</small></div>`;
                }
            }
        } else {
            renderData(cached.data, cached.timestamp);
            if (currentAnchor) positionCard(currentAnchor);
        }
    }

    function renderData(d, ts) {
        if (!d.eqBonuses) d.eqBonuses = {}; // compat with old cache
        const isOnline  = d.isOnline;
        const cacheDate  = ts ? new Date(ts).toLocaleString() : '';
        const isStale    = ts ? (Date.now() - ts) > 24 * 60 * 60 * 1000 : false;
        const s         = d.stats || {};

        // ── Equipment HTML ─────────────────────────────────────────────────
        let equipHTML = '';
        if (d.equipment && d.equipment.length > 0) {
            equipHTML = d.equipment.map((eq, i) => {
                if (!eq || !eq.src) return `<div class="ecl-equip-slot"></div>`;
                const qClass   = eq.quality >= 1 && eq.quality <= 6 ? `q${eq.quality}` : '';
                const qBadge   = eq.quality ? `<span class="ecl-equip-q-badge">Q${eq.quality}</span>` : '';
                const perfCat  = getPerfCategory(eq.src);
                const perfColor = perfCat ? PERF_COLORS[perfCat] : null;
                const perfClass = perfColor ? 'perf' : '';
                const perfStyle = perfColor ? `style="--perf-color:${perfColor}"` : '';

                return `
                    <div class="ecl-equip-slot ${qClass} ${perfClass}" ${perfStyle}>
                        <img src="${eq.src}" alt="slot ${i+1}" loading="lazy">
                        ${qBadge}
                        ${eq.tooltipHTML ? `<div class="ecl-equip-tooltip">${eq.tooltipHTML}</div>` : ''}
                    </div>`;
            }).join('');
        }

        // ── Citizen info cells — 2-col layout ─────────────────────────────
        // Left col:  Military Rank, Strength, Total Damage Done
        // Right col: Builder Rank, Economic Level, Builder Progress
        const citizenLeft = [
            d.militaryRankImg && d.militaryRank
                ? sgCellImg(d.militaryRankImg, 'Military Rank', d.militaryRank)
                : '',
            d.strength
                ? sgCellImg(`${BASE_URL}/assets/images/profile/strength.png`, 'Strength', d.strength)
                : '',
            d.totalDamage
                ? sgCellImg(`${BASE_URL}/assets/images/profile/damage.png`, 'Total Damage', d.totalDamage, 'positive')
                : '',
        ].filter(Boolean).join('');

        const citizenRight = [
            d.builderRankImg && d.builderRank
                ? sgCellImg(d.builderRankImg, 'Builder Rank', d.builderRank)
                : '',
            d.economicLevel
                ? sgCellImg(`${BASE_URL}/assets/images/profile/economy.png`, 'Eco', d.economicLevel)
                : '',
            d.builderProgress
                ? sgCellImg(`${BASE_URL}/assets/images/profile/builder.png`, 'Build Progress', d.builderProgress)
                : '',
        ].filter(Boolean).join('');

        // ── Combat stats grid — 2-column layout matching in-game stats card ──
        // Order: Base Dmg | Crit Chance / Bonus Dmg | Crit Hit / Accuracy | Drop /
        //        Flat Land | Mountains / Forest | Desert
        const combatCells = [
            sgCell('⚔️',  'Base Damage',   s.baseDamage),
            sgCell('⭐',  'Crit Chance',   s.critChance),
            sgCell('➕',  'Bonus Damage',  s.bonusDamage),
            sgCell('💥',  'Critical Hit',  s.critHit),
            sgCell('🎯',  'Accuracy',      s.accuracy),
            sgCell('🎁',  'Drop Chance',   s.dropChance),
            sgCell('🏕️', 'Flat Land',     s.flatLand),
            sgCell('🏔️', 'Mountains',     s.mountains),
            sgCell('🌲',  'Forest',        s.forest),
            sgCell('🏜️', 'Desert',        s.desert),
        ].filter(Boolean).join('');

        card.innerHTML = `
            <div class="ecl-card-header">
                <div class="ecl-avatar-wrap">
                    <img class="ecl-avatar" src="${d.avatarSrc}" alt="${escHtml(d.nickname)}" loading="lazy">
                    ${d.avatarBorderSrc ? `<div class="ecl-avatar-border" style="background-image:url('${d.avatarBorderSrc}')"></div>` : ''}
                    <div class="ecl-online-dot ${eclDotClass(d)}"></div>
                </div>
                <div class="ecl-header-info">
                    <div class="ecl-name-row">
                        <a href="${BASE_URL}/user/${currentUserId}" target="_blank" style="text-decoration:none;color:inherit;min-width:0;overflow:hidden;"><div class="ecl-name">${escHtml(d.nickname)}</div></a>
                        <div class="ecl-level-badge">⭐ ${escHtml(d.level)}</div>
                    </div>
                    <div class="ecl-geo-row">
                        ${d.nationalityFlag ? `<a href="${BASE_URL}${d.nationalityHref}" target="_blank" style="text-decoration:none;color:inherit;">
                            <div class="ecl-location-row"><img src="${d.nationalityFlag}" alt="${escHtml(d.nationalityName)}"><span>${escHtml(d.nationalityName)}</span></div>
                        </a>` : ''}
                        ${d.nationalityFlag && d.location ? `<span class="ecl-geo-sep">·</span>` : ''}
                        ${d.location ? `<a href="${BASE_URL}${d.locationHref}" target="_blank" style="text-decoration:none;color:inherit;">
                            <div class="ecl-location-row">${d.locationFlag ? `<img src="${d.locationFlag}" alt="${escHtml(d.locationCountry)}">` : '📍'}<span>${escHtml(d.location)}</span></div>
                        </a>` : ''}
                    </div>
                    <div style="margin-top:2px; font-size:10px; font-weight:600; color:${eclOnlineColor(d)};">
                        ${eclOnlineLabel(d)}
                    </div>
                </div>
                <div class="ecl-header-actions">
                    <div class="ecl-hide-ring" title="Time until card hides">
                        <svg viewBox="0 0 28 28" width="28" height="28">
                            <circle class="bg" cx="14" cy="14" r="${RING_R}"/>
                            <circle class="fg" cx="14" cy="14" r="${RING_R}"/>
                        </svg>
                    </div>
                    <button class="ecl-refresh-btn" id="ecl-refresh-btn" title="Refresh data"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></button>
                </div>
            </div>

            <div class="ecl-tabs">
                <button class="ecl-tab active" data-tab="info">Info</button>
                <button class="ecl-tab" data-tab="battles">Battles</button>
            </div>

            <div class="ecl-card-body">

                <div class="ecl-tab-panel active" data-panel="info">

                    ${(citizenLeft || citizenRight) ? `
                    <div class="ecl-section-label">Citizen</div>
                    <div class="ecl-citizen-cols">
                        <div class="ecl-citizen-col">${citizenLeft}</div>
                        <div class="ecl-citizen-col">${citizenRight}</div>
                    </div>` : ''}

                    ${combatCells ? `
                    <div class="ecl-section-label">Combat Stats</div>
                    <div class="ecl-stats-grid">${combatCells}</div>` : ''}

                    ${(d.militaryUnitName || d.partyName) ? `
                    <div class="ecl-section-label">Organisation</div>
                    <div class="ecl-org-row">
                        ${d.militaryUnitName ? `
                        <div class="ecl-stat-row">
                            ${d.militaryUnitImg ? `<img src="${d.militaryUnitImg}" alt="mu">` : ''}
                            <div style="min-width:0;overflow:hidden;">
                                <div class="ecl-stat-label">Military Unit</div>
                                <a href="${d.militaryUnitHref}" target="_blank">
                                    <div class="ecl-stat-value">${escHtml(d.militaryUnitName)}</div>
                                </a>
                            </div>
                        </div>` : ''}
                        ${d.partyName ? `
                        <div class="ecl-stat-row">
                            ${d.partyImg ? `<img src="${d.partyImg}" alt="party">` : ''}
                            <div style="min-width:0;overflow:hidden;">
                                <div class="ecl-stat-label">Political Party</div>
                                <a href="${d.partyHref}" target="_blank">
                                    <div class="ecl-stat-value">${escHtml(d.partyName)}</div>
                                </a>
                            </div>
                        </div>` : ''}
                    </div>` : ''}

                    ${equipHTML ? `
                    <div class="ecl-section-label">Equipment</div>
                    <div class="ecl-equip-grid">${equipHTML}</div>` : ''}

                    ${Object.keys(d.eqBonuses || {}).length > 0 ? (() => {
                        const rows = Object.entries(d.eqBonuses)
                            .sort((a, b) => b[1] - a[1])
                            .map(([name, val]) => {
                                const isPos = val >= 0;
                                const isPercent = name.endsWith('%');
                                const label = isPercent ? name.slice(0, -1) : name;
                                const abs = Math.abs(val);
                                const formatted = (isPos ? '+' : '-') + (isPercent ? abs.toFixed(1) + '%' : (abs % 1 === 0 ? abs : abs.toFixed(1)));
                                const cls = isPos ? 'pos' : 'neg';
                                return `<div class="ecl-eq-bonus-row"><span class="ecl-eq-bonus-name">${escHtml(label)}</span><span class="ecl-eq-bonus-val ${cls}">${escHtml(formatted)}</span></div>`;
                            }).join('');
                        return `<div class="ecl-section-label">EQ Bonuses</div><div class="ecl-eq-bonus-grid">${rows}</div>`;
                    })() : ''}

                    ${ts ? `<div class="ecl-cache-info${isStale ? ' stale' : ''}">Cached: ${cacheDate}</div>` : ''}

                </div>

                <div class="ecl-tab-panel" data-panel="battles">
                    <a class="ecl-battles-powered" href="https://ecltools.nekobot.pl" target="_blank">
                        Powered by <span>ECL-Tools</span>
                    </a>
                    <div class="ecl-battles-content">
                        <div class="ecl-battles-loading">Loading battles…</div>
                    </div>
                </div>

            </div>
        `;

        // Wire refresh button
        const refreshBtn = card.querySelector('#ecl-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                refreshBtn.classList.add('spinning');
                const uid = currentUserId;
                fetchProfile(uid).then(data => {
                    setCache(uid, data);
                    if (currentUserId === uid) renderData(data, Date.now());
                }).catch(err => {
                    console.warn('[ECL] Refresh failed:', err);
                }).finally(() => {
                    refreshBtn.classList.remove('spinning');
                });
            });
        }

        // Wire tabs
        card.querySelectorAll('.ecl-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = tab.dataset.tab;
                card.querySelectorAll('.ecl-tab').forEach(t => t.classList.remove('active'));
                card.querySelectorAll('.ecl-tab-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const panel = card.querySelector(`.ecl-tab-panel[data-panel="${target}"]`);
                if (panel) panel.classList.add('active');

                // Lazy-load battles on first visit
                if (target === 'battles' && currentUserId) {
                    const server = getServer();
                    const cacheKey = `${server}_${currentUserId}`;
                    const content = panel.querySelector('.ecl-battles-content');
                    if (!content) return;
                    if (battlesCache[cacheKey]) {
                        renderBattles(content, battlesCache[cacheKey], server);
                    } else {
                        content.innerHTML = '<div class="ecl-battles-loading">Loading battles…</div>';
                        fetchBattles(currentUserId).then(data => {
                            battlesCache[cacheKey] = data;
                            renderBattles(content, data, server);
                        }).catch(err => {
                            content.innerHTML = `<div class="ecl-battles-loading">⚠ Failed: ${err.message}</div>`;
                        });
                    }
                }
            });
        });
    }

    function formatDmg(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return String(n);
    }

    function formatWarDate(ts) {
        if (!ts) return '';
        const d = new Date(ts);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(2);
        return `${dd}.${mm}.${yy}`;
    }

    const BATTLES_PER_PAGE = 10;

    function renderBattles(container, battles, server, page) {
        if (!battles || battles.length === 0) {
            container.innerHTML = '<div class="ecl-battles-loading">No battles found.</div>';
            return;
        }

        page = page || 0;
        const totalPages = Math.ceil(battles.length / BATTLES_PER_PAGE);
        const slice = battles.slice(page * BATTLES_PER_PAGE, (page + 1) * BATTLES_PER_PAGE);

        const rows = slice.map(b => {
            const isGoldEvent = b.region_id === 0;
            const badge = isGoldEvent
                ? `<span class="ecl-battles-gold">EVENT</span>`
                : (b.flags && b.flags.is_revolution ? `<span class="ecl-battles-rev">REV</span>` : '');
            const closed = b.is_closed ? 'ecl-battles-closed' : '';
            const link = `https://ecltools.nekobot.pl/${server}/wars/history/${b.id}/summary`;
            const dmg = formatDmg(b.fighter_damage);
            const date = formatWarDate(b.war_start);
            return `<tr class="${closed}">
                <td>
                    <div class="ecl-battles-side att">
                        <img class="ecl-battles-flag" src="${b.attacker.avatar}" alt="${escHtml(b.attacker.name)}">
                        <span>${escHtml(b.attacker.name)}</span>
                    </div>
                </td>
                <td class="ecl-battles-vs">VS</td>
                <td>
                    <div class="ecl-battles-side def">
                        <img class="ecl-battles-flag" src="${b.defender.avatar}" alt="${escHtml(b.defender.name)}">
                        <span>${escHtml(b.defender.name)}</span>
                    </div>
                </td>
                <td style="text-align:center">${badge}</td>
                <td class="ecl-battles-date">${date}</td>
                <td class="ecl-battles-dmg">${dmg}</td>
                <td><a class="ecl-battles-link" href="${link}" target="_blank">↗ ECL-T</a></td>
            </tr>`;
        }).join('');

        const pager = totalPages > 1 ? `
            <div class="ecl-battles-pager">
                <button id="ecl-bp-prev" ${page === 0 ? 'disabled' : ''}>‹</button>
                <span>${page + 1} / ${totalPages}</span>
                <button id="ecl-bp-next" ${page >= totalPages - 1 ? 'disabled' : ''}>›</button>
            </div>` : '';

        container.innerHTML = `
            ${pager}
            <table class="ecl-battles-table">
                <colgroup>
                    <col class="col-att">
                    <col class="col-vs">
                    <col class="col-def">
                    <col class="col-badge">
                    <col class="col-date">
                    <col class="col-dmg">
                    <col class="col-link">
                </colgroup>
                <thead><tr>
                    <th>Attacker</th>
                    <th></th>
                    <th>Defender</th>
                    <th></th>
                    <th style="text-align:center">Date</th>
                    <th style="text-align:right">Dmg</th>
                    <th></th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>`;

        // Wire pager buttons
        const prev = container.querySelector('#ecl-bp-prev');
        const next = container.querySelector('#ecl-bp-next');
        if (prev) prev.addEventListener('click', (e) => { e.stopPropagation(); renderBattles(container, battles, server, page - 1); });
        if (next) next.addEventListener('click', (e) => { e.stopPropagation(); renderBattles(container, battles, server, page + 1); });
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─── Link Detection ───────────────────────────────────────────────────────
    const USER_PATH_RE = /^\/user\/(\d+)\/?$/;

    function getProfileId(anchor) {
        const rawHref = anchor.getAttribute('href') || '';

        // Skip empty, hash-only, or javascript: links — these are UI controls
        // (dropdowns, edit buttons, add-health, etc.) and must never trigger the card.
        if (!rawHref || rawHref === '#' || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return null;

        try {
            const url = new URL(rawHref, window.location.href);

            // Must be same origin
            if (url.origin !== window.location.origin) return null;

            // Must match /user/:id path
            const m = url.pathname.match(USER_PATH_RE);
            if (!m) return null;

            const userId = m[1];

            // If we are already on this user's own profile page, skip —
            // links like the avatar/name at the top of the profile are
            // self-referential and should not pop the card over themselves.
            const currentMatch = window.location.pathname.match(USER_PATH_RE);
            if (currentMatch && currentMatch[1] === userId) return null;

            return userId;
        } catch { return null; }
    }

    function attachHoverToLink(anchor) {
        if (anchor.dataset.eclHover) return; // already attached
        // Never attach to links inside the hover card itself — would cause recursion
        if (anchor.closest('#ecl-hover-card')) return;
        const userId = getProfileId(anchor);
        if (!userId) return;
        anchor.dataset.eclHover = '1';

        anchor.addEventListener('mouseenter', (e) => showCard(anchor, userId));
        anchor.addEventListener('mouseleave', () => {
            clearTimeout(showTimeout);
            hideCard();
        });
    }

    function scanLinks() {
        document.querySelectorAll('a').forEach(a => attachHoverToLink(a));
    }

    scanLinks();

    // Watch for dynamically added links (e.g. chat, lazy-loaded sections)
    // Ignore mutations originating from inside the hover card
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            // Skip mutations inside the card itself
            if (m.target && m.target.closest && m.target.closest('#ecl-hover-card')) continue;
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.id === 'ecl-hover-card') continue; // the card itself being added
                if (node.tagName === 'A') attachHoverToLink(node);
                if (node.querySelectorAll) {
                    node.querySelectorAll('a').forEach(a => attachHoverToLink(a));
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log(`[ECL Profile Hover v${VERSION}] Loaded on ${BASE_URL}`);

    // ─── Settings page panel (/user/settings) ────────────────────────────────
    if (/\/user\/settings/.test(window.location.pathname)) {
        function renderSettingsPanel() {
            const s = ECL_SETTINGS;
            const panel = document.createElement('div');
            panel.id = 'ecl-settings-panel';
            panel.className = 'col-12 col-lg-6';
            panel.innerHTML = `
                <div class="d-flex flex-column alert alert-info" id="ecl-settings-inner">
                    <div class="ecl-settings-title">
                        ECL Profile Hover — Settings
                        <span>v${VERSION}</span>
                    </div>

                    <table class="ecl-settings-table">
                        <tr>
                            <td><label for="ecl-hover-delay" style="margin:0">Hover delay</label></td>
                            <td><input type="range" id="ecl-hover-delay" min="0" max="1000" step="50" value="${s.hoverDelay}"></td>
                            <td id="ecl-hover-delay-val">${s.hoverDelay} ms</td>
                        </tr>
                        <tr>
                            <td><label for="ecl-hide-delay" style="margin:0">Hide delay</label></td>
                            <td><input type="range" id="ecl-hide-delay" min="100" max="3000" step="100" value="${s.hideDelay}"></td>
                            <td id="ecl-hide-delay-val">${s.hideDelay} ms</td>
                        </tr>
                    </table>

                    <div class="d-flex justify-content-end gap-2 mt-2" style="gap:8px;">
                        <button type="button" class="btn btn-outline-secondary btn-sm" id="ecl-settings-reset">Reset to defaults</button>
                        <button type="button" class="btn btn-primary btn-sm" id="ecl-settings-save">Save</button>
                    </div>
                    <small class="text-muted mt-2" id="ecl-settings-status"></small>
                </div>`;

            // Wire sliders
            const hoverInput = panel.querySelector('#ecl-hover-delay');
            const hideInput  = panel.querySelector('#ecl-hide-delay');
            const hoverVal   = panel.querySelector('#ecl-hover-delay-val');
            const hideVal    = panel.querySelector('#ecl-hide-delay-val');

            hoverInput.addEventListener('input', () => { hoverVal.textContent = hoverInput.value + ' ms'; });
            hideInput.addEventListener('input',  () => { hideVal.textContent  = hideInput.value  + ' ms'; });

            panel.querySelector('#ecl-settings-save').addEventListener('click', () => {
                ECL_SETTINGS.hoverDelay = parseInt(hoverInput.value);
                ECL_SETTINGS.hideDelay  = parseInt(hideInput.value);
                saveSettings(ECL_SETTINGS);
                const status = panel.querySelector('#ecl-settings-status');
                status.textContent = '✔ Settings saved.';
                setTimeout(() => { status.textContent = ''; }, 2000);
            });

            panel.querySelector('#ecl-settings-reset').addEventListener('click', () => {
                ECL_SETTINGS = Object.assign({}, SETTINGS_DEFAULTS);
                saveSettings(ECL_SETTINGS);
                hoverInput.value = ECL_SETTINGS.hoverDelay;
                hideInput.value  = ECL_SETTINGS.hideDelay;
                hoverVal.textContent = ECL_SETTINGS.hoverDelay + ' ms';
                hideVal.textContent  = ECL_SETTINGS.hideDelay  + ' ms';
                const status = panel.querySelector('#ecl-settings-status');
                status.textContent = '↺ Reset to defaults.';
                setTimeout(() => { status.textContent = ''; }, 2000);
            });

            return panel;
        }

        // Inject after the page loads — wait for the settings form to appear
        function injectSettingsPanel() {
            const container = document.querySelector('.d-flex.flex-wrap.mb-4');
            if (!container) return;
            if (document.getElementById('ecl-settings-panel')) return;
            container.appendChild(renderSettingsPanel());
        }

        // Try immediately and also watch for dynamic load
        injectSettingsPanel();
        const settingsObserver = new MutationObserver(injectSettingsPanel);
        settingsObserver.observe(document.body, { childList: true, subtree: true });
    }

})();