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



const TextMetrics = require( './TextMetrics.js' ) ;



function StructuredTextLine( parts , metrics ) {
	this.parts = Array.isArray( parts ) ? parts : [] ;
	this.followUpEmptyLines = 0 ;
	this.metrics = metrics instanceof TextMetrics ? metrics : null ;
}

module.exports = StructuredTextLine ;



// Join consecutive parts sharing the exact same attributes.
// It produces better results for underline and line-through, avoiding outline overlaps.
StructuredTextLine.prototype.fuseEqualAttr = function() {
	if ( this.parts.length <= 1 ) { return ; }

	console.warn( "!!! BF .fuseEqualAttr()" , this.parts ) ;
	let lastPart = this.parts[ 0 ] ; // IStructuredTextPart
	let lastInsertedPart = lastPart ; // IStructuredTextPart
	const outputParts = [ lastPart ] ; // StructuredText

	for ( let index = 1 ; index < this.parts.length ; index ++ ) {
		const part = this.parts[ index ] ;

		if ( ! part.imageUrl && ! lastPart.imageUrl && part.attr.isEqual( lastPart.attr ) ) {
			lastInsertedPart.text += part.text ;

			// Note that it's always defined at that point
			if ( lastInsertedPart.metrics && part.metrics ) {
				lastInsertedPart.metrics.fuseWithRightPart( part.metrics ) ;
			}
		}
		else {
			outputParts.push( part ) ;
			lastInsertedPart = part ;
		}

		lastPart = part ;
	}

	this.parts = outputParts ;
	console.warn( "!!! AFT .fuseEqualAttr()" , this.parts ) ;
} ;

