const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // given
    const starNotary = await StarNotary.deployed();
    const expectedName = "Star Notary 2021";
    const expectedSymbol = "SNC";
    const starId = 6;
    const starOwner = accounts[1];
    // when
    starNotary.createStar("A new tiny star", starId ,{from: starOwner});
    // then
    assert.equal(await starNotary.name.call(), expectedName);
    assert.equal(await starNotary.symbol.call(), expectedSymbol);
});

it('lets 2 users exchange stars', async() => {
    // given
    const starNotary = await StarNotary.deployed();
    const starId1 = 7;
    const starId2 = 8;
    const starOwner1 = accounts[1];
    const starOwner2 = accounts[2];
    // when
    await starNotary.createStar("A new big star ", starId1, {from: starOwner1});
    await starNotary.createStar("A new small star ", starId2, {from: starOwner2});
    await starNotary.exchangeStars(starId1, starId2, {from: starOwner2});
    // then
    assert.equal(await starNotary.ownerOf(starId1), starOwner2);
    assert.equal(await starNotary.ownerOf(starId2), starOwner1);
});

it('lets a user transfer a star', async() => {
    // given
    const starNotary = await StarNotary.deployed();
    const starId = 9;
    const starOwner = accounts[1];
    const to = accounts[2];
    // when
    await starNotary.createStar("A new giant star", starId, {from: starOwner});
    await starNotary.transferStar(to, starId, {from: starOwner});
    // then
    assert.equal(await starNotary.ownerOf(starId), to);
});

it('lookUptokenIdToStarInfo test', async() => {
    // given
    const starNotary = await StarNotary.deployed();
    const starId = 10;
    const expectedStarName = "Droid";
    const starOwner = accounts[1];
    // when
    await starNotary.createStar(expectedStarName, starId, {from: starOwner});
    const actualStarName = await starNotary.lookUptokenIdToStarInfo.call(starId); 
    // then
    assert.equal(expectedStarName, actualStarName);
});
