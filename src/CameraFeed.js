import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import Webcam from 'react-webcam'

const CameraFeed = () => {
    const [cameraOpen, setCameraOpen] = useState(false)
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [faceResult, setFaceResult] = useState(null);
    const webcamRef = useRef(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const videoConstraints = {
        width: 640,
        height: 640,
        facingMode: "user"
    };

    useEffect(() => {
        const initializeFaceLandmarker = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: 'VIDEO',
                    numFaces: 1
                });
                setFaceLandmarker(landmarker);
            } catch (error) {
                console.error("Error initializing face landmarker:", error);
            }
        };

        initializeFaceLandmarker();
    }, []);

    const detectFaces = () => {
        if (faceLandmarker && webcamRef.current && webcamRef.current.video && isVideoReady) {
            const videoElement = webcamRef.current.video;
            if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
                requestAnimationFrame(detectFaces);
                return;
            }
            try {
                const result = faceLandmarker.detectForVideo(videoElement, performance.now());
                setFaceResult(result);
            } catch (error) {
                console.error("Error detecting faces:", error);
            }
        }
        if (cameraOpen) {
            requestAnimationFrame(detectFaces);
        }
    };

    useEffect(() => {
        if (faceLandmarker && cameraOpen && isVideoReady) {
            detectFaces();
        }
    }, [faceLandmarker, cameraOpen, isVideoReady]);

    const handleVideoReady = () => {
        setIsVideoReady(true);
    };

  
   const isFaceStraight = (result) => {
    if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
        console.log('Face Blendshapes:', result.faceBlendshapes);

        // Extract relevant blendshape categories
        const blendshapes = result.faceBlendshapes[0].categories;

        // Define thresholds based on empirical observations
        const neutralThreshold = 0.05; // Lower threshold for minimal expression
        const tiltedThreshold = 0.25;  // Upper threshold indicating possible tilt

        // Check specific blendshapes
        const eyeSquintLeft = blendshapes.find(b => b.categoryName === 'eyeSquintLeft');
        const eyeSquintRight = blendshapes.find(b => b.categoryName === 'eyeSquintRight');
        const browDownLeft = blendshapes.find(b => b.categoryName === 'browDownLeft');
        const browDownRight = blendshapes.find(b => b.categoryName === 'browDownRight');

        // Determine if face is likely straight
        const isStraight = (
            (eyeSquintLeft && eyeSquintLeft.score < tiltedThreshold) &&
            (eyeSquintRight && eyeSquintRight.score < tiltedThreshold) &&
            (browDownLeft && browDownLeft.score < neutralThreshold) &&
            (browDownRight && browDownRight.score < neutralThreshold)
        );

        console.log('Is Face Straight:', isStraight);
        return isStraight;
    } else {
        console.warn('No face blendshapes data available.');
    }
    return false;
};

    
    const cropToSquare = (imageSrc) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const size = Math.min(img.width, img.height);
                canvas.width = 640;
                canvas.height = 640;
                ctx?.drawImage(
                    img,
                    (img.width - size) / 2,
                    (img.height - size) / 2,
                    size,
                    size,
                    0,
                    0,
                    640,
                    640
                );
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imageSrc;
        });
    };

    const captureImage = useCallback(async () => {
        if (!faceResult || faceResult.faceLandmarks.length === 0) {
            alert("No face detected. Please ensure your face is visible in the camera.");
        } else if (faceResult.faceLandmarks.length > 1) {
            alert("Multiple faces detected. Only one face is allowed.");
        } else if (!isFaceStraight(faceResult)) {
            alert("Face is not straight. Please face the camera directly.");
        } else if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                const croppedImage = await cropToSquare(imageSrc);
                setCapturedImage(croppedImage);
            }
        }
    }, [faceResult, webcamRef]);

    const downloadImage = () => {
        if (capturedImage) {
            const link = document.createElement('a');
            link.href = capturedImage;
            link.download = 'captured_image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <h1>Face detection app</h1>
            <button onClick={() => setCameraOpen(!cameraOpen)}>{cameraOpen ? 'Close camera' : 'Open camera'}</button>
            {cameraOpen && (
                <>
                    <div style={{
                        width: "640px",
                        height: "640px",
                        backgroundColor: "black",
                        position: 'relative',
                        marginTop: '20px'
                    }}>
                        <Webcam
                            ref={webcamRef}
                            onLoadedMetadata={handleVideoReady}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                            videoConstraints={videoConstraints}
                            mirrored={true}
                            screenshotFormat="image/png"
                        />
                    </div>
                    <button onClick={captureImage} style={{ marginTop: '20px' }}>Capture Image</button>
                    <p>Faces detected: {faceResult?.faceLandmarks?.length || 0}</p>
                </>
            )}
            {capturedImage && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Captured Image:</h2>
                    <img src={capturedImage} alt="Captured" style={{ width: '640px', height: '640px' }} />
                    <button onClick={downloadImage} style={{ marginTop: '10px' }}>Download Image</button>
                </div>
            )}
        </div>
    )
}

export default CameraFeed