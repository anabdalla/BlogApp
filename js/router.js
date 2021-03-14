/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

const router = (function () {
    // Private Variable
    let mapRouteToHandler = new Map();

    // Oeffentliche Methoden
    return {
        // Fügt eine neue Route (URL, auszuführende Funktion) zu der Map hinzu
        addRoute(route, handler) {
            mapRouteToHandler.set(route, handler);
        },

        // Wird aufgerufen, wenn zu einer anderen Adresse navigiert werden soll
        navigateToPage(url) {
            history.pushState(null, "", url);
            this.handleRouting();
        },

        // Wird als Eventhandler an ein <a>-Element gebunden
        handleNavigationEvent: function (event) {
            event.preventDefault();
            let url = event.target.href;
            this.navigateToPage(url);
        },

        // Wird als EventHandler aufgerufen, sobald die Pfeiltasten des Browsers betätigt werden
        handleRouting() {
            console.log("Aufruf von router.handleRouting(): Navigation zu: " + window.location.pathname);
            const currentPage = window.location.pathname.split('/')[1];
            let routeHandler = mapRouteToHandler.get(currentPage);
            if (routeHandler === undefined)
                routeHandler = mapRouteToHandler.get(''); //Startseite
            routeHandler(window.location.pathname);
        }
    };
})();

// Selbsaufrufende Funktionsdeklaration: (function name(){..})();
(function initRouter() {
    // The "Startpage".
    router.addRoute('', function () {
        presenter.showStartPage();
    });

    router.addRoute('overview', function (url) {
        // Get the index of which blog we want to show and call the appropriate function.
        var bid = url.split('overview/')[1].trim();
        presenter.blogId = bid;
        presenter.showBlogOverview(bid);
    });

    router.addRoute('detail', function (url) {
        var pid = url.split('detail/')[1].trim();
        presenter.showDetailView(presenter.blogId, pid);
    });

    //TODO /edit

    if (window) {
        window.addEventListener('popstate', (event) => {
            router.handleRouting();
        });
        router.handleRouting(); // erstes Aufrufen der Startseite
    }
})();