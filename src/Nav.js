/** DINDER! NAVIGATION BAR
 *
 *		Expands, collapses etc
 *
 * @author		David "oodavid" King
 * @copyright	Copyright (c) 2014 +
 */
	import device;
	import animate;
	import ui.ImageView as ImageView;
	import ui.View      as View;
	import ui.TextView  as TextView;

	// Extend the View superConstructor
	exports = Class(View, function(supr){
		this.init = function(opts){
			// This is a solid block that contains the logo etc.
			supr(this, 'init', [merge(opts, {
				width:           device.width,
				height:          device.height,
				backgroundColor: '#FFBE40'
			})]);
			// The logo
			this.logo = new TextView({
				superview: this,
				text: "Dinder!",
				color: "white",
				x: 0,
				y: (gx*4),
				width: device.width,
				height: (gx*4),
				anchorX: device.width/2
			});
			// The back button
			this.back = new TextView({
				superview: this,
				text: "<",
				color: "white",
				x:      (gx*-2),
				y:      0,
				width:  (gx*2),
				height: (gx*2)
			});

			this.on('InputStart', bind(this, this.collapse));
		};
		this.collapse = function(){
			animate(this).now({ height: (gx*2) }, 600, animate.easeInOut);
			animate(this.logo).now({ y: 0, scale: 0.5 }, 600, animate.easeInOutBack);
			animate(this.back).wait(200).then({ x: 0 }, 400, animate.easeOutBack);
		};
		this.expand = function(){
			animate(this).now({ height: device.height }, 600, animate.easeInOut);
			animate(this.logo).now({ y: (gx*4), scale: 1 }, 600, animate.easeInOutBack);
			animate(this.back).now({ x: (gx*-2) }, 400, animate.easeInBack);
		};
	});