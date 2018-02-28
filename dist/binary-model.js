"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SUPPORT_64 = true, DEFAULT_UNSIGNED = false, DEFAULT_BIG_ENDIEN = true;
var DataType;
(function (DataType) {
    DataType[DataType["NULL"] = 0] = "NULL";
    DataType[DataType["UNDEFINED"] = 1] = "UNDEFINED";
    DataType[DataType["STRING"] = 2] = "STRING";
    DataType[DataType["DATE"] = 3] = "DATE";
    DataType[DataType["JSON"] = 4] = "JSON";
    DataType[DataType["BOOLEAN"] = 5] = "BOOLEAN";
    DataType[DataType["UINT_64"] = 6] = "UINT_64";
    DataType[DataType["UINT_32"] = 7] = "UINT_32";
    DataType[DataType["UINT_16"] = 8] = "UINT_16";
    DataType[DataType["UINT_8"] = 9] = "UINT_8";
    DataType[DataType["INT_64"] = 10] = "INT_64";
    DataType[DataType["INT_32"] = 11] = "INT_32";
    DataType[DataType["INT_16"] = 12] = "INT_16";
    DataType[DataType["INT_8"] = 13] = "INT_8";
    DataType[DataType["FLOAT"] = 14] = "FLOAT";
    DataType[DataType["DOUBLE"] = 15] = "DOUBLE";
})(DataType = exports.DataType || (exports.DataType = {}));
;
;
;
;
;
;
/**
* Maintains a buffer of data in sequence.
*/
class DataBuffer {
    constructor(initial = new Buffer(0)) {
        this.buffer = initial;
    }
    /**
    * Clear the current data buffer.
    */
    clear() {
        this.buffer = new Buffer(0);
        return this;
    }
    /**
    * Append a new data entry to buffer.
    */
    append(type, value) {
        this.buffer = DataBuffer.append(type, value, this.buffer);
        return this;
    }
    /**
    * Create a buffer iteration function from current buffer state.
    */
    createIterator() {
        return DataBuffer.createIterator(this.buffer);
    }
    /**
    * Read all data chunks from buffer.
    */
    chunks() {
        let chunks = [], item = false, iterator = this.createIterator();
        while ((item = iterator()) !== false)
            chunks.push(item);
        return chunks;
    }
    /**
    * Read all data values from buffer.
    */
    values() {
        let chunks = [], item = false, iterator = this.createIterator();
        while ((item = iterator()) !== false)
            chunks.push(item.data);
        return chunks;
    }
    /**
    * Create a buffer iteration function.
    */
    static createIterator(buffer) {
        let cursor = 0;
        return () => {
            let chunk = DataBuffer.readNextChunk(buffer.slice(cursor));
            if (!chunk)
                return false;
            cursor += chunk.chunkSize;
            return chunk;
        };
    }
    /**
    * Concat multiple buffers together.
    */
    static concat(...args) {
        return Buffer.concat(args);
    }
    /**
    * Append a new STRING chunk to a buffer.
    */
    static appendString(appendTo, value, encoding = 'utf8') {
        return DataBuffer.concat(appendTo, new Buffer(value, encoding));
    }
    /**
    * Append a new INTEGER chunk to a buffer.
    */
    static appendInt(appendTo, value, byteSize = 6, unsigned = DEFAULT_UNSIGNED, bigEndien = DEFAULT_BIG_ENDIEN) {
        if (isNaN(value))
            throw new TypeError('NaN can not be appended to a buffer.');
        if (!isFinite(value))
            throw new TypeError('Only finite numbers can be appended to a buffer.');
        let temp = new Buffer(byteSize), fn = (unsigned ? (bigEndien ? temp.writeUIntBE : temp.writeUIntLE) : (bigEndien ? temp.writeIntBE : temp.writeIntLE));
        fn.call(temp, value, 0, byteSize);
        return DataBuffer.concat(appendTo, temp);
    }
    /**
    * Append a new INT64 chunk to a buffer.
    */
    static appendInt64(appendTo, value, unsigned, bigEndien) {
        return DataBuffer.appendInt(appendTo, value, 6, unsigned, bigEndien);
    }
    /**
    * Append a new INT32 chunk to a buffer.
    */
    static appendInt32(appendTo, value, unsigned, bigEndien) {
        return DataBuffer.appendInt(appendTo, value, 4, unsigned, bigEndien);
    }
    /**
    * Append a new INT16 chunk to a buffer.
    */
    static appendInt16(appendTo, value, unsigned, bigEndien) {
        return DataBuffer.appendInt(appendTo, value, 2, unsigned, bigEndien);
    }
    /**
    * Append a new INT8 chunk to a buffer.
    */
    static appendInt8(appendTo, value, unsigned, bigEndien) {
        return DataBuffer.appendInt(appendTo, value, 1, unsigned, bigEndien);
    }
    /**
    * Append a new FLOAT chunk to a buffer.
    */
    static appendFloat(appendTo, value, bigEndien = DEFAULT_BIG_ENDIEN) {
        let temp = new Buffer(4), fn = bigEndien ? temp.writeFloatBE : temp.writeFloatLE;
        fn.call(temp, value, 0);
        return DataBuffer.concat(appendTo, temp);
    }
    /**
    * Append a new DOUBLE chunk to a buffer.
    */
    static appendDouble(appendTo, value, bigEndien = DEFAULT_BIG_ENDIEN) {
        let temp = new Buffer(8), fn = bigEndien ? temp.writeDoubleBE : temp.writeDoubleLE;
        fn.call(temp, value, 0);
        return DataBuffer.concat(appendTo, temp);
    }
    /**
    * Append a new chunk to a buffer.
    */
    static append(type, value, buf = new Buffer(0)) {
        let offset = 0, data = new Buffer(0);
        data = DataBuffer.appendInt8(data, type, true);
        switch (type) {
            case DataType.JSON:
                value = JSON.stringify(value);
            case DataType.STRING:
                if (typeof value === 'string') {
                    data = SUPPORT_64 ? DataBuffer.appendInt64(data, value.length, true) : DataBuffer.appendInt32(data, value.length, true);
                    data = DataBuffer.appendString(data, value);
                }
                else
                    throw new TypeError(`Expected "string" but got "${typeof value}" instead.`);
                break;
            case DataType.BOOLEAN:
                if (typeof value === 'boolean')
                    data = DataBuffer.appendInt8(data, value ? 1 : 0, true);
                else
                    throw new TypeError(`Expected "boolean" but got "${typeof value}" instead.`);
                break;
            case DataType.DATE:
                if (typeof value === 'object' && value instanceof Date) {
                    let timestamp = value.toISOString();
                    data = DataBuffer.appendInt8(data, timestamp.length, true);
                    data = DataBuffer.appendString(data, timestamp);
                }
                else
                    throw new TypeError(`Expected "object:Date" but got "${typeof value}" instead.`);
                break;
            case DataType.UINT_64:
            case DataType.UINT_32:
            case DataType.UINT_16:
            case DataType.UINT_8:
            case DataType.INT_64:
            case DataType.INT_32:
            case DataType.INT_16:
            case DataType.INT_8:
            case DataType.FLOAT:
            case DataType.DOUBLE:
                if (typeof value !== 'number')
                    throw new TypeError(`Expected "number" but got "${typeof value}" instead.`);
                if (type === DataType.FLOAT) {
                    data = DataBuffer.appendFloat(data, value);
                    break;
                }
                else if (type === DataType.DOUBLE) {
                    data = DataBuffer.appendDouble(data, value);
                    break;
                }
                let bytes = 1, unsigned = [DataType.UINT_64, DataType.UINT_32, DataType.UINT_16, DataType.UINT_8].indexOf(type) > -1;
                bytes = (type === DataType.INT_64 || type === DataType.UINT_64) ? 6 : bytes;
                bytes = (type === DataType.INT_32 || type === DataType.UINT_32) ? 4 : bytes;
                bytes = (type === DataType.INT_16 || type === DataType.UINT_16) ? 2 : bytes;
                bytes = (type === DataType.INT_8 || type === DataType.UINT_8) ? 1 : bytes;
                if (bytes > 4 && !SUPPORT_64)
                    bytes = 4; // 32bit max
                data = DataBuffer.appendInt(data, value, bytes, unsigned);
                break;
        }
        return DataBuffer.concat(buf, data);
    }
    /**
    * Read an integer from a buffer
    */
    static readInt(buffer, offset, byteSize = 6, unsigned = DEFAULT_UNSIGNED, bigEndien = DEFAULT_BIG_ENDIEN) {
        let fn = (unsigned ? (bigEndien ? buffer.readUIntBE : buffer.readUIntLE) : (bigEndien ? buffer.readIntBE : buffer.readIntLE));
        return fn.call(buffer, offset, byteSize);
    }
    /**
    * Read an INT64 chunk in buffer.
    */
    static readInt64(buffer, offset, unsigned, bigEndien) {
        return DataBuffer.readInt(buffer, offset, 6, unsigned, bigEndien);
    }
    /**
    * Read an INT32 chunk in buffer.
    */
    static readInt32(buffer, offset, unsigned, bigEndien) {
        return DataBuffer.readInt(buffer, offset, 4, unsigned, bigEndien);
    }
    /**
    * Read an INT16 chunk in buffer.
    */
    static readInt16(buffer, offset, unsigned, bigEndien) {
        return DataBuffer.readInt(buffer, offset, 2, unsigned, bigEndien);
    }
    /**
    * Read an INT8 chunk in buffer.
    */
    static readInt8(buffer, offset, unsigned, bigEndien) {
        return DataBuffer.readInt(buffer, offset, 1, unsigned, bigEndien);
    }
    /**
    * Read a float from a buffer
    */
    static readFloat(buffer, offset, bigEndien = DEFAULT_BIG_ENDIEN) {
        let fn = bigEndien ? buffer.readFloatBE : buffer.readFloatLE;
        return fn.call(buffer, offset);
    }
    /**
    * Read a double from a buffer
    */
    static readDouble(buffer, offset, bigEndien = DEFAULT_BIG_ENDIEN) {
        let fn = bigEndien ? buffer.readDoubleBE : buffer.readDoubleLE;
        return fn.call(buffer, offset);
    }
    /**
    * Reads the next chunk from a buffer.
    */
    static readNextChunk(buf) {
        let offset = 0, chunkSize = 0, dataSize = 0, dataType, data;
        if (buf.length > 0) {
            dataType = DataBuffer.readInt8(buf, offset, true);
            offset++;
            switch (dataType) {
                case DataType.NULL:
                    data = null;
                    break;
                case DataType.UNDEFINED:
                    data = undefined;
                    break;
                case DataType.JSON:
                case DataType.STRING:
                    dataSize = SUPPORT_64 ? DataBuffer.readInt64(buf, offset, true) : DataBuffer.readInt32(buf, offset, true);
                    offset += SUPPORT_64 ? 6 : 4;
                    data = buf.slice(offset, offset + dataSize).toString('utf8');
                    if (data.length !== dataSize)
                        throw new RangeError(`Mismatching string length (got ${data.length}, expected ${dataSize}).`);
                    if (dataType === DataType.JSON)
                        data = JSON.parse(data);
                    break;
                case DataType.DATE:
                    dataSize = DataBuffer.readInt8(buf, offset, true);
                    offset++;
                    let timestamp = buf.slice(offset, offset + dataSize).toString('utf8'), millisec = Date.parse(timestamp);
                    if (isNaN(millisec))
                        throw new RangeError(`Failed to decode date (${timestamp}).`);
                    data = new Date(millisec);
                    break;
                case DataType.BOOLEAN:
                    dataSize = 1;
                    data = DataBuffer.readInt8(buf, offset, true) === 1;
                    break;
                case DataType.UINT_64:
                case DataType.UINT_32:
                case DataType.UINT_16:
                case DataType.UINT_8:
                case DataType.INT_64:
                case DataType.INT_32:
                case DataType.INT_16:
                case DataType.INT_8:
                case DataType.FLOAT:
                case DataType.DOUBLE:
                    if (dataType === DataType.FLOAT) {
                        dataSize = 4;
                        data = DataBuffer.readFloat(buf, offset);
                        break;
                    }
                    else if (dataType === DataType.DOUBLE) {
                        dataSize = 8;
                        data = DataBuffer.readDouble(buf, offset);
                        break;
                    }
                    let unsigned = [DataType.UINT_64, DataType.UINT_32, DataType.UINT_16, DataType.UINT_8].indexOf(dataType) > -1;
                    dataSize = (dataType === DataType.INT_64 || dataType === DataType.UINT_64) ? 6 : dataSize;
                    dataSize = (dataType === DataType.INT_32 || dataType === DataType.UINT_32) ? 4 : dataSize;
                    dataSize = (dataType === DataType.INT_16 || dataType === DataType.UINT_16) ? 2 : dataSize;
                    dataSize = (dataType === DataType.INT_8 || dataType === DataType.UINT_8) ? 1 : dataSize;
                    data = DataBuffer.readInt(buf, offset, dataSize, unsigned);
                    break;
                default:
                    throw new RangeError(`Unsupported column type (${dataType})`);
            }
            chunkSize = dataSize + offset;
        }
        else
            return false;
        return { chunkSize, dataSize, dataType, data };
    }
    /**
    * Read all chunks from a buffer.
    */
    static readChunks(buf) {
        let result = [], offset = 0;
        while (true) {
            let chunk = DataBuffer.readNextChunk(buf.slice(offset));
            if (!chunk)
                break;
            // console.log('Type: %s, Offset: %d, Chunk size: %d, Data size: %d, Data: %j', DataType[chunk.dataType], offset, chunk.chunkSize, chunk.dataSize, chunk.data);
            result.push(chunk.data);
            offset += chunk.chunkSize;
        }
        return result;
    }
}
exports.DataBuffer = DataBuffer;
;
/**
* Main binary model class, which transforms simple objects into binary buffers and vice versa.
*/
class BinaryModel {
    /**
    * Construct a new binary model from a spec.
    */
    constructor(spec) {
        this.columnKeys = [];
        this.columnOptions = [];
        Object.keys(spec).forEach(key => {
            let options;
            if (typeof spec[key] === 'number')
                options = { type: spec[key] };
            else
                options = spec[key];
            this.setKey(key, options);
        });
    }
    /**
    * Get index of schema key.
    */
    indexOfKey(key) {
        return this.columnKeys.indexOf(key);
    }
    /**
    * set the property options for a key index
    */
    setOptions(keyIndex, options) {
        if (!this.columnOptions.hasOwnProperty(keyIndex))
            return false;
        this.columnOptions[keyIndex] = options;
        return true;
    }
    /**
    * Check if a key exists already
    */
    hasKey(key) {
        return this.indexOfKey(key) > -1;
    }
    /**
    * Add a new key to schema
    */
    setKey(key, options) {
        let keyIndex = this.indexOfKey(key);
        if (keyIndex > -1) {
            this.setOptions(keyIndex, options);
            return; // throw new RangeError(`Key (${key}) has already been added.`);
        }
        this.columnKeys.push(key);
        this.columnOptions.push(options);
    }
    /**
    * Remove a key for this model spec.
    */
    removeKey(key) {
        let index = this.indexOfKey(key);
        if (index === -1)
            return;
        this.columnKeys.splice(index, 1);
        this.columnOptions.splice(index, 1);
    }
    /**
    * Get options for a schema key.
    */
    getOptions(key) {
        let index = -1;
        if (typeof key === 'string')
            index = this.indexOfKey(key);
        else if (typeof key === 'number')
            index = key;
        if (this.columnOptions.hasOwnProperty(index))
            return this.columnOptions[index];
        return false;
    }
    /**
    * Encode a simple object into a binary buffer.
    */
    encode(obj) {
        let encoded = new DataBuffer();
        this.columnKeys.forEach((key, keyIndex) => {
            let value = obj[key], isNull = (value === null), isUndefined = (value === undefined), options = this.getOptions(keyIndex);
            if (!options)
                return;
            if (options.required && (isNull || isUndefined))
                throw new TypeError(`Column "${key}" is required but was not defined or null.`);
            if (isNull)
                encoded.append(DataType.NULL, undefined);
            else if (isUndefined)
                encoded.append(DataType.UNDEFINED, undefined);
            else
                encoded.append(options.type, value);
        });
        return encoded.buffer;
    }
    /**
    * Decode an encoded buffer back into a simple object.
    */
    decode(data) {
        let obj = {}, iterator = DataBuffer.createIterator(data);
        this.columnKeys.forEach((key, keyIndex) => {
            let chunk = iterator(), options = this.columnOptions[keyIndex];
            if (!chunk)
                throw new RangeError(`Failed to read data chunk for key "${key}"`);
            if (options.required && (chunk.dataType === DataType.NULL || chunk.dataType === DataType.UNDEFINED))
                throw new TypeError(`Column "${key}" is required but was not defined or null.`);
            obj[key] = chunk.data;
        });
        return obj;
    }
}
exports.BinaryModel = BinaryModel;
;
exports.default = BinaryModel;
