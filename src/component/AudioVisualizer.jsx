import { computeHeadingLevel } from "@testing-library/react";
import React, { useRef, useState, useEffect } from "react";

const AudioVisualizer = () => {
  const [loading, setLoading] = useState(false);
  const audioContextRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const analyzerRef = useRef(null);

  //function thats create random  color 
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const [currentColor, setCurrentColor] = useState(getRandomColor());

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyzerRef.current = audioContextRef.current.createAnalyser();
    const canvas = canvasRef.current;
    // Set the initial dimensions of the canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.disconnect();
      }
    };
  }, []);

  const setupAudio = () => {
  // قسمت پایین را تمام چت درست کرده است باید دوباره نگاه کنم بهش کدش را کامل متوجه نشدم 
    try {
      if (audioRef.current && audioContextRef.current && analyzerRef.current) {
        // Check if the audio source is already connected
        if (audioRef.current.srcObject) {
          // If it is, stop the current source and create a new one
          audioRef.current.srcObject.getTracks().forEach((track) => track.stop());
          audioRef.current.srcObject = null;
        }
  
        const audioSource = audioContextRef.current.createMediaElementSource(
          audioRef.current
        );
  
        // Connect the new source
        audioSource.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
        analyzerRef.current.fftSize = 16384;
  
        const bufferLength = analyzerRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
  
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        // Update canvas dimensions when setting up audio
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const barWidth = canvas.width / bufferLength;
  
        let x = 0;

      function animate() {
        //بعد از اتمام اهنگ صفحه  رفرش میشود 
        audioRef.current.onended = () => {
          // Refresh the page when audio playback ends
          window.location.reload();
        };

        //بعد از هر بار که این ستون ها بالا می ایند صفرشون میکنه
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyzerRef.current.getByteFrequencyData(dataArray);
        visulizer(bufferLength, x, barWidth, dataArray, ctx);
        requestAnimationFrame(animate);
      }

      audioContextRef.current.resume().then(() => {
        // Animation loop
        animate();
      });
    }
  } catch (error) {
    // Log the error if needed
    console.error("Error in setupAudio:", error);
    // You can choose to handle the error or simply ignore it
  }
};

  const visulizer = (bufferLength, x, barWidth, dataArray, ctx) => {
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      ctx.save();
      // موفیت مکانی رو بهمون نشون میدهد که
      ctx.translate(canvasRef.current.width / 2, canvasRef.current.height / 2);
      ctx.rotate(i + (Math.PI * 2) / bufferLength);

      ctx.fillStyle = currentColor;
      ctx.fillRect(300, 200, barWidth, barHeight);

      //gapHeight is size of wihte circle in middle of visulizer
      // gapheith رو وقتی عوص میکنیم میتونه اندازه ای رو که بار هامون بالا پایین میشن رو تغییر بده
      const gapHeight = 10;
      ctx.fillStyle = "white";
      //barHeight - gapHeight it's create top of the bar that we have white things
      ctx.fillRect(0, barHeight - gapHeight, barWidth, gapHeight);
      x += barWidth;
      ctx.restore();
    }
  };

  const handleContainerClick = () => {
    const audio1 = audioRef.current;
    audio1
      .play()
      .then(() => {
        setupAudio();
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
      });
  };


    
    const handleFileChange = (e) => {
      const files = e.target.files;
      const audio1 = audioRef.current;
  
      // Pause the current audio if playing
      if (!audio1.paused) {
        audio1.pause();
      }
  
      // Disconnect the previous source
      if (analyzerRef.current && analyzerRef.current.mediaElement) {
        analyzerRef.current.mediaElement.disconnect();
      }
  
      // Set loading state to true immediately
      setLoading(true);
  
      const audioURL = URL.createObjectURL(files[0]);
      audio1.src = audioURL;
      console.log(audio1.src);
      console.log(audioRef.current.src);
      audio1.load();
  
      // Play the audio and then set up the visualization
      audio1.play().then(() => {
        // Refresh the page and reset loading state after the audio finishes playing
        audio1.onended = () => {
          window.location.reload();
          setLoading(false);
        };
  
        // Set up audio after starting to play
        setupAudio();
      });
  
    
  };

  return (
    <div>
      {loading && <div>Loading...</div>}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "black",
        }}
      >
        {/* Your container content */}
      </div>
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{
          position: "absolute",
          top: "150px",
          color: "white",
          zIndex: 1,
        }}
      />
      <audio
        id="audio1"
        ref={audioRef}
        style={{
          width: "50%",
          margin: "50px auto",
          display: "block",
        }}
      ></audio>
      <canvas
        id="canvas1"
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      ></canvas>
    </div>
  );
};

export default AudioVisualizer;
