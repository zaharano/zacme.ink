<script>
  export let cx;
  export let cy;
  export let id;
  export let key;
  export let classes;
  export let active = false;
</script>

<circle 
  class:active
  class={classes}
  {id} 
  vector-effect="non-scaling-stroke" 
  {cx} {cy} r="207.5" 
  stroke-linecap="round" 
  stroke-linejoin="round" 
  stroke-dasharray="10 10"
  stroke-dashoffset="20px" 
  stroke-width="2"
  data-key={key}
/>