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
         uint cost;

     }
     struct buyerseller{
         address buyer;
         bytes location;
         bytes contact;
     }
     uint public assetid;
     mapping(address => bool) public exist;
     mapping(address=> buyerseller) public BSdetails;
     mapping(uint=> asset ) public assetDetails;
     mapping(uint=> address[]) public assetowners;
     mapping(address=>uint[] ) public assetowns;
     mapping(address=>mapping(uint=>uint)) public percentageown;
     mapping(address=>mapping(uint=> bool)) public own;
     mapping(address=> mapping(uint => bool )) public sellonof;
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
         require(!exist[msg.sender],"addr already exist");
         buyerseller memory bs = buyerseller(msg.sender,_location,_contact);
         BSdetails[msg.sender] = bs;
         exist[msg.sender] = true;

         


     }
   
     
     




     function addAsset(bytes memory assetLocation,bytes memory assetcontact,uint assetcost) public noReentrant {
         require(exist[msg.sender] == true,"addr doesn't exist");
         assetid += 1;
         assetowners[assetid].push(msg.sender);
         assetowns[msg.sender].push(assetid);
         percentageown[msg.sender][assetid] = 100000000000000000000;
         own[msg.sender][assetid] = true;
         sellonof[msg.sender][assetid] = false;
         asset memory Asset = asset(msg.sender,assetLocation,assetid,assetcontact,assetcost);
         assetDetails[assetid] = Asset;


     }
     function sellon(uint id) public{
         require(own[msg.sender][id]== true,"owner is not calling");
         require(sellonof[msg.sender][id]== false,"sell is already on");
         sellonof[msg.sender][id]= true;
     }
      function selloff(uint id) public{
         require(own[msg.sender][id]== true,"owner is not calling");
         require(sellonof[msg.sender][id]== true,"sell is already off");
         sellonof[msg.sender][id]= false;
     }
     function BuyAsset(uint id,uint amount,address owner) public noReentrant {
         require(amount>0,"value needs greater than zero" );
         require(id>0,"id needs greater than zero" );
         require(exist[msg.sender] == true,"addr doesn't exist");
         require(own[owner][id]== true,"owner don't own this id");
         uint po = percentageown[owner][id];
         require(po>0,"you don't own this asset");
         asset memory _asset = assetDetails[1];
         uint totalvalue = _asset.cost;
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

      function getAssetowners(uint id) public view returns (address[] memory ){
        return assetowners[id];
    }
     function getPercentageown(address owner,uint _assetid) public view returns (uint){
        return percentageown[owner][_assetid];
    }

    function getOwn(address owner,uint Assetid) public view returns (bool){
        return own[owner][Assetid];
    }
    function getSellonof(address owner,uint assetId) public view returns (bool){
        return sellonof[owner][assetId];
    }
     function getAssetowns(address owner) public view returns (uint[] memory ){
        return assetowns[owner];
    }








 }