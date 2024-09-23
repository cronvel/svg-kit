
"use strict" ;

async function pathTest() {
	var vg = new svgKit.VG( {
		viewBox: { x: 0 , y: 0 , width: 700 , height: 500 } ,
		//invertY: true
	} ) ;

	var vgPath = new svgKit.VGPath( {
		style: {
			fill: '%lighter blue' ,
			//stroke: '%red-violet' ,
			//strokeWidth: 2
		}
	} ) ;
	vgPath.moveTo( { x: 200 , y: 120 } ) ;
	vgPath.lineTo( { x: 350 , y: 140 } ) ;
	vgPath.curveTo( { x: 350 , y: 340 , cx1: 450 , cy1: 240 , cx2: 250 , cy2: 240 } ) ;
	//vgPath.lineTo( { x: 150 , y: 340 } ) ;
	vgPath.arcTo( { x: 150 , y: 340 , rx: 125 , ry: 130 } ) ;
	vgPath.close() ;
	vg.addEntity( vgPath ) ;
	console.warn( "VGPath:" , vgPath ) ;
	
	var points = [ ... vgPath.path.getPointEveryLength( 5 , { forceKeyPoints: true , minAngleDeg: 20 } ) ] ;
	//var points = [ ... vgPath.path.getPointEveryLength( 5 , { forceKeyPoints: false , minAngleDeg: 20 } ) ] ;
	console.log( "points count" , points.length ) ;
	var vgPathEvery = new svgKit.VGPath( {
		style: {
			//fill: '%lighter blue' ,
			fill: 'none' ,
			stroke: '%red-violet' ,
			strokeWidth: 1
		}
	} ) ;
	points.forEach( ( point , index ) => {
		if ( index ) { vgPathEvery.lineTo( point ) ; }
		else { vgPathEvery.moveTo( point ) ; }
	} ) ;
	vg.addEntity( vgPathEvery ) ;

	console.warn( "VG:" , vg ) ;
	renderAll( vg ) ;
}



async function renderAll( vg , options = null ) {
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
	await vg.renderCanvas( ctx , options ) ;

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



async function renderCanvas( vg , options ) {
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
	await vg.renderCanvas( ctx , options ) ;
}



svgKit.domKit.ready( pathTest ) ;
