<template>
  <div class="search-container">
    <h2>Search Flights</h2>
    <form @submit.prevent="searchFlights">
      <label>From:</label>
      <select v-model="departure" @change="fetchDestinations">
        <option v-for="loc in departures" :key="loc" :value="loc">{{ loc }}</option>
      </select>

      <label>To:</label>
      <select v-model="destination" :disabled="!departure" @change="fetchAvailableDates">
        <option v-for="loc in destinations" :key="loc" :value="loc">{{ loc }}</option>
      </select>

      <label>Date:</label>
      <input
          type="date"
          v-model="date"
          :min="minDate"
          :max="maxDate"
          :disabled="!destination"
          @change="validateDate"
      />

      <button type="submit" :disabled="!date">Search</button>
    </form>

    <div v-if="flights.length > 0">
      <h3>Available Flights</h3>
      <ul>
        <li v-for="flight in flights" :key="flight.id">
          <span>{{ flight.departure }} → {{ flight.destination }}</span> |
          <span>{{ formatDateTime(flight.departureDate, flight.departureTime) }}</span> |
          <span>Price: ${{ flight.price }}</span>
          <button @click="selectFlight(flight.id)">Select</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      departures: [],
      destinations: [],
      availableDates: [],
      departure: "",
      destination: "",
      date: "",
      flights: []
    };
  },
  computed: {
    minDate() {
      return this.availableDates.length ? this.availableDates[0] : "";
    },
    maxDate() {
      return this.availableDates.length ? this.availableDates[this.availableDates.length - 1] : "";
    }
  },
  methods: {
    async fetchDepartures() {
      try {
        const response = await axios.get("http://localhost:8080/api/flights/departures");
        this.departures = response.data;
      } catch (error) {
        console.error("Error fetching departures:", error);
      }
    },
    async fetchDestinations() {
      if (!this.departure) return;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/destinations", {
          params: { departure: this.departure }
        });
        this.destinations = response.data;
        this.destination = "";
        this.date = "";
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    },
    async fetchAvailableDates() {
      if (!this.departure || !this.destination) return;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/dates", {
          params: { departure: this.departure, destination: this.destination }
        });
        this.availableDates = response.data;
        this.date = "";
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    },
    async searchFlights() {
      if (!this.date) return;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/search", {
          params: { departure: this.departure, destination: this.destination, date: this.date }
        });
        this.flights = response.data;
      } catch (error) {
        console.error("Error fetching flights:", error);
      }
    },
    selectFlight(flightId) {
      this.$router.push({ path: `/seats/${flightId}` });
    },
    formatDateTime(date, time) {
      return `${date} at ${time}`;
    },
    validateDate() {
      if (!this.availableDates.includes(this.date)) {
        this.date = "";
      }
    }
  },
  mounted() {
    this.fetchDepartures();
  }
};
</script>

<style scoped>
.search-container {
  max-width: 450px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}
button {
  margin-top: 10px;
}
</style>
