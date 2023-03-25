# Video Conferencing and Collaborative Canvas App

This is an Express.js app that allows users to participate in video conferences and collaborate in a shared canvas. The app uses PeerJS for the video conferencing functionality and has a canvas for users to draw on and collaborate in real time.

## live app: https://collab.cloza.tech

## Installation
To install and run the app, follow these steps:

Clone the repository to your local machine: `git clone https://github.com/Iyusuf40/whiteBoard`
Navigate to the project directory: `cd app`
Install the dependencies: `npm install`
### Note: 
this app uses mongodb for persistence, In order to run the app locally do ensure you have mongodb
installed on your machine

Start the server: `./start_server.sh`
Open a web browser and navigate to http://localhost:3000

## Usage
Once the app is running, you can use it to participate in video conferences and collaborate in the canvas. Here are some tips for using the app:

* create an account
* click on go to canvas
* create canvas with a name of your choice
* to allow other collaborators on your canvas, click on the create room button and 
share the link displayed to your peers
* you can start media if you wish to have a video conference

The main frontend logic for the app is located in static/scripts/utils.js. This file contains the code for handling video conferencing and canvas functionality.

You can customize the app by modifying the HTML and CSS files in the static directory and the server-side code in the server.js file and controller directory.

## Contributing
If you'd like to contribute to the app, feel free to fork the repository and submit a pull request. We welcome contributions in the form of bug fixes, new features, and improvements to the codebase.

## License
This app is licensed under the MIT License. See the LICENSE file for more information.

## Credits
This app was created by [Yusuf Istaku](https://github.com/Iyusuf40) and [Valentine Maduagwu](https://github.com/Theocode12). Thanks to the developers of [PeerJS](https://peerjs.com/) for their excellent library and the developers of the other packages used to build the app.
