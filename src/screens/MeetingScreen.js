import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Box } from "@mui/system";
const socket = io.connect("/");
const MeetingScreen = () => {

  const [callEnded, setCallEnded] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef(new RTCPeerConnection(null));
  const textRef = useRef();
  const screenSharingRef = useRef();
  const [offerVisible, setOfferVisible] = useState(true);
  const [answevisible, setAnswerVisible] = useState(false);
  const [status, setstatus] = useState("Make a call now");
  const _pc = new RTCPeerConnection(null);

  useEffect(() => {
     // Signaling methods
    socket.on("connection-success", (success) => {
      console.log(success);
    });
    socket.on("sdp", (data) => {
      console.log(data.stream);
      connectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.stream)
      );
      textRef.current.value = JSON.stringify(data.stream);

      /// setting  the state of Buttons ///

      if (data.stream.type === "offer") {
        setOfferVisible(false);
        setAnswerVisible(true);
        setstatus("Incoming Call ....");
      } else if (data.stream.type === "answer") {
        setOfferVisible(false);
        setCallEnded(true);
        setstatus("Call");
        if (callEnded == true) {
          textRef.current.value = " ";
        }
      } else if (data.stream == null) {
        textRef.current.value = " ";
        setstatus("Make a call now");
      } else {
        setstatus("Call");
      }
    });
    socket.on("candidate", (candidate) => {
      console.log(candidate);
      connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
    const constraints = {
      audio: true,
      video: true,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        myVideo.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          _pc.addTrack(track, stream);
        });
        console.log("Got MediaStream:", stream.id);
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });

    _pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log(JSON.stringify(e.candidate));
        sendToPeer("candidate", e.candidate);
      }
    };
    _pc.oniceconnectionstatechange = (e) => {
      console.log(e, "iceconnection");
    };
    _pc.ontrack = (e) => {
      console.log(e);
      userVideo.current.srcObject = e.streams[0];
    };
    _pc.onclose = (e) => {
      console.log(e, "disconnected");
      userVideo.current.srcObject = null;
      window.location.reload()
    };
    connectionRef.current = _pc;
  }, []);

  const sendToPeer = (eventType, playLoad) => {
    socket.emit(eventType, playLoad);
  };

  const processSDP = (stream) => {
    console.log(JSON.stringify(stream));
    connectionRef.current.setLocalDescription(stream);
    sendToPeer("sdp", { stream });
  };
  const createOffer = () => {
    connectionRef.current
      .createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true,
        signalingState: true,
      })
      .then((stream) => {
        processSDP(stream);
        setstatus("Calling ....");
      })
      .catch((e) => console.log(e, "error.............."));
  };

  const createAnswer = () => {
    connectionRef.current
      .createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      .then((stream) => {
        processSDP(stream);
        setAnswerVisible(false);
        setstatus("Call");
      })
      .catch((e) => console.log(e, "tttttttttttttv"));
  };
  const leaveCall = () => {
    connectionRef.current.close({
      iceRestart: true,
    });
    _pc.close();
    setstatus("Make a call now");
    setCallEnded(true);
    setOfferVisible(true);
    textRef.current.value = " ";
    userVideo.current.srcObject = null;
  };

  const showHideButton = () => {
    if (status == "Make a call now") {
      return (
        <div>
          <button onClick={createOffer}>Call</button>
        </div>
      );
    } else if (status == "Calling ....") {
      return (
        <div>
        
          <button onClick={leaveCall}>End Call</button>
        </div>
      );
    } else if (status == "Incoming Call ....") {
      return (
        <div>
          <button onClick={createAnswer}>Answer</button>
        </div>
      );
    } else if (status == "Call") {
      return (
        <div>
          <button onClick={leaveCall}>End Call</button>
          <button onClick={startCapture}>Share Screen</button>
          <button onClick={stopCapture}>stop Screen Sharing</button>
        </div>
      );
    }
  };

  const displayMediaOptions = {
    video: {
      cursor: "always"
    },
    audio: false
  };
  const startCapture=async ()=>{
   try{ screenSharingRef.current.srcObject = await navigator.mediaDevices
    .getDisplayMedia(displayMediaOptions)
    dumpOptionsInfo();
   }
   
   catch(err){
    console.log(`Error: ${err}`);
   }
  }
  const stopCapture=(evt)=> {
    let tracks = screenSharingRef.current.srcObject.getTracks();
    tracks.forEach((track)=>track.stop());
    screenSharingRef.current.srcObject = null;
  }
  const dumpOptionsInfo=()=>{
    const videoTrack = screenSharingRef.current.srcObject.getVideoTracks()[0];
    userVideo.current = videoTrack
    console.info("Track settings:");
  console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
  console.info("Track constraints:");
  console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
  }

  return (
    <>
      <Box>
        <h1>sehrish</h1>
        <div>
          <video
            ref={myVideo}
            autoPlay={true}
            style={{ width: "300px", border: "1px solid" }}
          />
          <div>
          <video
            ref={userVideo}
            autoPlay={true}
            style={{ width: "300px", border: "1px solid" }}
          />
          <video  ref={screenSharingRef} autoPlay={true}/>
          
          </div>
          
          <br />

          {showHideButton()}
          <div>{status}</div>
          <textarea ref={textRef} hidden={true}></textarea>
          <br />
        </div>
      </Box>
    </>
  );
};

export default MeetingScreen;
