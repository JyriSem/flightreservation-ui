<script>

//Komponendi konfiguratsiooni määratlemine JavaScript objektina / Vue kasutatab komponendi eksemplari loomieseks.
//Komponendile nime määramine.
//Alamkomponentide registreerimine.
export default {
  name: 'App',
  components: {}
};
</script>

<!--
"<div id="app">" vastab "main.js" kinnituspunktile
"<router-view/>" Vue Router-i spetsiaalne komponent, mis renderdab ruuter konfiguratsiooni põhjal ehk vastavalt marsruudile.
-->
<template>
  <div id="app">
    <router-view/>
  </div>
</template>
