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

//const DynamicArea = require( '../DynamicArea.js' ) ;

const escape = require( 'string-kit/lib/escape.js' ) ;



function StructuredTextPart( params = {} ) {
	this.imageUrl = params.imageUrl || params.image || null ;
	this.text = this.imageUrl ? '' : params.text || '' ;

	// Word-wrapping data
	this.canLineSplitBefore = true ;
	this.forceNoLineSplitBefore = false ;
	this.canLineSplitAfter = true ;

	this.attr = ! params.attr ? new TextAttribute( params ) :
		params.attr instanceof TextAttribute ? params.attr :
		new TextAttribute( params.attr ) ;

	// Computed metrics
	this.metrics = params.metrics instanceof TextMetrics ? params.metrics : null ;

	this.dynamic = null ;

	if ( params.dynamic ) {
		// Complete syntax
		this.dynamic = params.dynamic ;
	}
	else {
		// Maybe shorthand syntax
		this.dynamic = StructuredTextPart.shorthandToDynamicDef( params ) ;
		if ( this.dynamic ) { console.warn( "::: Dynamic Set:" , this.dynamic ) ; }
	}

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



const DYNAMIC_SHORTHANDS = [ 'hover' , 'click' , 'press' , 'release' ] ;

StructuredTextPart.shorthandToDynamicDef = function( params ) {
	var def = {} ;

	if ( ! DYNAMIC_SHORTHANDS.some( k => Object.hasOwn( params , k ) ) ) { return null ; }

	def.base = StructuredTextPart.shorthandToDynamicStatusDef( params ) ;

	if ( params.hover ) {
		def.hover = StructuredTextPart.shorthandToDynamicStatusDef( params.hover ) ;
	}

	if ( params.press ) {
		def.press = StructuredTextPart.shorthandToDynamicStatusDef( params.press ) ;
	}

	if ( params.release ) {
		def.release = StructuredTextPart.shorthandToDynamicStatusDef( params.release ) ;
	}

	if ( params.click ) {
		def.release = StructuredTextPart.shorthandToDynamicStatusDef( params.click ) ;
		if ( ! def.press ) {
			def.press = def.hover || def.base ;
		}
	}

	return { statusData: def } ;
} ;



StructuredTextPart.shorthandToDynamicStatusDef = function( params ) {
	var def = { morph: {} } ;

	if ( params.attr ) { def.morph.attr = params.attr ; }
	//if ( params.metrics ) { def.morph.metrics = params.metrics ; }

	if ( params.emit ) { def.emit = params.emit ; }

	return def ;
} ;



StructuredTextPart.prototype.export = function( data = {} ) {
	if ( this.imageUrl ) { data.imageUrl = this.imageUrl ; }
	else { data.text = this.text ; }

	let attr = this.attr.export( undefined , true ) ;
	if ( attr ) { data.attr = attr ; }

	if ( this.dynamic ) { data.dynamic = this.dynamic ; }

	return data ;
} ;



StructuredTextPart.prototype.computeSizeMetrics = async function( inheritedAttr ) {
	this.metrics = await TextMetrics.measureStructuredTextPart( this , inheritedAttr ) ;
} ;



const CAN_SPLIT_BEFORE = new Set( [ ' ' ] ) ;
const CAN_SPLIT_AFTER = new Set( [ ' ' , '-' ] ) ;
const FORCE_NO_SPLIT_BEFORE = new Set( [ '!' , '?' , ':' , ';' ] ) ;

// Create the word-splitting regex, with 2 captures: the first move the splitter
// to the right (split-before), the second to the left (split-after).
const WORD_SPLIT_REGEXP = new RegExp(
	'(' + [ ... CAN_SPLIT_BEFORE ].map( e => escape.regExpPattern( e ) + '+' ).join( '|' ) + ')'
	+ '|(' + [ ... CAN_SPLIT_AFTER ].filter( e => ! CAN_SPLIT_BEFORE.has( e ) ).map( e => escape.regExpPattern( e ) + '+' ).join( '|' ) + ')' ,
	'g'
) ;
//console.warn( "WORD_SPLIT_REGEXP:" , WORD_SPLIT_REGEXP ) ;



// Split the into words, suitable to compute word-wrapping
// Note: This splitting function does not exclude the splitter,
// it keeps it on the left of the right-side of the split
StructuredTextPart.prototype.splitIntoWords = function( intoList = [] ) {
	if ( this.imageUrl ) {
		// Image are not splittable, and have special rules for line-split
		this.canLineSplitAfter = true ;
		this.canLineSplitBefore = false ;
		this.forceNoLineSplitBefore = false ;

		intoList.push( this ) ;
		return intoList ;
	}
	
	var match , lastIndex = 0 ;
	WORD_SPLIT_REGEXP.lastIndex = 0 ;

	while ( ( match = WORD_SPLIT_REGEXP.exec( this.text ) ) ) {
		if ( lastIndex < match.index ) {
			let newPart = new StructuredTextPart( this ) ;

			if ( match[ 1 ] ) {
				// It's a split-before
				newPart.text = this.text.slice( lastIndex , match.index ) ;
				lastIndex = match.index ;
			}
			else {
				// It's a split-after
				newPart.text = this.text.slice( lastIndex , match.index + match[ 0 ].length ) ;
				lastIndex = match.index + match[ 0 ].length ;
			}

			newPart.metrics = null ;
			newPart.checkLineSplit() ;
			intoList.push( newPart ) ;
		}
		else {
			lastIndex = match.index ;
		}
	}

	if ( lastIndex < this.text.length ) {
		let newPart = new StructuredTextPart( this ) ;
		newPart.text = this.text.slice( lastIndex ) ;
		newPart.metrics = null ;
		newPart.checkLineSplit() ;
		intoList.push( newPart ) ;
	}

	//console.warn( "Word split:" , intoList.map( e => e.text ) ) ;
	return intoList ;
} ;



StructuredTextPart.prototype.checkLineSplit = function() {
	if ( this.imageUrl ) {
		// Images are special case
		this.canLineSplitAfter = true ;
		this.canLineSplitBefore = false ;
		this.forceNoLineSplitBefore = false ;
		return ;
	}

	if ( CAN_SPLIT_BEFORE.has( this.text[ 0 ] ) ) {
		this.canLineSplitBefore = ! FORCE_NO_SPLIT_BEFORE.has( this.text[ 1 ] ) ;
		this.forceNoLineSplitBefore = false ;
	}
	else {
		this.canLineSplitBefore = false ;
		this.forceNoLineSplitBefore = FORCE_NO_SPLIT_BEFORE.has( this.text[ 0 ] ) ;
	}

	this.canLineSplitAfter = CAN_SPLIT_AFTER.has( this.text[ this.text.length - 1 ] ) ;
} ;

