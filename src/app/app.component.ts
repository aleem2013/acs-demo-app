import { Component, OnInit } from '@angular/core';
import { CallClient, LocalVideoStream } from '@azure/communication-calling';
import { AzureCommunicationUserCredential, isCallingApplication, isCommunicationUser, isPhoneNumber } from '@azure/communication-common';
import { createClientLogger, setLogLevel } from '@azure/logger';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public state: any;
  public response: {};
  public callClient: any;
  public callAgent: any;
  public destinationGroup: string;

  constructor(private authService: AuthService) {
      this.callClient = null;
      this.callAgent = null;
      this.destinationGroup = "29228d3e-040e-4656-a70e-890ab4e173e5";
      this.state = {
        showSpinner: false,
        call: undefined,
        id: undefined,
        token: "",
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

  ngAfterViewInit(): void {
    console.log("calling provisionNewUser");
    this.provisionNewUser();
  }

  
  provisionNewUser(): void {
      this.state.showSpinner = true;
      this.authService.provisionNewUser()
        .then(async (response) => {
          this.state.id = this.getIdentifierText(response);
          this.state.token = this.getToken(response);
          console.log("calling handleLogin");
          await this.handleLogIn({ id: this.state.id, token: this.state.token });
          
          this.state.showSpinner = false;
          this.state.loggedIn = true;
          console.log("calling joinMeeting");
          //Joining the meeting
          this.joinMeeting();
        });
  }
  
  joinMeeting() {
      try {
          this.callAgent.join({ groupId: this.destinationGroup}, this.getCallOptions());
      }catch(error: any){
        console.log("Failed to join a call", error);
      }
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
        this.state.selectedSpeakerDeviceId = speakerDevice.id;
        this.state.deviceManager.setSpeaker(speakerDevice);
    }

    const microphoneDevice = this.state.deviceManager.getMicrophoneList()[0];
    if(!microphoneDevice || microphoneDevice.id === 'microphone:') {
        this.setShowMicrophoneNotFoundWarning(true);
    } else {
        this.state.selectedMicrophoneDeviceId = microphoneDevice.id;
        this.state.deviceManager.setMicrophone(microphoneDevice);
    }

    return callOptions;
  }

  setShowMicrophoneNotFoundWarning(show: boolean) {
      this.state.showMicrophoneNotFoundWarning = show;
  }
}
