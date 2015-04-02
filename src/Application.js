import device;
import animate;
GLOBAL.gx = Math.ceil(device.width/20); // Must be defined after device, but before my stuff
import .Nav as Nav;
import .Swiper as Swiper;


exports = Class(GC.Application, function () {

	this.initUI = function () {
		// BG Color
		this.view.style.backgroundColor = "#ECF081";
		// Nav, Mealswiper
		this.swiper = new Swiper({ superview: this.view });
		this.nav    = new Nav({ superview: this.view });
	};

	this.launchUI = function () {};
});
