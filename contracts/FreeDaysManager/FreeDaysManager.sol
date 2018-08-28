/*
Implements EIP20 token standard: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
.*/


pragma solidity ^0.4.23;

import "../Tokens/FreeDaysToken.sol";
//import "../SafeMath.sol";

contract FreeDaysManager {

    //using SafeMath for uint256;
    // token to handle:
    FreeDaysToken public fdt;

    // the one who is in charge:
    address public admin;

    // list of Requestors
    uint256 public   nRequestors;
    address[] public requestors;
    mapping(address => uint256) public requirements;

    modifier isAdmin() {
        require(msg.sender == admin, "not authorized");
        _;
    }

    constructor (
        address _fdtAddress,
        address _adminAddress
    ) public {
        require(_fdtAddress != address(0), "invalid fdtAddress");
        require(_adminAddress != address(0), "invalid adminAddress");
        
        fdt = FreeDaysToken(_fdtAddress);
        admin = _adminAddress;
        
    }

    // 1) Retrieve days to donor when he uploads document 
    // telling how much days he has
    function giveDaysToDonor(address _whom, uint256 _days) 
        public 
        isAdmin
    {
        require(fdt.transfer(_whom, _days), "fdt failed to transfer");
    }

    // 2) registrate requestors:
    function registrateRequestor(address _whom, uint256 _days) 
        public 
        isAdmin
    {
        // add requestor
        requestors.push(_whom);
        nRequestors = requestors.length;
        // add days to requestor
        requirements[_whom] += _days;
    }

    function takeDays(address _whom, uint256 _days) 
        public 
        isAdmin
    {
        // remove days:
        requirements[_whom] -= _days;
    }

    /// 3) to retrieve the list of requestors collect by local code from public registres

    



}