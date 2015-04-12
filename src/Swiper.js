/** DINDER! SWIPER
 *
 *		The main selling point!
 *		This is a stack of recipe cards with some simple logic:
 *			The TOP recipe is active and can be swiped left for NO and right for YES
 *			After the swipe it is sent to the BACK of the stack where it re-renders a new recipe
 *
 * @author		David "oodavid" King
 * @copyright	Copyright (c) 2014 +
 */
	import device;
	import animate;
	import ui.ImageView      as ImageView;
	import ui.ImageScaleView as ImageScaleView;
	import ui.View           as View;
	import ui.TextView       as TextView;

	var tapDist   = (gx);     // The allowable x-distance that we call a "tap"
	var swipeDist = (gx*5);   // The x-distance at which we can assume a decision has been made
	var rRatio    = (gx*-30); // The ratio at which rotation is linked to the x-distance
	var edgeDist  = (gx*25);  // The x-distance at which the swipe animation is complete (ie: offscreen)
	var centerX   = (gx*10);  // The center
	var centerY   = (gx*10);  // The center
	var currentZ  = 10000;    // For z sorting
	var numCards  = 4;        // Number of recipe cards in the stack

	// Dummy recipes
	var recipes = [
		{ title: "Coconut fish curry",                                image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/coconut-fish-curry.jpg" },
		{ title: "Ratatouille",                                       image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--51579_11.jpg" },
		{ title: "Simnel share 'n' tear buns",                        image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/april-simnel-share-n-tear-buns.jpg" },
		{ title: "Cabbage steaks with apple, goat’s cheese & pecans", image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/cabbage-steaks-with-apple-goats-cheese-pecans.jpg" },
		{ title: "Flowerpot chocolate chip muffins",                  image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/flowerpot-chocolate-chip-muffins.jpg" },
		{ title: "Chilli con carne",                                  image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--1001451_6.jpg" },
		{ title: "Chicken & chorizo jambalaya",                       image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--1274503_8.jpg" },
		{ title: "Spiced carrot & lentil soup",                       image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--1074500_11.jpg" },
		{ title: "Spicy root & lentil casserole",                     image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--488691_11.jpg" },
		{ title: "One-pan summer chicken",                            image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--3160_10.jpg" },
		{ title: "Chorizo rolls",                                     image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--695506_11.jpg" },
		{ title: "Crispy squid with caponata",                        image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--191499_11.jpg" },
		{ title: "Niçoise stuffed baguette",                          image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--1035647_10.jpg" },
		{ title: "Mushroom & basil omelette with smashed tomato",     image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/omelette.jpg" },
		{ title: "Pancetta & pepper piperade",                        image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/pancetta-pepper-piperade.jpg" },
		{ title: "Stuffed tomatoes",                                  image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--356486_11.jpg" },
		{ title: "Pan-fried sea bass with ratatouille & basil",       image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/raymonds-fish.jpg" },
		{ title: "Barbecued saddle of lamb with lemon & rosemary",    image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--994600_10.jpg" },
	];

	// Method to get the scale and position of the cards depending on their order on the stack
	//   note this should accept DECIMAL depths too!
	function getPropsAtDepth(depth){
		// The width changes in a linear manner
		var width  = (gx*18)-(gx*depth);
		// The height must remain in proportion
		var height = (gx*24)*(width/(gx*18));
		// The X-position is also linear
		var x      = centerX+(gx*depth*0.5);
		// The Y-position must account for the height
		var y      = centerY+(gx*depth*0.5)+((gx*24)-height);
		// And return
		return {
			x:     x,
			y:     y,
			width:  width,
			height: height
		};
	}
	function getRandomColor() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

/** DINDER! RECIPE CARD
 *
 *		A single recipe card
 *
 * @author		David "oodavid" King
 * @copyright	Copyright (c) 2014 +
 */
 	var RecipeCard = Class(ImageScaleView, function (supr) {
 		this.init = function (opts) {
 			// Scalable border
			supr(this, 'init', [merge(opts, {
				zIndex:          currentZ,
				width:           (gx*18),
				height:          (gx*24),
				anchorX:         (gx*9),
				anchorY:         (gx*9),
				offsetX:         (gx*-9),
				offsetY:         (gx*-9),
				image:           'resources/images/border.png',
				scaleMethod:     '9slice',
				clip:            true,
				sourceSlices: {
					horizontal: { left: 32, center: 64, right:  32 },
					vertical:   { top:  32, middle: 64, bottom: 32 }
				},
				destSlices: {
					horizontal: { left: Math.round(gx*0.5), right:  Math.round(gx*0.5) },
					vertical:   { top:  Math.round(gx*0.5), bottom: Math.round(gx*0.5) }
				}
			})]);
				// All other views need to be wrapped up, so we can SCALE them to fit within the pixel-perfect border
				this.inner = new View({
					superview:    this,
					width:        (gx*18),
					height:       (gx*24),
				});
					// The imageView is dynamically added and removed to fix a bug where remote images aren't loaded when using setImage...
					this.image = false;
					// Title
					this.title = new TextView({
						superview:    this.inner,
						fontFamily:   'DroidSans',
						zIndex:       2,
						verticalAlign: 'top',
						horizontalAlign: 'left',
						width:        (gx*17),
						height:       (gx*4),
						size:         (gx),
						x:            Math.round(gx*0.5),
						y:            (gx*18),
						autoFontSize: true,
						wrap:         true,
						autoSize:     false
					});
					// Times
					this.times = new TextView({
						superview:    this.inner,
						fontFamily:   'DroidSans',
						zIndex:       2,
						width:        (gx*17),
						height:       Math.round(gx*1.5),
						size:         Math.round(gx*0.75),
						x:            Math.round(gx*0.5),
						y:            (gx*22),
						autoFontSize: true,
						wrap:         true,
						autoSize:     false,
						text:         'Prep: 15m   Cook: 15m'
					});
					// Yum / Nah
					this.yum = new ImageView({
						superview: this.inner,
						image:     "resources/images/yum.png",
						zIndex:    3,
						width:     (gx*8),
						height:    (gx*4),
						anchorX:   (gx*4),
						anchorY:   (gx*3),
						x:         (gx),
						y:         (gx*2),
						r:         0.3,
						opacity:   0
					});
					this.nah = new ImageView({
						superview: this.inner,
						image:     "resources/images/nah.png",
						zIndex:    4,
						width:     (gx*8),
						height:    (gx*4),
						anchorX:   (gx*4),
						anchorY:   (gx*3),
						x:         (gx*9),
						y:         (gx*2),
						r:         -0.3,
						opacity:   0
					});
			this.updateRecipe();
		};
		this.updateRecipe = function(){
			// Grab a recipe
			this.recipe = recipes.shift();
			// We must have a recipe...
			if(!this.recipe){
				this.hide();
			} else {
				// The imageView is dynamically added and removed to fix a bug where remote images aren't loaded when using setImage...
				if(this.image){
					this.image.removeFromSuperview();
					this.image = false;
				}
				this.image = new ImageScaleView({
					superview: this.inner,
					scaleMethod: 'cover',
					zIndex:    1,
					image:     this.recipe.image,
					width:     (gx*17),
					height:    (gx*17),
					x:         Math.round(gx*0.5),
					y:         Math.round(gx*0.5)
				});
				// Title etc.
				this.title.setText(this.recipe.title);
				// Keep them in rotation
				// recipes.push(this.recipe);
			}
		};
	});

/** DINDER! SWIPER
 *
 *		this.mode must be one of the following
 *			"idle"       We are ready for user input
 *			"dragging"   The user is busy dragging the recipe
 *			"cancelled"  The user didn't drag the recipe far enough, so we're putting it back to the center
 *			"swiped"     The user fully swiped the recipe, it is animating off the screen
 *
 * @author		David "oodavid" King
 * @copyright	Copyright (c) 2014 +
 */

	// Extend the View superConstructor
	exports = Class(View, function(supr){
		this.init = function(opts){
			// Full-Screen minus nav bar
			supr(this, 'init', [merge(opts, {
				width:   device.width,
				height:  device.height-(gx*2),
				y:       (gx*2)
			})]);
			// Create some recipe cards
			this.cards = [];
			for(var c=0; c<numCards; c++){
				currentZ --;
				var card = new RecipeCard({ superview: this });
				this.cards.push(card);
			}
			this.updateStackOpts(true); // Passing true means that the top card IS updated
			// Set the mode
			this.mode = "idle";
			// On swipe, move the active card
			this.on('InputStart',  bind(this, this.inputStart));
			this.on('InputMove',   bind(this, this.inputMove));
			this.on('InputSelect', bind(this, this.inputSelect));
		};
		this.updateStackOpts = function(includeTopCard){
			// If we're including the top card, we must assume the distance is 0
			var diffX   = this.cards[0].style.x-centerX;
			var xDist   = 0; // Assume the dist is 0, as the top card could be offscreen
			var decimal = 0;
			if(!includeTopCard){
				// Cool, calculate the distance and decimal based on the top card x-distance
				xDist = Math.abs(diffX);
				if(xDist){
					decimal = xDist > swipeDist ? 1 : (xDist/swipeDist);
				}
			}
			// Loop the cards and update
			for(var c=(includeTopCard?0:1); c<numCards; c++){
				var props = getPropsAtDepth(c-decimal);
				if(c==numCards-1){ // The bottom card is STICKY, ie: no decimal!
					props = getPropsAtDepth(c-1);
				}
				this.cards[c].updateOpts(props);
				// Scale the inner to fit the outer
				this.cards[c].inner.updateOpts({ scale: (props.width/(gx*18)) });
				// Hide the yum / nah
				this.cards[c].yum.updateOpts({ opacity: 0 });
				this.cards[c].nah.updateOpts({ opacity: 0 });
			}
			// Fade the yum / nah of the top card?
			if(decimal){
				if(diffX > 0){
					this.cards[0].yum.updateOpts({ opacity: decimal });
					this.cards[0].nah.updateOpts({ opacity: 0 });
				} else {
					this.cards[0].yum.updateOpts({ opacity: 0 });
					this.cards[0].nah.updateOpts({ opacity: decimal });
				}
			}
		};
		this.tick = function(){
			// If we fully swiped, animate the card
			if(this.mode == "swiped"){
				this.diffX *= 1.1;
				this.diffY *= 1.1;
				this.r     = this.diffX/rRatio;
				// If we're off-screen, we can must restack the deck
				if(Math.abs(this.diffX) > edgeDist){
					// Set the mode, reset the card, grab a new recipe, move to the back of the stack, update the stack opts
					this.mode = "idle";
					currentZ --;
					this.cards[0].updateOpts({ r: 0, zIndex: currentZ });
					this.cards[0].updateRecipe();
					this.cards.push(this.cards.shift());
					this.updateStackOpts(true); // Passing true means that the top card IS updated
				} else {
					// Animate
					this.cards[0].updateOpts({
						x: centerX+this.diffX,
						y: centerY+this.diffY,
						r: this.r
					});
				}
			}
			// If we're not idle, update the stack opts
			if(this.mode != "idle"){
				this.updateStackOpts(false); // Passing true means that the top card is NOT updated
			}
		};
		this.inputStart = function(e, point){
			// If we're NOT animating the swipe, we can start a drag
			if(this.mode != "swiped"){
				// Only if in the right region
				if(point.y>(gx) && point.y<(gx*25)){
					// Set the mode, clear any active animations, store the point
					this.mode = "dragging";
					animate(this.cards[0]).clear();
					this.startPoint = point;
					this.maxDist    = 0; // Used for detecting taps
					this.diffX      = 0;
					this.diffY      = 0;
				}
			}
		}
		this.inputMove = function(e, point){
			// If we're dragging, move the active card
			if(this.mode == "dragging"){
				this.diffX = point.x - this.startPoint.x;
				this.diffY = point.y - this.startPoint.y;
				this.r     = this.diffX/rRatio;
				this.cards[0].updateOpts({
					x: centerX+this.diffX,
					y: centerY+this.diffY,
					r: this.r
				});
				this.maxDist = Math.max(this.maxDist, Math.abs(this.diffX), Math.abs(this.diffY));
			}
		}
		this.inputSelect = function(){
			// If we're dragging, we can test to see if the swipe was complete the swipe motion
			if(this.mode == "dragging"){
				var xDist = Math.abs(this.diffX);
				// Have we moved the required horizontal distance?
				if(xDist > swipeDist){
					// Set the mode, allow the tick function to animate this
					this.mode = "swiped";
					var liked = this.diffX > 0;
					console.log("User swiped "+(liked?"Yes":"No"));
				} else {
					// Set the mode, reset to the center
					this.mode = "cancelled";
					animate(this.cards[0]).now({
						x: centerX,
						y: centerY,
						r: 0
					}, 300, animate.easeOutBack).then(bind(this, function(){
						this.mode = "idle"; // Idle when done
					}));
					// A "tap" occurs if we haven't swiped very far; because the user might move to the side, then back to the middle to "cancel", use maxDist to be sure it's OK
					if(this.maxDist < tapDist){
						GC.app.details.showRecipe(this.cards[0].recipe);
					}
				}
			}
		}
	});