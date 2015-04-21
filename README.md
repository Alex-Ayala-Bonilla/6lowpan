# 6lowpan
A nodejs module to parse, create and test 6lowpan frames.
Version 0.0.4 alpha

## Installation

Via npm:

    npm install 6lowpan
    
## Features
 * Initial iphc parse, iphc header and inline header

## Examples

### Example 1

```js
var frameBuffer = new Buffer('60ffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');

var sixlo = require('6lowpan');


	sixlo.parse(frameBuffer, function(data, error){
		console.log(data.pattern); // LOWPAN_IPHC
		console.log(data.iphc); // the iphc header 
		console.log(data.inline); // inline Header
		console.log(data.payload); // the payload remaining
	});

```

### Example 2

```js
var frameBuffer = new Buffer('60ffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');

var sixlo = require('6lowpan');

var parse = new sixlo.iphc(frameBuffer);
var type = parse.type();
console.log('Pattern: ' + type);
console.log(type === 'LOWPAN_IPHC'); //true
console.log(type === 'IPv6' ); // false
console.log(type === 'LOWPAN_HC1' ); // false
console.log(type === 'LOWPAN_BC0' ); // false
console.log(type === 'ESC' ); // false
console.log(type === 'MESH' ); // false
console.log(type === 'FRAG1' ); // false
console.log(type === 'FRAGN' ); // false
console.log(parse.iphc());
console.log(parse.inlineHeader());
console.log(parse.payload());


```


## TODOs
  * Add Extension Headers
  * Add more documentation
  * Add IPv6 - Uncompressed IPv6 Addresses
  * Add LOWPAN_HC1 - LOWPAN_HC1 compressed IPv6
  * Add LOWPAN_BC0 - LOWPAN_BC0 broadcast
  * Add MESH       - Mesh Header
  * Add FRAG1      - Fragmentation Header (first) 
  * Add FRAGN      - Fragmentation Header (subsequent)
  * Add descriptions for each field of the iphc header.
  * Validator of 6lowpan frame.
  * Desfragmentation
  * Functionality to create a 6lowpan frame from user data (json config)
   
## History

### 0.0.4 Initial Commit

 * Initial Commit
 * nitial iphc parse, iphc header and inline header.
  
### 0.0.5 Updates

 * Object functionality.
 * Update example 2.


