// import { DynamicContextProvider, useDynamicContext, useTokenBalances } from "@dynamic-labs/sdk-react-core";

// const Balances = () => {
//   const { primaryWallet } = useDynamicContext();
//   const { tokenBalances, isLoading, isError, error } = useTokenBalances();

//   if(!primaryWallet) return <div>No wallet connected</div>;

//   if (isLoading) return <div>Loading...</div>;
//   if (isError) return <div>Error: {error.message}</div>;

//   return (
//     <DynamicContextProvider
//     settings={{
//         environmentId: "0673ae5a-5cbb-4d60-8b13-5edb62181b0a",
//     }}>
//     <div>
//       {tokenBalances.map((token) => (
//         <div key={token.address}>
//           <img src={token.logoURI} alt={token.symbol} />
//           <div>{token.name}</div>
//           <div>{token.symbol}</div>
//           <div>{token.balance}</div>
//         </div>
//       ))}
//     </div>
//     </DynamicContextProvider>
//   );
// };

// export default Balances;