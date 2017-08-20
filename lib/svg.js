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



var svg = {} ;
module.exports = svg ;



svg.xmldom = require( 'xmldom' ) ;
var cheerio = require( 'cheerio' ) ;



svg.standalone = function standalone( content , viewBox )
{
	var output = '<?xml version="1.0" encoding="UTF-8"?>\n' ;
	
	if ( ! Array.isArray( viewBox ) ) { viewBox = svg.toAreaArray( viewBox ) ; }
	
	output += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox.join( ' ' ) + '">\n' ;
	
	// ?
    // width="500"
    // height="500"
    
    output += content ;
    output += '\n</svg>\n' ;
    
    return output ;
} ;



svg.toAreaArray = function toAreaArray( object )
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


