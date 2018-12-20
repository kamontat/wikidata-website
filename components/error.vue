
<template>
  <div class="root">
    <div class="center-container">
      <div class="child-center-container">
        <h1 class="title">
          {{ error }}
        </h1>
        <p>{{ reason }}</p>
        <div style="margin: 10px;">
          <input 
            class="input" 
            placeholder="please enter your query message" 
            v-model="query">
          <div 
            class="buttons is-centered" 
            style="margin-top: 8px">
            <a 
              href="/table"
              class="button is-info">to Table page</a>
            <a
              :href="'?query='+query"
              class="button is-success">Query</a>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      query: ''
    }
  }
}
</script>


<style>
.root {
  height: 100vh !important;
  width: 100vw !important;
}

.center-container {
  display: flex;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  text-align: center;
  border-style: solid;
  border-width: 13px;
}

.child-center-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  border-style: dashed;
  border-width: 2px;
  padding: 12px;
  min-height: 30% !important;
  min-width: 40% !important;
}
</style>
