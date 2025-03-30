<template>
  <div class="search-container">
    <h2>Find Your Flight</h2>

    <!--
    Lähtelinna rippmenüü:
    - andmete saadavusel täidetakse väli andmetega / andmete puudumisel on välja kasutamine lukustatud.
    -->
    <div class="search-form">
      <div class="form-group">
        <label>From</label>
        <select v-model="departure" @change="fetchDestinations" :disabled="loading">
          <option value="" disabled>Select departure</option>
          <option v-for="loc in departures" :key="loc" :value="loc">{{ loc }}</option>
        </select>
      </div>

      <!--
      Sihtlinna rippmenüü:
      - andmete saadavusel täidetakse väli andmetega / andmete puudumisel või laadimisel on välja kasutamine lukustatud;
      - kuupäevade värskendamine vastavalt kasutaja tehtud valikule.
      -->
      <div class="form-group">
        <label>To</label>
        <select v-model="destination" :disabled="!departure || loading" @change="fetchAvailableDates">
          <option value="" disabled>Select destination</option>
          <option v-for="loc in destinations" :key="loc" :value="loc">{{ loc }}</option>
        </select>
      </div>

      <!--
      Piletite hulga valimise rippmenüü:
      -->
      <div class="form-group">
        <label>Tickets</label>
        <select v-model="ticketCount" :disabled="loading">
          <option v-for="n in maxTickets" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <!--
      Komponendi @vuepic/vue-datepicker rakendamine:
      - kuupäevaga sidumine;
      - saadaolevate kuupäevade vahemiku piiramine;
      - ainult kuupäevade kuvamine;
      - mitte saadavalolevate kuupäevade keelamine;
      - kalendri kohene kuvamine;
      - kohene valiku rakendamine;
      - keelatud, kui API on andmevahetuses.
      -->
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

      <!--
      Otsingu käivitamine:
      - keelatud, kui kõik väljad pole täidetud või toimub laadimine;
      - API andmevahetuse info kuvamine või andmete kuvamine.
      -->
      <button @click="searchFlights" :disabled="!canSearch || loading">
        {{ loading ? 'Searching...' : 'Search Flights' }}
      </button>
    </div>

    <!--
    Veateate kuvamine, kui tõrge on määratud.
    -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!--
    Tulemuste kuvamine:
    - juhul kui päring saab vastuse;
    - mitme lennu kuvamine, kui kriteeriumid kattuvad;
    - marsruudi kuvamine lähtelinnast sihtlinna;
    - vormindakse kuvamiseks kuupäev ja kellaaeg;
    - alghinna kuvamine vastavalt istekohtade arvule;
    - navigeerimine istekohtade valikusse.
    -->
    <div v-if="flights.length > 0" class="results">
      <h3>Available Flights</h3>
      <div class="flight-list">
        <div v-for="flight in flights" :key="flight.id" class="flight-card">
          <div class="flight-info">
            <span class="route">{{ flight.departure }} → {{ flight.destination }}</span>
            <span class="time">{{ formatDateTime(flight) }}</span>
            <span class="price">From ${{ (Number(flight.price) / flight.totalSeats).toFixed(2) }}</span>
          </div>
          <button @click="selectFlight(flight.id)" :disabled="loading">Select</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

//Importimised:
//- axios HTTP päringute jaoks;
//- komponendi Datepicker registreerimine.
import axios from "axios";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

//Reaktiivsete andmete atribuudid:
//- väljumised, sihtkohad, saadaolevadKuupäevad: massiivid rippmenüüde ja kuupäevade filtreerimiseks;
//- algväärtused ja limiidid.
export default {
  components: {Datepicker},
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

    //Saadavalolevate kuupäevade põhjal määratud valiku vahemik.
    minDate() {
      return this.availableDates.length ? new Date(this.availableDates[0]) : null;
    },
    maxDate() {
      return this.availableDates.length ? new Date(this.availableDates[this.availableDates.length - 1]) : null;
    },

    //365 päeva massiivi loomine, mittesaadavate kuupäevade filtreerimine ja nende keelamine.
    disabledDates() {
      const availableSet = new Set(this.availableDates.map(d => new Date(d).toISOString().split("T")[0]));
      const allDates = [...Array(365)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date.toISOString().split("T")[0];
      });
      return allDates.filter(date => !availableSet.has(date));
    },

    //Kõikide väljade täitmise kontroll.
    canSearch() {
      return this.departure && this.destination && this.date;
    },
  },
  methods: {

    //Lähtelinnade andmete päring / üleandmisvead / laadimine.
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

    //Sihtlinnad vastavalt lähtelinnale / väljade lähtestamine / üleandmisvead / laadimine.
    async fetchDestinations() {
      if (!this.departure) return;
      this.loading = true;
      this.error = null;
      this.destinations = [];
      this.destination = "";
      this.date = null;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/destinations", {
          params: {departure: this.departure},
        });
        this.destinations = response.data;
      } catch (error) {
        this.error = "Failed to load destinations. Please try again.";
        console.error("Error fetching destinations:", error);
      } finally {
        this.loading = false;
      }
    },
    //Marsruudi saadaolevad kuupäevad / kuupäeva lähtestamine / üleandmisvead / laadimine.
    async fetchAvailableDates() {
      if (!this.departure || !this.destination) return;
      this.loading = true;
      this.error = null;
      this.date = null;
      try {
        const response = await axios.get("http://localhost:8080/api/flights/dates", {
          params: {departure: this.departure, destination: this.destination},
        });
        this.availableDates = response.data;
      } catch (error) {
        this.error = "Failed to load available dates. Please try again.";
        console.error("Error fetching dates:", error);
      } finally {
        this.loading = false;
      }
    },

    //Lendude osting valitud kriteeriumide alusel / värskendamine / üleandmisvead / laadimine.
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

    //Navigeerimine istekoha valikusse "flightId" alusel, kaasates parameeteri piletite hulk "ticketCount".
    selectFlight(flightId) {
      this.$router.push({path: `/seats/${flightId}`, query: {ticketCount: this.ticketCount}});
    },

    //Väljumiskuupäeva ja kellaaja vormindamine.
    formatDateTime(flight) {
      const dateTimeString = `${flight.departureDate}T${flight.departureTime}`;
      return new Date(dateTimeString).toLocaleString();
    },
  },

  //Kutsub fetchDepartures, kui komponent ühendatakse algandmete laadimiseks.
  mounted() {
    this.fetchDepartures();
  },
};
</script>

<!--
Stiil
-->
<style scoped>
.search-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
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
  font-size: 14px;
}

.calendar-group {
  grid-column: span 3;
  text-align: center;
}

.calendar-group h3 {
  margin: 10px 0;
}

button {
  grid-column: span 3;
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
  padding: 10px;
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
  font-size: 16px;
}

.time {
  color: #555;
  font-size: 14px;
}

.price {
  color: #28a745;
  font-weight: bold;
  font-size: 14px;
}

.flight-card button {
  padding: 6px 12px;
  background: #28a745;
}

@media (max-width: 600px) {
  .search-container {
    max-width: 100%;
    margin: 10px;
    padding: 15px;
  }

  .search-form {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .calendar-group {
    grid-column: span 1;
  }

  button {
    grid-column: span 1;
    padding: 8px;
    font-size: 14px;
  }

  .flight-card {
    flex-direction: column;
    align-items: stretch;
    padding: 8px;
  }

  .flight-card button {
    margin-top: 10px;
    width: 100%;
  }
}
</style>
