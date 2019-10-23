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



function VGItem( options = {} ) {
	this.style = {} ;
	if ( options.style ) { Object.assign( this.style , options.style ) ; }
}

module.exports = VGItem ;

VGItem.prototype.__prototypeUID__ = 'svg-kit/VGItem' ;
VGItem.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VGItem.prototype.isContainer = false ;
VGItem.prototype.svgTag = 'none' ;
VGItem.prototype.svgAttributes = () => ( {} ) ;



VGItem.prototype.toJSON = function() {
	return Object.assign( { _type: this.__prototypeUID__ } , this ) ;
} ;



// Render the Vector Graphic as a text SVG
VGItem.prototype.renderText = function() {
	var key , str = '' , styleStr = '' ,
		attr = this.svgAttributes() ;
	
	str += '<' + this.svgTag ;
	
	for ( key in attr ) {
		str += ' ' + key + '="' + attr[ key ] + '"' ;
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
VGItem.prototype.renderDom = function() {
} ;

