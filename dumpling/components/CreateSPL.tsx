import React, { useState } from 'react';
import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const RPC_ENDPOINT = "Your RPC Endpoint";
const web3Connection = new Connection(RPC_ENDPOINT, 'confirmed');

const CreateCoinForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    image: null,
    twitterLink: '',
    telegramLink: '',
    website: '',
    showName: true,
    amount: 1,
    slippage: 10,
    priorityFee: 0.0005,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prevState => ({
      ...prevState,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Generate a random keypair for token
      const mintKeypair = Keypair.generate();

      // Create FormData for IPFS metadata storage
      const metadataFormData = new FormData();
      metadataFormData.append("file", formData.image);
      metadataFormData.append("name", formData.name);
      metadataFormData.append("symbol", formData.symbol);
      metadataFormData.append("description", formData.description);
      metadataFormData.append("twitter", formData.twitterLink);
      metadataFormData.append("telegram", formData.telegramLink);
      metadataFormData.append("website", formData.website);
      metadataFormData.append("showName", formData.showName.toString());

      // Create IPFS metadata storage
      const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: metadataFormData,
      });
      const metadataResponseJSON = await metadataResponse.json();

      // Get the create transaction
      const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "publicKey": 'your-wallet-public-key', // Replace with actual public key
          "action": "create",
          "tokenMetadata": {
            name: metadataResponseJSON.metadata.name,
            symbol: metadataResponseJSON.metadata.symbol,
            uri: metadataResponseJSON.metadataUri
          },
          "mint": mintKeypair.publicKey.toBase58(),
          "denominatedInSol": "true",
          "amount": formData.amount,
          "slippage": formData.slippage,
          "priorityFee": formData.priorityFee,
          "pool": "pump"
        })
      });

      if (response.status === 200) {
        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        
        // Note: In a real application, you'd need to securely manage the user's private key
        const signerKeyPair = Keypair.fromSecretKey(bs58.decode("your-wallet-private-key"));
        
        tx.sign([mintKeypair, signerKeyPair]);
        const signature = await web3Connection.sendTransaction(tx);
        console.log("Transaction: https://solscan.io/tx/" + signature);
        // Handle success (e.g., show success message, redirect, etc.)
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="symbol">Symbol</label>
        <input
          type="text"
          id="symbol"
          name="symbol"
          value={formData.symbol}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="image">Image</label>
        <input
          type="file"
          id="image"
          name="image"
          onChange={handleImageChange}
          required
        />
      </div>
      <div>
        <label htmlFor="twitterLink">Twitter Link (optional)</label>
        <input
          type="url"
          id="twitterLink"
          name="twitterLink"
          value={formData.twitterLink}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="telegramLink">Telegram Link (optional)</label>
        <input
          type="url"
          id="telegramLink"
          name="telegramLink"
          value={formData.telegramLink}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="website">Website (optional)</label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="showName">Show Name</label>
        <input
          type="checkbox"
          id="showName"
          name="showName"
          checked={formData.showName}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="amount">Amount (SOL)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          min="0"
          step="0.1"
          required
        />
      </div>
      <div>
        <label htmlFor="slippage">Slippage (%)</label>
        <input
          type="number"
          id="slippage"
          name="slippage"
          value={formData.slippage}
          onChange={handleInputChange}
          min="0"
          max="100"
          required
        />
      </div>
      <div>
        <label htmlFor="priorityFee">Priority Fee (SOL)</label>
        <input
          type="number"
          id="priorityFee"
          name="priorityFee"
          value={formData.priorityFee}
          onChange={handleInputChange}
          min="0"
          step="0.0001"
          required
        />
      </div>
      <p>Tip: coin data cannot be changed after creation</p>
      <button type="submit">Create coin</button>
    </form>
  );
};

export default CreateCoinForm;