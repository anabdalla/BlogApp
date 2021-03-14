/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

(function () {

    var GoogleAuth;
    var SCOPE = 'https://www.googleapis.com/auth/blogger';
    function handleClientLoad() {
        // Load the API's client and auth2 modules.
        // Call the initClient function after the modules load.
        gapi.load('client:auth2', initClient);
    }

    function initClient() {
        // Retrieve the discovery document for version 3 of Google Drive API.
        // In practice, your app can retrieve one or more discovery documents.
        var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/blogger/v3/rest';

        // Initialize the gapi.client object, which app uses to make API requests.
        // Get API key and client ID from API Console.
        // 'scope' field specifies space-delimited list of access scopes.
        gapi.client.init({
            'discoveryDocs': [discoveryUrl],
            'clientId': '26901513547-8ae4n8ut9sh5l7839qjsknf4nminls6k.apps.googleusercontent.com',
            //eigene 'clientId': '262642101719-u6gm3h5f2napq4vdlo24c2556thoier3.apps.googleusercontent.com',
            'scope': SCOPE
        }).then(function () {
            GoogleAuth = gapi.auth2.getAuthInstance();

            // Listen for sign-in state changes.
            GoogleAuth.isSignedIn.listen(updateSigninStatus);

            // Handle initial sign-in state. (Determine if user is already signed in.)
            var user = GoogleAuth.currentUser.get();
            setSigninStatus();

            // Call handleAuthClick function when user clicks on
            //      "Sign In/Authorize" button.
            $('#sign-in-or-out-button').click(function () {
                handleAuthClick();
            });
        });
    }

    function handleAuthClick() {
        if (GoogleAuth.isSignedIn.get()) {
            // User is authorized and has clicked 'Sign out' button.
            GoogleAuth.signOut();
        } else {
            // User is not signed in. Start Google auth flow.
            GoogleAuth.signIn();
        }
    }

    function setSigninStatus(isSignedIn) {
        var user = GoogleAuth.currentUser.get();
        var isAuthorized = user.hasGrantedScopes(SCOPE);
        if (isAuthorized) {
            $('#sign-in-or-out-button').html('Abmelden');
            $('#auth-status').html('Angemeldet bei Google');
            console.log("---------setSigninStatus: Angemeldet---------");
            model.setLoggedIn(true);
            router.navigateToPage(window.location.pathname);
        } else {
            $('#sign-in-or-out-button').html('Anmelden');
            $('#auth-status').html('Abgemeldet bei Google');
            console.log("---------setSigninStatus: Abgemeldet---------");
            model.setLoggedIn(false);
            router.navigateToPage('/');
        }
    }

    function updateSigninStatus(isSignedIn) {
        setSigninStatus();
    }

    // After Loading, handleClientLoad is called
    window.addEventListener("load", handleClientLoad);

})();