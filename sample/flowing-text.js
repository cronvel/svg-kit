#!/usr/bin/env node

"use strict" ;

const fs = require( 'fs' ) ;
const opentype = require( 'opentype.js' ) ;

const svgKit = require( '..' ) ;



var vgFlowingText = new svgKit.VGFlowingText( {
	x: 20 ,
	y: 50 ,
	width: 400 ,
	height: 200 ,
	attr: { fontSize: 30 , color: '#777' } ,
	//structuredText: [ { text: 'Hello ' } , { text: 'world!' } ]
	structuredText: [
		{ text: "Hello\nworld!\nWhat " } ,
		{ text: "a wonderful " , attr: { fontSize: 25 , color: '#933' } } ,
		{ text: "world!" , attr: { relOutlineWidth: 0.05 , outlineColor: '#b55' } } ,
		{ text: "\nThis is an " } ,
		{ text: "underlined part" , attr: { underline: true , relOutlineWidth: 0.025 , outlineColor: '#fff'} } ,
		{ text: "!" } ,
		{ text: "\nAnd this is an " } ,
		{ text: "striked through part" , attr: { lineThrough: true , relOutlineWidth: 0.025 , outlineColor: '#fff'} } ,
		{ text: "!" } ,
		{ text: "\nAnd this is an " } ,
		{ text: "framed part" , attr: {
			frame: true ,
			//frameCornerRadius: 10 , frameColor: '#557' , frameOutlineWidth: 1 , frameOutlineColor: '#66e' ,
			frameRelCornerRadius: 0.1 , frameColor: '#557' , frameRelOutlineWidth: 0.1 , frameOutlineColor: '#66e' ,
			relOutlineWidth: 0.025 , outlineColor: '#fff'
		} } ,
		{ text: "!" }
	]
} ) ;

vgFlowingText.computeLines() ;
//console.log( "vgFlowingText:" , vgFlowingText ) ;

for ( let line of vgFlowingText.structuredTextLines ) {
	console.log( '-'.repeat( 10 ) ) ;
	console.log( "Lines metrics:" , line.metrics ) ;
	console.log( "Lines parts:" , line.parts ) ;
}

var svg = '' ;

svg += '<svg>\n' ;
svg += vgFlowingText.renderText() + '\n' ;
svg += '</svg>\n' ;

fs.writeFileSync( __dirname + '/test.tmp.svg' , svg ) ;



