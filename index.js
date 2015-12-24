/**
	空气阻力公式：
 		F = C × v × v
 		C为阻力系数（物理中为：1 / 2 × 空气阻力系数 × 空气密度 × 迎风面积）
 		v为速度

 	弹力公式：
 		F = C × L
 		C为弹力系数
 		L为拉伸长度

 	加速度公式：
 		A = C × F
 		C为加速度系数（物理中为：1 / 质量）
 */

function Scroll(config){
	this.container = config.container;
	this.target = config.target;

	this.refreshRange();
	this.bindEvent();
}
Scroll.prototype = {
	// 衰减速率（每帧衰减速度的比例）
	rateOfDecay: 0.1,
	// 最小衰减速度
	minRateOfDecay: 1,
	// 最大溢出范围
	maxOverflow: 100,
	// 帧频
	fps: 25,
	// 空气阻力系数
	CAir: 0.02,
	// 基础阻力
	FBase: 10,
	// 加速度系数
	CA: 0.1,
	// 弹力系数
	CSpring: 1,
	bindEvent: function(){
		var target = this.target,
			fps,
			interval,
			rateOfDecay,
			minRateOfDecay,
			maxOverflow,
			minTop,
			maxTop,
			self = this;

		var offsetY,
			top,
			lastTime,
			lastTop,
			nowTime,
			nowTop;

		function moveHandler(e){
			lastTime = nowTime;
			lastTop = nowTop;

			nowTime = +new Date();
			nowTop = e.pageY - offsetY;

			// 超出
			if(top < minTop){
				top += (nowTop - lastTop) * (0.5 - (minTop - top) / maxOverflow);
			}else if(top > maxTop){
				top += (nowTop - lastTop) * (0.5 - (top - maxTop) / maxOverflow);
			}else{
				top += nowTop - lastTop;
			}

			target.style.top = top + "px";
		}

		function upHandler(e){
			document.removeEventListener("mousemove", moveHandler);
			document.removeEventListener("mouseup", upHandler);

			var velocity = ((nowTop - lastTop) / (nowTime - lastTime) * 1000 || 0) / fps | 0;
			var scroll;

			// 弹力
			var FSpring = 0;

			function getFSpring(){
				if(top < minTop){
					return 1 * (minTop - top);
				}else if(top > maxTop){
					return -1 * (top - maxTop);
				}
				return 0;
			}

			FSpring = getFSpring();

			if(top < minTop){
				FSpring = 1 * (minTop - top);
			}else if(top > maxTop){
				FSpring = -1 * (top - maxTop);
			}

			if(velocity === 0 && FSpring !== 0){
				velocity = FSpring * 0.1;
			}

			if(velocity < 0){
				scroll = function(){
					self.scrollHandler = null;
					if(velocity < 0){
						top += velocity;
						//velocity -= Math.min(-minRateOfDecay, velocity * rateOfDecay);
						FSpring = getFSpring();
						var FDrag = Math.max(10, 0.02 * velocity * velocity);
						velocity += (FDrag + FSpring) * 0.1;
						self.scrollHandler = setTimeout(scroll, interval);
					}else if(top < minTop){
						top += velocity;
						velocity = Math.max(1, (minTop - top) * 0.2);
						self.scrollHandler = setTimeout(scroll, interval);
					}else if(velocity > 0){
						//top = minTop;
					}

					target.style.top = top + "px";
				};
			}else{
				scroll = function(){
					self.scrollHandler = null;
					if(velocity > 0){
						top += velocity;
						//velocity -= Math.max(minRateOfDecay, velocity * rateOfDecay);
						FSpring = getFSpring();
						var FDrag = -Math.max(10, 0.02 * velocity * velocity);
						velocity += (FDrag + FSpring) * 0.1;
						self.scrollHandler = setTimeout(scroll, interval);
					}else if(top > maxTop){
						top += velocity;
						velocity = Math.min(-1, (maxTop - top) * 0.2);
						self.scrollHandler = setTimeout(scroll, interval);
					}else if(velocity < 0){
						//top = maxTop;
					}

					target.style.top = top + "px";
				};
			}

			scroll();
		}

		target.addEventListener("mousedown", function(e){
			self.stop();

			fps = self.fps;
			interval = 1000 / fps;
			rateOfDecay = self.rateOfDecay;
			minRateOfDecay = self.minRateOfDecay;
			maxOverflow = self.maxOverflow * 2;
			minTop = self.range[0];
			maxTop = self.range[1];

			top = target.offsetTop;

			lastTime = nowTime = +new Date();
			lastTop = nowTop = top;
			offsetY = e.pageY - top;

			document.addEventListener("mousemove", moveHandler);

			document.addEventListener("mouseup", upHandler);
		});
	},
	refreshRange: function(){
		this.range = [-Math.max(0, this.target.offsetHeight - this.container.offsetHeight), 0];
	},
	stop: function(){
		if(this.scrollHandler){
			clearTimeout(this.scrollHandler);
			this.scrollHandler = null;
		}
	}
};