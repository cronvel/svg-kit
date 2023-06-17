#!/usr/bin/env node

"use strict" ;

const opentype = require( 'opentype.js' ) ;
const font = opentype.loadSync( 'font.ttf' ) ;


var path = font.getPath( 'Hello!' , 0 , 50 , 30 ) ;

console.log( '<svg>' ) ;
console.log( path.toSVG() ) ;
console.log( '</svg>' ) ;



