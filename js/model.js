/* 
 * 
 /*
 * Adresse über die man auf die Webschnittstelle meines Blogs zugreifen kann:
 */
"use strict";
const model = (function () {
    // Private Variablen
    let loggedIn = false;

    let pathGetBlogs = 'blogger/v3/users/self/blogs';
    let pathBlogs = 'blogger/v3/blogs';

    // Private Funktionen 

    // Formatiert den Datum-String in date in zwei mögliche Datum-Strings: 
    // long = false: 24.10.2018
    // long = true: Mittwoch, 24. Oktober 2018, 12:21
    function formatDate(date, long) {
        let newDate;
        var langfassung = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: 'numeric'};
        var kurzfassung = {year: 'numeric', month: '2-digit', day: '2-digit'};
        if (long === false) { //Kurzfassung
            newDate = date.toLocaleDateString('de-DE', kurzfassung);
        }
        if (long === true) { //Langfassung
            newDate = date.toLocaleDateString('de-DE', langfassung);
        }
        return newDate;
    }

    // Konstruktoren für Daten-Objekte Blog, Post, Comment
    function Blog(id, name, count, change, release, URL) {
        this.id = id;
        this.blogName = name;
        this.postCount = count;
        this.lastChange = change;
        this.releaseDate = release;
        this.URL = URL;
    }

    function Post(id, bid, title, change, release, content, comments) {
        this.id = id;
        this.bid = bid;
        this.postName = title;
        this.lastChange = change;
        this.releaseDate = release;
        this.postContent = content;
        this.commentCount = comments;
    }

    function Comment(id, bid, pid, name, change, release, content) {
        this.id = id;
        this.bid = bid;
        this.pid = pid;
        this.writer = name;
        this.lastChange = change;
        this.releaseDate = release;
        this.commentContent = content;
    }

    // Oeffentliche Methoden
    return {
        // Setter für loggedIn
        setLoggedIn(b) {
            loggedIn = b;
        },
        // Getter für loggedIn
        isLoggedIn() {
            return loggedIn;
        },
        // Liefert den angemeldeten Nutzer mit allen Infos Nssra
        getSelf(callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': 'blogger/v3/users/self'
            });
            // Execute the API request.
            request.execute((result) => {
                callback(result);
            });
        },

        // Liefert alle Blogs des angemeldeten Nutzers Nssra
        getAllBlogs(callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathGetBlogs
            });
            // Execute the API request.
            request.execute((result) => {


                let neu = new Blog(result.items[0].id, result.items[0].name, result.items[0].posts.totalItems, result.items[0].updated, result.items[0].published, result.items[0].url);


                // callback(Object.entries(neu)); // TODO
                callback(result.items);
            });
        },

        // Liefert den Blog mit der Blog-Id bid Nssra
        getBlog(bid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid
            });
            // Execute the API request.
            request.execute((result) => {
                let neu = new Blog(result.items[0].id, result.items[0].name, result.items[0].posts.totalItems, result.items[0].updated, result.items[0].published, result.items[0].url);
                callback(neu);
            });
        },

        // Liefert alle Posts zu der  Blog-Id bid Toni
        getAllPostsOfBlog(bid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts'
            });

            request.execute((result) => {
                let arr = [];   // Array erstellen
                for (let p of result.items) { // Posts einfügen
                    if (p !== undefined) {
                        // relevante Attributnamen aus Bloggerdoc auslesen und hier "umwandeln"
                        arr.push(new Post(p.id, p.blog.id, p.title, p.updated, p.published, p.content, p.replies.totalItems));
                    }
                }
                callback(arr);  // gewünschte Funktion auf Array ausführen
            });
        },

        // Liefert den Post mit der Post-Id pid im Blog mit der Blog-Id bid Toni
        getPost(bid, pid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid
            });

            request.execute((result) => {
                let post = new Post(result.id, result.blog.id, result.title, result.updated, result.published, result.content, result.replies.totalItems);
                callback(post);
            });
        },

        // Liefert alle Kommentare zu dem Post mit der Post-Id pid Toni
        // im Blog mit der Blog-Id bid 
        getAllCommentsOfPost(bid, pid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid + "/comments"
            });

            request.execute((result) => {
                let arr = [];
                for (let c of result) {
                    arr.push(new Comment(c.id, c.blog.id, c.post.id, c.author, c.updated, c.published, c.content));
                }
                callback(arr);
            });
        },

        // Löscht den Kommentar mit der Id cid zu Post mit der Post-Id pid 
        // im Blog mit der Blog-Id bid 
        // Callback wird ohne result aufgerufen
        deleteComment(bid, pid, cid, callback) {
            var path = pathBlogs + "/" + bid + '/posts/' + pid + "/comments/" + cid;
            console.log(path);
            var request = gapi.client.request({
                'method': 'DELETE',
                'path': path
            });

            request.execute(callback);
        },

        // Fügt dem Blog mit der Blog-Id bid einen neuen Post 
        // mit title und content hinzu, Callback wird mit neuem Post aufgerufen
        addNewPost(bid, title, content, callback) {
            var body = {
                kind: "blogger#post",
                title: title,
                blog: {
                    id: bid
                },
                content: content
            };

            var request = gapi.client.request({
                'method': 'POST',
                'path': pathBlogs + "/" + bid + '/posts',
                'body': body
            });

            request.execute(callback);
        },

        // Aktualisiert title und content im geänderten Post 
        // mit der Post-Id pid im Blog mit der Blog-Id bid
        updatePost(bid, pid, title, content, callback) {
            var body = {
                kind: "blogger#post",
                title: title,
                id: pid,
                blog: {
                    id: bid
                },
                content: content
            };

            var request = gapi.client.request({
                'method': 'PUT',
                'path': pathBlogs + "/" + bid + '/posts/' + pid,
                'body': body
            });

            request.execute(callback);
        },

        // Löscht den Post mit der Post-Id pid im Blog mit der Blog-Id bid, 
        // Callback wird ohne result aufgerufen
        deletePost(bid, pid, callback) {
            var path = pathBlogs + "/" + bid + '/posts/' + pid;
            console.log(path);
            var request = gapi.client.request({
                'method': 'DELETE',
                'path': path
            });

            request.execute(callback);
        }
    };
})();