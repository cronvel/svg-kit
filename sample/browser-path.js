/*
	SVG Kit

	Copyright (c) 2017 - 2024 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

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
			//strokeWidth: 5
		}
	} ) ;
	vgPath.moveTo( { x: 200 , y: 120 } ) ;
	vgPath.lineTo( { x: 350 , y: 140 } ) ;
	vgPath.curveTo( { x: 350 , y: 340 , cx1: 450 , cy1: 240 , cx2: 250 , cy2: 240 } ) ;
	vgPath.arcTo( { x: 200 , y: 340 , rx: 125 , ry: 130 } ) ;
	vgPath.qCurveTo( { x: 50 , y: 360 , cx: 150 , cy: 240 } ) ;
	vgPath.vLineTo( 200 ) ;
	vgPath.hLineTo( 180 ) ;
	vgPath.close() ;
	vg.addEntity( vgPath ) ;
	console.warn( "VGPath:" , vgPath ) ;
	console.warn( "Path:" , vgPath.path ) ;
	
	var step = 10 , forceKeyPoints = true ;
	
	/*
	var points = vgPath.path.getPoints( { step , forceKeyPoints } ) ;
	var vgStepPolygon = new svgKit.VGPath( {
		style: {
			//fill: '%lighter blue' ,
			fill: 'none' ,
			stroke: '%green' ,
			strokeWidth: 1
		}
	} ) ;
	points.forEach( ( point , index ) => {
		if ( index ) { vgStepPolygon.lineTo( point ) ; }
		else { vgStepPolygon.moveTo( point ) ; }
	} ) ;
	vg.addEntity( vgStepPolygon ) ;
	//*/

	//*
	var vgSimplifiedPolygonList = vgPath.toVGPolygon( {
		step ,
		forceKeyPoints ,
		style: {
			//fill: '%lighter blue' ,
			fill: 'none' ,
			stroke: '%red-violet' ,
			strokeWidth: 1
		}
	} ) ;
	var vgSimplifiedPolygon = vgSimplifiedPolygonList[ 0 ] ;
	console.log( "vgSimplifiedPolygon" , vgSimplifiedPolygon ) ;
	vg.addEntity( vgSimplifiedPolygon ) ;
	//*/
	
	/*
	var vgPolygonHullList = vgPath.toVGPolygonHull( {
		style: {
			//fill: '%lighter blue' ,
			fill: 'none' ,
			stroke: '%red' ,
			strokeWidth: 1
		}
	} ) ;
	var vgPolygonHull = vgPolygonHullList[ 0 ] ;
	console.log( "vgPolygonHull" , vgPolygonHull ) ;
	vg.addEntity( vgPolygonHull ) ;
	//*/
	
	console.warn( "VG:" , vg ) ;
	renderAll( vg ) ;

	var $canvas = document.getElementById( 'canvas' ) ;
	$canvas.addEventListener( 'click' , event => {
		var coords = svgKit.canvas.screenToCanvasCoords( $canvas , { x: event.clientX , y: event.clientY } ) ;
		console.log( "coords:" , coords ) ;
		if ( vgPath.isInside( coords ) ) {
			console.warn( "Inside!" ) ;
		}
		else {
			console.warn( "Outside..." ) ;
		}
	} ) ;
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
