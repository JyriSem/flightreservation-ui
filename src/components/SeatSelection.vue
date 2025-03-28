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
              {
                occupied: seat.occupied,
                available: !seat.occupied,
                selected: selectedSeats.includes(seat.id),
                recommended: recommendedSeats.includes(seat.id),
              }
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
      recommendedSeats: [],
      ticketCount: 1,
      totalRows: 0,
      seatColumns: [],
    };
  },
  created() {
    this.ticketCount = parseInt(this.$route.query.ticketCount) || 1;
    this.fetchSeats();
  },
  methods: {
    async fetchSeats() {
      const flightId = this.$route.params.flightId;
      try {
        const response = await axios.get(`http://localhost:8080/api/seats/flight/${flightId}`);
        this.seats = response.data;

        // Dynamically set total rows & seat columns
        this.totalRows = Math.max(...this.seats.map(seat => seat.rowNumber), 0);
        this.seatColumns = [...new Set(this.seats.map(seat => seat.columnLetter))].sort();

        this.recommendSeats();
      } catch (error) {
        console.error("Error fetching seats:", error);
      }
    },
    selectSeat(seat) {
      if (seat.occupied) return;

      if (this.selectedSeats.includes(seat.id)) {
        this.selectedSeats = this.selectedSeats.filter(s => s !== seat.id);
      } else if (this.selectedSeats.length < this.ticketCount) {
        this.selectedSeats.push(seat.id);
      }

      // Clear recommendations when manual selection starts
      if (this.selectedSeats.length > 0) {
        this.recommendedSeats = [];
      } else {
        this.recommendSeats();
      }
    },
    confirmSeats() {
      alert(`Seats ${this.selectedSeats.map(this.getSeatLabel).join(", ")} confirmed!`);
    },
    getSeatsForRow(row) {
      return this.seats.filter(seat => seat.rowNumber === row).sort((a, b) => a.columnLetter.localeCompare(b.columnLetter));
    },
    getSeatLabel(seatId) {
      const seat = this.seats.find(s => s.id === seatId);
      return seat ? `${seat.rowNumber}${seat.columnLetter}` : "";
    },
    recommendSeats() {
      this.recommendedSeats = [];

      if (this.ticketCount <= 1 || this.selectedSeats.length > 0) return;

      for (let row = 1; row <= this.totalRows; row++) {
        const rowSeats = this.getSeatsForRow(row).filter(seat => !seat.occupied);

        for (let i = 0; i <= rowSeats.length - this.ticketCount; i++) {
          const group = rowSeats.slice(i, i + this.ticketCount);
          const hasOccupiedBetween = group.some(seat => seat.occupied);

          if (!hasOccupiedBetween) {
            this.recommendedSeats.push(...group.map(seat => seat.id));
          }
        }
      }
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

.recommended {
  background-color: yellow;
}
</style>
