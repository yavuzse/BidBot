import React, {useState} from 'react';
import './App.css';
import {Asset, OpenSeaAsset} from "opensea-js/lib/types";
import HDWalletProvider from '@truffle/hdwallet-provider';
import Web3 from 'web3';
import {OpenSeaPort, Network} from 'opensea-js';


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
    const [floordata, setFloorData] = useState(null);
    const [maxcount, setMaxCount] = useState(null);
    const [val, setval] = useState(null);
    const [traitType, setTraitType] = useState(null);
    const [printTrait, setPrintTrait] = useState(false);
    const [printmaxCount, setPrintmaxCount] = useState(false);
    const [disable, setDisable] = useState(false);
    const [trait, setTrait] = useState(null);
    const [extrait, setexTrait] = useState(false);
    const [traitPrint, setTraitPrint] = useState(false);
    const [list, setList] = useState([])
    const [list2, setList2] = useState([])
    const [list3, setList3] = useState([])

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

    async function getTraitArr() {
        await setTrait(await getTrait())
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

    function getFloorData(val: any) {
        setFloorData(val)
    }

    function getval(val: any) {
        setval(val.target.value)
    }

    function getTraitType(val: any) {
        setTraitType(val.target.value)
    }

    function getMaxCount(val: any) {
        setMaxCount(val)
    }

    function connectWallet() {
        if (!privateKey) return;

        let provider = new HDWalletProvider(privateKey, "https://mainnet.infura.io/v3/45df25d358e4448c991001858f0aea37");


        const seaport: OpenSeaPort = new OpenSeaPort(provider, {
            networkName: Network.Main
        })

        if (!seaport) alert("Private Key not entered");
        return seaport;
    }

    const offer = async (asset: Asset) => {
        let seaport = connectWallet();
        if (!asset || !asset.tokenAddress || !asset.tokenId || !seaport || !publicKey || !bidAmount || !expireTime) return;
        console.log("s")
        try {
            await seaport.createBuyOrder({
                asset: asset,
                accountAddress: publicKey,
                startAmount: bidAmount,

                expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * expireTime) // 3 Hours from Now
            }).catch(err => console.log(err))
            console.log("t")
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

        await seaport.api.getOrder({
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

        return Number(fAssets.assets[0].tokenId);
    }
/*
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

        return await getFloor();
    }*/

    async function bidonspecific() {
        let seaport = connectWallet();
        if (!seaport || !tokenAddress || !starttokid || !endtokid || !val || !traitType) return;

        let json_str: string = "";
        let index: number = 0;
        let rareTraits: OpenSeaAsset[] = [];

        for (let i = starttokid; i <= endtokid; i++) {

            await seaport.api.getAsset({
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

            for (let element of rareTraits) {
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

    async function handlemaxTokenCount() {
        getMaxCount(await maxTokenCount());
    }

    async function getCollection() {
        let seaport: OpenSeaPort = connectWallet();
        if (!seaport || !tokenAddress) return;

        let collectionName: string = await seaport.api.getAsset({
            tokenId: String(1),
            tokenAddress: tokenAddress
        }).then((res) => {
            //console.log(res.collection);
            return res.collection.slug;
        })

        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", "https://api.opensea.io/api/v1/collection/" + collectionName, false); // false for synchronous request
        xmlHttp.send(null);

        return JSON.parse(xmlHttp.responseText)
    }

    async function getTrait() {
        let parsed = await getCollection()
        return parsed.collection.traits;
    }

    async function getFloor() {
        let parsed = await getCollection();
        return parsed.collection.stats.floor_price;
    }

    function renderTrait() {
        if (!tokenAddress || !trait) return;
        if (tokenAddress.length !== 42) {
            return;
        }

        while (list.length) {
            list.pop()
        }

        for (let i in trait) {
            list.push(i)
        }

        sleep(10000).then()

        setexTrait(true)
    }

    async function renderTraitName() {
        if (!tokenAddress || !traitType || !trait) return;
        if (tokenAddress.length !== 42) {
            return;
        }

        while (list2.length) {
            await list2.pop()
        }

        while (list3.length) {
            await list3.pop()
        }
        await setPrintTrait(false)

        for (let i in trait) {
            let key = i;
            let val = trait[i]
            console.log(String(traitType), key)
            if (String(traitType) === key) {

                for (let j in val) {
                    let percentage = await (Number(val[j]) / maxcount) * 100
                    list2.push(j + " : " + percentage.toFixed(2).toString() + "%")
                    list3.push(j)
                    console.log("pushed " + j)
                    //console.log(j+" : "+percentage.toFixed(2).toString() +"%")
                }
            }
        }
        await sleep(5000)

        await setPrintTrait(true)

    }

    async function handleFloor() {
        setDisable(true)
        await getFloorData(await getFloor());
        setPrintTrait(true);
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
                        <input list="pKeyList" type="text" onChange={getPublicKey} placeholder="publicKey" id="pKey"/>
                        <datalist id="pKeyList">
                            <option value="0x706026dF93c7C4e01D536A7a7E9d3c222D7bB985">test</option>
                        </datalist>
                    </div>
                    <div>
                        <label htmlFor="bidA">Amount to Bid</label>
                        <input type="text" onChange={getBidAmount} placeholder="Amount to Bid" id="bidA"/>
                    </div>
                    <div>
                        <label htmlFor="ACO">Asset Contract Owner</label>
                        <input list="ACOList" type="text" onChange={(e) => {
                            getTokenAddress(e);
                        }} placeholder="Asset Contract Owner" id="ACO"/>
                        <datalist id="ACOList">
                            <option value="0x88091012eedf8dba59d08e27ed7b22008f5d6fe5">Whales</option>
                        </datalist>
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
                        <label htmlFor="traitCategory">Trait Category</label>
                        <input list={tokenAddress} type="text" onChange={getTraitType}
                               placeholder="Trait Category" id="traitCategory"/>
                        <datalist id={tokenAddress}>
                            {
                                extrait ? list?.map((x, index) => <option value={x}>{x + " " + index}</option>)
                                    : null
                            }
                        </datalist>

                    </div>
                    <div>
                        <label htmlFor="traitName">Trait Name</label>
                        <input list={traitType} type="text" onChange={getval}
                               placeholder="Trait Name" id="traitName"/>
                        <datalist id={traitType}>
                            {
                                printTrait ? list2?.map((x, index) => <option value={list3[index]}>{x}</option>)
                                    : null
                            }
                        </datalist>


                    </div>

                    <div id="btns">
                        <button disabled={disable} id="offer" onClick={async () => await offerMultiple()}> Offer
                        </button>
                        <button disabled={disable} id="coffer" onClick={async () => await cancelMultiple()}> cancel
                            Offer
                        </button>
                        <button disabled={disable} id="floor" onClick={async () => await handleFloor()}> Collection
                            Floor
                        </button>
                        <button disabled={disable} onClick={async () => await handlebidonspecific()}> bid on specific
                            trait
                        </button>
                        <button disabled={disable} onClick={async () => await handlemaxTokenCount()}> Asset Count
                        </button>
                        <button onClick={async () => window.location.reload()}>Stop</button>
                        <button onClick={() => {
                            getTraitArr().then(() => console.log("success")).catch(r => alert(r + " retry"))
                            handlemaxTokenCount().then();
                        }}> get
                        </button>
                        <button onClick={() => {
                            console.log(trait)
                            renderTrait();
                            renderTraitName().then()
                        }}> render
                        </button>
                    </div>
                    {
                        printTrait ?
                            <p>{floordata}</p>
                            : null
                    }
                    {
                        printmaxCount ?
                            <p>{maxcount}</p>
                            : null
                    }
                </div>
            </header>
        </div>
    );
}

export default App;
