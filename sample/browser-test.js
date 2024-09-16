
"use strict" ;

async function bookSourceFlowTest() {
	var rawDoc = await ( await fetch( 'doc.bks' ) ).text() ;
	console.log( rawDoc ) ;

	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: false
	} ) ;

	var vgFlowingText = new svgKit.VGFlowingText( {
		x: 20 ,
		y: 50 ,
		//width: 400 , height: 200 ,
		width: 300 , height: 400 ,
		//clip: false ,
		debugContainer: true ,
		//textWrapping: 'ellipsis' ,
		textWrapping: 'wordWrap' ,
		//textVerticalAlignment: 'bottom' ,
		//textHorizontalAlignment: 'center' ,
		attr: {
			fontSize: 20 ,
			color: '#444' ,
			//outline: true ,
			//frameCornerRadius: '0.2em' ,
			//frameOutlineWidth: '0.1em' ,
			//outlineColor: '#afa' ,
			//lineOutline: true ,
			//lineColor: '#559'
		} ,
		markupText: rawDoc
	} ) ;
	vg.addEntity( vgFlowingText ) ;

	renderAll( vg ) ;

	console.warn( "BoundingBox:" , vgFlowingText.getBoundingBox() ) ;
	console.warn( "Content BoundingBox:" , await vgFlowingText.getContentBoundingBox() ) ;
}



async function flowTest() {
	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: false
	} ) ;

	var vgFlowingText = new svgKit.VGFlowingText( {
		x: 20 ,
		y: 50 ,
		//width: 400 , height: 200 ,
		width: 200 , height: 400 ,
		//clip: false ,
		debugContainer: true ,
		//textWrapping: 'ellipsis' ,
		textWrapping: 'wordWrap' ,
		//textVerticalAlignment: 'bottom' ,
		//textHorizontalAlignment: 'center' ,
		attr: {
			fontSize: 28 , color: '#555' ,
			//outline: true ,
			//frameCornerRadius: '0.2em' ,
			//frameOutlineWidth: '0.1em' ,
			//outlineColor: '#afa' ,
			//lineOutline: true ,
			//lineColor: '#559'
		} ,
		//markupText: "Grigrigredin-menufretin ! [Hello]<green> *my* **friend**, ***stay*** [awhile]<bg:light blue> and _listen_..." ,
		structuredText: [
			{ text: "Hello" , attr: { color: '#5e5' } } ,
			{ text: " my friend " } ,
			{ image: './smiley-mini.png' } ,
			{ text: " stay " } ,
			{ text: "awhile" , attr: { frame: true , frameCornerRadius: '0.2em' , frameColor: '#afa' } } ,
			{ text: " and " } ,
			{ text: "listen" , attr: { underline: true , lineColor: '#599' } } ,
			{ text: "..." } ,
		] ,
	} ) ;
	vg.addEntity( vgFlowingText ) ;

	//renderCanvas( vg ) ;
	renderAll( vg ) ;
}



async function test() {
	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: true
	} ) ;
	console.warn( "VG:" , vg ) ;

	var vgRect = new svgKit.VGRect( {
		x: 10 ,
		y: 10 ,
		width: 60 ,
		height: 40 ,
		style: {
			//fill: '#779' ,
			fill: '%lighter blue' ,
			//stroke: '#c55'
			stroke: '%red-violet'
		}
	} ) ;
	vg.addEntity( vgRect ) ;

	const addClipToEllipse = true ;
	if ( addClipToEllipse ) {
		var vgEllipseClipper = new svgKit.VGClip() ;
		vg.addEntity( vgEllipseClipper ) ;

		let vgClipper = new svgKit.VGFlowingText( {
			x: 550 ,
			y: 380 ,
			width: 140 , height: 100 ,
			clip: false ,
			textWrapping: 'wordWrap' ,
			attr: { fontSize: 30 } ,
			structuredText: [
				{ text: "Hello world!" }
			]
		} ) ;

		vgEllipseClipper.addClippingEntity( vgClipper ) ;
	}
	var vgEllipse = new svgKit.VGEllipse( {
		x: 600 ,
		y: 420 ,
		rx: 80 ,
		ry: 60 ,
		style: {
			fill: '#7d9' ,
			stroke: '#000'
		}
	} ) ;
	if ( addClipToEllipse ) {
		vgEllipseClipper.addEntity( vgEllipse ) ;
	}
	else {
		vg.addEntity( vgEllipse ) ;
	}

	var vgImage = new svgKit.VGImage( {
		x: 200 ,
		y: 10 ,
		width: 100 ,
		height: 100 ,
		sourceX: 50 , sourceY: 30 , sourceWidth: 100 , sourceHeight: 150 ,
		url: './smiley.png'
	} ) ;
	vg.addEntity( vgImage ) ;

	let w = 150 , h = 100 ;
	var vgImage2 = new svgKit.VGImage( {
		x: 350 ,
		y: 10 ,
		width: w ,
		height: h ,
		//aspect: 'stretch' ,
		//aspect: 'preserve' ,
		aspect: 'cover' ,
		//aspect: 'contain' ,
		url: './smiley.png'
	} ) ;
	var vgImage2Rect = new svgKit.VGRect( {
		x: 350 ,
		y: 10 ,
		width: w ,
		height: h ,
		style: {
			fill: 'none' ,
			stroke: '#000' ,
			strokeWidth: 0.5
		}
	} ) ;
	vg.addEntity( vgImage2 ) ;
	vg.addEntity( vgImage2Rect ) ;

	const addClipTo9p = true ;
	if ( addClipTo9p ) {
		var vg9pClipper = new svgKit.VGClip() ;
		vg.addEntity( vg9pClipper ) ;

		let vgClipper = new svgKit.VGEllipse( {
			x: 375 ,
			y: 245 ,
			//rx: 175 , ry: 125
			rx: 160 , ry: 110
		} ) ;

		let vgClipper2 = new svgKit.VGRect( {
			x: 200 ,
			y: 300 ,
			width: 350 ,
			height: 80 ,
		} ) ;

		let vgClipper3 = new svgKit.VGPath() ;
		vgClipper3.moveTo( { x: 200 , y: 120 } ) ;
		vgClipper3.lineTo( { x: 550 , y: 200 } ) ;
		vgClipper3.lineTo( { x: 350 , y: 370 } ) ;
		vgClipper3.close() ;

		let vgClipper4 = new svgKit.VGFlowingText( {
			x: 220 ,
			y: 140 ,
			width: 140 , height: 100 ,
			clip: false ,
			textWrapping: 'wordWrap' ,
			attr: { fontSize: 30 } ,
			structuredText: [
				{ text: "Hello world!" }
			]
		} ) ;

		/*
		vg9pClipper.addClippingEntity( vgClipper ) ;
		vg9pClipper.addClippingEntity( vgClipper2 ) ;
		vg9pClipper.addClippingEntity( vgClipper3 ) ;
		*/
		vg9pClipper.addClippingEntity( vgClipper4 ) ;
	}

	var vg9pImage = new svgKit.VGImage( {
		x: 200 ,
		y: 120 ,
		width: 350 ,
		height: 250 ,
		sourceLeftWidth: 70 ,
		sourceRightWidth: 70 ,
		sourceTopHeight: 70 ,
		sourceBottomHeight: 70 ,
		url: './9p.png'
	} ) ;
	if ( addClipTo9p ) {
		vg9pClipper.addEntity( vg9pImage ) ;
	}
	else {
		vg.addEntity( vg9pImage ) ;
	}

	var vgText = new svgKit.VGText( {
		text: 'Text!' ,
		x: 100 ,
		y: 40 ,
		style: {
			fontSize: 30 ,
			fill: '#696' ,
		}
	} ) ;
	vg.addEntity( vgText ) ;
	
	var vgFlowingText = new svgKit.VGFlowingText( {
		x: 20 ,
		y: 50 ,
		//width: 400 , height: 200 ,
		width: 200 , height: 400 ,
		//clip: false ,
		debugContainer: true ,
		//textWrapping: 'ellipsis' ,
		textWrapping: 'wordWrap' ,
		attr: {
			fontSize: 30 , color: '#555' ,
			outline: true ,
			frameCornerRadius: '0.2em' ,
			frameOutlineWidth: '0.1em' ,
			//outlineColor: '#afa' ,
			//lineOutline: true ,
			//lineColor: '#559'
		} ,
		_text: "Hello my friend, stay awhile and listen..." ,
		markupText: "[Hello]<green> *my* **friend**, ***stay*** [awhile]<[bg:blue> and _listen_..." ,
		_structuredText: [
			{ text: "Hello\nworld!\nWhat " } ,
			{ text: "a wonderful " , attr: { fontSize: '0.7em' , color: '#933' } } ,
			{ text: "world!" , attr: { outline: true , outlineWidth: '0.05em' , outlineColor: '#b55' } } ,
			//{ text: "\nThis is a very very very very very very long long long line..." } ,
			{ text: "\nThis is an " } ,
			{ text: "underlined part" , attr: {
				underline: true , lineColor: '#599' ,
				//outline: true
			} } ,
			{ text: "!" } ,
			{ text: "\nAnd this is a " } ,
			{ text: "striked through part" , attr: {
				lineThrough: true ,
				//lineThickness: '0.075em' ,
				//outline: true
			} } ,
			{ text: "!" } ,
			{ text: "\nAnd this is " } ,
			{ text: "a framed part" , attr: {
				frame: true ,
				//frameCornerRadius: 10 , frameColor: '#557' , frameOutlineWidth: 1 , frameOutlineColor: '#66e' ,
				frameCornerRadius: '0.1em' , frameColor: '#557' , frameOutlineWidth: '0.1em' , frameOutlineColor: '#66e' ,
				outline: true
			} } ,
			{ text: "!" }
		]
	} ) ;
	vg.addEntity( vgFlowingText ) ;

	renderAll( vg ) ;
}



async function pathTest() {
	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: true
	} ) ;

	var vgPath = new svgKit.VGPath( {
		style: {
			fill: '%lighter blue' ,
			stroke: '%red-violet' ,
			strokeWidth: 2
		}
	} ) ;
	vgPath.moveTo( { x: 200 , y: 120 } ) ;
	vgPath.lineTo( { x: 350 , y: 140 } ) ;
	vgPath.lineTo( { x: 450 , y: 250 } ) ;
	vgPath.lineTo( { x: 350 , y: 370 } ) ;
	vgPath.lineTo( { x: 200 , y: 340 } ) ;
	vgPath.lineTo( { x: 110 , y: 200 } ) ;
	vgPath.close() ;
	console.warn( "VG:" , vg ) ;

	vg.addEntity( vgPath ) ;

	renderAll( vg ) ;
}



async function polygonTest() {
	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: true
	} ) ;

	var vgPolygon = new svgKit.VGPolygon( {
		style: {
			fill: '%lighter green' ,
			stroke: '%red' ,
			strokeWidth: 2
		} ,
		points: [
			{ x: 200 , y: 120 } ,
			{ x: 350 , y: 140 } ,
			{ x: 450 , y: 250 } ,
			{ x: 350 , y: 370 } ,
			{ x: 200 , y: 340 } ,
			{ x: 110 , y: 200 }
		]
	} ) ;
	vg.addEntity( vgPolygon ) ;

	var vgPolygon2 = new svgKit.VGPolygon( {
		style: {
			fill: '%lighter violet' ,
			stroke: '%red' ,
			strokeWidth: 2
		} ,
		build: {
			x: 250 ,
			y: 250 ,
			radius: 50 ,
			sides: 6 ,
			angleDeg: -90
		}
	} ) ;
	vg.addEntity( vgPolygon2 ) ;

	console.warn( "VG:" , vg ) ;

	renderAll( vg ) ;
	
	var $canvas = document.getElementById( 'canvas' ) ;
	$canvas.addEventListener( 'click' , event => {
		var coords = svgKit.canvas.screenToCanvasCoords( $canvas , { x: event.clientX , y: event.clientY } ) ;
		console.log( "coords:" , coords ) ;
		if ( vgPolygon.isInside( coords ) ) {
			console.warn( "Inside 1!" ) ;
		}

		if ( vgPolygon2.isInside( coords ) ) {
			console.warn( "Inside 2!" ) ;
		}
	} ) ;
}



async function hexaTilesTest() {
	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: true
	} ) ;

	var vgPolygonList = [] ,
		radius = 50 ,
		startingX = 100 ,
		startingY = 100 ;

	const createPolygonAt = ( x , y , boardX , boardY ) => {
		return new svgKit.VGPolygon( {
			data: { boardX , boardY } ,
			style: {
				fill: '%lighter violet' ,
				stroke: '%red' ,
				strokeWidth: 2
			} ,
			build: {
				x , y , radius ,
				sides: 6 ,
				angleDeg: -90
			}
		} ) ;
	} ;

	const sqrt3 = Math.sqrt( 3 ) ;

	for ( let j = 0 ; j < 5 ; j ++ ) {
		let y = startingX + radius * sqrt3 * j ;

		for ( let i = 0 ; i < 5 ; i ++ ) {
			let x = startingX + radius * ( 2 * i + ( j % 2 ? 2 : 1 ) ) ;
			let vgPolygon = createPolygonAt( x , y , i , j ) ;
			vg.addEntity( vgPolygon ) ;
			vgPolygonList.push( vgPolygon ) ;
		}
	}

	console.warn( "VG:" , vg ) ;

	renderAll( vg ) ;
	
	var $canvas = document.getElementById( 'canvas' ) ;
	$canvas.addEventListener( 'click' , event => {
		var coords = svgKit.canvas.screenToCanvasCoords( $canvas , { x: event.clientX , y: event.clientY } ) ;
		console.log( "coords:" , coords ) ;

		for ( let vgPolygon of vgPolygonList ) {
			if ( vgPolygon.isInside( coords ) ) {
				console.warn( "Inside!" , vgPolygon.data ) ;
			}
		}
	} ) ;
}



async function renderAll( vg ) {
	var $canvas = document.getElementById( 'canvas' ) ,
		$svgDom = document.getElementById( 'svgDom' ) ,
		$svgText = document.getElementById( 'svgText' ) ;

	svgKit.fontLib.setFontUrl( 'serif' , '../fonts/serif.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'italic' , '../fonts/serif-italic.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'bold' , '../fonts/serif-bold.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'bold' , 'italic' , '../fonts/serif-bold+italic.ttf' ) ;

	// Preload everything...
	//await svgKit.fontLib.preloadFontFamily( 'serif' ) ;
	/*
	await svgKit.fontLib.getFontAsync( 'serif' ) ;
	await svgKit.fontLib.getFontAsync( 'serif' , 'italic' ) ;
	await svgKit.fontLib.getFontAsync( 'serif' , 'bold' ) ;
	await svgKit.fontLib.getFontAsync( 'serif' , 'bold' , 'italic' ) ;
	//*/

	var ctx = $canvas.getContext( '2d' ) ;

	// Display using the Canvas renderer
	$canvas.classList.remove( 'hidden' ) ;
	await vg.renderCanvas( ctx ) ;

	// Display using SVG DOM renderer
	$svgDom.appendChild( await vg.renderSvgDom() ) ;

	// Display using SVG text renderer
	var svgText = await vg.renderSvgText() ;
	svgText = svgText.replace( />/g , '>\n' ) ;
	$svgText.appendChild( svgKit.loadFromString( svgText ) ) ;
	
	// Create a download link for the SVG
	var anchor = window.document.createElement( 'a' ) ;
	anchor.href = window.URL.createObjectURL( new Blob( [ svgText ] , { type: 'application/octet-stream' } ) ) ;
	anchor.download = 'test.tmp.svg' ;
	anchor.innerText = 'download' ;
	$svgText.appendChild( anchor ) ;
}



async function renderCanvas( vg ) {
	var $canvas = document.getElementById( 'canvas' ) ;

	svgKit.fontLib.setFontUrl( 'serif' , '../fonts/serif.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'italic' , '../fonts/serif-italic.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'bold' , '../fonts/serif-bold.ttf' ) ;
	svgKit.fontLib.setFontUrl( 'serif' , 'bold' , 'italic' , '../fonts/serif-bold+italic.ttf' ) ;

	// Preload everything...
	//await svgKit.fontLib.preloadFontFamily( 'serif' ) ;
	/*
	await svgKit.fontLib.getFontAsync( 'serif' ) ;
	await svgKit.fontLib.getFontAsync( 'serif' , 'italic' ) ;
	await svgKit.fontLib.getFontAsync( 'serif' , 'bold' ) ;
	await svgKit.fontLib.getFontAsync( 'serif' , 'bold' , 'italic' ) ;
	//*/

	var ctx = $canvas.getContext( '2d' ) ;

	// Display using the Canvas renderer
	$canvas.classList.remove( 'hidden' ) ;
	await vg.renderCanvas( ctx ) ;
}



//svgKit.domKit.ready( test ) ;
//svgKit.domKit.ready( pathTest ) ;
//svgKit.domKit.ready( polygonTest ) ;
svgKit.domKit.ready( hexaTilesTest ) ;
//svgKit.domKit.ready( flowTest ) ;
//svgKit.domKit.ready( bookSourceFlowTest ) ;

