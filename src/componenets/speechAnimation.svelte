<script>
  export let msg = 'whut';
</script>


<div class="speech">
  <svg 
    class="bubble" 
    width="100%" 
    viewBox="0 0 312 351" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    
    <path 
      vector-effect="non-scaling-stroke"
      class="speech-outer"
      d="M107.5 282L30.4 274.7C13.4 273.1 0.5 259 0.5 241.8V33.5C0.5 15.3 15.3 0.5 33.4 0.5C35.2 0.5 37 0.6 38.8 0.9L283.8 41.2C299.8 43.8 311.4 57.5 311.4 73.8V265.1C311.4 274 307.9 282.3 301.7 288.5C295.5 294.7 287.2 298.1 278.5 298.1C277.5 298.1 276.4 298 275.3 297.9L166.8 287.6L143.1 349.3L107.5 282Z" 
      stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 4"
      stroke-dashoffset="14px"
      stroke-width="2"
    />
    <path
      vector-effect="non-scaling-stroke"
      class="speech-inner"
      d="M37.6 8.8C22.3 6.3 8.5 18.1 8.5 33.5V241.8C8.5 254.7 18.3 265.5 31.1 266.7L112.5 274.4L142 330L161.6 279L276.1 290C290.8 291.4 303.5 279.9 303.5 265.1V73.8C303.5 61.6 294.6 51.1 282.6 49.1L37.6 8.8Z" 
      fill="white" 
      stroke-width="3"
    />
    <text 
      x="50" 
      y="210" 
      class="speech-exclaim">
      {msg}
    </text>
  </svg>
</div>


<style>
  .speech {
    width: clamp(250px, 30vw, 600px);
    margin: auto;
  }
  .speech-exclaim {
    color: var(--gray);
    font-size: 150px;
    width: 100%;
    fill: var(--gray);
    font-family: Shackleton, serif;
  }
  .speech-inner {
    stroke: var(--gray);
  }
  .speech-outer {
    stroke: var(--acct);
    animation: stroke 0.2s linear infinite;
  }
  @keyframes stroke {
    to { 
      stroke-dashoffset: 0;
    }
  }
</style>