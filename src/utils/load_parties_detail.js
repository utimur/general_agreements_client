let store;
let party_host;
let parties_detail = [];

export function load_parties_detail(ids, storeObj, partyAxios) {
    store = storeObj;
    party_host = partyAxios;
    let party_ids = new Set();
    ids.forEach(id => party_ids.add(id));

    parties_detail = store.getters["cargo/get_parties_detail"];
    party_ids.forEach(party_id => {
        if (!parties_detail_contain(party_id))
            get_party_name_by_id(party_id);
    })
}

function parties_detail_contain(party_id) {
    return parties_detail.some(party => party.id === party_id);
}

function get_party_name_by_id(party_id) {
    party_host.get("parties/getName", {
        params:
            {
                id: party_id
            }
    })
        .then(value => {
            parties_detail = store.getters["cargo/get_parties_detail"];
            parties_detail.push({
                id: party_id,
                name: value.data,
            });
            store.commit("cargo/set_parties_detail", parties_detail);
        })
        .catch(() => {});
}