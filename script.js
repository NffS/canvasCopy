

var store = [];
PDFJS.getDocument('compressed.tracemonkey-pldi-09.pdf').then(function (pdf) {
    pdf.getPage(1).then(function (page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        var canvas = document.getElementById('the-canvas');
        var context = canvas.getContext('2d');
        store.push({method: "viewport", data: viewport});

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        function override(storeect, methodName, callback) {
            storeect[methodName] = callback(storeect[methodName])
        }

        Object.getOwnPropertyNames(context.__proto__).forEach(function (val, idx, array) {
            if (typeof context[val] === 'function')
                override(context, val, function (original) {
                    return function () {
                        original.apply(this, arguments);
                        store.push({method: val, data: arguments});
                    }
                });
            store.push({property: val, data: context[val]});
        });

        page.render(renderContext).then(function () {
            var myCanvas = document.getElementById('myCanvas');
            var myContext = myCanvas.getContext('2d');
            console.log(store);
            store.forEach(function (item, i, arr) {
                if (i == 0) {
                    myCanvas.height = item.data.height;
                    myCanvas.width = item.data.width;
                } else {
                    if (item.hasOwnProperty("method") && item.method != "fillRect") {
                        myContext[item.method].apply(myContext, item.data);
                    } else if (item.hasOwnProperty("property")) {
                        myContext[item.property] = item.data;
                    }
                }
            });


            //version 2
            function deserialize(data, mcanvas) {
                console.log(data);
                var img = new Image();
                img.src = data;
                img.onload = function () {
                    mcanvas.width = img.width;
                    mcanvas.height = img.height;
                    mcanvas.getContext("2d").drawImage(img, 0, 0);
                };
            }
            var canvas = document.getElementById('the-canvas');
            var context = canvas.getContext('2d');
            var data = canvas.toDataURL();
            //deserialize(data, myCanvas);
        });
    });
});

