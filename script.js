var raw = [];
var store = [];
PDFJS.getDocument('pdf.pdf').then(function (pdf) {
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
            if (typeof context[val] === 'function') {
                override(context, val, function (original) {
                    return function () {
                        original.apply(this, arguments);
                        raw.push({method: val, data: arguments}); // raw calls without optimization

                        if (store[store.length - 1].method == val) {
                            store[store.length - 1].data.push(arguments);
                        } else {
                            store.push({method: val, data: [arguments]});
                        }
                    }
                });
            } else {
                raw.push({property: val, data: context[val]});
                store.push({property: val, data: context[val]});
            }
        });

        page.render(renderContext).then(function () {
            var myCanvas = document.getElementById('myCanvas');
            var myContext = myCanvas.getContext('2d');

            console.log(store);
            var rawLength = JSON.stringify(raw).length;
            var storeLength = JSON.stringify(store, function(key, val) {
                return val.toFixed ? Number(val.toFixed(3)) : val;
            }).length;
            console.log("Raw length: " + rawLength);
            console.log("Store length: " + storeLength);
            console.log("Less on: " + ((1 - storeLength / rawLength) * 100).toFixed(2) + "%");
            store.forEach(function (item, i, arr) {
                if (i == 0) {
                    myCanvas.height = item.data.height;
                    myCanvas.width = item.data.width;
                } else {
                    if (item.hasOwnProperty("method") && item.method != "fillRect") {
                        item.data.forEach(function (params, j, dataArray) {
                            myContext[item.method].apply(myContext, params);
                        });

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

