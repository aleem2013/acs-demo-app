import { Component, OnInit } from '@angular/core';
import { CallClient, LocalVideoStream, Renderer } from '@azure/communication-calling';
//import { CallClient, LocalVideoStream } from '@azure/communication-calling';
//import { AzureCommunicationUserCredential } from '@azure/communication-common';
import { AzureCommunicationUserCredential, isCallingApplication, isCommunicationUser, isPhoneNumber } from '@azure/communication-common';
import { createClientLogger, setLogLevel} from '@azure/logger';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-make-call',
  templateUrl: './make-call.component.html',
  styleUrls: ['./make-call.component.css']
})
export class MakeCallComponent implements OnInit {
  public destinationUserIds: any;
  public destinationPhoneIds: any;
  public destinationGroup: any;
  public threadIdInput: any;
  public messageIdInput: any;
  public organizerIdInput: any;
  public tenantIdInput: any;
  public callClient: any;
  public callAgent: any;
  public state: any;
  public name: string;

  public response: {};
  public provisionNewUserMessage: string;
  public callFinishConnectingResolve: any;
  public videoPromise: any;


  constructor(
    private authService: AuthService
    ) {
        //super(props);
        this.destinationUserIds = null;
        this.destinationPhoneIds = null;
        this.destinationGroup = null;
        this.threadIdInput = null;
        this.messageIdInput = null;
        this.organizerIdInput = null;
        this.tenantIdInput = null;
        this.callClient = null;
        this.callAgent = null;
        
        this.callFinishConnectingResolve = undefined;
        this.videoPromise = undefined;

        this.state = {
          showSpinner: false,
          call: undefined,
          id: undefined,
          streams: [],
          videoOn: true,
          micOn: true,
          onHold: false,
          screenShareOn: false,
          cameraDeviceOptions:[],
          speakerDeviceOptions:[],
          microphoneDeviceOptions:[],
          loggedIn: false,
          showCallSampleCode: false,
          showMuteUnmuteSampleCode: false,
          showHoldUnholdCallSampleCode: false,
          selectedCameraDeviceId: null,
          selectedSpeakerDeviceId: null,
          selectedMicrophoneDeviceId: null,
          showCameraNotFoundWarning: false,
          showSpeakerNotFoundWarning: false,
          showMicrophoneNotFoundWarning: false,
          showLocalVideo: true,
          showSettings: false,
      };
   }

  ngOnInit(): void {
    
  }

//   ngAfterContentInit(): void {
//     if (this.state.call) {
//         const cameraDevices = this.state.deviceManager.getCameraList();
//         const speakerDevices = this.state.deviceManager.getSpeakerList();
//         const microphoneDevices = this.state.deviceManager.getMicrophoneList();

//         cameraDevices.map((cameraDevice: { id: any; name: any; }) => { this.state.cameraDeviceOptions.push({key: cameraDevice.id, text: cameraDevice.name}) });
//         speakerDevices.map((speakerDevice: { id: any; name: any; }) => { this.state.speakerDeviceOptions.push({key: speakerDevice.id, text: speakerDevice.name}) });
//         microphoneDevices.map((microphoneDevice: { id: any; name: any; }) => { this.state.microphoneDeviceOptions.push({key: microphoneDevice.id, text: microphoneDevice.name}) });

//         this.state.deviceManager.on('videoDevicesUpdated', (e: { added: any[]; removed: any[]; }) => {
//             e.added.forEach((cameraDevice: { id: any; name: any; }) => { this.state.cameraDeviceOptions.push({key: cameraDevice.id, text: cameraDevice.name}); });

//             e.removed.forEach((removedCameraDevice: { id: any; }) => {
//                 this.state.cameraDeviceOptions.forEach((value: { key: any; }, index: any) => {
//                     if(value.key === removedCameraDevice.id) {
//                         this.state.cameraDeviceOptions.splice(index, 1);
//                         if(removedCameraDevice.id === this.state.selectedCameraDeviceId) {
//                             const cameraDevice = this.state.deviceManager.getCameraList()[0];
//                             //this.setState({selectedCameraDeviceId: cameraDevice.id});
//                             this.state.selectedCameraDeviceId = cameraDevice.id;
//                         }
//                     }
//                 });
//             });
//         });

//         this.state.deviceManager.on('audioDevicesUpdated', (e: { added: any[]; removed: any[]; }) => {
//             e.added.forEach((audioDevice: { deviceType: string; id: any; name: any; }) => {
//                 if (audioDevice.deviceType === 'Speaker') {
//                     this.state.speakerDeviceOptions.push({key: audioDevice.id, text: audioDevice.name});

//                 } else if(audioDevice.deviceType === 'Microphone') {
//                     this.state.microphoneDeviceOptions.push({key: audioDevice.id, text: audioDevice.name});
//                 }
//             });

//             e.removed.forEach((removedAudioDevice: { deviceType: string; id: any; }) => {
//                 if(removedAudioDevice.deviceType === 'Speaker') {
//                     this.state.speakerDeviceOptions.forEach((value: { key: any; }, index: any) => {
//                         if(value.key === removedAudioDevice.id) {
//                             this.state.speakerDeviceOptions.splice(index, 1);
//                             if(removedAudioDevice.id === this.state.selectedSpeakerDeviceId) {
//                                 const speakerDevice = this.state.deviceManager.getSpeakerList()[0];
//                                 this.state.deviceManager.setSpeaker(speakerDevice);
//                                 //this.setState({selectedSpeakerDeviceId: speakerDevice.id});
//                                 this.state.selectedSpeakerDeviceId = speakerDevice.id;
//                             }
//                         }
//                     });
//                 } else if (removedAudioDevice.deviceType === 'Microphone') {
//                     this.state.microphoneDeviceOptions.forEach((value: { key: any; }, index: any) => {
//                         if(value.key === removedAudioDevice.id) {
//                             this.state.microphoneDeviceOptions.splice(index, 1);
//                             if(removedAudioDevice.id === this.state.selectedMicrophoneDeviceId) {
//                                 const microphoneDevice = this.state.deviceManager.getMicrophoneList()[0];
//                                 this.state.deviceManager.setMicrophone(microphoneDevice);
//                                 //this.setState({selectedMicrophoneDeviceId: microphoneDevice.id});
//                                 this.state.selectedMicrophoneDeviceId = microphoneDevice.id;
//                             }
//                         }
//                     });
//                 }
//             });
//         });

//         const onCallStateChanged = () => {
//             console.log('callStateChanged', this.state.call.state);
//             //this.setState({callState: this.state.call.state});
//             this.state.call.state = this.state.call.state;

//             if (this.state.call.state !== 'None' &&
//                 this.state.call.state !== 'Connecting' &&
//                 this.state.call.state !== 'Incoming') {
//                     if (this.callFinishConnectingResolve) {
//                         this.callFinishConnectingResolve();
//                     }
//             }
//             if (this.state.call.state === 'Incoming') {
//                 this.state.selectedCameraDeviceId = cameraDevices[0]?.id;
//                 this.state.selectedSpeakerDeviceId = speakerDevices[0]?.id;
//                 this.state.selectedMicrophoneDeviceId = microphoneDevices[0]?.id;
//             }
//         }
//         onCallStateChanged();
//         this.state.call.on('callStateChanged', onCallStateChanged);
//         this.state.call.on('callIdChanged', () => {
//             //this.setState({ callId: this.state.call.id});
//             this.state.callId = this.state.call.id;
//         });
//         this.state.call.remoteParticipants.forEach((rp: any) => this.subscribeToRemoteParticipant(rp));
//         this.state.call.on('remoteParticipantsUpdated', (e: { added: any[]; removed: any[]; }) => {
//             console.log(`Call=${this.state.call.callId}, remoteParticipantsUpdated, added=${e.added}, removed=${e.removed}`);
//             e.added.forEach((p: any) => {
//                 console.log('participantAdded', p);
//                 this.subscribeToRemoteParticipant(p);
//                 //this.setState({remoteParticipants: [...this.state.call.remoteParticipants.values()]});
//                 this.state.remoteParticipants = [...this.state.call.remoteParticipants.values()];
//             });
//             e.removed.forEach((p: any) => {
//                 console.log('participantRemoved');
//                 //this.setState({remoteParticipants: [...this.state.call.remoteParticipants.values()]});
//                 this.state.remoteParticipants = [...this.state.call.remoteParticipants.values()];
//             });
//         });
//     }
//   }
  ngAfterViewInit(): void {
    
  }
  

  provisionNewUser(): void {
      this.state.showSpinner = true;
      this.authService.provisionNewUser()
        .then((response) => {
          this.state.id = this.getIdentifierText(response);
          this.response = this.getToken(response);
          this.provisionNewUserMessage = "The Identity you've provisioned is:";
          this.handleLogIn({ id: this.state.id, token: this.response });
          
          this.state.showSpinner = false;
          this.state.loggedIn = true;
        });

        
        // this.setState({ showSpinner: true});
        // this.userDetailsResponse = await utils.provisionNewUser(this.userIdentity);
        // this.setState({ id: utils.getIdentifierText(this.userDetailsResponse.user) });
        // await this.props.onLoggedIn({ id: this.state.id, token: this.userDetailsResponse.token });
        // this.setState({ loggedIn: true });
        
  }

  handleLogIn = async (userDetails: any) => {
      if (userDetails) {
        try {
            const tokenCredential = new AzureCommunicationUserCredential(userDetails.token);
            const logger = createClientLogger('ACS');
            setLogLevel("warning");
            logger.info((...args: any) => { console.info(...args) ; });

            const options = { logger: logger };
            this.callClient = new CallClient(options);
            this.callAgent = await this.callClient.createCallAgent(tokenCredential);
            this.state.deviceManager = await this.callClient.getDeviceManager();
            await this.state.deviceManager.askDevicePermission(true, true);
            this.callAgent.updateDisplayName(userDetails.id);
            this.callAgent.on('callsUpdated', (e: { added: any[]; removed: any[]; }) => {
              console.log(`callsUpdated, added=${e.added}, removed=${e.removed}`);

              e.added.forEach((call: { isIncoming: any; reject: () => void; }) => {
                  if (this.state.call && call.isIncoming) {
                      call.reject();
                      return;
                  }
                  //this.setState({ call: call, callEndReason: undefined })
                  this.state.call = call;
                  this.state.callEndReason = undefined;
              });

              e.removed.forEach((call: any) => {
                  if (this.state.call && this.state.call === call) {
                      // this.setState({
                      //     call: null,
                      //     callEndReason: this.state.call.callEndReason
                      // });
                      this.state.callEndReason = this.state.call.callEndReason;
                      this.state.call = null;                      
                  }
              });
          });
          //this.setState({ loggedIn: true });
          this.state.loggedIn = true;
        } catch(error) {
          console.log(error);
        }
      }
  }

  // enableLocalVideo = async (callOptions: any) => {
  //     try {
  //       /************************************************/
  //       /*     Local Video and Local Screen-sharing     */
  //       /************************************************/
  //       //const cameraDevice = this.callClient.getDeviceManager().getCameraList()[0];
  //       //const localVideoStream = new LocalVideoStream(cameraDevice);
  //       const localVideoStream = callOptions.videoOptions.localVideoStreams;
  //       await this.state.call.startVideo(localVideoStream); 
        
  //       console.log("call state 2 : "+this.state.call.state);
  //       /* To stop local video, pass the localVideoStream instance available in the
  //        localVideoStreams collection */
  //      // await this.state.call.stopVideo(localVideoStream);

  //       // You can use DeviceManager and Renderer to begin rendering streams from your local camera.
  //       // This stream won't be sent to other participants; it's a local preview feed. This is an asynchronous action.
  //       const renderer = new Renderer(localVideoStream);
  //       const view = await renderer.createView();
  //       document.getElementById("localVideoRenderer").appendChild(view.target);

  //     }catch(error){
  //       console.log("error");
  //     }
  // }

  placeCall = async () => {
    try {
      let identitiesToCall = [];
      const userIdsArray = this.destinationUserIds.split(',');
      const phoneIdsArray = (this.destinationPhoneIds!=null) ? this.destinationPhoneIds.split(',') : [];
      userIdsArray.forEach((userId: any, index: any) => {
        if (userId) {
            userId = userId.trim();
            userId = { communicationUserId: userId };
            if (!identitiesToCall.find(id => { return id === userId })) {
                identitiesToCall.push(userId);
            }
        }
      });

      phoneIdsArray.forEach((phoneNumberId: any, index: any) => {
          if (phoneNumberId) {
              phoneNumberId = phoneNumberId.trim();
              phoneNumberId = { phoneNumber: phoneNumberId };
              if (!identitiesToCall.find(id => { return id === phoneNumberId })) {
                  identitiesToCall.push(phoneNumberId);
              }
          }
      });

      let callOptions = this.getCallOptions();
      // if (this.alternateCallerId.value !== '') {
      //     callOptions.alternateCallerId = { phoneNumber: this.alternateCallerId.value.trim() };
      // }
      this.state.call = this.callAgent.call(identitiesToCall, callOptions);
      console.log("call state 1 : "+this.state.call.state);
      //this.enableLocalVideo(callOptions);
    }catch (e) {
            console.log('Failed to place a call', e);
    }
  }

  getCallOptions() {
    let callOptions = {
        videoOptions: {
            localVideoStreams: undefined
        },
        audioOptions: {
            muted: false
        }
    };

    const cameraDevice = this.state.deviceManager.getCameraList()[0];
    if(!cameraDevice || cameraDevice.id === 'camera:') {
        //this.setShowCameraNotFoundWarning(true);
        this.state.showCameraNotFoundWarning = true;
    } else if (cameraDevice) {
        //this.setState({ selectedCameraDeviceId: cameraDevice.id });
        this.state.selectedCameraDeviceId = cameraDevice.id;
        const localVideoStream = new LocalVideoStream(cameraDevice);
        callOptions.videoOptions = { localVideoStreams: [localVideoStream] };
    }

    const speakerDevice = this.state.deviceManager.getSpeakerList()[0];
    if(!speakerDevice || speakerDevice.id === 'speaker:') {
        //this.setShowSpeakerNotFoundWarning(true);
        this.state.showSpeakerNotFoundWarning = true;
    } else if(speakerDevice) {
        //this.setState({selectedSpeakerDeviceId: speakerDevice.id});
        this.state.selectedSpeakerDeviceId = speakerDevice.id;
        this.state.deviceManager.setSpeaker(speakerDevice);
    }

    const microphoneDevice = this.state.deviceManager.getMicrophoneList()[0];
    if(!microphoneDevice || microphoneDevice.id === 'microphone:') {
        this.setShowMicrophoneNotFoundWarning(true);
    } else {
        //this.setState({selectedMicrophoneDeviceId: microphoneDevice.id});
        this.state.selectedMicrophoneDeviceId = microphoneDevice.id;
        this.state.deviceManager.setMicrophone(microphoneDevice);
    }

    return callOptions;
  }


  setShowCameraNotFoundWarning(show: boolean) {
      //this.setState({showCameraNotFoundWarning: show});
  }

  setShowSpeakerNotFoundWarning(show: boolean) {
      //this.setState({showSpeakerNotFoundWarning: show});
  }

  setShowMicrophoneNotFoundWarning(show: boolean) {
      //this.setState({showMicrophoneNotFoundWarning: show});
  }

  getToken = (response: any) =>{
    return response.Token;
  }
  
  getIdentifierText = (identifier: any) => {
    identifier = identifier.User;
    console.log("identifier ", identifier);
    if (isCommunicationUser(identifier)) {
        return identifier.communicationUserId;
    } else if (isPhoneNumber(identifier)) {
        return identifier.phoneNumber;
    } else if(isCallingApplication(identifier)) {
        return identifier.callingApplicationId;
    } else {
        return 'Unknwon Identifier';
    }
  }

//   subscribeToRemoteParticipant (participant: any) {
//     let id = this.getIdentifierText(participant.identifier);

//     participant.on('participantStateChanged', () => {
//         console.log('participantStateChanged', participant.identifier.communicationUserId, participant.state);
//         //this.setState({remoteParticipants: [...this.state.call.remoteParticipants.values()]});
//         this.state.remoteParticipants = [...this.state.call.remoteParticipants.values()];
//     });

//     const handleParticipantStream = (e: any) => {
//         e.added.forEach((stream: { type: any; }) => {
//             console.log('video stream added', id, stream, stream.type);
//                 //this.setState({streams: this.state.streams.concat({stream: stream, id: id})});
//                 this.state.streams = this.state.streams.concat({stream: stream, id: id});
//         });
//         e.removed.forEach((stream: { type: any; }) => {
//             console.log('video stream removed', id, stream, stream.type)
//         });
//     }

//     // Get participants video streams and screen sharing streams
//     let participantStreams = participant.videoStreams.map((v: any) => { return {stream: v, id}});
//     // Filter out the participant stream tuples that are not already in this.state.streams
//     participantStreams = participantStreams.filter((streamTuple: { stream: any; id: any; }) => {return !this.state.streams.some((tuple: { stream: any; id: any; }) => { return tuple.stream === streamTuple.stream && tuple.id === streamTuple.id})});
//     // Add participantStreams to the list of all remote participant streams
//     //this.setState({streams: this.state.streams.concat(participantStreams)});
//     this.state.streams = this.state.streams.concat(participantStreams);
//     participant.on('videoStreamsUpdated', handleParticipantStream);
//     participant.on('screenSharingStreamsUpdated', handleParticipantStream);
//   }

//   async watchForCallFinishConnecting() {
//         return new Promise((resolve) => {
//             if (this.state.call.state !== 'None' && this.state.call.state !== 'Connecting' && this.state.call.state !== 'Incoming') {
//                 resolve();
//             } else {
//                 this.callFinishConnectingResolve = resolve;
//             }
//         }).then(() => {
//             this.callFinishConnectingResolve = undefined;
//         });
//     }

//   async handleVideoOnOff () {
//     try {
//         if (this.state.call.state === 'None' || 
//             this.state.call.state === 'Connecting' ||
//             this.state.call.state === 'Incoming') {
//                 if(this.state.videoOn) {
//                     //this.setState({ videoOn: false });
//                     this.state.videoOn = false;
//                 } else {
//                     //this.setState({ videoOn: true })
//                     this.state.videoOn = true;
//                 }
//                 await this.watchForCallFinishConnecting();
//                 if(this.state.videoOn) {
//                     const cameraDeviceInfo = this.state.deviceManager.getCameraList().find((cameraDeviceInfo: { id: any; }) => {
//                         return cameraDeviceInfo.id === this.state.selectedCameraDeviceId
//                     });
//                     this.state.call.startVideo(new LocalVideoStream(cameraDeviceInfo)).catch((error: any) => {});
//                 } else {
//                     this.state.call.stopVideo(this.state.call.localVideoStreams[0]).catch((error: any) => {});
//                 }
//         } else {
//             if(!this.videoPromise) {
//                 if(this.state.videoOn) {
//                     if (this.state.call.localVideoStreams && this.state.call.localVideoStreams.length > 0) {
//                         this.videoPromise = this.state.call.stopVideo(this.state.call.localVideoStreams[0]).then(() => {
//                             //this.setState({videoOn: false});
//                             this.state.videoOn = false;
//                             this.videoPromise = undefined;
//                         }).catch((error: any) => {
//                             this.videoPromise = undefined;
//                         });
//                     }
//                 } else {
//                     const cameraDeviceInfo = this.state.deviceManager.getCameraList().find((cameraDeviceInfo: { id: any; }) => {
//                         return cameraDeviceInfo.id === this.state.selectedCameraDeviceId;
//                     });
//                     this.videoPromise = this.state.call.startVideo(new LocalVideoStream(cameraDeviceInfo)).then(() => {
//                         //this.setState({videoOn: true});
//                         this.state.videoOn = true;
//                         this.videoPromise = undefined;
//                     }).catch((error: any) => {
//                         this.videoPromise = undefined;
//                     });
//                 }
//               }
//             }
//         } catch(e) {
//             this.videoPromise = undefined;
//             console.error(e);
//         }
//     }

//   async handleAcceptCall() { 
//     const cameraDevice = this.state.deviceManager.getCameraList()[0];
//     if(!cameraDevice || cameraDevice.id === 'camera:') {
//         //this.props.onShowCameraNotFoundWarning(true);
//         this.state.onShowCameraNotFoundWarning = true;
//     } else if (cameraDevice) {
//         //this.setState({ selectedCameraDeviceId: cameraDevice.id });
//         this.state.selectedCameraDeviceId = cameraDevice.id;
//         //const localVideoStream = new LocalVideoStream(cameraDevice);
//     }

//     const speakerDevice = this.state.deviceManager.getSpeakerList()[0];
//     if(!speakerDevice || speakerDevice.id === 'speaker:') {
//         //this.props.onShowSpeakerNotFoundWarning(true);
//         this.state.onShowSpeakerNotFoundWarning = true;
//     } else if(speakerDevice) {
//         //this.setState({selectedSpeakerDeviceId: speakerDevice.id});
//         this.state.selectedSpeakerDeviceId = speakerDevice.id;
//         this.state.deviceManager.setSpeaker(speakerDevice);
//     }

//     const microphoneDevice = this.state.deviceManager.getMicrophoneList()[0];
//     if(!microphoneDevice || microphoneDevice.id === 'microphone:') {
//         //this.props.onShowMicrophoneNotFoundWarning(true);
//         this.state.onShowMicrophoneNotFoundWarning = true;
//     } else {
//         //this.setState({selectedMicrophoneDeviceId: microphoneDevice.id});
//         this.state.selectedMicrophoneDeviceId = microphoneDevice.id;
//         this.state.deviceManager.setMicrophone(microphoneDevice);
//     }

//     this.state.call.accept({
//         videoOptions: this.state.videoOn && cameraDevice ? { localVideoStreams: [new LocalVideoStream(cameraDevice)] } : undefined
//     }).catch((e: any) => console.error(e));
// }

}
