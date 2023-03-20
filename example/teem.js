"use strict";

const createApplication = require(".");
const { AuthorizationCode } = require("..");

createApplication(({ app, callbackUrl }) => {
  const secret =  process.env.CLIENT_SECRET;
  //let countMap = new Map();

  const client = new AuthorizationCode({
    client: {
      id: process.env.CLIENT_ID,
      secret,
    },
    options: {
      authorizationMethod: 'body',
    },
    auth: {
      authorizeHost: "https://app.teem.com",
      authorizePath: "/oauth/authorize",
      tokenHost: "https://app.teem.com",
      tokenPath: "/oauth/token/?",
    },
  });

  // Authorization uri definition
  const authorizationUri = client.authorizeURL({
    redirect_uri: callbackUrl,
    scope: ["reservations"]
  });

  // Initial page redirecting to Teem
  app.get("/oauth/teem", (req, res) => {
    console.log(authorizationUri);
    res.redirect(authorizationUri);
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get("/oauth/callback", async (req, res) => {
    const { code } = req.query;
    const options = {
      code,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code"
    };

    try {
      /*let count = 0;
      if (countMap.has(code))
        count = countMap.get(code);

      countMap.set(code, ++count);

      console.log("The attempt no. ", count);*/

      console.log("The auth code received: ", code);
      console.log("options: ", options);

      const accessToken = await client.getToken(options);

      console.log("The resulting token: ", accessToken.token);

      return res.status(200).json(accessToken.token);
    } catch (error) {
      console.error("Access Token Error", error.message);
      return res.status(500).json("Authentication failed");
    }
  });

  app.get("/", (req, res) => {
    res.send('Hello<br><a href="/oauth/teem">Log in with Teem</a>');
  });
});
