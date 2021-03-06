/*
	Spellcast

	Copyright (c) 2014 - 2019 Cédric Ronvel

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



const svgKit = require( './svg-kit.js' ) ;
const VGEntity = require( './VGEntity.js' ) ;



function VGContainer( options ) {
	VGEntity.call( this , options ) ;
	this.entities = [] ;
}

module.exports = VGContainer ;

VGContainer.prototype = Object.create( VGEntity.prototype ) ;
VGContainer.prototype.constructor = VGContainer ;
VGContainer.prototype.__prototypeUID__ = 'svg-kit/VGContainer' ;
VGContainer.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGContainer.prototype.isContainer = true ;



VGContainer.prototype.set = function( data ) {
	VGEntity.prototype.set.call( this , data ) ;

	if ( data.entities && Array.isArray( data.entities ) ) {
		for ( let entity of data.entities ) {
			this.entities.push( svgKit.objectToVG( entity ) ) ;
		}
	}
} ;



VGContainer.prototype.exportMorphLog = function() {
	var hasInner = false , inner = {} ;

	this.entities.forEach( ( entity , index ) => {
		var log = entity.exportMorphLog() ;
		if ( log ) {
			inner[ index ] = log ;
			hasInner = true ;
		}
	} ) ;

	if ( ! hasInner && ! this.morphLog.length ) { return null ; }

	var output = {} ;
	if ( this.morphLog.length ) { output.l = [ ... this.morphLog ] ; }
	if ( hasInner ) { output.i = inner ; }

	this.morphLog.length = 0 ;
	return output ;
} ;



VGContainer.prototype.importMorphLog = function( log ) {
	var key , index ;

	if ( ! log ) {
		this.morphLog.length = 0 ;
		return ;
	}

	if ( ! log.l || ! log.l.length ) { this.morphLog.length = 0 ; }
	else { this.morphLog = log.l ; }

	if ( log.i ) {
		for ( key in log.i ) {
			index = + key ;
			if ( this.entities[ index ] ) {
				this.entities[ index ].importMorphLog( log.i[ key ] ) ;
			}
		}
	}
} ;



// Update the DOM, based upon the morphLog
VGContainer.prototype.morphDom = function( root = this ) {
	this.entities.forEach( entity => entity.morphDom( root ) ) ;
	this.morphLog.forEach( entry => this.morphOneEntryDom( entry , root ) ) ;
	this.morphLog.length = 0 ;
	return this.$element ;
} ;

