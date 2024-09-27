#!/usr/bin/env node
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

