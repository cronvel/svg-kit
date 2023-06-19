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
	attr: { fontSize: 30 } ,
	//structuredText: [ { text: 'Hello ' } , { text: 'world!' } ]
	structuredText: [ { text: "Hello\nworld!\nWhat " } , { text: "a wonderful " , attr: { color: '#933' } } , { text: "world!" , attr: { outlineWidth: 1 , outlineColor: '#b55' } } ]
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



