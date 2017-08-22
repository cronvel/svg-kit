/*
	SVG Kit
	
	Copyright (c) 2017 Cédric Ronvel
	
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



// Load modules
var fs = require( 'fs' ) ;
var domKit = require( 'dom-kit' ) ;

function noop() {}



var svgKit = {} ;
module.exports = svgKit ;



svgKit.standalone = function standalone( content , viewBox )
{
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



svgKit.toAreaArray = function toAreaArray( object )
{
	if ( object.xmin !== undefined && object.xmax !== undefined && object.ymin !== undefined && object.ymax !== undefined )
	{
		return [
			object.xmin ,
			object.ymin ,
			object.xmax - object.xmin ,
			object.ymax - object.ymin
		] ;
	}
	else if ( object.x !== undefined && object.y !== undefined && object.width !== undefined && object.height !== undefined )
	{
		return [
			object.x ,
			object.y ,
			object.width ,
			object.height
		] ;
	}
	else
	{
		return [ 0 , 0 , 100 , 100 ] ;
	}
} ;



svgKit.inlineToClass = function inlineToClass( $svg )
{
	$svg.querySelectorAll( 'path' ).forEach( function( $path ) {
		console.log( $path.getAttribute( 'style' ) ) ;
	} ) ;
} ;



// Fix few <svg> things in order to inject it in the dom
svgKit.inject = function inject( $svg , options )
{
	var viewBox , width , height ;
	
	svgKit.lightCleanup( $svg ) ;
	
	// Fix id, if necessary
	if ( options.id !== undefined )
	{
		if ( typeof options.id === 'string' ) { $svg.setAttribute( 'id' , options.id ) ; }
		else if ( ! options.id ) { $svg.removeAttribute( 'id' ) ; }
	}
	
	if ( options.class )
	{
		if ( typeof options.class === 'string' ) { $svg.classList.add( options.class ) ; }
		else if ( typeof options.class === 'object' ) { domKit.class( $svg , options.class ) ; }
	}
	
	if ( options.prefixIds ) { domKit.prefixIds( $svg , options.prefixIds ) ; }
	if ( options.removeIds ) { domKit.removeAllAttributes( $svg , 'id' ) ; }
	
	if ( options.hidden ) { $svg.style.visibility = 'hidden' ; }
	
	if ( options.removeSize )
	{
		// Save and remove the width and height attribute
		width = $svg.getAttribute( 'width' ) || $svg.style.width ;
		height = $svg.getAttribute( 'height' ) || $svg.style.height ;
		
		$svg.removeAttribute( 'height' ) ;
		$svg.removeAttribute( 'width' ) ;
		$svg.style.width = null ;
		$svg.style.height = null ;
		
		// if the $svg don't have a viewBox attribute, set it now from the width and height (it works most of time)
		if ( ! $svg.getAttribute( 'viewBox' ) && width && height )
		{
			viewBox = '0 0 ' + width + ' ' + height ;
			//console.log( "viewBox:" , viewBox ) ;
			$svg.setAttribute( 'viewBox' , viewBox ) ;
		}
	}
	
	if ( options.css ) { domKit.css( $svg , options.css ) ; }
	
	if ( options.into ) { options.into.appendChild( $svg ) ; }
	
	if ( options.as && options.as.tagName.toLowerCase() === 'svg' )
	{
		domKit.moveAttributes( $svg , options.as ) ;
		domKit.moveChildrenInto( $svg , options.as ) ;
	}
} ;



svgKit.lightCleanup = function lightCleanup( $svg )
{
	domKit.removeAllTags( $svg , 'metadata' ) ;
	domKit.removeAllTags( $svg , 'script' ) ;
	domKit.removeAllTags( $svg , 'defs' , true ) ;	// all empty defs
} ;



// Should remove all tags and attributes that have non-registered namespace,
// e.g.: sodipodi, inkscape, etc...
//svgKit.heavyCleanup = function heavyCleanup( svgElement ) {} ;



/*
	old (dom-kit 0.1.x) -> new (svg-kit 0.1.x)
	function load( $container , url , options , callback ) -> load( url , options , callback )
	$container -> options.into
	options.noWidthHeightAttr -> options.removeSize
*/
/*
	load( url , [options] , callback )
	
	* url: the URL of the .svg file
	* $container: null or the DOM element where the <svg> tag will be put
	* options: an optional object with optional options
		* id: `string` the id attribute of the <svg> tag (recommanded)
		* removeIds: `boolean` remove all 'id' attributes
		* prefixIds: `string` prefix all IDs and patch url #ref
		* class: `string` or `object` (key=class, value=true/false) to add/remove on the <svg> tag
		* hidden: inject the svg but make it hidden (useful to apply modification before the show)
		* removeSize: remove the width and height attribute and style from the <svg> tag
		* css: a css object to apply on the <svg> tag
	* callback: completion callback
*/
svgKit.load = function load( url , options , callback )
{
	if ( typeof options === 'function' ) { callback = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	if ( typeof callback !== 'function' ) { callback = noop ; }
	
	if ( ! process.browser )
	{
		// Use Node.js 'fs' module
		
		if ( url.substring( 0 , 7 ) === 'file://' ) { url = url.slice( 7 ) ; }
		
		fs.readFile( url , 'utf8' , function( error , content ) {
			
			if ( error ) { callback( error ) ; return ; }
			
			
			//var parser = new DOMParser() ;
			//var $svg = parser.parseFromString( content , 'application/xml' ).documentElement ;
			var $svg = domKit.fromXml( content ).documentElement ;
			
			try {
				svgKit.inject( $svg , options ) ;
			}
			catch ( error ) {
				callback( error ) ;
				return ;
			}
			
			callback( undefined , $svg ) ;
		} ) ;
	}
	else
	{
		// Use an AJAX HTTP Request
		
		svgKit.ajax( url , function( error , xmlDoc ) {
			
			if ( error ) { callback( error ) ; return ; }
			
			var $svg = xmlDoc.documentElement ;
			
			try {
				svgKit.inject( $svg , options ) ;
			}
			catch ( error ) {
				callback( error ) ;
				return ;
			}
			
			callback( undefined , $svg ) ;
		} ) ;
	}
} ;



svgKit.ajax = function ajax( url , callback )
{
	var xhr = new XMLHttpRequest() ;
	
	//console.warn( "ajax url:" , url ) ;
	
	xhr.responseType = 'document' ;
	xhr.onreadystatechange = svgKit.ajax.ajaxStatus.bind( xhr , callback ) ;
	xhr.open( 'GET', url ) ;
	xhr.send() ;
} ;



svgKit.ajax.ajaxStatus = function ajaxStatus( callback )
{
	// From MDN: In the event of a communication error (such as the webserver going down),
	// an exception will be thrown in the when attempting to access the 'status' property. 
	
	try {
		if ( this.readyState === 4 )
		{
			if ( this.status === 200 )
			{
				callback( undefined , this.responseXML ) ;
			}
			else if ( this.status === 0 && this.responseXML )	// Yay, loading with file:// does not provide any status...
			{
				callback( undefined , this.responseXML ) ;
			}
			else
			{
				if ( this.status ) { callback( this.status ) ; }
				else { callback( new Error( "[svg-kit] ajaxStatus(): Error with falsy status" ) ) ; }
			}
		}
	}
	catch ( error ) {
		callback( error ) ;
	}
} ;


