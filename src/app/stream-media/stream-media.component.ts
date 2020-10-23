import { Component, Input, OnInit } from '@angular/core';
import { Renderer, RendererView } from '@azure/communication-calling';

@Component({
  selector: 'app-stream-media',
  templateUrl: './stream-media.component.html',
  styleUrls: ['./stream-media.component.css']
})
export class StreamMediaComponent implements OnInit {

  @Input()
  key: any;

  @Input()
  stream: any;

  @Input()
  id: any;
  
  public state: { isAvailable: boolean; };

  constructor() { 
    this.state = {
        isAvailable: this.stream.isAvailable
    };
  }
  ngOnInit(): void {
    
  }

  //async ngOnInit(): Promise<void> {
    async ngAfterContentInit(): Promise<void> {

        console.log("Streaming Media");
        let renderer = new Renderer(this.stream);
        let view: RendererView;
        let videoContainer: any;

        const renderStream = async () => {
            if(!view) {
                view = await renderer.createView();
            }
            videoContainer = document.getElementById(`${this.id}-${this.stream.type}-${this.stream.id}`);
            videoContainer.hidden = false;
            if(!videoContainer.hasChildNodes()) { videoContainer.appendChild(view.target); }
        }

        this.stream.on('availabilityChanged', async () => {
            console.log(`stream=${this.stream.type}, availabilityChanged=${this.stream.isAvailable}`);
            if (this.stream.isAvailable) {
                //this.setState({ isAvailable: true });
                this.state.isAvailable = true;
                await renderStream();
            } else {
                if(videoContainer) { videoContainer.hidden = true; }
                //this.setState({ isAvailable: false });
                this.state.isAvailable = false;
            }
        });

        if (this.stream.isAvailable) {
            //this.setState({ isAvailable: true });
            this.state.isAvailable = true;
            await renderStream();
        }
  }

}
