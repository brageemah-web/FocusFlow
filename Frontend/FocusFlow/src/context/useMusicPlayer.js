import { useContext } from "react";
import { MusicPlayerContext } from "./MusicPlayerContext";

export function useMusicPlayer() {
    return useContext(MusicPlayerContext);
}