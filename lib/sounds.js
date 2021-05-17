import fs from 'fs';
import path from 'path';

const soundsDirectory = path.join(process.cwd(), 'public/sounds');

export function getAllSounds() {
    const filenames = fs.readdirSync(soundsDirectory);
    return filenames.map((filename) => {
        // Remove extension from file name to get clean name
        const id = filename.replace(/\.[a-zA-Z0-9]+$/, '');
        // Combine the data with the id
        return {
            id,
            filename: `/sounds/${filename}`
        };
    });
}