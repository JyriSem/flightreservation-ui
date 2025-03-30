<!--
Sild milles renderdatakse komponenti.
-->
<template>
  <div>
    <FlightSearch/>
  </div>
</template>

<script>

//Komponendi importimine.
import FlightSearch from '../components/FlightSearch.vue';

//Komponendi konfiguratsiooni määratlemine JavaScript objektina / Vue kasutatab komponendi eksemplari loomieseks.
export default {
  components: {
    FlightSearch
  }
};
</script>
