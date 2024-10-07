// import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin'
import BaseAuth from './BaseAuth';


class GoogleAuthProvider extends BaseAuth {
    constructor() {
        super()
        // this._config()
        // this._getCurrentUser();
    }
    // _config() {
    //     GoogleSignin.configure({
    //         webClientId: "618238958940-b5j4vjip0clv0hdjq8bc7cf1gaa08c0j.apps.googleusercontent.com",
    //         offlineAccess: false,
    //     });
    // }
    async _getCurrentUser() {
        try {
          const userInfo = await GoogleSignin.signInSilently();
        //   this.setState({ userInfo, error: null });
        } catch (error) {
          const errorMessage =
            error.code === statusCodes.SIGN_IN_REQUIRED ? 'Please sign in :)' : error.message;
        //   this.setState({
        //     error: new Error(errorMessage),
        //   });
        }
    }
    async getTokens() {
      let tokens = await GoogleSignin.getTokens()
      return tokens
    }
    async signIn() {
          let details = {
            grant_type: 'external',
            provider: 'google',
            client_id: 'cooltool_custom',
            client_secret: 'cooltool_secret',
            scope: 'api offline_access',
            external_token: null,
        }
        try {
          await GoogleSignin.hasPlayServices();
          const tokenInfo = await GoogleSignin.signIn();
          details.external_token = tokenInfo.accessToken

            let token = await this.getUserToken(details)
            this.userInfo = await this.getUserInfo(token)
            this.userInfo.code = await this.createOrGetProject(token)
            
            return this.userInfo
        } catch (error) {
            return Promise.reject(false)
        }
    }
    async signOut() {
        try {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        //   this.setState({ userInfo: null }); // Remember to remove the user from your app's state as well
          return Promise.resolve(true)
        } catch (error) {
          console.error(error);
          return Promise.resolve(false)
        }
    }
    
    async isSignedIn() {
        const isSignedIn = await GoogleSignin.isSignedIn();
        Promise.resolve(isSignedIn)
      }
}

export const googleAuthProvider = new GoogleAuthProvider