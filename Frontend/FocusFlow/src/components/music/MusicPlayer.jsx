
import { useMusicPlayer } from "../../context/useMusicPlayer";
import "../../styles/components/MusicPlayer.css";

function formatTime(time) {
    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function MusicPlayer() {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        nextTrack,
        previousTrack,
        seek,
        changeVolume
    } = useMusicPlayer();

    if (!currentTrack) {
        return (
            <div className="music-player">
                <p>No tracks available.</p>
            </div>
        );
    }

    return (
        <div className="music-player">
            <div className="music-player-header">
                <div>
                    <h3>Music Player</h3>
                    <p>Listen while you focus</p>
                </div>
            </div>

            <div className="music-track-info">
                <h4>{currentTrack.title}</h4>
                <span>{isPlaying ? "Now playing" : "Paused"}</span>
            </div>

            <div className="music-progress">
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={(e) => seek(Number(e.target.value))}
                    disabled={!duration}
                    aria-label="Track progress"
                />

                <div className="music-time">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="music-controls">
                <button
                    type="button"
                    onClick={previousTrack}
                    aria-label="Previous track"
                >
                    |◀
                </button>

                <button
                    type="button"
                    className="music-play-button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? "II" : "▶"}
                </button>

                <button
                    type="button"
                    onClick={nextTrack}
                    aria-label="Next track"
                >
                    ▶|
                </button>
            </div>

            <div className="music-volume">
                <label htmlFor="music-volume">Volume</label>

                <input
                    id="music-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                />
            </div>
        </div>
    );
}

export default MusicPlayer;
