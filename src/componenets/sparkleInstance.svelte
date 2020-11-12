<script>
  // set up prop size, color, style
</script>

<div class="wrapper">
  <svg>
    <!-- accepts props as attrs where appropriate -->
  </svg>
</div>

<style>
  svg {
    animation: spin 800ms linear forwards;
  }

  .wrapper {
    position: absolute;
    pointer-events: none;
    z-index: 2;
    animation: pop 1000ms ease-in-out forwards
  }

  @keyframes shine {
    0% {
      transform: scale(0) rotate(0deg);
    } 
    50% {
      transform: scale(1) rotate(90deg);
    }
    100% {
      transform: scale(0) rotate(180deg);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(180deg);
    }
  }

</style>