#!/usr/bin/env node

"use strict" ;

const fs = require( 'fs' ) ;
const opentype = require( 'opentype.js' ) ;

const svgKit = require( '..' ) ;



var vg = new svgKit.VG( { viewBox: { x: 0 , y: 0 , width: 500 , height: 500 } } ) ;

var vgFlowingText = new svgKit.VGFlowingText( {
	x: 20 ,
	y: 50 ,
	//width: 400 , height: 200 ,
	width: 200 , height: 400 ,
	clip: false ,
	debugContainer: true ,
	//textWrapping: 'ellipsis' ,
	textWrapping: 'wordWrap' ,
	attr: {
		fontSize: 30 , color: '#777' ,
		outline: true ,
		//outlineColor: '#afa' ,
		//lineOutline: true ,
		//lineColor: '#559'
	} ,
	//structuredText: [ { text: 'Hello ' } , { text: 'world!' } ]
	structuredText: [
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
		{ text: "\nAnd this is an " } ,
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


/*
vgFlowingText.computeLines() ;
for ( let line of vgFlowingText.structuredTextLines ) {
	console.log( '-'.repeat( 10 ) ) ;
	console.log( "Lines metrics:" , line.metrics ) ;
	console.dir( line , { depth: null } ) ;
}
//*/

fs.writeFileSync( __dirname + '/test.tmp.svg' , vg.renderSvgText() + '\n' ) ;

