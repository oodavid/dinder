/** DINDER! (RECIPE) DETAIL
 *
 *		A scrolling view that shows the details for the recipe when tapped
 *			Title
 *			Ingredients
 *			Description
 *			Recipe
 *
 * @author		David "oodavid" King
 * @copyright	Copyright (c) 2014 +
 */
	import device;
	import animate;
	import ui.ScrollView as ScrollView;
	import ui.View       as View;
	import ui.ImageView  as ImageView;
	import ui.TextView   as TextView;

	// Extend the View superConstructor
	exports = Class(ScrollView, function(supr){
		this.init = function(opts){
			// Full-Screen minus nav bar
			supr(this, 'init', [merge(opts, {
				y:               (gx*2),
				width:           device.width,
				height:          (device.height-(gx*2)),
				scrollX:         false,
				bounce:          false,
				visible:         false,
				opacity:         0,
				backgroundColor: '#FFFFFF',
				scrollBounds:    { minY: 0, maxY: 0 }
			})]);
			// Image
			this.image = new ImageView({
				superview: this,
				width:     (gx*20),
				height:    (gx*20)
			});
			// Title
			this.title = new TextView({
				superview:  this,
				fontFamily: 'DroidSans',
				width:      (gx*20),
				height:     (gx*2),
				y:          (gx*20)
			});
			// Method
			this.method = new TextView({
				superview:  this,
				fontFamily: 'DroidSans',
				size:       (gx),
				width:      (gx*19),
				x:          Math.round(gx*0.5),
				y:          (gx*22),
				wrap:         true,
				autoSize:     true,
				verticalAlign: 'top',
				horizontalAlign: 'left',
			});
		};
		this.showRecipe = function(recipe){
			if(!recipe){ return; }
			// Update the recipe
			this.image.setImage(recipe.image);
			this.title.setText(recipe.title);
			this.method.updateOpts({ height: 1 });
			this.method.setText("1 - Prepare your vegetables. Chop 1 large onion into small dice, about 5mm square. The easiest way to do this is to cut the onion in half from root to tip, peel it and slice each half into thick matchsticks lengthways, not quite cutting all the way to the root end so they are still held together. Slice across the matchsticks into neat dice. Cut 1 red pepper in half lengthways, remove stalk and wash the seeds away, then chop. Peel and finely chop 2 garlic cloves.\n\n\
2 - Start cooking. Put your pan on the hob over a medium heat. Add the oil and leave it for 1-2 minutes until hot (a little longer for an electric hob). Add the onions and cook, stirring fairly frequently, for about 5 minutes, or until the onions are soft, squidgy and slightly translucent. Tip in the garlic, red pepper, 1 heaped tsp hot chilli powder or 1 level tbsp mild chilli powder, 1 tsp paprika and 1 tsp ground cumin. Give it a good stir, then leave it to cook for another 5 minutes, stirring occasionally.\n\n\
3 - Brown the 500g lean minced beef. Turn the heat up a bit, add the meat to the pan and break it up with your spoon or spatula. The mix should sizzle a bit when you add the mince. Keep stirring and prodding for at least 5 minutes, until all the mince is in uniform, mince-sized lumps and there are no more pink bits. Make sure you keep the heat hot enough for the meat to fry and become brown, rather than just stew.\n\n\
4 - Making the sauce. Crumble 1 beef stock cube into 300ml hot water. Pour this into the pan with the mince mixture. Open 1 can of chopped tomatoes (400g can) and add these as well. Tip in ½ tsp dried marjoram and 1 tsp sugar, if using (see tip at the bottom), and add a good shake of salt and pepper. Squirt in about 2 tbsp tomato purée and stir the sauce well.\n\n\
5 - Simmer it gently. Bring the whole thing to the boil, give it a good stir and put a lid on the pan. Turn down the heat until it is gently bubbling and leave it for 20 minutes. You should check on the pan occasionally to stir it and make sure the sauce doesn’t catch on the bottom of the pan or isn’t drying out. If it is, add a couple of tablespoons of water and make sure that the heat really is low enough. After simmering gently, the saucy mince mixture should look thick, moist and juicy.\n\n\
6 - Bring on the beans. Drain and rinse 1 can of red kidney beans (410g can) in a sieve and stir them into the chilli pot. Bring to the boil again, and gently bubble without the lid for another 10 minutes, adding a little more water if it looks too dry. Taste a bit of the chilli and season. It will probably take a lot more seasoning than you think. Now replace the lid, turn off the heat and leave your chilli to stand for 10 minutes before serving, and relax. Leaving your chilli to stand is really important as it allows the flavours to mingle and the meat.\n\n\
7 - Serve with soured cream and plain boiled long grain rice.");
			// Reference the canvas context and compute the height
			var ctx = GC.app.engine.getCanvas().getContext('2d');
			this.method.computeSize(ctx);
			this.setScrollBounds({
				minY: 0,
				maxY: this.method.style.y+this.method.style.height
			});
			this.setOffset(0, 0);
			// Fade in
			this.updateOpts({ visible: true, opacity: 0 });
			animate(this).now({ opacity: 1 }, 500, animate.easeInOut);
			// Set the back button
			GC.app.nav.setBackButton(bind(this, this.hideRecipe));
		};
		this.hideRecipe = function(){
			// Fade out, then hide
			animate(this)
				.now({ opacity: 0 }, 500, animate.easeInOut)
				.then(bind(this, function(){
					this.hide();
				}));
			// Remove the back button
			GC.app.nav.hideBackButton();
		};
	});