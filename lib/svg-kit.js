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



const fs = require( 'fs' ).promises ;
const domKit = require( 'dom-kit' ) ;
const escape = require( 'string-kit/lib/escape.js' ) ;



const svgKit = {} ;
module.exports = svgKit ;

svgKit.path = require( './path.js' ) ;
svgKit.canvas = require( './canvas.js' ) ;

svgKit.VG = require( './VG.js' ) ;
svgKit.VGEntity = require( './VGEntity.js' ) ;
svgKit.VGContainer = require( './VGContainer.js' ) ;
svgKit.VGGroup = require( './VGGroup.js' ) ;
svgKit.VGClip = require( './VGClip.js' ) ;
svgKit.VGRect = require( './VGRect.js' ) ;
svgKit.VGEllipse = require( './VGEllipse.js' ) ;
svgKit.VGPath = require( './VGPath.js' ) ;
svgKit.VGText = require( './VGText.js' ) ;
svgKit.VGImage = require( './VGImage.js' ) ;

svgKit.fontLib = require( './fontLib.js' ) ;
svgKit.VGFlowingText = require( './VGFlowingText/VGFlowingText.js' ) ;
svgKit.StructuredTextLine = require( './VGFlowingText/StructuredTextLine.js' ) ;
svgKit.StructuredTextPart = require( './VGFlowingText/StructuredTextPart.js' ) ;
svgKit.TextAttribute = require( './VGFlowingText/TextAttribute.js' ) ;
svgKit.TextMetrics = require( './VGFlowingText/TextMetrics.js' ) ;

svgKit.domKit = domKit ;
svgKit.opentype = require( 'opentype.js' ) ;



/*
	load( url , [options] )

	* url: the URL of the .svg file
	* options: (optional) object of options, transmitted to .inject() and .patch()

	Return a promise resolving to the SVG DOM document.
*/
svgKit.load = async function( url , options = {} ) {
	var content , $doc , $svg ;

	if ( ! process.browser ) {
		// Use Node.js 'fs' module
		if ( url.substring( 0 , 7 ) === 'file://' ) { url = url.slice( 7 ) ; }
		content = await fs.readFile( url , 'utf8' ) ;
		$doc = domKit.fromXml( content ) ;
	}
	else {
		// Use an AJAX HTTP Request
		$doc = await svgKit.ajax( url ) ;
	}

	if ( options.removeComments ) {
		domKit.removeComments( $doc ) ;
		delete options.removeComments ;
	}

	$svg = $doc.documentElement ;
	svgKit.inject( $svg , options ) ;
	return $svg ;
} ;



svgKit.loadFromString = function( content , options = {} ) {
	var $doc = domKit.fromXml( content ) ;

	if ( options.removeComments ) {
		domKit.removeComments( $doc ) ;
		delete options.removeComments ;
	}

	var $svg = $doc.documentElement ;
	svgKit.inject( $svg , options ) ;
	return $svg ;
} ;



svgKit.ajax = function( url ) {
	return new Promise( ( resolve , reject ) => {
		var xhr = new XMLHttpRequest() ;

		xhr.responseType = 'document' ;

		xhr.onreadystatechange = () => {
			// From MDN: In the event of a communication error (such as the webserver going down),
			// an exception will be thrown when attempting to access the 'status' property.

			try {
				if ( xhr.readyState === 4 ) {
					if ( xhr.status === 200 ) {
						resolve( xhr.responseXML ) ;
					}
					else if ( xhr.status === 0 && xhr.responseXML ) {	// Yay, loading with file:// does not provide any status...
						resolve( xhr.responseXML ) ;
					}
					else if ( xhr.status ) { reject( xhr.status ) ; }
					else { reject( new Error( "[svg-kit] ajaxStatus(): Error with falsy status" ) ) ; }
				}
			}
			catch ( error ) {
				reject( error ) ;
			}
		} ;

		xhr.open( 'GET' , url ) ;
		xhr.send() ;
	} ) ;
} ;



/*
	Fix few <svg> things in order to inject it in the dom

	* $svg: the svg element
	* options: options object, where:
		* into: `DOMElement` an element where the .svg file should be loaded into
		* as: `DOMElement` a <svg> element where the .svg file should replace, almost like the "into" option,
		  useful when a <svg> tag should be created synchronously to start doing stuffs on it,
		  and let the asynchronous loading works in the background
		* all other options are passed to .patch()
*/
svgKit.inject = function( $svg , options ) {
	svgKit.patch( $svg , options ) ;

	if ( options.into ) { options.into.appendChild( $svg ) ; }

	// Better to avoid to check the tag name:
	// it's too defensive and it prevents from loading inside a <g> tag
	if ( options.as ) { //&& options.as.tagName.toLowerCase() === 'svg' )
		domKit.moveAttributes( $svg , options.as ) ;
		domKit.moveChildrenInto( $svg , options.as ) ;
	}
} ;



/*
	Fix few <svg> things.

	* $svg: the svg element
	* options: options object, where:
		* id: `string` the id attribute of the <svg> tag (recommanded)
		* removeIds: `boolean` remove all 'id' attributes
		* prefixIds: `string` prefix all IDs and patch url #ref
		* hidden: `boolean` turn the svg hidden (useful to apply modification before the show)
		* class: `string` or `object` (key=class, value=true/false) to add/remove on the <svg> tag
		* removeSize: `boolean` remove the width and height attribute and style from the <svg> tag
		* removeSvgStyle: `boolean` remove the top-level style attribute of the <svg> tag
		* removeDefaultStyles: `boolean` used to removed meaningless style pollution
		* css: `object` a css object to apply on the <svg> tag
		* colorClass: `boolean` a very specialized option. It moves all stroke and fill color inline styles to attribute
		  on all drawing elements and add the "primary" class to those that are class-less.
		  Since CSS has a greater priority than attributes (but lesser than inline styles), this allows us to controle
		  color using CSS.
		* removeComments: `boolean` remove all comment nodes
		* removeWhiteSpaces: `boolean` remove all white-space
		* removeWhiteLines: `boolean` remove all empty lines
		* removeExoticNamespaces: `boolean` remove all tag and attributes that have a namespace different than svg,
		  the svg namespace is stripped
*/
svgKit.patch = function( $svg , options ) {
	var viewBox , width , height ;

	svgKit.lightCleanup( $svg ) ;

	// Fix id, if necessary
	if ( options.id !== undefined ) {
		if ( typeof options.id === 'string' ) { $svg.setAttribute( 'id' , options.id ) ; }
		else if ( ! options.id ) { $svg.removeAttribute( 'id' ) ; }
	}

	if ( options.class ) {
		if ( typeof options.class === 'string' ) { $svg.classList.add( options.class ) ; }
		else if ( typeof options.class === 'object' ) { domKit.class( $svg , options.class ) ; }
	}

	if ( options.hidden ) { $svg.style.visibility = 'hidden' ; }

	if ( options.prefixIds ) { domKit.prefixIds( $svg , options.prefixIds ) ; }
	if ( options.removeIds ) { domKit.removeAllAttributes( $svg , 'id' ) ; }

	if ( options.removeSvgStyle ) { $svg.removeAttribute( 'style' ) ; }
	if ( options.removeDefaultStyles ) { svgKit.removeDefaultStyles( $svg ) ; }
	if ( options.removeComments ) { domKit.removeComments( $svg ) ; }

	if ( options.removeExoticNamespaces ) {
		domKit.filterByNamespace( $svg , { primary: 'svg' , whitelist: [] } ) ;
	}

	if ( options.removeSize ) {
		// Save and remove the width and height attribute
		width = $svg.getAttribute( 'width' ) || $svg.style.width ;
		height = $svg.getAttribute( 'height' ) || $svg.style.height ;

		$svg.removeAttribute( 'height' ) ;
		$svg.removeAttribute( 'width' ) ;
		$svg.style.width = null ;
		$svg.style.height = null ;

		// if the $svg don't have a viewBox attribute, set it now from the width and height (it works most of time)
		if ( ! $svg.getAttribute( 'viewBox' ) && width && height ) {
			viewBox = '0 0 ' + width + ' ' + height ;
			$svg.setAttribute( 'viewBox' , viewBox ) ;
		}
	}

	if ( options.css ) { domKit.css( $svg , options.css ) ; }

	if ( options.colorClass ) { svgKit.colorClass( $svg ) ; }

	if ( options.removeWhiteSpaces ) { domKit.removeWhiteSpaces( $svg ) ; }
	else if ( options.removeWhiteLines ) { domKit.removeWhiteSpaces( $svg , true ) ; }
} ;



svgKit.patchDocument = function( $doc , options ) {
	var removeWhiteSpaces = options.removeWhiteSpaces ,
		removeWhiteLines = options.removeWhiteLines ,
		removeComments = options.removeComments ;

	delete options.removeWhiteSpaces ;
	delete options.removeWhiteLines ;
	delete options.removeComments ;

	if ( removeComments ) { domKit.removeComments( $doc ) ; }

	svgKit.patch( $doc.documentElement , options ) ;

	if ( removeWhiteSpaces ) { domKit.removeWhiteSpaces( $doc ) ; }
	else if ( removeWhiteLines ) { domKit.removeWhiteSpaces( $doc , true ) ; }
} ;



svgKit.lightCleanup = function( $svg ) {
	domKit.removeAllTags( $svg , 'metadata' ) ;
	domKit.removeAllTags( $svg , 'script' ) ;
	domKit.removeAllTags( $svg , 'defs' , true ) ;	// all empty defs
} ;



// List of svg tags that actually display things
const drawingTags = [
	'path' ,
	'circle' ,
	'ellipse' ,
	'line' ,
	'rect' ,
	'polyline' ,
	'polygone' ,
	'text' ,
	'textPath'
] ;



const defaultStyles = [
	[ 'font-style' , 'normal' ] ,
	[ 'font-weight' , 'normal' ] ,
	[ 'font-variant' , 'normal' ] ,
	[ 'font-stretch' , 'normal' ] ,
	[ 'font-size' , 'medium' ] ,
	[ 'line-height' , 'normal' ] ,
	[ 'font-variant-ligatures' , 'normal' ] ,
	//[ 'font-family' , 'sans-serif' ] ,
	[ 'font-variant-position' , 'normal' ] ,
	[ 'font-variant-caps' , 'normal' ] ,
	[ 'font-variant-numeric' , 'normal' ] ,
	[ 'font-variant-alternates' , 'normal' ] ,
	[ 'font-variant-east-asian' , 'normal' ] ,
	[ 'font-feature-settings' , 'normal' ] ,
	[ 'text-indent' , '0' ] ,
	[ 'text-align' , 'start' ] ,
	[ 'text-decoration' , 'none' ] ,
	[ 'text-decoration-line' , 'none' ] ,
	[ 'text-decoration-style' , 'solid' ] ,
	[ 'text-decoration-color' , '#000000' ] ,
	[ 'letter-spacing' , 'normal' ] ,
	[ 'word-spacing' , 'normal' ] ,
	[ 'text-transform' , 'none' ] ,
	[ 'writing-mode' , 'lr-tb' ] ,
	[ 'direction' , 'ltr' ] ,
	[ 'text-orientation' , 'mixed' ] ,
	[ 'dominant-baseline' , 'auto' ] ,
	[ 'baseline-shift' , 'baseline' ] ,
	[ 'text-anchor' , 'start' ] ,
	[ 'white-space' , 'normal' ] ,
	[ 'shape-padding' , '0' ] ,
	[ 'display' , 'inline' ] ,
	[ 'visibility' , 'visible' ] ,
	[ 'overflow' , 'visible' ] ,
	[ 'opacity' , '1' ] ,
	[ 'isolation' , 'auto' ] ,
	[ 'mix-blend-mode' , 'normal' ] ,
	[ 'color-interpolation' , 'sRGB' ] ,
	[ 'color-interpolation-filters' , 'linearRGB' ] ,
	[ 'solid-color' , '#000000' ] ,
	[ 'solid-opacity' , '1' ] ,
	[ 'vector-effect' , 'none' ] ,
	[ 'fill-rule' , 'nonzero' ] ,
	[ 'clip-rule' , 'nonzero' ] ,
	[ 'color-rendering' , 'auto' ] ,
	[ 'image-rendering' , 'auto' ] ,
	[ 'shape-rendering' , 'auto' ] ,
	[ 'text-rendering' , 'auto' ] ,
	[ 'enable-background' , 'accumulate' ] ,
	[ 'stroke-dasharray' , 'none' ] ,
	[ 'stroke-dashoffset' , '0' ] ,
	[ 'paint-order' , 'normal' ] ,
	[ 'paint-order' , 'fill stroke markers' ]
] ;



svgKit.colorClass = function( $svg ) {
	drawingTags.forEach( ( tagName ) => {
		Array.from( $svg.getElementsByTagName( tagName ) ).forEach( ( $element ) => {
			// Beware, $element.className does not work as expected for SVG
			if ( ! $element.getAttribute( 'class' ) ) {
				$element.classList.add( 'primary' ) ;
			}

			// move style to attribute if they are not 'none'
			domKit.styleToAttribute( $element , 'fill' , [ 'none' ] ) ;
			domKit.styleToAttribute( $element , 'stroke' , [ 'none' ] ) ;
		} ) ;
	} ) ;
} ;



// Remove styles set to a default/unused value
svgKit.removeDefaultStyles = function( $svg ) {
	drawingTags.forEach( ( tagName ) => {
		Array.from( $svg.getElementsByTagName( tagName ) ).forEach( ( $element ) => {
			var styles = $element.getAttribute( 'style' ) ;

			defaultStyles.forEach( array => {
				var k = array[ 0 ] ;
				var v = array[ 1 ] ;

				styles = styles.replace(
					new RegExp( '(^|;) *' + escape.regExp( k ) + ' *: *' + escape.regExp( v ) + ' *(?:;|$)' ) ,
					( full , pre ) => pre
				) ;
			} ) ;

			$element.setAttribute( 'style' , styles ) ;
		} ) ;
	} ) ;
} ;



// Should remove all tags and attributes that have non-registered namespace,
// e.g.: sodipodi, inkscape, etc...
//svgKit.heavyCleanup = function( svgElement ) {} ;



svgKit.getViewBox = function( $svg ) {
	var raw = $svg.getAttribute( 'viewBox' ) ;

	if ( ! raw ) { return null ; }

	var array = raw.split( / +/ ) ;

	return {
		x: parseFloat( array[ 0 ] , 10 ) ,
		y: parseFloat( array[ 1 ] , 10 ) ,
		width: parseFloat( array[ 2 ] , 10 ) ,
		height: parseFloat( array[ 3 ] , 10 )
	} ;
} ;



svgKit.setViewBox = function( $svg , viewBox ) {
	$svg.setAttribute( 'viewBox' , viewBox.x + ' ' + viewBox.y + ' ' + viewBox.width + ' ' + viewBox.height ) ;
} ;



svgKit.toAreaArray = function( object ) {
	if ( object.min && object.max ) {
		// Math Kit BoundingBox2D
		return [
			object.min.x ,
			object.min.y ,
			object.max.x - object.min.x ,
			object.max.y - object.min.y
		] ;
	}
	else if ( object.xmin !== undefined && object.xmax !== undefined && object.ymin !== undefined && object.ymax !== undefined ) {
		return [
			object.xmin ,
			object.ymin ,
			object.xmax - object.xmin ,
			object.ymax - object.ymin
		] ;
	}
	else if ( object.x !== undefined && object.y !== undefined && object.width !== undefined && object.height !== undefined ) {
		return [
			object.x ,
			object.y ,
			object.width ,
			object.height
		] ;
	}

	return [ 0 , 0 , 100 , 100 ] ;
} ;



svgKit.standalone = function( content , viewBox ) {
	var output = '<?xml version="1.0" encoding="UTF-8"?>\n' ;

	if ( ! Array.isArray( viewBox ) ) { viewBox = svgKit.toAreaArray( viewBox ) ; }

	output += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox.join( ' ' ) + '">\n' ;

	// ?
	// width="500"
	// height="500"

	output += content ;
	output += '\n</svg>\n' ;

	return output ;
} ;



svgKit.unserializeVG = str => svgKit.objectToVG( JSON.parse( str ) ) ;

svgKit.objectToVG = function( object , clone = false ) {
	if ( ! object || typeof object !== 'object' ) { return null ; }

	if ( object instanceof svgKit.VGEntity ) {
		if ( clone ) { return new object.constructor( object ) ; }
		return object ;
	}

	if ( ! object._type || ! object._type.startsWith( 'svg-kit/' ) ) { return null ; }

	var className = object._type.slice( 8 ) ;
	if ( ! svgKit[ className ] ) { return null ; }

	return new svgKit[ className ]( object ) ;
} ;

