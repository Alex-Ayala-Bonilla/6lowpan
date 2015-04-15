
/*

author: jesus alejandro ayala bonillta
mail: ing.jaab@gmail.com

Pattern    Header Type
         +------------+-----------------------------------------------+
         | 00  xxxxxx | NALP       - Not a LoWPAN frame               |
         | 01  000001 | IPv6       - Uncompressed IPv6 Addresses      |
         | 01  000010 | LOWPAN_HC1 - LOWPAN_HC1 compressed IPv6       |
         | 01  000011 | reserved   - Reserved for future use          |
         |   ...      | reserved   - Reserved for future use          |
         | 01  001111 | reserved   - Reserved for future use          |
         | 01  010000 | LOWPAN_BC0 - LOWPAN_BC0 broadcast             |
         | 01  010001 | reserved   - Reserved for future use          |
         |   ...      | reserved   - Reserved for future use          |
         | 01  111110 | reserved   - Reserved for future use          |
         | 01  111111 | ESC        - Additional Dispatch byte follows |
         | 10  xxxxxx | MESH       - Mesh Header                      |
         | 11  000xxx | FRAG1      - Fragmentation Header (first)     |
         | 11  001000 | reserved   - Reserved for future use          |
         |   ...      | reserved   - Reserved for future use          |
         | 11  011111 | reserved   - Reserved for future use          |
         | 11  100xxx | FRAGN      - Fragmentation Header (subsequent)|
         | 11  101000 | reserved   - Reserved for future use          |
         |   ...      | reserved   - Reserved for future use          |
         | 11  111111 | reserved   - Reserved for future use          |
         +------------+-----------------------------------------------+


*/


var bitmagic = require('bitmagic');

var patternType = {
	'Not a LOWPAN Frame' : 0,
	'IPv6' : 1,
	'LOWPAN_HC1' : 2,
	'LOWPAN_BC0' : 3,
	'LOWPAN_IPHC' : 4,
	'MESH' : 5,
	'FRAG1' : 6,
	'FRAGN' : 7
};

var offset = 1;




function parseIphc(buf){

	// store the actual buffer
	this.buf = buf;
	this.offset = offset;

	this.iphc = function() {

		var parse = {};
		offset++;
		var buf = this.buf;

		var Byte = buf.slice(0 ,offset);
		//header
		parse.tf = bitmagic.extractBitsFromByte(Byte, 4, 5);
		parse.nh = bitmagic.extractBitsFromByte(Byte, 6);
		parse.hlim = bitmagic.extractBitsFromByte(Byte, 7, 8);
		parse.cid = bitmagic.extractBitsFromByte(Byte, 9);
		parse.sac = bitmagic.extractBitsFromByte(Byte, 10);
		parse.sam = bitmagic.extractBitsFromByte(Byte, 11, 12);
		parse.m = bitmagic.extractBitsFromByte(Byte, 13);
		parse.dac = bitmagic.extractBitsFromByte(Byte, 14);
		parse.dam = bitmagic.extractBitsFromByte(Byte, 15, 16);
		
		if (parse.cid.value === 1){
			offset++;
			parse.sci = bitmagic.extractBitsFromByte(this.buf.slice(2, offset),1,4);
			parse.dci = bitmagic.extractBitsFromByte(this.buf.slice(2, offset), 5, 8);
			this.offset = offset;
		}

		// store parse
		this.parse = parse;
		this.offset = offset;

		return parse;
	};



	// in line fields

	this.inlineHeader = function(){

		var parse = {};

		// check if the context id fields are present
		offset = 2 + this.parse.cid.value;

		var buf = this.buf;

		switch(this.parse.tf.value){
			case 0:
				parse.tf = {};
				var Byte = buf.slice(offset, offset + 4);
				parse.tf.ecn = bitmagic.extractBitsFromByte(Byte, 1 , 2);
				parse.tf.dscp = bitmagic.extractBitsFromByte(Byte, 3, 8);
				parse.tf.rsv = bitmagic.extractBitsFromByte(Byte, 9 , 12);
				parse.tf.flowLabel = bitmagic.extractBitsFromByte(Byte, 13, 32);
				offset+=4;
			break;
			case 1:
				parse.tf = {};
				var Byte = buf.slice(offset, offset + 3);
				parse.tf.ecn = bitmagic.extractBitsFromByte(Byte, 1 , 2);
				parse.tf.rsv = bitmagic.extractBitsFromByte(Byte, 3 , 4);
				parse.tf.flowLabel = bitmagic.extractBitsFromByte(Byte, 5, 24);
				offset+=3;
			break;
			case 2:
				parse.tf = {}; 
				var Byte = buf.slice(offset, offset + 1);
				parse.tf.ecn = bitmagic.extractBitsFromByte(Byte, 1 , 2);
				parse.tf.dscp = bitmagic.extractBitsFromByte(Byte, 3 , 8);
				offset++;
		}

		if (this.parse.nh.value === 0){
			// todo , add the definition for each value
			parse.nh = bitmagic.extractBitsFromByte(buf.slice(offset, offset + 1), 1, 8);
			offset++;
		}


		if (this.parse.hlim.value === 0){
			parse.hlim = bitmagic.extractBitsFromByte(buf.slice(offset, offset+ 1), 1, 8);
			offset++;
		}


		
		if(this.parse.sac.value === 0){

			switch(this.parse.sam.value){
				// full 128 bits
				case 0:
					parse.sourceAddress = buf.slice(offset, offset + 16);
					offset+=16;
					break;
				// 64 bits
				case 1:
					parse.sourceAddress = buf.slice(offset, offset + 8);
					offset+=8;
					break;
				// 16 bits	
				case 2:
					parse.sourceAddress = buf.slice(offset, offset + 2);
					offset+=2;
					break;
				
			}

		}
		else{
			// 64 bits
			if (this.parse.sam.value === 0){
				parse.sourceAddress = buf.slice(offset, offset + 8);
				offset+=8;
			}
			else if(this.parse.sam.value === 2){
				parse.sourceAddress = buf.slice(offset, offset + 2);
				offset += 2;
			}
		}

		// destination address
		if(this.parse.m.value === 0){
			if(this.parse.dac.value === 0){
				switch(this.parse.dam.value){
					case 0:
						parse.destAddress = buf.slice(offset, offset + 16);
						offset += 16;
						break;
					case 1:
						parse.destAddress = buf.slice(offset, offset + 8);
						offset += 8;
						break;
					case 2:
						parse.destAddress = buf.slice(offset, offset + 2);
						offset+=2;
						break;
				}
			}
			else{
				switch(this.parse.dam.value){
					case 1:
						parse.destAddress = buf.slice(offset, offset + 8);
						offset += 8;
						break;
					case 1:
						parse.destAddress = buf.slice(offset, offset + 2);
						offset += 2;
						break;
				}
			}
		}
		else{
			if(this.parse.dac.value === 0){
				switch(this.parse.dam.value){
					case 0:
						parse.destAddress = buf.slice(offset, offset + 16);
						offset += 16;
						break;
					case 1:
						parse.destAddress = buf.slice(offset, offset + 6);
						offset += 6;
						break;
					case 2:
						parse.destAddress = buf.slice(offset, offset + 4);
						offset+=4;
						break;
					case 3:
						parse.destAddress = buf.slice(offset, offset + 1);
						offset++;
				}
			}
			else{
				if(this.parse.dam.value === 0){
					parse.destAddress = buf.slice(offset, offset + 6);
					offset+=6;
				}
			}
		}

	this.offset = offset;

	return parse;

	};// inline header

	
};


var createParse = function(buf){

	var parse = {};


	var pattern = bitmagic.extractBitsFromByte(buf.slice(0, offset), 1, 2);
	
	
	/*  Pattern */

	// Is not a LOWPAN frame
	if (pattern.value === 0){
		parse.pattern = 'Not a LOWPAN Frame';
		parse.payload = buf.slice(offset++, buf.length);
		return parse;
	}
	else if(pattern.value === 1){
		pattern = bitmagic.extractBitsFromByte(buf.slice(0, offset), 3, 8 ); 
		// IPv6 Uncompressed IPv6 Address
		if (pattern.value === 1 ){parse.pattern = 'IPv6';}
		else if(pattern.value === 2){parse.pattern = 'LOWPAN_HC1';}
		else if(pattern.value === 16){parse.pattern = 'LOWPAN_BC0';}
		else if(bitmagic.extractBitsFromByte(buf.slice(0, offset), 3).value === 1) {parse.pattern = 'LOWPAN_IPHC';}
	}
	else if (pattern.value === 2){parse.pattern = 'MESH';}
	else if (pattern.value === 3){
		pattern = bitmagic.extractBitsFromByte(buf.slice(0, offset), 3, 5);
		if (pattern.value === 0){parse.pattern = 'FRAG1';}
		else if (pattern.value === 4) {parse.pattern = 'FRAGN'}
		else{
			parse.pattern = 'reserved';
			parse.payload = buf.slice(offset++, buf.length);	
		}	
		
	}
	else{
		parse.pattern = 'reserved';
		parse.payload = buf.slice(offset++, buf.length);
		return;
	}

	//parse.payload = buf.slice(offset++, buf.length );

	var patternType = {
	'Not a LOWPAN Frame' : 0,
	'IPv6' : 1,
	'LOWPAN_HC1' : 2,
	'LOWPAN_BC0' : 3,
	'LOWPAN_IPHC' : 4,
	'MESH' : 5,
	'FRAG1' : 6,
	'FRAGN' : 7
};
	/* Dispatch header */
	switch(patternType[parse.pattern]){
		case patternType['Not a LOWPAN Frame']:
		break;

		case patternType['IPv6']:
		break;

		case patternType['LOWPAN_HC1']:
		break;

		case patternType['LOWPAN_BC0']:
		break;

		case patternType['LOWPAN_IPHC']:
			var iphc = new parseIphc(new Buffer(buf));
			parse.iphc = iphc.iphc();
			parse.inline = iphc.inlineHeader();

		break;

		case patternType['MESH']:
		break;

		case patternType['FRAG1']:
		break;

		case patternType['FRAGN']:
		break;
	}

	parse.payload = buf.slice(iphc.offset, buf.length);
	return parse;
};



exports.parse = function(buf, callback){

	try {
		var data = createParse(buf);
	}
	catch(err) {
		callback(undefined, err)
	}

	callback(data, undefined);


};



