import { EthAddress } from '@aztec/foundation/eth-address';
import { FieldsOf, assertLength } from '../../utils/jsUtils.js';
import { serializeToBuffer } from '../../utils/serialize.js';
import { PrivateCallStackItem } from '../call_stack_item.js';
import { CONTRACT_TREE_HEIGHT, FUNCTION_TREE_HEIGHT, PRIVATE_CALL_STACK_LENGTH } from '../constants.js';
import { MembershipWitness } from '../membership_witness.js';
import { UInt8Vector } from '../shared.js';
import { SignedTxRequest } from '../tx_request.js';
import { VerificationKey } from '../verification_key.js';
import { PreviousKernelData } from './previous_kernel_data.js';
import { Fr } from '@aztec/foundation/fields';

/**
 * Private call data.
 * @see circuits/cpp/src/aztec3/circuits/abis/call_stack_item.hpp
 */
export class PrivateCallData {
  constructor(
    /**
     * The call stack item currently being processed.
     */
    public callStackItem: PrivateCallStackItem,
    /**
     * Other private call stack items to be processed.
     */
    public privateCallStackPreimages: PrivateCallStackItem[],
    /**
     * The proof of the execution of this private call.
     */
    public proof: UInt8Vector,
    /**
     * The verification key for the function being invoked.
     */
    public vk: VerificationKey,
    /**
     * The membership witness for the function leaf corresponding to the function being invoked.
     */
    public functionLeafMembershipWitness: MembershipWitness<typeof FUNCTION_TREE_HEIGHT>,
    /**
     * The membership witness for the contract leaf corresponding to the contract on which the function is being
     * invoked.
     */
    public contractLeafMembershipWitness: MembershipWitness<typeof CONTRACT_TREE_HEIGHT>,
    /**
     * The address of the portal contract corresponding to the contract on which the function is being invoked.
     */
    public portalContractAddress: EthAddress,
    /**
     * The hash of the ACIR of the function being invoked.
     */
    public acirHash: Fr,
  ) {
    assertLength(this, 'privateCallStackPreimages', PRIVATE_CALL_STACK_LENGTH);
  }

  /**
   * Serialize into a field array. Low-level utility.
   * @param fields - Object with fields.
   * @returns The array.
   */
  static getFields(fields: FieldsOf<PrivateCallData>) {
    return [
      // NOTE: Must have same order as CPP.
      fields.callStackItem,
      fields.privateCallStackPreimages,
      fields.proof,
      fields.vk,
      fields.functionLeafMembershipWitness,
      fields.contractLeafMembershipWitness,
      fields.portalContractAddress,
      fields.acirHash,
    ] as const;
  }

  static from(fields: FieldsOf<PrivateCallData>): PrivateCallData {
    return new PrivateCallData(...PrivateCallData.getFields(fields));
  }

  /**
   * Serialize this as a buffer.
   * @returns The buffer.
   */
  toBuffer(): Buffer {
    return serializeToBuffer(...PrivateCallData.getFields(this));
  }
}

/**
 * Input to the private kernel circuit.
 */
export class PrivateKernelInputs {
  constructor(
    /**
     * The transaction request which led to the creation of these inputs.
     */
    public signedTxRequest: SignedTxRequest,
    /**
     * The previous kernel data (dummy if this is the first kernel).
     */
    public previousKernel: PreviousKernelData,
    /**
     * Private calldata corresponding to this iteration of the kernel.
     */
    public privateCall: PrivateCallData,
  ) {}

  /**
   * Serialize this as a buffer.
   * @returns The buffer.
   */
  toBuffer() {
    return serializeToBuffer(this.signedTxRequest, this.previousKernel, this.privateCall);
  }
}

/**
 * Makes an empty proof.
 * Note: Used for local devnet milestone where we are not proving anything yet.
 * @returns The empty "proof".
 */
export function makeEmptyProof(): UInt8Vector {
  return new UInt8Vector(Buffer.alloc(0));
}
