import {clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {SHA256 as sha256} from "crypto-js";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const hashPassword = (string) => {
    return sha256(string).toString();
};

export function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

export function minifyScript(script) {
    return script
        .replace(/\s+/g, " ") // Replace multiple whitespace characters with a single space
        .replace(/>\s+</g, "><") // Remove spaces between HTML tags
        .replace(/;\s+/g, ";") // Remove spaces after semicolons
        .trim(); // Trim leading and trailing whitespace
}

export function getTrack(trackList, streamTitle) {
    const [artistName = "", trackName = streamTitle] = streamTitle.split(" - ");
    if (trackList.length === 0) {
        return null;
    }

    if (artistName) {
        const result = trackList.find(
          track =>
            track.artistName.toLowerCase() === artistName.toLowerCase() &&
            track.trackName.toLowerCase().includes(trackName.toLowerCase())
        );
        if (result) {
            return result;
        }
        return null;
    }
    return trackList[0];
}

export function processSongInfo(input) {
    let result = input.trim();

    // 1. Remove year and parentheses around it
    result = result.replace(/\(\d{4}\)/g, "").trim();

    // 2. Process input that starts with a number and then a dash
    if (/^\d+\.\s?-\s?\S+-\S+/.test(result)) {
        result = result.replace(
            /^(\d+\.)\s?-?\s?(\S+-\S+)-(.+)$/,
            (match, num, artist, track) => {
                const artistName = artist.replace(/-/g, " ");
                const trackName = track.replace(/-/g, " ");
                return `${artistName} - ${trackName}`;
            }
        );
    }

    // 3. Replace '/' with a space
    result = result.replace(/\s?\/\s?/g, " ");

    result = result.replace(/\s?&\s?/g, " ");
    // 4. If there are two hyphens, convert the first hyphen to a space
    if (/ - .+ - /.test(result)) {
        result = result.replace(
            /^(.+?) - (.+?) - (.+)$/,
            (match, artist1, artist2, track) => {
                return `${artist1} ${artist2} - ${track}`;
            }
        );
    }

    return result.trim();
}

export function formatDateToMySQL(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based in JS
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
