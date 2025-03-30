<template>
  <div class="search-container">
    <h2>Find Your Flight</h2>

    <div class="search-form">
      <div class="form-group">
        <label>From</label>
        <select v-model="departure" @change="fetchDestinations" :disabled="loading">
          <option value="" disabled>Select departure</option>
          <option v-for="loc in departures" :key="loc" :value="loc">{{ loc }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>To</label>
        <select v-model="destination" :disabled="!departure || loading" @change="fetchAvailableDates">
          <option value="" disabled>Select destination</option>
          <option v-for="loc in destinations" :key="loc" :value="loc">{{ loc }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Tickets</label>
        <select v-model="ticketCount" :disabled="loading">
          <option v-for="n in maxTickets" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <div class="calendar-group">
        <h3>Select Date</h3>
        <Datepicker
            v-model="date"
            :min-date="minDate"
            :max-date="maxDate"
            :enable-time-picker="false"
            :disabled-dates="disabledDates"
            inline
            auto-apply
            placeholder="Pick a date"
            :disabled="loading"
        />
      </div>

      <button @click="searchFlights" :disabled="!canSearch || loading">
        {{ loading ? 'Searching...' : 'Search Flights' }}
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="flights.length > 0" class="results">
      <h3>Available Flights</h3>
      <div class="flight-list">
        <div v-for="flight in flights" :key="flight.id" class="flight-card">
          <div class="flight-info">
            <span class="route">{{ flight.departure }} → {{ flight.destination }}</span>
            <span class="time">{{ formatDateTime(flight) }}</span>
            <span class="price">From ${{ (Number(flight.price) / 132).toFixed(2) }}</span>
          </div>
          <button @click="selectFlight(flight.id)" :disabled="loading">Select</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
  components: { Datepicker },
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
      loading: false,
      error: null,
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
    },
    canSearch() {
      return this.departure && this.destination && this.date;
    },
  },
  methods: {
    async fetchDepartures() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/departures");
        this.departures = response.data;
      } catch (error) {
        this.error = "Failed to load departures. Please try again.";
        console.error("Error fetching departures:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchDestinations() {
      if (!this.departure) return;
      this.loading = true;
      this.error = null;
      this.destinations = [];
      this.destination = "";
      this.date = null;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/destinations", {
          params: { departure: this.departure },
        });
        this.destinations = response.data;
      } catch (error) {
        this.error = "Failed to load destinations. Please try again.";
        console.error("Error fetching destinations:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchAvailableDates() {
      if (!this.departure || !this.destination) return;
      this.loading = true;
      this.error = null;
      this.date = null;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/dates", {
          params: { departure: this.departure, destination: this.destination },
        });
        this.availableDates = response.data;
      } catch (error) {
        this.error = "Failed to load available dates. Please try again.";
        console.error("Error fetching dates:", error);
      } finally {
        this.loading = false;
      }
    },
    async searchFlights() {
      if (!this.canSearch) return;
      this.loading = true;
      this.error = null;
      this.flights = [];
      try {
        const response = await axios.get("http://localhost:8080/api/flights/search", {
          params: {
            departure: this.departure,
            destination: this.destination,
            date: this.date.toISOString().split("T")[0],
          },
        });
        this.flights = response.data;
      } catch (error) {
        this.error = "No flights found. Try different options.";
        console.error("Error fetching flights:", error);
      } finally {
        this.loading = false;
      }
    },
    selectFlight(flightId) {
      this.$router.push({ path: `/seats/${flightId}`, query: { ticketCount: this.ticketCount } });
    },
    formatDateTime(flight) {
      const dateTimeString = `${flight.departureDate}T${flight.departureTime}`;
      return new Date(dateTimeString).toLocaleString();
    },
  },
  mounted() {
    this.fetchDepartures();
  },
};
</script>

<style scoped>
.search-container {
  max-width: 800px; /* Wider for calendar */
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* Three columns for inputs */
  gap: 20px;
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.calendar-group {
  grid-column: span 3; /* Full width for calendar */
  text-align: center;
}

button {
  grid-column: span 3; /* Full width */
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 10px;
  text-align: center;
}

.results {
  margin-top: 20px;
}

.flight-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flight-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.flight-info {
  display: flex;
  flex-direction: column;
}

.route {
  font-weight: bold;
  font-size: 18px;
}

.time {
  color: #555;
}

.price {
  color: #28a745;
  font-weight: bold;
}

.flight-card button {
  padding: 8px 16px;
  background: #28a745;
}
</style>