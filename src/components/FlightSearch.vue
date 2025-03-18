<template>
  <div class="search-container">
    <h2>Search Flights</h2>
    <form @submit.prevent="searchFlights">
      <label>From:</label>
      <input v-model="departure" required />

      <label>To:</label>
      <input v-model="destination" required />

      <button type="submit">Search</button>
    </form>

    <div v-if="flights.length > 0">
      <h3>Available Flights</h3>
      <ul>
        <li v-for="flight in flights" :key="flight.id">
          <span>{{ flight.departure }} → {{ flight.destination }}</span> |
          <span>{{ formatDateTime(flight.departureTime) }}</span> |
          <span>Price: ${{ flight.price }}</span>
          <button @click="selectFlight(flight.id)">Select</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      departure: '',
      destination: '',
      flights: []
    };
  },
  methods: {
    async searchFlights() {
      try {
        const response = await axios.get(`http://localhost:8080/api/flights/search`, {
          params: { departure: this.departure, destination: this.destination }
        });
        this.flights = response.data;
      } catch (error) {
        console.error("Error fetching flights:", error);
      }
    },
    selectFlight(flightId) {
      this.$router.push({ path: `/seats/${flightId}` });
    },
    formatDateTime(dateTime) {
      return new Date(dateTime).toLocaleString();
    }
  }
};
</script>

<style scoped>
.search-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
button {
  margin-left: 10px;
}
</style>
