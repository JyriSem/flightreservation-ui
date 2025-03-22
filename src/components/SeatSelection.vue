<template>
  <div class="seat-container">
    <h2>Seat Selection</h2>
    <p>Pick {{ ticketCount }} seat(s)</p>

    <div v-if="seats.length > 0">
      <div class="seat-map">
        <div v-for="row in totalRows" :key="row" class="seat-row">
          <div
              v-for="seat in getSeatsForRow(row)"
              :key="seat.id"
              :class="[
                'seat',
                { occupied: seat.occupied, available: !seat.occupied, selected: selectedSeats.includes(seat.id), disabled: selectedSeats.length >= ticketCount && !selectedSeats.includes(seat.id) }
              ]"
              @click="selectSeat(seat)"
          >
            {{ seat.columnLetter }}
          </div>
        </div>
      </div>

      <div class="selected-seats">
        <h3>Selected Seats:</h3>
        <p v-if="selectedSeats.length === 0">None</p>
        <p v-else>{{ selectedSeats.map(getSeatLabel).join(", ") }}</p>
      </div>

      <button v-if="selectedSeats.length === ticketCount" @click="confirmSeats">Confirm Selection</button>
    </div>

    <p v-else>No available seats.</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      seats: [],
      selectedSeats: [],
      ticketCount: 1,
      totalRows: 22,
      seatColumns: ["A", "B", "C", "D", "E", "F"],
    };
  },
  created() {
    this.fetchSeats();
    this.ticketCount = parseInt(this.$route.query.ticketCount) || 1;
  },
  methods: {
    async fetchSeats() {
      const flightId = this.$route.params.flightId;
      try {
        const response = await axios.get(`http://localhost:8080/api/seats/flight/${flightId}`);
        this.seats = response.data;
      } catch (error) {
        console.error("Error fetching seats:", error);
      }
    },
    selectSeat(seat) {
      if (seat.occupied || (this.selectedSeats.length >= this.ticketCount && !this.selectedSeats.includes(seat.id))) return;

      if (this.selectedSeats.includes(seat.id)) {
        this.selectedSeats = this.selectedSeats.filter(s => s !== seat.id);
      } else {
        this.selectedSeats.push(seat.id);
      }
    },
    confirmSeats() {
      alert(`Seats ${this.selectedSeats.map(this.getSeatLabel).join(", ")} confirmed!`);
    },
    getSeatsForRow(row) {
      return this.seats.filter(seat => seat.rowNumber === row);
    },
    getSeatLabel(seatId) {
      const seat = this.seats.find(s => s.id === seatId);
      return seat ? `${seat.rowNumber}${seat.columnLetter}` : "";
    }
  }
};
</script>

<style scoped>
.seat-container {
  text-align: center;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.seat-row {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.seat {
  width: 30px;
  height: 30px;
  border-radius: 5px;
  text-align: center;
  line-height: 30px;
  cursor: pointer;
  border: 1px solid black;
}

.occupied {
  background-color: gray;
  cursor: not-allowed;
}

.available {
  background-color: green;
}

.selected {
  background-color: blue;
  color: white;
}

.disabled {
  background-color: lightgray;
  cursor: not-allowed;
}

.selected-seats {
  margin-top: 15px;
}
</style>
