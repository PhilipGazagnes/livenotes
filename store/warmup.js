export const state = () => ({
  active: false,
  pos: 0,
});

export const mutations = {
  SET_ACTIVE(state, payload) {
    state.active = payload;
  },
  SET_POS(state, payload) {
    state.pos = payload;
  },
};
