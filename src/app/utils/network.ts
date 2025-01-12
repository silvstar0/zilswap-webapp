import { CarbonSDK } from "carbon-js-sdk";
import { Network } from "zilswap-sdk/lib/constants";

export const netCarbonToZil = (network: CarbonSDK.Network): Network => {
  switch (network) {
    case CarbonSDK.Network.MainNet: return Network.MainNet;
    default: return Network.TestNet;
  }
}

export const netZilToCarbon = (network: Network): CarbonSDK.Network => {
  switch (network) {
    case Network.MainNet: return CarbonSDK.Network.MainNet;
    default: return CarbonSDK.Network.DevNet;
  }
}
