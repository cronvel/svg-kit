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

const svgKit = require( '..' ) ;



async function run() {
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
			{ text: "\nAnd this is a " } ,
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

	//console.log( "Content size:" , vgFlowingText.contentWidth , vgFlowingText.contentHeight ) ;
	//console.log( "Character count:" , vgFlowingText.characterCount ) ;


	/*
	vgFlowingText.computeLines() ;
	for ( let line of vgFlowingText.structuredTextLines ) {
		console.log( '-'.repeat( 10 ) ) ;
		console.log( "Lines metrics:" , line.metrics ) ;
		console.dir( line , { depth: null } ) ;
	}
	//*/

	var svg = await vg.renderSvgText() ;
	await fs.promises.writeFile( __dirname + '/test.tmp.svg' , svg + '\n' ) ;
}

run() ;

