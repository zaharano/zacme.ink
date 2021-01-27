<script>
  import SparkleInstance from "./sparkleInstance.svelte";
  import setRandomInterval from "./setRandomInterval";

  const interval = setRandomInterval(
    () => console.log("Hello World!"),
    200,
    700
  );

  // // Clear when needed.
  // interval.clear();
</script>
