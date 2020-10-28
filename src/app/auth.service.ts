import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  async provisionNewUser():  Promise<string> {
    //console.log('userIdentity: ', userIdentity);
    let response = await fetch('https://acs-token-generator.azurewebsites.net/api/issue-token', {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://azure-comm-service-demo.azurewebsites.net'
        }
    })
    .catch((error) => {
       console.log("Error fetching token..", error);
     })

    if (response)
    {
        return await response.json();
    }
    return null;
    //throw new Error('Invalid token response');
  }
}
