import React, {useState} from 'react';
import './App.css';
import {Asset, OpenSeaAsset, Order} from "opensea-js/lib/types";
import HDWalletProvider from '@truffle/hdwallet-provider';
import Web3 from 'web3';
import {OpenSeaPort, Network} from 'opensea-js';
const {Builder, By} = require('selenium-webdriver');


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function App() {
    const [privateKey, setPrivateKey] = useState(null);
    const [publicKey, setPublicKey] = useState(null);
    const [bidAmount, setBidAmount] = useState(null);
    const [starttokid, setStartTokenId] = useState(null);
    const [endtokid, setEndTokenId] = useState(null);
    const [tokenAddress, setTokenAddress] = useState(null);
    const [expireTime, setExpireTime] = useState(null);
    const [traitdata, setTraitData] = useState(null);
    const [val, setval] = useState(null);
    const [traitType, setTraitType] = useState(null);
    const [printTrait, setPrintTrait] = useState(false);
    const [disable, setDisable] = useState(false);

    function getPrivateKey(val: any) {
        setPrivateKey(val.target.value)
    }

    function getPublicKey(val: any) {
        setPublicKey(val.target.value)
    }

    function getBidAmount(val: any) {
        setBidAmount(val.target.value)
    }

    function getStartTokenId(val: any) {
        setStartTokenId(val.target.value)
    }

    function getEndTokenId(val: any) {
        setEndTokenId(val.target.value)
    }

    function getTokenAddress(val: any) {
        setTokenAddress(val.target.value)
    }

    function getExpireTime(val: any) {
        setExpireTime(val.target.value)
    }

    function getTraitData(val: any) {
        setTraitData(val)
    }

    function getval(val: any) {
        setval(val.target.value)
    }

    function getTraitType(val: any) {
        setTraitType(val.target.value)
    }

    function connectWallet() {
        if (!privateKey) return;

        let provider = new HDWalletProvider(privateKey, "https://rinkeby.infura.io/v3/45df25d358e4448c991001858f0aea37");


        const seaport: OpenSeaPort = new OpenSeaPort(provider, {
            networkName: Network.Rinkeby
        })

        if (!seaport) throw "Private Key not entered";
        return seaport;
    }

    const offer = async (asset: Asset) => {
        let seaport = connectWallet();
        if (!asset || !asset.tokenAddress || !asset.tokenId || !seaport || !publicKey || !bidAmount || !expireTime) return;

        try {
            await seaport.createBuyOrder({
                asset: asset,
                accountAddress: publicKey,
                startAmount: bidAmount,

                expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * expireTime) // 3 Hours from Now
            })
            alert("placed bid on " + String(asset.tokenId));
        } catch (e) {
            throw e;
        }
    }

    async function offerMultiple() {
        setDisable(true)
        alert("Started Bidding")
        if (!starttokid || !endtokid || !tokenAddress) return;

        for (let id: number = starttokid; id <= endtokid; id++) {
            let asset2: Asset = {
                tokenId: String(id),
                tokenAddress: tokenAddress,
            };

            await offer(asset2);
            await sleep(5000);
        }
        setDisable(false)
    }

    const cancelOffer = async (asset: Asset) => {
        let seaport = connectWallet();
        if (!asset || !asset.tokenAddress || !asset.tokenId || !seaport || !publicKey || !bidAmount) return;

        let order1: Order | void = await seaport.api.getOrder({
            token_id: asset.tokenId,
            bundled: false,
            limit: 20,
            offset: 0,
            asset_contract_address: asset.tokenAddress,
            side: 0
        }).then(async (res) => {
            if (!seaport) return;
            await seaport.cancelOrder({
                accountAddress: publicKey,
                order: res,
            }).then(() => {
                alert("Canceled Offer" + String(asset.tokenId))
                return res;
            }).catch((err) => {
                console.warn(err);
            })
        }).catch((err) => {
            throw err;
        });
    }

    async function cancelMultiple() {
        setDisable(true)
        alert("Started Cancelling Process")
        if (!starttokid || !endtokid || !tokenAddress) return;

        for (let id: number = starttokid; id <= endtokid; id++) {
            let asset2: Asset = {
                tokenId: String(id),
                tokenAddress: tokenAddress,
            };

            await cancelOffer(asset2);
            await sleep(5000);
        }
        setDisable(false)
    }

    async function maxTokenCount() {
        let seaport = connectWallet();
        if (!seaport || !tokenAddress) return;

        let fAssets = await seaport.api.getAssets({
            limit: 1,
            asset_contract_address: tokenAddress,
            offset: 0
        })
            .then((res) => {
                return res;
            }).catch((err) => {
                throw err;
            });

        let maxtok = Number(fAssets.assets[0].tokenId);

        return maxtok;
    }

    async function traitRaritys() {
        let seaport = connectWallet();
        if (!seaport || !tokenAddress || !starttokid) return;

        var maxTokenId: number | undefined = await maxTokenCount()
        if (maxTokenId !== undefined) {
            var maxtok: number = maxTokenId
        }
        let json_str: string = "";
        var index: number = 0;
        var trait_counts = new Array();


        let asset3 = await seaport.api.getAsset({
            tokenId: starttokid,
            tokenAddress: tokenAddress
        }).then((res) => {
            res.traits.forEach(element => {
                json_str = JSON.stringify(element);
                let trait_count = Number(JSON.parse(json_str).trait_count);
                trait_counts[index] = String((trait_count / maxtok * 100).toFixed(2)) + "%     ";
                index++
            });
            console.warn(trait_counts);
            return trait_counts;
        }).catch((err: any) => {
            throw err;
        });

        return asset3;
    }

    async function handle() {
        setDisable(true)
        await getTraitData(await traitRaritys());
        setPrintTrait(true);
        setDisable(false)
    }


    async function bidonspecific() {
        let seaport = connectWallet();
        if (!seaport || !tokenAddress || !starttokid || !endtokid || !val || !traitType) return;

        let json_str: string = "";
        let index: number = 0;
        let rareTraits: OpenSeaAsset[] = [];

        for (let i = starttokid; i <= endtokid; i++) {

            let asset3: OpenSeaAsset | null = await seaport.api.getAsset({
                tokenId: String(i),
                tokenAddress: tokenAddress
            }).then((res) => {
                res.traits.forEach(element => {
                    json_str = JSON.stringify(element);
                    let parsedjson = JSON.parse(json_str)
                    if (parsedjson.value === val && parsedjson.trait_type === traitType) {
                        rareTraits[index] = res;
                        console.log(res.tokenId);
                        index++;
                        return res;
                    }
                });

                return null;
            }).catch((err) => {
                throw err;
            });

        }

        return rareTraits;
    }

    async function handlebidonspecific() {
        setDisable(true)
        alert("Started bidding on items with specific trait")
        let rareTraits: OpenSeaAsset[] | undefined = await bidonspecific();
        if (rareTraits !== undefined) {
            let rares: OpenSeaAsset[] = rareTraits;

            for (var element of rares) {
                await offer({
                    tokenAddress: element.tokenAddress,
                    tokenId: element.tokenId
                });
                console.warn(element.tokenId)
                await sleep(5000);
            }
        }
        setDisable(false)
    }


    return (
        <div className="App">
            <header className="App-header">

                <div id="contract">
                    <div>
                        <label htmlFor="pvKey">privateKey</label>
                        <input type="password" onChange={getPrivateKey} placeholder="privateKey" id="pvKey"/>
                    </div>
                    <div>
                        <label htmlFor="pKey">publicKey</label>
                        <input type="text" onChange={getPublicKey} placeholder="publicKey" id="pKey"/>
                    </div>
                    <div>
                        <label htmlFor="bidA">Amount to Bid</label>
                        <input type="text" onChange={getBidAmount} placeholder="Amount to Bid" id="bidA"/>
                    </div>
                    <div>
                        <label htmlFor="ACO">Asset Contract Owner</label>
                        <input type="text" onChange={getTokenAddress} placeholder="Asset Contract Owner" id="ACO"/>
                    </div>
                    <div>
                        <label htmlFor="startTok">start Token Id</label>
                        <input type="text" onChange={getStartTokenId} placeholder="start Token Id" id="startTok"/>
                    </div>
                    <div>
                        <label htmlFor="endTok">end Token Id</label>
                        <input type="text" onChange={getEndTokenId} placeholder="end Token Id" id="endTok"/>
                    </div>
                    <div>
                        <label htmlFor="expire">expiration Time in H</label>
                        <input type="text" onChange={getExpireTime} placeholder="expiration Time in H" id="expire"/>
                    </div>
                    <div>
                        <label htmlFor="expire" id="expire">Trait Category</label>
                        <input type="text" onChange={getTraitType} placeholder="Trait Category"/>
                    </div>
                    <div>
                        <label htmlFor="expire" id="expire">Trait Name</label>
                        <input type="text" onChange={getval} placeholder="Trait Name"/>
                    </div>

                    <div id="btns">
                        <button disabled={disable} id="offer" onClick={async () => await offerMultiple()}> Offer
                        </button>
                        <button disabled={disable} id="offer" onClick={async () => await cancelMultiple()}> cancel
                            Offer
                        </button>
                        <button disabled={disable} id="trait" onClick={async () => await handle()}> show trait%</button>
                        <button disabled={disable} onClick={async () => await handlebidonspecific()}> bid on specific
                            trait
                        </button>
                    </div>
                    {
                        printTrait ?
                            <p>{traitdata}</p>
                            : null
                    }
                </div>
            </header>
        </div>
    );
}

export default App;
