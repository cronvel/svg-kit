#!/usr/bin/env node

"use strict" ;

const fs = require( 'fs' ) ;
const opentype = require( 'opentype.js' ) ;

const TextMetrics = require( '../lib/TextMetrics.js' ) ;
const VGRect = require( '../lib/VGRect.js' ) ;



const font = opentype.loadSync( 'font.ttf' ) ;

var text = 'Hello world! |^°²,À' ,
	fontSize = 30 ,
	x = 20 ,
	y = 50 ;

var path = font.getPath( text , x , y , fontSize ) ;
var metrics = TextMetrics.measureFontText( font , fontSize , text ) ;
console.log( "Metrics:" , metrics ) ;

var vgRectTextHeight = new VGRect( {
	x: x ,
	y: y - metrics.ascender ,
	width: metrics.width ,
	height: metrics.ascender - metrics.descender ,
	style: {
		fill: 'none' ,
		stroke: '#55f'
	}
} ) ;

var vgRectLineGap = new VGRect( {
	x: x ,
	y: y - metrics.descender ,
	width: metrics.width ,
	height: metrics.lineGap ,
	style: {
		fill: 'none' ,
		stroke: '#5f5'
	}
} ) ;

var vgRectLineHeight = new VGRect( {
	x: x ,
	y: y - metrics.ascender ,
	width: metrics.width ,
	height: metrics.lineHeight ,
	style: {
		fill: 'none' ,
		stroke: '#f55'
	}
} ) ;

var svg = '' ;

svg += '<svg>\n' ;
svg += vgRectLineHeight.renderText() + '\n' ;
//svg += vgRectLineGap.renderText() + '\n' ;
//svg += vgRectTextHeight.renderText() + '\n' ;
svg += path.toSVG() + '\n' ;
svg += '</svg>\n' ;

fs.writeFileSync( __dirname + '/test.tmp.svg' , svg ) ;



