// ==UserScript==
// @name         EDS-Plugin for pixiv
// @namespace    https://miyacorata.net/
// @version      1.0.0
// @description  pixivで明示的に指定しない限り全年齢を表示するようにするプラグインもといUserScriptです
// @author       K Miyano / @miyacorata
// @match        https://www.pixiv.net/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/miyacorata/EDS-Plugin/raw/refs/heads/main/EDS-Plugin.user.js
// @downloadURL  https://github.com/miyacorata/EDS-Plugin/raw/refs/heads/main/EDS-Plugin.user.js
// @supportURL   https://github.com/miyacorata/EDS-Plugin
// ==/UserScript==

(function() {
    'use strict';

    const logStr = (str) => {
        console.log(
            "%cEDS-Plugin",
            "color:white; background-color:#0196FB; padding:1px 3px; border-radius:2px;",
            str
        );
    };

    logStr("EDS-Plugin for pixiv : UserScriptが動作中です");

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        originalPushState.apply(this, arguments);
        window.dispatchEvent(new Event('locationChange'));
    };

    history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        window.dispatchEvent(new Event('locationChange'));
    };

    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationChange'));
    });

    const changeMode = (mode) => {
        logStr('modeパラメータ付加処理を行います');
        let count = 0;
        document.querySelectorAll('a[href^="/tags/"]').forEach((link) => {
            //console.group();
            //console.log(link);
            //console.groupEnd();
            const url = new URL(location.origin + (new String(link.getAttribute('href'))));
            if (url.searchParams.get('mode')) return;
            url.searchParams.set('mode', mode);
            link.href = url.pathname + url.search + url.hash;
            link.addEventListener('click', (event) => {
                event.preventDefault();
                location.href = link.href;
            });
            count++;
        });
        logStr(count + 'のリンクが' + mode + 'モードに置換されました');
    };

    ['locationChange', 'load'].forEach((event) => {
        window.addEventListener(event, () => {
            logStr('イベント検知 : ' + event);

            // DOMが落ち着くのをなんとなく待つ(うまくイベント拾えないかな？)
            setTimeout(() => {
                // タグ検索ページであるとき
                if ((/^https:\/\/www\.pixiv\.net\/tags\/.+/).test(location.href)) {
                    const url = new URL(location.href);
                    const mode = url.searchParams.get('mode');

                    // modeパラメータなしの場合safeモードに変更し遷移
                    if (mode === null) {
                        logStr('タグ検索ページ : modeパラメータがありません safeモードに切り替えます');
                        url.searchParams.set('mode', 'safe');
                        location.href = url.toString();
                    }

                    // 各タグ検索ページに対するリンクにmodeパラメータがない場合明示的にallモードに置換する
                    changeMode('all');
                }
                // タグ検索ページでないとき
                else {
                    // 各タグ検索ページに対するリンクにmodeパラメータがない場合明示的にsafeモードに置換する
                    changeMode('safe');
                }
            }, 500);
        });
    });

})();
