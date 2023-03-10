import { Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.PK!;
if (!privateKey)
  throw new Error("No private key provided, pls include in .env file");

(async () => {
  // instantiate the SDK

  const squid = new Squid({
    baseUrl: "http://localhost:3000", // for testnet use "https://testnet.api.0xsquid.com"
  });

  // init the SDK
  await squid.init();
  console.log("Squid inited");

  // use the RPC provider of the "from" chain

  const chainId = 5; //avalanche
  const provider = ethers.getDefaultProvider(
    squid.chains.find((c) => c.chainId === chainId)!.rpc
  );

  const signer = new ethers.Wallet(privateKey, provider);

  const params = {
    fromChain: chainId,
    fromToken: squid.tokens.find(
      (t) => t.symbol === "ETH" && t.chainId === chainId
    ).address,
    fromAmount: ethers.utils.parseUnits("0.01", "18").toString(),
    toChain: "axelar-testnet-lisbon-3",
    toToken: "uosmo",
    toAddress: "axelar1y5mhc7rj552ykll8d2tgnfzln7m9x3sjkgqzn5",
    slippage: 3.0, // 3.00 = 3% max slippage across the entire route, acceptable value range is 1-99
    enableForecall: false, // instant execution service, defaults to true
    quoteOnly: false, // optional, defaults to falses
  };

  const { route } = await squid.getRoute(params);

  const tx = await squid.executeRoute({
    signer,
    route,
  });

  const txReceipt = await tx.wait();

  console.log(txReceipt.transactionHash);
})();
