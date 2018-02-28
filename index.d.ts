/// <reference types="node" />
export declare enum DataType {
    NULL = 0,
    UNDEFINED = 1,
    STRING = 2,
    DATE = 3,
    JSON = 4,
    BOOLEAN = 5,
    UINT_64 = 6,
    UINT_32 = 7,
    UINT_16 = 8,
    UINT_8 = 9,
    INT_64 = 10,
    INT_32 = 11,
    INT_16 = 12,
    INT_8 = 13,
    FLOAT = 14,
    DOUBLE = 15,
}
export interface IDataTypeOptions {
    type: DataType;
    required?: boolean;
}
export interface IBinaryModelSpec {
    [key: string]: DataType | IDataTypeOptions;
}
export interface IAnyObject {
    [key: string]: any;
}
export interface IBufferChunk {
    chunkSize: number;
    dataSize: number;
    dataType: DataType;
    data: any;
}
export interface IIteratorFunction<T> {
    (): T;
}
/**
* Maintains a buffer of data in sequence.
*/
export declare class DataBuffer {
    buffer: Buffer;
    constructor(initial?: Buffer);
    /**
    * Clear the current data buffer.
    */
    clear(): DataBuffer;
    /**
    * Append a new data entry to buffer.
    */
    append(type: DataType, value?: any): DataBuffer;
    /**
    * Create a buffer iteration function from current buffer state.
    */
    createIterator(): IIteratorFunction<IBufferChunk | false>;
    /**
    * Read all data chunks from buffer.
    */
    chunks(): IBufferChunk[];
    /**
    * Read all data values from buffer.
    */
    values(): any[];
    /**
    * Create a buffer iteration function.
    */
    static createIterator(buffer: Buffer): IIteratorFunction<IBufferChunk | false>;
    /**
    * Concat multiple buffers together.
    */
    static concat(...args: Buffer[]): Buffer;
    /**
    * Append a new STRING chunk to a buffer.
    */
    static appendString(appendTo: Buffer, value: string, encoding?: string): Buffer;
    /**
    * Append a new INTEGER chunk to a buffer.
    */
    static appendInt(appendTo: Buffer, value: number, byteSize?: number, unsigned?: boolean, bigEndien?: boolean): Buffer;
    /**
    * Append a new INT64 chunk to a buffer.
    */
    static appendInt64(appendTo: Buffer, value: number, unsigned?: boolean, bigEndien?: boolean): Buffer;
    /**
    * Append a new INT32 chunk to a buffer.
    */
    static appendInt32(appendTo: Buffer, value: number, unsigned?: boolean, bigEndien?: boolean): Buffer;
    /**
    * Append a new INT16 chunk to a buffer.
    */
    static appendInt16(appendTo: Buffer, value: number, unsigned?: boolean, bigEndien?: boolean): Buffer;
    /**
    * Append a new INT8 chunk to a buffer.
    */
    static appendInt8(appendTo: Buffer, value: number, unsigned?: boolean, bigEndien?: boolean): Buffer;
    /**
    * Append a new FLOAT chunk to a buffer.
    */
    static appendFloat(appendTo: Buffer, value: number, bigEndien?: boolean): Buffer;
    /**
    * Append a new DOUBLE chunk to a buffer.
    */
    static appendDouble(appendTo: Buffer, value: number, bigEndien?: boolean): Buffer;
    /**
    * Append a new chunk to a buffer.
    */
    static append(type: DataType, value?: any, buf?: Buffer): Buffer;
    /**
    * Read an integer from a buffer
    */
    static readInt(buffer: Buffer, offset: number, byteSize?: number, unsigned?: boolean, bigEndien?: boolean): number;
    /**
    * Read an INT64 chunk in buffer.
    */
    static readInt64(buffer: Buffer, offset: number, unsigned?: boolean, bigEndien?: boolean): number;
    /**
    * Read an INT32 chunk in buffer.
    */
    static readInt32(buffer: Buffer, offset: number, unsigned?: boolean, bigEndien?: boolean): number;
    /**
    * Read an INT16 chunk in buffer.
    */
    static readInt16(buffer: Buffer, offset: number, unsigned?: boolean, bigEndien?: boolean): number;
    /**
    * Read an INT8 chunk in buffer.
    */
    static readInt8(buffer: Buffer, offset: number, unsigned?: boolean, bigEndien?: boolean): number;
    /**
    * Read a float from a buffer
    */
    static readFloat(buffer: Buffer, offset: number, bigEndien?: boolean): number;
    /**
    * Read a double from a buffer
    */
    static readDouble(buffer: Buffer, offset: number, bigEndien?: boolean): number;
    /**
    * Reads the next chunk from a buffer.
    */
    static readNextChunk(buf: Buffer): IBufferChunk | false;
    /**
    * Read all chunks from a buffer.
    */
    static readChunks(buf: Buffer): any[];
}
/**
* Main binary model class, which transforms simple objects into binary buffers and vice versa.
*/
export declare class BinaryModel {
    protected columnKeys: string[];
    protected columnOptions: IDataTypeOptions[];
    /**
    * Construct a new binary model from a spec.
    */
    constructor(spec: IBinaryModelSpec);
    /**
    * Get index of schema key.
    */
    protected indexOfKey(key: string): number;
    /**
    * set the property options for a key index
    */
    protected setOptions(keyIndex: number, options: IDataTypeOptions): boolean;
    /**
    * Check if a key exists already
    */
    hasKey(key: string): boolean;
    /**
    * Add a new key to schema
    */
    setKey(key: string, options: IDataTypeOptions): void;
    /**
    * Remove a key for this model spec.
    */
    removeKey(key: string): void;
    /**
    * Get options for a schema key.
    */
    getOptions(key: string | number): IDataTypeOptions | false;
    /**
    * Encode a simple object into a binary buffer.
    */
    encode(obj: IAnyObject): Buffer;
    /**
    * Decode an encoded buffer back into a simple object.
    */
    decode(data: Buffer): IAnyObject;
}
export default BinaryModel;
