#pragma once
#include "join_split_tx.hpp"
#include "../pedersen_note/pedersen_note.hpp"
#include <crypto/schnorr/schnorr.hpp>
#include <stdlib/types/turbo.hpp>

namespace rollup {
namespace proofs {
namespace join_split {

using namespace proofs::pedersen_note;
using namespace plonk::stdlib::types::turbo;

struct join_split_inputs {
    field_ct public_input;
    field_ct public_output;
    uint32_ct num_input_notes;
    field_ct input_note1_index;
    field_ct input_note2_index;
    note_pair input_note1;
    note_pair input_note2;
    note_pair output_note1;
    note_pair output_note2;
    point_ct signing_pub_key;
    stdlib::schnorr::signature_bits<Composer> signature;
    field_ct merkle_root;
    merkle_tree::hash_path input_path1;
    merkle_tree::hash_path input_path2;
    field_ct account_index;
    merkle_tree::hash_path account_path;
};

struct join_split_outputs {
    field_ct nullifier1;
    field_ct nullifier2;
    field_ct account_nullifier;
};

join_split_outputs join_split_circuit_component(Composer& composer, join_split_inputs const& inputs);

void join_split_circuit(Composer& composer, join_split_tx const& tx);

} // namespace join_split
} // namespace proofs
} // namespace rollup
