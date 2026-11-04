import { MusicPlayerContext } from "./MusicPlayerContext";
import {useState, useRef, useEffect,} from "react";

import audio  from "../music/audios.js";


function MusicPlayerProvider({ children }) {

    // Playback state
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);

    // Audio references
    const audioRef = useRef(null);
    const isPlayingRef = useRef(false);

    // Currently selected track
    const currentTrack = audio[currentTrackIndex];

    // Play audio
    const play = async () => {
        if (!audioRef.current || !currentTrack) return;

        try {
            await audioRef.current.play();

            setIsPlaying(true);
            isPlayingRef.current = true;
        }
        catch (error) {
            console.error("Unable to play audio:", error);

            setIsPlaying(false);
            isPlayingRef.current = false;
        }
    };

    // Pause audio
    const pause = () => {
        if (!audioRef.current) return;

        audioRef.current.pause();

        setIsPlaying(false);
        isPlayingRef.current = false;
    };

    // Toggle play/pause
    const togglePlay = () => {
        if (isPlayingRef.current) {
            pause();
        }
        else {
            play();
        }
    };

    // Play next track
    const nextTrack = () => {
        if (audio.length === 0) return;

        setCurrentTrackIndex((prevIndex) => {
            return (prevIndex + 1) % audio.length;
        });
    };

    // Play previous track
    const previousTrack = () => {
        if (!audioRef.current || audio.length === 0) return;

        // Restart current track if more than 3 seconds have passed
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            return;
        }

        setCurrentTrackIndex((prevIndex) => {
            return (prevIndex - 1 + audio.length) % audio.length;
        });
    };

    // Seek to a specific time
    const seek = (time) => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    // Change volume
    const changeVolume = (newVolume) => {
        const volumeLevel = Math.max(0, Math.min(1, newVolume));

        if (audioRef.current) {
            audioRef.current.volume = volumeLevel;
        }

        setVolume(volumeLevel);
    };

    // Keep audio volume synchronized
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Handle track changes
    useEffect(() => {
        const audioElement = audioRef.current;

        if (!audioElement || !currentTrack) return;

        const wasPlaying = isPlayingRef.current;

        audioElement.pause();
        audioElement.currentTime = 0;

        setCurrentTime(0);
        setDuration(0);

        audioElement.src = currentTrack.url;
        audioElement.load();

        if (wasPlaying) {
            audioElement.play()
                .then(() => {
                    setIsPlaying(true);
                    isPlayingRef.current = true;
                })
                .catch((error) => {
                    console.error("Unable to play next track:", error);

                    setIsPlaying(false);
                    isPlayingRef.current = false;
                });
        }

    }, [currentTrack]);

    // Listen for audio events
    useEffect(() => {
        const audioElement = audioRef.current;

        if (!audioElement) return;

        // Update playback progress
        const updateTime = () => {
            setCurrentTime(audioElement.currentTime);
        };

        // Get track duration
        const updateDuration = () => {
            if (Number.isFinite(audioElement.duration)) {
                setDuration(audioElement.duration);
            }
        };

        // Automatically play the next track
        const handleEnded = () => {
            nextTrack();
        };

        // Synchronize playing state with audio
        const handlePlay = () => {
            setIsPlaying(true);
            isPlayingRef.current = true;
        };

        const handlePause = () => {
            setIsPlaying(false);
            isPlayingRef.current = false;
        };

        audioElement.addEventListener("timeupdate", updateTime);
        audioElement.addEventListener("loadedmetadata", updateDuration);
        audioElement.addEventListener("ended", handleEnded);
        audioElement.addEventListener("play", handlePlay);
        audioElement.addEventListener("pause", handlePause);

        return () => {
            audioElement.removeEventListener("timeupdate", updateTime);
            audioElement.removeEventListener("loadedmetadata", updateDuration);
            audioElement.removeEventListener("ended", handleEnded);
            audioElement.removeEventListener("play", handlePlay);
            audioElement.removeEventListener("pause", handlePause);
        };

    }, []);

    // Provider
    return (
        <MusicPlayerContext.Provider value={{
            audio,
            currentTrack,
            currentTrackIndex,
            setCurrentTrackIndex,
            isPlaying,
            currentTime,
            duration,
            volume,
            play,
            pause,
            togglePlay,
            nextTrack,
            previousTrack,
            seek,
            changeVolume
        }}>

            <audio ref={audioRef} />

            {children}

        </MusicPlayerContext.Provider>
    );
}


export { MusicPlayerProvider};
