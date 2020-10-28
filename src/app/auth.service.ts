import { Injectable } from '@angular/core';
import { CommunicationIdentityClient } from '@azure/communication-administration';

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

  provisionNewUserFromLocal = async ()  => {
    const connectionString = "endpoint=https://comm-resource.communication.azure.com/;accesskey=oyF3/r0Q/K3YFlqlEn5S1Ls+EXCX8kzVNSfj5DxHgxu1lKstwlPeQXZEWvFnN2GFKbIaOA1wXp/ySII7wljwGg==";

    const tokenClient = new CommunicationIdentityClient(connectionString);

    const user = await tokenClient.createUser();

    const userToken = await tokenClient.issueToken(user, ["voip"]);

    return {
        "User" : userToken.user,
        "Token": userToken.token,
        "ExpiresOn": userToken.expiresOn
    }

    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: response
    // };
   // return response.json();
  }
}
