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



function StructuredTextRenderer() {
}

module.exports = StructuredTextRenderer ;



StructuredTextRenderer.prototype.type = 'flatStructure' ;



// Render the full document, called last with all content rendered
StructuredTextRenderer.prototype.document = function( meta , renderedChildren ) {
	console.warn( "document:" , renderedChildren ) ;
	return renderedChildren ;
} ;



// Block



StructuredTextRenderer.prototype.paragraph = function( data , renderedChildren ) {
	console.warn( "paragraph:" , renderedChildren ) ;
	renderedChildren.push( { text: "\n\n" } ) ;
	return renderedChildren ;
} ;



StructuredTextRenderer.prototype.quote = function( data , renderedChildren ) {
	renderedChildren.push( { text: "\n\n" } ) ;
	return renderedChildren ;
} ;



StructuredTextRenderer.prototype.header = function( data , renderedChildren ) {
	renderedChildren.push( { text: "\n\n" } ) ;
	return renderedChildren ;
} ;



StructuredTextRenderer.prototype.cite = function( data , renderedChildren ) {
	renderedChildren.push( { text: "\n\n" } ) ;
	return renderedChildren ;
} ;



StructuredTextRenderer.prototype.list = function( data , renderedChildren ) {
	renderedChildren.push( { text: "\n\n" } ) ;
	return renderedChildren ;
} ;



StructuredTextRenderer.prototype.listItem = function( data , renderedChildren ) {
	renderedChildren.unshift( { text: '• ' } ) ;
	renderedChildren.push( { text: "\n" } ) ;
	return renderedChildren ;
} ;



StructuredTextRenderer.prototype.orderedList = function( data , renderedChildren ) {
	renderedChildren.push( { text: "\n\n" } ) ;
	return renderedChildren ;
} ;



StructuredTextRenderer.prototype.orderedListItem = function( data , renderedChildren , stack , index ) {
	renderedChildren.unshift( { text: '' + ( index + 1 ) + '. ' } ) ;
	renderedChildren.push( { text: "\n" } ) ;
	return renderedChildren ;
} ;



// Inline



StructuredTextRenderer.prototype.text = function( data ) {
	console.warn( "text:" , data ) ;
	return { text: data.text } ;
} ;



StructuredTextRenderer.prototype.emphasisText = function( data ) {
	if ( data.level >= 3 ) {
		return {
			text: data.text ,
			fontStyle: 'italic' ,
			fontWeight: 'bold'
		} ;
	}

	if ( data.level === 2 ) {
		return {
			text: data.text ,
			fontWeight: 'bold'
		} ;
	}

	return {
		text: data.text ,
		fontStyle: 'italic'
	} ;
} ;



StructuredTextRenderer.prototype.decoratedText = function( data ) {
	if ( data.level >= 2 ) {
		return {
			text: data.text ,
			underline: true
		} ;
	}

	return {
		text: data.text ,
		underline: true
	} ;
} ;



StructuredTextRenderer.prototype.code = function( data ) {
	return { text: data.text } ;
} ;



StructuredTextRenderer.prototype.link = function( data ) {
	var part = { text: data.text } ;
	this.populateStyle( part , data.style ) ;
	return part ;
} ;



StructuredTextRenderer.prototype.styledText = function( data ) {
	var part = { text: data.text } ;
	this.populateStyle( part , data.style ) ;
	return part ;
} ;



StructuredTextRenderer.prototype.image = function( data ) {
	return { imageUrl: data.href } ;
} ;

//StructuredTextRenderer.prototype.pictogram = function( data ) {} ;
//StructuredTextRenderer.prototype.anchor = function( data ) {} ;



// Helpers



StructuredTextRenderer.prototype.populateStyle = function( part , style ) {
	if ( style.italic ) { part.fontStyle = 'italic' ; }
	if ( style.bold ) { part.fontWeight = 'bold' ; }
	if ( style.underline ) { part.underline = true ; }

	if ( style.textColor ) { part.color = style.textColor ; }

	if ( style.backgroundColor ) {
		part.frame = true ;
		part.frameColor = style.backgroundColor ;
		part.frameOutlineColor = "#777" ;   // <-- TEMP
		part.frameCornerRadius = 5 ;   // <-- TEMP
	}
} ;

