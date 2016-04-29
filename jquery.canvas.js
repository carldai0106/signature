jQuery.fn.extend({
	IEPainter : function(){		
		/*var params = {
				position : {x : 90, y : 10}
			};
		  
		var IsPainter = false;		
		var $this = $(this);
		var $id = $(this).get(0);
		var context = $("#canvas2").get(0).getContext('2d');
		var start = 0;
		var current = 0;
		var color = "#000000";
		
		var getCanvasMousePos = function(e) {
			//return { x: e.clientX - params.position.x, y: e.clientY - params.position.y };
			 return { x: e.touches[0].pageX - params.position.x, y: e.touches[0].pageY - params.position.y };
		};
		
		var drawBrush = function(pntFrom, pntTo) {
			context.lineWidth = 1;
			context.fillStyle = color;
			context.strokeStyle = color;
			
			context.beginPath();
			context.moveTo(pntFrom.x, pntFrom.y);
			context.lineTo(pntTo.x, pntTo.y);	
			$("#record").html(pntTo.x + ',' + pntTo.y);		
			context.closePath();
			context.stroke();
		};
		
		var ipadTouchStart = function(e){
			e.preventDefault();
			IsPainter = true;
			start = getCanvasMousePos(e);
			context.lineJoin = "round";
			drawBrush(start, start);
			start = current;
		};
		
		var ipadTouchMove =  function(e){			
			e.preventDefault();			
			current = getCanvasMousePos(e);
			if(!IsPainter)
				return;			
			drawBrush(start, current);
			start = current;
		};
		
		var ipadTouchEnd =  function(e){			
			IsPainter = false;	
			start = 0;
			current = 0;
		}*/
		
		/*$this.mouseup(touchend);		
		$this.mousedown(touchstart);		
		$this.mousemove(touchmove);		
		$this.mouseout(touchend);*/
		//var $id = $(this).get(0);
		//var $record = $("#record").get(0);
		var $id = document.getElementById("canvas");
		var $record = document.getElementById("record");
		
		var ipadTouchStart = function(e){
			e.preventDefault();
			$record.innerHTML = 'start1';
		};
		
		var ipadTouchMove = function(e){
			e.preventDefault();
			$record.innerHTML = 'move1';
		};
		
		var ipadTouchEnd = function(e){
			$record.innerHTML = 'end1';
		};
		
		$id.addEventListener("touchstart", ipadTouchStart, false);
		$id.addEventListener("touchmove", ipadTouchMove, false);
		$id.addEventListener("touchend", ipadTouchEnd, false);

	},			
	Painter : function(options){	
		var native = {
			canvasInterface: "",
			contextI: "",
			context:"",
			canvasWidth: 0,
			canvasHeight: 0,
			startPos: {x:-1,y:-1},
			curPos: {x:-1,y:-1},
			drawActions: null,
			cpMouseDownState: false,
			mouseMoveTrigger : function(){}
		};		
		
		var params = {
			position : {x : 90, y : 10},
			drawColor : "#000000",
			curDrawAction : 0		
		};
		
		$.extend(params, options);
				
		native.canvasInterface = $(this).get(0);
		native.canvasHeight = $(this).height(); 
		native.canvasWidth = $(this).width();
		native.contextI = native.canvasInterface.getContext("2d");		
		$(this).before("<div id='_hidcoordinate' style='display:'></div>");		
		var coordinate = $('#_hidcoordinate');			

		if(!$.browser.msie){			
			$(this).before("<canvas id=\"canvasInterface\" width=\""+ native.canvasWidth +"\" height=\""+ native.canvasHeight +"\"></canvas>");	
			native.context = $("#canvasInterface").get(0).getContext("2d");
		}			
		
		var getCanvasMousePos = function(e) {
			return { x: e.clientX - params.position.x, y: e.clientY - params.position.y };
		};
		
		var setColor = function(color) {
			native.contextI.fillStyle = color;
			native.contextI.strokeStyle = color;
		};
		
		var drawBrush = function(pntFrom, pntTo, context) {
			context.beginPath();
			context.moveTo(pntFrom.x, pntFrom.y);
			context.lineTo(pntTo.x, pntTo.y);
			context.stroke();
			context.closePath();
		};
		
		var drawPencil = function(pntFrom, pntTo, context) {
			context.save();
			context.beginPath();
			context.lineCap = "round";
			context.moveTo(pntFrom.x,pntFrom.y);
			context.lineTo(pntTo.x,pntTo.y);
			context.stroke();
			context.closePath();
			context.restore();
		};
		
		var drawLine = function(pntFrom, pntTo, context) {
			context.beginPath();
			context.moveTo(pntFrom.x,pntFrom.y);
			context.lineTo(pntTo.x,pntTo.y);
			context.stroke();
			context.closePath();
		};
		
		var drawRectangle = function(pntFrom, pntTo, context) {
			context.beginPath();
			context.fillRect(pntFrom.x, pntFrom.y, pntTo.x - pntFrom.x, pntTo.y - pntFrom.y);
			context.closePath();
		};
		
		var drawCircle = function (pntFrom, pntTo, context) {
			var centerX = Math.max(pntFrom.x,pntTo.x) - Math.abs(pntFrom.x - pntTo.x)/2;
			var centerY = Math.max(pntFrom.y,pntTo.y) - Math.abs(pntFrom.y - pntTo.y)/2;
			context.beginPath();
			var distance = Math.sqrt(Math.pow(pntFrom.x - pntTo.x,2) + Math.pow(pntFrom.y - pntTo.y,2));
			context.arc(centerX, centerY, distance/2,0,Math.PI*2 ,true);
			context.fill();
			context.closePath();
		};
			
		var cpMouseMove = function(e) {		
			setColor(params.drawColor);
			native.curPos = getCanvasMousePos(e);
			
			var pos1 = native.curPos.x + ',' + native.curPos.y + ';';
			var srcpos = coordinate.html();	
			//var str2 = pos1 + srcpos;				
			coordinate.html(srcpos + pos1);
			
			switch(params.curDrawAction)
			{
				case 0:
					drawBrush(native.startPos, native.curPos, native.contextI);
					native.startPos = native.curPos;
					break;
				case 1:
					drawPencil(native.startPos, native.curPos, native.contextI);
					native.startPos = native.curPos;
					break;
				case 2:
					native.contextI.clearRect(0,0,400,400);
					drawLine(native.startPos, native.curPos, native.contextI);
					drawLine(native.startPos, native.curPos, native.context);
					break;
				case 3:
					native.contextI.clearRect(0,0,400,400);					
					drawRectangle(native.startPos, native.curPos, native.contextI);
					drawRectangle(native.startPos, native.curPos, native.context);
					break;
				case 4:
					native.contextI.clearRect(0,0,400,400);
					drawCircle(native.startPos, native.curPos, native.contextI);
					drawCircle(native.startPos, native.curPos, native.context);
					break;
			}			
			native.cpMouseDownState = true;
		};
		
		var clearInterface = function() {
			native.contextI.beginPath();
			native.contextI.clearRect(0, 0 ,native.canvasWidth, native.canvasHeight);
			native.contextI.closePath();
		};
		
		var mouseDownActionPerformed = function(e) {		
			native.startPos = getCanvasMousePos(e);
			native.contextI.lineJoin = "round";
			native.mouseMoveTrigger = function(e) {
				cpMouseMove(e);
			};
		};
		
		var mouseUpActionPerformed = function(e) {	
			var pos = coordinate.html();				
			coordinate.html(pos + '|');
			
			if(!native.cpMouseDownState) return;
			
			native.curPos =  getCanvasMousePos(e);
			if(params.curDrawAction > 1) {
				setColor(params.drawColor);
				native.drawActions[params.curDrawAction](native.startPos, native.curPos, native.contextI, false);
				clearInterface();
			}
			native.mouseMoveTrigger = new Function();
			native.cpMouseDownState = false;
		};
		
		var mouseMoveActionPerformed = function(e) {
			native.mouseMoveTrigger(e);
		};
		
		var initMouseListeners = function(){
			this.mouseMoveTrigger = new Function();
			if(document.all) {
				native.canvasInterface.attachEvent("onmousedown", mouseDownActionPerformed);
				native.canvasInterface.attachEvent("onmousemove", mouseMoveActionPerformed);
				native.canvasInterface.attachEvent("onmouseup", mouseUpActionPerformed);
				native.canvasInterface.attachEvent("onmouseout", mouseUpActionPerformed);
			} else {
				native.canvasInterface.addEventListener("mousedown", mouseDownActionPerformed, false);
				native.canvasInterface.addEventListener("mousemove", mouseMoveActionPerformed, false);
				native.canvasInterface.addEventListener("mouseup", mouseUpActionPerformed, false);
				native.canvasInterface.addEventListener("mouseout", mouseUpActionPerformed, false);
			}
		};	
		
		native.drawActions = [drawBrush, drawPencil, drawLine, drawRectangle, drawCircle, clearInterface];
		initMouseListeners();		
	},
	ClearCanvas : function(){
		var native = {
			contextI : "",
			context : "",
			canvasHeight : 0,
			canvasWidth : 0			
		};
		
		native.contextI = $(this).get(0).getContext("2d");	
		native.context = $("#canvasInterface").get(0).getContext("2d");
		native.canvasHeight = $(this).height(); 
		native.canvasWidth = $(this).width();
		
		native.contextI.beginPath();
		native.contextI.clearRect(0, 0 ,native.canvasWidth, native.canvasHeight);
		native.contextI.closePath();
		
		native.context.beginPath();
		native.context.clearRect(0, 0 ,native.canvasWidth, native.canvasHeight);
		native.context.closePath();
	},
	GetCoordinate : function(){
		return $('#_hidcoordinate').html();
	},
	SetCorrdinate : function(val){		
		if(val == undefined || val.length <= 0)		
		   val = $('#_hidcoordinate').html(); 
		   
		var drawBrush = function(pntFrom, pntTo, context) {
			context.beginPath();
			context.moveTo(pntFrom.x, pntFrom.y);
			context.lineTo(pntTo.x, pntTo.y);
			context.stroke();
			context.closePath();
		};
				
		var list = val.split('|');
		var len = list.length;
		for(var j=0 ; j < len; j++)
		{	
			if(list[j].length > 0){								
				var poslist = list[j].substring(0, list[j].lastIndexOf(';'));
				var pos = poslist.split(';');
				var items = pos.length;
				var start = { x : - 1, y : - 1};
				
				for(var i=0; i<items; i++)
				{
					var arr = pos[i].split(',');
					var x1 = arr[0];
					var y1 = arr[1];
					var end = {x: x1,y: y1};				
					if (i == 0){
						start = end;
					}	
													
					drawBrush( start, end,  $(this).get(0).getContext("2d"));
					start = end;
				}
			}
		}
	}		
});