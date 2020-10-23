import { Component, Input, OnInit } from '@angular/core';
import { LocalVideoStream, Renderer } from '@azure/communication-calling';

@Component({
  selector: 'app-local-video-preview',
  templateUrl: './local-video-preview.component.html',
  styleUrls: ['./local-video-preview.component.css']
})
export class LocalVideoPreviewComponent implements OnInit {

  @Input()
  selectedCameraDeviceId: string;

  @Input()
  deviceManager: any;
  
  public cameraDeviceInfo: any;

  constructor() { 
    
  }

  async ngOnInit(): Promise<void> {
    this.cameraDeviceInfo = this.deviceManager.getCameraList().find((cameraDevice: { id: any; }) => {
      return cameraDevice.id === this.selectedCameraDeviceId;
    });

    try {
      
      const localVideoStream = new LocalVideoStream(this.cameraDeviceInfo);

      // You can use DeviceManager and Renderer to begin rendering streams from your local camera.
      // This stream won't be sent to other participants; it's a local preview feed. This is an asynchronous action.
      const renderer = new Renderer(localVideoStream);
      const view = await renderer.createView();
      document.getElementById("localVideoRenderer").appendChild(view.target);

    }catch(error){
      console.log("error");
    }
  }

  //enableLocalVideo = async () => {
    
  //}

}
