import { IVideo } from '../video/video.interface';

export function searchValueInTitleDescTags(searchFilter: string, videos: IVideo[]) {
    let numOfVideos: number = 0;

    for (const video of videos) {
        if (video.title.includes(searchFilter) || video.description.includes(searchFilter) || hasRegexInArray(searchFilter, video.tags)) {
            numOfVideos++;
        }
    }

    return numOfVideos;
}

function hasRegexInArray(searchFilter: string, stringsArr?: string[]) {
    if (!stringsArr) return false;

    for (const str of stringsArr) {
        if (str.includes(searchFilter)) return true;
    }

    return false;
}
