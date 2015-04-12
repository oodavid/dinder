import device;
import animate;
GLOBAL.gx = Math.ceil(device.width/20); // Must be defined after device, but before my stuff
import .Swiper as Swiper;
import .Details as Details;
import .Nav as Nav;


exports = Class(GC.Application, function () {

	this.initUI = function () {
		// BG Color
		this.view.style.backgroundColor = "#EEEEEE";
		// Nav, Mealswiper
		this.swiper  = new Swiper({ superview: this.view });
		this.details = new Details({ superview: this.view });
		this.nav     = new Nav({ superview: this.view });
	};

	this.launchUI = function () {};
});
