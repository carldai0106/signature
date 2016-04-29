jQuery.extend({
    isEventSupported: function (eventName, element) {
        var tagnames = {
            'select': "input",
            'change': "input",
            'submit': "form",
            'reset': "form",
            'error': "img",
            'load': "img",
            'abort': "img"
        }
        element = element || document.createElement(tagnames[eventName] || "div");
        eventName = "on" + eventName;
        var isSupported = (eventName in element);
        if (!isSupported) {
            if (!element.setAttribute) {
                element = document.createElement("div");
            }
            if (element.setAttribute && element.removeAttribute) {
                element.setAttribute(eventName, "");
                isSupported = typeof element[eventName] == "function";
                if (typeof element[eventName] != "undefined") {
                    element[eventName] = void 0;
                }
                element.removeAttribute(eventName);
            }
        }
        element = null;
        return isSupported;
    },
    drawBrush: function (from, to, context) {
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.closePath();
        context.stroke();
    },
    setLineWidth: function (lineWidth, context) {
        context.lineWidth = lineWidth;
    },
    setPenColor: function (color, context) {
        context.strokeStyle = color;
        context.fillStyle = color;
    },
    savePosition: function (id, type, x, y) {
        id.val(id.val() + type + "," + x + "," + y + ";");
    }
});
jQuery.fn.extend({
    painter: function (options) {
        var params = {
            width: 400,
            height: 400,
            enableHidden: false,
            position: {
                x: 0,
                y: 0
            },
            lineWidth: 1,
            lineColor: "#000000",
            hiddenId: "",
            beginSymbol: "B",
            endSymbol: "E",
            afterSigned: null
        };

        $.extend(params, options);

        return this.each(function () {
            var self = $(this);

            var $id = self.attr("id");
            var htmlObject = self.get(0);

            htmlObject.width = params.width;
            htmlObject.height = params.height;

            var coordinate;
            var isTouch = false;
            var context = htmlObject.getContext("2d");


            var start = 0;
            var current = 0;
            var startSign = params.beginSymbol;
            var endSign = params.endSymbol;

            var platform = navigator.platform.toLowerCase();
            var isWinNoTouchStart = (platform.indexOf("win") >= 0 && !$.isEventSupported("touchstart"));
            var isMobileHasTouchStart = ((platform.indexOf("linux") >= 0 || platform.indexOf("android") >= 0 || platform.indexOf("ipad") >= 0 || platform.indexOf("iphone") >= 0) && $.isEventSupported("touchstart"));

            if ($.trim(params.hiddenId) == "") {
                var $hidId = "hidcoordinate_" + $id;
                $(this).before("<input id='" + $hidId + "'  type='hidden' value='' />");
                coordinate = $("#" + $hidId);
            } else {
                coordinate = $("#" + params.hiddenId);
            }

            $.setLineWidth(params.lineWidth, context);
            $.setPenColor(params.Color, context);

            //是否已经初始化修复,防止每次触发事件都初始化
            var fixedInit = false;
            var getCanvasMousePos = function (e) {
                if (!fixedInit) {
                    //初始化修复当前canvas位置
                    params.position.x = self.offset().left;
                    params.position.y = self.offset().top;
                    fixedInit = true;
                }
                var pos;
                if (e.clientX && e.clientY) {
                    pos = {
                        x: e.clientX - params.position.x + $(document).scrollLeft(),
                        y: e.clientY - params.position.y + $(document).scrollTop()
                    };
                } else {
                    pos = {
                        x: e.touches[0].pageX - params.position.x + $(document).scrollLeft(),
                        y: e.touches[0].pageY - params.position.y + $(document).scrollTop()
                    };
                }
                return pos;
            };

            $(window).resize(function () {
                fixedInit = false;
            });

            var addEvents = function () {
                if (isWinNoTouchStart) {
                    self.on('mouseup', ipadTouchEnd);
                    self.on('mousemove', ipadTouchMove);
                    self.on('mouseout', ipadTouchEnd);
                } else if (isMobileHasTouchStart) {
                    $id.addEventListener("touchmove", ipadTouchMove, false);
                    $id.addEventListener("touchend", ipadTouchEnd, false);
                    $id.addEventListener("touchcancel", ipadTouchCancel, false);
                }
            };

            var removeEvents = function () {
                if (isWinNoTouchStart) {
                    self.off('mouseup', ipadTouchEnd);
                    self.off('mousemove', ipadTouchMove);
                    self.off('mouseout', ipadTouchEnd);
                } else if (isMobileHasTouchStart) {
                    $id.removeEventListener("touchmove", ipadTouchMove, false);
                    $id.removeEventListener("touchend", ipadTouchEnd, false);
                    $id.removeEventListener("touchcancel", ipadTouchCancel, false);
                }
            };

            var ipadTouchStart = function (e) {
                e.preventDefault();
                e.stopPropagation();

                console.log('ipadTouchStart');

                isTouch = true;
                start = getCanvasMousePos(e);
                context.lineJoin = "round";

                $.drawBrush(start, start, context);
                if (params.enableHidden) {
                    $.savePosition(coordinate, startSign, start.x, start.y);
                }
                start = current;
            };

            var ipadTouchMove = function (e) {
                e.preventDefault();
                e.stopPropagation();

                console.log('ipadTouchMove');

                current = getCanvasMousePos(e);

                if (!isTouch)
                    return;
                $.drawBrush(start, current, context);
                if (params.enableHidden) {
                    $.savePosition(coordinate, endSign, current.x, current.y);
                }
                start = current;
            };

            var ipadTouchEnd = function (e) {
                isTouch = false;
                start = 0;
                current = 0;
                if (params.afterSigned != null && typeof params.afterSigned == "function") {
                    params.afterSigned();
                }
            };

            var ipadTouchCancel = function (e) {
                isTouch = false;
                start = 0;
                current = 0;
            };

            if (isWinNoTouchStart) {
                self.on('mousedown', ipadTouchStart);
                self.on('mousemove', ipadTouchMove);
                self.on('mouseup', ipadTouchEnd);   
                self.on('mouseout', ipadTouchEnd);
            } else if (isMobileHasTouchStart) {
                htmlObject.addEventListener("touchstart", ipadTouchStart, false);
                htmlObject.addEventListener("touchmove", ipadTouchMove, false);
                htmlObject.addEventListener("touchend", ipadTouchEnd, false);
                htmlObject.addEventListener("touchcancel", ipadTouchEnd, false);
            }
        });
    },
    isBlankCanvas: function () {
        var canvas = $(this).get(0);
        var blank = document.createElement("canvas");
        blank.width = canvas.width;
        blank.height = canvas.height;

        return canvas.toDataURL() == blank.toDataURL();
    },
    base64ToCanvas: function (data, targetWidth, targetHeight) {

        if (data == undefined || $.trim(data) == "")
            return;

        var image = new Image();
        image.src = data;
        var context = $(this).get(0).getContext("2d");

        if (targetWidth == undefined || targetHeight == undefined) {
            targetWidth = parseFloat($(this).width()) == 0 ? parseFloat($(this).attr("width")) : $(this).width();
            targetHeight = parseFloat($(this).height()) == 0 ? parseFloat($(this).attr("height")) : $(this).height();

            var width = image.width;
            var height = image.height;
            var x = 0,
			y = 0;

            if (width < targetWidth) {
                x = (targetWidth - width) / 2;
            }

            if (height < targetHeight) {
                y = (targetHeight - height) / 2;
            }
            try {
                context.drawImage(image, x, y);
            } catch (ex) {
                console.log(ex);
            }
            return;
        }

        //等比例缩放
        var hopeWidth = targetWidth;
        var hopeHeight = targetHeight;

        var width = 0;
        var height = 0;

        var oWidth = image.width;
        var oHeight = image.height;

        if (oWidth > hopeWidth) {
            height = oHeight * hopeWidth / oWidth;
            if (height > hopeHeight) {
                height = hopeHeight;
                width = oWidth * hopeHeight / oHeight;
            }

            if (width == 0)
                width = hopeWidth;
        } else if (oHeight > hopeHeight) {
            width = oWidth * hopeHeight / oHeight;
            if (width > hopeWidth) {
                width = hopeWidth;
                height = oHeight * hopeWidth / oWidth;
            }
            if (height == 0)
                height = hopeHeight;
        } else {
            height = oHeight;
            width = oWidth;
        }

        var x = 0,
			y = 0;
        if (width < targetWidth) {
            x = (targetWidth - width) / 2;
        }

        if (height < targetHeight) {
            y = (targetHeight - height) / 2;
        }
        try {
            context.drawImage(image, x, y, width, height);
        } catch (ex) {
            console.log(ex);
        }
    },
    canvasToBase64: function () {
        var source = $(this).get(0).toDataURL("image/png");
        return source;
    },
    clearCanvas: function (options) {
        var params = {
            hiddenId: "",
            isClearPosition: false
        };

        $.extend(params, options);
        var self = $(this);
        var $id = self.attr("id");
        var context = self.get(0).getContext("2d");
        var height = $(this).height();
        var width = $(this).width();
        if (params.isClearPosition) {
            if (params.hiddenId.length <= 0) {
                $("#hidcoordinate_" + $id).val("");
            } else {
                $("#" + params.hiddenId).val("");
            }
        }
        context.beginPath();
        context.clearRect(0, 0, width, height);
        context.closePath();
    },
    getPosition: function (id) {
        var $id = $(this).attr("id");
        if (id == undefined || id.length <= 0) {
            return $("#hidcoordinate_" + $id).val();
        } else {
            return $("#" + id).val();
        }
    },
    setPosition: function (options) {
        var params = {
            position: "",
            beginSymbol: "B",
            endSymbol: "E"
        };

        $.extend(params, options);

        var self = $(this);
        var $id = $(this).attr("id");
        var position = "";
        var startSign = params.beginSymbol;
        var endSign = params.endSymbol;

        if ($.trim(params.position) == "") {
            position = $("#hidcoordinate_" + $id).val();
        } else {
            position = params.position;
        }

        var list = position.substring(0, position.lastIndexOf(";"));

        var arrPos = list.split(";");
        var start = {
            x: -1,
            y: -1
        };
        var context = self.get(0).getContext("2d");
        $.each(arrPos, function (m, n) {
            var pos = n.split(",");

            if (pos[0] == startSign) {
                start = {
                    x: pos[1],
                    y: pos[2]
                };
                $.drawBrush(start, start, context);
            } else {
                var end = {
                    x: pos[1],
                    y: pos[2]
                };
                $.drawBrush(start, end, context);
                start = end;
            }
        });
    }
});