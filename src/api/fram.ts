import {HomePageSuggest} from "./types.ts";

export const getLatestSuggestion = () => {
    localStorage.getItem("token");
    return null as unknown as HomePageSuggest
}