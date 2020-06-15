import { Types } from "./actions";
import { Types as WalletTypes } from "../wallet/actions";
import { ObserveTxProps, Transaction, TransactionsInitProps, TransactionState, TransactionUpdateProps, TransactionRemoveProps, SubmittedTx } from "./types";
import { ObservedTx } from "zilswap-sdk";


const LOCAL_STORAGE_KEY_OBSERVING_TXS = "zilswap:observing-txs";
const savedTxsString = localStorage.getItem(LOCAL_STORAGE_KEY_OBSERVING_TXS) || "[]";
const savedObservingTxs = JSON.parse(savedTxsString).filter((tx: ObservedTx) => typeof tx.hash === "string");

const initial_state: TransactionState = {
  transactions: [],
  submittedTxs: [],
  observingTxs: savedObservingTxs,
};

const reducer = (state: TransactionState = initial_state, action: any): TransactionState => {
  switch (action.type) {
    case Types.TX_INIT:
      const initProps: TransactionsInitProps = action.payload;
      const interimSubmittedTxs: SubmittedTx[] = [];
      const observingTxs: ObservedTx[] = [];
      state.observingTxs.forEach(observingTx => {
        const tx = initProps.transactions.find(tx => tx.hash === observingTx.hash);
        if (tx)
          interimSubmittedTxs.push({
            hash: tx.hash,
            status: tx.status,
          });
        else
          observingTxs.push(observingTx);
      })
      return {
        transactions: [...initProps.transactions],
        observingTxs,
        submittedTxs: interimSubmittedTxs,
      };
    case Types.TX_OBSERVE:
      const observeProps: ObserveTxProps = action.payload;
      if (!observeProps.observedTx?.hash) return state;

      const newPendingTx: Transaction = {
        status: "pending",
        hash: observeProps.observedTx.hash,
        observedTx: observeProps.observedTx,
      };
      return {
        ...state,
        transactions: [
          newPendingTx,
          ...state.transactions,
        ],
        observingTxs: [
          ...state.observingTxs,
          observeProps.observedTx,
        ],
      };
    case Types.TX_UPDATE:
      const updateProps: TransactionUpdateProps = action.payload;
      const updateTxIndex = state.transactions.findIndex(tx => tx.hash === updateProps.hash);

      if (updateTxIndex >= 0) {
        state.transactions.splice(updateTxIndex, 1, { ...updateProps });
      } else {
        state.transactions.unshift({ ...updateProps });
      }
      const observedTxIndex = state.observingTxs.findIndex(tx => tx.hash === updateProps.hash);
      state.observingTxs.splice(observedTxIndex, 1);

      const submittedTxIndex = state.submittedTxs.findIndex(tx => tx.hash === updateProps.hash);
      if (submittedTxIndex >= 0)
        state.submittedTxs.splice(submittedTxIndex, 1);

      return {
        transactions: [...state.transactions],
        observingTxs: [...state.observingTxs],
        submittedTxs: [...state.submittedTxs, {
          hash: updateProps.hash,
          status: updateProps.status,
        }],
      };
    case Types.TX_REMOVE:
      const removeProps: TransactionRemoveProps = action.payload;
      return {
        ...state,
        submittedTxs: state.submittedTxs.filter(tx => tx.hash !== removeProps.hash),
      };
    case WalletTypes.WALLET_LOGOUT:
      return {
        transactions: [],
        observingTxs: [],
        submittedTxs: [],
      };
    default:
      return state;
  };
}

const wrapper = (state: TransactionState, action: any) => {
  const newState = reducer(state, action);
  localStorage.setItem(LOCAL_STORAGE_KEY_OBSERVING_TXS, JSON.stringify(newState.observingTxs));

  return newState;
};

export default wrapper;
