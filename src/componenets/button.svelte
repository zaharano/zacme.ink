<script>
  export let href = "http://www.beep.com";
  export let txt = "Let's do it!";
</script>

<a class="button" href={href}>{txt}<span></span></a>

<style>
  a.button {
    text-decoration: none;
    margin-top: 1rem;
    font-family: 'Vollkorn SC', serif;
    font-variant-caps: small-caps;
    -moz-font-feature-settings: "smcp";
    -webkit-font-feature-settings: "smcp";
    font-feature-settings: "smcp";
    font-weight: 600;
    background: #FFFFFF;
    border: var(--border);
    box-sizing: border-box;
    border-radius: 5px;
    font-size: 1.2rem;
    line-height: var(--btnHeight);
    letter-spacing: 2px;
    padding: .6rem 1.8rem;
    min-width: 20rem;
    display: flex;
    justify-content: space-between;
    color: var(--gray);
    box-shadow: 0 0 0 var(--acct);
    transition-property: transform, box-shadow;
    transition-duration: .4s;
    transition-timing-function: var(--timing);
  }

  /* a.button div {
    position: absolute;
    pointer-events:none;
    border-radius: 5px;
    border: 2px solid black;
    height: calc(100% - 50px);
    width: calc(100% - 50px);
  } */

  a.button:hover {
    transform: translate(3px,-3px);
    box-shadow: -3px 3px 0px var(--acct);
    cursor: pointer;
  }

  a.button span {
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg width='24' height='6' viewBox='0 0 24 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 3L19 0.113249V5.88675L24 3ZM0 3.5H19.5V2.5H0V3.5Z' fill='%23454545'/%3E%3C/svg%3E");
    background-position: right center;
    background-repeat: no-repeat;
    width: 24px;
    height: var(--btnHeight);
  }

  a.button:hover span {
    animation: boing 1500ms linear both;
  }

  /* anim for arrow when hover link button,
  Generated with Bounce.js. */
  @keyframes boing { 
    0% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
    1.9% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2.92, 0, 0, 1); }
    3.8% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7.539, 0, 0, 1); }
    5.71% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 11.219, 0, 0, 1); }
    7.51% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 12.437, 0, 0, 1); }
    9.51% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 11.221, 0, 0, 1); }
    11.51% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.636, 0, 0, 1); }
    13.51% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 6.396, 0, 0, 1); }
    15.52% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5.584, 0, 0, 1); }
    17.52% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 6.251, 0, 0, 1); }
    19.52% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7.66, 0, 0, 1); }
    21.52% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.877, 0, 0, 1); }
    23.52% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 9.315, 0, 0, 1); }
    27.53% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.182, 0, 0, 1); }
    31.53% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7.284, 0, 0, 1); }
    39.54% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.39, 0, 0, 1); }
    47.55% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7.788, 0, 0, 1); }
    55.56% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.116, 0, 0, 1); }
    63.56% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7.937, 0, 0, 1); }
    71.57% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.034, 0, 0, 1); }
    79.58% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7.981, 0, 0, 1); }
    87.59% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.01, 0, 0, 1); }
    95.6% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7.994, 0, 0, 1); }
    100% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8, 0, 0, 1); } 
  }
</style>