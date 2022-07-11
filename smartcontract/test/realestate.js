const {expect} = require("chai");
const {ethers} = require("hardhat");


describe("realestate contract", ()=>{
    let Realestate;
    let realestate;
    let Token;
    let token1
    
    let creator;
    let addr1;
    let addr2;
    let addrs;


    beforeEach(async ()=>{
        Token = await ethers.getContractFactory("MyToken");
        Realestate = await ethers.getContractFactory("realestate");

        [creator,addr1,addr2, ...addrs] = await ethers.getSigners();
        token1 = await Token.deploy("Almur","AH");
        realestate = await Realestate.deploy(token1.address);
        const p = ethers.utils.parseUnits("12", "18");
        await token1.transfer(addr2.address,p);
        const p1 = ethers.utils.parseUnits("7", "18");
        await token1.connect(addr2).approve(realestate.address,p1);
        // await token1.connect(crowdfund).approve(addr2.address,p1);
        

        
        console.log (await token1.balanceOf(addr2.address));
        console.log (await token1.balanceOf(creator.address));
        console.log (await token1.balanceOf(addr1.address));






    });

    describe("Deployment",()=>{
        it("it should set the right erc20 token",async ()=>{
            // const token1 = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
            

            expect(await realestate.token()).to.equal(token1.address);

        });
    });

    describe("add buyer and seller",()=>{
        it("it will pass if buyer and sellers rules are correct",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            await realestate.addbuyerseller(Location,Contact);
            const _exist = await realestate.exist(creator.address);
            expect(_exist).to.equal(true);
            const _bsdetails = await realestate.BSdetails(creator.address);
            expect(_bsdetails.buyer).to.equal(creator.address);
            expect(_bsdetails.location).to.equal(Location);
            expect(_bsdetails.contact).to.equal(Contact);


        })
        it("it will fail if address already exist ",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            await realestate.addbuyerseller(Location,Contact);
            await expect(realestate.addbuyerseller(Location,Contact)).to.be.revertedWith("addr already exist");

        })

    })
    describe("addasset",()=>{
        it("it will add asset if all rules are correct",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("10", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            // await realestate.connect(addr2).BuyAsset(1,50000,creator.address);
            // await realestate.connect(addr1).addAsset(_assetLocation,assetContact);
            // expect(await realestate.assetowners(1)).to.deep.equal([creator.address]);
            expect(await realestate.getAssetowners(1)).to.deep.equal([creator.address]);
            const ptg = ethers.utils.parseUnits("100", "18");
            expect(await realestate.getPercentageown(creator.address,1)).to.equal(ptg);
            expect(await realestate.getOwn(creator.address,1)).to.equal(true);
            expect(await realestate.getSellonof(creator.address,1)).to.equal(false);
            
            


        })
        it("it will fail if addr not exist in contract",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("10", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await expect(realestate.connect(addr1).addAsset(_assetLocation,assetContact,cost)).to.be.revertedWith("addr doesn't exist"); 
           
        })
    })
    describe("sellon",()=>{
        it("it will make asset sell on if all rules are correct",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("10", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await realestate.sellon(1);
            expect(await realestate.getSellonof(creator.address,1)).to.equal(true);
            // await realestate.connect(addr2).BuyAsset(1,50000,creator.address);
            // await realestate.connect(addr1).addAsset(_assetLocation,assetContact);
            // expect(await realestate.assetowners(1)).to.deep.equal([creator.address]);
            
            


        })
        it("it will fail if owner is not calling", async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("10", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await expect(realestate.connect(addr1).sellon(1)).to.be.revertedWith("owner is not calling"); 
           
        })
        
        it("it will fail if sell is already on",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("10", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await realestate.sellon(1);
            await expect(realestate.sellon(1)).to.be.revertedWith("sell is already on");
            // expect(await realestate.getSellonof(creator.address,1)).to.equal(true);
            // await realestate.connect(addr2).BuyAsset(1,50000,creator.address);
            // await realestate.connect(addr1).addAsset(_assetLocation,assetContact);
            // expect(await realestate.assetowners(1)).to.deep.equal([creator.address]);
            
            


        })

    })
    describe("sellof",()=>{
        it("it will make asset sell off if all rules are correct",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("10", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await realestate.sellon(1);
            await realestate.selloff(1);
            expect(await realestate.getSellonof(creator.address,1)).to.equal(false);
            // await realestate.connect(addr2).BuyAsset(1,50000,creator.address);
            // await realestate.connect(addr1).addAsset(_assetLocation,assetContact);
            // expect(await realestate.assetowners(1)).to.deep.equal([creator.address]);
            
            


        })
        it("it will fail if owner is not calling", async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("10", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await realestate.sellon(1);
            await expect(realestate.connect(addr1).selloff(1)).to.be.revertedWith("owner is not calling"); 
           
        })
        
        it("it will fail if sell is already on",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("10", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await realestate.sellon(1);
            await realestate.selloff(1);
            await expect(realestate.selloff(1)).to.be.revertedWith("sell is already off");
            // expect(await realestate.getSellonof(creator.address,1)).to.equal(true);
            // await realestate.connect(addr2).BuyAsset(1,50000,creator.address);
            // await realestate.connect(addr1).addAsset(_assetLocation,assetContact);
            // expect(await realestate.assetowners(1)).to.deep.equal([creator.address]);
            
            


        })

    })
    describe("buyasset",()=>{
        it("it will pass buyasset if all rules are correct",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            await realestate.connect(addr2).addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("7", "18");
            const tcost = ethers.utils.parseUnits("100", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await realestate.sellon(1);
            const p1 = ethers.utils.parseUnits("3", "18");
            await realestate.connect(addr2).BuyAsset(1,p1,creator.address);
            console.log (await token1.balanceOf(addr2.address));
            console.log (await token1.balanceOf(creator.address));
            const per = await realestate.getPercentage(p1,cost);
            const lcost = tcost-per;
            console.log(lcost);
            const per1 = ethers.utils.formatUnits(per, "18");
            console.log(per1);
            expect(await realestate.getPercentageown(addr2.address,1)).to.equal(per);
            console.log(await realestate.getPercentageown(creator.address,1));
            const creatorp = await realestate.getPercentageown(creator.address,1);
            expect(await realestate.getPercentageown(creator.address,1)).to.equal(creatorp);
            expect(await realestate.getOwn(creator.address,1)).to.equal(true);
            expect(await realestate.getOwn(addr2.address,1)).to.equal(true);
            expect(await realestate.getAssetowners(1)).to.deep.equal([creator.address,addr2.address]);
            // expect(await realestate.getAssetowns(creator.address)).to.deep.equal([1]);
            const aid = await realestate.assetid();
            expect(await realestate.getAssetowns(addr2.address)).to.deep.equal([aid]);
            expect(await realestate.getAssetowns(creator.address)).to.deep.equal([aid]);


        })

        it("it will pass buyasset if buyer total sending value equal to owner total value",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const _assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ;
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetContact = "0xd4967590eb024589dfb6b9e48a576eb49ebc19d764b0d1d67dc21975e7258e97";
            await realestate.addbuyerseller(Location,Contact);
            await realestate.connect(addr2).addbuyerseller(Location,Contact);
            const cost = ethers.utils.parseUnits("7", "18");
            const tcost = ethers.utils.parseUnits("100", "18");
            await realestate.addAsset(_assetLocation,assetContact,cost);
            await realestate.sellon(1);
            const p1 = ethers.utils.parseUnits("7", "18");
            await realestate.connect(addr2).BuyAsset(1,p1,creator.address);
            console.log (await token1.balanceOf(addr2.address));
            console.log (await token1.balanceOf(creator.address));
            const per = await realestate.getPercentage(p1,cost);
            const lcost = tcost-per;
            console.log(lcost);
            const per1 = ethers.utils.formatUnits(per, "18");
            console.log(per1);
            expect(await realestate.getPercentageown(addr2.address,1)).to.equal(per);
            console.log(await realestate.getPercentageown(creator.address,1));
            const creatorp = await realestate.getPercentageown(creator.address,1);
            expect(await realestate.getPercentageown(creator.address,1)).to.equal(creatorp);
            expect(await realestate.getOwn(creator.address,1)).to.equal(false);
            expect(await realestate.getOwn(addr2.address,1)).to.equal(true);
            expect(await realestate.getAssetowners(1)).to.deep.equal([creator.address,addr2.address]);
            // expect(await realestate.getAssetowns(creator.address)).to.deep.equal([1]);
            const aid = await realestate.assetid();
            expect(await realestate.getAssetowns(addr2.address)).to.deep.equal([aid]);
            expect(await realestate.getAssetowns(creator.address)).to.deep.equal([aid]);


        })
    })


}) 