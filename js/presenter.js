/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";
const presenter = (function () {
    // Private Variablen und Funktionen
    let init = false;
    let blogId = -1;
    let postId = -1;
    let owner = undefined;

    // Initialisiert die allgemeinen Teile der Seite
    function initPage() {
        console.log("Presenter: Aufruf von initPage()");
        
        // Hier werden zunächst nur zu Testzwecken Daten vom Model abgerufen und auf der Konsole ausgegeben 
         
        // Nutzer abfragen und Anzeigenamen als owner setzen
        model.getSelf((result) => {
            owner = result.displayName;
            console.log(`Presenter: Nutzer*in ${owner} hat sich angemeldet.`);
        });

        model.getAllBlogs((blogs) => {
            console.log("--------------- Alle Blogs --------------- ");
            if (!blogs)
                return;
            for (let b of blogs) {
                console.log(b);
            }
            blogId = blogs[0].id
            model.getAllPostsOfBlog(blogId, (posts) => {
                console.log("--------------- Alle Posts des ersten Blogs --------------- ");
                if (!posts)
                    return;
                for (let p of posts) {
                    console.log(p);
                }
                postId = posts[1].id;
                model.getAllCommentsOfPost(blogId, postId, (comments) => {
                    console.log("--------------- Alle Comments des zweiten Post --------------- ");
                    if (!comments)
                        return;
                    for (let c of comments) {
                        console.log(c);
                    }
                });
            });
        });
        
        // Das muss später an geeigneter Stelle in Ihren Code hinein.
        init = true;
        //Falls auf Startseite, navigieren zu Uebersicht
        if (window.location.pathname === "/")
            router.navigateToPage('/blogOverview/' + blogId);
    }
    // Sorgt dafür, dass bei einem nicht-angemeldeten Nutzer nur noch der Name der Anwendung
    // und der Login-Button angezeigt wird.
    function loginPage() {
        console.log("Presenter: Aufruf von loginPage()");
        if(owner!== undefined) console.log(`Presenter: Nutzer*in ${owner} hat sich abgemeldet.`);
        init = false;
        blogId = -1;
        postId = -1;
        owner = undefined;
    }


    //Oeffentliche Methoden
    return {
        // Wird vom Router aufgerufen, wenn die Startseite betreten wird
        showStartPage() {
            console.log("Aufruf von presenter.showStartPage()");
            // Wenn vorher noch nichts angezeigt wurde, d.h. beim Einloggen
            if (model.isLoggedIn()) { // Wenn der Nutzer eingeloggt ist
                initPage();
            }
            if (!model.isLoggedIn()) { // Wenn der Nuzter eingelogged war und sich abgemeldet hat
                //Hier wird die Seite ohne Inhalt angezeigt
                loginPage();
            }
        },

        // Wird vom Router aufgerufen, wenn eine Blog-Übersicht angezeigt werden soll
        showBlogOverview(bid) {
           console.log(`Aufruf von presenter.showBlogOverview(${blogId})`); 
        }
    };
})();
