jQuery.extend({
	isEventSupported : function isEventSupported(eventName, element) {
		var TAGNAMES = {
			'select':'input','change':'input',
			'submit':'form','reset':'form',
			'error':'img','load':'img','abort':'img'
		}
		element = element || document.createElement(TAGNAMES[eventName] || 'div');
		eventName = 'on' + eventName;	
		var isSupported = (eventName in element);
		if (!isSupported) {		 
		  if (!element.setAttribute) {
			element = document.createElement('div');
		  }
		  if (element.setAttribute && element.removeAttribute) {
			element.setAttribute(eventName, '');
			isSupported = typeof element[eventName] == 'function';			
			if (typeof element[eventName] != 'undefined') {
			  element[eventName] = void 0;
			}
			element.removeAttribute(eventName);
		  }
		}
		element = null;
		return isSupported;
	},
	drawBrush : function(from, to, context){
		context.beginPath();
		context.moveTo(from.x, from.y);		
		context.lineTo(to.x, to.y);
		context.closePath();
		context.stroke();
	},
	setLineWidth : function(lineWidth, context){
		context.lineWidth = lineWidth;
	},
	setPenColor : function(color, context){
		context.strokeStyle = color;
		context.fillStyle = color;
	},
	savePosition : function(id, type, x, y){
		id.val(id.val() + type + ',' + x + ',' + y + ';');
	}	
});
jQuery.fn.extend({
    Painter: function (options) {
        var params = {
            Position: { x: 90, y: 10 },
            LineWidth: 1,
            Color: "#000000",
            BgCanvasID: "bg_canvas",
            HidCtrlID: "",
            StartSign: "0",
            EndSign: "1"
        };
        $.extend(params, options);

        var $id = $(this).get(0);

        var coordinate = "";
        var IsTouch = false;
        var context = $("#" + params.BgCanvasID).get(0).getContext('2d');
		//var context = $id.getContext('2d');
        var start = 0;
        var current = 0;
        var StartSign = params.StartSign;
        var EndSign = params.EndSign;
        var platform = navigator.platform.toLowerCase();

        if (params.HidCtrlID.length <= 0) {
            $(this).before("<input id='_hidcoordinate' type='hidden' value=''></input>");
            coordinate = $("#_hidcoordinate");
        } else {
            coordinate = $("#" + params.HidCtrlID);
        }


        $.setLineWidth(params.LineWidth, context);
        $.setPenColor(params.Color, context);

        var getCanvasMousePos = function (e) {
			var pos;
            if (e.clientX && e.clientY) {
                pos = { x: e.clientX - params.Position.x, y: e.clientY - params.Position.y };
            }
            else {
                pos = { x: e.touches[0].pageX - params.Position.x, y: e.touches[0].pageY - params.Position.y };
            }
			$("#showpos").html(pos.x + " - " + pos.y);
			return pos;
        };

        var ipadTouchStart = function (e) {			
            e.preventDefault();
            IsTouch = true;
            start = getCanvasMousePos(e);
            context.lineJoin = "round";
            $.drawBrush(start, start, context);
            $.savePosition(coordinate, StartSign, start.x, start.y);
            start = current;
        };

        var ipadTouchMove = function (e) {			
            e.preventDefault();
            current = getCanvasMousePos(e);
            if (!IsTouch)
                return;
            $.drawBrush(start, current, context);
            $.savePosition(coordinate, EndSign, current.x, current.y);
            start = current;
        };

        var ipadTouchEnd = function (e) {
            IsTouch = false;
            start = 0;
            current = 0;
        };

        var ipadTouchCancel = function (e) {
            IsTouch = false;
            start = 0;
            current = 0;
        };

        if (platform.indexOf('win') >= 0 && !$.isEventSupported("touchstart")) {			
            $(this).mouseup(ipadTouchEnd);
            $(this).mousedown(ipadTouchStart);
            $(this).mousemove(ipadTouchMove);
            $(this).mouseout(ipadTouchEnd);
        } else if ((platform.indexOf('linux') >= 0 || platform.indexOf('android') >= 0 || platform.indexOf('ipad') >= 0 || platform.indexOf('iphone') >= 0) && $.isEventSupported("touchstart")) {
            $id.addEventListener("touchstart", ipadTouchStart, false);
            $id.addEventListener("touchmove", ipadTouchMove, false);
            $id.addEventListener("touchend", ipadTouchEnd, false);
            $id.addEventListener("touchcancel", ipadTouchCancel, false);
        }
    },
    ClearCanvas: function (options) {
        var params = {
            BgCanvasID: 'bg_canvas',
            HidCtrlID: "",
            IsClearHidCtrPos: false
        };
        $.extend(params, options);

        var context = $("#" + params.BgCanvasID).get(0).getContext("2d");
        var height = $(this).height();
        var width = $(this).width();
        if (params.IsClearHidCtrPos) {
            if (params.HidCtrlID.length <= 0) {
                $('#_hidcoordinate').val("");
            } else {
                $("#" + params.HidCtrlID).val("");
            }
        }
        context.beginPath();
        context.clearRect(0, 0, width, height);
        context.closePath();
    },
    GetPosition: function (id) {
        if (id == null || id == undefined || id.length <= 0) {
            return $('#_hidcoordinate').val();
        } else {
            return $("#" + id).val();
        }
    },
    SetPosition: function (options) {
        var params = {
            Position: "",
            BgCanvasID: "bg_canvas",
            StartSign: "0",
            EndSign: "1"
        };

        $.extend(params, options);

        var Position = "";
        var StartSign = params.StartSign;
        var EndSign = params.EndSign;

        if (params.Position.length <= 0) {
            Position = $('#_hidcoordinate').val()
        } else {
            Position = params.Position;
        }

        var list = Position.substring(0, Position.lastIndexOf(';'));

        var ArrPos = list.split(';');
        var start = { x: -1, y: -1 };

        $.each(ArrPos, function (m, n) {
            var pos = n.split(',');

            if (pos[0] == StartSign) {
                start = { x: pos[1], y: pos[2] };
                $.drawBrush(start, start, $('#' + params.BgCanvasID).get(0).getContext("2d"));
            } else {
                end = { x: pos[1], y: pos[2] };
                $.drawBrush(start, end, $('#' + params.BgCanvasID).get(0).getContext("2d"));
                start = end;
            }
        });
    }
});