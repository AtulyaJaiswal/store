import {
    ADD_TO_CART,
    REMOVE_CART_ITEM,
    SAVE_SHIPPING_INFO,
  } from "../constants/cartConstants";
  
export const cartReducer = ( state = { cartItems: [], shippingInfo: {} }, action) => {
    switch (action.type) {
      case ADD_TO_CART:
        const item = action.payload;
  
        const isItemExist = state.cartItems.find( //pehle se exist krega cart me to bas update krenge isliye check kr rhe
          (i) => i.product === item.product
        );
  
        if (isItemExist) {
          return {
            ...state,
            //dhund ke update kr rhe
            cartItems: state.cartItems.map((i) =>
              i.product === isItemExist.product ? item : i
            ),
          };
        } else {
          return {
            ...state,
            //nya item add kr rhe agar pehle se exist na ho to
            cartItems: [...state.cartItems, item],
          };
        }
  
      case REMOVE_CART_ITEM:
        return {
          ...state,
          cartItems: state.cartItems.filter((i) => i.product !== action.payload),
        };
  
      case SAVE_SHIPPING_INFO:
        return {
          ...state,
          shippingInfo: action.payload,
        };
  
      default:
        return state;
    }
};