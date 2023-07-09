#!/usr/bin/env node

"use strict" ;

const fs = require( 'fs' ) ;
const path = require( 'path' ) ;
const opentype = require( 'opentype.js' ) ;

const svgKit = require( '..' ) ;



async function run() {
	var fontPath = path.join( __dirname , '../fonts/serif.ttf' ) ;
	console.error( "fontPath:" , fontPath ) ;
	const font = opentype.loadSync( fontPath ) ;

	var text = 'Hello world! |^°²,À' ,
		fontSize = 30 ,
		x = 20 ,
		y = 50 ;

	var svgPath = font.getPath( text , x , y , fontSize ) ;
	var metrics = svgKit.TextMetrics.measureFontText( font , fontSize , text ) ;
	console.log( "Metrics:" , metrics ) ;


	var part = new svgKit.StructuredTextPart( { text , fontSize } ) ;
	console.log( "Part:" , part ) ;

	//var metrics2 = svgKit.TextMetrics.measureStructuredTextPart( part ) ;
	//console.log( "Part Metrics:" , metrics2 ) ;

	var vgRectTextHeight = new svgKit.VGRect( {
		x: x ,
		y: y - metrics.ascender ,
		width: metrics.width ,
		height: metrics.ascender - metrics.descender ,
		style: {
			fill: 'none' ,
			stroke: '#55f'
		}
	} ) ;

	var vgRectLineGap = new svgKit.VGRect( {
		x: x ,
		y: y - metrics.descender ,
		width: metrics.width ,
		height: metrics.lineGap ,
		style: {
			fill: 'none' ,
			stroke: '#5f5'
		}
	} ) ;

	var vgRectLineHeight = new svgKit.VGRect( {
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
	svg += await vgRectLineHeight.renderSvgText() ;
	svg += '\n' ;
	//svg += vgRectLineGap.renderText() + '\n' ;
	//svg += vgRectTextHeight.renderText() + '\n' ;
	svg += svgPath.toSVG() + '\n' ;
	svg += '</svg>\n' ;

	await fs.promises.writeFile( __dirname + '/test.tmp.svg' , svg ) ;
}

run() ;

