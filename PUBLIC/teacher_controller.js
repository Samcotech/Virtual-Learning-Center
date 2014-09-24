/**
 * Created by samcom on 22/9/14.
 */
angular.module('teacherController', []).controller('videoController', function ($scope, $http, $rootScope, model, socket, $timeout)
{
    console.log("Video controller");
    // Initializing Media Constarints For video
        var mediaConstraintsV = {
        'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true
        }
    };
    // Initializing Media Constarints For audio
    var mediaConstraintsA = {
        'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': false
        }
    };

//Access cam for video call

    function doGetUserMediaV()
    {
        document.getElementById('arrow').style.visibility = 'visible';
        document.getElementById('cam').style.visibility = 'visible';

        try {
            getUserMedia({
                    'audio': true,
                    'video': true
                }, onUserMediaSuccessV,
                onUserMediaError);
            console.log("success getuser media");
        } catch (e) {
            alert("getUserMedia() failed. Is this a WebRTC capable browser?");
        }
    }

//Call getUserMedia when teacher login
    doGetUserMediaV();

    function doGetUserMediaA() {
        try {
            getUserMedia({
                    'audio': true,
                    'video': false
                }, onUserMediaSuccessA,
                onUserMediaError);
        } catch (e) {
            alert("getUserMedia() failed. Is this a WebRTC capable browser?");
        }
    }
//callback on getusermedia failure
    function onUserMediaError(error) {
        document.getElementById('arrow').style.visibility = 'hidden';
        document.getElementById('cam').style.visibility = 'hidden';

        //console.log("Failed to get access to local media. Error code was " + error.code);
        //alert("Failed to get access to local media. Error code was " + error.code + ".");
    }

//send ICE information to visitor
    function onIceCandidate(event) {
        if (event.candidate) {
            sendMessageV({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {

        }
    }

    function onIceCandidateA(event) {
        if (event.candidate) {
            sendMessageA({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log("Other Things From onICA..!!!!!!!!!!");
        }
    }

//Add student stream
    function onRemoteStreamAdded(event) {
        $scope.remoteStream = event.stream;
        console.log("success remote stream addedd");

        try {

            attachMediaStream(clientvideo, event.stream);

        } catch (e) {
        }

        attachMediaStream(testvideo, event.stream);
        attachMediaStream(agentvideo, $scope.localStream);
    }

    //Event for peer connection open
    function onOpen() {
        $rootScope.videochat = false;
        $rootScope.audiochat = false;
        videochat = false;
    }

    //Event for peer connection close
    function onClose() {
        $rootScope.videochat = true;
        $rootScope.audiochat = true;
        videochat = true;
    }


    //create Peer connection for teacher and student video chat
    function createPeerConnection() {
        console.log("Create peer connection");
        var pc_config = {
            "iceServers": [
                {
                    "url": "stun:stun.l.google.com:19302"
                },
                {
                    'url': 'turn:homeo@turn.bistri.com:80',
                    'credential': 'homeo'
                }
            ]
        };
        try {
            // Create an RTCPeerConnection via the polyfill (adapter.js).
            pc = new RTCPeerConnection(pc_config);
            pc.onicecandidate = onIceCandidate;
            pc.addStream($scope.localStream);

        } catch (e) {
            alert("Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.");
            return;
        }
        pc.oniceconnectionstatechange = onicestate;
        pc.onopen = onOpen;
        pc.onclose = onClose;
        pc.onaddstream = onRemoteStreamAdded;
        pc.onremovestream = streamstop;
    }

    //Create peer connection for teacher and student Audio chat
    function createPeerConnectionA() {
        var pc_config = {
            "iceServers": [
                {
                    "url": "stun:stun.l.google.com:19302"
                },
                {
                    'url': 'turn:homeo@turn.bistri.com:80',
                    'credential': 'homeo'
                }
            ]
        };
        try {
            // Create an RTCPeerConnection via the polyfill (adapter.js).
            pc = new RTCPeerConnection(pc_config);
            pc.onicecandidate = onIceCandidateA;
            //Add localStream
            pc.addStream($scope.localStream);
        } catch (e) {
            alert("Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.");
            return;
        }
        pc.oniceconnectionstatechange = onicestateA;
        pc.onopen = onOpen;
        pc.onclose = onClose;
        pc.onaddstream = onRemoteStreamAddedA;
        pc.onremovestream = streamstop;

    }

    //ICE information for PeerConnection
    function onicestateA(event) {
        if (event.target.iceConnectionState == 'disconnected') {
            $scope.callhangup = false;
            $rootScope.callhangup1 = false;
            try {
                //pc.close();
                // $scope.localStream.stop();
            } catch (e) {
            }

            started = false;
            $scope.videochatready = false;
            $rootScope.videochatready1 = false;
            $scope.audiochatready = false;
        }
    }

    //Add student Audio Stream
    function onRemoteStreamAddedA(event) {
        $scope.remoteStream = event.stream;
        attachMediaStream(playAudio, event.stream);
        //attachMediaStream(agentvideo, $scope.localStream);
        $scope.callhangup = true;
        $rootScope.callhangup1 = true;
        $scope.audiochatready = true;

        $timeout.cancel(timer);
        console.log(event.stream.getVideoTracks()[0]);
    }

    //Ice framework for student audio call
    function onicestate(event) {
        if (event.target.iceConnectionState == 'disconnected') {
            $scope.callhangup = false;
            $rootScope.callhangup1 = false;
            try {
                // pc.close();
                //   $scope.localStream.stop();
            } catch (e) {
            }

            started = false;
            $scope.videochatready = false;
            $rootScope.videochatready1 = false;
            $scope.audiochatready = false;
        }
    }


    function streamstop(sdsd) {

    }


    //Check video already started
    function maybeStartV() {
        if (!started && $rootScope.localStream) {

            createPeerConnection();
            pc.addStream($scope.localStream);
            started = true;
            // Caller initiates offer to peer.
            doCallV();

        }
    }

    //Check Audio already started
    function maybeStartA() {
        if (!started && $rootScope.localStream) {

            createPeerConnection();
            pc.addStream($scope.localStream);
            started = true;
            // Caller initiates offer to peer.
            doCallA();
        }
    }


    //Answer  for student Offer
    function doAnswerV() {
        pc.createAnswer(setLocalAndSendMessageV, null, mediaConstraintsV);
    }

    //create Offer for student
    function doCallV() {
        console.log("Come to doCallV()");
        pc.createOffer(setLocalAndSendMessageV, null, mediaConstraintsV);
    }

    //Answer for student audio offer
    function doCallA() {
        pc.createOffer(setLocalAndSendMessageA, null, mediaConstraintsA);
    }

    //Offer for student audio answer
    function doAnswerA() {
        pc.createAnswer(setLocalAndSendMessageA, null, mediaConstraintsA);
    }


    //Set local description to peer and send message to other Peer
    function setLocalAndSendMessageV(sessionDescription) {
        console.log("Sent local description and send message");
        // set local description
        pc.setLocalDescription(sessionDescription);
        //Send a message to other peer
        sendMessageV(sessionDescription);
    }

    //Set local description to peer and send message to other Audio
    function setLocalAndSendMessageA(sessionDescription) {
        // Set local descrition and send message
        pc.setLocalDescription(sessionDescription);
        //Send message other peer
        sendMessageA(sessionDescription);
    }

    //Send message to other peer using socket.io
    function sendMessageA(message) {
        //conver message to JSON string
        var msgString = JSON.stringify(message);
        //Emit message to socket.io server (for other peer)
        socket.emit('agentPeerA', msgString);
    }

    //Send message to other peer using Socket.io(video)
    function sendMessageV(message) {
        //convert javacscript object into JSON string
        var msgString = JSON.stringify(message);
        //Emit message to socket.io server(for other peer)
        socket.emit('agentPeerV', msgString);
    }

    //Get usermedia stream for teacher video
    function onUserMediaSuccessV(stream) {
        //document.getElementById('arrow').style.visibility = 'hidden';
        //document.getElementById('cam').style.visibility = 'hidden';
        $scope.localStream = stream;
        window.localstream = stream;
        // createPeerConnection();
        // started = true;
        //doCallV();
        /* timer = $timeout(function () {
         try {
         $scope.localStream.stop();
         } catch (e) {

         }
         started = true;
         }, 15000);*/

    }
    //Get usermedia stream for agent audio
    function onUserMediaSuccessA(stream) {

        $scope.localStream = stream;
        //create peer connection
        createPeerConnectionA();
        started = true;
        //Create offer for Audio call
        doCallA();
        timer = $timeout(function () {
            try {
                //   $scope.localStream.stop();
            } catch (e) {

            }
            started = true;
        }, 15000);

    }
});