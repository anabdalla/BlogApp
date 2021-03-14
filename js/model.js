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
    // -> Aufruf setFormatDates() in Prototypen
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
    Blog.prototype = {
        constructor: Blog,
        setFormatDates(date) {
            //this.shortDate = formatDate(date, false);
            //this.longDate = formatDate(date, true);
        }
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
    Post.prototype = {
        constructor: Post,
        setFormatDates(date) {
            //   this.shortDate = formatDate(date, false);
            //   this.longDate = formatDate(date, true);
        }
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
    Comment.prototype = {
        constructor: Comment,
        setFormatDates(date) {
            //  this.shortDate = formatDate(date, false);
            //  this.longDate = formatDate(date, true);
        }
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
        // Liefert den angemeldeten Nutzer mit allen Infos
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

        // Liefert Array mit allen Blogs des angemeldeten Nutzers 
        getAllBlogs(callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathGetBlogs
            });
            // Execute the API request.
            request.execute((result) => {
                let arrB = [];
                for (let b of result.items)
                    arrB.push(new Blog(b.id, b.name, b.posts.totalItems, b.updated, b.published, b.url));
                callback(arrB);
            });
        },

        // Liefert Array mit dem Blog mit der Blog-Id bid 
        getBlog(bid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid
            });
            // Execute the API request.
            request.execute((result) => {
                let blog = new Blog(result.id, result.name, result.updated, result.published, result.url);
                callback(blog);
            });
        },

        // Liefert Array mit allen Posts zu der  Blog-Id bid
        getAllPostsOfBlog(bid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts'
            });
            request.execute((result) => {
                let arrP = [];   // Array erstellen
                for (let p of result.items) {// Posts einfügen

                    // relevante Attributnamen aus Bloggerdoc auslesen und hier "umwandeln"
                    arrP.push(new Post(p.id, p.blog.id, p.title, p.updated, p.published, p.content, p.replies.totalItems));
                }
                callback(arrP);  // gewünschte Funktion auf Array ausführen
            });
        },

        // Liefert Array mit dem Post mit der Post-Id pid im Blog mit der Blog-Id bid
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

        // Liefert alle Kommentare zu dem Post mit der pid im Blog mit der bid 
        getAllCommentsOfPost(bid, pid, callback) {
            var request = gapi.client.request({
                'method': 'GET',
                'path': pathBlogs + "/" + bid + '/posts/' + pid + "/comments"
            });
            request.execute((result) => {
                if (result[0] !== undefined) {
                    let arr = [];
                    for (let c of result) {
                        arr.push(new Comment(c.id, c.blog.id, c.post.id, c.author, c.updated, c.published, c.content));
                    }
                    callback(arr);
                }
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