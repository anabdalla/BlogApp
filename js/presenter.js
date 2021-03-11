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

    // Initialisiert die allgemeinen Teile der Seite: header und footer
    function initPage() {
        // beim Erstbesuch der Seite werden die Informationen, die auf jeder Seite zu sehen sein sollen, eingesetzt
        // in unserem Fall: alles aus div 'header_angemeldet' im Header und div 'footer_angemeldet' im Footer
        console.log("Presenter: Aufruf von initPage()");
        // FOOTER INITIALISIEREN:
        // Nutzer abfragen und an render-Methode des Footers übergeben, Namen als owner speichern
        model.getSelf((result) => {
            owner = result.displayName; // scheint noch nicht zu klappen
            console.log(`Presenter: Nutzer*in ${owner} hat sich angemeldet.`);
            // den einzusetzenden div-Knoten von der render-Methode zurückliefern lassen
            let pageFooter = footer.render(result);
            // Footer befüllen
            replace('footer_content', pageFooter);
        });

        // HEADER INITIALISIEREN:
        // Blogs abfragen und an die render-Methode des Headers übergeben
        model.getAllBlogs((blogs) => {
            // den einzusetzenden div-Knoten von der render-Methode zurückliefern lassen
            let pageHeader = header.render(blogs);
            // Header befüllen
            replace('header_content', pageHeader);
            
            // MAIN INITIALISIEREN:
            // zu Beginn soll die BlogOverview des zuletzt geänderten Blogs eingefügt werden
            let latestChange = blogs[0]; // den zuletzt aktualisierten Blog finden
            for (let b of blogs) { // dazu müssen die Blogs verglichen werden
                if (b.lastChange < latestChange.lastChange) { // prüfen, ob Aktualisierung jünger als die des bisher gespeicherten Blogs ist
                    latestChange = b; // wenn ja, den aktuelleren Blog in Variable speichern
                }
            }
            // TODO richtiger Aufruf -> BlogOverview des Blogs latestChange in 'main_content' einfügen
        });
        init = true; // Initialisierung ist erfolgt
        
//        // Hier werden zunächst nur zu Testzwecken Daten vom Model abgerufen und auf der Konsole ausgegeben     
//        model.getAllBlogs((blogs) => {
//            console.log("--------------- Alle Blogs --------------- ");
//            if (!blogs)
//                return;
//            for (let b of blogs) {
//                console.log(b);
//            }
//            blogId = blogs[0].id;
//            // -> hierhin verschoben! Das muss später an geeigneter Stelle in Ihren Code hinein.
//            init = true;
//            //Falls auf Startseite, navigieren zu Uebersicht
//            if (window.location.pathname === "/")
//                router.navigateToPage('/blogOverview/' + blogId);
//            model.getAllPostsOfBlog(blogId, (posts) => {
//                console.log("--------------- Alle Posts des ersten Blogs --------------- ");
//                if (!posts)
//                    return;
//                for (let p of posts) {
//                    console.log(p);
//                }
//                postId = posts[1].id;
//                model.getAllCommentsOfPost(blogId, postId, (comments) => {
//                    console.log("--------------- Alle Comments des zweiten Post --------------- ");
//                    if (!comments)
//                        return;
//                    for (let c of comments) {
//                        console.log(c);
//                    }
//                });
//            });
//        });

    }
    // Sorgt dafür, dass bei einem nicht-angemeldeten Nutzer nur noch der Name der Anwendung
    // und der Login-Button angezeigt wird.
    function loginPage() {
        console.log("Presenter: Aufruf von loginPage()");
        if (owner !== undefined)
            console.log(`Presenter: Nutzer*in ${owner} hat sich abgemeldet.`);
        init = false;
        blogId = -1;
        postId = -1;
        owner = undefined;
    }

    function replace(id, element) {
        let main = document.getElementById(id);
        let content = main.firstElementChild;
        if (content)
            content.remove();
        if (element) {
            main.append(element);
        }
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

        // TODO
        // Wird vom Router aufgerufen, wenn eine Blog-Übersicht angezeigt werden soll
        showBlogOverview(bid) {
            console.log(`Aufruf von presenter.showBlogOverview(${blogId})`);
        },

        showDetailView(bid, pid) {
            console.log(`Aufruf von presenter.showDetailView(${blogId}, ${postId})`);
        },

        showEditor(bid, pid) {
            console.log(`Aufruf von presenter.showEditor(${blogId}, ${postId})`);
        }
    };
})();
