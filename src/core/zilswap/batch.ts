import { TokenInfo } from "app/store/types";
import { Network } from "zilswap-sdk/lib/constants";
import { ZilswapConnector } from "./connector";

export enum BatchRequestType {
  Balance = "balance",
  TokenBalance = "tokenBalance",
  TokenAllowance = "tokenAllowance"
};

interface BatchRequestItem {
  id: string;
  jsonrpc: string;
  method: string;
  params: any[];
}

interface BatchRequest {
  type: string
  token: TokenInfo
  item: BatchRequestItem
}

interface BatchResponse {
  request: BatchRequest;
  result: any;
}



/**
 * Create a `GetBalance` request.
 *
 * @param TokenInfo The token for which it's requested.
 * @param string The wallet address.
 * @returns BatchRequest
 */
export const balanceBatchRequest = (token: TokenInfo, address: string): BatchRequest => {
  return {
    type: BatchRequestType.Balance,
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetBalance",
      params: [address],
    },
  };
}

/**
 * Create a `GetSmartContractSubState` request for the balances variable.
 *
 * @param TokenInfo The token for which it's requested.
 * @param string The wallet address.
 * @returns BatchRequest
 */
export const tokenBalanceBatchRequest = (token: TokenInfo, walletAddress: string): BatchRequest => {
  const contract = ZilswapConnector.getToken(token.address)!.contract;
  return {
    type: BatchRequestType.TokenBalance,
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetSmartContractSubState",
      params: [
        contract.address!.replace("0x", "").toLowerCase(),
        "balances",
        [walletAddress],
      ],
    },
  };
}

/**
 * Create a `GetSmartContractSubState` request for the allowances variable.
 *
 * @param TokenInfo The token for which it's requested.
 * @param string The wallet address.
 * @returns BatchRequest
 */
export const tokenAllowancesBatchRequest = (token: TokenInfo, walletAddress: string): BatchRequest => {
  const contract = ZilswapConnector.getToken(token.address)!.contract;
  return {
    type: BatchRequestType.TokenAllowance,
    token: token,
    item: {
      id: "1",
      jsonrpc: "2.0",
      method: "GetSmartContractSubState",
      params: [
        contract.address!.replace("0x", "").toLowerCase(),
        "allowances",
        [walletAddress],
      ],
    },
  };
}

/**
 * Sends a series of requests as a batch to the Zilliqa API.
 *
 * @param Network The currently selected network.
 * @param BatchRequest[] An array of RPC requests.
 * @returns Promise<BatchResponse[]> Zilswap instance initialized with wallet properties (network and provider).
 */
export const sendBatchRequest = async (network: Network, requests: BatchRequest[]): Promise<BatchResponse[]> => {
  var baseUrl = "https://api.zilliqa.com/"
  if(network == Network.TestNet) {
    baseUrl = "https://dev-api.zilliqa.com/"
  }
  const res = await fetch(baseUrl, {
    method: "POST",
    body: JSON.stringify(requests.flatMap(request => request.item)),
  });

  const results = await res.json();

  if(!Array.isArray(results)) {
    return []
  }

  var responseItems: BatchResponse[] = [];
  results.forEach((result: any, i: number) => {
    responseItems.push({
      request: requests[i],
      result: result.result,
    });
  });

  return responseItems;
};
