
"use strict" ;

async function test() {
	var $canvas = document.getElementById( 'canvas' ) ,
		$svgDom = document.getElementById( 'svgDom' ) ,
		$svgText = document.getElementById( 'svgText' ) ;

	var ctx = $canvas.getContext( '2d' ) ;

	svgKit.fontLib.setFontUrl( 'serif' , '../fonts/serif.ttf' ) ;
	var font = await svgKit.fontLib.getFontAsync( 'serif' ) ;
	console.log( "Font:" , font ) ;

	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: true
	} ) ;

	var vgRect = new svgKit.VGRect( {
		x: 10 ,
		y: 10 ,
		width: 60 ,
		height: 40 ,
		style: {
			fill: '#779' ,
			stroke: '#c55'
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
			fontSize: 30 , color: '#777' ,
			outline: true ,
			frameCornerRadius: '0.2em'  ,
			//outlineColor: '#afa' ,
			//lineOutline: true ,
			//lineColor: '#559'
		} ,
		_text: "Hello my friend, stay awhile and listen..." ,
		markupText: "^YHello^ my friend, stay ^[bgBlue]awhile^ and listen..." ,
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

svgKit.domKit.ready( test ) ;

