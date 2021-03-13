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
        console.log("Presenter: Aufruf von initPage()");
        document.getElementById('main_content').innerHTML = "";
        // FOOTER INITIALISIEREN:
        // Nutzer abfragen und an render-Methode des Footers übergeben, Namen als owner speichern
        model.getSelf((result) => {
            owner = result.displayName; // scheint noch nicht zu klappen -> Laufzeitproblem??
            console.log(`Presenter: Nutzer*in ${owner} hat sich angemeldet.`);
            // den einzusetzenden div-Knoten von der render-Methode zurückliefern lassen
            let pageFooter = footer.render(result);
            // Footer befüllen
            replace('footer_content', pageFooter);
        });
        // HEADER INITIALISIEREN:
        // Blogs abfragen und an die render-Methode des Headers übergeben
        model.getAllBlogs((blogs) => {
            // den zuletzt aktualisierten Blog finden (für die BlogInfo)
            let latestChange = blogs[0];
            for (let b of blogs) { // dazu müssen die Blogs verglichen werden
                if (b.lastChange < latestChange.lastChange) { // prüfen, ob Aktualisierung jünger als die des bisher gespeicherten Blogs ist
                    latestChange = b; // wenn ja, den aktuelleren Blog in Variable speichern
                    blogId = b.id;
                }
            }
            // den einzusetzenden div-Knoten von der render-Methode zurückliefern lassen
            let pageHeader = header.render(blogs, latestChange);
            // ausgefüllten Header einsetzen
            replace('header_content', pageHeader);
            // MAIN INITIALISIEREN:
            // BlogOverview des Blogs latestChange in 'main_content' einfügen
            model.getAllPostsOfBlog(latestChange.id, (posts) => {
                let pageMain = blogOverview.render(latestChange, posts);
                replace('main_content', pageMain);
////             //Probe Detailview
//               model.getPost(latestChange.id, posts[0].id, (post) => {
//                    let pageMain = detailView.render(post);
//                    replace('main_content', pageMain);
//                });
                // zur Blogübersicht des Blogs navigieren
                // router.navigateToPage('/overview/${blogId}');
            });


            // Eventhandler setzen
            // bearbeitet die Navigationselemente, die Interaktionen sind in Methoden!
            let head = document.getElementById('header_content');
            head.addEventListener("click", handleClicks);
            let main = document.getElementById('main_content');
            main.addEventListener("click", handleClicks);
            let foot = document.getElementById('footer_content');
            foot.addEventListener("click", handleClicks);
            init = true; // Initialisierung ist erfolgt
        });
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
        // im main-Bereich soll der Anmeldebutton erscheinen
        let page = document.getElementById("abgemeldet").cloneNode(true);
        page.removeAttribute("id");
        replace('main_content', page);
        // die Bereiche header und footer sollen leer sein, auch wenn sie vorher befüllt waren!
        document.getElementById('header_content').innerHTML = "";
        document.getElementById('footer_content').innerHTML = "";
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

    function handleClicks(event) {
        let source = null;
        // behandelte Click-Möglichkeiten: a-Tags, Buttons, Listenelemente
        switch (event.target.tagName) {
            case "A":
                router.handleNavigationEvent(event);
                break;
            case "BUTTON":
                source = event.target;
                break;
            default:
                source = event.target.closest("LI");
                break;
        }
        if (source) {
            let path = source.dataset.path;
            if (path)
                router.navigateToPage(path);
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
            if (!model.isLoggedIn()) {
                loginPage();
            }
        },

        // Wird vom Router aufgerufen, wenn eine Blog-Übersicht angezeigt werden soll
        showBlogOverview(bid) {
            console.log(`Aufruf von presenter.showBlogOverview(Blog ${blogId})`);
            if (!init)
                initPage();  // Fehlervermeidung
            model.getBlog(bid, (blog) => {
                blogId = bid;
                model.getAllPostsOfBlog(blog.id, (posts) => {
                    let page = blogOverview.render(blog, posts);
                    replace('main_content', page);
                });
            });
        },

        showDetailView(bid, pid) {
            console.log(`Aufruf von presenter.showDetailView(Blog ${blogId}, Post ${postId})`);
            if (!init)
                initPage();
            model.getPost(bid, pid, (post) => {
                blogId = bid;
                postId = pid;
                let page = detailView.render(post);
                replace('main_content', page);
            });
                if (!init)
                initPage();  
                model.getPost(bid,pid, (post) => {
                    let page = detailViewC.render(post);
                    page += detailViewP.render(post);
                  model.getAllCommentsOfPost(bid,pid,(comments)=>{
                      page+=CommentViewC.render(comments);
                      replace('main_content', page);
                  });                     
                });
        },

        showPostEditor(bid, pid) {
            console.log(`Aufruf von presenter.showPostEditor(Blog ${blogId}, Post ${postId})`);
        },
        
        // Aktion für Löschen eines Posts
        deletePost(bid, pid) {
            model.deletePost(bid, pid, (removed) => {
                alert(`Der Post wurde gelöscht!`);
                // Bei Löschen auf der Detail-Seite zurück zur Übersicht
                if (detail) {
                    router.navigateToPage("/overview/%bid");
                }
            });
        }
    };
})();