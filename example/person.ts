import { BinaryModel, DataType } from 'js-binary-model';

import * as util from 'util';

let Person = new BinaryModel({
  name: {
    type: DataType.STRING,
    required: true
  },
  emailAddress: {
    type: DataType.STRING,
    required: false
  },
  userType: DataType.UINT_8,
  balance: DataType.DOUBLE,
  createDate: DataType.DATE,
  metaData: DataType.JSON
});

let userEncode = Person.encode({
  name: 'My Name',
  emailAddress: 'my.name@mydomain.com',
  userType: 99,
  balance: 10000.25,
  createDate: new Date(2018,0,1,0,0,0,0),
  // metaData: null
  // metaData: {
  //   something: { else: true },
  //   anotherThing: 7283
  // }
});

console.log('Encoded: %s', util.inspect(userEncode.toString('base64'), true, null, true));

let userDecode = Person.decode(userEncode);

console.log('Decoded: %s', util.inspect(userDecode, true, null, true));
