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

	var swipeDist = (gx*5);  // The x-distance at which we can assume a decision has been made
	var rRatio    = (gx*-30); // The ratio at which rotation is linked to the x-distance
	var edgeDist  = (gx*25); // The x-distance at which the swipe animation is complete (ie: offscreen)
	var centerX   = (gx*10); // The center
	var centerY   = (gx*12); // The center
	var currentZ  = 1000;    // For z sorting


	var numCards  = 4;       // Number of recipe cards in the stack
	var scale     = 0.9;     // Reduction in size with each card position
	var offset    = (gx);    // Vertical offset with each card


	// Dummy recipes
	var recipes = [
		{ title: "Ratatoile",                                         image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--51579_11.jpg" },
		{ title: "Simnel share 'n' tear buns",                        image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/april-simnel-share-n-tear-buns.jpg" },
		{ title: "Cabbage steaks with apple, goat’s cheese & pecans", image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/cabbage-steaks-with-apple-goats-cheese-pecans.jpg" },
		{ title: "Flowerpot chocolate chip muffins",                  image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/flowerpot-chocolate-chip-muffins.jpg" },
		{ title: "Chilli con carne",                                  image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--1001451_6.jpg" },
		{ title: "Chicken & chorizo jambalaya",                       image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--1274503_8.jpg" },
		{ title: "Spiced carrot & lentil soup",                       image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--1074500_11.jpg" },
		{ title: "Spicy root & lentil casserole",                     image: "http://www.bbcgoodfood.com/sites/bbcgoodfood.com/files/recipe_images/recipe-image-legacy-id--488691_11.jpg" }
	];

	// Method to get the scale and position of the cards depending on their order on the stack
	//   note this should accept DECIMAL depths too!
	function getCardPropsAtDepth(depth){
		// For now, I'm not troubling myself with the fancy scaling lark...
		return {
			x: centerX+(gx*-depth),
			y: centerY+(gx*depth)
		};
		/*
		var s = 1;
		var y = 0;
		for(var d=0; d<depth; d++){
			y += s*offset; // Add to the y by a factor of the last scale value
			s *= scale;    // Multiply the scale
		}
		// Adjust the y-value based on the scale...

		// And return
		return { scale: s, y: top+y };
		*/
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
 	var RecipeCard = Class(View, function (supr) {
 		this.init = function (superview, opts) {
			
 			// Create the basic view
			supr(this, 'init', [merge(opts, {
				superview:       superview,
				zIndex:          currentZ,
				width:           (gx*18),
				height:          (gx*18),
				anchorX:         (gx*9),
				anchorY:         (gx*9),
				offsetX:         (gx*-9),
				offsetY:         (gx*-9),
				backgroundColor: '#FFFFFF'
			})]);
			// Add an image view
			this.image = new ImageView({
				superview: this,
				width:     Math.round(gx*18),
				height:    Math.round(gx*18),
			});
			this.loadRecipe();
 		};
 		this.loadRecipe = function(){
 			// Grab a recipe
 			var recipe = recipes.shift();
 			this.image.setImage(recipe.image);
 			// Keep them in rotation
 			recipes.push(recipe);
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
			// Init at full-size
			supr(this, 'init', [merge(opts, {
				width:           device.width,
				height:          device.height
			})]);
			// Create some recipe cards
			this.cards = [];
			for(var c=0; c<numCards; c++){
				currentZ --;
				var card = new RecipeCard(this, getCardPropsAtDepth(c));
				this.cards.push(card);
			}
			// Set the mode
			this.mode = "idle";
			// On swipe, move the active card
			this.on('InputStart',  bind(this, this.inputStart));
			this.on('InputMove',   bind(this, this.inputMove));
			this.on('InputSelect', bind(this, this.inputSelect));
		};
		this.updateStackOpts = function(includeTopCard){
			// If we're including the top card, we must assume the distance is 0
			var xDist   = 0; // Assume the dist is 0, as the top card could be offscreen
			var decimal = 0;
			if(!includeTopCard){
				// Cool, calculate the distance and decimal based on the top card x-distance
				xDist = Math.abs(this.cards[0].style.x-centerX);
				if(xDist){
					decimal = xDist > swipeDist ? 1 : (xDist/swipeDist);
				}
			}
			// Loop the cards and update
			for(var c=(includeTopCard?0:1); c<numCards; c++){
				this.cards[c].updateOpts(getCardPropsAtDepth(c-decimal));
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
					this.cards[0].loadRecipe();
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
				if(this.cards[0].containsLocalPoint(point)){
					// Set the mode, clear any active animations, store the point
					this.mode = "dragging";
					animate(this.cards[0]).clear();
					this.startPoint = point;
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
			}
		}
		this.inputSelect = function(){
			// If we're dragging, we can test to see if the swipe was complete the swipe motion
			if(this.mode == "dragging"){
				// Have we moved the required horizontal distance?
				if(Math.abs(this.diffX) > swipeDist){
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
				}
			}
		}
	});