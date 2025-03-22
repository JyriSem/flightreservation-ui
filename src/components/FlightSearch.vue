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
      <Datepicker
          v-model="date"
          :min-date="minDate"
          :max-date="maxDate"
          :enable-time-picker="false"
          :disabled-dates="disabledDates"
          placeholder="Select a date"
      />

      <label>Tickets:</label>
      <select v-model="ticketCount">
        <option v-for="n in maxTickets" :key="n" :value="n">{{ n }}</option>
      </select>

      <button type="submit" :disabled="!date">Search</button>
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
import axios from "axios";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
  components: {
    Datepicker,
  },
  data() {
    return {
      departures: [],
      destinations: [],
      availableDates: [],
      departure: "",
      destination: "",
      date: null,
      ticketCount: 1,
      maxTickets: 5,
      flights: [],
    };
  },
  computed: {
    minDate() {
      return this.availableDates.length ? new Date(this.availableDates[0]) : null;
    },
    maxDate() {
      return this.availableDates.length ? new Date(this.availableDates[this.availableDates.length - 1]) : null;
    },
    disabledDates() {
      const availableSet = new Set(this.availableDates.map(d => new Date(d).toISOString().split("T")[0]));
      const allDates = [...Array(365)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date.toISOString().split("T")[0];
      });
      return allDates.filter(date => !availableSet.has(date));
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
          params: {departure: this.departure},
        });
        this.destinations = response.data;
        this.destination = "";
        this.date = null;
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    },
    async fetchAvailableDates() {
      if (!this.departure || !this.destination) return;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/dates", {
          params: {departure: this.departure, destination: this.destination},
        });
        this.availableDates = response.data;
        this.date = null;
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    },
    async searchFlights() {
      try {
        const response = await axios.get("http://localhost:8080/api/flights/search", {
          params: {
            departure: this.departure,
            destination: this.destination,
            date: this.date.toISOString().split("T")[0]
          },
        });
        this.flights = response.data;
      } catch (error) {
        console.error("Error fetching flights:", error);
      }
    },
    selectFlight(flightId) {
      this.$router.push({path: `/seats/${flightId}`, query: {ticketCount: this.ticketCount}});
    },
    formatDateTime(dateTime) {
      return new Date(dateTime).toLocaleString();
    }
  },
  mounted() {
    this.fetchDepartures();
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
