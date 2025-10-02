'use client'
// import { Link } from "react-router-dom";
import '../../app/page.css';
// import '../index.css';
import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios'; // ← Add this at the top

const DemoSection = () => {

    const [recording, setRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Track backend processing
    const [audioSrc, setAudioSrc] = useState(null); // Store the audio file path
    const [playAudio, setPlayAudio] = useState(false); // Whether to play the audio
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null); // Reference for the audio player
    // const baseURL= 'http://localhost:8000'; // Adjust this to your backend URL
    const baseURL = 'https://shahzad216.pythonanywhere.com'; // Adjust this to your backend URL


    const handleStartRecording = async () => {}


    return (
        <section className="demo bg-[#131B25]" id="demo">
            <div className="container1">
                <h2 className="text-white">See Sales AICE In Action</h2>
                <div className="sandbox_header">
                    Watch how AICE handles a complete sales conversation from objection to close
                </div>
                <div className="demo-video sandbox">
                    <div className="bg-opacity-20 bg-[#000000] p-16 rounded-2xl  flex flex-col items-center justify-center text-center">

                        <video
                            className="w-full max-w-md"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/avatar_gif.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        <div className="mt-6">
                            <button
                                className={`btn1 btn1-primary ${recording ? 'bg-red-500' : ''}`}
                                // onClick={recording ? handleStopRecording : handleStartRecording}
                            >
                                {recording ? 'Stop Recording' : '🎤 Say Hi!'}
                            </button>
                        </div>

                        {/* {isProcessing && (
                            <div className="mt-6 text-white">
                                <span>Processing...</span>
                                <div className="spinner"></div>
                            </div>
                        )} */}

                        {audioSrc && (
                            <div className="mt-6">
                                <audio ref={audioRef} autoPlay muted >
                                    <source src={audioSrc} type="audio/mp3" />
                                    Your browser does not support the audio tag.
                                </audio>
                            </div>
                        )}

                    </div>
                </div>

                {/* <div className="sandbox_header">
                    Watch how AICE handles a complete sales conversation from objection to close
                </div>

                <div class="sandbox">
                    <video
                            className="w-full max-w-md"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/avatar_gif.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    <button class="speak-btn">🎙 Speak</button>
                </div> */}


                <div className="demo-stats mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="stat-card text-center p-8 bg-opacity-10 bg-[#162130] rounded-lg">
                        <h2 className="text-[#FFD700]">95%</h2>
                        <p>Conversation Completion Rate</p>
                    </div>
                    <div className="stat-card text-center p-8 bg-opacity-10 bg-[#162130] rounded-lg">
                        <h2 className="text-[#FFD700] text-4xl mb-2">&lt;1s</h2>
                        <p>Average Response Time</p>
                    </div>
                    <div className="stat-card text-center p-8 bg-opacity-10 bg-[#162130] rounded-lg">
                        <h2 className="text-[#FFD700] text-4xl mb-2">24/7</h2>
                        <p>Availability</p>
                    </div>
                    <div className="stat-card text-center p-8 bg-opacity-10 bg-[#162130] rounded-lg">
                        <h2 className="text-[#FFD700] text-4xl mb-2">∞</h2>
                        <p>Concurrent Conversations</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoSection;
