#LiveLab

LiveLab is a proposal for an open source, browser-based toolkit for networked performance. The virtual collaboration space uses a peer-to-peer mesh network to share video, audio, and data streams between individuals and venues. LiveLab is based on WebRTC, and thus can be used by anyone with a web browser. The [initial prototype](https://ojack.github.io/LiveLab/public/) also allows participants to route any data stream broadcast over OSC (such as Kinect skeleton or sensor data) to remote collaborators.

Currently being developed as part of [Interactivos?'16 Possible Worlds. Creative and Collaborative Uses of Digital Technologies at MediaLab-Prado](http://comunidad.medialab-prado.es/en/groups/livelab)
#####To run:
1. Clone git repository
2. cd into folder and run <code>npm install</code>
3. open a new terminal window and run `npm run start`
4. go to `https://localhost:8000` in browser
5. Get and send messages using OSC client/server implementation of your choice

#####To develop:
1. Clone git repository
2. cd into folder and run <code>npm install</code>
3. install <code>npm install -g watchify</code>
3. open a new terminal window and do `npm run start`
4. in another window do `npm run watch-js` (this is so the javascript code is automatically pushed & updated)
5. open a third and final window and do `gulp` (and this allows us to change the less/css without having to restart the node application to reflect the changes) 

####To Export with Electron
LiveLab requires the socket.io-client module, but you'll notice it's missing from the dependencies. There seems to be a bug in the ws module depended by socket.io-client that gives an 'invalid utf8 sequence' error when installed with node v6.2.2. Thankfully it works fine when installed with v4.4.5. To account for this a few extra steps are provided.

1. Clone git repository
2. use nvm to install both node v4.4.5 and v6.2.2 ([nvm on GitHub](https://github.com/creationix/nvm))
3. update npm for both node versions
4. use v6.2.2 to install <code>nvm use 6.2.2</code> <code>npm install</code>
5. use v4.4.5 to install and save socket.io-client <code>nvm use 4.4.5</code> <code>npm i socket.io-client --save</code>
6. use v6.2.2 to package app <code>nvm use 6.2.2</code> <code>npm run-script package</code>

To build apps for other systems review the [docs for electron-packager](https://www.npmjs.com/package/electron-packager)

###Developed by:
Jesse Ricke ([CultureHub](http://www.culturehub.org/))

Olivia Jack

#####MediaLab-Prado Collaborators:
Alexander Cobleigh ([@cblgh](https://www.twitter.com/cblgh))  
Pablo Clemente ([@paclema](https://www.twitter.com/paclema))
