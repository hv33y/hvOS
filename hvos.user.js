// ==UserScript==
// @name         hvOS
// @namespace    https://github.com/hv33y
// @version      1.0.1
// @description  Apple TV interface for YouTube with ambient glow, pop-out search, and zero bloat.
// @author       hv33y (https://github.com/hv33y)
// @match        https://www.youtube.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const stripThemeRefresh = (url) => {
        if (typeof url === 'string' && url.includes('themeRefresh=1')) {
            return url
                .replace(/([?&])themeRefresh=1(&|$)/, '$1')
                .replace(/[?&]$/, '');
        }
        return url;
    };

    if (window.location.search.includes('themeRefresh=1')) {
        const cleanUrl = stripThemeRefresh(window.location.href);
        window.history.replaceState(null, '', cleanUrl);
    }

    const originalPushState = history.pushState;
    history.pushState = function (state, title, url) {
        return originalPushState.apply(this, [state, title, stripThemeRefresh(url)]);
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (state, title, url) {
        return originalReplaceState.apply(this, [state, title, stripThemeRefresh(url)]);
    };

    try {
        const cookieMatch = document.cookie.match(/PREF=([^;]+)/);
        if (!cookieMatch || !cookieMatch[1].includes('f6=')) {
            document.cookie = `PREF=${(cookieMatch ? cookieMatch[1] + '&' : '')}f6=400;domain=.youtube.com;path=/`;
        }
    } catch (e) {}

    document.documentElement.setAttribute('dark', 'true');

    const blockList = [
        '/youtubei/v1/log_event',
        '/api/stats/qoe',
        '/api/stats/playback',
        '/api/stats/watchtime',
        '/api/stats/ads',
        '/generate_204',
        'google-analytics.com',
        'play.google.com/log'
    ];

    const originalFetch = window.fetch;
    window.fetch = function (resource, init) {
        const url = typeof resource === 'string' ? resource : resource?.url || '';
        if (blockList.some(blocked => url.includes(blocked))) {
            return Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200 }));
        }
        return originalFetch.apply(this, arguments);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (typeof url === 'string' && blockList.some(blocked => url.includes(blocked))) {
            return;
        }
        return originalOpen.apply(this, arguments);
    };

    const appletvTurboCSS = `
        body {
            background-color: #020204 !important;
            overflow-x: hidden !important;
        }

        body::before {
            content: "" !important;
            position: fixed !important;
            inset: -10vw !important;
            width: 120vw !important;
            height: 120vh !important;
            z-index: -99999 !important;
            pointer-events: none !important;
            background-image:
                radial-gradient(circle 850px at 50% 5%, rgba(67, 56, 202, 0.32), transparent 70%),
                radial-gradient(circle 750px at 90% 70%, rgba(14, 116, 144, 0.24), transparent 65%) !important;
            background-repeat: no-repeat !important;
            animation: ambientJuggleA 24s ease-in-out infinite alternate !important;
            transform: translate3d(0, 0, 0) !important;
            will-change: transform !important;
        }

        body::after {
            content: "" !important;
            position: fixed !important;
            inset: -10vw !important;
            width: 120vw !important;
            height: 120vh !important;
            z-index: -99998 !important;
            pointer-events: none !important;
            background-image:
                radial-gradient(circle 700px at 10% 45%, rgba(126, 34, 206, 0.22), transparent 65%),
                radial-gradient(circle 750px at 50% 105%, rgba(79, 70, 229, 0.20), transparent 70%) !important;
            background-repeat: no-repeat !important;
            animation: ambientJuggleB 28s ease-in-out infinite alternate !important;
            transform: translate3d(0, 0, 0) !important;
            will-change: transform !important;
        }

        @keyframes ambientJuggleA {
            0% { transform: translate3d(0px, 0px, 0) scale(1); }
            50% { transform: translate3d(45px, 25px, 0) scale(1.06); }
            100% { transform: translate3d(-35px, -20px, 0) scale(0.96); }
        }

        @keyframes ambientJuggleB {
            0% { transform: translate3d(0px, 0px, 0) scale(1); }
            50% { transform: translate3d(-50px, -30px, 0) scale(1.05); }
            100% { transform: translate3d(30px, 35px, 0) scale(0.94); }
        }

        html, ytd-app, #page-manager, ytd-browse, #primary, #contents, #columns, #grid-container, ytd-two-column-browse-results-renderer, #content {
            background: transparent !important;
            background-color: transparent !important;
            font-family: "Segoe UI Variable Display", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif !important;
        }

        #atv-focus-overlay {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(20px) saturate(140%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
            z-index: 2025 !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s ease !important;
        }

        html.search-focused #atv-focus-overlay,
        body.search-focused #atv-focus-overlay {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }

        #page-manager {
            transition: filter 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
        }

        html.search-focused #page-manager,
        body.search-focused #page-manager {
            filter: blur(14px) brightness(0.35) !important;
            pointer-events: none !important;
            user-select: none !important;
        }

        html.search-focused #masthead-container,
        body.search-focused #masthead-container {
            z-index: 2050 !important;
        }

        #frosted-glass,
        #frosted-glass.with-chipbar,
        .with-chipbar#frosted-glass,
        ytd-app #frosted-glass,
        #header.ytd-rich-grid-renderer,
        ytd-rich-grid-renderer > #header,
        #chips-wrapper,
        #chips-content,
        ytd-feed-filter-chip-bar-renderer,
        iron-selector#chips,
        #chips,
        #header:has(ytd-feed-filter-chip-bar-renderer),
        ytd-rich-grid-skeleton-renderer,
        #ghost-cards,
        #home-page-skeleton {
            display: none !important;
            height: 0px !important;
            min-height: 0px !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        #page-manager.ytd-app {
            margin-top: 56px !important;
            padding-top: 0 !important;
        }

        #masthead-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 2020 !important;
            background: transparent !important;
        }

        #background.ytd-masthead, #container.ytd-masthead {
            background: transparent !important;
        }

        ytd-masthead {
            background: rgba(6, 6, 10, 0.45) !important;
            backdrop-filter: blur(28px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4) !important;
            transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
        }

        body.is-scrolled ytd-masthead {
            background: rgba(4, 4, 8, 0.8) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.14) !important;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(67, 56, 202, 0.2) !important;
        }

        /* --- Fullscreen Video Clean Fix --- */
        :fullscreen #masthead-container,
        [fullscreen] #masthead-container,
        ytd-app[fullscreen] #masthead-container,
        ytd-watch-flexy[fullscreen] #masthead-container,
        body:has(.ytp-fullscreen) #masthead-container {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
        }

        :fullscreen #page-manager.ytd-app,
        [fullscreen] #page-manager.ytd-app,
        ytd-app[fullscreen] #page-manager.ytd-app,
        ytd-watch-flexy[fullscreen] #page-manager.ytd-app,
        body:has(.ytp-fullscreen) #page-manager.ytd-app {
            margin-top: 0px !important;
            padding-top: 0px !important;
            height: 100vh !important;
        }

        :fullscreen ytd-watch-flexy,
        [fullscreen] ytd-watch-flexy,
        ytd-watch-flexy[fullscreen] {
            padding-top: 0 !important;
            margin-top: 0 !important;
        }

        :fullscreen .ytp-chrome-bottom,
        [fullscreen] .ytp-chrome-bottom,
        .ytp-fullscreen .ytp-chrome-bottom {
            bottom: 0 !important;
            z-index: 2147483647 !important;
        }

        #guide-button,
        ytd-masthead #guide-button,
        #start #guide-button,
        yt-icon-button#guide-button,
        button[aria-label*="Guide"],
        button[aria-label*="guide"],
        ytd-masthead #guide-icon,
        #guide-icon,
        ytd-masthead yt-icon[icon="yt-icons:menu"],
        ytd-notification-topbar-button-renderer,
        #notification-button,
        ytd-masthead #buttons > ytd-notification-topbar-button-renderer,
        ytd-masthead yt-icon-button:has(yt-icon[icon*="notification"]),
        ytd-masthead yt-icon-button:has(yt-icon[icon*="bell"]),
        ytd-masthead button[aria-label*="Notification"],
        ytd-masthead button[aria-label*="notification"],
        #voice-search-button,
        ytd-masthead #voice-search-button,
        yt-icon-button#voice-search-button,
        ytd-masthead #buttons > ytd-button-renderer:has(a[href*="upload"]),
        ytd-masthead yt-button-view-model:has(button[aria-label*="Create"]),
        ytd-masthead yt-button-view-model:has(button[aria-label*="create"]),
        ytd-masthead #create-icon,
        ytd-masthead yt-button-shape:has(button[aria-label*="Create"]),
        ytd-masthead tp-yt-paper-button:has(yt-icon[icon="yt-icons:video_call"]),
        ytd-topbar-menu-button-renderer:has(button[aria-label*="Create"]),
        ytd-topbar-menu-button-renderer:has(yt-icon[icon*="video_call"]) {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        #center.ytd-masthead {
            flex: 0 1 auto !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: 0 auto !important;
            position: relative !important;
            z-index: 2060 !important;
            min-width: 200px !important;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        html.search-focused #center.ytd-masthead,
        body.search-focused #center.ytd-masthead,
        #center.ytd-masthead:focus-within {
            flex: 0 1 700px !important;
            min-width: min(700px, 85vw) !important;
        }

        ytd-searchbox.ytd-masthead {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            position: relative !important;
            width: 100% !important;
            overflow: visible !important;
        }

        #search-form.ytd-searchbox {
            display: flex !important;
            flex-direction: row-reverse !important;
            align-items: center !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 9999px !important;
            height: 34px !important;
            width: 200px !important;
            min-width: 200px !important;
            padding: 0 14px 0 10px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
            transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        background 0.25s ease,
                        box-shadow 0.35s ease,
                        border-color 0.25s ease,
                        transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
            transform-origin: center center !important;
        }

        #container.ytd-searchbox {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            height: 100% !important;
            padding: 0 0 0 6px !important;
            margin: 0 !important;
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
        }

        #container.ytd-searchbox input {
            color: #FFFFFF !important;
            background: transparent !important;
            font-size: 13px !important;
            font-weight: 400 !important;
            padding: 0 !important;
            width: 100% !important;
            border: none !important;
            outline: none !important;
            transition: font-size 0.2s ease !important;
        }

        #container.ytd-searchbox input::placeholder {
            color: rgba(255, 255, 255, 0.65) !important;
        }

        #search-icon-legacy.ytd-searchbox {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            height: auto !important;
            width: auto !important;
            min-width: unset !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            cursor: pointer !important;
        }

        #search-icon-legacy.ytd-searchbox yt-icon {
            color: rgba(255, 255, 255, 0.75) !important;
            fill: rgba(255, 255, 255, 0.75) !important;
            width: 15px !important;
            height: 15px !important;
            transition: all 0.2s ease !important;
        }

        #search-form.ytd-searchbox:hover {
            background: rgba(255, 255, 255, 0.12) !important;
            border-color: rgba(255, 255, 255, 0.25) !important;
        }

        html.search-focused #search-form.ytd-searchbox,
        body.search-focused #search-form.ytd-searchbox,
        #search-form.ytd-searchbox:focus-within {
            width: min(680px, 85vw) !important;
            min-width: min(680px, 85vw) !important;
            height: 44px !important;
            background: rgba(20, 20, 26, 0.98) !important;
            border-color: rgba(255, 255, 255, 0.65) !important;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(67, 56, 202, 0.45) !important;
            transform: scale(1.02) !important;
        }

        html.search-focused #container.ytd-searchbox input,
        body.search-focused #container.ytd-searchbox input,
        #search-form.ytd-searchbox:focus-within #container.ytd-searchbox input {
            font-size: 15px !important;
        }

        html.search-focused #search-icon-legacy.ytd-searchbox yt-icon,
        body.search-focused #search-icon-legacy.ytd-searchbox yt-icon,
        #search-form.ytd-searchbox:focus-within #search-icon-legacy.ytd-searchbox yt-icon {
            color: #FFFFFF !important;
            fill: #FFFFFF !important;
            width: 18px !important;
            height: 18px !important;
        }

        .sbdd_b, .sbsb_a, tp-yt-paper-listbox {
            background: rgba(18, 18, 24, 0.96) !important;
            backdrop-filter: blur(28px) !important;
            -webkit-backdrop-filter: blur(28px) !important;
            border: 1px solid rgba(255, 255, 255, 0.16) !important;
            border-radius: 14px !important;
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.9) !important;
            margin-top: 8px !important;
            overflow: hidden !important;
            z-index: 2100 !important;
        }

        .sbqs_c, .sbpqs_a { color: #FFFFFF !important; }
        .sbdd_c .sbsb_d, .sbsb_c:hover { background: rgba(255, 255, 255, 0.12) !important; }

        ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer,
        #contents.ytd-rich-grid-renderer {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 28px 18px !important;
            width: 100% !important;
            padding: 16px 36px 36px 36px !important;
            box-sizing: border-box !important;
        }

        ytd-rich-grid-row, #contents.ytd-rich-grid-row {
            display: contents !important;
        }

        ytd-rich-item-renderer {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            content-visibility: auto !important;
            contain-intrinsic-size: 320px 240px !important;
        }

        #thumbnail.ytd-thumbnail {
            border-radius: 14px !important;
            background-color: #121214 !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            overflow: hidden !important;
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, border-color 0.28s ease !important;
            transform-origin: center center;
        }

        ytd-rich-item-renderer:hover { z-index: 50 !important; }

        ytd-rich-item-renderer:hover #thumbnail.ytd-thumbnail {
            transform: scale(1.05) translateY(-4px) !important;
            border-color: rgba(255, 255, 255, 0.35) !important;
            box-shadow: 0 22px 45px rgba(0, 0, 0, 0.95), 0 0 35px rgba(67, 56, 202, 0.35), 0 0 10px rgba(255, 255, 255, 0.12) !important;
        }

        #video-title {
            color: #FFFFFF !important;
            font-size: 14.5px !important;
            font-weight: 500 !important;
            line-height: 1.35 !important;
            margin-top: 10px !important;
            margin-bottom: 4px !important;
            max-height: 2.7em !important;
            overflow: hidden !important;
        }

        #metadata.ytd-video-meta-block {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            flex-wrap: nowrap !important;
            gap: 6px !important;
            width: 100% !important;
            overflow: hidden !important;
            white-space: nowrap !important;
        }

        #byline-container.ytd-video-meta-block, ytd-channel-name.ytd-video-meta-block {
            display: inline-flex !important;
            margin: 0 !important;
            max-width: fit-content !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
        }

        #channel-name yt-formatted-string { color: #909096 !important; font-size: 12.5px !important; }

        #metadata-line.ytd-video-meta-block {
            display: inline-flex !important;
            align-items: center !important;
            margin: 0 !important;
            white-space: nowrap !important;
        }

        #metadata-line.ytd-video-meta-block::before {
            content: "•" !important;
            margin-right: 6px !important;
            color: #606068 !important;
            font-size: 11px !important;
        }

        #metadata-line.ytd-video-meta-block .inline-metadata-item:first-of-type {
            color: #909096 !important;
            font-size: 12.5px !important;
            display: inline !important;
        }

        #metadata-line.ytd-video-meta-block .inline-metadata-item:nth-of-type(2),
        #metadata-line.ytd-video-meta-block .inline-metadata-item:last-child {
            display: none !important;
        }

        ytd-guide-renderer, ytd-mini-guide-renderer, #guide, #guide-wrapper, tp-yt-app-drawer,
        ytd-rich-section-renderer, ytd-topic-picker-renderer, ytd-banner-promo-renderer,
        .ytp-ce-element, .ytp-cards-teaser, .ytp-cards-button, #offer-module,
        #inline-preview-player, ytd-moving-thumbnail-renderer-manager, #preview.ytd-rich-grid-media,
        #cinematics, #cinematics-container {
            display: none !important;
            pointer-events: none !important;
            visibility: hidden !important;
        }

        ytd-app[mini-guide-visible] #page-manager.ytd-app,
        ytd-app[guide-persistent-and-visible] #page-manager.ytd-app,
        ytd-two-column-browse-results-renderer.grid:not(.grid-disabled) {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100vw !important;
        }
    `;

    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(appletvTurboCSS);
    } else {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(appletvTurboCSS));
        (document.head || document.documentElement).appendChild(style);
    }

    function initSearchPopoutEngine() {
        if (!document.getElementById('atv-focus-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'atv-focus-overlay';
            (document.body || document.documentElement).appendChild(overlay);

            const openPopout = () => {
                document.documentElement.classList.add('search-focused');
                document.body.classList.add('search-focused');
            };

            const closePopout = () => {
                document.documentElement.classList.remove('search-focused');
                document.body.classList.remove('search-focused');
                const searchInput = document.querySelector('input#search, input.ytd-searchbox, input[name="search_query"]');
                if (searchInput) searchInput.blur();
            };

            window.addEventListener('focusin', (e) => {
                if (e.target && (e.target.matches('input#search, input.ytd-searchbox, input[name="search_query"]') || e.target.closest('#search-form, ytd-searchbox'))) {
                    openPopout();
                }
            }, true);

            window.addEventListener('click', (e) => {
                if (e.target && e.target.closest('#search-form, ytd-searchbox, #container.ytd-searchbox')) {
                    openPopout();
                } else if (!e.target.closest('#center.ytd-masthead, .sbdd_b, .sbsb_a')) {
                    closePopout();
                }
            }, true);

            overlay.addEventListener('click', closePopout);

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closePopout();
            });
        }
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 15) {
            document.body.classList.add('is-scrolled');
        } else {
            document.body.classList.remove('is-scrolled');
        }
    }, { passive: true });

    document.addEventListener('DOMContentLoaded', initSearchPopoutEngine);
    document.addEventListener('yt-navigate-finish', initSearchPopoutEngine);
    initSearchPopoutEngine();
})();
