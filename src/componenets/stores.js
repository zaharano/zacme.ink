import { writable } from 'svelte/store';

function createMotionSwitch() {
  const { subscribe, update } = writable(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
  
  return {
    subscribe, 
    toggle: () => update(motion => !motion),
  };
}

export const motionSwitch = createMotionSwitch();