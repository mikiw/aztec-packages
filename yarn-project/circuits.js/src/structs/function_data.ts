import { BufferReader } from '@aztec/foundation/serialize';
import { serializeToBuffer } from '../utils/serialize.js';

const FUNCTION_SELECTOR_LENGTH = 4;

/**
 * Function description for circuit.
 * @see abis/function_data.hpp
 */
export class FunctionData {
  constructor(
    /**
     * Function selector of the function being called.
     */
    public functionSelector: Buffer,
    /**
     * Indicates whether the function is private or public.
     */
    public isPrivate = true,
    /**
     * Indicates whether the function is a constructor.
     */
    public isConstructor = false,
  ) {
    if (functionSelector.byteLength !== FUNCTION_SELECTOR_LENGTH) {
      throw new Error(
        `Function selector must be ${FUNCTION_SELECTOR_LENGTH} bytes long, got ${functionSelector.byteLength} bytes.`,
      );
    }
  }
  /**
   * Serialize this as a buffer.
   * @returns The buffer.
   */
  toBuffer(): Buffer {
    return serializeToBuffer(this.functionSelector, this.isPrivate, this.isConstructor);
  }

  /**
   * Returns whether this instance is empty.
   * @returns True if the function selector is zero.
   */
  isEmpty() {
    return this.functionSelector.equals(Buffer.alloc(FUNCTION_SELECTOR_LENGTH, 0));
  }

  /**
   * Returns a new instance of FunctionData with zero function selector.
   * @param args - Arguments to pass to the constructor.
   * @returns A new instance of FunctionData with zero function selector.
   */
  public static empty(args?: {
    /**
     * Indicates whether the function is private or public.
     */
    isPrivate?: boolean;
    /**
     * Indicates whether the function is a constructor.
     */
    isConstructor?: boolean;
  }): FunctionData {
    return new FunctionData(Buffer.alloc(FUNCTION_SELECTOR_LENGTH, 0), args?.isPrivate, args?.isConstructor);
  }

  /**
   * Deserializes from a buffer or reader, corresponding to a write in cpp.
   * @param buffer - Buffer or reader to read from.
   * @returns A new instance of FunctionData.
   */
  static fromBuffer(buffer: Buffer | BufferReader): FunctionData {
    const reader = BufferReader.asReader(buffer);
    return new FunctionData(reader.readBytes(FUNCTION_SELECTOR_LENGTH), reader.readBoolean(), reader.readBoolean());
  }
}
