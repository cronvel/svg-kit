/*
	SVG Kit

	Copyright (c) 2017 - 2023 Cédric Ronvel

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



const TextAttribute = require( './TextAttribute.js' ) ;
const TextMetrics = require( './TextMetrics.js' ) ;



function StructuredTextPart( params = {} ) {
	this.text = params.text || '' ;

	// Word-wrapping data
	this.canSplitBefore = true ;
	this.canSplitAfter = true ;

	this.attr = ! params.attr ? new TextAttribute( params ) :
		params.attr instanceof TextAttribute ? params.attr :
		new TextAttribute( params.attr ) ;

	// Computed metrics
	this.metrics = params.metrics instanceof TextMetrics ? params.metrics : null ;

	/*
	// From my abandoned StructuredText code for BabylonJS

	// When set, call observers for a click event
	href?: any;

	// Force splitting this part into one part per character.
	// This is useful for special effects.
	splitIntoCharacters?: boolean;


	// Userland data
	staticCustomData?: object;
	dynamicCustomData?: object;
	*/
}

module.exports = StructuredTextPart ;



StructuredTextPart.prototype.export = function( data = {} ) {
	data.text = this.text ;

	let attr = this.attr.export( undefined , true ) ;
	if ( attr ) { data.attr = attr ; }

	return data ;
} ;



StructuredTextPart.prototype.computeSizeMetrics = async function( inheritedAttr ) {
	this.metrics = await TextMetrics.measureStructuredTextPart( this , inheritedAttr ) ;
} ;

