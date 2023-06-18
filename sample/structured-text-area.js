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
	structuredText: [ { text: 'Hello ' } , { text: 'world!' } ]
} ) ;

textArea.computeLines() ;
//console.log( "textArea:" , textArea ) ;
console.log( "textArea lines parts:" , textArea.lines[ 0 ].parts ) ;
console.log( "textArea lines metrics:" , textArea.lines[ 0 ].metrics ) ;

return ;

var svg = '' ;

svg += '<svg>\n' ;
svg += vgRectLineHeight.renderText() + '\n' ;
//svg += vgRectLineGap.renderText() + '\n' ;
//svg += vgRectTextHeight.renderText() + '\n' ;
svg += path.toSVG() + '\n' ;
svg += '</svg>\n' ;

fs.writeFileSync( __dirname + '/test.tmp.svg' , svg ) ;



