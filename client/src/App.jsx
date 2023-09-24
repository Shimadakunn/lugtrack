import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import LugTrack from "./artifacts/contracts/LugTrack.sol/LugTrack.json";
import "./App.css";

let contractAddress = "0x998abeb3E57409262aE5b751f60747921B33613E";

function App() {
  const [addresses, setAddresses] = useState([]);
  const [luggageIds, setLuggageIds] = useState([]);
  const [weights, setWeights] = useState([]);
  const [states, setStates] = useState([]);
  const [owner, setOwner] = useState(false);
  
  const [apiId, setApiId] = useState();
  const [apiAddress, setApiAddress] = useState();
  const [apiState, setApiState] = useState();

  const [address, setAddress] = useState("");
  const [weigth, setWeigth] = useState();
  const [lugId, setLugId] = useState();
  const [state, setState] = useState();

  useEffect(() => {
    getPassengerData();
    getLuggageData();
    isOwner();
  }, []);
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    console.log("apiIds: " + apiId);
    console.log("apiState: " + apiState);
    console.log("states: " + states);
  }, [apiId,apiAddress,address,weigth,lugId,state,owner,addresses,luggageIds,weights,states]);
  useEffect(() => {
    if(Object.keys(luggageIds)[0]==apiId){
      console.log("Luggage found");
      updateLuggageState();
      }
    if(Object.keys(luggageIds)[1]==apiId){
        console.log("Luggage found");
        updateLuggageState();
        }
  }, [apiState]);
  async function isOwner() {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LugTrack.abi,
        provider
      );
      try {
        const result = await contract.owner();
        if (result.toLowerCase() === accounts[0].toLowerCase()) {
          setOwner(true);
        }
      } catch (err) {
        console.log("Erreur lors du owner");
      }
    }
  }
  async function createPassenger() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LugTrack.abi,
        signer
      );
      try {
        const transaction = await contract.createPassenger(address);
        await transaction.wait();
        await getPassengerData();
        console.log("Candidat créé");
      } catch (err) {
        console.log("Err candidate creation");
      }
    }
  }
  async function createLuggage() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LugTrack.abi,
        signer
      );
      try {
        const transaction = await contract.createLuggage(address,weigth);
        await transaction.wait();
        await getLuggageData();
        console.log("Bagage créé");
      } catch (err) {
        console.log("Err luggage creation");
      }
    }
  }
  async function getPassengerData() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LugTrack.abi,
        provider
      );
      try {
        const result = await contract.passengerData();
        setAddresses(result);
      } catch (err) {
        console.log("Erreur lors de la récupération des datas");
      }
    }
  }
  async function getLuggageData() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LugTrack.abi,
        provider
      );
      try {
        setLuggageIds([]);
        setWeights([]);
        setStates([]);
        console.log("Addresses length: " + addresses.length);
        for (let i = 0; i < addresses.length; i++) {
          console.log("Address: " + addresses[i]);
          const result = await contract.luggageData(addresses[i]);
          console.log("Result: " + result[0][0]);
          console.log("Key length: " + Object.keys(result[0]).length);
          if(Object.keys(result[0]).length !== 0){
            setLuggageIds(prevLuggageIds => [...prevLuggageIds, result[0]]);
            setWeights(prevWeights => [...prevWeights, result[1]]);
            setStates(prevStates => [...prevStates, result[2]]);
          }
        }
        console.log("LuggageIds: " + luggageIds.length);
      } catch (err) {
        console.log("Erreur lors de la récupération des datas");
      }
    }
  }
  async function updateLuggageState() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LugTrack.abi,
        signer
      );
      try {
        const transaction = await contract.updateLuggageState(apiId,apiState);
        await transaction.wait();
        await getLuggageData();
        console.log("Etat changé");
      } catch (err) {
        console.log("Erreur lors du changement detat");
      }
    }
  }
  const fetchData = async () => {
    try {
      setApiState();
      const response = await fetch('http://localhost:3000/data');
      const jsonData = await response.json();
      setApiId(jsonData.id);
      setApiAddress(jsonData.address);
      setApiState(jsonData.state);
      console.log("id", jsonData.id);
      console.log(jsonData.state);
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };
  async function changeAddress(e) {
    setAddress(e.target.value);
  }
  async function changeWeigth(e) {
    setWeigth(e.target.value);
  }
  async function changeLugId(e) {
    setLugId(e.target.value);
  }
  return (
    <>
      <div className="App">Owner: {owner.toString()}</div>
      {owner && (
        <>
          <h1>Passenger Creation</h1>
          <input type="text" className="address_input" placeholder="Address" onChange={changeAddress}/>
          <button className="create" onClick={createPassenger}>Create</button>
          {addresses.map((item, index) => (
            <div>Passengers: {item}</div>
          ))}
          
          <h1>Luggage Creation</h1>
          <input type="text" className="address_input" placeholder="Address" onChange={changeWeigth}/>
          <button className="create" onClick={createLuggage}>Create</button>
          {luggageIds.map((item, index) => (
              <div>Luggage ID: {item.toString()}, Weight: {weights[index].toString()},State: {states[index]}</div>
          ))}
        </>
      )}
    </>
  );
}

export default App;
