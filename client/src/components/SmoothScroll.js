import {useEffect} from "react";
import Lenis from "lenis";


const SmoothScroll = ()=>{

    useEffect(()=>{
        const lenis = new Lenis({
            duration:1.7,
            lerp:0.0001,
            SmoothScroll:true,
            touch:true,
        });
        function raf(time){
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    },[]);

}

export default SmoothScroll; 