# 6lowpan
A nodejs module to parse, create and test 6lowpan frames.
Version 0.0.4 alpha

## Installation

Via npm:

    npm install 6lowpan
    
## Features
 * Initial iphc parse, iphc header and inline header

## Examples

```js
var sixlo = require('6lowpan');


	sixlo.parse(frameBuffer, function(data, error){
		console.log(data.pattern); // LOWPAN_IPHC
		console.log(data.iphc); // the iphc header 
		console.log(data.inline); // inline Header
		console.log(data.payload); // the payload remaining
	});

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

