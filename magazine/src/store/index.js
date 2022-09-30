/* eslint-disable max-len */
/* eslint-disable linebreak-style */
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cartProducts: [],
    userAccessKey: null,
  },
  mutations: {
    updateUserKey(state, key) {
      state.userAccessKey = key;
    },
    updateCartProductAmount(state, { productId, amount }) {
      // eslint-disable-next-line no-shadow
      const item = state.cartProducts.find((item) => item.productId === productId);
      if (item) {
        item.amount = amount;
      }
    },
    deliteCartProduct(state, productId) {
      state.cartProducts = state.cartProducts.filter((item) => item.productId !== productId);
    },
    updateUserAccessKey(state, accessKey) {
      state.userAccessKey = accessKey;
    },
    updateCartProductsData(state, items) {
      state.cartProducts = items;
    },
    syncCartProducts(state) {
      state.cartProducts = state.cartProducts.map((item) => ({
        productId: item.product.id,
        amount: item.quantity,
      }));
    },
  },
  getters: {
    // eslint-disable-next-line consistent-return
    cartDetailProducts(state) {
      if (state.cartProducts) {
        return state.cartProducts;
      }
    },
    cartTotalPrice(state) {
      return state.cartProducts.reduce((acc, item) => (item.product.price * item.amount) + acc, 0);
    },
    amountProduct(state) {
      return state.cartProducts.reduce((acc, item) => item.amount + acc, 0);
    },
  },
  actions: {
    loadCart(context) {
      return axios
        .get(`${API_BASE_URL}/api/baskets`, {
          params: {
            userAccessKey: context.state.userAccessKey,
          },
        })
        .then((response) => {
          if (!context.state.userAccessKey) {
            localStorage.setItem('userAccessKey', response.data.user.accessKey);
            context.commit('updateUserAccessKey', response.data.user.accessKey);
          }
          context.commit('updateCartProductsData', response.data.items);
          context.commit('syncCartProducts');
        });
    },
    addProductToCart(context, {
      productId,
      amount,
      product,
    }) {
      // eslint-disable-next-line no-promise-executor-return
      return (new Promise((resolve) => setTimeout(resolve, 2000)))
        .then(() => axios
          .post(`${API_BASE_URL}/api/baskets/products`, {
            productId,
            product,
            quantity: amount,
          }, {
            params: {
              userAccessKey: context.state.userAccessKey,
            },
          })
          .then((response) => {
            context.commit('updateCartProductsData', response.data.items);
            context.commit('syncCartProducts');
          }));
    },
  },
});
