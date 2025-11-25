
let loggedIn = true;

export const authService = {
  isAuthenticated(): boolean {
    return loggedIn;
  },

  async signIn(username: string, password: string): Promise<boolean> {

    console.log("signIn fake:", username, password);
    loggedIn = true;
    return true;
  },

  async signOut(): Promise<void> {

    console.log("signOut fake");
    loggedIn = false;
  },
};
