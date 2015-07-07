
/*

~extensions module, a 6lowpan extensions 6282 module [RFC 6282]
author: jesus alejandro ayala bonilla
mail: ing.jaab@gmail.com

*/
var bitmagic = require('bitmagic');

var eidValue = {
   'IPv6 Hop-by-Hop Options Header': 0,
   'IPv6 Routing Header': 1,
   'IPv6 Fragment Header': 2,
   'IPv6 Destination Options Header': 3,
   'IPv6 Mobility Header': 4,
   'IPv6 Header': 7


};

var extractTlvs = function(buf){

   var tlvs = [];
   var offset = 0;

   while(offset < buf.length){
      var tlv = {};
      tlv.type = buf.readUInt8(offset);
      tlv.length = buf.readUInt8(offset++);
      tlv.data = buf.slice(offset++, tlv.length - 1)
      tlvs.push(tlv);
   }

   return tlvs;
};

var extension = function(buf, offset){

   var header = buf.slice(offset, offset + 1);
   var ex = {};
   offset++;
   ex.parse = {};
   ex.parse.nhId = bitmagic.extractBitsFromByte(header, 1, 4);
   //ipv6 extension header
   if (ex.parse.nhId.value === 14){

      ex.parse.eid = bitmagic.extractBitsFromByte(header, 5 , 7);


      switch(ex.parse.eid.value){
         case  eidValue['IPv6 Hop-by-Hop Options Header']:
               ex.parse.nh = bitmagic.extractBitsFromByte(header, 8);
               ex.parse.header ={};
               ex.parse.header.nextHeader =  buf.slice(offset, offset + 1);
               offset++;

               //header
               ex.parse.hopByHop = {};
               ex.parse.hopByHop.nextHeader = buf.slice(offset, offset++);
               ex.parse.hopByHop.length = buf.readUInt8(offset);
               offset++;
               ex.parse.hopByHop.optionsPayload = buf.slice(offset, offset + ex.parse.hopByHop.length);
               offset = offset + ex.parse.hopByHop.length + 1;
               ex.parse.hopByHop.options = extractTlvs(ex.parse.hopByHop.optionsPayload);
         break;
         
         case  eidValue['IPv6 Routing Header']:
               ex.parse.nh = bitmagic.extractBitsFromByte(header, 8);
               ex.parse.header = {};
               ex.parse.header.nextHeader = buf.readUInt8(offset);            

               //header
               ex.parse.routing = {};
               ex.parse.routing.nextHeader = buf.readUInt8(offset++);
               ex.parse.routing.length = buf.readUInt8(offset++);
               ex.parse.routing.type = buf.readUInt8(offset++);
               ex.parse.routing.type = buf.readUInt8(offset++);
               ex.parse.routing.data = buf.slice(offset++, offset + ex.parse.routing.length - 1);
               offset+= ex.parse.routing.length;

            break;

         case  eidValue['IPv6 Fragment Header']:
               ex.parse.nh = bitmagic.extractBitsFromByte(header, 8);
               ex.parse.header = {};
               ex.parse.header.nextHeader = buf.readUInt8(offset);

               //header
               ex.parse.fragmentHeader = {};
               ex.parse.fragmentHeader.reserverd = buf.readUInt8(offset++);
               offset++;
               var Byte = buf.slice(offset, offset+=2);
               ex.parse.fragmentHeader.fragmentOffset = bitmagic.extractBitsFromByte(Byte, 1, 13);
               ex.parse.fragmentHeader.Res = bitmagic.extractBitsFromByte(Byte, 14, 15);
               ex.parse.fragmentHeader.M = bitmagic.extractBitsFromByte(Byte, 16);
               ex.parse.fragmentHeader.identification = buf.slice(offset++, offset+= 4);
               offset++;
            break;

         case  eidValue['IPv6 Destination Options Header']:
               ex.parse.nh = bitmagic.extractBitsFromByte(header, 8);
               ex.parse.header = {};
               ex.parse.header.nextHeader = buf.readUInt8(offset);

               //header
               ex.parse.dstOptsHeader = {};
               ex.parse.dstOptsHeader.length = buf.readUInt8(offset++);
               ex.parse.dstOptsHeader.optionsPayload = buf.slice(offset++, offset + ex.parse.dstOptsHeader.length);
               ex.parse.dstOptsHeader.options = extractTlvs(ex.parse.dstOptsHeader.optionsPayload);
               offset = offset + ex.parse.hopByHop.length + 1;

            break;
         case  eidValue['IPv6 Mobility Header']:
               ex.parse.nh = bitmagic.extractBitsFromByte(header, 8);
               ex,parse.header = {};
               ex.parse.header.nextHeader = buf.readUInt8(offset);

               //header
               ex.parse.mobilityHeader = {};
               ex.parse.mobilityHeader.payloadProto = buf.readUInt8(offset++);
               ex.parse.mobilityHeader.length = buf.readUInt8(offset++);
               ex.parse.mobilityHeader.mhType = buf.readUInt8(offset++);
               ex.parse.mobilityHeader.reserverd = buf.readUInt8(offset++);
               ex.parse.mobilityHeader.checksum = buf.slice(offset++, offset++);
               ex.parse.mobilityHeader.messageData = buf.slice(offset++, offset + ex.parse.mobilityHeader.length - 1 );
               offset = offset + ex.parse.hopByHop.length + 1;


            break;
         case  eidValue['IPv6  Header']:
               ex.parse.nh = bitmagic.extractBitsFromByte(header, 8);

               //header
               ex.parse.ipv6header = {};
               var Byte = buf.slice(offset, offset += 3);
               ex.parse.ipv6header.version =  bitmagic.extractBitsFromByte(Byte, 1, 4);
               ex.parse.ipv6header.trafficClass = bitmagic.extractBitsFromByte(Byte, 5, 12);
               ex.parse.ipv6header.flowLabel = bitmagic.extractBitsFromByte(Byte, 13, 32);
               ex.parse.ipv6header.payloadLength = buf.readUInt16BE(offset++);
               offset+=2;
               ex.parse.ipv6header.nextHeader = buf.readUInt8(offset);
               ex.parse.ipv6header.hopLimit = buf.readUInt8(offset++);
               ex.parse.ipv6header.sourceAddress = buf.slice(offset++, offset += 16);
               ex.parse.ipv6header.sourceAddress = buf.slice(offset++, offset +=16);
               offset++;               
            break;

      }
   } // udp header compression
   else if (ex.parse.nhId.value === 15){
      
      if (bitmagic.extractBitsFromByte(header, 5).value  === 0 ){
         ex.parse.headerName = 'UDP LOWPAN_NHC';
         ex.parse.C = bitmagic.extractBitsFromByte(header, 6);
         ex.parse.P = bitmagic.extractBitsFromByte(header, 7, 8);

         ex.parse.udp = {};
         
         

         // ports
         switch(ex.parse.P.value){
            case 0:
                  ex.parse.udp.srcPort = buf.slice(offset, offset+=2);
                  ex.parse.udp.dstPort = buf.slice(offset, offset+=2);
               break;
            case 1:
                  ex.parse.udp.srcPort = buf.slice(offset, offset +=2);
                  ex.parse.udp.dstPort = Buffer.concat(new Buffer('f0', 'hex'),buf.slice(offset, offset++));
               break;
            case 2:
                  ex.parse.udp.srcPort = Buffer.concat(new Buffer('f0', 'hex'),buf.slice(offset, offset++));
                  ex.parse.udp.dstPort = buf.slice(offset, offset +=2);
               break;
            case 3:
                  var ports = buf.slice(offset, offset++);
                  var source = bitmagic.extractBitsFromByte(ports, 1 , 4).value;
                  var dest = bitmagic.extractBitsFromByte(ports, 4, 8);
                  ex.parse.udp.srcPort = new Buffer('f0b' + source.toString(16), 'hex');
                  ex.parse.udp.dstPort = new Buffer('f0b' + dest.toString(16), 'hex');
               break;
         }

         //checksum
         if (ex.parse.C.value === 0){            
            ex.parse.udp.checksum = buf.slice(offset, offset+= 2);
         }

         ex.parse.nh = 0;
      }
      else return undefined;

   }

   ex.offset = offset;

   return ex;

};


var parseEx = function(buf, offset, ref){

   // nh bit is enabled, the next header is using LOWPAN_NHC Encoding

   if (ref.nh.value === 1){
      var nh = 1;
      var extensions = [];
      

      while(nh){

         var ex = extension(buf, offset);
         extensions.push(ex.parse);
         offset = ex.offset;
         nh = ex.parse.nh;
      }

      var value = {};
      value.extensions = extensions;
      value.offset = offset;
      return value;

   }
   else return undefined;
};






exports.parse = function(buf, offset, ref){
   return parseEx(buf, offset, ref);
};