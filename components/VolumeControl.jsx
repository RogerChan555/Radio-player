import { useContext } from "react";
import styles from "./VolumeControl.module.css";
import { FaVolumeHigh, FaVolumeLow, FaVolumeXmark } from "react-icons/fa6";
import { PlayerContext } from "@/context/player";

const VolumeControl = () => {
  const { playerVolume: volume, changeVolume: setPlayerVolume } =
    useContext(PlayerContext);
  return (
    <section className={styles.volumeControlContainer}>
      <button
        title="Mute/Unmute"
        className={styles.muteButton}
        type="button"
        onClick={() => {
          if (volume === 0) {
            setPlayerVolume(0.5);
          } else {
            setPlayerVolume(0);
          }
        }}
      >
        {volume === 0 ? (
          <FaVolumeXmark className="h-6 w-6" />
        ) : volume < 0.5 ? (
          <FaVolumeLow className="h-6 w-6" />
        ) : (
          <FaVolumeHigh className="h-6 w-6" />
        )}
      </button>
      <input
        title="Volume control"
        type="range"
        className={styles.volumeControl}
        min={0}
        max={1}
        step={0.02}
        value={volume}
        onChange={(event) => {
          setPlayerVolume(event.target.valueAsNumber);
        }}
      />
    </section>
  );
};

export default VolumeControl;
