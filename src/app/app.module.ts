import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { faUserCircle } from '@fortawesome/free-regular-svg-icons';
import { FormsModule } from '@angular/forms';
//import { CallClient, LocalVideoStream } from '@azure/communication-calling';
//import { AzureCommunicationUserCredential } from '@azure/communication-common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MakeCallComponent } from './make-call/make-call.component';
import { LocalVideoPreviewComponent } from './local-video-preview/local-video-preview.component';
import { StreamMediaComponent } from './stream-media/stream-media.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    MakeCallComponent,
    LocalVideoPreviewComponent,
    StreamMediaComponent
  ],
  imports: [
    BrowserModule,
    //CallClient,
    //LocalVideoStream,
    //AzureCommunicationUserCredential,
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule,
    FormsModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    // Register the FontAwesome icons used by the app
    library.addIcons(faExternalLinkAlt, faUserCircle);
  }
 }
