#!/usr/bin/env node

"use strict" ;

const fs = require( 'fs' ) ;
const opentype = require( 'opentype.js' ) ;

const VGRect = require( '../lib/VGRect.js' ) ;
const TextMetrics = require( '../lib/TextMetrics.js' ) ;
const StructuredTextArea = require( '../lib/StructuredTextArea.js' ) ;



var textArea = new StructuredTextArea( {
	x: 20 ,
	y: 50 ,
	width: 400 ,
	height: 200 ,
	attr: { fontSize: 30 } ,
	//structuredText: [ { text: 'Hello ' } , { text: 'world!' } ]
	structuredText: [ { text: "Hello\nworld!\nWhat " } , { text: ' a wonderful ' } , { text: 'world!' } ]
} ) ;

textArea.computeLines() ;
//console.log( "textArea:" , textArea ) ;

for ( let line of textArea.lines ) {
	console.log( '-'.repeat( 10 ) ) ;
	console.log( "textArea lines parts:" , line.parts ) ;
	console.log( "textArea lines metrics:" , line.metrics ) ;
}

return ;

var svg = '' ;

svg += '<svg>\n' ;
svg += vgRectLineHeight.renderText() + '\n' ;
//svg += vgRectLineGap.renderText() + '\n' ;
//svg += vgRectTextHeight.renderText() + '\n' ;
svg += path.toSVG() + '\n' ;
svg += '</svg>\n' ;

fs.writeFileSync( __dirname + '/test.tmp.svg' , svg ) ;



