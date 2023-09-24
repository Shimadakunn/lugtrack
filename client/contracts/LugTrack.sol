// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LugTrack is Ownable{
    using Counters for Counters.Counter;

    //Luggage
    enum State { Pending, CheckedIn, InTransit, Arrived }
    struct Luggage {
        uint256 id;
        uint256 weight;
        State state;
    }
    Counters.Counter public _luggageId;
    mapping(uint256 => Luggage) Luggages;
    
    //Passenger
    struct Passenger {
        uint256 id;
        uint256[] luggageIds;
    }
    Counters.Counter public _passengerId;
    address[] public passengerArray;
    mapping(address => Passenger) public Passengers;

    function createPassenger(address _passengerAddress) external onlyOwner() {
        require(owner() != _passengerAddress, "Owner cannot be a passenger");
        require(passengerExists(_passengerAddress) == false, "Passenger already exists");
        passengerArray.push(_passengerAddress);
        Passenger memory _passenger = Passenger(_passengerId.current(), new uint256[](0));
        Passengers[_passengerAddress] = _passenger;
        _passengerId.increment();
    }

    function createLuggage(address _passengerAddress, uint _weight) external onlyOwner() {
        require(passengerExists(_passengerAddress) == true, "Passenger does not exists");
        Luggage memory _luggage = Luggage(_luggageId.current(),_weight, State.Pending);
        Luggages[_luggageId.current()] = _luggage;
        Passengers[_passengerAddress].luggageIds.push(_luggageId.current());
        _luggageId.increment();
    }

    function updateLuggageState(uint256 _lugId, uint _state) public {
        Luggages[_lugId].state = State(_state);
    }

    function simpleUpdateLuggageState(uint256 _lugId) external onlyOwner() {
        if(uint(Luggages[_lugId].state)+1 <= uint(State.Arrived)){
            Luggages[_lugId].state = State(uint(Luggages[_lugId].state)+1);
        }
    }

    function luggageData(address _passengerAddress) external view returns(uint[] memory,uint[] memory,string[] memory){
        require(passengerExists(_passengerAddress) == true, "Passenger does not exists");
        uint[] memory _weights = new uint[](Passengers[_passengerAddress].luggageIds.length);
        string[] memory _states = new string[](Passengers[_passengerAddress].luggageIds.length);
        for(uint i = 0; i < _weights.length; i++){
            _weights[i] = Luggages[Passengers[_passengerAddress].luggageIds[i]].weight;
            _states[i] = stageToString(Luggages[Passengers[_passengerAddress].luggageIds[i]].state);
        }
        return (Passengers[_passengerAddress].luggageIds,_weights,_states);
    }
    
    function passengerData()external view returns(address[] memory){
        return passengerArray;
    }

    //Utils
    function passengerExists(address _passengerAddress) internal view returns (bool) {
        for (uint256 i = 0; i < passengerArray.length; i++) {
            if (passengerArray[i] == _passengerAddress) {
                return true;
            }
        }
        return false;
    }
    function luggageIdExists(address _passengerAddress,uint256 _lugId) internal view returns (bool) {
        for (uint256 i = 0; i < Passengers[_passengerAddress].luggageIds.length; i++) {
            if (Passengers[_passengerAddress].luggageIds[i] == _lugId) {
                return true;
            }
        }
        return false;
    }
    function stageToString(State stage) internal pure returns (string memory) {
        if (stage == State.Pending) {
            return "Pending";
        } else if (stage == State.CheckedIn) {
            return "CheckedIn";
        } else if (stage == State.Arrived) {
            return "Arrived";
        } else if (stage == State.InTransit) {
            return "InTransit";
        } else if (stage == State.Arrived) {
            return "Arrived";
        } 
        else {
            return "Unknown";
        }
    }
}