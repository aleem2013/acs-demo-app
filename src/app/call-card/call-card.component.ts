import { Component, Input, OnInit } from '@angular/core';
import { LocalVideoStream } from '@azure/communication-calling';
import { isCallingApplication, isCommunicationUser, isPhoneNumber } from '@azure/communication-common';

@Component({
  selector: 'app-call-card',
  templateUrl: './call-card.component.html',
  styleUrls: ['./call-card.component.css']
})
export class CallCardComponent implements OnInit {

  @Input()
  call: any;

  @Input()
  deviceManager: any;

  @Input()
  selectedCameraDeviceId: any;

  @Input()
  selectedSpeakerDeviceId: any;

  @Input()
  selectedMicrophoneDeviceId: any;

  @Input()
  onShowCameraNotFoundWarning: boolean;

  @Input()
  onShowSpeakerNotFoundWarning: boolean;

  @Input()
  onShowMicrophoneNotFoundWarning: boolean;

  public cameraDeviceOptions: any;
  public speakerDeviceOptions: any;
  public microphoneDeviceOptions: any;
  public provisionNewUserMessage: string;
  public callFinishConnectingResolve: any;
  public callId: any;
  public remoteParticipants: any;
  public streams: any[];
  public videoOn: boolean;
  public micOn: boolean;
  public onHold: boolean;

  public mutePromise: any;
  public videoPromise: any;
  public holdPromise: any;
  public screenShareOn: boolean;
  public id: any;
  public showLocalVideo: boolean;


  constructor() { }

  ngOnInit(): void {
    this.showLocalVideo = true;
    this.streams = [];
    this.cameraDeviceOptions= [];
    this.speakerDeviceOptions= [];
    this.microphoneDeviceOptions= [];
  }

  ngAfterContentInit(): void {
    if (this.call) {
        const cameraDevices = this.deviceManager.getCameraList();
        const speakerDevices = this.deviceManager.getSpeakerList();
        const microphoneDevices = this.deviceManager.getMicrophoneList();

        cameraDevices.map((cameraDevice: { id: any; name: any; }) => { this.cameraDeviceOptions.push({key: cameraDevice.id, text: cameraDevice.name}) });
        speakerDevices.map((speakerDevice: { id: any; name: any; }) => { this.speakerDeviceOptions.push({key: speakerDevice.id, text: speakerDevice.name}) });
        microphoneDevices.map((microphoneDevice: { id: any; name: any; }) => { this.microphoneDeviceOptions.push({key: microphoneDevice.id, text: microphoneDevice.name}) });

        this.deviceManager.on('videoDevicesUpdated', (e: { added: any[]; removed: any[]; }) => {
            e.added.forEach((cameraDevice: { id: any; name: any; }) => { this.cameraDeviceOptions.push({key: cameraDevice.id, text: cameraDevice.name}); });

            e.removed.forEach((removedCameraDevice: { id: any; }) => {
                this.cameraDeviceOptions.forEach((value: { key: any; }, index: any) => {
                    if(value.key === removedCameraDevice.id) {
                        this.cameraDeviceOptions.splice(index, 1);
                        if(removedCameraDevice.id === this.selectedCameraDeviceId) {
                            const cameraDevice = this.deviceManager.getCameraList()[0];
                            //this.setState({selectedCameraDeviceId: cameraDevice.id});
                            this.selectedCameraDeviceId = cameraDevice.id;
                        }
                    }
                });
            });
        });

        this.deviceManager.on('audioDevicesUpdated', (e: { added: any[]; removed: any[]; }) => {
            e.added.forEach((audioDevice: { deviceType: string; id: any; name: any; }) => {
                if (audioDevice.deviceType === 'Speaker') {
                    this.speakerDeviceOptions.push({key: audioDevice.id, text: audioDevice.name});

                } else if(audioDevice.deviceType === 'Microphone') {
                    this.microphoneDeviceOptions.push({key: audioDevice.id, text: audioDevice.name});
                }
            });

            e.removed.forEach((removedAudioDevice: { deviceType: string; id: any; }) => {
                if(removedAudioDevice.deviceType === 'Speaker') {
                    this.speakerDeviceOptions.forEach((value: { key: any; }, index: any) => {
                        if(value.key === removedAudioDevice.id) {
                            this.speakerDeviceOptions.splice(index, 1);
                            if(removedAudioDevice.id === this.selectedSpeakerDeviceId) {
                                const speakerDevice = this.deviceManager.getSpeakerList()[0];
                                this.deviceManager.setSpeaker(speakerDevice);
                                //this.setState({selectedSpeakerDeviceId: speakerDevice.id});
                                this.selectedSpeakerDeviceId = speakerDevice.id;
                            }
                        }
                    });
                } else if (removedAudioDevice.deviceType === 'Microphone') {
                    this.microphoneDeviceOptions.forEach((value: { key: any; }, index: any) => {
                        if(value.key === removedAudioDevice.id) {
                            this.microphoneDeviceOptions.splice(index, 1);
                            if(removedAudioDevice.id === this.selectedMicrophoneDeviceId) {
                                const microphoneDevice = this.deviceManager.getMicrophoneList()[0];
                                this.deviceManager.setMicrophone(microphoneDevice);
                                //this.setState({selectedMicrophoneDeviceId: microphoneDevice.id});
                                this.selectedMicrophoneDeviceId = microphoneDevice.id;
                            }
                        }
                    });
                }
            });
        });

        const onCallStateChanged = () => {
            console.log('callStateChanged', this.call.state);
            //this.setState({callState: this.state.call.state});
            //this.call.state = this.call.state;

            if (this.call.state !== 'None' &&
                this.call.state !== 'Connecting' &&
                this.call.state !== 'Incoming') {
                    if (this.callFinishConnectingResolve) {
                        this.callFinishConnectingResolve();
                    }
            }
            if (this.call.state === 'Incoming') {
                this.selectedCameraDeviceId = cameraDevices[0]?.id;
                this.selectedSpeakerDeviceId = speakerDevices[0]?.id;
                this.selectedMicrophoneDeviceId = microphoneDevices[0]?.id;
            }
        }
        onCallStateChanged();
        this.call.on('callStateChanged', onCallStateChanged);
        this.call.on('callIdChanged', () => {
            //this.setState({ callId: this.state.call.id});
            this.callId = this.call.id;
        });
        this.call.remoteParticipants.forEach((rp: any) => this.subscribeToRemoteParticipant(rp));
        this.call.on('remoteParticipantsUpdated', (e: { added: any[]; removed: any[]; }) => {
            console.log(`Call=${this.call.callId}, remoteParticipantsUpdated, added=${e.added}, removed=${e.removed}`);
            e.added.forEach((p: any) => {
                console.log('participantAdded', p);
                this.subscribeToRemoteParticipant(p);
                //this.setState({remoteParticipants: [...this.state.call.remoteParticipants.values()]});
                this.remoteParticipants = [...this.call.remoteParticipants.values()];
            });
            e.removed.forEach((p: any) => {
                console.log('participantRemoved');
                //this.setState({remoteParticipants: [...this.state.call.remoteParticipants.values()]});
                this.remoteParticipants = [...this.call.remoteParticipants.values()];
            });
        });
    }
  }

  getIdentifierText = (identifier: any) => {
    //identifier = identifier.User;
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

  subscribeToRemoteParticipant (participant: any) {
    let id = this.getIdentifierText(participant.identifier);

    participant.on('participantStateChanged', () => {
        console.log('participantStateChanged', participant.identifier.communicationUserId, participant.state);
        //this.setState({remoteParticipants: [...this.state.call.remoteParticipants.values()]});
        this.remoteParticipants = [...this.call.remoteParticipants.values()];
    });

    const handleParticipantStream = (e: any) => {
        e.added.forEach((stream: { type: any; }) => {
            console.log('video stream added', id, stream, stream.type);
                //this.setState({streams: this.state.streams.concat({stream: stream, id: id})});
                this.streams = this.streams.concat({stream: stream, id: id});
        });
        e.removed.forEach((stream: { type: any; }) => {
            console.log('video stream removed', id, stream, stream.type)
        });
    }

    // Get participants video streams and screen sharing streams
    let participantStreams = participant.videoStreams.map((v: any) => { return {stream: v, id}});
    // Filter out the participant stream tuples that are not already in this.state.streams
    participantStreams = participantStreams.filter((streamTuple: { stream: any; id: any; }) => {return !this.streams.some((tuple: { stream: any; id: any; }) => { return tuple.stream === streamTuple.stream && tuple.id === streamTuple.id})});
    // Add participantStreams to the list of all remote participant streams
    //this.setState({streams: this.state.streams.concat(participantStreams)});
    this.streams = this.streams.concat(participantStreams);
    participant.on('videoStreamsUpdated', handleParticipantStream);
    participant.on('screenSharingStreamsUpdated', handleParticipantStream);
  }

  async watchForCallFinishConnecting() {
    return new Promise((resolve) => {
        if (this.call.state !== 'None' && this.call.state !== 'Connecting' && this.call.state !== 'Incoming') {
            resolve();
        } else {
            this.callFinishConnectingResolve = resolve;
        }
    }).then(() => {
        this.callFinishConnectingResolve = undefined;
    });
  }

  async handleMicOnOff() {
      try {
          if(!this.mutePromise) {
              if (this.micOn) {
                  this.mutePromise = this.call.mute().then(() => {
                      //this.setState({micOn: false});
                      this.micOn = false;
                      this.mutePromise = undefined;
                  });
              } else {
                  this.mutePromise = this.call.unmute().then(() => {
                      //this.setState({micOn: true});
                      this.micOn = true;
                      this.mutePromise = undefined;
                  });
              }
          }
      } catch(e) {
          this.mutePromise = undefined;
          console.error(e);
      }
  }

  async handleVideoOnOff () {
  try {
      if (this.call.state === 'None' || 
          this.call.state === 'Connecting' ||
          this.call.state === 'Incoming') {
              if(this.videoOn) {
                  //this.setState({ videoOn: false });
                  this.videoOn = false;
              } else {
                  //this.setState({ videoOn: true })
                  this.videoOn = true;
              }
              await this.watchForCallFinishConnecting();
              if(this.videoOn) {
                  const cameraDeviceInfo = this.deviceManager.getCameraList().find((cameraDeviceInfo: { id: any; }) => {
                      return cameraDeviceInfo.id === this.selectedCameraDeviceId
                  });
                  this.call.startVideo(new LocalVideoStream(cameraDeviceInfo)).catch((error: any) => {});
              } else {
                  this.call.stopVideo(this.call.localVideoStreams[0]).catch((error: any) => {});
              }
      } else {
          if(!this.videoPromise) {
              if(this.videoOn) {
                  if (this.call.localVideoStreams && this.call.localVideoStreams.length > 0) {
                      this.videoPromise = this.call.stopVideo(this.call.localVideoStreams[0]).then(() => {
                          //this.setState({videoOn: false});
                          this.videoOn = false;
                          this.videoPromise = undefined;
                      }).catch((error: any) => {
                          this.videoPromise = undefined;
                      });
                  }
              } else {
                  const cameraDeviceInfo = this.deviceManager.getCameraList().find((cameraDeviceInfo: { id: any; }) => {
                      return cameraDeviceInfo.id === this.selectedCameraDeviceId;
                  });
                  this.videoPromise = this.call.startVideo(new LocalVideoStream(cameraDeviceInfo)).then(() => {
                      //this.setState({videoOn: true});
                      this.videoOn = true;
                      this.videoPromise = undefined;
                  }).catch((error: any) => {
                      this.videoPromise = undefined;
                  });
              }
            }
          }
      } catch(e) {
          this.videoPromise = undefined;
          console.error(e);
      }
  }

  async declineCall() {
    this.call.hangUp({forEveryone: false}).catch((e: any) => console.error(e));
  }

  async handleAcceptCall() { 
    const cameraDevice = this.deviceManager.getCameraList()[0];
    if(!cameraDevice || cameraDevice.id === 'camera:') {
        //this.props.onShowCameraNotFoundWarning(true);
        this.onShowCameraNotFoundWarning = true;
    } else if (cameraDevice) {
        //this.setState({ selectedCameraDeviceId: cameraDevice.id });
        this.selectedCameraDeviceId = cameraDevice.id;
        //const localVideoStream = new LocalVideoStream(cameraDevice);
    }

    const speakerDevice = this.deviceManager.getSpeakerList()[0];
    if(!speakerDevice || speakerDevice.id === 'speaker:') {
        //this.props.onShowSpeakerNotFoundWarning(true);
        this.onShowSpeakerNotFoundWarning = true;
    } else if(speakerDevice) {
        //this.setState({selectedSpeakerDeviceId: speakerDevice.id});
        this.selectedSpeakerDeviceId = speakerDevice.id;
        this.deviceManager.setSpeaker(speakerDevice);
    }

    const microphoneDevice = this.deviceManager.getMicrophoneList()[0];
    if(!microphoneDevice || microphoneDevice.id === 'microphone:') {
        //this.props.onShowMicrophoneNotFoundWarning(true);
        this.onShowMicrophoneNotFoundWarning = true;
    } else {
        //this.setState({selectedMicrophoneDeviceId: microphoneDevice.id});
        this.selectedMicrophoneDeviceId = microphoneDevice.id;
        this.deviceManager.setMicrophone(microphoneDevice);
    }

    this.call.accept({
        videoOptions: this.videoOn && cameraDevice ? { localVideoStreams: [new LocalVideoStream(cameraDevice)] } : undefined
    }).catch((e: any) => console.error(e));
  }


  async handleHoldUnhold() {
      try {
          if(!this.holdPromise) {
              if (this.onHold) {
                  this.holdPromise = this.call.unhold().then(() => {
                      //this.setState({onHold: false});
                      this.onHold = false;
                      this.holdPromise = undefined;
                  });
              } else {
                  this.holdPromise = this.call.hold().then(() => {
                      //this.setState({onHold: true});
                      this.onHold = true;
                      this.holdPromise = undefined;
                  });
              }
          }
      } catch(e) {
          this.holdPromise = undefined;
          console.error(e);
      }
    }

    handleRemoveParticipant(e: { preventDefault: () => void; }, identifier: any) {
        e.preventDefault();
        this.call.removeParticipant(identifier).catch((e: any) => console.error(e))
    }

    async handleScreenSharingOnOff() {
        try {
            if (this.screenShareOn) {
                await this.call.stopScreenSharing()
            } else {
                await this.call.startScreenSharing();
            }
            //this.setState({screenShareOn: !this.state.screenShareOn});
            this.screenShareOn = !this.screenShareOn;
        } catch(e) {
            console.error(e);
        }
    }

    cameraDeviceSelectionChanged = (event: any, item: { key: any; }) => {
        const cameraDeviceInfo = this.deviceManager.getCameraList().find((cameraDeviceInfo: { id: any; }) => {
            return cameraDeviceInfo.id === item.key
        });
        const localVideoStream = this.call.localVideoStreams[0];
        localVideoStream.switchSource(cameraDeviceInfo);
        //this.setState({selectedCameraDeviceId: cameraDeviceInfo.id});
        this.selectedCameraDeviceId = cameraDeviceInfo.id;
    };

    speakerDeviceSelectionChanged = (event: any, item: { key: any; }) => {
        const speakerDeviceInfo = this.deviceManager.getSpeakerList()
        .find((speakerDeviceInfo: { id: any; }) => {
            return speakerDeviceInfo.id === item.key
        });
        this.deviceManager.setSpeaker(speakerDeviceInfo);
        //this.setState({selectedSpeakerDeviceId: speakerDeviceInfo.id});
        this.selectedSpeakerDeviceId = speakerDeviceInfo.id;
    };

    microphoneDeviceSelectionChanged = (event: any, item: { key: any; }) => {
        const microphoneDeviceInfo = this.deviceManager.getMicrophoneList()
          .find((microphoneDeviceInfo: { id: any; }) => {
              return microphoneDeviceInfo.id === item.key
          });
        this.deviceManager.setMicrophone(microphoneDeviceInfo);
        //this.setState({selectedMicrophoneDeviceId: microphoneDeviceInfo.id});
        this.selectedMicrophoneDeviceId = microphoneDeviceInfo.id;
    };

}
