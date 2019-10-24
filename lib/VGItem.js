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



function VGItem( options ) {
	this.id = null ;
	this.class = new Set() ;
	this.style = {} ;
	this.data = null ;		// User custom data, e.g. data-* attributes
	
	// Spellcast data
	this.button = null ;
	this.hint = null ;
	this.area = null ;
	
	this.morphLog = [] ;
	this.$element = null ;
}

module.exports = VGItem ;

VGItem.prototype.__prototypeUID__ = 'svg-kit/VGItem' ;
VGItem.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGItem.prototype.isContainer = false ;
VGItem.prototype.svgTag = 'none' ;
VGItem.prototype.svgAttributes = () => ( {} ) ;



VGItem.prototype.toJSON = function() {
	var object = Object.assign( {} , this ) ;
	
	object._type = this.__prototypeUID__ ;
	
	if ( this.class.size ) { object.class = [ ... this.class ] ; }
	else { delete object.class ; }
	
	if ( ! object.id ) { delete object.id ; }
	if ( ! object.data ) { delete object.data ; }
	if ( ! object.button ) { delete object.button ; }
	if ( ! object.hint ) { delete object.hint ; }
	if ( ! object.area ) { delete object.area ; }
	
	delete object.morphLog ;
	delete object.$element ;
	
	return object ;
} ;



VGItem.prototype.set = function( data ) {
	if ( data.id !== undefined ) { this.id = data.id || null ; }
	
	if ( data.class ) {
		if ( Array.isArray( data.class ) || ( data.class instanceof Set ) ) {
			this.class.clear() ;

			for ( let className of data.class ) {
				this.class.add( data.class ) ;
			}
		}
		else if ( typeof data.class === 'object' ) {
			for ( let className in data.class ) {
				if ( data.class[ className ] ) { this.class.add( className ) ; }
				else { this.class.delete( className ) ; }
			}
		}
	}

	if ( data.style ) { Object.assign( this.style , data.style ) ; }
	
	if ( data.data !== undefined ) {
		// User custom data, e.g. data-* attributes
		if ( ! data.data ) {
			this.data = null ;
		}
		else {
			if ( ! this.data ) { this.data = {} ; }
			Object.assign( this.data , data.data ) ;
		}
	}

	if ( data.button !== undefined ) { this.button = data.button || null ; }
	if ( data.hint !== undefined ) { this.hint = data.hint || null ; }
	if ( data.area !== undefined ) { this.area = data.area || null ; }
} ;



var morphVersion = 0 ;

VGItem.prototype.morph = function( data ) {
	var log = Object.assign( {} , data ) ;
	log._v = morphVersion ++ ;
	this.morphLog.push( log ) ;
	this.set( data ) ;
} ;



VGItem.prototype.exportMorphLog = function() {
	if ( ! this.morphLog.length ) { return null ; }
	var output = { l: [ ... this.morphLog ] } ;
	this.morphLog.length = 0 ;
	return output ;
} ;



VGItem.prototype.importMorphLog = function( log ) {
	if ( ! log || ! log.l || ! log.l.length ) { this.morphLog.length = 0 ; }
	else { this.morphLog = log.l ; }
} ;



// Render the Vector Graphic as a text SVG
VGItem.prototype.renderText = function() {
	var key , str = '' , styleStr = '' ,
		attr = this.svgAttributes() ;
	
	str += '<' + this.svgTag ;
	
	if ( this.id ) { str += ' id="' + this.id + '"' ; }
	if ( this.button ) { str += ' button="' + this.button + '"' ; }
	if ( this.hint ) { str += ' hint="' + this.hint + '"' ; }
	if ( this.area ) { str += ' area="' + this.area + '"' ; }

	if ( this.class.size ) {
		str += ' class="' + [ ... this.class ].join( ' ' ) + '"' ;
	}

	for ( key in attr ) {
		str += ' ' + key + '="' + attr[ key ] + '"' ;
	}

	if ( this.data ) {
		for ( key in this.data ) {
			str += ' data-' + key + '="' + this.data[ key ] + '"' ;
		}
	}

	for ( key in this.style ) {
		styleStr += key + ':' + this.style[ key ] + ';' ;
	}
	
	if ( styleStr ) {
		str += ' style="' + styleStr + '"' ;
	}
	
	if ( ! this.isContainer ) {
		str += ' />' ;
		return str ;
	}
	
	str += '>' ;
	
	// Inner content
	for ( let item of this.items ) {
		str += item.renderText() ;
	}
	
	str += '</' + this.svgTag + '>' ;
	return str ;
} ;



// Render the Vector Graphic inside a browser, as DOM SVG
VGItem.prototype.renderDom = function( options = {} ) {
	var key ,
		attr = this.svgAttributes() ;
	
	this.$element = document.createElementNS( 'http://www.w3.org/2000/svg' , options.overrideTag || this.svgTag ) ;

	if ( this.id ) { this.$element.setAttribute( 'id' , this.id ) ; }
	if ( this.button ) { this.$element.setAttribute( 'button' , this.button ) ; }
	if ( this.hint ) { this.$element.setAttribute( 'hint' , this.hint ) ; }
	if ( this.area ) { this.$element.setAttribute( 'area' , this.area ) ; }

	if ( this.class.size ) {
		this.class.forEach( className => this.$element.classList.add( className ) ) ;
	}
	
	for ( key in attr ) {
		this.$element.setAttribute( key , attr[ key ] ) ;
	}

	if ( this.data ) {
		for ( key in this.data ) {
			this.$element.setAttribute( 'data-' + key , this.data[ key ] ) ;
		}
	}
	
	for ( key in this.style ) {
		this.$element.style[ key ] = this.style[ key ] ;
	}

	if ( ! this.isContainer ) { return this.$element ; }

	// Inner content
	for ( let item of this.items ) {
		this.$element.appendChild( item.renderDom() ) ;
	}

	return this.$element ;
} ;



// Update the DOM, based upon the morphLog
VGItem.prototype.morphDom = function() {
	this.morphLog.forEach( entry => this.morphOneEntryDom( entry ) ) ;
	this.morphLog.length = 0 ;
	return this.$element ;
} ;



VGItem.prototype.morphOneEntryDom = function( data ) {
	var key ;

	// Disallow id changes?
	//if ( data.id ) { this.$element.setAttribute( 'id' , data.id ) ; }
	
	if ( data.button ) { this.$element.setAttribute( 'button' , data.button ) ; }
	if ( data.hint ) { this.$element.setAttribute( 'hint' , data.hint ) ; }
	if ( data.area ) { this.$element.setAttribute( 'area' , data.area ) ; }
	
	if ( data.class ) {
		if ( Array.isArray( data.class ) ) {
			this.$element.setAttribute( 'class' , data.class.join( ' ' ) ) ;
		}
		else if ( data.class instanceof Set ) {
			this.$element.setAttribute( 'class' , [ ... data.class ].join( ' ' ) ) ;
		}
		else if ( typeof data.class === 'object' ) {
			for ( let className in data.class ) {
				if ( data.class[ className ] ) { this.$element.classList.add( className ) ; }
				else { this.$element.classList.remove( className ) ; }
			}
		}
	}

	if ( data.attr ) {
		for ( key in data.attr ) {
			this.$element.setAttribute( key , data.attr[ key ] ) ;
		}
	}

	if ( data.data ) {
		for ( key in data.data ) {
			this.$element.setAttribute( 'data-' + key , data.data[ key ] ) ;
		}
	}
	
	if ( data.style ) {
		for ( key in data.style ) {
			this.$element.style[ key ] = data.style[ key ] ;
		}
	}
} ;

