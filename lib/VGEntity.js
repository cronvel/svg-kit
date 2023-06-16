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



const camel = require( 'string-kit/lib/camel' ) ;
const escape = require( 'string-kit/lib/escape' ) ;



function VGEntity( options ) {
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
	this.$style = null ;
}

module.exports = VGEntity ;

VGEntity.prototype.__prototypeUID__ = 'svg-kit/VGEntity' ;
VGEntity.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGEntity.prototype.isContainer = false ;
VGEntity.prototype.svgTag = 'none' ;
VGEntity.prototype.svgAttributes = () => ( {} ) ;



VGEntity.prototype.toJSON = function() {
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
	delete object.$style ;

	return object ;
} ;



VGEntity.prototype.set = function( data ) {
	if ( data.id !== undefined ) { this.id = data.id || null ; }

	if ( data.class ) {
		if ( typeof data.class === 'string' ) {
			this.class.clear() ;
			this.class.add( data.class ) ;
		}
		else if ( Array.isArray( data.class ) || ( data.class instanceof Set ) ) {
			this.class.clear() ;

			for ( let className of data.class ) {
				this.class.add( className ) ;
			}
		}
		else if ( typeof data.class === 'object' ) {
			for ( let className in data.class ) {
				if ( data.class[ className ] ) { this.class.add( className ) ; }
				else { this.class.delete( className ) ; }
			}
		}
	}

	if ( data.style ) {
		for ( let key in data.style ) {
			// Stored in the camelCase variant
			this.style[ this.toCamelCase( key ) ] = data.style[ key ] === null ? '' : data.style[ key ] ;
		}
	}

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

VGEntity.prototype.morph = function( data ) {
	var log = Object.assign( {} , data ) ;
	log._v = morphVersion ++ ;
	this.morphLog.push( log ) ;
	this.set( data ) ;
} ;



VGEntity.prototype.exportMorphLog = function() {
	if ( ! this.morphLog.length ) { return null ; }
	var output = { l: [ ... this.morphLog ] } ;
	this.morphLog.length = 0 ;
	return output ;
} ;



VGEntity.prototype.importMorphLog = function( log ) {
	if ( ! log || ! log.l || ! log.l.length ) { this.morphLog.length = 0 ; }
	else { this.morphLog = log.l ; }
} ;



// Use the preserveUpperCase option, cause the value can be in camelCased already
VGEntity.prototype.toCamelCase = value => camel.toCamelCase( value , true ) ;

VGEntity.prototype.escape = function( value ) {
	if ( typeof value === 'object' ) { return null ; }
	if ( typeof value !== 'string' ) { return value ; }
	return escape.htmlAttr( value ) ;
} ;



// Render the Vector Graphic as a text SVG
VGEntity.prototype.renderText = function( root = this ) {
	var key , rule , str = '' , textNodeStr = '' , styleStr = '' ,
		attr = this.svgAttributes( root ) ;

	str += '<' + this.svgTag ;

	if ( this.id ) { str += ' id="' + this.escape( this.id ) + '"' ; }
	if ( this.button ) { str += ' button="' + this.escape( this.button ) + '"' ; }
	if ( this.hint ) { str += ' hint="' + this.escape( this.hint ) + '"' ; }
	if ( this.area ) { str += ' area="' + this.escape( this.area ) + '"' ; }

	if ( this.class.size ) {
		str += ' class="' ;
		let first = true ;
		for ( let className of this.class ) {
			if ( ! first ) { str += ' ' ; }
			str += this.escape( className ) ;
			first = false ;
		}
		str += '"' ;
	}

	for ( key in attr ) {
		str += ' ' + key + '="' + this.escape( attr[ key ] ) + '"' ;
	}

	if ( this.data ) {
		for ( key in this.data ) {
			str += ' data-' + this.escape( key ) + '="' + this.escape( this.data[ key ] ) + '"' ;
		}
	}

	for ( key in this.style ) {
		// Key is in camelCase, but should use dash
		styleStr += this.escape( camel.camelCaseToDash( key ) ) + ':' + this.escape( this.style[ key ] ) + ';' ;
	}

	if ( styleStr ) {
		str += ' style="' + styleStr + '"' ;
	}

	if ( this.svgTextNode ) { textNodeStr = this.svgTextNode() ; }

	if ( ! this.isContainer ) {
		if ( textNodeStr ) { str += '>' + textNodeStr + '</' + this.svgTag + '>' ; }
		else { str += ' />' ; }

		return str ;
	}

	str += '>' ;

	// StyleSheet inside a <style> tag
	if ( this.css && this.css.length ) {
		str += '<style>\n' ;

		for ( rule of this.css ) {
			str += rule.select + ' {\n' ;
			for ( key in rule.style ) {
				str += '    ' + this.escape( camel.camelCaseToDash( key ) ) + ': ' + this.escape( rule.style[ key ] ) + ';\n' ;
			}
			str += '}\n' ;
		}

		str += '</style>' ;
	}

	// Inner content
	if ( this.entities ) {
		for ( let entity of this.entities ) {
			str += entity.renderText( root ) ;
		}
	}

	if ( textNodeStr ) { str += '>' + textNodeStr + '</' + this.svgTag + '>' ; }

	str += '</' + this.svgTag + '>' ;
	return str ;
} ;



// Render the Vector Graphic inside a browser, as DOM SVG
VGEntity.prototype.renderDom = function( options = {} , root = this ) {
	var key , rule , cssStr ,
		attr = this.svgAttributes( root ) ;

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
		// Key is already in camelCase
		this.$element.style[ key ] = this.style[ key ] ;
	}

	if ( this.svgTextNode ) {
		this.$element.appendChild( document.createTextNode( this.svgTextNode() ) ) ;
	}

	if ( ! this.isContainer ) { return this.$element ; }

	// StyleSheet inside a <style> tag
	if ( this.css && this.css.length ) {
		this.$style = document.createElementNS( 'http://www.w3.org/2000/svg' , 'style' ) ;
		//this.$style = document.createElement( 'style' ) ;

		cssStr = '' ;

		for ( rule of this.css ) {
			cssStr += rule.select + ' {\n' ;

			for ( key in rule.style ) {
				// Key is in camelCase, but should use dash
				cssStr += this.escape( camel.camelCaseToDash( key ) ) + ': ' + this.escape( rule.style[ key ] ) + ';\n' ;
			}

			cssStr += '}\n' ;

			// WARNING: this.$style.sheet does not work at that moment, it seems to be added only after behind inserted into the DOM,
			// so we construct a text-node instead of pure rule insertion
			//this.$style.sheet.insertRule( cssStr , this.$style.sheet.length ) ;
		}

		this.$style.appendChild( document.createTextNode( cssStr ) ) ;
		this.$element.appendChild( this.$style ) ;
	}

	// Inner content
	if ( this.entities ) {
		for ( let entity of this.entities ) {
			this.$element.appendChild( entity.renderDom( undefined , root ) ) ;
		}
	}

	return this.$element ;
} ;



// Update the DOM, based upon the morphLog
VGEntity.prototype.morphDom = function( root = this ) {
	this.morphLog.forEach( entry => this.morphOneEntryDom( entry , root ) ) ;
	this.morphLog.length = 0 ;
	return this.$element ;
} ;



VGEntity.prototype.morphOneEntryDom = function( data , root = this ) {
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
			// Key is already in camelCase
			this.$element.style[ key ] = data.style[ key ] === null ? '' : data.style[ key ] ;
		}
	}
} ;

