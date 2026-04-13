import {defineStore} from "pinia";
import {ref} from "vue";

export const useDashBoard =  defineStore("DashBoardStore", ()=>{
    const selectedPlots = ref<string|null>(null);

    const setSelectedPlots = (val:string|null):void => {
        selectedPlots.value = val;
    }

    return { selectedPlots,setSelectedPlots };
})