/*
	bitmagic - this module is used handled bits
	 
 *
 * @author Alex Ayala<ing.jaab@ugmail.com>

	


// 
*/	


exports.intToHexBuffer = function(int, length){

	var bytearray = [];

	for (var i=0; i < length; i++){
		bytearray.push(0);
	}

	for ( var index = 0; index < bytearray.length; index ++ ) {
        var byte = int & 0xff;
        bytearray [ index ] = byte;
        int = (int - byte) / 256 ;
    }

   	return buff = new Buffer(bytearray.reverse(), 'hex');
};



// extract a value from a flag mask where n is the first bit and m is the last m, if m is missiong only the n bit is require

exports.extractBitsFromByte = function(data, n, m){
	var counter = 1;
	var result = {};
	var bits = '';

	for (var j = 0; j < data.length ; j++){
		for (var i = 7; i >= 0; i--) {
			var bit = data[j] & (1 << i) ? 1 : 0;			
			
			if (counter === n && m === undefined){
				result.string = bit.toString();
				result.value = parseInt(result.string, 2); 
				return result;
			}
			else if (counter >= n && counter <= m){
				bits+=bit.toString();
			}
			counter++;
		}
	}

	result.string = bits;
	result.value = 	parseInt(result.string, 2);
	return result;
};

var test = function(){
	

	var buf = new Buffer('7f', 'hex');
	var value = exports.extractBitsFromByte(buf, 3);
	console.log(value.string);
	console.log(value.value);

};


/*TODOs

convert the bits string to number


*/