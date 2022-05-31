// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;
import './PRBMathUD60x18.sol';

interface IERC20 {
    function transfer(address, uint) external returns (bool);

    function transferFrom(
        address,
        address,
        uint
    ) external returns (bool);
}


 contract realestate {

     struct asset{
         address owner;
         bytes location;
         uint id;
         bytes contact;

     }
     struct buyerseller{
         address buyer;
         bytes location;
         bytes contact;
     }
     uint private assetid;
     mapping(address => bool) exist;
     mapping(address=> buyerseller) BSdetails;
     mapping(uint=> asset )assetDetails;
     mapping(uint=> address[]) assetowners;
     mapping(address=>uint[] ) assetowns;
     mapping(address=>mapping(uint=>uint)) percentageown;
     mapping(address=>mapping(uint=> bool)) own;
     mapping(address=> mapping(uint => bool ))sellonof;
     bool internal locked; 

     IERC20 public immutable token;
      modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }


     using PRBMathUD60x18 for uint256; 
      constructor(address _token) {
        token = IERC20(_token);
    }



    


     function addbuyerseller(bytes memory _location,bytes memory _contact) public{
         require(!exist[msg.sender],"addr doesn't exist");
         buyerseller memory bs = buyerseller(msg.sender,_location,_contact);
         BSdetails[msg.sender] = bs;
         exist[msg.sender] = true;

         


     }
   
     
     




     function addAsset(bytes memory assetLocation,bytes memory assetcontact) public noReentrant {
         require(exist[msg.sender]= true,"addr doesn't exist");
         assetid++;
         assetowners[assetid].push(msg.sender);
         assetowns[msg.sender].push(assetid);
         percentageown[msg.sender][assetid] = 100;
         own[msg.sender][assetid] = true;
         sellonof[msg.sender][assetid] = false;
         asset memory Asset = asset(msg.sender,assetLocation,assetid,assetcontact);
         assetDetails[assetid] = Asset;


     }
     function sellon(uint id) public{
         require(own[msg.sender][id]= true,"owner is not calling");
         require(sellonof[msg.sender][id]= false,"sell is already on");
         sellonof[msg.sender][id]= true;
     }
      function selloff(uint id) public{
         require(own[msg.sender][id]= true,"owner is not calling");
         require(sellonof[msg.sender][id]= true,"sell is already off");
         sellonof[msg.sender][id]= false;
     }
     function BuyAsset(uint id,uint amount,address owner) public noReentrant {
         require(amount & id>0,"value needs greater than zero" );
         require(exist[msg.sender] = true,"addr doesn't exist");
         require(own[owner][id]= true,"owner don't own this id");
         uint po = percentageown[owner][id];
         require(po>0,"you don't own this asset");
         uint totalvalue = 200;
         uint op = getPercentage(amount,totalvalue);
         require(op<=po,"you cant proceed");
         if(op<po){
             uint LPO= po-op;
             percentageown[owner][id] = LPO;
             percentageown[msg.sender][id] = op;
             own[msg.sender][id] = true;
             assetowns[msg.sender].push(id);
             assetowners[id].push(msg.sender);
             token.transferFrom(msg.sender, owner, amount);



         }else{
             percentageown[owner][id] = 0;
             percentageown[msg.sender][id] = op;
             own[msg.sender][id] = true;
             own[owner][id] = false;
             assetowners[id].push(msg.sender);
             //assetowns[owner].remove(id);
             assetowns[msg.sender].push(id);
             token.transferFrom(msg.sender, owner, amount);
         }

         
     }

      function getPercentage(uint256 a,uint256 b) public pure returns (uint256){
        uint256 oneHundredPercent = PRBMathUD60x18.fromUint(100);
        return a.mul(oneHundredPercent).div(b);
    }






 }