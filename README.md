# Face Detection App

This is a React-based face detection application that uses the `@mediapipe/tasks-vision` library to detect faces from a webcam feed. The application captures an image from the webcam, checks if the face is straight, and allows the user to download the captured image.

## Features

- Detects faces in real-time using the webcam.
- Captures a square image of the detected face.
- Ensures that the captured face is straight and centered.
- Allows downloading the captured image.

## Installation

To run this application, follow these steps:

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/face-detection-app.git
    cd face-detection-app
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Start the development server:

    ```sh
    npm start
    ```

## Usage

1. Open the application in your browser. You should see a button to open the camera.
2. Click the "Open camera" button to start the webcam feed.
3. Ensure your face is centered and straight in the camera view.
4. Click the "Capture Image" button to capture an image of your face.
5. If the captured face is straight, the image will be displayed below the webcam feed.
6. Click the "Download Image" button to download the captured image.

## Code Explanation

### State Management

- `cameraOpen`: A boolean state to toggle the camera on and off.
- `faceLandmarker`: Stores the initialized FaceLandmarker object.
- `faceResult`: Stores the result of the face detection.
- `isVideoReady`: A boolean state to check if the video feed is ready.
- `capturedImage`: Stores the captured image.

### Components

- `Webcam`: React component for accessing the webcam feed.
- `useRef`: A hook to reference the webcam component.
- `useEffect`: A hook to initialize the FaceLandmarker and handle side effects.

### Functions

- `initializeFaceLandmarker`: Asynchronously initializes the FaceLandmarker.
- `detectFaces`: Detects faces in the webcam feed using the FaceLandmarker.
- `handleVideoReady`: Sets the video ready state when the webcam feed is ready.
- `isFaceStraight`: Checks if the detected face is straight based on blendshapes.
- `cropToSquare`: Crops the captured image to a square.
- `captureImage`: Captures an image from the webcam, checks if the face is straight, and stores the cropped image.
- `downloadImage`: Downloads the captured image.

### JSX Structure

- A button to toggle the camera.
- The webcam feed container.
- Buttons to capture and download the image.
- Displays the number of detected faces.
- Displays the captured image if available.

## Dependencies

- `react`: JavaScript library for building user interfaces.
- `@mediapipe/tasks-vision`: Mediapipe library for vision tasks.
- `react-webcam`: React component for accessing the webcam.

## License

This project is licensed under the MIT License.
