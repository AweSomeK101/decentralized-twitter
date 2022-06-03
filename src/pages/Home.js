import React from "react";
import "./Home.css";
import { defaultImgs } from "../defaultimgs";
import { TextArea, Icon } from "web3uikit";
import { useState, useRef } from "react";
import TweetInFeed from "../components/TweetInFeed";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import TweetAbi from "../abi/tweets.json";

const Home = () => {

  const { Moralis, user: useer } = useMoralis();
  const user = Moralis.User.current();
  const contractProcessor = useWeb3ExecuteFunction();
  console.log("user: ", user);
  console.log("user: ", Moralis.User);

  const inputFile = useRef(null);
  const [selectedFile, setSelectedFile] = useState();
  const [theFile, setTheFile] = useState();
  const [tweet, setTweet] = useState();

  async function maticTweet() {

    if (!tweet) return;

    let img;
    if (theFile) {
      const data = theFile;
      const file = new Moralis.File(data.name, data);
      await file.saveIPFS();
      img = file.ipfs();
    }else{
      img = "No Img"
    }
    console.log("here");
    let options = {
      contractAddress: "0x959D0453Ee9069d5CA8a5A93793C2bE7B3A5Bf2D",
      functionName: "addTweet",
      abi: TweetAbi.abi,
      params: {
        tweetTxt: tweet,
        tweetImg: img,
      },
    }

    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        saveTweet();
      },
      onError: (error) => {
        console.log("Contract processor:", error)
      }
    });

  }


  async function saveTweet() {

    if(!tweet) return;

    const Tweets = Moralis.Object.extend("Tweets");

    const newTweet = new Tweets();

    newTweet.set("tweetTxt", tweet);
    newTweet.set("tweeterPfp", user.attributes.pfp);
    newTweet.set("tweeterAcc", user.attributes.ethAddress);
    newTweet.set("tweeterUserName", user.attributes.username);

    if (theFile) {
      const data = theFile;
      const file = new Moralis.File(data.name, data);
      await file.saveIPFS();
      newTweet.set("tweetImg", file.ipfs());
    }

    await newTweet.save();
    window.location.reload();

  }

  const onImageClick = () => {
    inputFile.current.click();
  };

  const changeHandler = (event) => {
    const img = event.target.files[0];
    setTheFile(img);
    setSelectedFile(URL.createObjectURL(img));
  };

  return (
    <>
    <div className="pageIdentify">Home</div>
      <div className="mainContent">
        <div className="profileTweet">
          {console.log(user)}
          <img src={user.attributes.pfp ? user.attributes.pfp : `https://api.multiavatar.com/${useer.attributes.ethAddress}.svg`} className="profilePic"></img>
          <div className="tweetBox">
            <TextArea
              label=""
              name="tweetTxtArea"
              placeholder="enter tweet"
              type="text"
              onChange={(e) => setTweet(e.target.value)}
              width="95%"
            ></TextArea>
            {selectedFile && (
              <img src={selectedFile} className="tweetImg"></img>
            )}
            <div className="imgOrTweet">
              <div className="imgDiv" onClick={onImageClick}>
              <input
                  type="file"
                  name="file"
                  ref={inputFile}
                  onChange={changeHandler}
                  style={{ display: "none"}}
                />
                <Icon fill="#1DA1F2" size={20} svg="image"></Icon>
              </div>
              <div className="tweetOptions">
                <div className="tweet" onClick={maticTweet}>Tweet</div>
                {/* <div className="tweet" onClick={maticTweet} style={{ backgroundColor: "#8247e5" }}>
                  <Icon fill="#ffffff" size={20} svg="matic" />
                </div> */}
              </div>
            </div>
          </div>
        </div>
        <TweetInFeed profile={false}/>
      </div>
    </>
  );
};

export default Home;
